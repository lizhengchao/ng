(function (window) {
    var NG = {

        //当前版本
        version: '1.100.6a',

        //文件图标对应关系表
        iconMap: {
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
        },

        /**
         * 功能描述：替换url地址到esb
         * url:请求地址
         **/
        replaceURL: function (url) {
            if (url.toLowerCase().indexOf("http://") > -1 || url.toLowerCase().indexOf("https://") > -1) {
                url = url.replace(/http[s]?:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?\/((i6[p]?[m]?[i]?[1|2|3]?)|(a3))/gi, NG.getProductLoginInfo().productAdr + "/rest");
            }
            if (url.indexOf("/") === 0) {
                url = url.replace(/^\/((i6[p]?[m]?[i]?[1|2|3]?)|(a3))\//gi, NG.getProductLoginInfo().productAdr + '/rest/');
            }
            return url.replace(/"\/((i6[p]?[m]?[i]?[1|2|3]?)|(a3))\//gi, '"' + NG.getProductLoginInfo().productAdr + '/rest/');
        },

        /**
         * 功能描述：设置等待界面
         * isWaiting:是否等待
         * waitMsg:等待信息
         **/
        setWaiting: function (isWaiting, waitMsg, container) {
            var isContainer = true;
            if (!container) {
                isContainer = false;
                container = Ext.Viewport;
            }

            var masked = container.getMasked();
            if (masked) {
                masked.destroy();
                masked = null;
                masked = null;
            }
            if (NG.btnToBack) {
                NG.btnToBack.destroy();
                NG.btnToBack = null;
            }
     /*       if (NG.NGWaitingIT) {
                window.clearTimeout(NG.NGWaitingIT);
                NG.NGWaitingIT = null;
            }*/
            if (isWaiting) {
                NG.NGWaiting = true;
                container.setMasked({
                    xtype: 'loadmask',
                    zIndex: 9998,
                    message: waitMsg || 'Loading...'
                });
                if (!isContainer) {
                    // 添加一块返回区域，方便iOS返回
                    NG.btnToBack = Ext.create("Ext.Label", {
                        xtype: 'label',
                        style: 'top:0px; left:0px; height:46px; width:55px; z-index:9999; position: absolute;',
                        renderTo: Ext.Viewport.element
                    });
                    NG.btnToBack.element.on({
                        tap: function () {
                            var el = this;
                            el.addCls('x-button-pressed');
                            Ext.defer(function () {  //增加点击事件的触感
                                el.removeCls('x-button-pressed');
                                Ext.Ajax.abort();
                                NG.setWaiting(false);
                            }, 80, el);
                        },
                        scope: NG.btnToBack.element
                    });
                }
/*                NG.NGWaitingIT = window.setTimeout(function () {
                    if (NG.NGWaiting) {
                        NG.setWaiting(false);
                    }
                }, 30000);*/
            } else {
                NG.NGWaiting = false;
            }
        },

        /**
         * 功能描述：获取特定用户的头像
         * controller:调用该方法的controller
         * jid：用户jid
         * callback:回调函数
         * isWhite: true标识使用白色的默认头像
         */
        getHeadshot: function (controller, jid, callback, isWhite, timestamp) {
            if (jid.indexOf('@') < 0) {
                jid = jid + '@' + GLOBAL_CONFIG.HostName;
            } else { //不知道为什么会带 /netcall
                jid = jid.replace("/netcall", "");
            }
            callback = callback || Ext.emptyFn;
            timestamp = timestamp || controller.timestamp;
            var logInfo = NG.getProductLoginInfo(),
                execFn, execFn1,
                pid = jid.replace("@" + GLOBAL_CONFIG.HostName, ""),
                headshot = isWhite ? 'resources/images/headshots/22.png' : 'resources/images/headshots/2.png';
            execFn1 = function (tmpData, controller, jid, timestamp) {
                if (timestamp) {
                    controller.headMaps = controller.headMaps || {};
                    controller.headMaps[timestamp] = controller.headMaps[timestamp] || {};
                    controller.headMaps[timestamp][jid] = tmpData;
                }
                if (NG.GetHeadHandlers[jid]) {
                    var callbackHandler = NG.GetHeadHandlers[jid];
                    NG.GetHeadHandlers[jid] = null;
                    for (var j = 0, k = callbackHandler.length; j < k; j++) {
                        callbackHandler[j](tmpData.headshot, tmpData.name, tmpData.tel);
                    }
                    callbackHandler = null;
                }
            };
            execFn = function (controller, jid, timestamp) {
                if (!NG.GetHeadHandlers) {
                    NG.GetHeadHandlers = {};
                }
                NG.GetHeadHandlers[jid] = NG.GetHeadHandlers[jid] || [];
                if (NG.GetHeadHandlers[jid].length > 0) {
                    NG.GetHeadHandlers[jid].push(callback);
                    return;
                }
                NG.GetHeadHandlers[jid].push(callback);
                NG.dbManager.excuteSql("select id,headshot,name,tel,email from person_detail where eno=? and jid=?", [logInfo.eNo, jid], function (data) {
                    if (data && data.length == 1) {
                        if (data[0].headshot) {
                            headshot = isWhite ? data[0].headshot.replace('/2.png', '/22.png') : data[0].headshot;
                        }
                        var email = data[0].email || '',
                            modifyDate = email.substr(0, email.indexOf(',')) || 0;
                        Ext.Ajax.request({
                            url: GLOBAL_CONFIG.NetCallApi + '/plugins/uiauthentication/getvcard',
                            method: 'GET',
                            params: {
                                username: jid.replace('@' + GLOBAL_CONFIG.HostName, ''),
                                date: modifyDate
                            },
                            success: function (response, opts) {
                                var resp = response.responseText;
                                if (resp != 'NO NEED TO UPDATE') {
                                    var updateData = Ext.JSON.decode(resp);
                                    var image = updateData.image || headshot,
                                        nickname = updateData.nickname,
                                        truename = updateData.truename;
                                    NG.dbManager.excuteSql("update person_detail set headshot=?,name=?,org=?,netcall=?,tel=?,email=? where id=?", [image, nickname, updateData.organization, updateData.jid, updateData.cellphone, updateData.modifydate + ',' + updateData.email, data[0].id], function () {
                                    });
                                    //更新对话信息列表
                                    var chatListStore = Ext.getStore('ChatListStore');
                                    var chatListModel = chatListStore.findRecord('jid', jid);
                                    if (chatListModel) {
                                        chatListModel.set('headshot', image);
                                        chatListModel.set('name', nickname);
                                    }
                                    if (image != headshot || truename != data[0].name) { //头像和昵称没有变化，不用更新通讯录
                                        var conController = controller.getApplication().getController("contact.ContactController");
                                        var friend = conController.isMyFriend(jid);
                                        if (friend) {
                                            friend.headshot = image;
                                            friend.name = truename;
                                            conController.refreshMyFriend();
                                        }
                                    }
                                    execFn1({headshot: image, name: nickname, tel: updateData.cellphone}, controller, jid, timestamp);
                                }
                                else {
                                    execFn1({headshot: headshot, name: data[0].name, tel: data[0].tel}, controller, jid, timestamp);
                                }
                            },
                            failure: function () {
                                execFn1({headshot: headshot, name: data[0].name, tel: data[0].tel}, controller, jid, timestamp);
                            }
                        });
                    } else {
                        controller.getApplication().getConn().vcard.get(function (item) {
                            var tmpData = {
                                eno: logInfo.eNo,
                                jid: jid,
                                headshot: headshot,
                                name: pid,
                                org: '',
                                netcall: pid,
                                tel: '',
                                email: ''
                            };
                            var vcardXml = item.getElementsByTagName('vCard')[0];
                            if (vcardXml.querySelector('PHOTO') != null) {
                                tmpData.headshot = 'data:' + vcardXml.querySelector('PHOTO').querySelector('TYPE').textContent + ';base64,' + vcardXml.querySelector('PHOTO').querySelector('BINVAL').textContent;
                            }
                            if (NG.dbManager) { // 信息保存数据库
                                if (vcardXml.querySelector('TEL') != null) {
                                    tmpData.tel = vcardXml.querySelector('TEL').querySelector('NUMBER').textContent;
                                }
                                if (vcardXml.querySelector('EMAIL') != null) {
                                    tmpData.email = vcardXml.querySelector('EMAIL').querySelector('USERID').textContent;
                                }
                                if (vcardXml.querySelector('ORG') != null) {
                                    tmpData.org = vcardXml.querySelector('ORG').querySelector('ORGUNIT').textContent;
                                }
                                if (vcardXml.querySelector('NICKNAME') != null) {
                                    tmpData.name = vcardXml.querySelector('NICKNAME').textContent;
                                } else if (vcardXml.querySelector('GIVEN') != null) {
                                    tmpData.name = vcardXml.querySelector('GIVEN').textContent;
                                }
                                NG.dbManager.deleteData("person_detail", "eno=? and jid=?", [logInfo.eNo, jid], function () {
                                    tmpData.email = new Date().getTime() + ',' + tmpData.email;
                                    NG.dbManager.insert("person_detail", [tmpData]);
                                });
                            }
                            execFn1(tmpData, controller, jid, timestamp);
                        }, jid, function () {
                            execFn1({headshot: headshot, name: pid, tel: ''}, controller, jid, timestamp);
                        });
                    }
                });
            };

            if (!timestamp) {
                controller.headMaps = null;
                execFn(controller, jid, timestamp);
            } else {
                controller.headMaps = controller.headMaps || {};
                if (!controller.headMaps[timestamp]) {
                    controller.headMaps = {};
                    controller.headMaps[timestamp] = {};
                }
                if (controller.headMaps[timestamp][jid]) {
                    var tmp_d = controller.headMaps[timestamp][jid];
                    return callback(tmp_d.headshot, tmp_d.name, tmp_d.tel);
                } else {
                    execFn(controller, jid, timestamp);
                }
            }
        },

        /**
         * 功能描述：将小时转化为一天的某个时间段
         * hour：当前小时
         */
        hourToFormat: function (hour) {
            if (hour >= 13 && hour < 18) {
                return '下午';
            }
            else if (hour >= 6 && hour < 12) {
                return '早上';
            }
            else if (hour == 12) {
                return '中午';
            }
            else if (hour >= 18 && hour < 24) {
                return '晚上';
            }
            else if (hour >= 0 && hour < 6) {
                return '凌晨';
            }
            return '';
        },

        /**
         * 功能描述：修改日期格式(面向业务)
         * oldDate：需要转化的日期
         */
        dateFormatOfWork: function (oldDate) {
            var dateString = '';
            if (oldDate == null) {
                return "";
            }
            if (!Ext.isDate(oldDate)) {
                oldDate = new Date(oldDate.replace(/-/g, "/"));
            }
            if (Ext.Date.format(oldDate, 'Y-m-d') == '1900-01-01') {
                return null;
            }
            var nowDate = new Date();
            if (nowDate.getDay() == oldDate.getDay() && Ext.Date.getElapsed(oldDate, nowDate) < 24 * 60 * 60 * 1000) {
                dateString = this.hourToFormat(oldDate.getHours()) + ' ' + Ext.Date.format(oldDate, 'G:i');
            }
            else if ((nowDate.getDay() - oldDate.getDay() == 1 || (oldDate.getDay() == 6 && nowDate.getDay() == 0)) && Ext.Date.getElapsed(oldDate, nowDate) < 2 * 24 * 60 * 60 * 1000) {
                dateString = '昨天 ' + ' ' + Ext.Date.format(oldDate, 'G:i');
            }
            else if ((nowDate.getDay() - oldDate.getDay() == 2 || (oldDate.getDay() == 5 && nowDate.getDay() == 0) || (oldDate.getDay() == 6 && nowDate.getDay() == 1)) && Ext.Date.getElapsed(oldDate, nowDate) < 3 * 24 * 60 * 60 * 1000) {
                dateString = '前天 ' + ' ' + Ext.Date.format(oldDate, 'G:i');
            }
            else {
                if (oldDate.getFullYear() == nowDate.getFullYear()) {
                    dateString = Ext.Date.format(oldDate, 'm月d日');
                }
                else {
                    dateString = Ext.Date.format(oldDate, 'Y-m-d');
                }
            }
            return dateString;
        },

        /**
         * 功能描述：修改日期格式(面向消息)
         * oldDate：需要转化的日期
         */
        dateFormat: function (oldDate) {
            var dateString = '';
            if (!Ext.isDate(oldDate)) {
                oldDate = new Date(oldDate.replace(/-/g, "/"));
            }
            var nowDate = new Date();
            if (nowDate.getDay() == oldDate.getDay() && Ext.Date.getElapsed(oldDate, nowDate) < 24 * 60 * 60 * 1000) {
                dateString = this.hourToFormat(oldDate.getHours()) + ' ' + Ext.Date.format(oldDate, 'G:i');
            }
            else if ((nowDate.getDay() - oldDate.getDay() == 1 || (oldDate.getDay() == 6 && nowDate.getDay() == 0)) && Ext.Date.getElapsed(oldDate, nowDate) < 2 * 24 * 60 * 60 * 1000) {
                dateString = '昨天 ' + this.hourToFormat(oldDate.getHours()) + ' ' + Ext.Date.format(oldDate, 'G:i');
            }
            else {
                if (oldDate.getFullYear() == nowDate.getFullYear()) {
                    dateString = Ext.Date.format(oldDate, 'm月d日') + ' ' + this.hourToFormat(oldDate.getHours());// + ' ' + Ext.Date.format(oldDate, 'G:i');
                }
                else {
                    dateString = Ext.Date.format(oldDate, 'Y-m-d');// + ' ' + this.hourToFormat(oldDate.getHours()) + ' ' + Ext.Date.format(oldDate, 'G:i');
                }
            }
            return dateString;
        },

        /**
         * 功能描述：提示
         * msg:提示信息
         * showTime:弹出框显示的时间,默认2000毫秒
         *
         **/
        alert: function (msg, showTime) {
            var showTime = showTime || 2500;
            if (NG.NGAlertIT) {
                clearTimeout(NG.NGAlertIT);
                NG.NGAlertIT = null;
            }
            NG.setWaiting(false);
            Ext.Viewport.setMasked({
                xtype: 'label',
                zIndex: 9999,
                cls: 'ng-alert',
                html: '<div style="display: -webkit-box; -webkit-box-pack: center;-webkit-box-align: center;"><div style="border-radius: 8px;text-align: center;color: white;background: rgba(0, 7, 9, 0.6); padding:6px 12px; max-width: 250px;word-break: break-all;">' + msg || 'Loading...' + '</div></div>',
                centered: true
            });
            NG.NGAlertIT = setTimeout(function () {
                Ext.Viewport.setMasked(null);
                NG.NGAlertIT = null;
            }, showTime);
        },

        /**
         * 功能描述：设置聊天背景
         * background：背景
         * fileURI：图片路径
         */
        setBackgroundImage: function (background, fileURI) {
            if (device.platform == 'Android') {
                if (fileURI) {
                    background.setStyle('background-image:url(' + fileURI.substr(fileURI.indexOf('/')) + ');background-size: 100% ' + (Ext.Viewport.element.getHeight() - 92) + 'px;background-position: 0px 0px;');
                } else {
                    background.setStyle('background-image:none;');
                }
            }
            else {
                if (fileURI) {
                    background.setStyle('background-size: 100% ' + (Ext.Viewport.element.getHeight() - 92) + 'px;background-position: 0px 0px;');
                    background.element.dom.style.backgroundImage = 'url(' + encodeURI(fileURI) + ')';
                } else {
                    background.element.dom.style.backgroundImage = 'none';
                }
            }
        },

        /**
         * 功能描述：显示新中大协议
         * parentComponent:用来显示新中大协议的父组件
         */
        showAbout: function (parentComponent) {
            var aboutLabel;
            if (!NG.about) {
                Ext.Ajax.request({
                    url: 'extra/about.json',
                    success: function (response) {
                        NG.about = Ext.JSON.decode(response.responseText).about;
                        aboutLabel = Ext.create("Ext.Container", {
                            title: "服务条款",
                            scrollable: {
                                direction: 'vertical'
                            },
                            html: NG.about,
                            layout: 'fit'
                        });
                        parentComponent.push(aboutLabel);
                    },
                    failure: function () {
                        NG.alert('系统维护中');
                    }
                });
            }
            else {
                aboutLabel = Ext.create("Ext.Container", {
                    title: "服务条款",
                    scrollable: {
                        direction: 'vertical'
                    },
                    html: NG.about,
                    layout: 'fit'
                });
                parentComponent.push(aboutLabel);
            }
        },

        /*
         * 功能描述：打开下载页面
         */
        openDownLoadManager: function (tmpUrl, key, name) {
            if (!window.downloadManager || window.downloadManager.isDestroyed) {
                window.downloadManager = Ext.create('com.newgrand.DownloadManager', {
                });
            }
            Ext.Viewport.add(window.downloadManager);
            Ext.Viewport.setActiveItem(window.downloadManager);
            window.downloadManager.$$download(tmpUrl, key, name);
        },

        /**
         * 功能描述：下载文件
         * url：文件地址
         * key: 业务点标识
         * name：文件名
         * arc_size：附件大小
         */
        downLoadFile: function (url, key, name, arc_size) {
            var tmpUrl = url,
                matchs,
                openFilter = "|.txt|.doc|.docx|.xls|.xlsx|.xml|.pdf|.png|.jpeg|.gif|.bmp|.jpg|.ico|.swf|.snag|.tif|.cur|.mht|";
            if (Ext.isEmpty(tmpUrl)) {
                NG.alert("文件地址为空.");
                return;
            }
            if (window.cordovaFileDirEntry) {
                tmpUrl = NG.replaceURL(tmpUrl);
                matchs = tmpUrl.match(/^.*\/(.*)\.(\w*)$/);
                if (!matchs) {
                    matchs = ['', name.substr(0, name.lastIndexOf('.')), name.substr(name.lastIndexOf('.') + 1)];
                    if (url.toLowerCase().indexOf('userconfig/tmpfile/archivetmp') < 0) {
                        tmpUrl = url;//netcall文件服务器不需要替换
                    }
                }
                if (openFilter.indexOf("|." + matchs[2].toLocaleLowerCase() + "|") > -1) {
                    NG.openFile(url, function () {
                    }, function () {
                        NG.openDownLoadManager(tmpUrl, key, name);
                    }, name, key, arc_size);
                } else {
                    NG.openDownLoadManager(tmpUrl, key, name);
                }

            } else {
                NG.openDownLoadManager(tmpUrl, key, name);
            }
        },

        /**
         * 功能描述：打开文件
         * url：文件地址
         * openVideo: 打开视频的回调函数
         */
        openFile: function (url, successCallback, failCallback, fname, fkey, arc_size, openVideo) {
            var tmpUrl = url, fileTransfer, matchs, fullPath,
                preName = "ngtmpfile",
                canOpen,
                ext = null,
                openFilter = "|.txt|.doc|.docx|.xls|.xlsx|.xml|.pdf|.png|.jpeg|.gif|.bmp|.jpg|.html|.htm|.mp4|";
            if (Ext.isEmpty(tmpUrl)) {
                NG.alert("文件地址为空.");
                return;
            }
            if (tmpUrl.split('.').length != 5 && tmpUrl.split('.').length != 4) {
                NG.openByWebInt(tmpUrl, successCallback, failCallback);
                return;
            }
            tmpUrl = NG.replaceURL(tmpUrl);
            matchs = tmpUrl.match(/^.*\/(.*)\.(\w*)$/);
            if (!matchs) {
                if(!fname){
                    NG.openByWebInt(tmpUrl, successCallback, failCallback);
                    return;
                }
                matchs = ['', fname.substr(0, fname.lastIndexOf('.')), fname.substr(fname.lastIndexOf('.') + 1)];
                if (url.toLowerCase().indexOf('userconfig/tmpfile/archivetmp') < 0) {
                    tmpUrl = url;//netcall文件服务器不需要替换
                }
            }
            ext = matchs[2].toLocaleLowerCase();
            if (openVideo && (ext == null || ext == "zip")) {
                ext = "mp4";
            }
            canOpen = openFilter.indexOf("|." + ext + "|") > -1;
            if (ext == "html" || ext == "htm") {
                NG.openByWebInt(tmpUrl, successCallback, failCallback);
                return;
            }
            if (window.cordovaFileDirEntry) {
                var logInfo = NG.getProductLoginInfo(),
                    fname = "",
                    tmpSize = 0;
                window.cordovaFileDirEntry.getDirectory(logInfo.eNo, { create: true, exclusive: false }, function (dir) {
                    dir.getDirectory(logInfo.loginId, { create: true, exclusive: false }, function (dirEntry) {
                        fname = preName + matchs[1] + "." + ext;
                        fullPath = [dirEntry.fullPath, "/", fname].join("");
                        dirEntry.getFile(fname, null, function () {
                            console.log("本地打开");
                            if (openVideo) {
                                openVideo(fullPath);
                                return;
                            }
                            if (canOpen) {
                                NG.openByWebInt(fullPath, successCallback, failCallback);
                            } else {
                                NG.openDownLoadManager(tmpUrl, fkey || fname || "key_1234567890", fname || "key_1234567890");
                            }
                        }, function () {
                            NG.checkTmpFileSize(dirEntry, function () {
                                if (canOpen) {
                                    var DownLoading = Ext.Viewport.getItems().get("DownLoadingContainerMap"), lastWidth = 0;
                                    if (!DownLoading) {
                                        var tp = (Ext.Viewport.element.getHeight() - 50) / 2;
                                        DownLoading = Ext.create('Ext.Container', {
                                            hidden: true,
                                            id: 'DownLoadingContainerMap',
                                            scrollable: null,
                                            centered: true,
                                            width: '100%',
                                            height: '100%',
                                            zIndex: 9998,
                                            modal: false,
                                            style: 'background-color: transparent;',
                                            html: '<div style="width: 100%; height: 50px;background: white;position: absolute;top: ' + (tp - 20) + 'px;left: 0;"></div><div class="btncls" style="background-image: url(resources/images/appitem_del_btn_normal.png); position: absolute; height: 42px;width: 42px;background-size: cover; top: ' + (tp - 13) + 'px; right: 15%;z-index: 99;background-repeat: no-repeat;background-size: 50%;background-position: center; margin-right: -18px;"></div><div class="barbox" style="border:1px solid lightgray;border-radius:6px;background:white;position:relative;top:' + tp + 'px;height:17px; margin-left:15%; margin-right:15%;"><div class="bar" style="background:#f9b400;height:15px;border-bottom-left-radius: 6px;border-top-left-radius: 6px;width:10%"></div><div class="barText" style="position:absolute;width:100%; top:0px;font-size: 0.8em;text-align: center;">0%</div></div>'
                                        });
                                        DownLoading.element.dom.querySelector("div.btncls").addEventListener("touchend", function () {
                                            if (DownLoading.fileTransfer) {
                                                DownLoading.abortTransfer = true;
                                                DownLoading.fileTransfer.abort();
                                            }
                                        });
                                    }
                                    var bar = DownLoading.element.dom.querySelector("div.bar");
                                    var barText = DownLoading.element.dom.querySelector("div.barText");
                                    if (!DownLoading.getParent()) {
                                        Ext.Viewport.add(DownLoading);
                                    }
                                    bar.style.width = "0%";
                                    barText.innerHTML = 'Loading...';
                                    DownLoading.show();
                                    fileTransfer = new FileTransfer();
                                    DownLoading.fileTransfer = fileTransfer;
                                    fileTransfer.onprogress = function (progressEvent) {
                                        var width = 0,
                                            loaded = "",
                                            total = "";
                                        if (progressEvent.total > 0) {
                                            if (progressEvent.lengthComputable) {
                                                if (progressEvent.loaded <= progressEvent.total) {
                                                    width = (progressEvent.loaded * 100) / progressEvent.total;
                                                }
                                                tmpSize = progressEvent.total;
                                                if (total.length == 0) {
                                                    if (tmpSize / 1000.00 > 990) {
                                                        total = (tmpSize / 1000000.00).toFixed(1) + 'M';
                                                    } else {
                                                        total = (tmpSize / 1000.00).toFixed(1) + 'KB';
                                                    }
                                                }
                                            }
                                            if (width > lastWidth) {
                                                bar.style.width = width + "%";
                                                if (progressEvent.loaded / 1000.00 > 990) {
                                                    loaded = (progressEvent.loaded / 1000000.00).toFixed(1) + 'M';
                                                } else {
                                                    loaded = (progressEvent.loaded / 1000.00).toFixed(1) + 'KB';
                                                }
                                                barText.innerHTML = loaded + '&nbsp;/&nbsp;' + total;
                                                lastWidth = width;
                                            }
                                        }
                                    };
                                    fileTransfer.download(encodeURI(tmpUrl), fullPath,
                                        function (entry) {
                                            DownLoading.fileTransfer = null;
                                            DownLoading.hide();
                                            if (openVideo) {
                                                openVideo(fullPath);
                                            } else {
                                                NG.openByWebInt(fullPath, successCallback, failCallback);
                                            }
                                            NG.dbManager.insert("attach_info", [
                                                {
                                                    eno: logInfo.eNo,
                                                    logid: logInfo.loginId,
                                                    updatetime: new Date().getTime(),
                                                    fname: fname,
                                                    fsize: tmpSize,
                                                    mydef: ''
                                                }
                                            ]);
                                        },
                                        function (error) {
                                            DownLoading.fileTransfer = null;
                                            DownLoading.hide();
                                            if (DownLoading.abortTransfer) {
                                                DownLoading.abortTransfer = false;
                                                NG.alert("下载已取消");
                                            }
                                            else {
                                                NG.alert("下载失败");
                                                failCallback && failCallback(error);
                                                NG.sysLog("下载文件出错，文件地址->" + tmpUrl, NG.LogType.OPERATION);
                                            }
                                        });
                                } else {
                                    NG.openDownLoadManager(tmpUrl, fkey || fname || "key_1234567890", fname || "key_1234567890");
                                    successCallback && successCallback();
                                }
                            }, arc_size);
                        });
                    });
                });
            }
            else {
                if (openVideo) {
                    openVideo(fullPath);
                    return;
                }
                NG.openDownLoadManager(tmpUrl, fkey || fname || "key_1234567890", fname || "key_1234567890");
                successCallback && successCallback();
            }
        },
        /*
         * 功能描述:检查缓存文件,删除三个月前的记录，
         * 若文件未超过三个月，但总大小超过500M，给予提示
         */
        checkTmpFileSize: function (dirEntry, callback, arc_size) {
            var logInfo = NG.getProductLoginInfo(),
                DAYS = 90,
                MAXSIZE = 500,
                size = 0,
                time = (new Date().getTime() - DAYS * 24 * 60 * 60 * 1000).toString();
            if (arc_size) {
                if (arc_size.indexOf("M") > 0) {
                    arc_size = Number(arc_size.replace("M", "")) * 1024 * 1024;
                } else if (arc_size.indexOf("KB") > 0) {
                    arc_size = Number(arc_size.replace("KB", "")) * 1024;
                } else if (arc_size.indexOf("B") > 0) {
                    arc_size = Number(arc_size.replace("B", ""));
                }
            }
            var execFun = function () {
                NG.dbManager.excuteSql("select * from attach_info where eno=? and logid=? and updatetime<?", [logInfo.eNo, logInfo.loginId, time], function (data) {
                    for (var i = data.length - 1; i > -1; i--) {
                        dirEntry.getFile(data[i].fname, null, function (entry) {
                            entry.remove();
                        }, function () {
                        });
                    }
                    NG.dbManager.deleteData("attach_info", "eno=? and logid=? and updatetime<?", [logInfo.eNo, logInfo.loginId, time], function () {
                        NG.dbManager.excuteSql("select sum(fsize) AS allsize from attach_info where eno=? and logid=?", [logInfo.eNo, logInfo.loginId], function (data) {
                            if (data.length > 0) {
                                if (data[0].allsize && data[0].allsize > MAXSIZE * 1024 * 1024) {
                                    Ext.Msg.alert("附件缓存大小超过" + MAXSIZE + "M，建议您到设置界面清理缓存.");
                                }
                            }
                        });
                    });
                });
            };
            if (arc_size && arc_size > 1024 * 1024 && navigator.connection.type != Connection.WIFI) {
                Ext.Msg.confirm(
                    "提示", "文件较大，确认在非wifi网络下下载？",
                    function (buttonId) {
                        if (buttonId === 'yes') {
                            execFun();
                            callback && callback();
                        }
                    }
                );
            } else {
                execFun();
                callback && callback();
            }
        },

        /*
         * 功能描述：修改附件的图标和大小显示格式
         */
        changeAttachmentStyle: function (aths) {
            var newAth = [],
                kb = 1024,
                IconMath = NG.iconMap;
            if (aths.length > 0 && aths[0].icon && aths[0].attachsize) {
                return aths;
            }
            Ext.Array.each(aths, function () {
                var ath = this,
                    match = ath.attachname.match(/^(.*)\.(\w*)$/);
                if (ath.attachsize) {
                    ath.attachsize = ath.attachsize > kb * kb ? ((ath.attachsize / (kb * kb)).toFixed(1) + "M") : (ath.attachsize > 999 ? ((ath.attachsize / kb).toFixed(1) + "KB") : (ath.attachsize.toFixed(1) + "B"));
                }
                ath.icon = match ? IconMath[match[2].toLowerCase()] || IconMath['other'] : IconMath['other'];
                newAth.push(ath);
            });
            return newAth;
        },

        /*
         * 功能描述：利用webint打开本地文件
         * url: 文件全名
         * successCallback: 成功回调
         * failCallback: 失败回调
         */
        openByWebInt: function (url, successCallback, failCallback) {
            if (Ext.os.is('Android')) {
                window.plugins.webintent.startActivity({
                    action: window.plugins.webintent.ACTION_VIEW,
                    url: encodeURI(url),
                    type: NG.getMIMEType(url)
                }, function () {
                    console.log("应用程序打开成功");
                    successCallback && successCallback(url);
                }, function (error) {
                    console.log(error);
                    failCallback && failCallback(url, error);
                    NG.alert("未找到应用程序打开文件");
                });
            }
            else if (Ext.os.is("iOS")) {
                window.LocalApplication.openFile(
                    url, 
                    function() {
                        successCallback && successCallback(url);
                    },
                    function(error) {
                        failCallback && failCallback(url, error);
                    }
                );
            }
        },

        /*
         * 功能描述：获取文件类型
         * file: 文件名
         */
        getMIMEType: function (fName) {
            var type = "*/*", end = "*";
            var tmpArr = fName.split(".");
            if (tmpArr.length < 1) {
                return type;
            }
            else {
                end = tmpArr[tmpArr.length - 1].toLowerCase();
            }
            if (!end) {
                return type;
            }
            else {
                return MIME_MapTable[end]; //MIME_MapTable 在config.js中定义
            }
        },

        /**
         * 功能描述：查看图片组件
         * ImgComponent:当前用来显示图片的组件
         * url:用来显示图片的url地址，url为空时，取ImgComponent.getSrc()
         * filename:文件名
         */
        showImage: function (ImgComponent, url, filename, thumbnailUrl, origin, successCallback, config) {
            var tmpSrc = url || ImgComponent.getSrc();
            if (window.Picture && (!config || !config.isWebPicutre)) {
                if(config && config.attachs) {
                    window.Picture.display(config.attachs, [].toString(), ["false", config.position].toString(), successCallback, function () {
                        NG.alert("图片打开失败.", 5000);
                        NG.sysLog("图片[" + tmpSrc + "]打开失败.");
                    });
                }
                else {
                    if(tmpSrc.indexOf('data') == 0) {
                        tmpSrc = [tmpSrc];
                    }
                    window.Picture.display(tmpSrc, thumbnailUrl, origin ? origin.toString() : "false", successCallback, function () {
                        NG.alert("图片打开失败.", 5000);
                        NG.sysLog("图片[" + tmpSrc + "]打开失败.");
                    });
                }
                return;
            }
            var ImageView = Ext.Viewport.getItems().get("ImageViewContainerMap"),
                width = Ext.Viewport.element.getWidth(),
                height = Ext.Viewport.element.getHeight(),
                ImageComponent,
                nvlImg = "data:image/gif;base64,";
            if (Ext.isEmpty(tmpSrc) || tmpSrc == nvlImg) {
                return;
            }
            if (!ImageView) {
                ImageView = Ext.create('Ext.Container', {
                    id: 'ImageViewContainerMap',
                    scrollable: null,
                    centered: true,
                    width: '100%',
                    height: '100%',
                    modal: false,
                    hidden: true,
                    showAnimation: {
                        type: 'fadeIn',
                        duration: 250,
                        easing: 'ease-out'
                    },
                    layout: 'vbox',
                    style: 'background-color:#141824;',
                    items: [
                        {
                            flex: 1,
                            xtype: 'imageviewer',
                            src: tmpSrc,
                            filename: filename || "",
                            zIndex: 100
                        }
                    ]
                });
                ImageComponent = ImageView.getComponent(0);
            }
            else {
                ImageComponent = ImageView.getComponent(0);
                if (tmpSrc != ImageComponent.getSrc()) {
                    ImageComponent.clearImage();
                    ImageComponent.setSrc(tmpSrc);
                    ImageComponent.setFilename(filename || "");
                }
            }

            if (!ImageView.getParent()) {
                Ext.Viewport.add(ImageView);
            }
            ImageView.show();
            ImageComponent.showImg();
        },

        /**
         *
         * 加了两个样式 .x-list .list-pop.x-list-item{color:#eee;} .x-list .list-pop.x-list-item.x-list-item-tpl:before{left:0;border-bottom:solid 1px black;}
         * 弹出框依附在Ext组件下面，宽度固定135，有箭头提示
         * @return popComponent
         */
        pop: function (parentContainer, data, callback, config) {
            var popComponent = parentContainer.popComponent,
                pWidth = 120,
                width = config ? config.width : null,
                topRight = config ? config.topRight : null,
                hasImg = data.length > 0 && data[0].image;
            if (!popComponent) {
                if (!hasImg) {
                    pWidth = 100;
                }
                popComponent = Ext.create('Ext.Container', {
                    right: 0,
                    padding: 0,
                    modal: true,
                    hideOnMaskTap: true,
                    margin: '7 0 0 0',
                    width: width || pWidth,
                    baseCls: 'popMenu',
                    height: data.length * 40,
                    layout: {
                        type: 'hbox'
                    },
                    showAnimation: Ext.os.is("iOS") ? {type: 'fade', duration: 160} : null,
                    hideAnimation: null,
                    tpl: ['<div class="x-anchor x-anchor-top" style="right: ' + (topRight || 5) + 'px !important; top: 0px !important;z-index: 9;"></div>' +
                        '<tpl for="."><div mycode="{#}" <tpl if="xindex&gt;1">class="before-line"</tpl>',
                        'style = "background-color: #21292C; height: 40px; line-height: 40px; color: #eee; top:-1px;">',
                        hasImg ? '<image style="width:18px;height:18px;margin: 10px; position: absolute;" src="{image}" />' : '',
                            '<span style="margin-left: ' + (hasImg ? 36 : 18) + 'px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-size:1rem;">{title}</span>',
                        '</div></tpl>'],
                    data: data,
                    listeners: {
                        initialize: function () {
                            var pop = this,
                                popEl = pop.renderElement;
                            popEl.on({
                                tap: function () {
                                    var target = arguments[1],
                                        cName,
                                        pressedCls = "x-button-pressed",
                                        index = 0,
                                        mycode = target.mycode || target.getAttribute("mycode");
                                    while (!mycode && target.className.indexOf('popMenu') < 0) {
                                        target = target.parentElement;
                                        mycode = target.mycode || target.getAttribute("mycode");
                                    }
                                    if (!mycode || !target) {
                                        return;
                                    }
                                    cName = target.className;
                                    index = Number(mycode) - 1;
                                    if (pop.hasOwnProperty('tapTimeout')) {
                                        clearTimeout(pop.tapTimeout);
                                        delete pop.tapTimeout;
                                    } else {
                                        target.className = cName.length == 0 ? pressedCls : (cName + " " + pressedCls);
                                    }
                                    pop.tapTimeout = Ext.defer(function () {  //增加点击事件的触感
                                        target.className = target.className.replace(pressedCls, "");
                                        if (pop.hasOwnProperty('tapTimeout')) {
                                            clearTimeout(pop.tapTimeout);
                                            delete pop.tapTimeout;
                                        }
                                        pop.setHidden(true);
                                        if (callback) {
                                            callback(pop, index, target, {data: data[index]});
                                        }
                                    }, 80, pop);
                                }
                            });
                        },
                        hide: function () {
                            this.destroy();
                            NG.popWinComponent = null;
                            if (parentContainer) {
                                parentContainer.popComponent = null;
                            }
                            config && config.hideCallBack && config.hideCallBack();
                        }
                    }
                });
                popComponent.showBy(parentContainer);
                parentContainer.popComponent = popComponent;
            }
            else {
                popComponent.showBy(parentContainer);
            }
            NG.popWinComponent = popComponent;
            return popComponent;
        },

        popList: function (config) {
            if (!config || !config.itemTpl || !config.data) {
                console.log("config error");
                return;
            }
            Ext.each(config.data, function (d) {
                d.beforeLine = 0;
            });
            var len = config.data.length;
            var popMenu = Ext.create('Ext.Panel', {
                modal: true,
                hideOnMaskTap: false,
                width: config.width || (60 * len),
                height: config.height || 31,
                style: 'border-radius:6px;background-color:rgba(0, 0, 0, 0.9);color:white; padding: 0px;',
                items: [
                    {
                        xtype: 'taptpl',
                        itemCls: 'popItem',
                        itemStyle: 'position: relative; padding: 6px; min-width: 60px; float: left;text-align: center;',
                        data: config.data,
                        itemTpl: config.itemTpl,
                        listeners: {
                            itemTap: function (item, record) {
                                if (NG.popWinComponent) {
                                    NG.popWinComponent.destroy();
                                    NG.popWinComponent = null;
                                    config.callback && config.callback(record);
                                }
                            }
                        }
                    }
                ]
            });
            var pageBox = config.targetCmp.element.getPageBox(),
                vh = Ext.Viewport.element.getHeight() - 80,
                dir = pageBox.top > 50 ? "bc-tc" : (pageBox.bottom < vh ? 'tc-bc' : (pageBox.left > 60 ? 'cr-cl' : 'cl-cr'));
            popMenu.showBy(config.targetCmp, dir);
            NG.popWinComponent = popMenu;
            popMenu.getModal().element.on({
                touchstart: function (e) {
                    NG.popWinComponent.hide();
                    config.callback && config.callback({});
                },
                touchend: function () {
                    if (NG.popWinComponent) {
                        NG.popWinComponent.destroy();
                        NG.popWinComponent = null;
                    }
                },
                scope: popMenu.getModal(),
                single: true,
                order: 'before'
            });
        },

        showWindowList: function (config) {
            if (!config || !config.itemTpl || !config.data) {
                console.log("config error");
                return;
            }
            var len = config.data.length,
                vp = Ext.Viewport.element,
                wd = Math.min(vp.getWidth(), vp.getHeight());
            Ext.applyIf(config, {
                width: Math.min(Math.max(190, wd * 0.6), 300),
                height: len > 5 ? 195 : (len * 39),
                callback: Ext.emptyFn,
                radius: 6,
                cancel: true
            });
            config.data[0] && (config.data[0].beforeLine = 0);
            if (config.value) { //需要设置默认选中值时，可以设置value属性，格式： {"主键":"值"}
                var key, val;
                for (var p in config.value) {
                    key = p;
                    val = config.value[p];
                }
                config.itemTpl = [config.itemTpl, '<tpl if="' + key + '==\'' + val + '\'"><div style="background:url(resources/images/gou.png) no-repeat center;background-size: 23px;position: absolute;top: 0px; right: 0px; height: 39px; width: 47px;"></div></tpl>'].join('');
            }
            var win = Ext.create('Ext.Container', {
                centered: true,
                style: 'border-radius: ' + config.radius + 'px;background-color: #FFF; width: ' + config.width + 'px;',
                modal: {
                    cls: 'white-modal'
                },
                hideOnMaskTap: true,
                items: [
                    {
                        xtype: 'label',
                        hidden: !config.title,
                        html: '<div class="nowrap line font14" style="line-height: 29px;padding: 5px 15px 5px 15px;">' + config.title + '</div>'
                    },
                    {
                        xtype: 'taptpl',
                        height: config.height,
                        cls: (config.cancel ? " line" : ""),
                        scrollable: config.data.length < 6 ? null : {direction: 'vertical', directionLock: true},
                        itemStyle: 'position:relative; height: 39px; padding: 8px 16px 7px 16px;',
                        itemTpl: config.itemTpl,
                        data: config.data,
                        listeners: {
                            itemTap: function (item, record) {
                                if (NG.popWinComponent) {
                                    NG.popWinComponent.destroy();
                                    NG.popWinComponent = null;
                                    config.callback && config.callback(record);
                                }
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        cls: 'font16',
                        ui: 'action-black',
                        hidden: !config.cancel,
                        style: 'border:0px; border-radius: 0px 0px 6px 6px;',
                        text: '取消',
                        height: 39,
                        listeners: {
                            tap: function () {
                                if (NG.popWinComponent) {
                                    NG.popWinComponent.destroy();
                                    NG.popWinComponent = null;
                                }
                            }
                        }
                    }
                ],
                listeners: {
                    hide: function () {
                        this.destroy();
                        NG.popWinComponent = null;
                    }
                }
            });
            NG.popWinComponent = win;
            Ext.Viewport.add(win);
        },

        playVideo: function (config) {
            var vp = Ext.Viewport.element,
                wd = Math.min(vp.getWidth(), vp.getHeight()) * 0.8;
            Ext.applyIf(config, {
                url: '',
                controls: true,
                autoPlay: false,
                width: wd,
                height: wd
            });
            var execPlay = function (url) {
                if (NGCamera && NGCamera.playVideo) {
                    NGCamera.playVideo(url, null, null);
                } else {
                    var panel = Ext.create('Ext.Container', {
                        centered: true,
                        style: 'border-radius: 2px;background-color: #000; width: ' + config.width + 'px; height:' + config.height + 'px;',
                        modal: {
                            cls: 'white-modal'
                        },
                        hideOnMaskTap: true,
                        items: [
                            {
                                xtype: 'video',
                                width: config.width,
                                height: config.height,
                                url: url,
                                enableControls: config.controls,
                                autoResume: config.autoPlay,
                                posterUrl: 'resources/images/play.png'
                            }
                        ],
                        listeners: {
                            initialize: function () {
                                var me = this,
                                    playFn = function () {
                                        window.setTimeout(function () {
                                            var video = me.down("video");
                                            video.onGhostTap();
                                        }, 100);
                                    };
                                if (me.isPainted()) {
                                    playFn();
                                } else {
                                    me.on("painted", function () {
                                        playFn();
                                    }, me, {single: true});
                                }
                            },
                            hide: function () {
                                this.destroy();
                                NG.popWinComponent = null;
                            }
                        }
                    });
                    NG.popWinComponent = panel;
                    Ext.Viewport.add(panel);
                }
            };
            if (config.url.indexOf("http") == 0) {
                NG.openFile(config.url, null, null, config.fileName || 'video.mp4', 'video', '1.1M', function (url) {
                    execPlay(url || config.url);
                });
            } else {
                execPlay(config.url);
            }
        },

        /**
         *功能描述:将静态的htm页面转换成适合手机屏幕
         * url：需要转换的url地址集合
         * callback：回调函数
         * 展示方式:Chart 图表,Table 表格,Image: 图形
         */
        getmHtml: function (url, callback, viewType, endflag) {
            if (!Ext.isArray(url)) {
                url = [url];
            }
            var viewItem = Ext.Viewport.getActiveItem().getActiveItem();
            if (viewType) {
            }
            else {
                viewType = "Chart";
            }
            if (endflag) {
            } else {
                endflag = viewType;
            }
            var index = 0, N = url.length, tmpurl,
                frame = document.createElement('IFRAME');

            frame.style.position = "absolute";
            frame.height = "80%"; //Ext.Viewport.element.getHeight() - 120;
            frame.frameBorder = 0;
            frame.scrolling = "auto";
            frame.width = "100%";
            frame.style.visibility = "hidden";
            frame.src = tmpurl = url[index];

            var replaceStr = function (oldStr, idx, imgurl) {
                oldStr = oldStr.replace(/src\s*=\s*"/g, "src=\"" + imgurl);
                oldStr = oldStr.replace(/newgrand_Replace/g, 'newgrand_' + endflag + idx + '_Replace');
                oldStr = oldStr.replace(/supcan_Resize/g, 'supcan_Resize' + endflag + idx);
                oldStr = oldStr.replace(/supcan_ScrollMain/g, 'supcan_ScrollMain' + endflag + idx);
                oldStr = oldStr.replace(/"dMain"/g, '"dMain' + endflag + idx + '"');
                return oldStr;
            };

            var dealHtmlToExt = function (content, imgurl, idx) {
                var items = [];
                var tagLength = content.getElementsByTagName("td").length;
                if (tagLength > 50000) {
                    return Ext.create("Ext.Container", {
                        layout: 'fit',
                        flex: 1,
                        styleHtmlCls: '',
                        height: '100%',
                        width: '100%',
                        style: "text-align: center;padding-top: 40%;",
                        html: "报表过大，建议在浏览器中打开"
                    });
                }
                if (viewType && viewType == 'Table') {
                    var images = content.getElementsByTagName("images");
                    for (var ig = 0; ig < images.length; ig++) {
                        if ((images[ig].src.substring(images[ig].src.lastIndexOf("/") + 1)).indexOf("_C") >= 0) {
                            images[ig].parentNode.style.display = "none";
                        }
                    }
                }
                if (viewType && viewType == 'Image') {
                    var images = content.getElementsByTagName("images");
                    for (var ig = 0; ig < images.length; ig++) {
                        if ((images[ig].src.substring(images[ig].src.lastIndexOf("/") + 1)).indexOf("_C") >= 0) {
                            items.push({
                                xtype: 'images',
                                src: images[ig].src,
                                style: {
                                    'background-size': 'contain',
                                    'background-position': 'top',
                                    'background-repeat': 'no-repeat'
                                }
                                // html: '<div><images src="' + images[ig].src + '" style="float: left;height: 100%;width: 100%;background-size:contain;background: transparent;@include border-radius(3px);" ></div>'
                            });
                        }
                    }
                    return Ext.create("Ext.Carousel", {
                        hidden: false,
                        defaults: {
                            styleHtmlContent: true
                        },
                        style: {
                            'padding': '10px'
                        },
                        indicator: items.length > 1,
                        items: items,
                        height: '100%'


                    });
                }

                var p = content.getElementsByTagName("html")[0].innerHTML,
                    w = content.body.scrollWidth,
                    vw = Ext.Viewport.element.getWidth() - 9;
                var scale = 1; // vw >= w ? 1 : vw / w;               

                /* 开始报表相关替换 */
                p = replaceStr(p, idx, imgurl);
                execHtml(p, true);
                p = p.replace(/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig, "");
                /* 结束替换 */

                var body = content.body, styleHtml = "";
                var TopTitle = body.querySelector("div#newgrand_ReplaceDTitle");
                var LHeader = body.querySelector("div#newgrand_ReplaceHLDTitle");
                var RHeader = body.querySelector("div#newgrand_ReplaceHTitle");
                var LList = body.querySelector("div#newgrand_ReplaceLTitle");
                var MList = body.querySelector("div#newgrand_ReplaceMTitle");


                if (!LList && !LHeader && !TopTitle) {
                    var htm = '<div class="NGHtmlCLS" style="width:' + w + 'px;height:' + content.body.scrollHeight + 'px;-webkit-transform:scale(' + scale + ');-webkit-transform-origin: 0px 0px; margin-left:5px; margin-top:5px;margin-right:5px;margin-bottom:5px;">' + p + '</div>';
                    return Ext.create("Ext.Container", {
                        scrollable: {
                            directionLock: true,
                            direction: 'both'//设置允许垂直滚动
                        },
                        layout: 'fit',
                        flex: 1,
                        styleHtmlCls: '',
                        height: '100%',
                        width: '100%',
                        html: htm
                    });
                }
                if (TopTitle) {
                    TopTitle.style.width = "100%";
                    styleHtml = "";
                    var outTHtml = content.getElementsByTagName("style")[0].outerHTML + TopTitle.outerHTML;
                    outTHtml = "<style>div#newgrand_ReplaceHTitle{top:0;left:0;overflow: auto;}</style>" + outTHtml;
                    items.push({ height: TopTitle.offsetHeight, html: replaceStr(outTHtml, idx) });
                }
                else {
                    styleHtml = content.getElementsByTagName("style")[0].outerHTML;
                }
                if (LHeader && RHeader) {
                    RHeader.style.width = "100%";
                    var outLHtml = LHeader.outerHTML;
                    var outRHtml = RHeader.outerHTML;
                    outLHtml = styleHtml + "<style>div#newgrand_ReplaceHLDTitle{top:0;left:0;}</style>" + outLHtml;
                    outRHtml = "<style>div#newgrand_ReplaceHTitle{top:0;left:0;overflow: hidden;}</style>" + outRHtml;
                    items.push({
                        xtype: 'panel',
                        layout: {
                            type: 'hbox'
                        },
                        height: LHeader.offsetHeight,
                        items: [
                            { html: replaceStr(outLHtml, idx), width: LHeader.offsetWidth },
                            { html: replaceStr(outRHtml, idx), flex: 1 }
                        ]
                    });
                }
                if (MList) {
                    if (!LList) {
                        LList = { def: true };
                        LList.style = {};
                        LList.outerHTML = "";
                        LList.scrollHeight = MList.scrollHeight;
                        LList.offsetWidth = 0;
                    }
                    var defHeight = MList.offsetHeight;
                    MList.style.height = "auto";
                    MList.style.width = "auto";
                    LList.style.height = "auto";
                    var outLHtml = LList.outerHTML;
                    var outMHtml = MList.outerHTML;
                    outLHtml = styleHtml + "<style>div#newgrand_ReplaceLTitle{top:0;left:0;overflow: auto; position: inherit;}</style>" + outLHtml;
                    outMHtml = "<style>div#newgrand_ReplaceMTitle{top:0;left:0;overflow: inherit; position: inherit;}</style>" + outMHtml;
                    items.push({
                        xtype: 'panel',
                        width: '100%',
                        layout: {
                            type: 'hbox'
                        },
                        scrollable: {
                            direction: 'both',
                            directionLock: true
                        },
                        height: defHeight,
                        items: [
                            {
                                xtype: 'panel',
                                width: '100%',
                                layout: {
                                    type: 'hbox'
                                },
                                scrollable: null,
                                height: LList.scrollHeight,
                                items: [
                                    {
                                        width: LList.offsetWidth,
                                        html: replaceStr(outLHtml, idx)
                                    },
                                    {
                                        flex: 1,
                                        html: replaceStr(outMHtml, idx),
                                        id: "newgrand_ReplaceMTitle_div" + endflag + idx,
                                        scrollable: {
                                            direction: 'both',
                                            directionLock: true
                                        }
                                    }
                                ]
                            }
                        ]
                    });
                }
                var tmpPanel = Ext.create("Ext.Panel", {
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    scrollable: {
                        directionLock: true,
                        direction: 'both'//设置允许垂直滚动
                    },
                    items: items,
                    flex: 1,
                    styleHtmlCls: '',
                    height: '100%',
                    width: '100%'
                });
                var scorp = tmpPanel.element.down("#newgrand_" + endflag + idx + "_ReplaceHTitle");
                if (scorp) {
                    tmpPanel.down("#newgrand_ReplaceMTitle_div" + endflag + idx).getScrollable().getScroller().addListener("scroll", function (obj, x, y, eOpts) {
                        this.dom.scrollLeft = x;
                    }, scorp);
                }
                if (LHeader && RHeader) {
                }
                else {
                    var scord = tmpPanel.element.down("#newgrand_" + endflag + idx + "_ReplaceDTitle");
                    if (scord) {
                        tmpPanel.down("#newgrand_ReplaceMTitle_div" + endflag + idx).getScrollable().getScroller().addListener("scroll", function (obj, x, y, eOpts) {
                            this.dom.scrollLeft = x;
                            this.dom.scrollTop = y;
                        }, scord);
                    }
                }
                return tmpPanel;
            };

            var execHtml = function (html, skiped) {
                if (skiped) {
                    return; //暂时不需要执行
                }
                var hd = document.getElementsByTagName("head")[0];
                //脚本识别
                var re = /(?:<script([^>]*)?>)((\n|\r|.)*?)(?:<\/script>)/ig;
                //外部脚本识别
                var srcRe = /\ssrc=([\'\"])(.*?)\1/i;

                var typeRe = /\stype=([\'\"])(.*?)\1/i;

                var match;
                //html中包含有脚本，提炼出来单独执行
                while (match = re.exec(html)) {
                    var attrs = match[1];
                    var srcMatch = attrs ? attrs.match(srcRe) : false;

                    //外部脚本，在head中添加dom标签，动态载入脚本
                    if (srcMatch && srcMatch[2]) {
                        var s = document.createElement("script");
                        s.src = srcMatch[2];
                        var typeMatch = attrs.match(typeRe);
                        if (typeMatch && typeMatch[2]) {
                            s.type = typeMatch[2];
                        }
                        hd.appendChild(s);

                        // 内部脚本直接运行
                    } else if (match[2] && match[2].length > 0) {
                        if (window.execScript) {
                            window.execScript(match[2]);
                        } else {
                            window.eval(match[2]);
                        }
                    }
                }
            };

            frame.onload = frame.onreadystatechange = function () {
                if (this.readyState && this.readyState != "complete") {
                    return;
                }
                else {
                    var tmpArr = tmpurl.split('/');
                    var imgUrl = tmpurl.replace(tmpArr[tmpArr.length - 1], "");
                    var panelItem = dealHtmlToExt(this.contentDocument, imgUrl, index);
                    panelItem.element.on("resize", function () {
                        var vw = Ext.Viewport.element.getWidth() - 5;
                        var ngHtmls = panelItem.element.query("div.NGHtmlCLS");
                        Ext.Array.each(ngHtmls, function () {
                            var w = this.offsetWidth;
                            this.style.webkitTransform = "scale(1)"; //"scale(" + (vw >= w ? 1 : vw / w) + ")";
                        });
                    });
                    callback && callback(panelItem, index);
                    index++;
                    if (index < url.length) {
                        frame.src = tmpurl = url[index];
                    }
                    else {
                        frame.src = "";
                        window.document.body.removeChild(frame);
                        frame = null;
                    }
                }
            };
            window.document.body.appendChild(frame);
        },

        /**
         * 功能描述：   提供Controller的动态创建
         * sourcecontroller: 当前操作的 controller , 可以获取当前应用的application和 定义的 controllers
         * callback:    回调函数
         * initcontrollers:  强制指定需要初始化的Controller ，忽略sourcecontroller 里定义的 controllers
         */
        initControllers: function (sourcecontroller, callback, initcontrollers) {
            var application = NG.application,
                controllers = initcontrollers ? initcontrollers : (sourcecontroller ? sourcecontroller.getControllers() : []),
                instances = application.getControllerInstances(),
                appName = application.getName(),
                length = controllers.length,
                name,
                controller,
                tmpControllers = [], tmpStores = [],
                format = Ext.String.format,
                controllerStores,
                classes = [];

            callback = callback || Ext.emptyFn;

            /**
             * 功能描述：实例化相关Controller
             */
            var getController = function (refcontroller) {
                if (!Ext.isArray(refcontroller)) {
                    refcontroller = [refcontroller];
                }
                var length = refcontroller.length,
                    tmpStore = null,
                    splits,
                    newStores = [];
                for (var i = 0; i < length; i++) {
                    name = refcontroller[i];
                    if (name.indexOf(appName) < 0) {
                        name = format("{0}.controller.{1}", appName, name);
                    }
                    if (!instances[name]) {
                        controller = Ext.create(name, {
                            application: application
                        });
                        controllerStores = [];
                        newStores = controller.getStores();
                        for (var z = 0, len = newStores.length; z < len; z++) {
                            tmpStore = newStores[z];
                            if (Ext.isString(tmpStore)) {
                                splits = tmpStore.split('.');
                                if (!Ext.getStore(splits[splits.length - 1])) { // 已经实例化的store不需要实例化
                                    controllerStores.push(tmpStore);
                                }
                            } else {
                                controllerStores.push(tmpStore);
                            }
                        }
                        newStores = [];
                        tmpStores = tmpStores.concat(controllerStores);
                        classes = classes.concat(controller.getModels().concat(controller.getViews()).concat(controllerStores));
                        instances[name] = controller;
                        tmpControllers.push(name);
                        /* 
                         * 描述：controller 的 config 属性是否设置 autoLoadControllers
                         */
                        if (controller.getAutoLoadControllers && controller.getAutoLoadControllers()) {
                            getController(controller.getControllers ? (controller.getControllers() || []) : []);
                        }
                    }
                }
            };

            getController(controllers);

            if (tmpControllers.length == 0) { //已经实例化过，直接返回
                callback();
                return;
            }

            application.setControllerInstances(instances);

            application.setStores(application.getStores().concat(tmpStores));

            /**
             * 功能描述：实例化controller里面的Store对象
             */
            var instantiateStores = function () {
                var stores = application.getStores(), length = stores.length, store, storeClass, storeName, splits;
                for (var i = 0; i < length; i++) {
                    store = stores[i];
                    if (Ext.data && Ext.data.Store && !(store instanceof Ext.data.Store)) {
                        if (Ext.isString(store)) {
                            storeName = store;
                            storeClass = Ext.ClassManager.classes[store];
                            store = {
                                xclass: store
                            };

                            if (storeClass.prototype.defaultConfig.storeId === undefined) {
                                splits = storeName.split('.');
                                store.id = splits[splits.length - 1];
                            }
                        }
                        stores[i] = Ext.factory(store, Ext.data.Store);
                    }
                }
                application.setStores(stores);
            };

            Ext.require(classes, function () {
                var instanceController;
                instantiateStores();
                length = tmpControllers.length;
                for (var index = 0; index < length; index++) {
                    instanceController = instances[tmpControllers[index]];
                    instanceController.init(application);
                    if (instanceController instanceof Ext.app.Controller) {
                        instanceController.launch(application);
                    }
                }
                callback();
            }, application);
        },

        /**
         * 功能描述：正则表达式验证数据类型格式是否正确
         * value:    需要验证的数据
         * type:     数据类型
         */
        regTest: function (value, dataType) {
            var tf = true, regExp;
            if (Ext.isEmpty(value)) {
                return false;
            }
            switch (dataType) {
                case "email":      //邮箱
                    regExp = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                    break;
                case "phone":      //电话  
                    regExp = /^(\+86)?1[3-8]\d{9}$/;
                    break;
                case "password":  //密码为大于6位的字母、数字或_
                    regExp = /^(\w{6,})$/;
                    break;
                case "word":      //单词字符
                    regExp = /^(\w+)$/;
                    break;
                case "number":
                    regExp = /^(\d+)$/;
                    break;
                default:
                    return true;
            }
            return regExp.test(value);
        },

        Format: {
            amount: function (num, dig) { //dig小数点位数
                if (dig !== undefined) {
                    num = Number(num).toFixed(dig);
                }
                var num = (num || 0).toString(), result1 = '', result2 = '',
                    num1 = num, num2 = '';
                if (num.indexOf('.') > 0) { // 包含小数位
                    num2 = num.split('.');
                    num1 = num2[0];
                    num2 = num2[1];
                }
                while (num1.length > 3) {
                    result1 = ',' + num1.slice(-3) + result1;
                    num1 = num1.slice(0, num1.length - 3);
                }
                if (num1.length > 0) {
                    result1 = num1 + result1;
                }
                while (num2.length > 3) {
                    result2 = result2 + num2.slice(0, 3) + ',';
                    num2 = num2.slice(3);
                }
                if (num2.length > 0) {
                    result2 = result2 + num2;
                }
                return result2.length > 0 ? (result1 + '.' + result2) : result1;
            }
        },

        /*
         * 功能描述：打开员工的消息信息界面
         * ptype: 1标识可以删除
         * isEmp: 是否是员工
         */
        openPersonInfo: function (controller, personId, personName, ptype, isEmp) {
            controller.getApplication().getController("contact.PublicContactDetailController").loadPersonInfo(personId, personName, ptype, isEmp);
        },

        /*
         * 选择发送对象：打开我的照片界面
         * callback：回调函数
         * isSingle:是否单选，null为单选
         */
        openMyPicutreView: function (isSingle, callback) {
            var view = Ext.create('MyApp.view.work.myphotos.MyPhotosMainView', {
                callback: callback,
                isSingle: isSingle
            });
            Ext.Viewport.add(view);
            Ext.Viewport.setActiveItem(view);
        },

        /*
         * 功能描述：调用帮助界面
         */
        Helper: {
            //调用app内部人员（多选）
            openNetcallContact: function (callback, title, selected) {
                for(var i=0; i<selected.length; i++) {
                    if(selected[i].jid.indexOf('@') < 0) {
                        selected[i].jid = selected[i].jid + '@' + GLOBAL_CONFIG.HostName;
                    }
                }
                var view = Ext.create('MyApp.view.contact.SelectNetcallContactView', {
                    callback: callback,
                    title: title || '人员选择',
                    selected: selected
                });
            },
            //调用app内部发送对象
            openSendObject: function (callback, title, isPerson) {
                Ext.create('MyApp.view.contact.SendObjectView', {
                    callback: callback,
                    title: title || '选择发送对象',
                    isPerson: !!isPerson
                });
            },
            // 打开我的照片界面
            openMyPicutreView: function (isSingle, callback) {
                var view = Ext.create('MyApp.view.work.myphotos.MyPhotosMainView', {
                    callback: callback,
                    isSingle: isSingle
                });
                Ext.Viewport.add(view);
                Ext.Viewport.setActiveItem(view);
            },
            //打开操作员帮助
            openPersonHelp: function (config) {
                NG.initControllers(config.controller, function(){
                    var operatorView = Ext.create('MyApp.view.work.pub.OperatorView', {
                        callback: config.callback,
                        title: config.title || '选择操作员',
                        multi: !!config.multi,
                        isEmp: !!config.isEmp
                    });
                    Ext.Viewport.add(operatorView);
                    Ext.Viewport.setActiveItem(operatorView);
                }, 'MyApp.controller.work.pub.OperatorController')
            },
            //调用下属员工界面
            openUnderling: function (config) {
                NG.initControllers(null, function () {
                    Ext.create('MyApp.view.work.pub.UnderlingView', {
                        callback: config.callback,
                        title: config.title || '下属员工',
                        multi: !!config.multi
                    });
                }, ['work.pub.UnderlingController']);
            },
            //发起审批流
            startAppFlow: function (config) {
                NG.initControllers(null, function () {
                    Ext.applyIf(config, {
                        desc: '',  //审批流发起摘要
                        biztype: '', //商业对象
                        billcode: '', //送审主键，多主键用,号分隔
                        ocode: '' //送审组织
                    });
                    Ext.create('MyApp.view.work.pub.FlowInfoListView', {
                        paramConfig: config
                    });
                }, ['work.pub.ActiveAppFlowController']);
            },
            //扫一扫
            scanQRCode: function (config) {
                NG.initControllers(null, function () {
                    NG.application.getController('work.pub.QRCodeController').scan(config || {});
                }, ['work.pub.QRCodeController']);
            },
            // //功能描述 ：打开我的照片单选界面
            openMyPic: function(callback) {
                NG.Helper.openMyPicutreView(true, callback);
            },
            //功能描述 ：打开本地照片
            openPhPic: function (callback) {
                var targetWidth = Math.max(Ext.Viewport.bodyElement.getWidth(), Ext.Viewport.bodyElement.getHeight()) * 1.5;
                navigator.camera.getPicture(function (fileURI) {
                    callback && callback(fileURI);
                }, function (message) {
                    if (message == "Unable to retrieve path to picture!") {
                        NG.alert("当前图片格式暂不支持");
                    }
                }, {
                    quality: 50,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    correctOrientation: true,
                    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                    mediaType: navigator.camera.MediaType.PICTURE,
                    targetWidth: targetWidth,
                    targetHeight: targetWidth
                });
            },
            // 功能描述：调用设备上的拍照功能
            takePicture: function (callback) {
                var me = this,
                    targetWidth = Math.max(Ext.Viewport.bodyElement.getWidth(), Ext.Viewport.bodyElement.getHeight()) * 1.5;
                if (!navigator.camera) {
                    NG.alert("当前设备不支持拍照.");
                    return;
                }
                navigator.camera.getPicture(function (fileURI) { // 拍照成功
                    callback && callback(fileURI);
                }, function (message) {// 拍照失败
                    NG.sysLog("ProjectCheckController->takePicture error." + message);
                }, {
                    sourceType: navigator.camera.PictureSourceType.CAMERA,
                    quality: 50,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    targetWidth: targetWidth,
                    targetHeight: targetWidth
                });
            },
            // 功能描述：调用设备上的录像功能
            takeVideo: function (callback) {
                if (!window.NGCamera) {
                    NG.alert("当前设备不支持录像.");
                    return;
                }
                window.NGCamera.takeVideo(30, NG.getVideoQuality(), function (fileURI) { //录像成功
                    callback && callback(fileURI);
                }, function () {  //录像失败
                    NG.sysLog("ProjectCheckController->takeVideo error.");
                });
            }
        },

        /**
         * 功能描述：模拟登陆
         * login: 为true时，直接登陆，不需要获取真实用户名
         */
        productLogin: function (successcallback, failurecallback, login) {
            var userInfo = Ext.getStore('LocalStore').getById('userInfo');
            if (userInfo) {
                var productAdr = GLOBAL_CONFIG.productAdr,
                    logid = NG.productLoginID || userInfo.get('userName'),
                    strExp = /[a-z|A-Z]/,
                    loginFunc = function () {
                     /*   logid = '150157';
                        NG.productLoginID = logid;*/
                        Ext.Ajax.request({
                            url: GLOBAL_CONFIG.weChatServeAdr,
                            method: 'GET',
                            params: {
                                requestType: 'get',
                                requestAds: productAdr + "/rest/api/kernelsession",
                                loginid: logid,
                                isapp: "1"
                            },
                            success: function (retV, opts) {
                                var vl = Ext.JSON.decode(retV.responseText);
                                if (vl.status == "Success") {
                                    NG.setProductLoginInfo(true);
                                    if (successcallback) {
                                        successcallback();
                                    }
                                }
                                else {
                                    if (vl.errmsg && vl.errmsg.length < 30) {
                                        NG.alert(vl.errmsg);
                                    } else {
                                        NG.alert("无法连接应用服务器");
                                        NG.sysLog(vl.errmsg, NG.LogType.OPERATION);
                                    }
                                    NG.setProductLoginInfo(false);
                                    if (failurecallback) {
                                        failurecallback();
                                    }
                                }
                            },
                            failure: function (type, eObj) {
                                console.log(type.status);
                                if (type.status == 0) {
                                    var online = function (e) {
                                        window.removeEventListener("online", online);
                                        NG.productLogin();
                                    }
                                    window.addEventListener("online", online);
                                }
                                NG.alert("无法连接应用服务器");
                                NG.sysLog("failure:" + productAdr + "/rest/api/kernelsession?isapp=1&loginid=" + logid, NG.LogType.OPERATION);
                                NG.setProductLoginInfo(false);
                                if (failurecallback) {
                                    failurecallback();
                                }
                            }
                        });
                    };
                if (!login && strExp.test(logid)) { //如果包含字母
                    Ext.Ajax.request({
                        url: GLOBAL_CONFIG.NetCallApi + "/plugins/uiauthentication/geti6user?username=" + logid.toLowerCase(),
                        success: function (ret, opts) {
                            if (ret && ret.status == "200" && ret.responseText.length < 250 && ret.responseText.length > 0) {
                                NG.productLoginID = ret.responseText;
                                logid = ret.responseText;
                            }
                            loginFunc();
                        },
                        failure: function (type, eObj) {
                            loginFunc();
                        }
                    });
                } else {
                    loginFunc();
                }
            }
        },

        /**
         * 功能描述：获取产品的登陆信息
         */
        getProductLoginInfo: function () {
            if (NG.TmpLoginInfoData) {
                NG.TmpLoginInfoData.productLoginID = NG.productLoginID;
                return NG.TmpLoginInfoData;
            }
            var productLoginStore = Ext.getStore('ProductLoginStore'),
                productLoginInfo = productLoginStore.getById('productLoginInfo'),
                LocalStore = Ext.getStore('LocalStore'),
                userInfo = LocalStore.getById('userInfo'),
                loginInfo = {};
            if (productLoginInfo) {
                loginInfo = { isLogin: productLoginInfo.get('isLogin'), loginDate: productLoginInfo.get('loginDate'),
                    productLoginID: NG.productLoginID, //业务账套的真实用户id
                    isAppDemo: NG.isAppDemo,
                    enterprises: productLoginInfo.get('enterprises') || '',
                    loginId: productLoginInfo.get('username'), productAdr: '', eNo: productLoginInfo.get('enterprise'), eName: '', //necall的id
                    approvalTask: {unread: productLoginInfo.get('approvalTask'), title: productLoginInfo.get('approvalTaskTitle')},
                    netCall: {unread: productLoginInfo.get('netCall'), title: productLoginInfo.get('netCallTitle')},
                    documentReceived: {unread: productLoginInfo.get('documentReceived'), title: productLoginInfo.get('documentReceivedTitle')}};
            } else {
                loginInfo = { isLogin: false, loginDate: null, productLoginID: '', loginId: '', productAdr: '', eNo: '', eName: '', approvalTask: {unread: 0, title: '&nbsp;'}, netCall: {unread: 0, title: '&nbsp;'}, documentReceived: {unread: 0, title: '&nbsp;'} };
            }
            if (userInfo) {
                loginInfo.productLoginID = NG.productLoginID;
                loginInfo.loginId = userInfo.get('userName').toLowerCase();
                loginInfo.productAdr = GLOBAL_CONFIG.productAdr;
                loginInfo.eNo = userInfo.get('enterprise');
                loginInfo.eName = userInfo.get('enterpriseName');
                loginInfo.isAppDemo = userInfo.get('isAppDemo');
                if (NG.productLoginID) {
                    NG.TmpLoginInfoData = loginInfo; //将数据缓存下来
                }
            }
            return loginInfo;
        },

        /**
         * 功能描述：修改产品的登录信息
         */
        setProductAdr: function(productAdr) {
            if (NG.TmpLoginInfoData) {
                NG.TmpLoginInfoData.productAdr = productAdr;
            }
        },

        /**
         * 功能描述：设置产品的登陆信息
         */
        setProductLoginInfo: function (tf, config) {
            var productLoginStore = Ext.getStore('ProductLoginStore'),
                productLoginInfo = productLoginStore.getById('productLoginInfo');
            NG.TmpLoginInfoData = null;
            if (tf) {
                var userInfo = Ext.getStore('LocalStore').getById('userInfo');
                var uName = (userInfo ? userInfo.get("userName") : (productLoginInfo ? productLoginInfo.get("username") : '')).toLowerCase();
                if (productLoginInfo) {
                    if (config) {
                        if (config.approvalTask) {
                            productLoginInfo.set("approvalTask", config.approvalTask.unread || 0);
                            productLoginInfo.set("approvalTaskTitle", config.approvalTask.title || "&nbsp;");
                        }
                        if (config.documentReceived) {
                            productLoginInfo.set("documentReceived", config.documentReceived.unread || 0);
                            productLoginInfo.set("documentReceivedTitle", config.documentReceived.title || "&nbsp;");
                        }
                        if (config.netCall) {
                            productLoginInfo.set("netCall", config.netCall.unread || 0);
                            productLoginInfo.set("netCallTitle", config.netCall.title || "&nbsp;");
                        }
                    } else {
                        var enterprises = productLoginInfo.get("enterprises");
                        var enterprise = userInfo ? userInfo.get("enterprise") : '';
                        var enterprisesArray = enterprises ? enterprises.split(',') : [];
                        if(enterprise && enterprisesArray.indexOf(enterprise) < 0) {
                            Ext.Array.insert(enterprisesArray, 0, [enterprise]);
                        }
                        else if(enterprise && enterprisesArray.indexOf(enterprise) >= 0) {
                            Ext.Array.remove(enterprisesArray, enterprise);
                            Ext.Array.insert(enterprisesArray, 0, [enterprise]);
                        }
                        productLoginInfo.set("isLogin", true);
                        productLoginInfo.set("loginDate", new Date());
                        productLoginInfo.set("username", uName);
                        productLoginInfo.set("enterprise", userInfo ? userInfo.get("enterprise") : '');
                        productLoginInfo.set("enterprises", enterprisesArray.join(','));
                        productLoginInfo.set("isAppDemo", NG.isAppDemo);
                    }
                    productLoginInfo.save();
                } else {
                    productLoginInfo = Ext.create('MyApp.model.main.ProductLoginModel', {
                        id: 'productLoginInfo',
                        isLogin: true,
                        loginDate: new Date(),
                        username: uName,
                        enterprise: userInfo ? userInfo.get("enterprise") : '',
                        enterprises: userInfo ? userInfo.get("enterprise") : '',
                        approvalTask: 0,
                        netCall: 0,
                        documentReceived: 0,
                        netCallTitle: '&nbsp;',
                        approvalTaskTitle: '&nbsp;',
                        documentReceivedTitle: '&nbsp;'
                    });
                    productLoginInfo.save();
                    productLoginStore.add(productLoginInfo);
                }
            }
            else if (productLoginInfo) {
                productLoginInfo.set("isLogin", false);
                productLoginInfo.save();
            }
        },

        /**
         * 描述：定义消息类型
         */
        MsgType: {
            NEW: "new", //新闻公告
            WORKFLOW: "workflow", //审批任务
            ARCHIVE: "archive",    //公文收阅
            REPORT: "report",
            UNDERLING: 'underling', //代办任务下属员工确认
            NETCALL: 'netcall' //网络自由呼
        },

        /**
         * 功能描述：推送消息刷新会话页面消息数量
         * controller: 推送消息的控制器（必须项）
         * msgType:    消息类型
         * count:  指定需要更新的消息条数（非必输，正数直接更新当前值，负数则与当前值相减）
         * cancel: 取消更新审批列表消息
         */
        refreshMessageToSession: function (controller, msgType, count, cancel, title, times) {
            var application = controller ? controller.getApplication() : NG.application,
                chatRoomController = application.getController('session.ChatRoomController'),
                LoginInfo = NG.getProductLoginInfo(),
                msgInfo = {},
                params = {}, url,
                times = times || 1;
            if (!(chatRoomController && LoginInfo.isLogin)) {
                return;
            }
            if (!msgType) {
                if(GLOBAL_CONFIG.product.indexOf('i6Pmi') >= 0) {
                    NG.refreshMessageToSession(controller, NG.MsgType.NETCALL);
                    if(GLOBAL_CONFIG.product == 'i6Pmi3') {
                        NG.refreshMessageToSession(controller, NG.MsgType.WORKFLOW);
                    }
                }
                else {
                    NG.refreshMessageToSession(controller, NG.MsgType.WORKFLOW);
                    NG.refreshMessageToSession(controller, NG.MsgType.ARCHIVE);
                    if (NG.getVersion('first') > 1 || (NG.getVersion('first') == 1 && NG.getVersion('second') >= 50)) {
                        NG.refreshMessageToSession(controller, NG.MsgType.UNDERLING);  //下属员工确认消息
                        NG.refreshMessageToSession(controller, NG.MsgType.NETCALL);
                    }
                    NG.refreshMessageToSession(controller, NG.MsgType.REPORT);
                }
                return;
            }
            if (!LoginInfo.productAdr) {
                return;
            }
            if (count === undefined || count === null) {
                switch (msgType) {
                    case NG.MsgType.WORKFLOW:
                        url = LoginInfo.productAdr + "/rest/api/workflow/TaskInstanceList/Get";
                        params = {
                            method: 'GetPendingTaskInstances',
                            logid: LoginInfo.productLoginID,
                            pagesize: 1,
                            pageindex: 0
                        };
                        break;
                    case NG.MsgType.NETCALL:
                        url = LoginInfo.productAdr + "/rest/api/oa/NFCApp/gethomedata";
                        break;
                    case NG.MsgType.ARCHIVE:
                        url = LoginInfo.productAdr + "/rest/api/oa/ArchiveList/Get",
                            params = {
                                optype: 'unread',
                                pagesize: 1
                            };
                        break;
                    case NG.MsgType.UNDERLING:
                        url = LoginInfo.productAdr + "/rest/api/oa/Underling/Get",
                            params = {
                                method: 'GetWatingDataForUnderling',
                                logid: LoginInfo.productLoginID
                            };
                        break;
                    case NG.MsgType.REPORT:
                        application.getController('work.MessageController').modfiyReportMessageCount();
                        break;
                    default:
                        return;
                }
                if (msgType != NG.MsgType.REPORT) {
                    Ext.Ajax.request({
                        url: url,
                        method: 'POST',
                        params: params,
                        success: function (response, opts) {
                            if (response.responseText == "") {
                                NG.sysLog("在 NG.js 中,获取业务信息条数时错误,line 1583");
                                return;
                            }
                            msgInfo[msgType] = { count: 0, title: '&nbsp;' };
                            if (msgType == NG.MsgType.WORKFLOW) {
                                var workFlow = Ext.JSON.decode(response.responseText);
                                if (workFlow.data.length > 0) {
                                    msgInfo[msgType] = { count: Number(workFlow.rowcount), title: workFlow.data[0].taskdesc || workFlow.data[0].bizname };
                                }
                            }
                            else if (msgType == NG.MsgType.NETCALL) {
                                var netcall = Ext.JSON.decode(response.responseText),
                                    jsonData = Ext.JSON.decode(netcall.Ccode);
                                    content = jsonData.Remarks;
                                msgInfo[msgType] = { count: Number(netcall.Data), title: content };
                            }
                            else if (msgType == NG.MsgType.ARCHIVE) {
                                var archive = Ext.JSON.decode(response.responseText),
                                    content = archive.Content;
                                msgInfo[msgType] = { count: Number(archive.RowCount), title: '&nbsp;' };
                                if (content && content.length > 0) {
                                    msgInfo[msgType].title = content[0].cname;
                                }
                            } else if (msgType == NG.MsgType.UNDERLING) {
                                var under = Ext.JSON.decode(response.responseText);
                                if (under.success == 1) {
                                    chatRoomController.setApprovalTaskCount({underling: under.data});
                                } else {
                                    NG.sysLog(under.reptxt);
                                }
                                return;
                            }
                            if (typeof msgInfo[msgType].count != "undefined") {
                                chatRoomController.setApprovalTaskCount(msgInfo);
                                application.getController('work.MessageController').modfiyWorkCount(msgType, msgInfo[msgType].count, cancel);
                            }
                        },
                        failure: function (response, opts) {
                            if(times < 3) {
                                NG.refreshMessageToSession(controller, msgType, null, null, null, ++times);
                            }
                        }
                    });
                }
            }
            else {
                msgInfo[msgType] = { count: count, title: title || '&nbsp;' };
                chatRoomController.setApprovalTaskCount(msgInfo);
            }
        },

        /**
         * 描述：日志类型
         */
        LogType: {
            SYSTEM: "0",   //系统信息
            LOGIN: '1',       //登录日志
            JS: "2",             //js日志
            NATIVE: "3",   //native日志
            OPERATION: "4", //操作信息
            FEEDBACK: "5"   //意见反馈
        },

        /**
         * 功能描述; 记录日志
         * msg:日志信息
         * logType：日志类型(默认为操作信息)
         * stacktrace:堆栈信息
         */
        sysLog: function (msg, logType, stacktrace) {
            if (!msg) {
                return;
            }
            if (!stacktrace) {
                stacktrace = "";
            }
            if (!logType) {
                logType = NG.LogType.OPERATION;
            }
            try { //防止上报日志出错，出现死循环
                var outLog = {},
                    date = new Date(),
                    dateString = Ext.util ? Ext.util.Format.date(date, 'Y-m-d H:i:s') : (date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " 12:00:01"),
                    logName = Ext.util ? "newgrand" + Ext.util.Format.date(date, 'Ymd') + ".log" : ("newgrand" + date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate() + ".log");

                var writeLog = function (logmsg) {
                    NG.logArray = NG.logArray||[];
                    if(NG.isWriting) {
                        NG.logArray.push(logmsg);
                        return;
                    }
                    var write_callback = function() {
                        NG.isWriting = false;
                        if (NG.logArray.length > 0) {
                            writeLog(NG.logArray.shift());
                        }
                    };
                    var fail = function (msg) {
                        console.log(msg);
                    };
                    if (window.cordovaFileDirEntry) {
                        NG.isWriting = true;
                        window.cordovaFileDirEntry.getDirectory("logfiles", { create: true, exclusive: false }, function (dirEntry) {
                            dirEntry.getFile(logName, { create: true, exclusive: false }, function (fileEntry) {
                                fileEntry.createWriter(function (writer) {
                                    writer.onwrite = function (evt) {
                                        if (NG.logArray.length == 0) {
                                            window.setTimeout(function () {
                                                NG.uploadLog();
                                            }, 1000);
                                        }
                                        write_callback();
                                    };
                                    writer.onerror = function (evt) {
                                        write_callback();
                                        console.log("write error");
                                    };
                                    if (writer.length > 0) {
                                        logmsg = "\r\n\r\n\r\n\r\n" + logmsg;
                                        writer.seek(writer.length);
                                    }
                                    writer.write(logmsg);
                                }, function () {
                                    write_callback();
                                });
                            }, function () {
                                write_callback();
                            });
                        });
                    }
                    else {
                        fail(logmsg);
                    }
                };

                if (logType == NG.LogType.SYSTEM) {
                    Ext.Ajax.request({
                        url: GLOBAL_CONFIG.AuthorizeServer + "regservice/regdevice",
                        params: { content: NG.encodeJson(msg) },
                        success: function (retV, opts) {
                            if (retV.responseText != "1") {
                                writeLog(logType + ":" + NG.encodeJson(msg));
                            }
                        },
                        failure: function () {
                            writeLog(logType + ":" + NG.encodeJson(msg));
                        }
                    });
                    return;
                }
                else if (logType == NG.LogType.LOGIN) {
                    outLog = msg;
                }
                else {
                    outLog.logtime = dateString;
                    outLog.errmsg = msg;
                    outLog.stacktrace = stacktrace;
                }
                writeLog(logType + ":" + NG.encodeJson(outLog));
            } catch (e) {
                console.log("sysLog error.");
            }
        },

        encodeJson: function (json) {
            var ec = window.JSON && window.JSON.stringify ? window.JSON.stringify : Ext.JSON.encode;
            return ec(json);
        },

        decodeJson: function (str) {
            var json = null;
            try {
                json = Ext.JSON.decode(str);
                if (!Ext.isObject(json) && !Ext.isArray(json)) {
                    return str;
                }
            } catch (e) {
                json = str;
            }
            return json;
        },

        uploadLog: function () {
            if (navigator.connection.type === Connection.NONE) {
                return;
            }
            var log = function (msg) {
                console.log(msg);
            };
            var LocalStore = Ext.getStore('LocalStore'),
                userInfo = LocalStore.getById('userInfo'),
                params = { uuid: device.uuid, platform: device.platform };
            if (userInfo) {
                params.enpno = userInfo.get("enterprise");
                params.user = userInfo.get("userName");
                params.enpname = userInfo.get("enterpriseName");
            }

            if (window.cordovaFileDirEntry) {
                var upLoad = function (tmpEntry) {
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    options.fileName = tmpEntry.name;
                    options.mimeType = NG.getMIMEType(tmpEntry.name);
                    options.params = params;

                    var ft = new FileTransfer();
                    ft.upload(tmpEntry.fullPath, GLOBAL_CONFIG.LogServer, function () {
                        log("上传成功.");
                        tmpEntry.remove(function () {
                            log("删除成功.");
                        }, function () {
                            log("删除失败.");
                        });
                    }, function (code) {
                        log("上传失败." + code.code);
                    }, options);
                };

                window.cordovaFileDirEntry.getDirectory("logfiles", { create: true, exclusive: false }, function (dirEntry) {
                    var directoryReader = dirEntry.createReader();
                    directoryReader.readEntries(function (entries) {
                        var Count = entries.length;
                        if (Count > 0) {
                            log("开始上传日志文件...");
                            for (var i = 0; i < Count; i++) {
                                upLoad(entries[i]);
                            }
                        }
                    }, function () {
                        log("readEntries fail!");
                    });
                }, function () {
                    log('getDirectory fail!');
                });
            }
        },

        /*
         * 功能描述： 将dom元素滚动到可视区域
         */
        scrollIntoView: function (dom) {
            if (dom) {
                if (dom.scrollIntoViewIfNeeded) {
                    dom.scrollIntoViewIfNeeded(true);
                } else {
                    dom.scrollIntoView(false);
                }
            }
        },

        openAttachFile: function(config) {
            var target = config.target,
                openFile = function (fileUrl, fileName) {
                    if (fileName.indexOf('.jpg') > 0) {
                        NG.showImage(null, fileUrl);
                    }
                    else if (fileName.indexOf('.mp4.zip') > 0) {
                        NG.playVideo({
                            url: fileUrl
                        });
                    }
                    else {
                        NG.openFile(fileUrl, Ext.emptyFn, Ext.emptyFn, fileName || '附件');
                    }
                };
            if (target.downloadurl) {
                openFile(target.downloadurl, target.fileName);
                return;
            }
            else {
                NG.setWaiting(true, "正在获取附件地址..");
                Ext.Ajax.request({
                    url: NG.getProductLoginInfo().productAdr + config.fileUrl,
                    method: 'GET',
                    success: function(response, opts) {
                        var resp = NG.decodeJson(response.responseText);
                        NG.setWaiting(false);
                        if (resp.downloadurl) {
                            target.downloadurl = NG.replaceURL(resp.downloadurl);
                            target.fileName = config.fileName;
                            openFile(target.downloadurl, config.fileName);
                        } else if (resp.base64) {
                            target.downloadurl = 'data:image/jpeg;base64,' + resp.base64;
                            NG.showImage(null, target.downloadurl);
                        } else {
                            NG.alert("无法获取附件地址");
                        }
                    },
                    failure: function(response, opts) {
                        NG.setWaiting(false);
                        NG.alert('获取附件失败');
                        NG.sysLog('获取附件失败:' + response.responseText);
                    }
                });
            }
        },

        dateOfFormat: function(stringDate) {
            if(!stringDate) {
                return stringDate;
            }
            var arrayOfDate = stringDate.split('-'),
                arrayOfTemp,
                newDate;
            if(arrayOfDate.length == 3) {
                arrayOfTemp = arrayOfDate[2].split(' ');
                if(arrayOfTemp.length >= 2) {
                    newDate = arrayOfDate[1] + '/' + arrayOfTemp[0] + '/' + arrayOfDate[0];
                    for(var i=1; i<arrayOfTemp.length; i++) {
                        newDate = newDate + ' ' + arrayOfTemp[i];
                    }
                    return newDate;
                }
                else if(arrayOfTemp.length == 1) {
                    return arrayOfDate[1] + '/' + arrayOfTemp[0] + '/' + arrayOfDate[0];
                }
                else {
                    return stringDate;
                }
            }
            else {
                return stringDate;
            }
        },

        /**
         * 功能描述：根据要求，返回版本号对应的字段
         * @param type
         * @returns {*}
         */
        getVersion: function(type) {
            var versions = NG.version.split('.');
            switch(type) {
                case 'first':
                    return parseInt((versions.length>0 ? versions[0] : '0'));
                    break;
                case 'second':
                    return parseInt((versions.length>1 ? versions[1] : '0'));
                    break;
                case 'third':
                    return parseInt((versions.length>2 ? versions[2] : '0'));
                    break;
                default:
                    return NG.version;
            }
        },

        /*
         * 功能描述： 全局参数
         */
        GLOBAL_PARAMS: {
            videoQuality: 0, //非wifi下视频质量 0是流畅，1是标准
            androidAnimation: false // 默认android下不启用动画
        },

        getVideoQuality: function () {
            return navigator.connection.type == Connection.WIFI ? 1 : (NG.GLOBAL_PARAMS.videoQuality == 1 ? 1 : 2);
        },

        topChatData:{}
    };
    NG.popWinComponent = null;
    NG.IsRunning = true;
    window.NG = NG;
})(window);