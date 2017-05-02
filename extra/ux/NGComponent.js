/**
 * Created by wcc on 13-12-23.
 * 覆盖原生ext的默认
 */
(function() {
    Ext.onReady(function () {
        if (Ext.MessageBox) {
            Ext.MessageBox.OK.text = '确定';
            Ext.MessageBox.CANCEL.text = '取消';
            Ext.MessageBox.YES.text = '是';
            Ext.MessageBox.NO.text = '否';
            Ext.MessageBox.YESNO = [
                {text: '否', itemId: 'no'},
                {text: '是', itemId: 'yes', ui: 'action'}
            ];

            //去掉弹出框的动画效果
            Ext.Msg.defaultAllowedConfig.showAnimation = false;
            Ext.Msg.defaultAllowedConfig.hideAnimation = false;
        }

        //  if (Ext.os.is("iOS")) { //iOS支持手势返回
        if (Ext.Viewport) {
            if (Ext.Viewport.element.getWidth() <= 320 && Ext.Viewport.element.getHeight() <= 480) { //iphone4禁止动画，性能太差
                return;
            }
            Ext.Viewport.element.on({
                swipe: function (ev, node) {
                    if ((Ext.os.is("iOS") || NG.GLOBAL_PARAMS.androidAnimation) && ev.direction == "right" && ev.absDeltaX > 50) {
                        var mainItem = Ext.Viewport.getActiveItem(),
                            activeItem,
                            cid = mainItem.getId ? mainItem.getId() : null,
                            backFunc = function () {
                                var activeItem = mainItem.getActiveItem(),
                                    targetCmp = ev.target.id && Ext.getCmp(ev.target.id),
                                    tmpPanel;
                                if(targetCmp && targetCmp.getDraggable()){
                                    return;
                                }
                                if (!(activeItem && activeItem.down)) {
                                    activeItem = mainItem;
                                }
                                if (activeItem.$className == "com.newgrand.ngtabpanel") {
                                    tmpPanel = activeItem;
                                } else if(activeItem.down('ngtabpanel')) {
                                    tmpPanel = activeItem.down('ngtabpanel');
                                } else {
                                    /*   tmpPanel = (activeItem || mainItem).down("carousel");*/
                                    tmpPanel = (activeItem || mainItem).down("[forbidBack=true]");
                                    if (tmpPanel && !tmpPanel.getHidden()) {
                                        return;
                                    } else {
                                        tmpPanel = null;
                                    }
                                }
                                if (tmpPanel) {
                                    if (tmpPanel.getActiveIndex() <= 0) {
                                        NG.application.onBackKeyDown(Ext.os.is("iOS") || NG.GLOBAL_PARAMS.androidAnimation);
                                    }
                                } else {
                                    NG.application.onBackKeyDown(Ext.os.is("iOS") || NG.GLOBAL_PARAMS.androidAnimation);
                                }
                            };
                        if (cid == "mainview") {
                            activeItem = mainItem.getActiveItem();
                            if (activeItem.getInnerItems()[0] != activeItem.getActiveItem()) {
                                backFunc();
                            }
                        } else if (cid && cid != "loginview") {
                            backFunc();
                        }
                    }
                }
            });
            Ext.Viewport.slideActiveItem = function (activeItem, oldItem) {
                var layout = this.getLayout(),
                    animation = {
                        type: 'slide',
                        duration: 250,
                        easing: 'ease-in',
                        direction: 'right'
                    },
                    defaultAnimation;

                if (this.activeItemAnimation) {
                    this.activeItemAnimation.destroy();
                }
                this.activeItemAnimation = animation = new Ext.fx.layout.Card(animation);
                if (animation && layout.isCard) {
                    animation.setLayout(layout);
                    defaultAnimation = layout.getAnimation();
                    if (defaultAnimation) {
                        defaultAnimation.disable();
                    }
                    animation.on('animationend', function () {
                        if (defaultAnimation) {
                            defaultAnimation.enable();
                        }
                        animation.destroy();
                        if (oldItem && !oldItem.isDestroyed) {
                            oldItem.destroy();
                        }
                    }, this);
                }
                return this.setActiveItem(activeItem);
            };
        }
        //  }
    });
})();

Ext.define('', {
    override:'Ext.util.SizeMonitor',
    constructor: function (config) {
        var namespace = Ext.util.sizemonitor;

        if (Ext.browser.is.Firefox) {
            return new namespace.OverflowChange(config);
        }
        else if (Ext.browser.is.WebKit || Ext.browser.is.IE11) {
            return new namespace.Scroll(config);
        }
        else {
            return new namespace.Default(config);
        }
    }
});
Ext.define('', {
    override: 'Ext.util.PaintMonitor',
    constructor: function (config) {
        return new Ext.util.paintmonitor.CssAnimation(config);
    }
});

Ext.define('', {
    override: 'Ext.event.recognizer.Swipe',
    config:{
        minDistance: 50,
        maxOffset: 100,
        maxDuration: 1000
    },
    createdFn: function (option) {
        Ext.event.recognizer.Swipe = this;
    }
});

Ext.define('', {
    override: 'Ext.scroll.Scroller',
    config: {
        momentumEasing: {
            momentum: {
                acceleration: 30,
                friction: 0.5
            },
            bounce: {
                acceleration: 1,
                springTension: 0.9999
            },
            minVelocity: 5
        },
        outOfBoundRestrictFactor: 0.5
       // outOfBoundRestrictFactor: 0
    },
    onDragStart: function (e) {
        if (document.activeElement.tagName == "TEXTAREA") {
            return;
        }
        this.callParent(arguments);
    },
    createdFn: function (option) {
        Ext.scroll.Scroller = this;
    }
});

Ext.define('', {
    override: 'Ext.dataview.List',
    onStoreUpdate: function(store, record, newIndex, oldIndex) {
        var me = this,
            item,
            btn_element,
            inner_element;

        oldIndex = (typeof oldIndex === 'undefined') ? newIndex : oldIndex;

        if (me.getInfinite() || (oldIndex !== newIndex)) {
            me.doRefresh();
        }
        else {
            item = me.listItems[newIndex];
            btn_element = item.element.down('.btn_delete');
            inner_element = item.element.down('.x-innerhtml');
            if (item) {
                me.updateListItem(item, newIndex, me.getListItemInfo());
                if(btn_element && inner_element) {
                    inner_element.dom.appendChild(btn_element.dom);
                }
            }
        }
    }
});

Ext.define('',{
    override: 'Ext.dataview.DataView',
    config: {
        pressedDelay: 120,
        pressedCls: '',
        triggerEvent: null //增加点击事件的触感时，triggerEvent绑定itemtap时偶尔会报错,这里会导致item无法选中
    },
    onItemTap: function(container, target, index, e) {
        var me = this,
            store = me.getStore(),
            unPressed = me.getPressedCls(),
            el = target.isComponent ? target.renderElement : target,
            pressedCls = 'x-item-pressed',
            record = store && store.getAt(index);
        if (e && e.target.rightBtn) {
            e.target.rightBtn = null;
            this.fireEvent('itemtap', me, index, target, record, e, "rightBtn");
            this.clearDeleteBtn && this.clearDeleteBtn();
            return false;
        }
        if (unPressed === "unPressed") { // 去除按下去的效果
            this.fireEvent('itemtap', me, index, target, record, e);
            return false;
        }
        if (me.hasOwnProperty('tapTimeout')) {
            clearTimeout(me.tapTimeout);
            delete me.tapTimeout;
        } else {
            el.addCls(pressedCls);
            window.setTimeout(function () {
                me.fireEvent('itemtap', me, index, target, record, e);
            }, 0);
        }
        me.tapTimeout = Ext.defer(function () {  //增加点击事件的触感
            if (me.hasOwnProperty('tapTimeout')) {
                clearTimeout(me.tapTimeout);
                delete me.tapTimeout;
            }
            if (el && el.dom) {
                el.removeCls(pressedCls);
            }
        }, 180, me);
        return false;
    },
    doItemTouchStart: function(me, index, target, record) {
        var pressedDelay = me.getPressedDelay();
        if (record) {
            if (pressedDelay > 0) {
                if (!me.hasOwnProperty('pressedTimeout')) {  // 防止多点触控
                    me.pressedTimeout = Ext.defer(me.doAddPressedCls, pressedDelay, me, [record]);
                }
            }
            else {
                me.doAddPressedCls(record);
            }
        }
    },
    createdFn:function(option){
        Ext.dataview.DataView = this;
    }
});

Ext.define('', {
    override: 'Ext.dataview.IndexBar',
    initialize: function () {
        this.callParent();
        var me = this,
            repeater = Ext.create('Ext.util.TapRepeater', {
                el: me.element
            });
        if(!window.indexBarLabel) {
            window.indexBarLabel = Ext.create('Ext.Label', {
                html: '',
                padding: '10px',
                style: 'font-size:1.6em;border-radius:4px 4px 4px 4px;background:rgb(48,52,53);color:white; width:50px; text-align: center;',
                centered: true
            });
            window.indexBarLabel.element.addListener('touchstart', function () {
                Ext.Viewport.remove(window.indexBarLabel, false);
            });
        }
        me.on({
            'index': function (indexBar, html) {
                if (html.length === 1) {
                    window.indexBarLabel.setHtml(html);
                }
            }
        });
        repeater.on({
            'touchstart': function () {
                Ext.Viewport.add(window.indexBarLabel);
            },
            'touchend': function () {
                Ext.Viewport.remove(window.indexBarLabel, false);
                me.innerElement.removeCls(me.getBaseCls() + '-pressed');
            }
        });
    },
    destroy: function () {
        if (window.indexBarLabel) {
            window.indexBarLabel.destroy();
            window.indexBarLabel = null;
        }
        this.callParent();
    },
    createdFn: function () {
        Ext.dataview.IndexBar = this;
    }
});

Ext.define('', {
    override: 'Ext.carousel.Carousel',
    createdFn: function (option) {
        Ext.carousel.Carousel = this;
    },
    onDrag: function (e) {
        if (!this.isDragging) {
            return;
        }

        var startOffset = this.dragStartOffset,
            direction = this.getDirection(),
            delta = direction === 'horizontal' ? e.deltaX : e.deltaY,
            lastOffset = this.offset,
            flickStartTime = this.flickStartTime,
            dragDirection = this.dragDirection,
            now = Ext.Date.now(),
            currentActiveIndex = this.getActiveIndex(),
            maxIndex = this.getMaxItemIndex(),
            lastDragDirection = dragDirection,
            offset;

        if ((currentActiveIndex === 0 && delta > 0) || (currentActiveIndex === maxIndex && delta < 0)) {
            return;
        }

        offset = startOffset + delta;

        if (offset > lastOffset) {
            dragDirection = 1;
        }
        else if (offset < lastOffset) {
            dragDirection = -1;
        }

        if (dragDirection !== lastDragDirection || (now - flickStartTime) > 300) {
            this.flickStartOffset = lastOffset;
            this.flickStartTime = now;
        }

        this.dragDirection = dragDirection;
        this.setOffset(offset);
    }
});

Ext.define('', {
    override: 'Ext.navigation.View',
    config: {
        defaultBackButtonText: '&nbsp;'
    },
    doResetActiveItem: function(innerIndex) { //支持动态配置动画
        var me = this,
            innerItems = me.getInnerItems(),
            animation = me.getLayout().getAnimation();

        if (innerIndex > 0) {
            if (animation && !animation.isAnimation && NG.GLOBAL_PARAMS.androidAnimation) {
                me.getLayout().setAnimation({
                    duration: 250,
                    easing: 'ease-out',
                    type: 'slide',
                    direction: 'left'
                });
                animation = me.getLayout().getAnimation();
            }
            if (animation && animation.isAnimation) {
                if(Ext.os.is("iOS") || NG.GLOBAL_PARAMS.androidAnimation){
                    animation.setReverse(true);
                } else {
                    me.getLayout().setAnimation(null);
                }
            }
            me.setActiveItem(innerIndex - 1);
            me.getNavigationBar().onViewRemove(me, innerItems[innerIndex], innerIndex);
        }
    },
    applyLayout: function() {
        var needAnimation = Ext.os.is("iOS") || NG.GLOBAL_PARAMS.androidAnimation,
            vpEl = Ext.Viewport.element;
        if (needAnimation && vpEl) { //iphone4禁止动画，性能太差
            if (vpEl.getWidth() <= 320 && vpEl.getHeight() <= 480) {
                needAnimation = false;
            }
        }
        return {
            type: 'card',
            animation: (function () {
                return needAnimation ? {
                    duration: 250,
                    easing: 'ease-out',
                    type: 'slide',
                    direction: 'left'
                } : null
            })()
        };
    },
    onBackButtonTap: function() { // 防止重复点击返回按钮，重写此方法
        if (this.pop()) {
            this.fireEvent('back', this);
        }
    },
    pop: function(count) { // 防止重复点击返回按钮，重写此方法
        var innerItems = this.getInnerItems(),
            item = innerItems[innerItems.length - 1];
        if (item === this.getActiveItem() && this.beforePop(count)) {
            return this.doPop();
        }
        return null;
    },
    createdFn: function (option) {
        Ext.navigation.View = this;
    }
});

Ext.define('',{
    override: 'Ext.tab.Panel',
    initialize:function() {
        this.callParent();
        var el = this.getTabBar().element;
        el.on("touchend", function () {
            var pressed = this.getTabBar().element.query(".x-tab-pressed");
            for (var i = pressed.length - 1; i >= 0; i--) {
                pressed[i].className = pressed[i].className.replace("x-tab-pressed", "");
            }
        }, this);
    },
    createdFn:function(option){
        Ext.tab.Panel = this;
    }
});

Ext.define('', {
    override: 'Ext.plugin.ListPaging',
    init: function () {
        this.setLoadMoreText("向上滑动加载更多");
        this.callParent(arguments);
    },
    onStoreLoad: function () {  //解决list全部加载完全后，loading区域不消失的问题
        this.callParent(arguments);
        if (this.storeFullyLoaded()) {
            this.getLoadMoreCmp().hide();
        }
    },
    storeFullyLoaded: function () {
        var store = this.getList().getStore(),
            page = store.currentPage > 0 ? store.currentPage : 1,
            loadCount = store.getAllCount(),
            total = store.getTotalCount();

        return total !== null ? (store.getTotalCount() <= Math.max(page * store.getPageSize(), loadCount)) : false;
    }
});

