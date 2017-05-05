/**
 * Created by ibm on 2015/5/6.
 */
Ext.define('MyApp.controller.work.pub.OperatorController', {
    extend: 'Ext.app.Controller',
    config: {
        views: [ 'work.pub.OperatorView'],
        stores: [ 'work.pub.OperatorPubStore'],
        refs: {
            operatorView: 'operatorView',
            titleBar: 'operatorView titlebar',
            backBtn: 'operatorView titlebar button[name=backBtn]',
            searchField: 'operatorView searchfield',
            operatorList: 'operatorView list',
            okBtn: 'operatorView button[name=okBtn]'
        },
        control: {
            operatorView: {
                initialize: 'operator_Init',
                destroy: 'operator_Destroy'
            },
            backBtn: {
                tap: 'back_Tap'
            },
            searchField: {
                keyup: 'search_KeyUp',
                clearicontap: 'search_ClearTap'
            },
            operatorList: {
                itemtap: 'list_ItemTap'
            },
            okBtn: {
                tap: 'okBtn_Tap'
            }
        }
    },

    /*
     * 功能描述：视图初始化
     */
    operator_Init: function (view) {
        var multiItemTpl = ['<tpl if="checked==0"><img  btntype="radiobtn"  style="width:28px;height: 28px;float: left" src="resources/images/btn_check_off_normal.png"/></tpl>',
                '<tpl if="checked==1"><img  btntype="radiobtn" style="width:28px;height: 28px;float: left" src="resources/images/btn_check_on_normal.png"/></tpl>',
                '<div class="font15 nowrap" style="margin-left: 12px; max-width:200px; float: left;text-align: center;height: 28px;line-height: 28px;">{username}{name}({usercode}{code})</div>'].join(''),
            okBtn = this.getOkBtn(),
            list = this.getOperatorList(),
            store = list.getStore(),
            titleBar = this.getTitleBar();

        this.isEmp = view.getIsEmp();
        if(this.isEmp) {
            var sqlstr = "select cno code,cname name from hr_epm_main where empstatus in(select ccode from hr_epm_status_property where isstatus in('01','02'))";
            store.getProxy().setUrl(GLOBAL_CONFIG.weChatServeAdr);
            store.setParams({
                requestType: 'get',
                requestAds: GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get',
                method: 'GetBizFiledHelpData',
                sqlstr: sqlstr,
                logid: NG.getProductLoginInfo().loginId
            });
        } else{
            store.getProxy().setUrl(GLOBAL_CONFIG.weChatServeAdr);
            store.setParams({
                requestType: 'get',
                requestAds: GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get',
                method: 'GetAllUser'
            });
        }

        titleBar.setTitle(view.getTitle());
        Ext.Viewport.add(view);
        Ext.Viewport.setActiveItem(view);

        this.nodePerson = [];

        if (view.getMulti()) {
            list.setItemTpl(multiItemTpl);
            okBtn.setHidden(false);
        }

        if (list.isPainted()) {
            store.loadPage(1);
        } else {
            list.on("painted", function () {
                store.loadPage(1);
            }, me, {single: true}); //只执行一次
        }
    },

    /*
     * 功能描述：查询
     */
    search_KeyUp: function (field) {
        var list = this.getOperatorList(),
            store = list.getStore(),
            value = field.getValue().trim();
        if (field.timeIT) {
            clearTimeout(field.timeIT);
            field.timeIT = null;
        }
        field.timeIT = setTimeout(function () {
            field.timeIT = null;
            if (store.getProxy().getUrl()) {
                store.getProxy().setExtraParams({'filter': value});
                store.removeAll();
                Ext.Ajax.abort();
                store.loadPage(1);
            }
        }, 500);
    },

    /*
     * 功能描述：清空查询
     */
    search_ClearTap: function (field) {
        var list = this.getOperatorList(),
            store = list.getStore();
        store.removeAll();
        store.getProxy().setExtraParams({});
        store.loadPage(1);
    },

    /*
     * 功能描述：选择list的某一项
     */
    list_ItemTap: function (list, index, target, record, e, eOpts) {
        var me = this, checked,
            multi = this.getOperatorView().getMulti();
        if (multi) {
            checked = record.get('checked') == '0';
            record.set('checked', checked ? '1' : '0');
            me.updateNodePerson(checked, record.data);
        } else {
            var operatorView = this.getOperatorView(),
                callback = operatorView.getCallback();
            this.back_Tap();
            callback(record);
        }
    },

    /*
     * 功能描述： 更新选中人员集合
     */
    updateNodePerson: function (add, person) {
        var me = this,
            tmpPerson;
        if (add) {
            me.nodePerson.push(this.isEmp ? {usercode: person.code, username: person.name} : {usercode: person.usercode, username: person.username});
        } else {
            Ext.each(me.nodePerson, function (item) {
                if (item.usercode == person.usercode || item.usercode == person.code) {
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
     * 功能描述：多选确定
     */
    okBtn_Tap: function() {
        var operatorView = this.getOperatorView(),
            callback = operatorView.getCallback(),
            tmp = this.nodePerson;
        if (tmp.length == 0) {
            NG.alert('未选择任何项', 1500);
            return;
        }
        this.back_Tap();
        callback(tmp);
    },

    /*
     * 功能描述：返回
     */
    back_Tap: function () {
        NG.application.onBackKeyDown();
        this.nodePerson = null;
    },

    /*
     * 功能描述：销毁
     */
    operator_Destroy: function(){
        var store = Ext.getStore("OperatorPubStore");
        if (store) {
            store.removeAll();
            store.getProxy().setExtraParams({});
        }
    }
});