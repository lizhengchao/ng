/**
 * Created by jt on 2014/12/18.
 * 操作员帮助
 */
Ext.define('MyApp.controller.work.appflow.OperatorController', {
    requires: [ 'MyApp.store.work.pub.OperatorPubStore'],
    extend: 'Ext.app.Controller',
    config: {
        views: ['work.appflow.OperatorSelectView'],
        stores: [ 'work.appflow.NodeUserStore', 'work.appflow.SysUserStore'],
        refs: {
            appFlowDetailView: 'appFlowDetailView',
            taskPanelView: 'taskPanelView',
            operatorSelectView: 'operatorSelectView',
            operatorSelectViewBackBtn: 'operatorSelectView .button[name=operatorSelectViewBackBtn]',
            operatorSelectViewOkBtn: 'operatorSelectView .button[name=OperatorSelectViewOkBtn]',
            operatorSelectViewList: 'operatorSelectView .list[name=OperatorSelectViewList]',
            operatorPickContainer: 'operatorSelectView .container[name=operatorPickContainer]',
            operatorSelectSysUserBtn: 'operatorSelectView .button[name=operatorSelectSysUserBtn]',
            operatorSelectNodeUserBtn: 'operatorSelectView .button[name=operatorSelectNodeUserBtn]'
        },
        control: {
            operatorSelectView: {
                initialize: 'operatorSelectView_init',
                destroy: 'operatorSelectView_onDestroy'
            },
            operatorSelectSysUserBtn: {
                tap: 'operatorSelectStoreChange'
            },
            operatorSelectNodeUserBtn: {
                tap: 'operatorSelectStoreChange'
            },
            operatorSelectViewList: {
                itemtap: 'OperatorSelectViewList_onItemTap'
            },
            operatorSelectViewOkBtn: {
                tap: 'operatorSelectViewOkBtn_onTap'
            },
            operatorSelectViewBackBtn: {
                tap: 'operatorSelectViewBackBtn_onTap'
            }
        }
    },
    /*
     * 功能描述：操作员帮助初始化
     */
    operatorSelectView_init: function (view) {
        var me = this,
            userList = me.getOperatorSelectViewList(),
            operatorPickContainer = me.getOperatorPickContainer(),
            sysUserStore = Ext.getStore('SysUserStore'),
            nodeUserStore = Ext.getStore('NodeUserStore');

        operatorPickContainer.setHtml('');
        nodeUserStore.removeAll();

        sysUserStore.addListener('load', function (store, records) {
            me.initSelected(store, records);
        });
        nodeUserStore.addListener('load', function (store, records) {
            if (records.length == 0) { // 流程节点人员为空
                me.operatorStoreChange('operatorSelectSysUserBtn');
                view.query('.toolbar[name=opertatorSelectViewBottombar]')[0].hide();
            } else {
                me.initSelected(store, records);
            }
        });
        nodeUserStore.load();
        userList.setStore(nodeUserStore);
    },

    /*
     * 功能描述： 获取选择的节点人员编码串
     */
    getSelectedPerson: function () {
        var me = this,
            nodeid = me.nodeid,
            viewContainer = me.getTaskPanelView(),
            operatorPickContainer = me.getOperatorPickContainer(),
            html = operatorPickContainer.getHtml(),
            personArray = viewContainer.nodePerson[nodeid],
            tmpArray = [];
        if (!me.selectedPerson) {
            me.nodePerson = Ext.clone(personArray);
            if (personArray) {
                Ext.each(personArray, function (item) {
                    tmpArray.push(item.usercode);
                    html += "&nbsp;" + item.username + "&nbsp;";
                    me.changeOkBtnNum(true);
                });
            }
            operatorPickContainer.setHtml(html);
            me.selectedPerson = "," + tmpArray.join(",") + ",";
        }
        return  me.selectedPerson;
    },

    /*
     * 功能描述： 更新选中人员集合
     */
    updateNodePerson: function (add, person) {
        var me = this,
            tmpPerson;
        if (add) {
            me.selectedPerson += person.usercode + ",";
            me.nodePerson.push(person);
        } else {
            me.selectedPerson = me.selectedPerson.replace("," + person.usercode + ",", ",");
            Ext.each(me.nodePerson, function (item) {
                if (item.usercode == person.usercode) {
                    tmpPerson = item;
                    return false;
                }
            });
            if (tmpPerson) {
                Ext.Array.remove(me.nodePerson, tmpPerson);
            }
        }
    },

    /*
     * 更新人员记录的初始选中状态
     */
    initSelected: function (store, records) {
        var me = this,
            selectedPerson = me.getSelectedPerson();
        if (selectedPerson.length > 2) {
            Ext.each(records, function (record) {
                if (selectedPerson.indexOf("," + record.get('usercode') + ",") > -1) {
                    record.set('checked', '1');
                }
            });
        }
    },

    /*节点选操作员界面切换store*/
    operatorSelectStoreChange: function (btn) {
        var me = this,
            sysBtn = me.getOperatorSelectSysUserBtn(),
            nodeBtn = me.getOperatorSelectNodeUserBtn();
        if (btn.getUi() == "normal") { // 重复点击不需要重新加载
            return;
        }
        btn.setUi('normal');
        me.operatorStoreChange(btn.config.name);
        if (btn.config.name == "operatorSelectSysUserBtn") {
            nodeBtn.setUi('action-white');
        } else {
            sysBtn.setUi('action-white');
        }
    },

    /*节点选操作员界面切换store*/
    operatorStoreChange: function (btnname) {
        var me = this,
            userStore = Ext.getStore('SysUserStore'),
            userList = me.getOperatorSelectViewList(),
            searchCmp = userList.getParent().query('appFlowSearchField')[0];
        if (btnname == 'operatorSelectSysUserBtn') {
            userStore.getProxy().setExtraParams({'filter': ""});
//            userStore.getProxy().setUrl(GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get');
            userStore.getProxy().setUrl(WeChat_GLOBAL_CONFIG.weChatServeAdr);
            userStore.setParams({
                requestType: 'get',
                requestAds: GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get',
                method: 'GetAllUser'
            });
            userStore.removeAll();
            userStore.loadPage(1);
            searchCmp.setSearchStore('SysUserStore');
        }
        else {
            userStore = Ext.getStore('NodeUserStore');
            searchCmp.setSearchStore('NodeUserStore');
        }
        userList.setStore(userStore);
    },

    /*
     * 功能描述：销毁人员选择界面
     */
    operatorSelectView_onDestroy: function () {
        var store = Ext.getStore('NodeUserStore'),
            sysStore = Ext.getStore('SysUserStore');
        if (store) {
            store.clearListeners();
            store.clearFilter();
        }
        if (sysStore) {
            sysStore.clearListeners();
            sysStore.clearFilter();
        }
        this.selectedPerson = null;
    },

    /*节点选人*/
    OperatorSelectViewList_onItemTap: function (list, index, target, record, e, eOpts) {
        var me = this,
            status = record.get('checked'),
            operatorPickContainer = me.getOperatorPickContainer(),
            html = operatorPickContainer.getHtml(),
            add = status == '0';
        record.set('checked', add ? '1' : '0');
        if (add) {
            html += "&nbsp;" + record.data.username + "&nbsp;";
        }
        else {
            html = html.replace("&nbsp;" + record.data.username + "&nbsp;", "");
        }
        operatorPickContainer.setHtml(html);
        me.changeOkBtnNum(add);
        me.updateNodePerson(add, record.data);
    },

    /*确定按钮显示数量*/
    changeOkBtnNum: function (isadd) {
        var me = this,
            btn = me.getOperatorSelectViewOkBtn(),
            num = Number(btn.getBadgeText());
        btn.setBadgeText(isadd ? (num + 1) : (num - 1));
    },

    /*操作员选人确定*/
    operatorSelectViewOkBtn_onTap: function (btn, e, eOpts) {
        var me = this;
        if (me.nodePerson.length == 0) {
            NG.alert('未选择任何操作员', 1500);
            return;
        }
        me.getApplication().getController("work.appflow.AppFlowDetailController").doSelectedPersons(me.nodeid, me.nodePerson);
        me.operatorSelectViewBackBtn_onTap();
    },

    /*选操作员界面返回*/
    operatorSelectViewBackBtn_onTap: function (btn, e, eOpts) {
        this.getApplication().getController("work.appflow.AppFlowController").backwardView(this.getOperatorSelectView(), this.getAppFlowDetailView());
    }
});