Ext.define('com.newgrand.Container', {
    extend: 'Ext.Container',
    xtype: 'newgrandContainer',
    config: {
        rightBtn: null,
        callback: null
    },
    initialize: function () {
        var rightBtn = this.getRightBtn(),
            multiItems = false;
        this.callParent(arguments);
        if (rightBtn) {
            if (rightBtn === true) {
                rightBtn = {};
            }
            if (rightBtn.items) {
                var itemArr = [];
                for (var i = 0, len = rightBtn.items.length; i < len; i++) {
                    if (rightBtn.items[i].width) {
                        itemArr.push('<div class="' + (rightBtn.items[i].cls || '') + '" style="-webkit-box-flex:0;display:-webkit-box;-webkit-box-align:center;-webkit-box-pack:center;width:' + rightBtn.items[i].width + 'px;' + (rightBtn.items[i].style || '') + '">' + rightBtn.items[i].text + '</div>');
                    } else {
                        itemArr.push('<div class="' + (rightBtn.items[i].cls || '') + '" style="-webkit-box-flex:' + (rightBtn.items[i].flex || '1') + ';display:-webkit-box;-webkit-box-align:center;-webkit-box-pack:center;' + (rightBtn.items[i].style || '') + '">' + rightBtn.items[i].text + '</div>');
                    }
                }
                rightBtn.text = itemArr.join('');
                multiItems = true;
            }
            Ext.applyIf(rightBtn, {
                text: '删除',
                width: 72,
                delegate: 'x-inner'
            });
            this.element.on({
                scope: this,
                tap: function(e) {
                    var rightBtn = e.target.rightBtn;
                    var callback = this.getCallback();
                    if(rightBtn == true) {
                        callback && callback(this);
                    }
                    this.clearDeleteBtn();
                },
                dragstart: function (e) {
                    var me = this,
                        target = e.delegatedTarget,
                        x = e.deltaX,
                        absX = e.absDeltaX,
                        absY = e.absDeltaY;
                    me.btnX = 0 - rightBtn.width;
                    if (me.itVal) {
                        return;
                    }
                    me.clearDeleteBtn();
                    me.lastDragX = me.positionX || 0;
                    me.positionX = me.lastDragX;
                    if (target && x < 0 && absX > absY && absX <= rightBtn.width && me.lastDragX >= me.btnX) {
                        me.isDragging = true;
                        me.lastDragTarget = target;
                        me.lastDeleteBtn = Ext.create("Ext.Label", {
                            renderTo: target.id || Ext.get(target),
                            cls: multiItems ? 'btn_delete right_swipe_menu' : 'btn_delete',
                            html: rightBtn.text,
                            style: 'font-size: 16px;color: white; position: absolute;background-color:#fc3e39;right: 0px;top: 0px;bottom: 0px;width: ' + rightBtn.width + 'px; margin-right: -' + rightBtn.width + 'px;display: -webkit-box; -webkit-box-align: center;text-align: center;'
                        });
                    } else {
                        this.isDragging = false;
                    }
                },
                drag: function (e) {
                    if (!this.isDragging) {
                        return;
                    }
                    var me = this,
                        target = e.delegatedTarget,
                        x = me.lastDragX || 0,
                        absX = e.absDeltaX,
                        absY = e.absDeltaY;
                    x = x + e.deltaX;
                    if (absX > absY && (x <= 0 || (x > 0 && me.positionX < 0)) && (x >= me.btnX || (x < me.btnX && me.positionX > me.btnX))) {
                        me.positionX = Math.min(0, Math.max(x, me.btnX));
                        target.style["webkitTransform"] = 'translate3d(' + me.positionX + 'px, 0px, 0px)';
                    }
                },
                dragend: function (e) {
                    var me = this,
                        x = 0,
                        velocityX = e.flick.velocity.x;
                    if (me.isDragging && me.lastDragTarget) {
                        if (e.deltaX < -(rightBtn.width * 2 / 3) || velocityX < -0.4) {
                            x = me.btnX;
                        }
                        me.lastDragTarget.style["webkitTransform"] = 'translate3d(' + x + 'px, 0px, 0px)';
                        me.positionX = x;
                        if (x == 0) {
                            me.lastDragTarget = null;
                            if (me.lastDeleteBtn) {
                                me.clearDeleteBtn();
                            }
                        } else {
                            Ext.Viewport.element.on({
                                touchstart: function (e) {
                                    var target = e.target;
                                    if (target && (target.className.indexOf("btn_delete") > -1 || target.parentElement.className.indexOf("btn_delete") > -1)) {
                                        target.rightBtn = true;
                                        return true;
                                    }
                                    target.rightBtn = null;
                                    if (me.clearDeleteBtn()) {
                                        e.stopEvent();
                                    }
                                    return false;
                                },
                                touchend: function (e) {
                                    var target = e.target;
                                    if (this.isDragging || this.getScrollable() && this.getScrollable().getScroller().isDragging) {
                                        return true; //解决滚动后，回弹事件的bug
                                    }
                                    if (target && (target.className.indexOf("btn_delete") > -1 || target.parentElement.className.indexOf("btn_delete") > -1)) {
                                        return true;
                                    }
                                },
                                scope: me,
                                single: true
                            });
                        }
                    }
                    me.isDragging = false;
                }
            });
        }
    },
    clearDeleteBtn: function () {
        var me = this,
            tf = false;
        if (me.lastDragTarget) {
            var x = me.positionX,
                rate = 2,
                lastTarget = me.lastDragTarget,
                lastBtn = me.lastDeleteBtn;
            me.positionX = 0;
            me.lastDragTarget = null;
            rate = parseInt((0 - x) / 20);
            me.itVal = window.setInterval(function () {
                if (x < 1 - rate) {
                    x += rate;
                    lastTarget.style["webkitTransform"] = 'translate3d(' + x + 'px, 0px, 0px)';
                } else {
                    lastTarget.style["webkitTransform"] = 'translate3d(0px, 0px, 0px)';
                    clearInterval( me.itVal );
                    lastTarget = null;
                    me.itVal = null;
                    if (lastBtn) {
                        lastBtn.destroy();
                        lastBtn = null;
                    }
                }
            }, 0);
            tf = true;
        } else {
            me.lastDeleteBtn && me.lastDeleteBtn.destroy();
        }
        me.lastDeleteBtn = null;
        me.isDragging = false;
        return tf;
    }
});

Ext.define("com.newgrand.DBManager", {
    alternateClassName: "DB",
    singleton: true,
    config: {
        db: null,
        ndb:null,
        version: '1', //建议不要更改
        dbName: 'ng',
        description: 'newgrand',
        error: null,
        size: 1024 * 1024 * 10
    },

    constructor: function (config) {
        this.initConfig(config);
    },

    /**
     *  初始化时所调用的方法,常常在js入口处调用
     */
    connectionDB : function() {
        var me = this,
            dbName = me.getDbName(),
            version = me.getVersion(),
            description = me.getDescription(),
            size = me.getSize(),
            ndb= null,
            db = null;
        if (window.sqlitePlugin) {
            db = window.sqlitePlugin.openDatabase(dbName, version, description, size);
            ndb = window.sqlitePlugin.openDatabase('ndb', version, description, 1024*1024);
        } else if (window.openDatabase) {
            db = window.openDatabase(dbName, "", description, size);
            ndb = window.openDatabase('ndb', "", description, 1024*1024);
        }
        if (!db) {
            NG.sysLog('当前设备openDatabase失败');
        }else {
            if (!window.sqlitePlugin && db.version != version) {
                db.changeVersion(db.version, version, function (t) { //设置版本号
                    //版本号修改成功
                }, function () {
                    NG.sysLog('版本号从 ' + db.version + '更新到' + version + ' 失败');
                });
            }
            me.setDb(db);
            me.setNdb(ndb);
            me.createTable();
        }
    },
    createTable: function() {
        var me = this,
             ndb = me.getNdb(),
            db = me.getDb();

        db.transaction(function (tx) {
            //当前登录用户的配置信息
            tx.executeSql(
                    'create table if not exists js_config ' +
                    '(id integer primary key autoincrement,c_key varchar(40), c_value varchar(250), mydef varchar(250))',
                [], me.success, me.failure);
            //联系人详细信息
            tx.executeSql(
                    'create table if not exists person_detail ' +
                    '(id integer primary key autoincrement,eno varchar(40), jid varchar(250), name varchar(250), headshot text, org varchar(250), netcall varchar(250), tel varchar(40),email varchar(250))',
                [], me.success, me.failure);
            //我的好友及本组人员
            tx.executeSql(
                    'create table if not exists my_friend ' +
                    '(id integer primary key autoincrement,eno varchar(40),updatetime varchar(40), logid varchar(250), jid varchar(250), name varchar(250), grp varchar(10), type varchar(1), mydef varchar(250))',
                [], me.success, me.failure);
            //附件缓存信息
            tx.executeSql(
                    'create table if not exists attach_info ' +
                    '(id integer primary key autoincrement,eno varchar(40), logid varchar(250), updatetime numeric, fname varchar(250), fsize double, mydef varchar(40))',
                [], me.success, me.failure);

            //对话信息主表
            tx.executeSql(
                    'create table if not exists chat_main ' +
                    '(id numeric primary key,eno varchar(40), logid varchar(250), jid varchar(250), chattype integer, chatname varchar(250),' +
                    'lasttime numeric, content varchar(250), unread integer, def1 varchar(40), def2 varchar(40))',
                [], me.success, me.failure);

            //对话信息从表
            tx.executeSql(
                    'create table if not exists chat_detail ' +
                    '(id numeric primary key, mid numeric, fromid varchar(250), nickname varchar(250), content1 text, content2 text, msgtime numeric, msgtype integer, success integer, def1 varchar(40), def2 varchar(40))',
                [], me.success, me.failure);
                
            //我的照片
            tx.executeSql(
                    'create table if not exists photos_list ' +
                    '(id integer primary key autoincrement, fid varchar(50), eno varchar(40), logid varchar(250), updatetime numeric, def1 varchar(40), def2 varchar(40))',
                [], me.success, me.failure);

            //群验证消息列表
            tx.executeSql(
                'create table if not exists conference_auth ' +
                '(id integer primary key autoincrement, eno varchar(40), logid varchar(250), isapplied varchar(5), roomjid varchar(250), roomname varchar(250), headshot text, receivetime numeric, applicantjid varchar(250),' +
                'applicantname varchar(250), title varchar(300), description varchar(250), reason text, def1 varchar(40), def2 varchar(40))',
                [], me.success, me.failure);

     /*       //对话信息从表备份
            tx.executeSql(
                    'create table if not exists chat_detail_backup ' +
                    '(id numeric primary key, mid numeric, fromid varchar(250), nickname varchar(250), content1 text, content2 text, msgtime numeric, msgtype integer, success integer, def1 varchar(40), def2 varchar(40))',
                [], me.success, me.failure);*/
        });
        
        ndb.transaction(function(tx){
        	  //当前登录用户的配置信息
            tx.executeSql(
                    'create table if not exists js_config ' +
                    '(id integer primary key autoincrement,c_key varchar(40), c_value varchar(250), mydef varchar(250))',
                [], me.success, me.failure);
        });
    },
    /**
     *   执行sql语句
     *   sql : 执行成sql语句
     *   values : 数组
     *   fn : 回调方法
     */
    excuteSql : function(sql,values,fn, dbname){
        var me = this,
            db = dbname=="ndb"? me.getNdb() : me.getDb();
        console.dir(sql);
        db.transaction(function(tx){
            tx.executeSql(sql,values,(function(tx,result){
                var arrs = me.querySuccess(tx,result);
                fn(arrs);
            }),me.failure);
        });
    },

    /**
     *   执行sql语句
     *   sql : 执行成sql语句
     *   values : 数组
     *   fn : 回调方法
     *   error：回调方法
     */
    excuteSqlEx : function(sql,values,fn, errorfn) {
        var me = this,
            db = me.getDb();
        db.transaction(function (tx) {
            tx.executeSql(sql, values, fn || me.success(), errorfn || me.failure);
        });
    },

    /**
     * 多条语句的sql语句循环执行
     * sqls 数组
     * success 事务成功的回调方法
     * failure 失败时执行的方法  并抛出异常  达到事务回滚的效果
     */
    excute : function(sqls,success,failure){
        var me = this,
            db = me.getDb();
        db.transaction(function(tx){
            for(var i = 0,len=sqls.length;i<len;i++){
                tx.executeSql(sqls[i].sqlContent,sqls[i].values,me.success,me.failure);
            }
        },failure,success);
    },
    /**
     * 用于替换excute方法,达到输出错误sql语句的效果,测试完成请换回excute方法
     */
    excuteError : function(sqls,success,failure){
        var me = this,
            db = me.getDb();
        for(var i = 0,len=sqls.length;i<len;i++){
            (function(j){
                db.transaction(function(tx){
                    me.setError(sqls[j].sqlContent+","+sqls[j].values.length);
                    tx.executeSql(sqls[j].sqlContent,sqls[j].values,me.success,me.failure);
                },failure,function(){});
            })(i);
        }
    },
    /**
     *  向数据库插入数据
     * table : 表名
     * arrs  : object 数组
     */
    insert : function(table,arrs){
        var me = this;
        Ext.Array.each(arrs,function(obj,index){
            var keys = [] , values = [] ;
            Ext.Object.each(obj,function(key,value){
                keys.push(key);
                values.push(value);
            });
            me.singleInsert(table,keys,values);
        });
    },
    singleInsert : function(table,fields,values,fn) {
        var me = this,
            db = me.getDb(),
            sql = "insert into " + table + "(" + fields.join(',') + ") ";
        sql += "values(";

        for (var field in fields) {
            sql += "?,";
        }
        sql = sql.slice(0, sql.length - 1);
        sql += ")";
        db.transaction(function (tx) {
            tx.executeSql(sql, values, fn || function () {
            }, me.failure);
        });
    },
    querySuccess : function(tx,results){
        var arrs = [],rows = results.rows;
        for(var i= 0,len = rows.length; i < len ; i++ ){
            arrs.push(rows.item(i));
        }
        return arrs;
    },
    /**
     *   查询字段值在某个范围内
     *   table : 表名
     *   field :　字段名
     *   values : 某个范围内的值,数组内的值可能要用''或""包围
     *   fn : 回调方法
     */
    queryIn : function(table,field,values,fn) {
        var me = this,
            db = me.getDb(),
            sql = "select * from " + table + " where " + field + " in(" + values.join(',') + ")";
        //console.log(sql);
        db.transaction(function (tx) {
            tx.executeSql(sql, [], (function (tx, result) {
                var arrs = me.querySuccess(tx, result);
                fn(arrs);
            }), me.failure);
        });
    },
    /**
     *  清空表数据
     *  table : 表名
     *  where: "field1=? and field2=?..."
     *  id : [] 为数组, 数目与where中问号个数对应，为null则删除全部数据
     */
    deleteData : function(table, where, id, successFn, failureFn) {
        var me = this,
            db = me.getDb(),
            sql = "delete from " + table + (id && id.length > 0 ? " where " + where : "");
        db.transaction(function (tx) {
            tx.executeSql(sql, id, successFn || me.success, failureFn || me.failure);
        });
    },
    /**
     *  删除表
     */
    drop : function(table){
        var me = this,
            db = me.getDb(),
            sql = 'drop table if exists '+ table;
        db.transaction(function(tx){
            tx.executeSql(sql,[],me.success,me.failure);
        });
    },
    success : function(){
        //Ext.Msg.alert('创建数据库成功');
    },
    failure : function(arg1,arg2){
        console.info(arg1);
        console.info(arg2);
      //  console.info(this.getError());
        //Ext.Msg.alert('执行当前任务失败');
        throw new Error('执行错误');
    }
});

/**
 * Created by wcc 13-12-23
 * modify by jt
 *下载管理
 */
