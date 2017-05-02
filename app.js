/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when it performs code generation tasks such as generating new
    models, controllers or views and when running "sencha app upgrade".

    Ideally changes to this file would be limited and most work would be done
    in other places (such as Controllers). If Sencha Cmd cannot merge your
    changes and its generated code, it will produce a "merge conflict" that you
    will need to resolve manually.
*/

Ext.application({
    name: 'MyApp',

    requires: [
        'Ext.MessageBox','Ext.ux.ImageViewer'
    ],

    controllers: [
        'work.appflow.AppFlowController'
    ],

    models: [
        'main.LocalModel', 'main.ProductLoginModel'
    ],

    stores: [
        'main.LocalStore', 'main.ProductLoginStore'
    ],

    views: [
        'work.appflow.AppFlowListView'
    ],

    icon: {
        '57': 'resources/icons/Icon.png',
        '72': 'resources/icons/Icon~ipad.png',
        '114': 'resources/icons/Icon@2x.png',
        '144': 'resources/icons/Icon~ipad@2x.png'
    },

    isIconPrecomposed: true,

    startupImage: {
        '320x460': 'resources/startup/320x460.jpg',
        '640x920': 'resources/startup/640x920.png',
        '768x1004': 'resources/startup/768x1004.png',
        '748x1024': 'resources/startup/748x1024.png',
        '1536x2008': 'resources/startup/1536x2008.png',
        '1496x2048': 'resources/startup/1496x2048.png'
    },

    launch: function() {
        var me = this;
        NG.application = me;

        // Destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();

        me.addLocalStorage();

        // Initialize the main view
        Ext.Viewport.add(Ext.create('MyApp.view.work.appflow.AppFlowListView'));
    },

    //模仿app把登录信息插入LocalStorage中
    addLocalStorage: function (){
        var LocalStore = Ext.getStore('LocalStore'),
            userInfo = LocalStore.getById('userInfo'),
            localData;

        localData = {
            enterprise: WeChat_GLOBAL_CONFIG.enterprise,
            userName: WeChat_GLOBAL_CONFIG.userName,
//                userPassWord: passwordValue,
            loginDate: new Date(),
//                isAppDemo: NG.isAppDemo,
//                headshotInit: false,
//                headshot: 'resources/images/headshots/2.png',
//                enterpriseCode: enInfo.enterpriseCode,
//                enterpriseId: enInfo.enterpriseId,
//                enterpriseName: enInfo.enterpriseName,
//                innerNetcallAdr: enInfo.innerNetcallAdr.split('@@')[0],
            netcallAdr: WeChat_GLOBAL_CONFIG.netcallAdr,
            productAdr: WeChat_GLOBAL_CONFIG.productAdr //"http://218.108.50.4:8081"
        };
        userInfo = Ext.create('MyApp.model.main.LocalModel', Ext.apply({ id: 'userInfo' }, localData));
        userInfo.save();
        LocalStore.add(userInfo);
        NG.productLoginID = WeChat_GLOBAL_CONFIG.userName;
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    },

    onBackKeyDown: function (animation, removeAjax) {
        var mainItem = Ext.Viewport.getActiveItem(),
            layout = mainItem.getLayout(),
            allItems = Ext.Viewport.getItems(),
            mask = Ext.Viewport.element.child("div.x-body").child("div.x-mask.x-floating"),
            itemsLength;
        try {
            if (mainItem.isGoingTo !== false && layout && layout.getAnimation() && layout.getAnimation().getReverse && layout.getAnimation().getReverse()) {
                //mainItem.isGoingTo : NestedList 动画结束后的标志
                //解决动画没有结束前，再次调用返回方法时偶尔报错问题
                return;
            }
            if (removeAjax !== false) {
                Ext.Ajax.abort();
            }
            NG.setWaiting(false);
            if (!mainItem) {
                return;
            }
            var DownLoading = allItems.get("DownLoadingContainerMap");
            var ImageView = allItems.get("ImageViewContainerMap");
            if (DownLoading && !DownLoading.getHidden()) {
                DownLoading.hide();
                if (DownLoading.fileTransfer) {
                    DownLoading.fileTransfer.abort();
                }
            }
            else if (!animation && ImageView && !ImageView.getHidden()) {
                ImageView.destroy();
                return;
            }

            if (mask && mask.dom && mask.dom.style.display != "none") {
                return;
            }

            var popItem = Ext.Viewport.down("container[baseCls=popMenu][hidden=false]");
            if (popItem) {
                popItem.hide();
                return;
            }

            if (mainItem.getId() == "loginview") {
                navigator.app.moveTaskToBack();
            }
            else if (mainItem.getId() == "mainview") {
                var activeItem = mainItem.getActiveItem(),
                    layout = activeItem.getLayout();
                if (activeItem.isGoingTo !== false && layout && layout.getAnimation() && layout.getAnimation().getReverse && layout.getAnimation().getReverse()) {
                    //mainItem.isGoingTo : NestedList item切换后的标志
                    //解决动画没有结束前，再次调用返回方法时偶尔报错问题
                    return;
                }
                if (activeItem.getInnerItems()[0] == activeItem.getActiveItem()) {
                    navigator.app.moveTaskToBack();
                }
                else {
                    if (activeItem.$className == "MyApp.view.session.ChatMainView" && activeItem.getActiveItem().$className == "MyApp.view.session.ChatRoomView") {
                        this.getController("session.ChatListController").getWmain().getTabBar().show();
                    }
                    activeItem.pop();
                }
            }
            else {
                if (mainItem.getInnerItems().length == 0 || mainItem.getInnerItems()[0] == mainItem.getActiveItem()) {
                    if (mainItem.myBackTap) {
                        mainItem.myBackTap(animation);
                    }
                    else {
                        if (animation) {
                            Ext.Viewport.slideActiveItem(Ext.Viewport.getInnerItems().indexOf(mainItem) - 1, mainItem);
                        } else {
                            if (mainItem == window.downloadManager) {
                                Ext.Viewport.remove(mainItem, false);
                            }
                            else {
                                Ext.Viewport.remove(mainItem, true);
                            }
                            itemsLength = Ext.Viewport.getInnerItems().length - 1;
                            if (itemsLength > 0) {
                                Ext.Viewport.setActiveItem(itemsLength);
                            }
                        }
                    }
                }
                else {
                    if (mainItem.onBackTap) {
                        mainItem.onBackTap();
                    }
                    else {
                        mainItem.pop();
                    }
                }
            }
        } catch (e) {
            NG.sysLog('onBackKeyDown() error', NG.LogType.JS, e.stack);
        }
    }
});
