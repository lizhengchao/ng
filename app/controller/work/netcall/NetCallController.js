/**
 * User: jt
 * Date: 15-11-11
 * Time: 上午11:11
 */
Ext.define('MyApp.controller.work.netcall.NetCallController', {
    extend: 'Ext.app.Controller',
    requires: ['MyApp.controller.work.netcall.NetCallDetailController'],
    config: {
        views: ['work.netcall.NetCallView'],
        stores: ['work.netcall.NetCallListStore'],
        controllers: [],
        refs: {
            netCallView: 'netCallView',
            titleBar: 'netCallView titlebar',
            ngTabPanel: 'netCallView ngtabpanel',
            list: 'netCallView ngtabpanel nglist',
            backBtn: 'netCallView button[name=backBtn]',
            editBtn: 'netCallView button[name=editBtn]',
            addBtn: 'netCallView button[name=addBtn]',
            bottomBar: 'netCallView container[name=bottomBar]',
            search: 'netCallView searchfield[name=search]'
        },
        control: {
            netCallView: {
                initialize: 'netCallViewInit'
            },
            ngTabPanel: {
                activeitemchange: 'ngTabPanel_change'
            },
            list: {
                itemtap: 'list_itemTap'
            },
            backBtn: {
                tap: 'backBtn_tap'
            },
            editBtn: {
                tap: 'editBtn_tap'
            },
            addBtn: {
                tap: 'addBtn_tap'
            },
            search: {
                keyup: 'listQuery',
                clearicontap: 'clearListQuery'
            }
        }
    },

    /*
     * 功能描述：寻呼列表视图初始化
     */
    netCallViewInit: function () {
        var me = this,
            search = this.getSearch(),
            bottomBar = this.getBottomBar();
        this.isEdit = false;  //编辑标记默认为false

        this.loadList();

        bottomBar.element.on({  //设置底部工具条的点击事件
            scope: this,
            delegate: '.x-button',
            tap: 'bottomBar_tap'
        });

        this.getTitleBar().element.down('.x-title').on({
            scope: this,
            tap: 'titleBar_tap'
        });

        window.setTimeout(function(){
            search.setReadOnly(false);
        }, 800);
    },

    /*
     * 功能描述：刷新底部工具条
     */
    refreshBottomBar: function () {
        var item, modelArr,
            addBtn = this.getAddBtn(),
            bottomBar = this.getBottomBar(),
            ngTabPanel = this.getNgTabPanel(),
            tabIndex = ngTabPanel.getActiveIndex(),
            selectBtn = bottomBar.getInnerItems()[0],
            itemArr = bottomBar.getInnerItems()[1].getInnerItems();
        addBtn.setHidden(this.isEdit);
        bottomBar.setHidden(!this.isEdit);
        if (this.isEdit) {
            for (var i = 0, len = itemArr.length; i < len; i++) {
                item = itemArr[i];
                if (item.config.ncIndex && item.config.ncIndex.indexOf(tabIndex) < 0) {
                    item.setHidden(true);
                } else {
                    item.setHidden(false);
                }
            }
        } else {
            modelArr = Ext.getStore('NetCallListStore').data.items;
            if (selectBtn.getText() != "全选") {
                selectBtn.setText('全选');
                selectBtn.setIconCls('ng-select');
            }
            for (var i = 0, len = modelArr.length; i < len; i++) {
                if (modelArr[i].get('selected') == 1) {
                    modelArr[i].set('selected', 0);
                }
            }
        }
    },

    /*
     * 功能描述：tab页切换事件
     */
    ngTabPanel_change: function (tab, newItem, oldItem) {
        this.modifyTitle(newItem);
        oldItem.setStore(null);
        newItem.readFlg = '';
        this.getSearch().setValue('');
        this.loadList(newItem);
        if (this.isEdit) {
            this.editBtn_tap(oldItem);
        }
    },

    /*
     * 功能描述：加载列表数据
     */
    loadList: function (list) {
        var me = this,
            proxy,
            store = Ext.getStore('NetCallListStore');
        if (!list) {
            list = this.getNgTabPanel().getActiveItem();
        }
        if (store) {
            store.removeAll();
        }
        if (list.isPainted()) {
            if(list.config.name.replace('list', '') == '0') {
                NG.refreshMessageToSession(null, NG.MsgType.NETCALL);
            }
            list.setStore('NetCallListStore');
            proxy = store.getProxy();
            proxy.setUrl(WeChat_GLOBAL_CONFIG.weChatServeAdr);
            proxy.setExtraParams({
                requestType: 'get',
                requestAds: NG.getProductLoginInfo().productAdr + "/rest/api/oa/NFCApp/getList",
                tabIndex: list.config.name.replace('list', ''),
                wheresql: this.getSearch().getValue(),
                readFlg: list.readFlg || ''
            });
            if(store.isLoading()) {
                Ext.Ajax.abort();
            }
            store.loadPage(0);
        } else {
            list.on("painted", function () {
                me.loadList(list);
            }, me, {single: true}); //只执行一次
        }
    },

    /*
     * 功能描述：列表项查询
     */
    listQuery: function() {
        var me = this;
        if (me.TimeOutIT) {
            window.clearTimeout(me.TimeOutIT);
            me.TimeOutIT = null;
        }
        me.TimeOutIT = window.setTimeout(function () {
            me.TimeOutIT = null;
            me.loadList();
        }, 500);
    },

    /*
     * 功能描述：清空查询
     */
    clearListQuery: function() {
        this.getSearch().setValue('');
        this.loadList();
    },

    /*
     * 功能描述：列表item点击事件
     */
    list_itemTap: function (list, index, target, record) {
        var selected = record.get('selected'),
            ncIndex = this.getNgTabPanel().getActiveIndex(),
            hasread = record.get('read') == '0' ? false : true;
        if (this.isEdit) {
            record.set('selected', selected == 1 ? 0 : 1);
        } else {
            if(record.get('read') == '0') {
                record.set('read', '1');
            }
            this.skipPage({
                xType: 'netCallDetailView',
                viewName: 'MyApp.view.work.netcall.NetCallDetailView',
                config: {
                    hasread: hasread,
                    ncIndex: ncIndex,
                    ccode: record.get('ccode'),
                    recieverCCode: record.get('RecieverCCode')
                }
            });
        }
    },

    /*
     * 功能描述：点击新增寻呼按钮
     */
    addBtn_tap: function () {
        this.skipPage({
            xType: 'netCallAddView',
            viewName: 'MyApp.view.work.netcall.NetCallAddView'
        });
    },

    /*
     * 功能描述：页面切换
     */
    skipPage: function(opt) {
        NG.initControllers(this, function () {
            var newView = Ext.ComponentQuery.query(opt.xType)[0];
            if (!newView) {
                newView = Ext.create(opt.viewName, opt.config || {});
                Ext.Viewport.add(newView);
            }
            Ext.Viewport.setActiveItem(newView);
        }, ['work.netcall.NetCallDetailController']);
    },

    /*
     * 功能描述：点击编辑按钮
     */
    editBtn_tap: function (cmp) {
        var ngList = cmp.config.xtype == "nglist" ? cmp : this.getNgTabPanel().getActiveItem();
        this.isEdit = !this.isEdit;
        this.getEditBtn().setText(this.isEdit ? '取消' : '编辑');
        this.getSearch().setReadOnly(this.isEdit);
        if (this.isEdit) {
            ngList.setPressedCls("unPressed");
            ngList.removeCls('ng-select-hidden');
        } else {
            ngList.setPressedCls("x-item-pressed");
            ngList.addCls('ng-select-hidden');
        }
        this.refreshBottomBar();
    },

    /*
     * 功能描述：点击底部工具条按钮
     */
    bottomBar_tap: function (e) {
        var btn = Ext.getCmp(e.delegatedTarget.id),
            btnName = btn ? btn.getText() : '';
        if (btnName == '全选' || btnName == '不选') {
            this.selectAll(btn);
        } else {
            this.execOperation(btnName);
        }
    },

    /*
     * 功能描述：更新标题栏区域的标题
     * up: 已收tab页，为true时，标题箭头朝上
     */
    modifyTitle: function(currItem, title, up) {
        var titleBar = this.getTitleBar(),
            newTitle = (title || currItem.config.title) + '寻呼';
        if (currItem.config.title == "已收") {
            newTitle += '<div style="border-left: 5px solid transparent;border-right: 5px solid transparent;display: inline-block;margin-left: 6px;margin-bottom: 3px;' + (up ? 'border-bottom' : 'border-top') + ': 5px solid white;"></div>';
        }
        titleBar.setTitle(newTitle);
    },

    /*
     * 功能描述：点击标题栏区域 - 已收有效
     */
    titleBar_tap: function() {
        var me = this,
            item,
            tabPanel = me.getNgTabPanel(),
            ncIndex = tabPanel.getActiveIndex();
        if (ncIndex == 0 && !this.isEdit) {
            item = tabPanel.getAt(0);
            me.modifyTitle(item, null, true);
            NG.pop(me.getTitleBar(), [
                { title: '<span style="margin-left: 23px;">全部</span>', flg: '' },
                { title: '<span style="margin-left: 23px;">未阅</span>', flg: '0' },
                { title: '<span style="margin-left: 23px;">已阅</span>', flg: '1' }
            ], function (pop, index, target, record) {
                item.readFlg = record.data.flg;
                me.loadList(item);
            }, {
                width: 114,
                topRight: 45,
                hideCallBack: function () {
                    me.modifyTitle(item);
                }
            });
        }
    },

    /*
     * 功能描述：获取选中数据的编号集合
     */
    getSelected: function () {
        var codeArr1 = [],
            codeArr2 = [],
            store = Ext.getStore('NetCallListStore');
        if (store) {
            for (var i = 0, modelArr = store.data.items, len = modelArr.length; i < len; i++) {
                if (modelArr[i].get('selected') == 1) {
                    codeArr1.push(modelArr[i].get('RecieverCCode'));
                    codeArr2.push(modelArr[i].get('ccode'));
                }
            }
        }
        return {RecieverCCode: codeArr1, ccode: codeArr2};
    },

    /*
     * 功能描述：全选
     */
    selectAll: function (btn) {
        var store = Ext.getStore('NetCallListStore'),
            modelArr = store.data.items,
            btnName = btn ? btn.getText() : '',
            selected = btnName == '全选' ? 1 : 0;

        btn.setText(selected ? '不选' : '全选');
        btn.setIconCls(selected ? 'ng-select ng-selected' : 'ng-select');
        for (var i = 0, len = modelArr.length; i < len; i++) {
            if (modelArr[i].get('selected') != selected) {
                modelArr[i].set('selected', selected);
            }
        }
    },

    /*
     * 功能描述：执行已阅-收藏-还原-删除
     */
    execOperation: function (op) {
        var selectedObj = this.getSelected(),
            ncIndex = this.getNgTabPanel().getActiveIndex();
        if (selectedObj.RecieverCCode.length == 0) {
            NG.alert('请先选择记录！');
            return;
        }
        switch (op) {
            case '删除':
                this.deleteNFC(selectedObj, ncIndex);
                break;
            case '收藏':
                this.holdNFC(selectedObj);
                break;
            case '还原':
                this.resetNFC(selectedObj);
                break;
            case '已阅':
                this.readNFC(selectedObj);
                break;
        }
    },

    readNFC: function(selectedObj) {
        var me = this;
        me.NFCApi({
            action: 'readAllNfc',
            params: {
                RecieverCCode: selectedObj.RecieverCCode.join(',')
            },
            success: function (r) {
                if (r.status == 'ok') {
                    NG.alert('操作成功.');
                    me.loadList();
                } else {
                    NG.alert('操作失败.');
                    NG.sysLog(r.msg);
                }
            },
            autoWaiting: "正在操作..."
        });
    },

    resetNFC: function(selectedObj) {
        var me = this;
        me.NFCApi({
            action: 'resetNFC',
            params: {
                RecieverCCode : selectedObj.RecieverCCode.join(','),
                ccode: selectedObj.ccode.join(',')
            },
            success: function (r) {
                if (r.status == 'ok') {
                    NG.alert('还原成功.');
                    me.loadList();
                } else {
                    NG.alert('还原失败.');
                    NG.sysLog(r.msg);
                }
            },
            autoWaiting: "正在还原..."
        });
    },

    /*
     * 功能描述：执行删除
     */
    deleteNFC: function(selectedObj, ncIndex) {
        var me = this;
        me.NFCApi({
            action: 'deleteTemp',
            params: {
                RecieverCCode : selectedObj.RecieverCCode.join(','),
                ccode: selectedObj.ccode.join(','),
                typeIndex: ncIndex
            },
            success: function (r) {
                if (r.status == 'ok') {
                    NG.alert('删除成功.');
                    me.loadList();
                } else {
                    NG.alert('删除失败.');
                    NG.sysLog(r.msg);
                }
            },
            autoWaiting: "正在删除..."
        });
    },

    /*
     * 功能描述：执行收藏
     */
    holdNFC: function(selectedObj) {
        var me = this;
        me.NFCApi({
            action: 'holdnfc',
            params: {
                RecieverCCode: selectedObj.RecieverCCode.join(',')
            },
            success: function (r) {
                if (r.status == 'ok') {
                    NG.alert('收藏成功.');
                    me.loadList();
                } else {
                    NG.alert('收藏失败.');
                    NG.sysLog(r.msg);
                }
            },
            autoWaiting: "正在收藏..."
        });
    },

    /*
     * 功能描述：点击返回按钮
     */
    backBtn_tap: function () {
        NG.application.onBackKeyDown();
    },

    /*
     * 功能描述：消息自由呼相关的api接口
     * config: 配置参数
     */
    NFCApi: function (config) {
        Ext.applyIf(config, {
            url: NG.getProductLoginInfo().productAdr + "/rest/api/NFCApp/" + (config.action || ''),
            method: 'POST', //默认为POST，可以为空
            autoWaiting: false, // 自动添加和取消loading样式，可以为字符串
            params: {},  //参数
            success: Ext.emptyFn, //成功回调
            failure: Ext.emptyFn //失败回调
        });
        if (config.autoWaiting) {
            NG.setWaiting(true, config.autoWaiting === true ? null : config.autoWaiting);
        }
        Ext.Ajax.request({
            url: config.url,
            method: config.method,
            params: config.params,
            success: function (response) {
                if (config.autoWaiting) {
                    NG.setWaiting(false);
                }
                var responseText = response.responseText;
                if (responseText) {
                    config.success(NG.decodeJson(responseText)); //如果为json格式，自动转换成json返回
                } else {
                    NG.sysLog("NFCApi error: " + config.action);
                }
            },
            failure: function () {
                if (config.autoWaiting) {
                    NG.setWaiting(false);
                }
                config.failure();
            }
        });
    },

    /*
     * 功能描述：演示数据
     */
    getDemoData: function (listName) {
        var dataObj = {
            list0: [
                {
                    code: '0001',
                    name: '钟良山',
                    hasAttach: 1,
                    read: 0,
                    dt: new Date(),
                    subject: '开会了，请相关人员速速过来',
                    msg: '各位同事，每周例会开始了，请大家带好笔记本及相关资料，速度赶往8号会议室，过期不候，谢谢大家配合！'
                },
                {
                    code: '0002',
                    name: '张三',
                    hasAttach: 0,
                    read: 0,
                    dt: new Date(),
                    subject: '周例会，请大家务必参加，谢谢！',
                    msg: '好的，马上过来！'
                },
                {
                    code: '0003',
                    name: '李四',
                    hasAttach: 0,
                    read: 1,
                    dt: new Date(),
                    subject: '很重要的事情需要大家讨论一下',
                    msg: '各位同事，每周例会开始了，过期不候，谢谢大家配合！'
                },
                {
                    code: '0004',
                    name: '王五',
                    hasAttach: 1,
                    read: 1,
                    dt: new Date(),
                    subject: '请尽快回复',
                    msg: '各位同事，谢谢大家配合！'
                },
                {
                    code: '0005',
                    name: '李四',
                    hasAttach: 0,
                    read: 1,
                    dt: new Date(),
                    subject: '希望大家支持',
                    msg: '各位同事，每周例会开始了，过期不候，谢谢大家配合！'
                },
                {
                    code: '0006',
                    name: '王五',
                    hasAttach: 1,
                    read: 1,
                    dt: new Date(),
                    subject: '新一轮红包来袭',
                    msg: '没有抢到，不开心！'
                },
                {
                    code: '0007',
                    name: '李四',
                    hasAttach: 0,
                    read: 1,
                    dt: new Date(),
                    subject: '双十一活动总结',
                    msg: '又来双11，能放假么！'
                },
                {
                    code: '0008',
                    name: '王五',
                    hasAttach: 1,
                    read: 1,
                    dt: new Date(),
                    subject: '公司没网，怎么愉快的玩耍',
                    msg: '好好工作，迎娶白富美，哈哈！'
                }
            ],
            list1: [
                {
                    code: '0009',
                    name: '王五',
                    hasAttach: 1,
                    read: 1,
                    dt: new Date(),
                    subject: '公司没网，怎么愉快的玩耍',
                    msg: '好好工作，迎娶白富美，哈哈！'
                }
            ],
            list2: [
                {
                    code: '0010',
                    name: '李四',
                    hasAttach: 0,
                    read: 1,
                    dt: new Date(),
                    subject: '双十一活动总结',
                    msg: '又来双11，能放假么！'
                }
            ],
            list3: [
                {
                    code: '0011',
                    name: '李四',
                    hasAttach: 0,
                    read: 1,
                    dt: new Date(),
                    subject: '希望大家支持',
                    msg: '各位同事，每周例会开始了，过期不候，谢谢大家配合！'
                }
            ],
            list4: [
                {
                    code: '0012',
                    name: '王五',
                    hasAttach: 1,
                    read: 1,
                    dt: new Date(),
                    subject: '这是一条已删寻呼~~~',
                    msg: '收到请删除，谢谢！'
                }
            ],
            list5: [
                {
                    code: '0013',
                    name: '王五',
                    hasAttach: 1,
                    read: 1,
                    dt: new Date(),
                    subject: '这是一条短信寻呼~~~',
                    msg: '收到，哈哈！'
                }
            ]
        };
        return dataObj[listName];
    }
});