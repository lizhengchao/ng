/*
* Ext.ux.ImageViewer
* add by jt
* Date: 2014-4-16
*
*/
Ext.define('Ext.ux.ImageViewer', {
    extend: 'Ext.Container',
    xtype: 'imageviewer',
    alias: 'widget.imageviewer',

    config: {
        maxScale: 3,
        minScale: 0.3,
        drag: true,
        cls:'x-img',
        src: '',
        filename: '',
        html: '<img>',
        listeners: {
            destroy: function () {
                this.destroyImg();
            }
        }
    },

    initialize: function () {
        var me = this,
            viewportWidth = Ext.Viewport.element.getWidth(),
            viewportHeight = Ext.Viewport.element.getHeight();

        me.NewAdd = true;
        me.ImgURLs = {};
        me.scale = me.baseScale = 1;
        me.viewportWidth = viewportWidth;
        me.viewportHeight = viewportHeight;
        me.loadImage();

        var orientationchange = function(){
           me.orientationChange();
        };
        me.addListener("destroy", function () {
            window.removeEventListener("resize", orientationchange);
        });
        window.addEventListener("resize", orientationchange);
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

    orientationChange:function() {
        var me = this,
            orienta = me.getOrientation();
        me.viewportWidth = Ext.Viewport.bodyElement.getWidth();
        me.viewportHeight = Ext.Viewport.bodyElement.getHeight();
        if (orienta == "landscape") {  //横屏
            me.startWidth = (Math.min(me.viewportHeight, me.imgHeight) / me.imgHeight) * me.imgWidth;
        }
        else {
            me.startWidth = Math.min(me.viewportWidth, me.imgWidth);
        }
        if (me.startWidth) {
            me.setImgWidth(me.startWidth);
            me.initDraggable(me.startWidth, me.scale * me.imgHeight,true,true);
        }
    },

    showImg: function () {
        var me = this,
            parentContainer = me.getParent() || me;
        if (me.NewAdd) {
            me.NewAdd = false;
            parentContainer.element.addListener({
                scope: parentContainer,
                singletap: function (e, t) {
                    if (me.actionSheet && !me.actionSheet.getHidden() || me.LongPressed) {
                        me.LongPressed = false;
                        return;
                    }
                    this.destroy();
                }
            });
        }
        else {
            if (me.getSrc() != me.imgEl.dom.naturalSrc) {
                me.loadImage();
            }
        }
    },

    destroyImg:function(){
        var me = this,
            loading = me.loading,
            ash = me.actionSheet;
        if(loading) {
            loading.destroy();
            loading = null;
        }
        if(ash) {
            ash.destroy();
            ash = null;
        }
    },

    clearImage: function(){
        this.imgEl.dom.src = "";
    },

    showWaiting:function(show){
        var me = this;
        if(show) {
            me.loading = Ext.create('Ext.Img', {
                renderTo: Ext.getBody(),
                src: 'resources/images/spinner_loading.png',
                height: 42,
                width: 42,
                style: {
                    'position': 'absolute',
                    'top': '50%',
                    'margin-top': '-21px',
                    'left': '50%',
                    'margin-left': '-21px',
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
    },

    loadImage: function () {
        var me = this,
            url = me.getSrc(), sInt = url.indexOf(";"), tmpName = "", matchs,
            orienta = me.getOrientation();
        me.showWaiting(true);
        me.updateHtml('<span style="display:table-cell;vertical-align:middle;"><img></span>');
        me.imgEl = me.element.down('img');
        me.imgEl.dom.src = me.ImgURLs[url] || url;
        me.imgEl.dom.naturalSrc = url;
        me.imgEl.dom.onload = function () {
            me.showWaiting(false);
            me.imgWidth = me.imgEl.dom.width;
            me.imgHeight = me.imgEl.dom.height;
            if (orienta == "landscape") {  //横屏
                me.startWidth = (Math.min(me.viewportHeight, me.imgHeight) / me.imgHeight) * me.imgWidth;
            }
            else {
                me.startWidth = Math.min(me.viewportWidth, me.imgWidth);
            }
            me.setImgWidth(me.startWidth);
            me.setMinScale(Math.min(1, me.scale));
            me.initDraggable(me.startWidth, me.scale * me.imgHeight);
            me.imgEl.clearListeners();
            me.imgEl.addListener({
                scope: me,
                doubletap: function (e, t) {
                    if (this.getImgWidth() != parseInt(this.startWidth)) {
                        this.setImgWidth(this.startWidth);
                    }
                    else {
                        this.setImgWidth(this.imgWidth);
                    }
                    this.initDraggable(null, null, true, true);
                },
                longpress: me.downLoadImg,
                pinchstart: me.onImagePinchStart,
                pinch: me.onImagePinch,
                pinchend: me.onImagePinchEnd
            });
        };
        me.imgEl.dom.onerror = function () {
            var tmpsrc = me.imgEl.dom.src;
            if (tmpsrc == "http://127.0.0.1/app/" || tmpsrc == "" || tmpsrc.indexOf("index.html") > -1) { //ios下图片为空显示的是页面地址
                return;
            }
            else if (tmpsrc == me.ImgURLs[url]) {
                me.imgEl.dom.src = url;
            }
            else {
                NG.alert("图片加载失败.");
                me.showWaiting(false);
                NG.sysLog("图片加载失败-->url地址为" + me.imgEl.dom.src, NG.LogType.OPERATION);
            }
        };
        if (window.cordovaFileDirEntry) {
            if (me.getFilename()) {
                tmpName = me.getFilename();
            }
            else {
                if (sInt > 0) {
                    tmpName = url.substring(0, sInt).replace("data:image/", new Date().valueOf() + ".");
                }
                else {
                    matchs = url.match(/^.*\/(.*)\.(\w*\?*\w*)$/);
                    if(!matchs){
                        me.imgPath = [window.cordovaFileDirEntry.fullPath, "/image/", new Date().valueOf()].join("");
                        return;
                    }
                    var ext = matchs[2];
                    if (!ext) {
                        return;
                    }
                    ext = ext.split("?")[0];
                    tmpName = [matchs[1], ".", ext].join("");
                }
            }
            me.imgPath = [window.cordovaFileDirEntry.fullPath, "/image/", tmpName].join("");
        }
    },

    downLoadImg:function() {
        var me = this;
        if(!me.imgPath){
            NG.alert("无法下载指定的文件路径：" + me.getSrc(), 3000);
            me.LongPressed = true;
            return;
        }
        if (!me.actionSheet) {
            me.actionSheet = Ext.create('Ext.ActionSheet', {
                border: 0,
                style: 'border-radius:4px 4px 4px 4px;margin:0px 5px 5px 5px;background-color:#666;',
                items: [
                    {
                        text: '保存到本地',
                        ui: 'action-black',
                        listeners: {
                            tap: function () {
                                var ash = me.actionSheet;
                                if (!window.cordovaFileDirEntry) {
                                    NG.alert("插件初始化失败.");
                                }
                                else {
                                    var url = me.getSrc(), fileTransfer;
                                    var downFunc = function () {
                                        me.showWaiting(true);
                                        if (Ext.os.is("iOS")) {
                                            window.PhotoAlbum.saveImageToAlbum(url, "i6p", function (entry) {
                                                me.showWaiting(false);
                                                NG.alert("保存成功.");
                                                /*            if (url.indexOf("http") == 0) {
                                                 me.ImgURLs[url] = me.imgPath;
                                                 }*/
                                            }, function (error) {
                                                NG.alert("下载出错: " + url.length > 50 ? url.substring(0, 50) : url, 3000);
                                            });
                                        }
                                        else {
                                            fileTransfer = new FileTransfer();
                                            fileTransfer.download(
                                                url,
                                                me.imgPath,
                                                function (entry) {
                                                    me.showWaiting(false);
                                                    NG.alert("图片已保存至" + entry.fullPath);
                                                    if (url.indexOf("http") == 0) {
                                                        me.ImgURLs[url] = entry.fullPath;
                                                    }
                                                },
                                                function (error) {
                                                    me.showWaiting(false);
                                                    NG.alert("下载出错: " + url.length > 50 ? url.substring(0, 50) : url, 3000);
                                                }
                                            );
                                        }
                                    };
                                    if (me.ImgURLs[url]) {
                                        Ext.Msg.confirm('提示', '图片已经下载，是否重新下载？', function (buttonId, value, opt) {
                                            if (buttonId === "yes") {
                                                downFunc();
                                            }
                                        });
                                    }
                                    else {
                                        downFunc();
                                    }
                                }
                                ash.setHidden(true);
                            }
                        }
                    },
                    {
                        text: '取消',
                        ui: 'action-black',
                        listeners: {
                            tap: function () {
                                var ash = me.actionSheet;
                                ash.setHidden(true);
                            }
                        }
                    }
                ]
            });
            Ext.Viewport.add(me.actionSheet);
        }
        me.actionSheet.setHidden(false);;
    },

    setDragDisabled: function (disabled) {
        var me = this,
            dragObj = me.getDraggable();
        if (dragObj) {
            dragObj.setDisabled(disabled);
        }
    },

    initDraggable: function (initWidth, initHeight, initialOffset,initDrag) {
        var me = this,
            width = initWidth || me.imgEl.dom.width,
            height = initHeight || me.imgEl.dom.height,
            offsetY = me.viewportHeight > height ? (me.viewportHeight - height) / 2 : 0,
            minX = width > me.viewportWidth ? me.viewportWidth - width : 0,
            minY = height > me.viewportHeight ? (me.viewportHeight - height) : 0,
            maxX = width > me.viewportWidth ? 0 : me.viewportWidth - width,
            maxY = height > me.viewportHeight ? 0 : me.viewportHeight - height;
        minY = minY - offsetY;
        maxY = maxY - offsetY;
        if (me.getDrag()) {
            if(initialOffset && initDrag){
                me.setDraggable({
                    initialOffset:{ x: 0, y: 0 },
                    constraint: {
                        min: { x: minX - 50, y: minY - 50 },
                        max: { x: maxX + 50, y: maxY + 50 }
                    }
                });
            }
            else if (initialOffset) {
                me.getDraggable().setInitialOffset({ x: 0, y: 0 });
            }
            else {
                me.setDraggable({
                    constraint: {
                        min: { x: minX - 50, y: minY - 50 },
                        max: { x: maxX + 50, y: maxY + 50 }
                    }
                });
            }
        }
    },

    getImgWidth: function () {
        return this.imgEl.dom.width;
    },

    setImgWidth: function (width) {
        var me = this;
        me.imgEl.dom.width = width;
        me.scale = width / me.imgWidth;
    },

    onImagePinchStart: function (ev) {
        var me = this;
        me.startScale = me.scale;
        if (me.PinchEndTimeID) {
            window.clearTimeout(me.PinchEndTimeID);
            me.PinchEndTimeID = null;
        }
        else {
            me.setDragDisabled(true);
        }
    },

    onImagePinch: function (ev) {
        var me = this;
        me.scale = Ext.Number.constrain(ev.scale * me.startScale, me.getMinScale(), me.getMaxScale());
        me.setImgWidth(me.imgWidth * me.scale);
        //me.initDraggable(me.imgWidth * me.scale, me.imgHeight * me.scale, true);
    },

    onImagePinchEnd: function (ev) {
        var me = this;
        me.PinchEndTimeID = window.setTimeout(function () {
            me.setDragDisabled(false);
            me.PinchEndTimeID = null;
            if (me.startScale != me.scale) {
                me.initDraggable();
            }
        }, 300);
    }
});