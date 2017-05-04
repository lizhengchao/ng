/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-4-1
 * Time: 下午1:57
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.controller.work.appflow.RejectController', {
    extend: 'Ext.app.Controller',
    config: {
        views: ['work.appflow.RejectPanelView', 'work.appflow.AppFlowDetailView', 'work.appflow.RejectOperSelectView', 'work.appflow.AppFlowListView'],
        stores: ['work.appflow.RejectNodeStore', 'work.appflow.NodeUserStore', 'work.appflow.PickStore', 'work.appflow.SysUserStore'],
        models: [],
        refs: {
            appFlowListView: 'appFlowListView',
            appFlowDetailView: 'appFlowDetailView',
            playBtn: 'taskPanelView label[name=play]',// 播放录音按钮
            /*驳回界面*/
            rejectPanelView: 'rejectPanelView',
            rejectPanelViewBackBtn: 'rejectPanelView .button[name=rejectPanelViewBackBtn]',
            rejectNodeTitleList: 'rejectPanelView .dataview[name=rejectNodeTitleList]',
            rejectNodeList: 'rejectPanelView .taptpl[name=rejectNodeList]',
            rejectDealListContainer: 'rejectPanelView .container[name=rejectDealListContainer]',
            rejectPanelViewConfirmBtn: 'rejectPanelView .button[name=rejectPanelViewConfirmBtn]',

            /*操作员帮助*/
            rejectOperSelectView: 'rejectOperSelectView',
            rejectOperSelectViewBackBtn: 'rejectOperSelectView .button[name=rejectOperSelectViewBackBtn]',
            rejectOperSelectViewOkBtn: 'rejectOperSelectView .button[name=rejectOperSelectViewOkBtn]',
            rejectOperSelectViewList: 'rejectOperSelectView .list[name=rejectOperSelectViewList]',
            rejectOperPickList: 'rejectOperSelectView .container[name=rejectOperPickList]',
            rejectOperSelectNodeUserBtn: 'rejectOperSelectView .button[name=rejectOperSelectNodeUserBtn]',
            rejectOperSelectSysUserBtn: 'rejectOperSelectView .button[name=rejectOperSelectSysUserBtn]'
        },
        control: {
            rejectOperSelectView: {
                initialize:'rejectOperSelectView_initialize',
                destroy: 'rejectOperSelectView_onDestroy'
            },
            rejectPanelViewConfirmBtn: {
                tap: 'rejectPanelViewConfirmBtn_onTap'
            },
            rejectOperSelectViewOkBtn: {
                tap: 'rejectOperSelectViewOkBtn_onTap'
            },
            rejectOperSelectViewList: {
                itemtap: 'rejectOperSelectViewList_onItemTap'
            },
            rejectOperSelectNodeUserBtn: {
                tap: 'operatorSelectStoreChange'
            },
            rejectOperSelectSysUserBtn: {
                tap: 'operatorSelectStoreChange'
            },
            rejectOperSelectViewBackBtn: {
                tap: 'rejectOperSelectViewBackBtn_onTap'
            },
            rejectPanelViewBackBtn: {
                tap: 'rejectPanelViewBackBtn_onTap'
            },
            rejectPanelView: {
                initialize: 'rejectPanelView_init'
            },
            rejectNodeList: {
                itemTap: 'rejectNodeList_onitemTap'
            }
        }
    },

    rejectOperSelectView_initialize:function() {
        var me = this,
            rejectOperPickList = me.getRejectOperPickList(),
            sysUserStore = Ext.getStore('SysUserStore'),
            nodeUserStore = Ext.getStore('NodeUserStore');

        rejectOperPickList.setHtml('');
        nodeUserStore.removeAll();

        sysUserStore.addListener('load', function (store, records) {
            me.initSelected(store, records);
        });

        var func = function (store, records) {
            if (records.length == 0) { // 流程节点人员为空
                me.operatorStoreChange('rejectOperSelectSysUserBtn');
                me.getRejectOperSelectView().query('.toolbar[name=rejectOperSelectViewBottombar]')[0].hide();
            } else {
                me.initSelected(store, records);
            }
        };
        nodeUserStore.addListener('load', func);
        nodeUserStore.load();

        me.getRejectOperSelectViewList().setStore(nodeUserStore);
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

    /*
     * 功能描述： 获取选择的节点人员编码串
     */
    getSelectedPerson: function () {
        var me = this,
            viewContainer = me.getRejectPanelView(),
            operatorPickContainer = me.getRejectOperPickList(),
            html = operatorPickContainer.getHtml(),
            personArray = viewContainer.personArray,
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

    /*确定按钮显示数量*/
    changeOkBtnNum: function (isadd) {
        var me = this,
            btn = me.getRejectOperSelectViewOkBtn(),
            num = Number(btn.getBadgeText());
        btn.setBadgeText(isadd ? (num + 1) : (num - 1));
    },

    /*驳回界面初始化*/
    rejectPanelView_init: function (panel) {
        var me = this,
            nodeList = me.getRejectNodeList(),
            rollBackNodes = panel.config.rollBackInfo.rollBackNodes,
            checked = "btn-unchecked";
        Ext.each(rollBackNodes, function (item) {
            item.checked = checked;
        });
        nodeList.setData(rollBackNodes);
    },

    rejectOperSelectView_onDestroy: function () {
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

    /*驳回确定*/
    rejectPanelViewConfirmBtn_onTap: function (btn) {
        var me = this,
            rejectPanelView = me.getRejectPanelView(),
            dealArray = [],
            rollbacknode;
        if (!rejectPanelView.lastCheckedNode) {
            NG.alert('未指定驳回节点', 1500);
            return;
        } else {
            rollbacknode = rejectPanelView.lastCheckedNode.nodeid
        }
        if (rollbacknode) {
            //判断办理人是否为空
            if (rejectPanelView.lastCheckedNode.designate_actor == "1") {
                if (rejectPanelView.personArray.length == 0) {
                    NG.alert('未指定办理人', 1500);
                    return;
                } else {
                    Ext.each(rejectPanelView.personArray, function (person) {
                        dealArray.push({nodeid: person.nodeid, elecode: person.elecode, usercode: person.usercode});
                    });
                }
            }
        }
        var userInfo = Ext.getStore('LocalStore').getById('userInfo'),
            productAdr = userInfo.get('productAdr');
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: '正在驳回'
        });
        var appFlowInfo = rejectPanelView.config.appFlowInfo,
            uploadParms = "method=SaveAudioRemark&flowType=" + appFlowInfo.flowtype + "&piid=" + appFlowInfo.piid + "&nodeid=" + appFlowInfo.nodeid + "&taskinstid=" + appFlowInfo.taskinstid;
        me.getApplication().getController("work.appflow.AppFlowDetailController").uploadAudio(function () {
            var parms = {
                method: 'RollBack',
                flowtype: rejectPanelView.config.appFlowInfo.flowtype,
                piid: rejectPanelView.config.appFlowInfo.piid,
                nodeid: rejectPanelView.config.appFlowInfo.nodeid,
                taskinstid: rejectPanelView.config.appFlowInfo.taskinstid,
                logid: rejectPanelView.config.logid,
                remark: rejectPanelView.config.remark,
                signcode: rejectPanelView.config.signcode,
                rollbacknode: rollbacknode,
                bizdata: rejectPanelView.config.bizData,
                audioremark: me.getPlayBtn().audioRemark,
                nextnodeactors: Ext.JSON.encode(dealArray)
            };
            Ext.Ajax.request({
                url: productAdr + '/rest/api/workflow/TaskInstance/Get',
                method: 'POST',
                params: parms,
                success: function (response, opts) {
                    Ext.Viewport.setMasked(false);
                    var resp = Ext.JSON.decode(response.responseText);
                    if (resp.status == 'succeed') {
                        Ext.Viewport.remove(me.getRejectPanelView(), true);
                        Ext.Viewport.remove(me.getRejectOperSelectView(), true);
                        Ext.Viewport.remove(me.getAppFlowDetailView(), true);
                        Ext.Viewport.setActiveItem(me.getAppFlowListView());
                      //  NG.refreshMessageToSession(me, NG.MsgType.WORKFLOW, null, true);
                    }
                    else {
                        Ext.Viewport.setMasked(false);
                        NG.alert(resp.errmsg, 1500);
                    }
                },
                failure: function (response, opts) {
                    NG.alert(GLOBAL_CONFIG.NetWorkError, 1500);
                }
            });
        }, uploadParms);
    },

    /*点击确定*/
    rejectOperSelectViewOkBtn_onTap: function (btn, e, eOpts) {
        var me = this;
        if (me.nodePerson.length == 0) {
            NG.alert('未选择任何操作员', 1500);
            return;
        }
        me.doSelectedPersons();
        Ext.Viewport.remove(me.getRejectOperSelectView(), true);
        Ext.Viewport.setActiveItem(me.getRejectPanelView());
    },

    /*
     * 功能描述：选择节点人员后返回
     */
    doSelectedPersons: function() {
        var me = this,
            nodeid= me.nodeid,
            persons =  me.nodePerson,
            dealContainer = me.getRejectDealListContainer(),
            viewContainer = me.getRejectPanelView(),
            tmpCmp = dealContainer.down('.taptpl[name=taptpl-' + nodeid + ']'),
            data = [];
        if(persons && persons.length > 0 ) {
            viewContainer.personArray = [];
            Ext.each(persons, function (person) {
                var newItem = { nodeid: nodeid, elecode: person.elecode, usercode: person.usercode, username: person.username};
                viewContainer.personArray.push(newItem);
                person.person = newItem;
                person.nodeid = nodeid;
                person.checked = "btn-checked";
                person.beforeLine = 0;
                data.push(person);
            });
            tmpCmp.setData(data);
        }
    },

    /*选择人员*/
    rejectOperSelectViewList_onItemTap: function (list, index, target, record, e) {
        var me = this,
            status = record.get('checked'),
            operatorPickContainer = me.getRejectOperPickList(),
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

    /*切换帮助数据*/
    operatorSelectStoreChange: function (btn) {
        var me = this,
            sysBtn = me.getRejectOperSelectSysUserBtn(),
            nodeBtn = me.getRejectOperSelectNodeUserBtn();
        if (btn.getUi() == "normal") { // 重复点击不需要重新加载
            return;
        }
        btn.setUi('normal');
        me.operatorStoreChange(btn.config.name);
        if (btn.config.name == "rejectOperSelectSysUserBtn") {
            nodeBtn.setUi('action-white');
        } else {
            sysBtn.setUi('action-white');
        }
    },
    operatorStoreChange: function (btnname) {
        var me = this;
        var cstore;
        var view = me.getRejectOperSelectViewList();
        var searchf = view.getParent().query('appFlowSearchField')[0];
        if (btnname == 'rejectOperSelectSysUserBtn') {
            cstore = Ext.getStore('SysUserStore');
            cstore.getProxy().setExtraParams({'filter': ""});
//            cstore.getProxy().setUrl(GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get');
            cstore.getProxy().setUrl(WeChat_GLOBAL_CONFIG.weChatServeAdr);
            cstore.setParams({
                requestType: 'get',
                requestAds: GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get',
                method: 'GetAllUser'
            });
            cstore.removeAll();
            cstore.loadPage(1);
            searchf.setSearchStore('SysUserStore');
        }
        else {
            cstore = Ext.getStore('NodeUserStore');
            searchf.setSearchStore('NodeUserStore');
        }
        view.setStore(cstore);
    },
    /*选人界面返回*/
    rejectOperSelectViewBackBtn_onTap: function () {
        var me = this;
        Ext.Viewport.remove(me.getRejectOperSelectView(), true);
        Ext.Viewport.setActiveItem(me.getRejectPanelView());
    },
    /*驳回界面返回*/
    rejectPanelViewBackBtn_onTap: function () {
        var me = this;
        Ext.Viewport.remove(me.getRejectPanelView(), true);
        Ext.Viewport.setActiveItem(me.getAppFlowDetailView());
    },

    /*选择回退节点*/
    rejectNodeList_onitemTap: function (list, record, target) {
        var me = this,
            currChecked = record.checked == "btn-checked",
            btn = target.querySelector("div[btntype=radiobtn]"),
            viewContainer = me.getRejectPanelView();
        if (btn) {
            if (currChecked) {
                btn.className = "btn-unchecked";
                record.checked = "btn-unchecked";
                viewContainer.lastCheckedNode = null;
                viewContainer.lastCheckedNodeBtn = null;
            } else {
                if (viewContainer.lastCheckedNode) {
                    viewContainer.lastCheckedNodeBtn.className = "btn-unchecked";
                    viewContainer.lastCheckedNode.checked = "btn-unchecked";
                }
                btn.className = "btn-checked";
                record.checked = "btn-checked";
                viewContainer.lastCheckedNodeBtn = btn;
                viewContainer.lastCheckedNode = record;
            }
            me.updateDealPanel(record, !currChecked);
        }
    },

    /*更新办理人数据*/
    updateDealPanel: function (record, isAdd) {
        var me = this,
            itemTpl =  '<div btntype="radiobtn" class="{checked}" style="float: left;"></div><div class="nowrap font15" style="margin-left:6px; line-height:16px;float:left;">{username}</div>',
            itemStyle = 'position:relative; width: 65px; padding: 4px 0px 8px 0px; float:left; margin-right: 10px; ',
            viewContainer = me.getRejectPanelView(),
            currentDesignateActor = [],
            dealContainer = me.getRejectDealListContainer(),
            nextNodeDesignateActor = me.getRejectPanelView().config.rollBackInfo.nextNodeDesignateActor,
            flowtype = me.getRejectPanelView().config.appFlowInfo.flowtype;
        viewContainer.personArray = [];
        if (isAdd && record.designate_actor == 1) {
            Ext.each(nextNodeDesignateActor, function (ite) {
                var newItem = Ext.clone(ite);
                if (newItem.nodeid == record.nodeid) {
                    newItem.checked = "btn-unchecked";
                    newItem.beforeLine = 0;
                    currentDesignateActor.push(newItem);
                }
            });
            dealContainer.removeAll(true, true);
            dealContainer.add(Ext.create('Ext.Container', {
                name: 'oneDealContainer-' + record.nodeid,
                style: {
                    'font-size': "15px",
                    'padding-bottom': '4px'
                },
                layout: { type: 'vbox' },
                items: [
                    {
                        xtype: 'label',
                        style: 'padding:12px 0px 8px 12px; color:#AAA9A9;',
                        html: record.nodetext
                    },
                    {
                        layout: {
                            type: 'hbox',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'taptpl',
                                flex: 1,
                                name: 'taptpl-' + record.nodeid,
                                nodeid: record.nodeid,
                                style: 'position:relative; background-color: #FFFFFF; margin-left:12px;',
                                itemStyle: itemStyle,
                                itemTpl: itemTpl,
                                data: currentDesignateActor,
                                listeners: {
                                    itemTap: function () {
                                        me.dealPerson_tap.apply(me, arguments);
                                    }
                                }
                            },
                            {
                                xtype: 'button',
                                nodeid: record.nodeid,
                                piid: me.getRejectPanelView().config.appFlowInfo.piid,
                                name: 'button-' + record.nodeid,
                                style: {
                                    borderColor: '#DCDCDC',
                                    fontSize: '15px'
                                },
                                margin: '-8 10 0 0',
                                height: 28,
                                ui: 'plain',
                                text: '更多',
                                listeners: {
                                    tap: function (btn, e, eOpts) {
//                                        var parms = {
//                                            logid: me.getRejectPanelView().config.logid,
//                                            method: 'GetNodeUsers',
//                                            flowType: flowtype,
//                                            piid: btn.config.piid,
//                                            nodeid: btn.config.nodeid
//                                        };
//                                        var cstore = Ext.getStore('NodeUserStore');
//                                        cstore.getProxy().setUrl(GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get');
//                                        cstore.setParams(parms);
                                        var cstore = Ext.getStore('NodeUserStore');
                                        cstore.getProxy().setUrl(WeChat_GLOBAL_CONFIG.weChatServeAdr);
                                        cstore.setParams({
                                            requestType: 'get',
                                            requestAds: GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get',
                                            logid: me.getRejectPanelView().config.logid,
                                            method: 'GetNodeUsers',
                                            flowType: flowtype,
                                            piid: btn.config.piid,
                                            nodeid: btn.config.nodeid
                                        });

                                        me.nodeid = btn.config.nodeid;
                                        var rejectOperSelectView = me.getRejectOperSelectView();
                                        if (!rejectOperSelectView) {
                                            rejectOperSelectView = Ext.create('MyApp.view.work.appflow.RejectOperSelectView');
                                            rejectOperSelectView.setNodeid(btn.config.nodeid);
                                            if (record.designate_anyactor == 0) {
                                                rejectOperSelectView.query('.toolbar[name=rejectOperSelectViewBottombar]')[0].hide();
                                            }
                                        }
                                        Ext.Viewport.add(rejectOperSelectView);
                                        Ext.Viewport.setActiveItem(rejectOperSelectView);
                                    }
                                }
                            }
                        ]
                    }
                ]
            }));
        } else {
            dealContainer.removeAll(true, true);
        }
    },

    /*
     *功能描述：节点人员点击事件
     */
    dealPerson_tap: function(cmp, record, target, index, e) {
        var me = this,
            person = {},
            btn = target.querySelector("div[btntype=radiobtn]"),
            viewContainer = me.getRejectPanelView();
        if (btn) {
            person = { nodeid: record.nodeid, elecode: record.elecode, usercode: record.usercode, username: record.username};
            record.checked = record.checked == "btn-checked" ? "btn-unchecked" : "btn-checked";
            btn.className = record.checked;
            if (record.checked == "btn-checked") {
                viewContainer.personArray.push(person);
                record.person = person;
            } else {
                if (record.person) {
                    Ext.Array.remove(viewContainer.personArray, record.person);
                    delete record.person;
                }
            }
        }
    }
});