Ext.define("com.newgrand.DownloadManager", (function () {

    //首先获取cordovaFile文件夹下的所有pdf文件
    var IconMath = {
        pdf: 'resources/images/pdf.png',
        ppt: 'resources/images/ppt.png',
        pptx: 'resources/images/ppt.png',
        doc: 'resources/images/word.png',
        docx: 'resources/images/word.png',
        xls: 'resources/images/excel.png',
        xlsx: 'resources/images/excel.png',
        rar: 'resources/images/rar.png',
        zip: 'resources/images/zip.png',
        png: 'resources/images/images.png',
        jpeg: 'resources/images/images.png',
        bmp: 'resources/images/images.png',
        gif: 'resources/images/images.png',
        jpg: 'resources/images/images.png',
        txt: 'resources/images/txt.png',
        other: 'resources/images/file.png'
    };

    // 定义model
    Ext.define("com.newgrand.DownloadManager.Model", {
        extend: "Ext.data.Model",
        config: {
            fields: [
                "icon", "name", "keyIndex", "fullPath", "fileTransfer", "lastModifiedDate", "size","showname"
            ]
        }
    });
    return {
        extend: 'Ext.ux.NGList',
        xtype: 'downloadmanager',
        config: {
            grouped: true,
            disableSelection: true,
            store: Ext.create("Ext.data.Store", {
                model: "com.newgrand.DownloadManager.Model",
                data: [],
                autoLoad: true,
                grouper: {
                    groupFn: function (record) {
                        return record.get('keyIndex') == "1" ? "<div style='height: 35px; line-height: 35px;'>当前附件</div>" : "<div style='height: 35px; line-height: 35px;'>其他附件</div>";
                    },
                    sortProperty: 'keyIndex'
                }
            }),
            items: [
                {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: '下载管理',
                    items: [
                        {
                            ui: 'action-white back',
                            listeners: {
                                tap: {
                                    fn: function () {
                                        NG.application.onBackKeyDown();
                                    }
                                }
                            },
                            text: '',
                            width: 46,
                            style: 'padding-left:11px; width:46px;'
                        },
                        {
                            iconCls: 'trash white',
                            align: 'right',
                            cls:'button-no-radio',
                            badgeText: 0,
                            width: 46,
                            badgeCls: 'delBageCls',
                            listeners: {
                                tap: {
                                    fn: function () {
                                        var me = this.up("downloadmanager"),
                                            objs = me.deleteObj,
                                            cmp = me.getDockedComponent(0).getComponent(2).getComponent(0),
                                            delFunc = function (selection, callback) {
                                                if (selection && !selection.data.fileTransfer) {
                                                    //1：文件删除
                                                    //2：成功后，删除list上的显示
                                                    //alert(selection.data.fullPath);
                                                    function removefile(path) {
                                                        me.$dirEntry.getFile(selection.data.fullPath.match(/^.*\/(.*)$/)[1], { create: false, exclusive: false }, gotRemoveFileEntry, fail);
                                                    }

                                                    function gotRemoveFileEntry(fileEntry) {
                                                        fileEntry.remove(function success(entry) {
                                                            callback && callback(selection);
                                                        }, fail);
                                                    }

                                                    function fail(error) {
                                                        callback && callback(selection);
                                                        NG.sysLog("Error removing file，错误代码：" + error.code, NG.LogType.OPERATION);
                                                    }

                                                    removefile(selection.data.fullPath);
                                                }
                                            };
                                        if (objs.length < 1) {
                                            return;
                                        }
                                        Ext.Msg.confirm(
                                            '提示',
                                            '确定删除?',
                                            function (buttonId) {
                                                if (buttonId === "yes") {
                                                    for (var dobj in objs) {
                                                        if (dobj != "length") {
                                                            delFunc(objs[dobj], function (selection) {
                                                                me.getStore().remove(selection);
                                                            });
                                                        }
                                                    }
                                                    cmp.setBadgeText(0);
                                                    me.deleteObj = {length: 0};
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    ]
                }
            ],
            itemHeight: 55,
            itemCls: "nglist",
            useSimpleItems: true,
            scrollToTopOnRefresh: false,
            pressedCls: '',
            listeners: {
                itemtap: function (me, index, target, record, e, eOpts) {
                    var tappedItem = e.target;
                    var name = tappedItem.getAttribute('name');
                    if ('button' === name) {
                        if ('取消' === tappedItem.getAttribute('value')) {
                            //取消文件下载，并删除list中的显示
                            record.data.fileTransfer.abort();
                        }
                        else {
                            var vw = Ext.Viewport.element.getWidth();
                            var px = e.pageX + 20 >= vw ? (vw - 21) : e.pageX;
                            var dom = me.getItemAt(index).element.dom;
                            var chk = dom.querySelector("div.btn1").querySelector("images");
                            if (chk.style.display == 'none') {
                                chk.style.display = "block";
                                me.deleteObj["obj" + index] = record;
                                me.deleteObj.length += 1;
                                var xx = document.createElement("div");
                                xx.style.cssText = "top:" + (e.pageY - 10) + "px;left:" + px + "px;position:absolute;width:20px; height:20px; color:blue; background-color:transparent; z-index:999";
                                xx.innerText = "+1";
                                document.body.appendChild(xx);
                                var add = function () {
                                    t = parseInt(xx.style.top);
                                    if (t > 1000) {
                                        t = 1000;
                                    }
                                    else if (t > 100) {
                                        t = t - 5;
                                    }
                                    else if (t > 30) {
                                        t = t - 2;
                                    }
                                    else if (t > 8) {
                                        t--;
                                    }
                                    else {
                                        document.body.removeChild(xx);
                                        me.getDockedComponent(0).getComponent(2).getComponent(0).setBadgeText(me.deleteObj.length);
                                        return;
                                    }
                                    xx.style.top = t + "px";
                                    setTimeout(add, 0);
                                };
                                add();
                            }
                            else {
                                chk.style.display = "none";
                                delete me.deleteObj["obj" + index];
                                me.deleteObj.length -= 1;
                                me.getDockedComponent(0).getComponent(2).getComponent(0).setBadgeText(me.deleteObj.length);
                                var xx = document.createElement("div");
                                xx.style.cssText = "top: 8px;left:" + px + "px;position:absolute;width:20px; height:20px; color:red; background-color:transparent; z-index:999";
                                xx.innerText = "-1";
                                document.body.appendChild(xx);
                                var sub = function () {
                                    t = parseInt(xx.style.top);
                                    if (t > 0) {
                                        t--;
                                    }
                                    else {
                                        document.body.removeChild(xx);
                                        return;
                                    }
                                    xx.style.top = t + "px";
                                    setTimeout(sub, 40);
                                };
                                sub();
                            }
                        }
                        return false;
                    }
                    else {
                        NG.openByWebInt(record.getData().fullPath);
                    }
                }
            }
        },

        constructor: function (config) {
            config.itemTpl = '<div style="float:left;margin-right: 5px;">\
            <images width="40px" height="40px" src="{icon}">\
             <div class="barbox" style="display:none;border: black 2px solid;border-radius:5px;background:white;position:relative;top:-7px;height:9px;">\
             <div class="bar" style="background:#f9b400;height:5px;border-radius:5px;width:0%"></div>\
             </div></div><div style="margin-left: 36px;margin-right: 55px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;"><div style="overflow: hidden; text-overflow: ellipsis; width: 100%;line-height: 20px;">{showname}</div>\
             <span style="float: left;clear: left;color: gray; font-size: 10px;font-family: initial;margin-left: 2px; line-height:20px;overflow: hidden;white-space: nowrap; text-overflow: ellipsis;">{lastModifiedDate}&nbsp;&nbsp;{size}</span></div>\
             <div style="height: 55px;position: absolute;right: 0px;width: 55px;top: 0px;"><div class="btn1" name="button" style="width: 55px;height: 55px;right: 0px;position: absolute;"><div name="button" style="position: absolute;right: 14px;top: 23px;border-radius: 14px;border: 1px solid gray; height: 20px;width: 20px;"><images name="button" width="26px" height="26px" src="resources/images/btn_check_on_check.png" style="position: absolute; top: -4px;right: -4px; display: none;"></div></div>\
             <input type="button" width="50px" class="btn btn-default" name="button" value="取消" style="display: none;top: 16px;position: absolute; right: 8px;"/></div>';
            this.callParent(arguments);
            this.HasLoadFs = false;
            this.element.down("span.delBageCls").dom.style.cssText = 'z-index:10;top: 8px;right: 6px;max-width: 55%;white-space: nowrap;text-overflow: ellipsis;text-align: center; display: block;overflow: hidden;color: red; min-width: 18px;font-weight: bold;text-shadow: 0 0 0 !important;font-family: "Helvetica Neue", Helvetica, Arial;font-size: 10px;padding: 1px 2px 2px;border: 0px;-webkit-border-radius: 26px;-moz-border-radius: 26px;-ms-border-radius: 26px;-o-border-radius: 26px; border-radius: 26px;background-color: transparent;position: absolute;';
        },

        gotFS: function (url, key, fname, callback) {
            var me = this;
            me.setGrouped(!!key);
            if (this.HasLoadFs) {
                callback && callback();
                return;
            }
            if (window.cordovaFileDirEntry) {
                var logInfo = NG.getProductLoginInfo();
                window.cordovaFileDirEntry.getDirectory(logInfo.eNo, { create: true, exclusive: false }, function (dir) {
                    dir.getDirectory(logInfo.loginId, { create: true, exclusive: false }, function (dirEntry) {
                        me.$dirEntry = dirEntry;
                        me.$directoryPath = dirEntry.fullPath;
                        var directoryReader = dirEntry.createReader();
                        directoryReader.readEntries(function (entries) {
                            var $data = [],
                                N = entries.length,
                                getfile = function (index) {
                                    if (index >= N) {
                                        me.getStore().removeAll();
                                        me.getStore().insert(0, $data);
                                        me.HasLoadFs = true;
                                        callback && callback();
                                        NG.setWaiting(false);
                                        return;
                                    }
                                    var entry = entries[index],
                                        match = entry.name.match(/^(.*)\.(\w*)$/);
                                    if (!match) {
                                        match = ['', entry.name, ''];
                                    }
                                    index++;
                                    if (entry.isFile) {
                                        if (entry.name.indexOf("ngtmpfile") == 0) { // 跳过临时文件
                                            getfile(index);
                                        } else {
                                            entry.file(function (file) {
                                                var se = Math.round(file.size / 1000.00);
                                                $data.push({
                                                    icon: IconMath[match[2]] || IconMath['other'],
                                                    name: match[1],
                                                    showname: me.getShowName(match[1], match[2]),
                                                    keyIndex: match[1].indexOf(key) > -1 ? "1" : "2",
                                                    fullPath: file.fullPath,
                                                    lastModifiedDate: Ext.util.Format.date(new Date(file.lastModifiedDate), 'Y-m-d H:i'),
                                                    size: (se < 1 ? 1 : se).toString() + 'KB'
                                                });
                                                getfile(index);
                                            }, function (err) {
                                                entry.remove();
                                                getfile(index);
                                            });
                                        }
                                    }
                                    else {
                                        getfile(index);
                                    }
                                };
                            if (N > 0) {
                                NG.setWaiting(true);
                                getfile(0);
                            } else {
                                callback && callback();
                            }
                        }, function () {
                            NG.alert("readEntries fail!");
                        });
                    });
                });
            }
            else {
                var d = {
                    icon: IconMath['other'],
                    name: (fname || url.match(/^.*\/(.*)\.(\w*)$/)[1]),
                    showname: me.getShowName((fname || url.match(/^.*\/(.*)\.(\w*)$/)[1]), ''),
                    keyIndex: "1",
                    fullPath: "a.doc",
                    lastModifiedDate: Ext.util.Format.date(new Date(), 'Y-m-d H:i'),
                    size: '当前状态无法下载'
                };
                this.$$insert(0, d);
            }
        },

        getShowName: function(name, ext) {
            ext = ext || '';
            if (name.indexOf('.' + ext) > 0) {
                if (ext) {
                    name = name.replace('.' + ext, '');
                } else {
                    var lastIndex = name.lastIndexOf('.');
                    ext = name.substr(lastIndex + 1);
                    name = name.substr(0, lastIndex);
                }
            }
            if (name.length > 10) {
                name = name.substr(0, 7) + '...' + name.substr(-2);
            }
            if (ext) {
                name = name + "." + ext;
            }
            return name;
        },

        /**
         *
         * @param data 对象
         */
        $$download: function (url, key, fname) {
            NG.attchmentKey = key;
            this.deleteObj = {length: 0};
            this.getDockedComponent(0).getComponent(2).getComponent(0).setBadgeText(0);
            var me = this;
            me.gotFS(url, key, fname, function () {
                var fileTransfer = new FileTransfer();
                var matchs = url.match(/^.*\/(.*)\.(\w*)$/);
                if(url.indexOf(".ngtmp.zip")>0) {
                    matchs = null;
                }
                if (!matchs) {
                    if (fname && fname.indexOf(".") > 0) {
                        var lastIndex = fname.lastIndexOf('.');
                        matchs = ['', fname.substr(0, lastIndex), fname.substr(lastIndex + 1)];
                    } else {
                        matchs = ['', fname, ''];
                    }
                }
                var name = fname || matchs[1],
                    icon = IconMath[matchs[2]] || IconMath['other'],
                    data;

                name = name.replace("." + matchs[2], "");
                name = name.indexOf(key) > -1 ? (name + matchs[1]) : (name + "-" + key + matchs[1]);
                name = name.length > 200 ? name.substring(0, 200) : name;

                data = {
                    icon: icon,
                    name: name,
                    showname: me.getShowName(name, matchs[2]),
                    keyIndex: "1",
                    fullPath: matchs[2] ? [me.$directoryPath, "/", name, ".", matchs[2]].join("") : [me.$directoryPath, "/", name].join(""),
                    fileTransfer: fileTransfer,
                    size: '1KB',
                    lastModifiedDate: Ext.util.Format.date(new Date(), 'Y-m-d H:i')
                };

                var record = me.$$insert(0, data);
                if (!record) {
                    return;
                }
                var index = me.getStore().indexOf(record),
                    dom = me.getItemAt(index).element.dom;
                me.startDownLoad(fileTransfer, url, data.fullPath, record, dom);
            });
        },
        startDownLoad: function (fileTransfer, url, fullname, record, dom) {
            var me = this,
                tmpKB = 0, width = 0;
            fileTransfer.onprogress = function (progressEvent) {
                var bar = dom.querySelector("div.bar");
                if (progressEvent.lengthComputable) {
                    if (progressEvent.loaded <= progressEvent.total) {
                        width = progressEvent.loaded / progressEvent.total * 100;
                    }
                    tmpKB = progressEvent.total;
                }
                bar.style.width = width + "%";
            };
            fileTransfer.download(
                encodeURI(url),
                fullname,
                function () {
                    var btn = dom.querySelector("input.btn"),
                        btn1 = dom.querySelector("div.btn1"),
                        bar = dom.querySelector("div.bar"),
                        barbox = bar.parentElement;
                    barbox.style.display = "none";
                    btn.style.display = 'none';
                    btn1.style.display = 'block';
                    record.set("fileTransfer", null);
                    record.set("size", Math.ceil(tmpKB / 1000.00).toString() + 'KB');
                }, function () {
                    me.getStore().remove(record);
                    NG.alert("下载失败");
                    NG.sysLog("下载附件出错，附件地址->" + url, NG.LogType.OPERATION);
                });
        },
        $$insert: function (index, data) {
            var me = this,
                store = this.getStore(),
                tmpRecord,
                record,
                dom,
                isExit = false;
            for (var i = store.getAllCount() - 1; i > -1; i--) {
                tmpRecord = store.getAt(i);
                if (tmpRecord.data.name === data.name) {
                    isExit = true;
                }
                tmpRecord.set("keyIndex", (tmpRecord.data.name.indexOf(NG.attchmentKey) > -1 ? "1" : "2"));
            }
            if (isExit) {
                record = null;
            } else {
                record = store.insert(index, data)[0];
            }
            for (var i = store.getAllCount() - 1; i > -1; i--) {
                tmpRecord = store.getAt(i);
                dom = me.getItemAt(i).element.dom;
                if (dom && tmpRecord.data.fileTransfer) {
                    dom.querySelector("input.btn").style.display = 'block';
                    dom.querySelector("div.btn1").style.display = 'none';
                    dom.querySelector("div.bar").parentElement.style.display = 'block';
                }
            }
            return record;
        },
        clearList: function () {
            var store = this.getStore();
            if (store) {
                store.removeAll();
            }
            this.HasLoadFs = false;
        }
    }
})());

/*
*  create by jt
*  date 2014/5/28
 */
/*
*************************************example****************************************************
                     {
                     margin: '0.2em',
                     xtype: 'typeviewer',
                     textField: 'typename',
                     text: '未阅公文',
                     proxy: {
                         url: '',
                         params: {}
                     },
                     viewData: [
                     {
                                 name: "发文类型", data: [
                                                     {
                                                     "arctype": "DispatchTypeData",
                                                     "typecno": "001",
                                                     "typename": "新中大发文1"
                                                     }]
                     },
                     ],
                     listeners: {
                       itemTap:function(typeview,data,index,dv){
                       }
                     }
                     }
 proxy 和 viewData 只需要一个就可以了
 *********************************************end*******************************************************
 */
Ext.define("com.newgrand.typeviewer", {
    extend: 'Ext.Container',
    xtype: 'typeviewer',
    alias: 'widget.typeviewer',
    requires: ['Ext.data.Store'],
    config: {
        downStyle: '<div style="border-left: 5px solid transparent; border-right: 5px solid transparent;border-top: 6px solid #000000;top: 10px;left: 3px;position: relative;"></div>',
        upStyle: '<div style="border-left: 5px solid transparent; border-right: 5px solid transparent;border-bottom: 6px solid #000000;top: 10px;left: 3px;position: relative;"></div>',
        layout: {
            type: 'hbox'
        },
        icon:'',// 'resources/images/work/fclose.png',
        openIcon: '',//'resources/images/work/fopen.png',
        hideOnBankTap: true, //点击空白区域隐藏
        selectItem: null,
        text: '',
        textField: '',
        viewTpl: '',
        viewData: [],
        proxy: {
            url: '',
            params: {
            }
        },
        direction: 'top' //可以是left
    },

    /*
     *初始化
     */
    initialize: function () {
        var me = this,
            icon = me.getIcon(),
            items = [];
        me.callParent();
        me.expand = false;
        if (!me.getViewTpl()) {
            me.setViewTpl("<div>{" + me.getTextField() + "}</div>");
        }
        if (icon) {
            items.push({
                xtype: 'image',
                src: icon,
                width: '21px',
                height: '21px',
                style: 'background-size: contain;margin-left: 4px;'
            });
        }
        items.push({
            style: ' margin-top: 4px; margin-left: 3px; margin-right: 2px; color: #3993db;',
            html: me.getText()
        });
        items.push({
            html: me.getDownStyle()
        });
        me.setItems(items);
        var  orientationchange  = function() {
            me.pageOrientationChange();
        };
        me.element.addListener("touchend", function () {
            if (me.expand) {
                me.hidePanel();
            }
            else {
                me.showPanel();
            }
        });
        me.addListener("destroy", function () {
            if (me.actionSheet) {
                me.actionSheet.destroy();
                me.actionSheet = null;
            }
            if(me.BankMasked){
                me.BankMasked.destroy();
                me.BankMasked = null;
            }
            window.removeEventListener("resize", orientationchange);
        });
        me.addListener("erased", function () {
            if(me.actionSheet && me.expand) {
                me.hidePanel();
            }
        }); //特殊情况下拉界面无法消失的问题
        window.addEventListener("resize", orientationchange);
    },

    /*
    * 旋转屏幕 private
     */
    pageOrientationChange:function() {
        var me = this,
            viewData = me.getViewData();
        if (me.actionSheet && viewData && viewData.length > 0) {
            me.loadViewItems();
        }
    },

    /*
     * 更新文字描述 private
     */
    updateText:function(text){
        var me = this,
            textContainer = me.getComponent(0);
        if(textContainer) {
            textContainer.updateHtml(text);
        }
    },

    /*
    * 加载选择项的数据
     */
    loadViewItems:function() {
        var me = this,
            items = [], item,
            direction = me.getDirection(),
            viewData = me.getViewData(),
            proxy = me.getProxy(),
            height,
            orien = me.getOrientation(),
            tmpTpl = me.getViewTpl();
        me.viewHeight = 2;
        var callback = function (tmpData) {
            var tpl = new Ext.XTemplate('<tpl for=".">', '<div class="type-list-item" dataindex="{#}">', tmpTpl, '</div></tpl>');
            if(tmpData.length > 0 && !tmpData[0].data) { // 构造数据结构
                tmpData = [
                    {
                        name: "", data: tmpData
                    }
                ];
            }
            for (var i = 0; i < tmpData.length; i++) {
                item = tmpData[i];
                if (item.data.length > 0) {
                    height = direction == "left" ? item.data.length * 40 : 40 * Math.ceil((orien == "landscape") ? item.data.length / 4 : item.data.length / 2);
                    if (!Ext.isEmpty(item.name)) {
                        items.push({
                            xtype: 'container',
                            scrollable: null,
                            height: '30px',
                            html: "<span>" + item.name + "</span>",
                            style: 'line-height: 30px;border-bottom: 2px groove #FFFFFF;'
                        });
                        me.viewHeight += 30;
                    }
                    items.push({
                        height: height,
                        scrollable: null,
                        baseCls: direction == "left" ? 'type-list-left type-list' : (orien == "landscape" ? 'landscape type-list' : 'type-list'),
                        tpl: tpl,
                        data: item.data,
                        listeners: {
                            initialize: function (c) {
                                c.element.on({
                                    touchstart: function () {
                                        var target = arguments[0].delegatedTarget,
                                            oldCls = target.className;
                                        target.className = oldCls + " x-item-pressed";
                                    },
                                    touchend: function () {
                                        var target = arguments[0].delegatedTarget,
                                            oldCls = target.className;
                                        target.className = oldCls.replace(" x-item-pressed", "");
                                    },
                                    tap: function () {
                                        var target = arguments[0].delegatedTarget,
                                            dataindex = target.dataindex || target.getAttribute("dataindex"),
                                            itemdata = null;
                                        if (dataindex > 0) {
                                            dataindex = dataindex - 1;
                                            itemdata = c.getData()[dataindex];
                                        }
                                        me.setSelectItem(itemdata); //设置选中项
                                        me.hidePanel();
                                        if (!(me.fireEvent("itemTap", me, itemdata, dataindex, c) === false)) {
                                            me.setText(itemdata[me.getTextField()]);
                                        }
                                    },
                                    delegate: '.type-list-item',
                                    scope: this
                                });
                            }
                        }
                    });
                    me.viewHeight += height;
                }
            }
            if (me.actionSheet) {
                var pageBox = me.element.getParent().getPageBox(),
                    vh = Ext.Viewport.bodyElement.getHeight() - pageBox.bottom;
                me.actionSheet.setHeight(direction == "left" ? vh : Math.min(vh, me.viewHeight));
                me.actionSheet.setItems(items);
                if (vh < me.viewHeight) {
                    me.actionSheet.setScrollable(true);
                }
            }
        };
        var errorcallback = function () {
            if (me.actionSheet) {
                me.actionSheet.setItems({
                    html: '加载数据失败……',
                    style: {
                        'position': 'absolute',
                        'width': '100%',
                        'text-align': 'center',
                        'top': '50%',
                        'margin-top': '-8px',
                        'font-size': '14px',
                        'padding-left': '16px'
                    }
                });
                window.setTimeout(function () {
                    if (me.actionSheet && me.expand) {
                        me.actionSheet.destroy();
                        me.actionSheet = null;
                        if (me.BankMasked) {
                            me.BankMasked.destroy();
                            me.BankMasked = null;
                        }
                        me.expand = false;
                        if(me.getComponent(1)) {
                            me.getComponent(1).updateHtml(me.getDownStyle());
                        }
                    }
                }, 2000);
            }
        };
        if (!viewData || viewData.length == 0) {
            if (Ext.isFunction(proxy.url)) {
                proxy.url = proxy.url();
            }
            Ext.Ajax.request({
                url: NG.replaceURL(proxy.url),
                params: proxy.params,
                success: function (retV) {
                    var tmp = Ext.JSON.decode(retV.responseText);
                    me.setViewData(tmp);
                    callback(tmp);
                },
                failure: function () {
                    errorcallback();
                }
            });
        }
        else {
            callback(viewData);
        }
    },

    /*
    * 获取屏幕的状态（横屏或竖屏）
     */
    getOrientation:function() {
        var width = Ext.Viewport.bodyElement.getWidth(),
            height = Ext.Viewport.bodyElement.getHeight();
        if(width > height){
            return "landscape";  //横屏
        }
        return "portrait";
    },

    /*
    *显示选择框
     */
    showPanel:function() {
        var me = this,
            actionSheet = me.actionSheet,
            masked = me.BankMasked,
            direction = me.getDirection(),
            pageBox = me.element.getParent().getPageBox(),
            showdir = "top",
            hidedir = "top",
            width = "100%",
            height,
            top,
            vh = Ext.Viewport.bodyElement.getHeight() - pageBox.bottom;
        me.expand = true;
        me.getComponent(1).updateHtml(me.getUpStyle());
       // me.getComponent(0).setSrc(me.getOpenIcon());
        if (!actionSheet) {
            var parentEl =  Ext.Viewport.bodyElement;
            if (direction == "left") {
                showdir = "right";
                hidedir = "left";
                width = 140;
                height = vh;
            }
            else {
                height = 65;
            }
            top = (height - 46) / 2;
            if (me.getHideOnBankTap()) {
                me.BankMasked = masked = Ext.create('Ext.Container', {
                    renderTo: parentEl,
                    width: '100%',
                    height: '100%',
                    style: {
                        "background-color": "transparent"
                    },
                    top: 0
                });
                masked.element.addListener("touchend", function () {
                    me.hidePanel();
                });
            }
            actionSheet = Ext.create('Ext.Container', {
                renderTo: parentEl,
                width: width,
                height: height,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    {
                        xtype: 'images',
                        src: 'resources/images/spinner_loading.png',
                        height: 32,
                        width: 32,
                        style: {
                            'position': 'absolute',
                            'top': top + 'px',
                            'left': '50%',
                            'margin-left': '-16px',
                            '-webkit-animation-name': 'x-loading-spinner-rotate',
                            '-webkit-animation-duration': '.8s',
                            '-webkit-animation-iteration-count': 'infinite',
                            '-webkit-animation-timing-function': 'linear'
                        }
                    },
                    {
                        html: '正在加载数据……',
                        style: {
                            'position': 'absolute',
                            'width': '100%',
                            'text-align': 'center',
                            'top': (top + 35) + 'px',
                            'font-size': '0.9em',
                            'padding-left': '16px'
                        }
                    }
                ],
                hidden: true,
                top: pageBox.bottom,
                showAnimation: {
                    type: 'slideIn',
                    direction: showdir
                },
                hideAnimation: {
                    type: 'slideOut',
                    direction: hidedir
                },
                cls:'my-gray',
                style: {
                    'border-top': '2px groove #FFFFFF'
                }
            });
            me.actionSheet = actionSheet;
            me.loadViewItems();
        }
        else if (vh < me.viewHeight) {
            me.actionSheet.setScrollable(true);
        }
        if(masked){
            masked.setHidden(false);
        }
        actionSheet.setHidden(false);
    },

    /*
     *隐藏选择框
     */
    hidePanel:function(){
        var me = this,
            actionSheet = me.actionSheet,
            masked = me.BankMasked,
            text =  me.getComponent(1);
        me.expand = false;
        if(text) {
            text.updateHtml(me.getDownStyle());
           // me.getComponent(0).setSrc(me.getIcon());
        }
        if(actionSheet){
            actionSheet.setHidden(true);
        }
        if(masked){
            masked.setHidden(true);
        }
    }
});

/*
 *  create by jt
 *  date 2014/6/3
 */
/*
 *************************************example****************************************************
 {
     xtype: 'searchbutton',
     name: 'searchBtn',
     align: 'right',
     placeHolder: '在全部公文中搜索',
     itemTpl: '<div>{cname}</div>',
     proxy: {
         url:"",
         params: {},
         searchParam: 'name',
         dateField:'',
         rootProperty:'Content',
         totalProperty: 'RowCount',
         pageParam: 'pageindex',
         limitParam: 'pagesize'
     },
     listeners: {
         itemTap:function(list, index, target, record, e, container){
         }
     }
 }
 *********************************************end*******************************************************
 */
Ext.define("com.newgrand.searchbutton", {
    extend: 'Ext.Container',
    xtype: 'searchbutton',
    alias: 'widget.searchbutton',
    config: {
        src: 'resources/images/work/search.png',
        width: 46,
        height: 46,
        itemTpl: '',
        queryList: '',
        pressedCls: 'x-button-pressed',
        searchStyle: '',
        emptyTip: '',
        sql: null,
        sqlValues: [],
        proxy: {
            url: "",
            loginParam: null,
            params: {},
            searchParam: 'name',
            dateField: '',
            pageParam: 'pageindex',
            limitParam: 'pagesize',
            totalProperty: '',
            rootProperty: ''
        },
        placeHolder: '搜索'
    },

    initialize: function () {
        var me = this;
        me.callParent();
        me.setItems({
            xtype: 'images',
            width: 16,
            height: 17,
            margin: 15,
            style: 'background-size: contain;',
            src: me.getSrc()
        });
        var orientationchange = function () {
            me.pageOrientationChange();
        };
        me.element.addListener("touchstart", function () {
            me.renderElement.addCls(me.getPressedCls());
        });
        me.element.addListener("touchend", function () {
            me.showSearchPanel();
            me.renderElement.removeCls(me.getPressedCls());
        });
        me.addListener("destroy", function () {
            me.hideSearchPanel();
            window.removeEventListener("resize", orientationchange);
        });
        me.addListener("erased", function () {
            me.hideSearchPanel();
        });
        window.addEventListener("resize", orientationchange);
    },

    pageOrientationChange: function () {
        var me = this;
        if (me.searchPanel && me.resultList) {
            var pageBox = me.searchPanel.element.getPageBox();
            me.resultList.setHeight(Ext.Viewport.bodyElement.getHeight() - pageBox.bottom);
        }
    },

    showSearchPanel: function () {
        var me = this,
            emptyTip = me.getEmptyTip() || ('输入关键字，' + me.getPlaceHolder()),
            pageBox = me.element.getParent().getPageBox(),
            parentEl = Ext.Viewport.bodyElement;

        var masked = Ext.create('Ext.Container', {
            renderTo: parentEl,
            width: '100%',
            height: '100%',
            zIndex: 998,
            top: 0,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    height: pageBox.bottom,
                    cls: 'canhide',
                    style: {
                        "background-color": "gray",
                        "opacity": "0"
                    }
                },
                {
                    height: 59,
                    xtype: 'searchfield',
                    placeHolder: me.getPlaceHolder(),
                    padding: '13.5 54 13.5 10',
                    clearIcon: true,
                    style: me.getSearchStyle(),
                    listeners: {
                        keyup: function (search) {
                            if (me.TimeOutIT) {
                                window.clearTimeout(me.TimeOutIT);
                                me.TimeOutIT = null;
                            }
                            me.TimeOutIT = window.setTimeout(function () {
                                me.TimeOutIT = null;
                                me.showResultList(search.getValue());
                            }, 500);
                        },
                        clearicontap: function () {
                            me.hideResultList();
                        }
                    }
                },
                {
                    xtype: 'label',
                    cls: 'canhide',
                    html: '取消',
                    style: 'color: #3993DB; font-size: 16px; position: absolute; top:' + pageBox.bottom + 'px; right: 0px; height:59px; line-height: 59px; padding-right: 10px;'
                },
                {
                    flex: 1,
                    cls: 'canhide',
                    html: '<div style="padding: 58px 40px; line-height: 20px;">' + emptyTip + '</div>',
                    style: {
                        "background-color": "White",
                        "font-size": "14px",
                        "color": "rgba(128, 128, 128, 0.5)",
                        "text-align": "center"
                    }
                }
            ]
        });

        masked.element.on({
            touchend: function () {
                me.hideSearchPanel();
            },
            delegate: '.canhide',
            scope: me
        });
        me.BankMasked = masked;
        me.searchPanel = masked.getComponent(1);
        masked.show();
        me.searchPanel.focus();
    },

    hideSearchPanel: function () {
        var me = this;
        me.searchValue = "";
        me.lastResultData = null;
        if (me.BankMasked) {
            me.BankMasked.destroy();
            me.BankMasked = null;
        }
        if (me.resultList) {
            me.resultList.destroy();
            me.resultList = null;
        }
    },

    showResultList: function (val) {
        var me = this,
            sql = me.getSql(),
            serverProxy =  me.getProxy().serverProxy,
            sqlValues = Ext.clone(me.getSqlValues()),
            searchParam = me.getProxy().searchParam,
            len = searchParam.length,
            proxy = me.getProxy(),
            pageBox = (me.searchPanel && me.searchPanel.element) ? me.searchPanel.element.getPageBox() : null;
        if (!pageBox) {
            return;
        }
        val = val.trim();
        if (Ext.isEmpty(val)) {
            me.searchValue = val;
            me.hideResultList();
            return;
        }
        if (sql == null && (Ext.isEmpty(proxy.url) || Ext.isEmpty(proxy.searchParam))) {
            return;
        }
        if (me.searchValue === val) {
            return;
        }
        me.searchValue = val;
        if (!me.resultList) {
            me.resultList = Ext.create('Ext.Panel', {
                renderTo: Ext.Viewport.bodyElement,
                zIndex: 1001,
                style:'background-color: #fff;',
                top: pageBox.bottom,
                height: '100%',
                width: '100%',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [ ]
            });
        }
        if (sql == null) {
             me.waiting();
        }
        me.resultList.show();
        if (sql == null) {
            me.loadData(val);
        } else {
            for (var i = 0; i < len; i++) {
                sqlValues.push(searchParam[i] == "A" ? val.toLocaleUpperCase() : (searchParam[i] == "a" ? val.toLocaleLowerCase() : val));
            }
            NG.dbManager.excuteSql(sql, sqlValues, function (data) {
                if (data.length > 0) {
                    if (data != me.lastResultData) {
                        if(!me.resultList){
                            return;
                        }
                        me.resultList.setItems(me.getListConfig());
                        me.list = me.resultList.getComponent(0);
                        me.list.setData(data);
                        me.lastResultData = data;
                        me.resultList.setHeight(Ext.Viewport.bodyElement.getHeight() - pageBox.bottom);
                    }
                } else {
                    me.lastResultData = null;
                    if(serverProxy){
                        me.waiting();
                        me.loadData(me.base64encode(me.utf16to8(val)));
                    } else {
                        me.resultList.setItems({
                            html: '没有检索到数据',
                            style: {
                                'background-color': '#fff;',
                                'position': 'absolute',
                                'width': '100%',
                                'text-align': 'center',
                                'top': "30px",
                                'font-size': '0.9em'
                            }
                        });
                    }
                }
            });
        }
    },

    waiting: function() {
        this.resultList.setItems([
            {
                xtype: 'images',
                src: 'resources/images/spinner_loading.png',
                height: 32,
                width: 32,
                style: {
                    'position': 'absolute',
                    'top': '30px',
                    'left': '50%',
                    'margin-left': '-16px',
                    '-webkit-animation-name': 'x-loading-spinner-rotate',
                    '-webkit-animation-duration': '.8s',
                    '-webkit-animation-iteration-count': 'infinite',
                    '-webkit-animation-timing-function': 'linear'
                }
            },
            {
                html: '正在检索数据……',
                style: {
                    'position': 'absolute',
                    'width': '100%',
                    'text-align': 'center',
                    'top': '65px',
                    'font-size': '0.9em',
                    'padding-left': '16px'
                }
            }
        ]);
    },

    hideResultList: function () {
        var me = this;
        if (me.resultList) {
            me.searchValue = "";
            me.lastResultData = null;
            me.resultList.hide();
            if (me.list) {
                me.list.destroy();
                me.list = null;
            }
        }
    },

    loadData: function (val, pageIndex) {
        var me = this,
            proxy = me.getProxy(),
            requesturl = proxy.url,
            serverProxy =  me.getProxy().serverProxy,
            pageBox = (me.searchPanel && me.searchPanel.element) ? me.searchPanel.element.getPageBox() : null;
        if (!pageBox) {
            return;
        }
        if(proxy.queryparams){
            requesturl += ("?requestType=" + proxy.queryparams.requestType + '&requestAds=' + proxy.queryparams.requestAds);
        }
        if (me.dataLoading && me.AjaxRequstObj) {
            Ext.Ajax.abort(me.AjaxRequstObj);
        }
        if(serverProxy) {
            proxy = serverProxy;
            if (Ext.isFunction(proxy.url)) {
                proxy.url = proxy.url();
            }
        }
        proxy.url = NG.replaceURL(proxy.url);
        proxy.params = proxy.params || {};
        proxy.params[proxy.searchParam] = val;
        proxy.params[proxy.pageParam || "pageindex"] = pageIndex || 0;
        proxy.params[proxy.limitParam || "pagesize"] = 15;
        proxy.loginParam && (proxy.params[proxy.loginParam] = NG.getProductLoginInfo().productLoginID);
        me.dataLoading = true;
        me.AjaxRequstObj = Ext.Ajax.request({
            url: requesturl,
            params: proxy.params,
            success: function (retV) {
                me.dataLoading = false;
                var tmp = Ext.JSON.decode(retV.responseText),
                    data = (proxy.rootProperty ? tmp[proxy.rootProperty] : tmp) || [],
                    dateField = proxy.dateField,
                    N = data.length;
                if(!me.resultList){
                    return;
                }
                me.resultList.setHeight(Ext.Viewport.bodyElement.getHeight() - pageBox.bottom);
                if (N > 0) {
                    if (!Ext.isEmpty(dateField)) {
                        for (var i = 0; i < N; i++) {
                            data[i][dateField] = NG.dateFormatOfWork(data[i][dateField]);
                        }
                    }
                    var list = me.resultList.getComponent(0);
                    if (!list.getDefaultType || list.getDefaultType() != "simplelistitem") {
                        me.resultList.setItems(me.getListConfig());
                        list = me.resultList.getComponent(0);
                        list.tmpData = [];
                        list.total = data.length;
                        list.pageIndex = 0;
                        if (proxy.totalProperty && tmp[proxy.totalProperty]) {
                            list.ListPaging = list.add({
                                xtype: 'component',
                                baseCls: Ext.baseCSSPrefix + 'list-paging',
                                scrollDock: 'bottom',
                                html: new Ext.XTemplate('<div class="{cssPrefix}list-paging-msg">{message}</div>').apply({
                                    cssPrefix: Ext.baseCSSPrefix,
                                    message: "加载更多..."
                                }),
                                hidden: true
                            });
                            list.total = tmp[proxy.totalProperty];
                            list.getScrollable().getScroller().addListener("scrollend", function (obj, x, y) {
                                var scroller = this.getScrollable().getScroller();
                                if (!me.dataLoading && this.total > this.tmpData.length && y == scroller.getMaxPosition().y) {
                                    this.pageIndex = this.pageIndex + 1;
                                    this.ListPaging.show();
                                    me.loadData(val, this.pageIndex);
                                }
                            }, list);
                        }
                    }
                    list.tmpData = list.tmpData.concat(data);
                    if(serverProxy && serverProxy.itemTpl){
                        list.setItemTpl(serverProxy.itemTpl);
                    }
                    list.setData(data);
                    if (list.ListPaging) {
                        list.ListPaging.hide();
                    }
                    me.list = list;
                }
                else {
                    me.resultList.setItems({
                        html: '没有检索到数据',
                        style: {
                            'position': 'absolute',
                            'width': '100%',
                            'text-align': 'center',
                            'top': "30px",
                            'font-size': '0.9em'
                        }
                    });
                }
            },
            failure: function (info) {
                me.dataLoading = false;
                if (!info.aborted) {
                    me.resultList.setItems({
                        html: '加载数据失败……',
                        style: {
                            'position': 'absolute',
                            'width': '100%',
                            'text-align': 'center',
                            'top': '30px',
                            'margin-top': '-8px',
                            'font-size': '0.9em',
                            'padding-left': '16px'
                        }
                    });
                }
            }
        });
    },

    utf16to8: function (str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    },
    base64encode: function (input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;
        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
                + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);
        return output;
    },

    getListConfig: function () {
        var me = this,
            list,
            itemCls = "item-list",
            pressedCls = '',
            itemTpl = me.getItemTpl();
        if (!itemTpl && (list = Ext.ComponentQuery.query(me.getQueryList())[0])) {
            itemTpl = list.getItemTpl();
            pressedCls = list.getPressedCls();
            itemCls = list.getItemCls();
        }
        return {
            xtype: 'list',
            flex: 1,
            pinHeaders: false,
            itemTpl: itemTpl,
            disclosure: true,
            useSimpleItems: true,
            scrollToTopOnRefresh: false,
            disableSelection: true,
            itemCls: itemCls,
            pressedCls: pressedCls,
            listeners: {
                itemtap: function (list, index, target, record, e) {
                    if (me.fireEvent("itemTap", list, index, target, record, e, me) === false) {
                        return;
                    }
                    me.hideSearchPanel();
                }
            }
        };
    }
});

/*
 *  create by jt
 *  date 2014/6/6
 */
/*
 *************************************example****************************************************
 {
     xtype:'imgcarousel',
     height: 180,
     items: [
         {
         title: '为运动加油，我自己喝彩',
         src: 'resources/images/t/t1.jpg'
         },
         {
         title: '新人报到，人满为患',
         src: 'resources/images/t/t2.jpg'
         },
         {
         title: '年度优秀员工竞选',
         src: 'resources/images/t/t3.jpg'
         }
     ]
 }
 *********************************************end*******************************************************
 */
Ext.define("com.newgrand.ImageCarousel", {
    extend: 'Ext.Carousel',
    xtype: 'imgcarousel',
    alias: 'widget.imgcarousel',
    config: {
        height: 180,
        directionLock: true,
        items: [],
        listeners: {
            activeitemchange: function (c, item) {
                var me = this;
                if (item.element.hasClassMap) {
                    me.addTitleContainer(item);
                }
            }
        }
    },

    initialize: function () {
        var me = this,
            innerItems = me.getInnerItems(),
            activeItem = me.getActiveItem(),
            Len = innerItems.length,
            title = "";
        me.callParent();
        if (Len > 0 && activeItem) {
            me.addTitleContainer(activeItem);
        }
        me.element.on({
            tap: function () {
                me.fireEvent("itemTap", this, this.getActiveItem(), this.getActiveIndex());
            },
            scope: me
        });
        var so = window.cordova && window.cordova.plugins ? window.cordova.plugins.screenorientation : null;
        if (so) {
            me.addListener("destroy", function () {
                so.setOrientation(so.Orientation.UNSPECIFIED);
            });
            so.setOrientation(so.Orientation.PORTRAIT);
        }
    },

    setImages: function (imgs) {
        var me = this;
        me.setItems(imgs);
    },

    addTitleContainer: function (item) {
        var me = this,
            title = item.title || item.config.title,
            src = item.src || item.config.src;
        if(!me.IndicatorinnerEl) {
            var titleContainer = Ext.create("Ext.Container", {
                cls: 'new-title',
                renderTo: me.getIndicator().element,
                style: "position: absolute;color: white;left: 6px;top: 8px; width: 100%; white-space: nowrap;overflow: hidden; text-overflow: ellipsis;",
                html: '<div style="width: 80%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">' + title + '</div>'
            });
            me.IndicatorinnerEl = titleContainer.element.down(".x-innerhtml");
            me.getIndicator().element.setStyle({"background-image": "url('resources/images/font.png')", "-webkit-box-pack": "end", "height": "32px", "background-repeat": "repeat-x", "background-size": "contain"});
        }
        else {
            me.IndicatorinnerEl.setHtml('<div style="width: 80%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">' + title + '</div>');
        }
        if (!item.imgLoaded) {
            item.imgLoaded = true;
            me.showWaiting(true, item.element);
            me.loadImage(item, src);
        }
    },

    loadImage:function(item, src){
        var me = this;
        window.setTimeout(function () {
            var tmpImage = new Image();
            tmpImage.src = src;
            tmpImage.onload = function () {
                if (item && item.element) {
                    item.element.setStyle({"background-color": "#e6e6e6", "background-image": "url('" + src + "')", "background-repeat": "no-repeat", "background-position": "center", "background-size": "cover"});
                }
                me.showWaiting(false);
            };
            tmpImage.onerror = function () {
                me.showWaiting(false);
            };
        }, 10);
    },

    showWaiting: function(show, panel){
        var me = this;
        if(show) {
            me.loading = Ext.create('Ext.Img', {
                renderTo: panel || Ext.getBody(),
                src: 'resources/images/spinner_loading.png',
                height: 32,
                width: 32,
                style: {
                    'position': 'absolute',
                    'top': '50%',
                    'margin-top': '-16px',
                    'left': '50%',
                    'margin-left': '-16px',
                    '-webkit-animation-name': 'x-loading-spinner-rotate',
                    '-webkit-animation-duration': '.8s',
                    '-webkit-animation-iteration-count': 'infinite',
                    '-webkit-animation-timing-function': 'linear'
                }
            });
        }
        else{
            window.setTimeout(function(){
                if(me.loading) {
                    me.loading.destroy();
                    me.loading = null;
                }
            },100);
        }
    }
});

Ext.define("com.newgrand.TopImage", {
    extend: 'Ext.Container',
    xtype: 'topimage',
    alias: 'widget.topimage',
    config: {
/*        height: 150,*/
        scrollDock:'top',
        style: "margin-top: -2px;",
        items: [{
            xtype:'imgcarousel',
            height:'100%',
            listeners:{
                itemTap: function(carousel, item, itemIndex){
                    var parentContainer = this.getParent();
                    if(parentContainer) {
                        parentContainer.fireEvent("itemTap", carousel, item, itemIndex);
                    }
                }
            }
        }],
        listeners: {
            painted: function(){
                var me = this;
                me.paintedChange();
            }
        }
    },

    constructor: function(config) {
        config = config || {};
        config.height = Ext.Viewport.element.getWidth() * 9 / 16;
        this.callParent(arguments);
    },

    initialize: function () {
        var me = this;
        me.imgCarousel =  me.getComponent(0);
    },

    setImages:function(imgs){
        var me =this;
        if(me.imgCarousel ) {
            me.imgCarousel.setImages(imgs);
        }
    },

    paintedChange: function(){
        var me = this,
            height = me.getHeight(),
            parent = me.getParent();
        if(!me.ScrollerListener && parent && parent.getScrollable() && me.imgCarousel) {
            me.ScrollerListener = true;
            parent.getScrollable().getScroller().addListener("scroll", function (obj, x, y, eOpts) {
                if (y > height && !this.getHidden()) {
                    this.hide();
                }
                else if (y <= height && this.getHidden()) {
                    this.show();
                }
            }, me.imgCarousel);
        }
    }
});

Ext.define("com.newgrand.taptpl", {
    extend: 'Ext.Container',
    xtype: 'taptpl',
    alias: 'widget.taptpl',
    config: {
        itemTpl: '',
        itemStyle: 'position:relative; height: 57px; padding: 8px 16px 7px 16px;',
        itemCls: ''
    },
    initialize: function () {
        var me = this,
            itemCls = me.getItemCls(),
            itemStyle = ' style="' + (me.getItemStyle() || '') + '"',
            itemTpl = me.getItemTpl() || '';
        if (itemCls) {
            itemCls = 'x-tap-item<tpl if="xindex==1"> first-item</tpl> ' + itemCls;
        } else {
            itemCls = 'x-tap-item<tpl if="xindex==1"> first-item</tpl>';
        }
        me.element.on({
            delegate: '.x-tap-item',
            tap: 'containerItemTap',
            scope: me
        });
        me.setTpl(['<tpl for=".">', '<div dataIndex="{#}" class="', itemCls, '<tpl if="values.beforeLine!==0"> before-line</tpl>"', itemStyle, '>', itemTpl, '</div></tpl>'].join(""));
        me.callParent(arguments);
    },
    updateTpl: function () {
        this.updateData(this.getData());
    },
    containerItemTap: function (e) {
        var me = this,
            target = e.getTarget(),
            index = Number(target.dataIndex || target.getAttribute("dataIndex")) - 1,
            record = me.getData()[index],
            oriCls = target.className,
            preCls = "x-button-pressed";
        if (me.hasOwnProperty('tapTimeout')) {
            clearTimeout(me.tapTimeout);
            delete me.tapTimeout;
        } else {
            target.className = oriCls.length == 0 ? preCls : (oriCls + " " + preCls);
            window.setTimeout(function () {
                me.fireEvent('itemTap', me, record, target, index, e);
            }, Ext.os.is("iOS") ? 0 : 50);
        }
        me.tapTimeout = Ext.defer(function () {  //增加点击事件的触感
            target.className = target.className.replace(preCls, "").trim();
            if (me.hasOwnProperty('tapTimeout')) {
                clearTimeout(me.tapTimeout);
                delete me.tapTimeout;
            }
        }, 180, me);
    }
});

//可以滑动的tab Panel
Ext.define("com.newgrand.ngtabpanel", {
    extend: 'Ext.Carousel',
    xtype: 'ngtabpanel',
    alias: 'widget.ngtabpanel',
    requires: ['Ext.tab.Bar'],
    config: {
        items: [],
        bufferSize: 1,
        tabBar: true,
        title: '',
        indicator: false,
        tabBarPosition: 'top',
        ui: 'mytab'
    },
    pauseDrag: false,
    initialize: function () {
        this.callParent();
        this.on({
            order: 'before',
            activetabchange: 'doTabChange',
            delegate: '> tabbar',
            scope: this
        });
        this.on({
            activeitemchange: 'doActiveChange',
            scope: this
        });
    },
    updateUi: function (newUi, oldUi) {
        this.callParent(arguments);

        if (this.initialized) {
            this.getTabBar().setUi(newUi);
        }
    },
    applyTabBar: function (config) {
        if (config === true) {
            config = {};
        }

        if (config) {
            Ext.applyIf(config, {
                ui: this.getUi(),
                height: 36,
                docked: this.getTabBarPosition(),
                layout: {
                    pack: 'justify',
                    align: 'center'
                },
                defaults: {
                    flex: 1
                }
            });
        }

        return Ext.factory(config, Ext.tab.Bar, this.getTabBar());
    },
    updateTabBarActiveItem: function(position) {
        var tabBar = this.getTabBar();
        tabBar.setActiveTab(position);
    },
    updateTabBar: function (newTabBar) {
        if (newTabBar) {
            this.add(newTabBar);
            this.setTabBarPosition(newTabBar.getDocked());
        }
    },
    updateTabBarPosition: function (position) {
        var tabBar = this.getTabBar();
        if (tabBar) {
            tabBar.setDocked(position);
        }
    },
    doTabChange: function (tabBar, newTab, oldTab) {
        var oldActiveItem = this.getActiveItem(),
            newIndex = tabBar.indexOf(newTab),
            offset = this.activeIndex - newIndex,
            newActiveItem;
        if (!this.forcedChange) {
            this.tabChanging = true;
            this.setOffset(0);
            this.animationDirection = offset;
            this.getInnerItemAt(newIndex).setHidden(false);
            this.getAnimation().duration = (offset == 1 || offset == -1) ? 250 : 0;
            this.setOffsetAnimated(this.itemLength * offset);
        }
        return true;
    },
    onSizeChange: function() {
        if(!this.tabChanging) {
            this.refreshSizing();
            this.refreshCarouselItems();
            this.refreshActiveItem();
        }
    },
    onDragStart: function(e) {
        var direction = this.getDirection(),
            absDeltaX = e.absDeltaX,
            absDeltaY = e.absDeltaY,
            directionLock = this.getDirectionLock(),
            dX = e.deltaX,
            itemIndex = -1,
            currentActiveIndex = this.getActiveIndex(),
            maxIndex = this.getMaxItemIndex();

        this.isDragging = true;

        if(this.pauseDrag || document.activeElement.tagName == "TEXTAREA" || document.activeElement.tagName == "INPUT") {
            this.isDragging = false;
            return;
        }

        if (directionLock) {
            if ((direction === 'horizontal' && absDeltaX > absDeltaY)
                || (direction === 'vertical' && absDeltaY > absDeltaX)) {
                e.stopPropagation();
            }
            else {
                this.isDragging = false;
                return;
            }
        }

        this.getTranslatable().stopAnimation();

        if (dX > 0) { // 向右滑
            if (currentActiveIndex > 0) {
                itemIndex = currentActiveIndex - 1;
            }
        } else if (dX < 0) { // 向左滑
            if (currentActiveIndex < maxIndex) {
                itemIndex = currentActiveIndex + 1;
            }
        }
        if(itemIndex > -1) {
            this.getInnerItemAt(itemIndex).setHidden(false);
        }

        this.tabChanging = true;
        this.dragStartOffset = this.offset;
        this.dragDirection = 0;
    },
    onAnimationEnd: function (translatable) {
        var me = this,
            currentActiveIndex = this.getActiveIndex(),
            animationDirection = this.animationDirection,
            axis = this.currentAxis,
            currentOffset = translatable[axis],
            itemLength = this.itemLength,
            offset;

        if (animationDirection === -1) {
            offset = itemLength + currentOffset;
        }
        else if (animationDirection === 1) {
            offset = currentOffset - itemLength;
        }
        else {
            offset = 0;
        }

        offset -= this.itemOffset;
        this.offset = offset;
        this.setActiveItem(currentActiveIndex - animationDirection);

        window.setTimeout(function(){
            me.tabChanging = false;
        }, 500);
    },
    doActiveChange: function (carousel, newActiveItem, oldActiveItem) {
        if (newActiveItem) {
            var items = this.getInnerItems(),
                oldIndex = items.indexOf(oldActiveItem),
                newIndex = items.indexOf(newActiveItem),
                tabBar = this.getTabBar(),
                oldTab = tabBar.parseActiveTab(oldIndex),
                newTab = tabBar.parseActiveTab(newIndex);

            if (newIndex != -1) {
                this.forcedChange = true;
                tabBar.setActiveTab(newIndex);
                this.forcedChange = false;

                if (oldTab) {
                    oldTab.setActive(false);
                }

                if (newTab) {
                    newTab.setActive(true);
                }
                if(newActiveItem.getHidden()) {
                    newActiveItem.setHidden(false);
                }
                if(!oldActiveItem.getHidden()) {
                    oldActiveItem.setHidden(true);
                }
            }
        }
    },
    onItemAdd: function (card) {
        var me = this;

        if (!card.isInnerItem()) {
            return me.callParent(arguments);
        }

        var tabBar = me.getTabBar(),
            initialConfig = card.getInitialConfig(),
            tabConfig = initialConfig.tab || {},
            tabTitle = (card.getTitle) ? card.getTitle() : initialConfig.title,
            tabHidden = (card.getHidden) ? card.getHidden() : initialConfig.hidden,
            innerItems = me.getInnerItems(),
            index = innerItems.indexOf(card),
            tabs = tabBar.getItems(),
            activeTab = tabBar.getActiveTab(),
            currentTabInstance = (tabs.length >= innerItems.length) && tabs.getAt(index),
            tabInstance;
        card.setHidden(me.getActiveIndex() != index);
        if (tabTitle && !tabConfig.title) {
            tabConfig.title = tabTitle;
        }

        if (tabHidden && !tabConfig.hidden) {
            tabConfig.hidden = tabHidden;
        }

        tabInstance = Ext.factory(tabConfig, Ext.tab.Tab, currentTabInstance);

        if (!currentTabInstance) {
            tabBar.insert(index, tabInstance);
        }

        card.tab = tabInstance;

        me.callParent(arguments);

        if (!activeTab && activeTab !== 0) {
            tabBar.setActiveTab(tabBar.getActiveItem());
        }
    },
    onItemRemove: function (item, index) {
        this.getTabBar().remove(item.tab, this.getAutoDestroy());

        this.callParent(arguments);
    }
});

//可以折叠的手风琴样式容器
Ext.define("com.newgrand.ngAccordion", {
    extend: 'Ext.Container',
    xtype: 'ngaccordion',
    alias: 'widget.ngaccordion',
    config: {
    },
    initialize: function () {
        this.callParent();
        this.renderElement.on({
            tap: 'switchTap',
            delegate: '.accordion-title',
            scope: this
        });
    },
    switchTap: function (head) {
        var me = this,
            target = head.delegatedTarget;
        if (target && target.id) {
            var titleHead = Ext.getCmp(target.id),
                headIndex = titleHead.headIndex,
                innerItems = me.getInnerItems(),
                currentItem = innerItems[headIndex + 1],
                itemHidden = currentItem.getHidden();
            titleHead.setCls(itemHidden ? "accordion-title accordionDown" : "accordion-title accordionUp");
            if (itemHidden) { //展开前执行
                me.fireEvent('beforeExpand', me, titleHead, headIndex);
            }
            currentItem.setHidden(!itemHidden);
            if (itemHidden) { //展开后执行
                me.fireEvent('afterExpand', me, titleHead, headIndex);
            }
        }
    },
    setItemhidden: function (itemIndexs, tf) {
        var me = this,
            currItem,
            itemIndex,
            indexArr = itemIndexs;
        if (!Ext.isArray(itemIndexs)) {
            indexArr = [itemIndexs];
        }
        if(tf===undefined){ tf = true; }
        for (var i = indexArr.length - 1; i > -1; i--) {
            itemIndex = indexArr[i];
            currItem = me.containerItems[itemIndex];
            if (currItem) {
                var initialConfig = currItem.getInitialConfig(),
                    innerItems = me.getInnerItems(),
                    topIndex = (currItem.getTopIndex) ? currItem.getTopIndex() : initialConfig.topIndex;
                currItem.setHidden(tf);
                if (topIndex !== undefined) {
                    innerItems[topIndex].setHidden(tf);
                }
            }
        }
    },
    expand: function (itemIndexs, tf) {
        var me = this,
            currItem,
            itemIndex,
            indexArr = itemIndexs;
        if (!Ext.isArray(itemIndexs)) {
            indexArr = [itemIndexs];
        }
        if (tf === undefined) {
            tf = true;
        }
        for (var i = indexArr.length - 1; i > -1; i--) {
            itemIndex = indexArr[i];
            currItem = me.containerItems[itemIndex];
            if (currItem) {
                var initialConfig = currItem.getInitialConfig(),
                    innerItems = me.getInnerItems(),
                    topIndex = (currItem.getTopIndex) ? currItem.getTopIndex() : initialConfig.topIndex;
                if (topIndex !== undefined) {
                    currItem.setHidden(!tf);
                    innerItems[topIndex].setCls(tf ? "accordion-title accordionDown" : "accordion-title accordionUp");
                }
            }
        }
    },
    applyItems: function (items) {
        var idx = 0,
            originItems = [],
            currentItem,
            cls,
            marginTop = 8,
            titleHead,
            bodyEl = Ext.Viewport.bodyElement,
            headWidth = Math.min(bodyEl.getWidth(),bodyEl.getHeight()) - 60,
            len = items.length;
        for (var i = 0; i < len; i++) {
            currentItem = items[i + idx];
            originItems.push(currentItem);
            if (typeof currentItem.spacing != "undefined") {
                marginTop = currentItem.spacing;
            }
            if (currentItem.title) {
                cls = currentItem.fixed ? "accordion-fixed" : (currentItem.hidden ? "accordion-title accordionUp" : 'accordion-title accordionDown');
                titleHead = Ext.create('Ext.Label', {
                    height: 32,
                    padding: '0 8 0 12',
                    cls: cls,
                    style: 'background-color:#ffffff; position: relative; margin-top:' + (i > 0 ? marginTop : 0) + 'px;',
                    html: '<span class="font15" style="line-height: 32px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;display: block; max-width: ' + headWidth + 'px;">' + currentItem.title + '</span>'
                });
                Ext.Array.insert(items, i + idx, [titleHead]);
                titleHead.headIndex = i + idx;
                currentItem.topIndex = i + idx;
                idx++;
            }
        }
        this.callParent(arguments);
    },
    onItemAdd: function (item) {
        var me = this;
        if (!item.isInnerItem()) {
            return me.callParent(arguments);
        }
        var containerItems = me.containerItems || [];
        if (item.headIndex === undefined) {
            containerItems.push(item);
        }
        me.containerItems = containerItems;
        me.callParent(arguments);
    },
    doRemove: function (item, index, destroy) {
        this.callParent(arguments);
        if (item.headIndex !== undefined) {
            Ext.Array.remove(this.config.items, item);
        } else {
            Ext.Array.remove(this.containerItems, item);
        }
    }
});

//审批单据明细帮助--目前只支持单选
Ext.define("com.newgrand.ngCommonHelp", {
    extend: 'Ext.field.Text',
    xtype: 'ngcommonhelp',
    alias: 'widget.ngcommonhelp',
    config: {
        cls: 'edit-input edit-select',
        readOnly: true,
        fromValues:{},
        helper: {
            title: '通用帮助',
            helpString: {}
        }
    },
    initialize: function () {
        this.callParent();
        this.renderElement.on({
            tap: 'tap',
            scope: this
        });
    },
    tap: function (com, target) {
        if (target && (target.className == "x-form-label" || target.parentElement.className == "x-form-label")) {
            return;
        }
        var me = this,
            fromValues = me.getFromValues(),
            helper = me.getHelper(),
            store;

        if (helper.helpString.Type == 0) {
            store = Ext.create("Ext.data.Store", {
                autoDestroy: true,
                remoteFilter: false,
                fields: ["code", "name"],
                data: helper.helpString.Value
            });
        } else {
            store = Ext.create("Ext.data.Store", {
                autoDestroy: true,
                remoteFilter: true,
                clearOnPageLoad: false,
                pageSize: 20,
                params: {
                    method: 'GetBizFiledHelpData',
                    sqlstr: helper.helpString.Value,
                    logid: NG.getProductLoginInfo().loginId
                },
                fields: ["code", "name"],
                proxy: {
                    type: 'ajax',
                    pageParam: 'pageindex',
                    startParam: false,
                    limitParam: 'pagesize',
                    extraParams: {
                        filter: ''
                    },
                    url: NG.getProductLoginInfo().productAdr + "/rest/api/workflow/TaskInstance/Get",
                    reader: {
                        type: "json",
                        rootProperty: "data",
                        totalProperty: 'rowcount'
                    }
                },
                autoLoad: false
            });
        }

        var helpWin = Ext.create('Ext.Panel', {
            zIndex: 999,
            fullscreen: true,
            layout: {type: 'vbox'},
            items: [
                {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: helper.title || '选择',
                    items: [
                        {
                            ui: 'back',
                            align: 'left',
                            text: '',
                            width: 46,
                            style: 'padding-left:11px; width:46px;',
                            listeners: {
                                tap: function () {
                                    me.hideHelper();
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: 'searchfield',
                    placeHolder: '按编号或名称搜索',
                    padding: "13.5 10",
                    listeners: {
                        keyup: function (field) {
                            var value = field.getValue().trim(),
                                remote = store.getRemoteFilter(),
                                timeOut = remote ? 500 : 250;
                            if (field.timeIT) {
                                clearTimeout(field.timeIT);
                                field.timeIT = null;
                            }
                            field.timeIT = setTimeout(function () {
                                field.timeIT = null;
                                if (remote) {
                                    if (store.getProxy().getUrl()) {
                                        store.getProxy().setExtraParams({'filter': value});
                                        store.removeAll();
                                        Ext.Ajax.abort();
                                        store.loadPage(1);
                                    }
                                }
                                else {
                                    store.clearFilter(value.length > 0);
                                    if (value.length > 0) {
                                        var search = new RegExp(value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").trim(), 'i');
                                        store.filter(function (record) {
                                            var didMatch = false;
                                            Ext.each(['code', 'name'], function (fd) {
                                                if (search.test(record.get(fd))) {
                                                    didMatch = true;
                                                    return false;
                                                }
                                            });
                                            return didMatch;
                                        });
                                    }
                                }
                            }, timeOut);
                        },
                        clearicontap: function (field) {
                            if (store.getRemoteFilter()) {
                                store.removeAll();
                                store.getProxy().setExtraParams({});
                                store.loadPage(1);
                            }
                            else {
                                store.clearFilter();
                            }
                        }
                    }
                },
                {
                    flex: 1,
                    xtype: 'list',
                    plugins: helper.helpString.Type == 0 ? null : {
                        xclass: 'Ext.plugin.ListPaging',
                        loadMoreText: '',
                        noMoreRecordsText: '',
                        autoPaging: true
                    },
                    itemCls: "nglist",
                    itemHeight: 42,
                    disableSelection: true,
                    useSimpleItems: true,
                    onItemDisclosure: false,
                    variableHeights: false,
                    striped: false,
                    store: store,
                    itemTpl: [
                        '<div class="nowrap font15" style="width: 100%;height: 16px; line-height:16px;display: -webkit-box;-webkit-box-align: center; ">{name}&nbsp;<font color="#AAA9A9" style="font-size: 0.8125rem;">({code})</font></div>'
                    ],
                    listeners: {
                        itemtap: function (list, index, target, record, e, eOpts) {
                            me.setValue(record.get("name"));
                            fromValues.Value = record.get("code");
                            me.fireEvent('select', me, record);
                            me.hideHelper();
                        },
                        painted: function () {
                            if (!store.isLoaded() && !store.isLoading()) {
                                store.loadPage(1);
                            }
                        }
                    }
                }
            ]
        });

        me.lastActiveItem = Ext.Viewport.getActiveItem();
        Ext.Viewport.add(helpWin);
        Ext.Viewport.setActiveItem(helpWin);
        me.helper = helpWin;
    },
    hideHelper: function() {
        if(this.lastActiveItem) {
            Ext.Viewport.setActiveItem(this.lastActiveItem);
        }
        this.helper.destroy();
        this.helper = null;
    }
});

//帮助字段
Ext.define("com.newgrand.ngHelpField", {
    extend: 'Ext.field.Text',
    xtype: 'nghelpfield',
    alias: 'widget.nghelpfield',
    config: {
        cls: 'nopadding help-select',
        readOnly: true,
        helpIcon: true,
        editable: true,
        placeHolder: '',
        clearIcon: false,
        blueCls: 'blue-text',
        helper: null,
        placeHolder: '点击选择',
        valueAndText: ['', '']
    },
    initialize: function () {
        var editable = this.getEditable();
        if (!editable || !this.getHelpIcon()) {
            this.setCls('nopadding help-select noIcon');
        }
        if (editable) {
            this.setInputCls(this.getBlueCls());
            this.renderElement.on({
                tap: 'tap',
                scope: this
            });
        }
        this.callParent();
    },
    tap: function (com, target) {
        var me = this,
            valueConfig = {},
            value = me.getValue(),
            helper = me.getHelper();
        if (target && (target.className == "x-form-label" || target.parentElement.className == "x-form-label")) {
            return;
        }
        if (helper) {
            helper.codeField = helper.codeField || 'code';
            helper.textField = helper.textField || 'name';
            helper.title = helper.title || '选择';
            valueConfig[helper.codeField] = value;
            NG.showWindowList({
                title: helper.title,
                itemTpl: '<div class="font14" style="line-height: 24px;text-align:center;">{' + helper.textField + '}</div>',
                data: helper.data,
                value: valueConfig,
                callback: function (record) {
                    if (me.getValue() != record[helper.codeField]) { // 值改变触发
                        me.setValueAndText([record[helper.codeField], record[helper.textField]]);
                        helper.change && helper.change.call(me, record);
                    }
                }
            });
        } else {
            me.fireEvent("helpTap", me);
        }
    },
    updateValue: function (newValue) {
        this._value = newValue;
        this.syncEmptyCls();
    },
    getValue: function () {
        return this._value;
    },
    updateValueAndText: function (newVal, oldVal) {
        var component = this.getComponent(),
            newValue;
        if (Ext.isArray(newVal)) {
            this._value = newVal[0];
            newValue = newVal[1];

            if (component) {
                component.setValue(newValue);
            }

            if (newVal != oldVal) {
                this.fireEvent("change", this, newVal);
            }
            this.syncEmptyCls();
        }
    }
});

Ext.define("com.newgrand.ngViewText", {
    extend: 'Ext.Container',
    xtype: 'ngviewtext',
    alias: 'widget.ngviewtext',
    config: {
        labelWidth: 80,
        cls: '',
        label: '',
        value: '',
        style: 'background-color:#fff'
    },
    initialize: function () {
        var me = this,
            labelWidth = me.getLabelWidth(),
            label = me.getLabel(),
            value = me.getValue();
        me.setHtml(['<div class="font15" style="display:-webkit-box; padding: 0px;text-align:center; position: relative;">',
            '<div style="min-height: 30px; width: ', labelWidth, 'px; text-align:left;display: -webkit-box;-webkit-box-align: center;  color: #AAA9A9;">',
            label, '</div>',
            '<div class="ngviewtext-value" style="padding-left: 8px; -webkit-box-flex:1; text-align:left; word-break: break-all; word-wrap:break-word; display: -webkit-box; -webkit-box-align: center;-webkit-box-pack: start;">',
            value, '</div>', '</div>'].join(""));
        me.callParent(arguments);
    },
    updateValue: function(nValue,oValue) {
        var me = this,
            el = me.element.down("div.ngviewtext-value");
        if (el && nValue != oValue) {
            el.setHtml(nValue);
        }
    }
});

/*  处理横向滚动冲突问题  */
Ext.define("com.newgrand.ReportCarousel", {
    extend: 'Ext.Carousel',
    xtype: 'carouselux',
    alias: 'widget.carouselux',
    onDrag: function (e) {
        if (!this.isDragging) {
            return;
        }

        var startOffset = this.dragStartOffset,
            direction = this.getDirection(),
            delta = direction === 'horizontal' ? e.deltaX : e.deltaY,
            lastOffset = this.offset,
            flickStartTime = this.flickStartTime,
            dragDirection = this.dragDirection,
            now = Ext.Date.now(),
            currentActiveIndex = this.getActiveIndex(),
            maxIndex = this.getMaxItemIndex(),
            lastDragDirection = dragDirection,
            offset;

        if ((currentActiveIndex === 0 && delta > 0) || (currentActiveIndex === maxIndex && delta < 0)) {
            delta *= 0.5;
        }

        offset = startOffset + delta;
        if (delta > -250 && delta < 250) {
            return;
        }


        if (offset > lastOffset) {
            dragDirection = 1;
        }
        else if (offset < lastOffset) {
            dragDirection = -1;
        }

        if (dragDirection !== lastDragDirection || (now - flickStartTime) > 300) {
            this.flickStartOffset = lastOffset;
            this.flickStartTime = now;
        }

        this.dragDirection = dragDirection;

        this.setOffset(offset);
    }
});

Ext.define('com.newgrand.timePicker', {
    extend: 'Ext.DatePicker',
    xtype: 'timepickerux',
    alias: 'widget.timepickerux',
    requires: [
        'Ext.DateExtras',
        'Ext.util.InputBlocker'
    ],
    config: {
        defaults: {
            scrollable: {
                direction: 'vertical',
                directionLock: true,
                momentumEasing: {
                    momentum: {
                        acceleration: 30,
                        friction: 0.5
                    },
                    bounce: {
                        acceleration: 3,
                        springTension: 0.9999
                    },
                    minVelocity: 5
                },
                outOfBoundRestrictFactor: 0.1
            }
        },
        doneButton: {
            text: '确定',
            pressedCls:'datepicker-button-pressing',
            ui: 'action-white'
        },
        cancelButton: {
            text: '取消',
            pressedCls:'datepicker-button-pressing',
            ui: 'action-white'
        },
        hideOnMaskTap: true,
        height: 180,
        enter: 'top',
        exit: 'top',
        useTitles: false,
        top: 45,
        toolbarPosition: 'bottom',
        yearFrom: 2008,
        yearTo: new Date().getFullYear() + 10,
        monthText: '月',
        dayText: '日',
        yearText: '年',
        hourText:'时',
        minuteText:'分',
        slotOrder: ['year', 'month']
    },
    setValue: function(value, animated) { //设置默认定位当前日期
        if (!value) {
            value = new Date();
        }
        if(Ext.isDate(value)) {
            value = {
                day: value.getDate(),
                month: value.getMonth() + 1,
                year: value.getFullYear(),
                hour: value.getHours(),
                minute: value.getMinutes()
            };
            com.newgrand.timePicker.superclass.superclass.setValue.call(this, value, animated);
            this.onSlotPick();
        }
    },

    getValue: function(useDom) {
        var values = {},
            daysInMonth, day, hour, minute,
            items = this.getItems().items,
            ln = items.length,
            item, i;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item instanceof Ext.picker.Slot) {
                values[item.getName()] = item.getValue(useDom);
            }
        }
        daysInMonth = this.getDaysInMonth(values.month, values.year);
        day = Math.min(values.day, daysInMonth), hour = values.hour, minute = values.minute;


        var yearval = (isNaN(values.year)) ? new Date().getFullYear() : values.year,
            monthval = (isNaN(values.month)) ? (new Date().getMonth()) : (values.month - 1),
            dayval = (isNaN(day)) ? (new Date().getDate()) : day,
            hourval = (isNaN(hour)) ? new Date().getHours() : hour,
            minuteval = (isNaN(minute)) ? new Date().getMinutes() : minute;
        return new Date(yearval, monthval, dayval, hourval, minuteval);
    },

    createSlots: function () {
        var me = this,
            slotOrder = me.getSlotOrder(),
            slotOrderStr = slotOrder.join(","),
            yearsFrom = me.getYearFrom(),
            yearsTo = me.getYearTo(),
            years = [],
            days = [],
            minutes = [],
            hours = [],
            months = [],
            reverse = yearsFrom > yearsTo,
            ln, i, daysInMonth,
            yearName = "年",
            dayName = "日",
            monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

        if (slotOrder.length > 3) {
            me.setUseTitles(true);
            monthNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
            yearName = "";
            dayName = "";
        }

        if (slotOrderStr.indexOf("year") > -1) {
            while (yearsFrom) {
                years.push({
                    text: yearsFrom + yearName,
                    value: yearsFrom
                });

                if (yearsFrom === yearsTo) {
                    break;
                }

                if (reverse) {
                    yearsFrom--;
                } else {
                    yearsFrom++;
                }
            }
        }
        if (slotOrderStr.indexOf("month") > -1) {
            for (i = 0, ln = monthNames.length; i < ln; i++) {
                months.push({
                    text: monthNames[i],
                    value: i + 1
                });
            }
        }
        if (slotOrderStr.indexOf("day") > -1) {
            daysInMonth = me.getDaysInMonth(1, new Date().getFullYear());
            for (i = 0; i < daysInMonth; i++) {
                days.push({
                    text: i + 1 + dayName,
                    value: i + 1
                });
            }
        }
        if (slotOrderStr.indexOf("hour") > -1) {
            for (i = 0; i < 24; i++) {
                hours.push({
                    text: i,
                    value: i
                });
            }
        }
        if (slotOrderStr.indexOf("minute") > -1) {
            for (i = 0; i < 60; i++) {
                minutes.push({
                    text: i,
                    value: i
                });
            }
        }

        var slots = [];

        slotOrder.forEach(function (item) {
            slots.push(me.createSlot(item, days, months, years, hours, minutes));
        });
        me.setSlots(slots);
    },
    onSlotPick: function() {
        if(this.getUseTitles()){
            this.callParent(arguments);
            return;
        }
        var value = this.getValue(true),
            slot = this.getDaySlot(),
            year = value.getFullYear(),
            month = value.getMonth(),
            days = [],
            daysInMonth, i;

        if (!value || !Ext.isDate(value) || !slot) {
            return;
        }

        //get the new days of the month for this new date
        daysInMonth = this.getDaysInMonth(month + 1, year);
        for (i = 0; i < daysInMonth; i++) {
            days.push({
                text: i + 1 + '日', //为了这个日，重写了这个方法，代价有点。。。。
                value: i + 1
            });
        }

        // We don't need to update the slot days unless it has changed
        if (slot.getStore().getCount() == days.length) {
            this.callParent(arguments);
            return;
        }

        slot.getStore().setData(days);

        this.callParent(arguments);

        // Now we have the correct amount of days for the day slot, lets update it
        var store = slot.getStore(),
            viewItems = slot.getViewItems(),
            valueField = slot.getValueField(),
            index, item;

        index = store.find(valueField, value.getDate());
        if (index == -1) {
            return;
        }

        item = Ext.get(viewItems[index]);

        slot.selectedIndex = index;
        slot.scrollToItem(item);
        slot.setValue(slot.getValue(true));
    },
    createSlot: function(name, days, months, years, hours, minutes) {
        switch (name) {
            case 'year':
                return {
                    name: 'year',
                    align: 'center',
                    data: years,
                    title: this.getYearText(),
                    flex: 3
                };
            case 'month':
                return {
                    name: name,
                    align: 'center',
                    data: months,
                    title: this.getMonthText(),
                    flex: 3
                };
            case 'day':
                return {
                    name: 'day',
                    align: 'center',
                    data: days,
                    title: this.getDayText(),
                    flex: 3
                };
            case 'hour':
                return {
                    name: 'hour',
                    align: 'center',
                    data: hours,
                    title: this.getHourText(),
                    flex: 3
                };
            case 'minute':
                return {
                    name: 'minute',
                    align: 'center',
                    data: minutes,
                    title: this.getMinuteText(),
                    flex: 3
                };
        }
    },
    onDoneButtonTap: function() {
        var me = this;
        me.callParent();
        if(!me.getHidden()) {
            me.setHidden(true);
        }
    },
    onCancelButtonTap:function(){
        var me = this;
        me.callParent();
        if(!me.getHidden()) {
            me.setHidden(true);
        }
    }
});

Ext.define('com.newgrand.Datefieldux', {
    extend: 'Ext.field.DatePicker',
    xtype: 'datefieldux',
    alias: 'widget.datefieldux',
    require: [
        'Ext.picker.Date',
        'Ext.DateExtras'
    ],
    config: {
        destroyPickerOnHide: true,
        dateFormat: 'Y年m月',
        textAlign: null,
        isNull: false,
        picker: {
            xtype: 'timepickerux'
        }
    },
    initialize: function () {
        var me = this,
            value = me.getValue(),
            textAlign = me.getTextAlign(),
            component = me.getComponent();

        if(!me.getIsNull()) {
            (value === null) && me.setValue(new Date());
        }
        else {
            me.setValue(null);
        }

        me.renderElement.on({
            tap: 'onMaskTap',
            scope: this
        });

        component.doMaskTap = Ext.emptyFn;

        if (Ext.browser.is.AndroidStock2) {
            component.input.dom.disabled = true;
        }

        if (textAlign == "right") {
            component.input.setStyle({
                'text-align': 'right',
                'padding-right': '28px'
            });
        }
    },
    applyValue: function(value) {
        if (!Ext.isDate(value) && !Ext.isObject(value)) {
            return value ? new Date(value) : null;
        }
        if (Ext.isObject(value)) {
            return new Date(value.year, value.month - 1, value.day);
        }
        return value;
    },
    onMaskTap: function (com, target) { //解决iOS点击箭头无效的问题
        if (target && (target.className == "x-form-label" || target.parentElement.className == "x-form-label")) {
            return;
        }
        this.callParent()
    }
});

/**
**切换报表
**/
Ext.define("com.newgrand.changemodebutton", {
    extend: 'Ext.Container',
    xtype: 'changemodebutton',
    alias: 'widget.changemodebutton',
    requires: ['Ext.data.Store'],
    config: {
        downStyle: '<div style="border-left: 5px solid transparent; border-right: 5px solid transparent;border-top: 6px solid #000000;top: 10px;left: 3px;position: relative;"></div>',
        upStyle: '<div style="border-left: 5px solid transparent; border-right: 5px solid transparent;border-bottom: 6px solid #000000;top: 10px;left: 3px;position: relative;"></div>',
        layout: {
            type: 'hbox'
        },
        icon: '', //'resources/images/work/fclose.png',
        openIcon: '', // 'resources/images/work/fopen.png',
        hideOnBankTap: true, //点击空白区域隐藏
        selectItem: null,
        text: '',
        textField: '',
        viewTpl: '',
        viewData: [],
        proxy: {
            url: '',
            params: {
            }
        },
        direction: 'top' //可以是left
    },

    /*
    *初始化
    */
    initialize: function () {
        var me = this,
            icon = me.getIcon(),
            items = [];
        me.callParent();
        me.expand = false;
        if (!me.getViewTpl()) {
            me.setViewTpl("<div>{" + me.getTextField() + "}</div>");
        }
        if (icon) {
            items.push({
                xtype: 'image',
                src: icon,
                width: '21px',
                height: '21px',
                style: 'background-size: contain;margin-left: 3px;'
            });
        }
        items.push({
            style: ' margin-top: 3px;margin-left: 3px; margin-right: 2px;',
            html: me.getText()
        });
        items.push({
            html: me.getDownStyle()
        });
        me.setItems(items);
        var orientationchange = function () {
            me.pageOrientationChange();
        };
        me.element.addListener("touchend", function () {
            if (me.expand) {
                me.hidePanel();
            }
            else {
                me.showPanel();
            }
        });
        me.addListener("destroy", function () {
            if (me.actionSheet) {
                me.actionSheet.destroy();
                me.actionSheet = null;
            }
            if (me.BankMasked) {
                me.BankMasked.destroy();
                me.BankMasked = null;
            }
            window.removeEventListener("resize", orientationchange);
        });
        me.addListener("erased", function () {
            if (me.actionSheet && me.expand) {
                me.hidePanel();
            }
        }); //特殊情况下拉界面无法消失的问题
        window.addEventListener("resize", orientationchange);
    },

    /*
    * 旋转屏幕 private
    */
    pageOrientationChange: function () {
        var me = this,
            viewData = me.getViewData();
        if (me.actionSheet && viewData && viewData.length > 0) {
            me.loadViewItems();
        }
    },

    /*
    * 更新文字描述 private
    */
    updateText: function (text) {
        var me = this,
            textContainer = me.getComponent(1);
        if (textContainer) {
            textContainer.updateHtml(text);
        }
    },

    /*
    * 获取屏幕的状态（横屏或竖屏）
    */
    getOrientation: function () {
        var width = Ext.Viewport.bodyElement.getWidth(),
            height = Ext.Viewport.bodyElement.getHeight();
        if (width > height) {
            return "landscape";  //横屏
        }
        return "portrait";
    },

    /*
    *显示选择框
    */
    showPanel: function () {
        var me = this,
            actionSheet = me.actionSheet,
            masked = me.BankMasked,
            direction = me.getDirection(),
            pageBox = me.element.getParent().getPageBox(),
            showdir = "top",
            hidedir = "top",
            width = "100%",
            height,
            top,
            vh = Ext.Viewport.bodyElement.getHeight() - pageBox.bottom;
        var tbUI = "action-black";
        var imgUI = "action-black";
        var chartUI = "action-black";
        if (me.actionSheet) {
            me.actionSheet.down('button[name="btnChart"]').setUi('action-black');
            me.actionSheet.down('button[name="btnImage"]').setUi('action-black');
            me.actionSheet.down('button[name="btnTable"]').setUi('action-black');
        }
        if (me.ViewMode) {
            switch (me.ViewMode) {
                case me.ReportViewMode.Table:
                    tbUI = "action-gray";
                    if (me.actionSheet) me.actionSheet.down('button[name="btnTable"]').setUi('action-gray');
                    break;
                case me.ReportViewMode.Image:
                    imgUI = "action-gray";
                    if (me.actionSheet) me.actionSheet.down('button[name="btnImage"]').setUi('action-gray');
                    break;
                default:
                    chartUI = "action-gray";
                    if (me.actionSheet) me.actionSheet.down('button[name="btnChart"]').setUi('action-gray');
                    break;
            }
        }
        else {
            chartUI = "action-gray";
            if (me.actionSheet) me.actionSheet.down('button[name="btnChart"]').setUi('action-gray');
        }
        me.expand = true;
        me.getComponent(1).updateHtml(me.getUpStyle());
        //        me.getComponent(0).setSrc(me.getOpenIcon());
        if (!actionSheet) {
            var parentEl = Ext.Viewport.bodyElement;
            if (direction == "left") {
                showdir = "right";
                hidedir = "left";
                width = 140;
                height = vh;
            }
            else {
                height = 65;
            }
            top = (height - 46) / 2;
            if (me.getHideOnBankTap()) {
                me.BankMasked = masked = Ext.create('Ext.Container', {
                    renderTo: parentEl,
                    width: '100%',
                    height: '100%',
                    style: {
                        "background-color": "transparent"
                    },
                    top: 0
                });
                masked.element.addListener("touchend", function () {
                    me.hidePanel();
                });
            }
            actionSheet = Ext.create('Ext.Container', {
                renderTo: parentEl,
                width: width,
                height: height,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [

                    {
                        xtype: 'panel',
                        layout: 'hbox',
                        style: {
                            "background-color": "#ebebeb"
                        },
                        items: [
                            {
                                xtype: 'button',
                                name: 'arrowLeft', ui: 'action-black',
                                iconCls: 'arrow_left',
                                cls: 'my-gray',
                                style: {
                                    'border-radius': '0px', 'border': '0px',
                                    'border-bottom': '2px groove #FFFFFF', 'border-right': '2px groove #FFFFFF'


                                },
                                flex: 1,
                                handler: function () {
                                    me.setLastSheet();
                                    //                                me.hidePanel();
                                }
                            },

                            {
                                xtype: 'button',
                                ui: 'action-black',
                                name: 'sheetNameBtn',
                                text: me.reportData[me.currentIndex].sheetname,
                                cls: 'my-gray',
                                style: {                                   
                                    'border-radius': '0px',
                                    'border': '0px',
                                    'border-bottom': '2px groove #FFFFFF',
                                    'padding-top': '5px',
                                    'align': 'center', 'border-right': '2px groove #FFFFFF'
                                },
                                flex: 3

                            }
                            ,
                            {
                                xtype: 'button',
                                name: 'arrowRight',
                                ui: 'action-black',
                                iconCls: 'arrow_right',
                                cls: 'my-gray',
                                style: {
                                    'border-radius': '0px', 'border': '0px', 'border-bottom': '2px groove #FFFFFF'


                                },
                                flex: 1,
                                handler: function () {
                                    me.setNextSheet();
                                    //                                me.hidePanel();
                                }
                            }
                        ],
                        clearIcon: true
                    },
                    {
                        xtype: 'panel',
                        layout: 'hbox',
                        style: {
                            "background-color": "#ebebeb"
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: '图形',
                                name: 'btnImage',
                                ui: imgUI,
                                cls: 'my-gray',
                                style: {
                                    'border': '0px',
                                    'border-radius': '0px',
                                    'border-right': '2px groove #FFFFFF'
                                },
                                flex: 1,
                                //                            badgeText: imgBadgeText,
                                handler: function (targert, e, eOpts) {
                                    me.getMode({ mode: me.ReportViewMode.Image, itemData: me.reportData[me.currentIndex] });
                                    //                                me.hidePanel();
                                }
                            },
                            {
                                xtype: 'button',
                                name: 'btnTable',
                                text: '表格',
                                ui: tbUI,
                                cls: 'my-gray',
                                style: {
                                    'border': '0px',
                                    'border-radius': '0px',
                                    'border-right': '2px groove #FFFFFF'
                                },
                                //                            badgeText:tbBadgeText,
                                flex: 1,
                                handler: function (targert, e, eOpts) {
                                    me.getMode({ mode: me.ReportViewMode.Table, itemData: me.reportData[me.currentIndex] });
                                    //                                me.hidePanel();
                                }
                            },
                            {
                                xtype: 'button',
                                name: 'btnChart',
                                text: '所有',
                                ui: chartUI,
                                cls: 'my-gray',
                                style: {
                                    'border': '0px',
                                    'border-radius': '0px'
                                },
                                //                            badgeText: chartBadgeText,
                                flex: 1,
                                handler: function (targert, e, eOpts) {
                                    me.getMode({ mode: me.ReportViewMode.Chart, itemData: me.reportData[me.currentIndex] });
                                    //                                me.hidePanel();
                                }
                            }
                        ],
                        clearIcon: true
                    }

                ],
                hidden: true,
                top: pageBox.bottom,
                showAnimation: {
                    type: 'slideIn',
                    direction: showdir
                },
                hideAnimation: {
                    type: 'slideOut',
                    direction: hidedir
                },
                cls: 'my-gray',
                style: {
                    'border-top': '2px groove #FFFFFF'
                }
            });
            me.actionSheet = actionSheet;
        }
        else if (vh < me.viewHeight) {
            me.actionSheet.setScrollable(true);
        }
        me.actionSheet.down('button[name="sheetNameBtn"]').setText(me.reportData[me.currentIndex].sheetname);
        if (masked) {
            masked.show();
        }
        actionSheet.show();
    },

    /*
    *隐藏选择框
    */
    hidePanel: function () {
        var me = this,
            actionSheet = me.actionSheet,
            masked = me.BankMasked,
            text = me.getComponent(1);
        me.expand = false;
        if (text) {
            text.updateHtml(me.getDownStyle());
            //            me.getComponent(0).setSrc(me.getIcon());
        }
        if (actionSheet) {
            actionSheet.hide();
        }
        if (masked) {
            masked.hide();
        }
    },

    ReportViewMode: {
        Chart: 'Chart', // 图表
        Table: 'Table', // 表格
        Image: 'Image'// 图形
    },

    setLastSheet: function () {
        var me = this;
        if (me.reportData.length == 0) {
            return;
        }
        if (me.currentIndex == 0) {            
            NG.alert('当前为第一页!', 1500);
            return;
        }
        else {
            me.currentIndex = me.currentIndex - 1;
        }
        me.actionSheet.down('button[name="sheetNameBtn"]').setText(me.reportData[me.currentIndex].sheetname);
        me.ViewMode = me.ReportViewMode.Chart;
        me.getMode({ mode: me.ViewMode, itemData: me.reportData[me.currentIndex] });
    },

    setNextSheet: function () {
        var me = this;
        if (me.reportData.length == 0) {
            return;
        }
        if (me.currentIndex + 1 == me.reportData.length) {            
            NG.alert('当前为最后一页!', 1500);
            return;
        }
        else {
            me.currentIndex = me.currentIndex + 1;
        }
        me.actionSheet.down('button[name="sheetNameBtn"]').setText(me.reportData[me.currentIndex].sheetname);
        me.ViewMode = me.ReportViewMode.Chart;
        me.getMode({ mode: me.ViewMode, itemData: me.reportData[me.currentIndex] });
    },

    getMode: function (data) {
        var me = this;
        me.ViewMode = data.mode;
        if (!(me.fireEvent("tap", me, data, 1, 2) === false)) {
            //            me.hidePanel();
            if (me.actionSheet) {
                me.actionSheet.down('button[name="btnChart"]').setUi('action-black');
                me.actionSheet.down('button[name="btnImage"]').setUi('action-black');
                me.actionSheet.down('button[name="btnTable"]').setUi('action-black');
            }
            if (me.ViewMode) {
                switch (me.ViewMode) {
                    case me.ReportViewMode.Table:
                        var tbUI = "action-gray";
                        if (me.actionSheet) me.actionSheet.down('button[name="btnTable"]').setUi('action-gray');
                        break;
                    case me.ReportViewMode.Image:
                        var imgUI = "action-gray";
                        if (me.actionSheet) me.actionSheet.down('button[name="btnImage"]').setUi('action-gray');
                        break;
                    default:
                        var chartUI = "action-gray";
                        if (me.actionSheet) me.actionSheet.down('button[name="btnChart"]').setUi('action-gray');
                        break;
                }
            }
        }
    }
});
