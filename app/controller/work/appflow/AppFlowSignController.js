/*
 * 转签
 */
Ext.define('MyApp.controller.work.appflow.AppFlowSignController', {
    extend: 'Ext.app.Controller',
    config: {
        views: [ 'work.appflow.ChangeUserView'],
        stores: ['work.appflow.RecentListStore', 'work.appflow.SysUserStore'],
        refs: {
            appFlowListView: 'appFlowListView',
            appFlowDetailView: 'appFlowDetailView',
            commentsText: 'taskPanelView textareafield[name=commentsText]',
            signImage: 'taskPanelView .image[name=signImage]',
            playBtn: 'taskPanelView label[name=play]',// 播放录音按钮

            /*转签人员帮助*/
            changeUserView: 'changeUserView',
            changeUserViewBackBtn: 'changeUserView .button[name=changeUserViewBackBtn]',
            changeUserViewConfirmBtn: 'changeUserView .button[name=changeUserViewConfirmBtn]',
            changeUserViewList: 'changeUserView .list[name=changeUserViewList]',
            changeUserViewLastedUserBtn: 'changeUserView .button[name=changeUserViewLastedUserBtn]',
            changeUserViewSysUserBtn: 'changeUserView .button[name=changeUserViewSysUserBtn]'
        },
        control: {
            /*  转签人员帮助 */
            changeUserView: {
                initialize: 'changeUserView_init',
                destroy: 'changeUserView_onDestroy'
            },
            changeUserViewSysUserBtn: {
                tap: 'changeUserViewChangeStore'
            },
            changeUserViewLastedUserBtn: {
                tap: 'changeUserViewChangeStore'
            },
            changeUserViewList: {
                itemtap: 'changeUserViewList_onItemTap'
            },
            changeUserViewBackBtn: {
                tap: 'changeUserViewBackBtn_onTap'
            },
            changeUserViewConfirmBtn: {
                tap: 'changeUserViewConfirmBtn_onTap'
            }
        }
    },

    /*
     * 功能描述：初始化
     */
    changeUserView_init: function () {
        var me = this,
            changeUserViewList = me.getChangeUserViewList(),
            cstore = Ext.getStore('RecentListStore');

        changeUserViewList.setStore(cstore);
    },

    changeUserView_onDestroy: function () {
        if(this.lastSelectedRecord) {
            this.lastSelectedRecord.set('checked', '0');
        }
        Ext.getStore('SysUserStore').clearFilter();
    },

    /*转签切换store*/
    changeUserViewChangeStore: function (btn, e, eOpts) {
        var me = this,
            list = me.getChangeUserViewList(),
            sysUserBtn =  me.getChangeUserViewSysUserBtn(),
            lastUserBtn = me.getChangeUserViewLastedUserBtn(),
            store = null;
        if (btn.getUi() == "normal") { // 重复点击不需要重新加载
            return;
        }
        btn.setUi('normal');
        if (btn.config.name == 'changeUserViewSysUserBtn') {
            lastUserBtn.setUi('action-white');
            store = Ext.getStore('SysUserStore');
            if (!store) {
                store = Ext.create('MyApp.store.work.appflow.SysUserStore');
            }
            store.getProxy().setExtraParams({'filter': ""});
            store.getProxy().setUrl(WeChat_GLOBAL_CONFIG.weChatServeAdr);
            store.setParams({
                requestType: 'get',
                requestAds: WeChat_GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get',
                method: 'GetAllUser'
            });
            store.removeAll();
            store.loadPage(1);
        }
        else {
            sysUserBtn.setUi('action-white');
            store = Ext.getStore('RecentListStore');
        }
        list.lastSelectedRecord = null;
        list.setStore(store);
    },

    /*转签选人*/
    changeUserViewList_onItemTap: function (list, index, target, record, e, eOpts) {
        var me = this;
        var status = record.get('checked');
        if (status == '0') {
            if (list.lastSelectedRecord) {
                list.lastSelectedRecord.set('checked', '0');
            }
            record.set('checked', '1');
            list.lastSelectedRecord = record;
            me.lastSelectedRecord = record;
        }
        else {
            record.set('checked', '0');
            list.lastSelectedRecord = null;
            me.lastSelectedRecord = null;
        }
    },

    /*转签确认*/
    changeUserViewConfirmBtn_onTap: function (btn, e, eOpts) {
        var me = this,
            list = me.getChangeUserViewList(),
            logid = NG.getProductLoginInfo().productLoginID,
            appFlowController = me.getApplication().getController("work.appflow.AppFlowController"),
            appFlowDetailController = me.getApplication().getController("work.appflow.AppFlowDetailController"),
            selecedUser,
            selecedName;

        if (!list.lastSelectedRecord) {
            NG.alert('未选择任何转签人员', 1500);
            return;
        }
        selecedUser = list.lastSelectedRecord.get("usercode");
        selecedName = list.lastSelectedRecord.get("username");
        if (logid == selecedUser) {
            NG.alert('不能转签给自己', 1500);
            return;
        }
        var appFlowInfo = me.getAppFlowDetailView().config.appFlowInfo,
            signid = me.getSignImage().valueId,
            playBtn = me.getPlayBtn(),
            comments = me.getCommentsText().getValue();

        NG.setWaiting(true,'正在转签..');
        appFlowDetailController.uploadAudio(function () {
            var parms = {
                method: 'Transmit',
                flowType: appFlowInfo.flowtype,
                piid: appFlowInfo.piid,
                nodeid: appFlowInfo.nodeid,
                taskinstid: appFlowInfo.taskinstid,
                logid: logid,
                remark: comments,
                signcode: signid,
                audioremark: playBtn.audioRemark,
                transmituser: selecedUser
            };
            appFlowDetailController.AFRequst('TaskInstance', parms, function (resp) {
                NG.setWaiting(false);
                if (resp.status == 'succeed') {
                    Ext.Viewport.remove(me.getAppFlowDetailView(), true);
                    appFlowController.backwardView(me.getChangeUserView(), me.getAppFlowListView());
                  //  NG.refreshMessageToSession(me, NG.MsgType.WORKFLOW, null, true);
                    me.saveRecentOpTolocalStorge(selecedUser, selecedName);
                }
                else {
                    NG.alert('转签失败：' + resp.errmsg, 1500);
                }
            });
        }, "method=SaveAudioRemark&flowType=" + appFlowInfo.flowtype + "&piid=" + appFlowInfo.piid + "&nodeid=" + appFlowInfo.nodeid + "&taskinstid=" + appFlowInfo.taskinstid);
    },

    /*保存最近联系人*/
    saveRecentOpTolocalStorge: function (code, name) {
        var store = Ext.getStore('RecentListStore'),
            data = store.getById("model-" + code),
            tmpData;
        if (!data) {
            tmpData = Ext.create('MyApp.model.work.RecentContactsModel', {
                id: "model-" + code,
                usercode: code,
                username: name
            });
            tmpData.save();
            store.add(tmpData);
        }
    },

    /*转签返回*/
    changeUserViewBackBtn_onTap: function (btn, e, eOpts) {
        this.getApplication().getController("work.appflow.AppFlowController").backwardView(this.getChangeUserView(), this.getAppFlowDetailView());
    }
    /********************************转签人员帮助相关 end ************************************/
});