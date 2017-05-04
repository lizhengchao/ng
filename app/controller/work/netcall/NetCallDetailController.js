/**
 * Created by ibm on 2015/11/12.
 */
Ext.define('MyApp.controller.work.netcall.NetCallDetailController', {
    extend: 'Ext.app.Controller',
    config: {
        scrollHandler: null,
        hisIndex: 1,
        isLoading: false,
        views: ['work.netcall.NetCallAddView', 'work.netcall.NetCallDetailView'],
        refs: {
            netCallAddView: 'netCallAddView',
            netCallAddView_backBtn: 'netCallAddView button[name=backBtn]',
            sendBtn: 'netCallAddView button[name=sendBtn]',
            outerSwitch: 'netCallAddView label[name=outer]',
            outerContainer: 'netCallAddView container[name=outer]',
            outer_phone: 'netCallAddView textfield[fieldName=outer_phone]',
            outer_email: 'netCallAddView textfield[fieldName=outer_email]',
            masterBtn: 'netCallAddView button[name=master]',
            ccBtn: 'netCallAddView button[name=cc]',
            attachBtn: 'netCallAddView button[name=attach]',
            attachmentContainer: 'netCallAddView container[name=attachmentContainer]',
            netcallAddBar: 'netCallAddView titlebar[name=netcallAddBar]',
            ccContainer: 'netCallAddView container[name=ccContainer]',
            masterField: 'netCallAddView textfield[name=masterField]',
            ccField: 'netCallAddView textfield[name=ccField]',
            themeField: 'netCallAddView textfield[name=themeField]',
            originalContent: 'netCallAddView container[name=originalContent]',
            contentInput: 'netCallAddView textareainput[name=contentInput]',

            ngTabPanel: 'netCallView ngtabpanel',
            netCallDetailView: 'netCallDetailView',
            newsMsgContainer: 'netCallDetailView ngaccordion[name=newsMsg]',
            bottomBar: 'netCallDetailView container[name=bottomBar]',
            netCallDetailView_backBtn: 'netCallDetailView button[name=backBtn]',
            taptpl: 'netCallDetailView taptpl[name=attachList1]',
            historyContent: 'netCallDetailView container[name=historyContent]',
            hisTitleLabel: 'netCallDetailView label[name=hisTitle]',
            hisMoreLabel: 'netCallDetailView label[name=hisMoreLabel]'
        },
        control: {
            netCallAddView: {
                initialize: 'netCallAddViewInit'
            },
            netCallAddView_backBtn: {
                tap: 'backBtn_tap'
            },
            sendBtn: {
                tap: 'sendBtn_tap'
            },
            masterBtn:{
                tap: 'selectSendObject'
            },
            ccBtn:{
                tap: 'selectSendObject'
            },
            attachBtn: {
                tap: 'attachBtn_tap'
            },

            netCallDetailView: {
                initialize: 'netCallDetailViewInit'
            },
            netCallDetailView_backBtn: {
                tap: 'backBtn_tap'
            },
            taptpl:{
                itemTap:function(me, record, target, index, e) {
                    this.attachList_onTap(me, index, target, {data: record});
                }
            }
        }
    },

    /*
     * 功能描述：初始化寻呼发送界面
     */
    netCallAddViewInit: function (view) {
        var outerSwitch = this.getOuterSwitch(),
            attachmentContainer = this.getAttachmentContainer();
        this.filePath = '';
        this.attachsHashMap = [];
        this.attachsMyPicHashMap = [];
        this.attachsMyPic = [];
        this.attachsAdded = [];
        this.attachsPath = [];

        outerSwitch.element.on({
            tap: 'switchOuterContainer',
            scope: this
        });
        attachmentContainer.element.on({
            tap: 'openAttachment',
            delegate: '.pro-btn',
            scope: this
        });

        this.guid = '';
        // 初始化需要提交的表单数据对象
        this.submitObj = {
            master: '',
            cc: '',
            outer_phone: '',
            outer_email: '',
            subject: '',
            content: '',
            attachment: '',
            msgcode: '',
            sender: '',
            istransmit: '',
            attachcode: ''
        };

        if (view.getMessageType() == '1') {
            var initObject = view.getInitObject();
            var jsonData = Ext.JSON.decode(initObject.Data);
            var content = [
                '<div style="color:#AAA9A9;">',
                '<div style="text-align:center;">原始寻呼</div>',
                '<div style="padding-top:5px;">发送人：' + jsonData.SenderName + '</div>',
                '<div style="padding-top:5px;">发送时间：' + jsonData.Sendtimer + '</div>',
                '<div style="padding-top:5px;">接收人：' + jsonData.RecvName + '</div>',
                '<div style="padding-top:5px;padding-bottom:10px;">主题：' + jsonData.CName + '</div>',
                '<div style="padding-top:5px;">' + (jsonData.Remarks || jsonData.Msgcontent) + '</div>',
                '</div>'
            ].join('');
            this.getNetcallAddBar().setTitle('寻呼回复');
            this.getMasterField().setLabel('其他人');
            this.getCcContainer().setHidden(true);
            this.getThemeField().setReadOnly(true);
            this.getThemeField().setValue(jsonData.CName);
            this.getOriginalContent().setHidden(false);
            this.getOriginalContent().setHtml(content);
            console.log(jsonData);
            this.submitObj = {
                master: '',
                cc: '',
                outer_phone: '',
                outer_email: '',
                subject: jsonData.CName,
                content: '',
                attachment: '',
                msgcode: jsonData.CCode,
                sender: jsonData.Sender,
                istransmit: '',
                attachcode: ''
            };
        }
        else if (view.getMessageType() == '2') {
            var initObject = view.getInitObject(),
                jsonData = Ext.JSON.decode(initObject.Data),
                attachs = initObject.Attachs || [],
                attachmentContainer = this.getAttachmentContainer(),
                fileURI = '',
                key = '';
            this.submitObj.istransmit = '1';
            this.submitObj.msgcode = jsonData.CCode;
            this.getNetcallAddBar().setTitle('寻呼转发');
            this.getThemeField().setValue(jsonData.CName);
            this.getContentInput().setValue(jsonData.Remarks || jsonData.Msgcontent);
            for (var i = 0; i < attachs.length; i++) {
                fileURI = '?arccode=' + attachs[i].arccode + '&arctable=' + attachs[i].arctable + '&attachname=';
                this.filePath = this.filePath != '' ? this.filePath : fileURI;
                this.attachsHashMap.push(attachs[i].attachname);
                key = attachs[i].attachname.lastIndexOf('.zip') == attachs[i].attachname.length - 4 ? 'takeVideo' : 'openMyPic';
                attachmentContainer.add({
                    xtype: 'img',
                    attachname: attachs[i].attachname,
                    fileURI: fileURI,
                    key: key,
                    cls: 'pro-btn',
                    src: key == 'takeVideo' ? 'resources/images/work/p3.png' : 'resources/images/work/p1.png',
                    margin: '0 12 0 0',
                    height: 30,
                    width: 30
                });
                attachmentContainer.getParent().setHidden(false);
            }
        }
        else if (view.getMessageType() == '3') {
            var initObject = view.getInitObject(),
                jsonData = Ext.JSON.decode(initObject.Data),
                attachs = initObject.Attachs || [],
                dts = initObject.Dt || [],
                attachmentContainer = this.getAttachmentContainer(),
                fileURI = '',
                key = '',
                master = [],
                cc = [];
            this.submitObj.istransmit = '1';
            this.submitObj.msgcode = jsonData.CCode;
            this.submitObj.master = '';
            this.submitObj.cc = '';
            this.getMasterField().setValue(jsonData.RecvName);
            this.getCcField().setValue(jsonData.CopyName);
            this.getThemeField().setValue(jsonData.CName);
            this.getContentInput().setValue(jsonData.Remarks || jsonData.Msgcontent);
            for (var i = 0; i < attachs.length; i++) {
                fileURI = '?arccode=' + attachs[i].arccode + '&arctable=' + attachs[i].arctable + '&attachname=';
                this.filePath = this.filePath != '' ? this.filePath : fileURI;
                this.attachsHashMap.push(attachs[i].attachname);
                key = attachs[i].attachname.lastIndexOf('.zip') == attachs[i].attachname.length - 4 ? 'takeVideo' : 'openMyPic';
                attachmentContainer.add({
                    xtype: 'img',
                    fileURI: fileURI,
                    key: key,
                    cls: 'pro-btn',
                    src: key == 'takeVideo' ? 'resources/images/work/p3.png' : 'resources/images/work/p1.png',
                    margin: '0 12 0 0',
                    height: 30,
                    width: 30
                });
                attachmentContainer.getParent().setHidden(false);
            }
            for (var j = 0; j < dts.length; j++) {
                if (dts[j].iscopyer == '0') {
                    master.push(dts[j].msgreciever);
                }
                else if (dts[j].iscopyer == '1') {
                    cc.push(dts[j].msgreciever);
                }
            }
            this.submitObj.master = master.join(',');
            this.submitObj.cc = cc.join(',');
        }
        this.netCallAddViewPainted(view);
    },

    /*
     * 功能描述：解决点击穿透，输入框自动获取焦点的问题
     */
    netCallAddViewPainted: function(view) {
        if (view.isPainted()) {
            window.setTimeout(function () {
                view.removeCls('prevent-pointer-events')
            }, 100);
        } else {
            view.on("painted", function () {
                this.netCallAddViewPainted(view);
            }, this, {single: true}); //只执行一次
        }
    },

    /*
     * 功能描述：显示或隐藏外部手机、邮箱组件
     */
    switchOuterContainer: function () {
        var outerSwitch = this.getOuterSwitch(),
            outerContainer = this.getOuterContainer(),
            isHidden = !outerContainer.getHidden(),
            outerTip = '外部手机、邮箱(多条用‘,’隔开)<div style="border-left: 5px solid transparent; border-right: 5px solid transparent;position: absolute;top: 12px;right: 20px;';
        if (isHidden) {
            outerTip += 'border-top: 5px solid gray;"></div>';
        } else {
            outerTip += 'border-bottom: 5px solid gray;"></div>';
        }
        outerSwitch.setHtml(outerTip);
        outerContainer.setHidden(isHidden);
    },

    /*
     * 功能描述：选择发送对象（主送或抄送，目前选择员工）
     */
    selectSendObject: function(btn) {
        var me = this,
            name = btn.config.name,
            textField = Ext.getCmp(btn.element.prev().id);
        NG.Helper.openPersonHelp({
            isEmp: true,
            title: '选择发送对象',
            multi: true,
            callback: function (data) {
                var empNos = [], empName = [];
                for (var i = 0, len = data.length; i < len; i++) {
                    if (Ext.Array.indexOf(empNos, data[i].usercode) < 0) {
                        empNos.push(data[i].usercode);
                        empName.push(data[i].username);
                    }
                }
                me.submitObj[name] = empNos.join(',');
                textField.setValue(empName.join('、'));
            }
        });
    },

    /*
     * 功能描述：点击发送按钮
     */
    sendBtn_tap: function (btn) {
        var me = this;
        if (me.validSubmitObj()) {
            NG.pop(btn, [
                { title: '消息发送', id: 'sendMessage' },
                { title: '消息+短信发送', id: 'sendMessageExtended' }
            ], function (pop, index, target, record) {
                me[record.data.id]();
            }, {width: 140});
        }
    },

    /*
     * 功能描述：选择附件
     */
    attachBtn_tap: function() {
        var me = this;
        NG.showWindowList({
            title: '选择附件',
            itemTpl: '<div class="font14" style="line-height: 24px;text-align:center;">{name}</div>',
            data: [
                {name: '我的照片', code: 'openMyPic'},
                {name: '手机相册', code: 'openPhPic'},
                {name: '拍照', code: 'takePicture'},
                {name: '录像', code: 'takeVideo'}
            ],
            callback: function (record) {
                var code = record.code;
                NG.Helper[code](function (fileURI) {
                    me.uploadAth({
                        key: code,
                        fileURI: fileURI
                    });
                })
            }
        });
    },

    /*
     * 功能描述：验证新增单据的数据对象
     */
    validSubmitObj: function() {
        var netcallAddView = this.getNetCallAddView();
        var fields = netcallAddView.query("[fieldName]");
        for (var i = 0, len = fields.length; i < len; i++) {
            var value = '',
                field = fields[i],
                name = field.config.fieldName;
            if (field.getValue) {
                value = field.getValue();
            }
            this.submitObj[name] = value;
        }
        if(netcallAddView.getMessageType() != '1') {
            if (Ext.isEmpty(this.submitObj.master)) {
                NG.alert('主送对象不能为空.');
                return false;
            }
        }
        if (Ext.isEmpty(this.submitObj.content)) {
            NG.alert('寻呼内容不能为空.');
            return false;
        }
        return true;
    },

    /**
     * 发布寻呼
     * @param isSendMessage:是否发送短信 1:发送，0:不发送
     */
    sendNFCMessage: function(isSendMessage) {
        var me = this,
            reciever = this.submitObj.master;
        if(this.getNetCallAddView().getMessageType() == '1') {
            reciever = reciever == '' ? this.submitObj.sender : reciever + ',' + this.submitObj.sender;
        }
        this.NFCApi({
            action: 'insert',
            params: {
                asr_guid: this.submitObj.attachment,
                msgcode: this.submitObj.msgcode,
                istransmit: this.submitObj.istransmit,
                attachcode: this.submitObj.attachcode,
                jsondata: Ext.JSON.encode({
                    cname: this.submitObj.subject,
                    remarks: this.submitObj.content,
                    extramobile: this.submitObj.outer_phone,
                    email: this.submitObj.outer_email,
                    reciever: reciever,
                    creciever: this.submitObj.cc,
                    sendmessage: isSendMessage
                })
            },
            success: function (r) {
                if (r.status == 'ok') {
                    NG.alert('发送成功.');
                    NG.application.onBackKeyDown();
                    me.getNgTabPanel().updateTabBarActiveItem(1);
                } else {
                    NG.alert('发送失败.');
                    NG.sysLog(r.msg);
                }
            },
            autoWaiting: "正在发送..."
        });
    },

    /*
     * 功能描述：消息发送
     */
    sendMessage: function () {
        this.sendNFCMessage('0');
    },

    /*
     * 功能描述：消息+短信发送
     */
    sendMessageExtended: function () {
        this.sendNFCMessage('1');
    },

    /*
     * 功能描述：上传附件
     */
    uploadAth: function (config) {
    	var me = this,
            serverUrl,
            fileTransfer,
            options,
            success, fail,
            reSendTime = 0;
        Ext.applyIf(config, {
            fileName: config.fileURI.substr(config.fileURI.lastIndexOf('/') + 1),
            ext: config.fileURI.substr(config.fileURI.lastIndexOf('.') + 1)
        });
        if (config.fileURI.lastIndexOf(".mp4") == config.fileURI.length - 4) {
            config.fileName += ".zip";
            config.ext = "zip";
        }
        success = function (response) {
            NG.setWaiting(false);
            
            var attachmentContainer = me.getAttachmentContainer();
	        //此处需要调用上传接口再插入数据，现在只是模拟数据，所以直接插入item
	        //上传成功后将返回的guid保存到 this.submitObj.attachment里面, 提交的时候直接提交 this.submitObj 就可以了
	        if (config.fileURI) {
	            //由于服务器iis的限制，上传视频的时候，需要在文件后缀名上增加一个.zip，
	            //注意下载打开的时候，.mp4.zip格式的文件为视频文件，
	            //具体操作方法可以参考现场检查【work.project.ProjectCheckDetailController的 uploadAth 方法】
	            attachmentContainer.add({
	                xtype: 'img',
	                fileURI: config.fileURI,
	                key: config.key,
	                cls: 'pro-btn',
	                src: config.key == 'takeVideo' ? 'resources/images/work/p3.png' : 'resources/images/work/p1.png',
	                margin: '0 12 0 0',
	                height: 30,
	                width: 30
	            });
                if (config.key && config.key != 'takeVideo') {
                    me.attachsMyPic.push(config.fileURI);
                    me.attachsMyPicHashMap.push(config.fileURI);
                }
	            attachmentContainer.getParent().setHidden(false);
	        }
            
            if (response.response || response.responseText) {
                response = response.response || response.responseText;
                var responseJson = NG.decodeJson(response);
                if (responseJson.status == 'ok') {
                    if (Ext.isEmpty(me.guid)) {
                        me.submitObj.attachment = responseJson.msg;
                        me.guid = responseJson.msg;
                    }
                }
            }
        };
        fail = function () {
            if (reSendTime <= 2) {
                reSendTime++;
                me.uploadAth(config);
            } else {
                NG.alert('上传附件失败');
            }
        };
        if (config.key && config.key == 'openMyPic') {
            NG.setWaiting(true, '正在上传附件');
            Ext.Ajax.request({
                url: NG.getProductLoginInfo().productAdr + "/rest/api/oa/Common/copyattach",
                method: 'GET',
                params: {
                    ccode: me.guid,
                    asr_guid: config.fileURI,
                    tname: 'fg_msginfo'
                },
                success: success,
                failure: fail
            });
        }
        else {
            serverUrl = NG.getProductLoginInfo().productAdr + "/rest/api/NFCApp/saveattach";
            fileTransfer = new FileTransfer();
            options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = config.fileName;
            options.mimeType = MIME_MapTable[config.ext];
            options.chunkedMode = false;
            options.params = {
                ccode: me.guid
            };
            NG.setWaiting(true, '正在上传附件');
            fileTransfer.upload(config.fileURI, serverUrl, success, fail, options, true);
        }
    	
    },

    /**
     * 功能描述：获得附件下载地址
     */
    getAttachDownloadUrl: function (config) {
        NG.setWaiting(true, "正在获取附件地址..");
        Ext.Ajax.request({
            url: NG.getProductLoginInfo().productAdr + "/rest/api/oa/ArchiveAttach/GetArchiveAttachment" + config.fileUrl,
            method: 'GET',
            success: config.success,
            failure: config.failure
        });
    },

    /*
     * 功能描述：打开附件
     */
    openAttachment: function(ev) {
        var me = this,
            targetCmp = Ext.getCmp(ev.delegatedTarget.id),
            config,
            key = targetCmp.config.key,
            fileUrl = targetCmp.config.fileURI,
            fileName = targetCmp.config.attachname,
            openFile = function (url, isMP4, fileName, position, fileType) {
                if (isMP4 || url.lastIndexOf(".mp4") == url.length - 4) {
                    NG.playVideo({
                        url: url
                    });
                } else {
                    if (fileType && fileType.indexOf('jpg') >= 0) {
                        NG.showImage(null, url, null, null, null, null, {attachs: me.attachsPath, position: position});
                    } else {
                        NG.openFile(url, Ext.emptyFn, Ext.emptyFn, fileName || '附件');
                    }
                }
            };
        if (targetCmp.downloadurl) {
            openFile(targetCmp.downloadurl, fileUrl.indexOf(".mp4.zip") > 0);
            return;
        }
        var attachsFunction = function() {
            var paths = [],
                myPicPath = '',
                i = 0,
                sizeOfPic = me.attachsMyPic.length,
                position = -1;
            myPicPath = sizeOfPic > 0 ? me.attachsMyPic[0] : '';
            config = {
                fid: myPicPath,
                success: function (response, opts) {
                    var resp = NG.decodeJson(response.responseText);
                    NG.setWaiting(false);
                    if (resp.base64) {
                        paths.push('data:image/jpeg;base64,' + resp.base64);
                        i += 1;
                        if(i < sizeOfPic) {
                            for(; i<sizeOfPic; i++) {
                                if(me.attachsMyPic[i].indexOf('.') > 0) {
                                    paths.push(me.attachsMyPic[i]);
                                }
                                else {
                                    config.fid = me.attachsMyPic[i];
                                    me.getMyPicDownloadUrl(config);
                                    break;
                                }
                            }
                        }
                        if(i >= sizeOfPic) {
                            me.attachsPath = me.attachsPath.concat(paths);
                            if(key == 'openMyPic' || key == 'openPhPic' || key == 'takePicture') {
                                position = me.attachsMyPicHashMap.indexOf(fileUrl) + me.attachsHashMap.length;
                            }
                            else {
                                position = me.attachsHashMap.indexOf(fileName);
                            }
                            openFile(me.attachsPath[position], false, null, position, 'jpg');
                            me.attachsMyPic = [];
                            paths = [];
                        }
                    } else {
                        paths = [];
                        NG.alert("获取附件失败");
                        NG.sysLog('获取附件失败:' + response.responseText);
                    }
                },
                failure: function (response, opts) {
                    NG.setWaiting(false);
                    paths = [];
                    NG.alert('获取附件失败');
                    NG.sysLog('获取附件失败:' + response.responseText);
                }
            };
            if (me.attachsMyPic.length > 0) {
                for(; i<sizeOfPic; i++) {
                    if(me.attachsMyPic[i].indexOf('.') > 0) {
                        paths.push(me.attachsMyPic[i]);
                    }
                    else {
                        config.fid = me.attachsMyPic[i];
                        me.getMyPicDownloadUrl(config);
                        break;
                    }
                }
            }
            if(i >= sizeOfPic) {
                NG.setWaiting(false);
                me.attachsPath = me.attachsPath.concat(paths);
                if(key == 'openMyPic' || key == 'openPhPic' || key == 'takePicture') {
                    position = me.attachsMyPicHashMap.indexOf(fileUrl) + me.attachsHashMap.length;
                }
                else {
                    position = me.attachsHashMap.indexOf(fileName);
                }
                openFile(me.attachsPath[position], false, null, position, 'jpg');
                me.attachsMyPic = [];
                paths = [];
            }
        };
        var successFunction = function (response, opts, isMyPic) {
            if(isMyPic == true) {
                attachsFunction();
            }
            else {
                var resp = NG.decodeJson(response.responseText);
                if (resp.downloadurl) {
                    me.attachsAdded = resp.downloadurl;
                    Ext.Array.forEach(me.attachsAdded, function (item, position) {
                        me.attachsAdded[position] = NG.replaceURL(item);
                    });
                    me.attachsPath = me.attachsAdded.concat(me.attachsPath);
                    attachsFunction();
                }
                else {
                    NG.alert("无法获取附件地址");
                }
            }
        };
        if(key == 'takeVideo') {
            NG.setWaiting(true, "正在获取附件地址..");
            Ext.Ajax.request({
                url: NG.getProductLoginInfo().productAdr + "/rest/api/oa/ArchiveAttach/Get" + fileUrl + targetCmp.config.attachname,
                method: 'GET',
                success: function (response, opts) {
                    var resp = Ext.JSON.decode(response.responseText);
                    if (resp.downloadurl) {
                        NG.setWaiting(false);
                        targetCmp.downloadurl = NG.replaceURL(resp.downloadurl);
                        openFile(targetCmp.downloadurl, fileUrl.indexOf(".mp4.zip") > 0);
                    }
                    else {
                        NG.alert("无法获取附件地址");
                    }
                },
                failure: function () {
                    NG.alert(GLOBAL_CONFIG.NetWorkError, 1500);
                }
            });
        }
        else {
            NG.setWaiting(true, "正在获取附件地址..");
            config = {
                fileUrl: me.filePath + me.attachsHashMap.join(','),
                success: successFunction,
                failure: function (response, opts) {
                    NG.setWaiting(false);
                    NG.alert('获取附件失败');
                    NG.sysLog('获取附件失败:' + response.responseText);
                }
            };
            if(me.attachsHashMap.length > 0 && me.attachsAdded.length <= 0) {
                me.getAttachDownloadUrl(config);
            }
            else {
                successFunction(null, null, true);
            }
        }
    },

    getMyPicDownloadUrl: function(config) {
        Ext.Ajax.request({
            url: NG.getProductLoginInfo().productAdr + '/rest/api/attachment/mypicture/get',
            method: 'GET',
            params: {
                fid: config.fid,
                action: 'getresourceimage'
            },
            success: config.success,
            failure: config.failure
        });
    },

    /*************************************************************/
    /*               新增----这是分割线---查看                   */
    /*************************************************************/

    /*
     * 功能描述：初始化寻呼查看界面
     */
    netCallDetailViewInit: function (view) {
        var item,
            ncIndex = view.getNcIndex(),
            bottomBar = this.getBottomBar(),
            itemArr = bottomBar.getInnerItems(),
            ccode = view.getCcode(),
            me = this;
        me.detailAttachsHashMap = [];
        me.detailAttachsPath = [];
        me.detailFilePath = '';
        me.detailData = null;
        me.setScrollHandler(null);
        me.setHisIndex(1);
        me.setIsLoading(false);
        for (var i = 0, len = itemArr.length; i < len; i++) {
            item = itemArr[i];
            if (item.config.ncIndex && item.config.ncIndex.indexOf(ncIndex) < 0) {
                item.setHidden(true);
            } else {
                item.setHidden(false);
            }
        }
        bottomBar.element.on({  //设置底部工具条的点击事件
            scope: this,
            delegate: '.x-button',
            tap: 'bottomBar_tap'
        });
        me.NFCApi({
            action: 'getMsgInfo',
            params: {
                ccode: ccode
            },
            success: function (r) {
                me.updateDetailView(r);
                me.detailData = r;
                if(r.msghis.length >= 10) {
                    var scrollHandler = function(obj, positionX, positionY) {
                        if (positionY == obj.getMaxPosition().y && obj.dragDirection.y > 0) {
                            if(me.getIsLoading() == false) {
                                me.moreHistoryLoad();
                            }
                        }
                    };
                    me.setScrollHandler(scrollHandler);
                    me.getHisMoreLabel().setHidden(false);
                    me.getNetCallDetailView().getScrollable().getScroller().addListener('scrollend', scrollHandler);
                }
            },
            autoWaiting: "正在加载..."
        });
    },

    moreHistoryLoad: function() {
        var me = this,
            data = me.getHistoryContent().getData();
        me.setIsLoading(true);
        this.NFCApi({
            action: 'getothermsg',
            params: {
                ccode: this.getNetCallDetailView().getCcode(),
                index: me.getHisIndex()
            },
            success: function (r) {
                NG.alert('加载成功.');
                me.setHisIndex(me.getHisIndex() + 1);
                me.getHistoryContent().setData(data.concat(r));
                me.setIsLoading(false);
                if(r.length < 10) {
                    me.getNetCallDetailView().getScrollable().getScroller().removeListener('scrollend', me.getScrollHandler());
                    me.getHisMoreLabel().setHidden(true);
                }
            },
            failure: function() {
                NG.alert('加载失败.');
                me.setIsLoading(false);
            },
            autoWaiting: "正在加载..."
        });
    },

    updateDetailView: function(resp) {
        var me = this;
        var respData = Ext.JSON.decode(resp.Data),
            msghis = resp.msghis || [];
        var serverAdr = NG.getProductLoginInfo().productAdr;
        var netCallDetailView = me.getNetCallDetailView();
        if(!netCallDetailView.getHasread()) {
            NG.refreshMessageToSession(null, NG.MsgType.NETCALL);
            netCallDetailView.setHasread(true)
        }
        netCallDetailView.down('container[name=newsTittle]').setHtml('<div>' + respData.CName + '</div>');
        me.getNewsMsgContainer().setItems([
            {
                xtype: 'container',
                cls: 'noAfter',
                hidden: true,
                spacing: 0,
                topIndex: 0,
                padding: "6 0 6 10",
                title: respData.SenderName + '&nbsp;&nbsp;&nbsp;' + NG.dateFormatOfWork(respData.Sendtimer),
                defaults: {
                    clearIcon: false,
                    cls: "edit-input",
                    labelWidth: 80,
                    labelWrap: true
                },
                items: [
                    {
                        xtype: "textfield",
                        inputCls: "x-input-view",
                        label: "主送",
                        readOnly: true,
                        value: respData.RecvName
                    },
                    {
                        xtype: "textfield",
                        inputCls: "x-input-view",
                        label: "抄送",
                        readOnly: true,
                        value: respData.CopyName
                    },
                    {
                        xtype: "textfield",
                        inputCls: "x-input-view",
                        label: "附件个数",
                        readOnly: true,
                        value: resp.Attachs.length
                    }
                ]
            }
        ]);
        if (resp.Attachs.length > 0) {
            netCallDetailView.down('container[name=attachHeader1]').show();


            var taptpl = netCallDetailView.down('taptpl[name=attachList1]');
            taptpl.show();
            var attachData = resp.Attachs;
            taptpl.setData(NG.changeAttachmentStyle(attachData));
            if(Ext.isArray(attachData) && attachData.length > 0) {
                me.detailFilePath = '?arccode=' + attachData[0].arccode + '&arctable=' + attachData[0].arctable + '&attachname=';
                Ext.Array.forEach(attachData, function (item, position) {
                    if (item.attachname.toLowerCase().indexOf('jpg') > 0 || item.attachname.toLowerCase().indexOf('png') > 0) {
                        me.detailAttachsHashMap.push(item.attachname);
                    }
                });
            }
        }
        else {
            netCallDetailView.down('container[name=attachHeader1]').hide();
            netCallDetailView.down('taptpl[name=attachList1]').hide();
        }
        if(msghis.length != 0) {
            this.getHisTitleLabel().setHidden(false);
        }
        me.getHistoryContent().setData(msghis);
        var newsContent = netCallDetailView.down('container[name=newsContent]');
        newsContent.setHtml(NG.replaceURL(Ext.htmlDecode(respData.Remarks || respData.Msgcontent)));
        newsContent.element.dom.onclick = function(ev){
            var target = ev.target;
            if(target.tagName == "A") { //拦截新闻公告的A标签事件
                if (!Ext.isEmpty(target.href) && target.href != "#" && target.href.indexOf('javascript:') < 0) {
                    NG.openFile(target.href);
                }
                return false;
            }
        };
    },

    /*点击附件下载*/
    attachList_onTap: function (li, index, target, record) {
        var me = this;
        if(record.data.attachname.toLowerCase().lastIndexOf('.jpg') > 0 || record.data.attachname.toLowerCase().lastIndexOf('.png') > 0) {
            if (me.detailAttachsPath.length == 0) {
                me.getAttachDownloadUrl({
                    fileUrl: me.detailFilePath + me.detailAttachsHashMap.join(','),
                    success: function (response, opts) {
                        NG.setWaiting(false);
                        var resp = NG.decodeJson(response.responseText);
                        if (resp.downloadurl) {
                            me.detailAttachsPath = resp.downloadurl;
                            for (var i = 0; i < me.detailAttachsPath.length; i++) {
                                me.detailAttachsPath[i] = NG.replaceURL(me.detailAttachsPath[i]);
                            }
                            var position = me.detailAttachsHashMap.indexOf(record.data.attachname);
                            NG.showImage(null, me.detailAttachsPath[position], null, null, null, null, {
                                attachs: me.detailAttachsPath,
                                position: position
                            });
                        }
                    },
                    failure: function (response, opts) {
                        NG.setWaiting(false);
                        NG.alert('获取附件失败');
                        NG.sysLog('获取附件失败:' + response.responseText);
                    }
                });
            }
            else {
                var position = me.detailAttachsHashMap.indexOf(record.data.attachname);
                NG.showImage(null, me.detailAttachsPath[position], null, null, null, null, {
                    attachs: me.detailAttachsPath,
                    position: position
                });
            }
        }
        else {
            NG.openAttachFile({
                target: target,
                fileUrl: '/rest/api/oa/ArchiveAttach/Get?attachname=' + record.data.attachname + '&arccode=' + record.data.arccode + '&arctable=' + record.data.arctable,
                fileName: record.data.attachname
            });
        }
    },

    /*
     * 功能描述：点击底部工具条按钮
     */
    bottomBar_tap: function (e) {
        var btn = Ext.getCmp(e.delegatedTarget.id),
            btnName = btn ? btn.getText() : '';
        this.execOperation(btnName);
    },

    /*
     * 功能描述：执行回复-收藏-删除-转发-还原等操作
     */
    execOperation: function (op) {
        var me =this;
        switch (op) {
            case '回复':
                var newView = Ext.create('MyApp.view.work.netcall.NetCallAddView', {
                    initObject: this.detailData,
                    messageType: '1'
                });
                Ext.Viewport.add(newView);
                Ext.Viewport.setActiveItem(newView);
                break;
            case '转发':
                var newView = Ext.create('MyApp.view.work.netcall.NetCallAddView', {
                    initObject: this.detailData,
                    messageType: '2'
                });
                Ext.Viewport.add(newView);
                Ext.Viewport.setActiveItem(newView);
                break;
            case '收藏':
                me.NFCApi({
                    action: 'holdnfc',
                    params: {
                        RecieverCCode: me.getNetCallDetailView().getRecieverCCode()
                    },
                    success: function (r) {
                        if (r.status == 'ok') {
                            NG.alert('收藏成功.');
                        } else {
                            NG.alert('收藏失败.');
                            NG.sysLog(r.msg);
                        }
                    },
                    autoWaiting: "正在收藏..."
                });
                break;
            case '删除':
                me.NFCApi({
                    action: 'deleteTemp',
                    params: {
                        RecieverCCode : me.getNetCallDetailView().getRecieverCCode(),
                        ccode: me.getNetCallDetailView().getCcode(),
                        typeIndex: me.getNetCallDetailView().getNcIndex()
                    },
                    success: function (r) {
                        if (r.status == 'ok') {
                            NG.application.onBackKeyDown();
                            me.loadList();
                            NG.alert('删除成功.');
                        } else {
                            NG.alert('删除失败.');
                            NG.sysLog(r.msg);
                        }
                    },
                    autoWaiting: "正在删除..."
                });
                break;
            case '还原':
                me.NFCApi({
                    action: 'resetNFC',
                    params: {
                        RecieverCCode : me.getNetCallDetailView().getRecieverCCode(),
                        ccode: me.getNetCallDetailView().getCcode()
                    },
                    success: function (r) {
                        if (r.status == 'ok') {
                            NG.application.onBackKeyDown();
                            me.loadList();
                            NG.alert('还原成功.');
                        } else {
                            NG.alert('还原失败.');
                            NG.sysLog(r.msg);
                        }
                    },
                    autoWaiting: "正在还原..."
                });
                break;
            case '再次发送':
                var newView = Ext.create('MyApp.view.work.netcall.NetCallAddView', {
                    initObject: this.detailData,
                    messageType: '3'
                });
                Ext.Viewport.add(newView);
                Ext.Viewport.setActiveItem(newView);
                break;
                break;
        }
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
        NG.application.getController('work.netcall.NetCallController').NFCApi(config);
    },

    loadList: function () {
        NG.application.getController('work.netcall.NetCallController').loadList();
    }
});
