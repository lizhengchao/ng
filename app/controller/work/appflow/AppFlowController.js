/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-24
 * Time: 下午5:21
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.controller.work.appflow.AppFlowController', {
    extend: 'Ext.app.Controller',
    config: {
        tpl1: '<div class="nowrap font15" style="margin-bottom: 8px; color: #000;">{taskdesc}' + '</div>' +
            '<table width="100%" class="font13" style="color: #AAA9A9;table-layout: fixed; height: 16px;" border=0><tr valign="bottom">' + '<td class="nowrap typemark" style="width: 100px;">{bizname}</td>' + '<td align="center" style="width:100%"><div  style="text-overflow:ellipsis;white-space:nowrap;overflow:hidden;color: #3993db;"><label class="sendNode" imgtype="nextNode">{initiator_name}</label></div></td>' + '<td align="right" style="width: 100px;"><div class="nowrap time" style="display: inline-block;vertical-align: bottom; max-width: 100px; color: #000;">{sduetime}</div></td>' + '</tr></table>',
        tpl2: '<table width="100%" style="table-layout: fixed;margin-bottom: 8px;" border=0><tr>' + '<td class="nowrap font15" style="width: 100%;">{keyword}</td>' + '<td class="nowrap" style="width: 74px;font-size: 0.8em;color: #AAA9A9;text-align: right;">{actdt}</td>' + '</tr></table>' +
            '<table width="100%" class="font13" style="color: #AAA9A9;table-layout: fixed; height: 16px;" border=0><tr>' + '<td class="nowrap typemark" style="width: 100px;">{bizname}</td>' + '<td align="center" style="width:100%"><tpl if="curusername!=&quot;&quot;"><div style="text-overflow:ellipsis;white-space:nowrap;overflow:hidden;color: #3993db;"><label class="nextNode" imgtype="nextNode">{curusername}</label></div></tpl></td>' + '<td align="right" style="width: 100px;"><tpl if="pista==&quot;运行中&quot;||pista==&quot;待运行&quot;"><div class="nowrap status run"</tpl><tpl if="pista==&quot;终止&quot;"><div class="nowrap status stop"</tpl><tpl if="pista==&quot;结束&quot;"><div class="nowrap status over"</tpl> style="display: inline-block;vertical-align: bottom; max-width: 100px; color: #000;">{pista}</div></td>' + '</tr></table>',

        views: ['work.appflow.AppFlowListView', 'work.pub.OperatorView', 'work.appflow.AppFlowDetailView' ],
        stores: [ 'work.appflow.AppFlowListStore',  'work.pub.OperatorPubStore'],
        models: [],
        refs: {
            /*审批列表界面*/
            appFlowListView: 'appFlowListView',
            appFlowListBack: 'appFlowListView button[name=backbtn]',
            appFlowList: 'appFlowListView list',

            //明细页面
            appFlowDetailView: 'appFlowDetailView',

            /*审批列表排序按钮*/
            sortImg: 'appFlowListView img[name=sortImg]',

            /*类型切换*/
            typeviewer: 'appFlowListView typeviewer',

            /*搜索*/
            searchBtn: 'appFlowListView searchbutton[name=searchBtn]'
        },
        control: {
            /*搜索控件*/
            searchBtn: {
                itemTap: 'appFlowList_onitemtap'
            },
            /*类型选择控件点击*/
            typeviewer: {
                itemTap: 'typeViewer_onTap'
            },
            /*排序按钮点击*/
            sortImg: {
                tap: 'sortImg_onTap'
            },
            appFlowListBack: {
                tap: 'appFlowListBack_onTap'
            },
            appFlowList: {
                itemtap: 'appFlowList_onitemtap'
            },
            appFlowListView: {
                initialize: 'appFlowListView_init',
                activate: 'appFlowListView_active',
                deactivate: 'appFlowListView_deactive'
            }
        }
    },

    /*审批列表初始化*/
    appFlowListView_init: function () {
        var me = this,
            baseurl = NG.getProductLoginInfo().productAdr,
            logid = NG.getProductLoginInfo().productLoginID,
//            baseurl = GLOBAL_CONFIG.productAdr,
//            logid = GLOBAL_CONFIG.userId,
            list = me.getAppFlowList();

        me.getSearchBtn().setProxy({
            url: WeChat_GLOBAL_CONFIG.weChatServeAdr,
            type: 'ajax',
            queryparams: {
                requestType: 'post',
                requestAds: baseurl + "/rest/api/workflow/TaskInstanceList/Get"
            },
            params: {
                method: 'GetPendingTaskInstances',
                logid: logid
            },
            rootProperty: 'data',
            totalProperty: 'rowcount',
            pageParam: 'pageindex',
            limitParam: 'pagesize',
            searchParam: 'filter'
        });
        me.getSearchBtn().setItemTpl(me.getTpl1());

        var store = list.getStore();
        store.removeAll();
        store.getProxy().setUrl(WeChat_GLOBAL_CONFIG.weChatServeAdr);
        store.setParams({
            requestType: 'get',
            requestAds: NG.getProductLoginInfo().productAdr + "/rest/api/workflow/TaskInstanceList/Get",
            method: 'GetPendingTaskInstances',
            logid: logid
        });

    },

    /*重新加载数据*/
    appFlowListView_active: function () {
        var me = this,
            application = me.getApplication(),
            list = me.getAppFlowList(),
            loginTimes = 0,
            txt = me.getTypeviewer().getText(),
            chatRoomController = application.getController('session.ChatRoomController'),
            messageController = application.getController('work.MessageController'),
            store = list.getStore(),
            load_callback = function (records, operation) {
                if (operation.getResponse()) {
                    if (operation.getResponse().responseText) {
                        var reJson = NG.decodeJson(operation.getResponse().responseText);
                        if (reJson.status == "UnLogin") { //登录失效，需要重新登录
                            if (loginTimes < 3) {
                                NG.productLogin(function () {
                                    loginTimes++;
                                    loadList();
                                });
                            } else {
                                NG.alert("模拟登录失败");
                            }
                            return;
                        }
                    }
                    if (txt == "待办任务") {
                        var total = store.getTotalCount() || 0,
                            msgInfo = {},
                            title = total > 0 ? (records[0].get("taskdesc") || records[0].get("bizname")) : '&nbsp;';
                        msgInfo[NG.MsgType.WORKFLOW] = { count: total, title: title };
//                        chatRoomController.setApprovalTaskCount(msgInfo);
//                        messageController.setWorkItemBageText("WorkPortalStore", 1, total);
                    }
                }
            },
            loadList = function () {
                if (store.isLoading()) {
                    Ext.Ajax.abort();
                }
                store.removeAll();
                store.loadPage(1, {
                    callback: function (records, operation) {
                        load_callback(records, operation);
                    }
                });
            };
        me.isListActive = true;
        if (txt != "待办任务") {
            list.setItemTpl(me.getTpl2());
        }
        else {
            list.setItemTpl(me.getTpl1());
        }
        if (list.isPainted()) {
            loadList();
        } else {
            list.on("painted", function () {
                loadList();
            }, me, {single: true}); //只执行一次
        }
    },

    /*
     * 功能描述：外部接口，实现业务消息推送时，刷新审批列表界面
     */
    loadToDoTask: function(toDo) {
        var me = this,
            typeViewer = me.getTypeviewer(),
            list = me.getAppFlowList();
        if (me.isListActive && typeViewer) {
            var txt = typeViewer.getText(),
                store = list.getStore();
            if (!store.isLoading()) {
                if (txt != "待办任务" && toDo && toDo > 0) {
                    typeViewer.setText("待办任务");
                    me.typeViewer_onTap(me.getTypeviewer(), {typecno: '001'}, 0, null);
                } else {
                    store.removeAll();
                    store.loadPage(1);
                }
            }
        }
    },

    appFlowListView_deactive: function () {
        this.isListActive = false;
    },

    /*审批任务排序*/
    sortImg_onTap: function (img, e, eOpts) {
        var me = this;
        NG.pop(img, [
            { title: '最新在前', id: 'desc'},
            { title: '最早在前', id: 'asc' }
        ], function (vv, index, target, record) {
            var store = me.getAppFlowList().getStore();
            store.removeAll();

            if (record.data.id == "desc") {
                store.getProxy().setExtraParams({
                    sortstr: ""
                });
            }
            else {
                if (store.getParams().method == "GetPendingTaskInstances") {
                    store.getProxy().setExtraParams({
                        sortstr: "startdt"
                    });
                }
                else {
                    store.getProxy().setExtraParams({
                        sortstr: "actdt"
                    });
                }
            }
            if(store.isLoading()) {
                Ext.Ajax.abort();
            }
            store.loadPage(1);
        });
    },

    /*类型选择点击*/
    typeViewer_onTap: function (view, data, index, dv) {
        var me = this,
            baseurl = NG.getProductLoginInfo().productAdr,
            logid = NG.getProductLoginInfo().productLoginID,
            list = me.getAppFlowList(),
            store = list.getStore();
        store.removeAll();
        /*将排序参数重新设置成默认排序*/
        store.getProxy().setExtraParams({
            sortstr: ""
        });
        if (data.typecno == "001") {
            store.setParams({
                requestType: 'get',
                requestAds: NG.getProductLoginInfo().productAdr + "/rest/api/workflow/TaskInstanceList/Get",
                method: 'GetPendingTaskInstances',
                logid: logid
            });
            list.setItemTpl(me.getTpl1());

            me.getSearchBtn().setProxy({
                url: baseurl + "/rest/api/workflow/TaskInstanceList/Get",
                params: {method: 'GetPendingTaskInstances',
                    logid: logid},
                //dateField: 'sortdate',
                rootProperty: 'data',
                totalProperty: 'rowcount',
                pageParam: 'pageindex',
                limitParam: 'pagesize',
                searchParam: 'filter'
            });
            me.getSearchBtn().setItemTpl(me.getTpl1());
        }
        else if (data.typecno == "002") {
            store.setParams({
                requestType: 'get',
                requestAds: NG.getProductLoginInfo().productAdr + "/rest/api/workflow/TaskInstanceList/Get",
                method: 'GetMyAppFlowInstance4MobileApp',
                logid: logid,
                myflowtype: 2
            });
            list.setItemTpl(me.getTpl2());

            me.getSearchBtn().setProxy({
                url: baseurl + "/rest/api/workflow/TaskInstanceList/Get",
                params: {method: 'GetMyAppFlowInstance4MobileApp',
                    logid: logid,
                    myflowtype: 2},
                dateField: 'actdt',
                rootProperty: 'data',
                totalProperty: 'rowcount',
                pageParam: 'pageindex',
                limitParam: 'pagesize',
                searchParam: 'filter'
            });
            me.getSearchBtn().setItemTpl(me.getTpl2());
        }
        else if (data.typecno == "003") {
            store.setParams({
                requestType: 'get',
                requestAds: NG.getProductLoginInfo().productAdr + "/rest/api/workflow/TaskInstanceList/Get",
                method: 'GetMyAppFlowInstance4MobileApp',
                logid: logid,
                myflowtype: 1
            });
            list.setItemTpl(me.getTpl2());
            me.getSearchBtn().setProxy({
                url: baseurl + "/rest/api/workflow/TaskInstanceList/Get",
                params: {method: 'GetMyAppFlowInstance4MobileApp',
                    logid: logid,
                    myflowtype: 1},
                dateField: 'actdt',
                rootProperty: 'data',
                totalProperty: 'rowcount',
                pageParam: 'pageindex',
                limitParam: 'pagesize',
                searchParam: 'filter'
            });
            me.getSearchBtn().setItemTpl(me.getTpl2());
        }
        if(store.isLoading()) {
            Ext.Ajax.abort();
        }
        store.loadPage(1);
    },

    /*审批列表界面点击到详细页面*/
    appFlowList_onitemtap: function (v, index, target, record, e) {
        var me = this,
            parms = {},
            pageType,
            tt = e.target.getAttribute("imgtype"),
            logid = NG.getProductLoginInfo().productLoginID;
        if (tt) {
            var hum = record.get('initiator') || record.get('curusercode'),
                humN = record.get('initiator_name') || record.get('curusername'),
                allh = hum.split(","),
                allhN = humN.split(",");
            if (allh.length > 0) {
                if (allh.length == 1) {
                    NG.openPersonInfo(me, allh[0], allhN[0]);
                }
                else {
                    var datas = [];
                    for (var i = 0; i < allh.length; i++) {
                        var adata = {};
                        adata.code = allh[i];
                        adata.name = allhN[i];
                        datas.push(adata);
                    }
                    NG.showWindowList({
                        title: '待办人员',
                        itemTpl: '<div class ="x-button" style="float:left;width: 36px;height: 24px;border-width: 0;padding: 0;"><div class="x-button-icon contact"></div></div><div class="nowrap" style="width: 100px;height: 24px;line-height: 24px;">{name}</div>',
                        data: datas,
                        callback: function (record) {
                            NG.openPersonInfo(me, record.code, record.name);
                        }
                    });
                }
                return false;
            }
        }
        if (me.getTypeviewer().getText() == "待办任务") {
            parms = {
                method: 'GetTaskInstanceInfo',
                logid: logid,
                flowtype: record.data.flowtype,
                piid: record.data.piid,
                nodeid: record.data.nodeid,
                taskinstid: record.data.taskinstid
            };
            pageType = "Edit";
        } else {
            parms = {
                method: 'GetFlowAllInfo',
                logid: logid,
                flowtype: record.data.flowtype,
                piid: record.data.piid
            };
            pageType = "View";
        }
        NG.setWaiting(true, '正在加载数据...');
        me.AFRequst('TaskInstance', parms, function (resp) {
            NG.setWaiting(false);
            if (resp.status != 'succeed') {
                NG.alert(resp.errmsg, 1500);
                return;
            }
            if (pageType == "Edit" && record.data.flowtype == "oawf") {
                var action = resp.taskInstInfo[0].action;
                if (action && action != "tocheck" && action != "check") {
                    pageType = "View_OAWF";
                }
            }
            NG.initControllers(me, function () {
                var appFlowDetailView;
                if (resp.bizAttachment && resp.bizAttachment.length > 0) {
                    resp.bizAttachment = NG.changeAttachmentStyle(resp.bizAttachment);
                }
                appFlowDetailView = me.getAppFlowDetailView();
                if (!appFlowDetailView) {
                    appFlowDetailView = Ext.create('MyApp.view.work.appflow.AppFlowDetailView', {
                        appFlowData: resp,
                        appFlowInfo: record.data,
                        pageType: pageType
                    });
                }
                appFlowDetailView.query('.titlebar')[0].setTitle('<span style="margin-left: 8px;margin-right: 10px;">' + (pageType == "View" ? record.data.keyword : record.data.taskdesc) + '</span>');

                Ext.Viewport.add(appFlowDetailView);
                Ext.Viewport.setActiveItem(appFlowDetailView);
            }, ['work.appflow.AppFlowDetailController']);
        });
    },

    /*审批列表返回按钮*/
    appFlowListBack_onTap: function () {
        this.backwardView(this.getAppFlowListView());
    },

    /*审批流请求*/
    AFRequst: function (funcname, parms, callback) {
        var me = this;
        Ext.Ajax.request({
            url: WeChat_GLOBAL_CONFIG.weChatServeAdr + "?requestType=post&requestAds=" + NG.getProductLoginInfo().productAdr + "/rest/api/workflow/" + funcname + "/Get",
            method: 'POST',
            params: parms,
            success: function (response, opts) {
                var resp = Ext.JSON.decode(response.responseText);
                if (resp.status) {
                    callback(resp);
                }
                else {
                    NG.alert(GLOBAL_CONFIG.NetWorkError, 1500);
                }
            },
            failure: function (response, opts) {
                NG.setWaiting(false);
                NG.alert(GLOBAL_CONFIG.NetWorkError, 1500);
            }
        });
    },

    /*返回界面*/
    backwardView: function (v1, v2) {
        Ext.Viewport.remove(v1, true);
        if (v2) {
            Ext.Viewport.setActiveItem(v2);
        }
    }
});

