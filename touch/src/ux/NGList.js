/**
 * Created by ibm on 2015/7/17.
 */
Ext.define('Ext.ux.NGList', {
    extend: 'Ext.dataview.List',
    xtype: 'nglist',
    alias: 'widget.nglist',
    config: {
        itemCls: 'nglist',
        variableHeights: false,
        striped: false,
        useHeaders: false,
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        disableSelection: true,
        useSimpleItems: true,
        onItemDisclosure: false,
        rightBtn: null //配置左滑按钮 {text:'删除'， width:''， delegate:'x-innerhtml'} , 事件响应同单击itemtap事件，此时arguments[5]=="rightBtn"
    },
    initialize: function () {
        var rightBtn = this.getRightBtn(),
            multiItems = false;
        this.callParent(arguments);
        if (rightBtn) {
            if (rightBtn === true) {
                rightBtn = {};
            }
            /* rightBtn= {  // 支持多项菜单
             width: 240,
             items: [
             {
             style: 'background-color: #aaa9a9;',
             cls: 'zd', //itemtap 事件，通过e.target.className判断事件触发
             text: '更多'
             },
             {
             cls: 'yd',
             style: 'background-color: rgb(249, 180, 0);',
             width: 80,
             text: '标为已读'
             },
             {
             cls: 'sc',
             text: '删除',
             flex:2
             }
             ]
             };*/
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
                delegate: 'x-innerhtml'
            });
            this.element.on({
                scope: this,
                delegate: '.x-list-item .' + rightBtn.delegate,
                dragstart: function (e) {
                    debugger;
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
                    if (target && target.className.indexOf(rightBtn.delegate) > -1 && x < 0 && absX > absY && absX <= rightBtn.width && me.lastDragX >= me.btnX) {
                        if (me.fireEvent("beforeSwipe", me, rightBtn, me.getTouchIndex(target)) === false) {
                            return;
                        }
                        me.isDragging = true;addListener
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
                    debugger;
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
                    debugger;
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
                                    if (this.inListContainer(e.target)) {
                                        e.stopEvent();
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

    /*
     * 功能描述：当前目标是否包含在list视图里面
     */
    inListContainer: function (target) {
        var container = this.scrollElement.parent(),
            cls = target.className.replace(/ /g, '.'),
            selector = [target.tagName.toLowerCase()];
        if (container) {
            if (target.id) {
                selector.push('#' + target.id);
            }
            if (cls) {
                selector.push('.');
                selector.push(cls);
            }
            selector = selector.join('');
            if (container.down(selector)) {
                return true;
            }
        }
        return false;
    },

    /*
     * 功能描述：获取当前touch的item索引
     */
    getTouchIndex: function(target) {
        while (target && target.className.indexOf(" x-list-item ") < 0) {
            target = target.parentElement;
        }
        if (target && target.id) {
            return this.getViewItems().indexOf(Ext.getCmp(target.id));
        }
        return -1;
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