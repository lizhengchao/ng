Ext.define('MyApp.controller.work.appflow.AppFlowDetailController', {
    extend: 'Ext.app.Controller',
    requires: ['MyApp.controller.work.appflow.RejectController','MyApp.controller.work.appflow.AppFlowSignController','MyApp.controller.work.appflow.OperatorController', 'MyApp.controller.work.pub.OperatorController'],
    config: {
        views: ['work.appflow.AppFlowSearchField','work.appflow.AppFlowDetailView', 'work.appflow.TaskPanelView', 'work.appflow.AttachPanelView', 'work.appflow.FormPanelView', 'work.appflow.StampListView','work.appflow.RejectPanelView'],
        stores: [ 'work.appflow.RecentContactsStore', 'work.appflow.NextNodeTitleStore', 'work.appflow.StampListStore','work.appflow.FlowHistoryStore', 'work.appflow.NextNodeStore'],
        models: ['work.RecentContactsModel'],
        refs: {
            appFlowListView: 'appFlowListView',
            /*审批详细界面（修改）*/
            appFlowDetailView: 'appFlowDetailView',
            afdetailViewActionToolbar: 'appFlowDetailView container[name=afdetailViewActionToolbar]',
            appTip:'appFlowDetailView container[name=appTip]',

            detailMainView: 'appFlowDetailView ngtabpanel[name=detailmainview]',

            operatorSelectView: 'operatorSelectView', //操作员选择界面

            //button
            voiceBtn: 'taskPanelView image[name=voiceImage]', //审批意见录音
            signImage: 'taskPanelView .image[name=signImage]', //选择签章图片
            playContainer: 'taskPanelView container[name=playImage]',
            playBtn: 'taskPanelView label[name=play]',// 播放录音按钮
            delBtn: 'taskPanelView label[name=delete]',// 播放录音按钮
            appFlowDetailBack: 'appFlowDetailView button[name=backbtn]',
            moreMenuContainer: 'appFlowDetailView container[name=moreMenuContainer]',

            /*任务tab页（修改）*/
            taskPanelView: 'taskPanelView',
            taskContainer: 'taskPanelView ngaccordion[name=taskContainer]',
            commentsText: 'taskPanelView textareafield[name=commentsText]',
            nextNodeList: 'taskPanelView taptpl[name=nextNodeList]',
            nextNodeContainer: 'taskPanelView .container[name=nextNodeContainer]',
            dealContainer: 'taskPanelView .container[name=dealContainer]',
            dealListContainer: 'taskPanelView .container[name=dealListContainer]',
            myMarks: 'taskPanelView taptpl[name=myMarks]',
            moreImage: 'taskPanelView image[name=moreImage]',

            /*签名印章界面*/
            stampListView: 'stampListView',
            stampList: 'stampListView .list[name=stampList]',
            stampListBack: 'stampListView .button[name=stampListBack]',
            stampListConfirm: 'stampListView .button[name=stampListConfirm]',

            /*表单页面*/
            formPanelView: 'formPanelView',

            /*附件界面*/
            attachPanelView: 'attachPanelView',
            attachPanelViewList: 'attachPanelView taptpl[name=attachPanelViewList]'
        },
        control:{
            appFlowDetailView: {
                initialize: 'appFlowDetailView_init',
                destroy: function() {
                    var me = this;
                    if (window.speech) {
                        me.speechcallback = null;
                        window.speech.stop();
                    }
                }
            },

            signImage: {
                tap: 'signImage_onTap'
            },

            myMarks: {
                itemTap: function (mark, record, target, index, e) { //点击标签
                    var tmpTxt = this.getCommentsText().getValue();
                    this.getCommentsText().setValue(tmpTxt + record.text);
                }
            },

            stampList: { //点击签章列表
                itemtap: 'stampList_onitemTap'
            },

            attachPanelViewList: {
                itemTap: 'attachPanelViewList_onItemTap'
            },

            stampListBack: {
                tap: 'stampListBack_onTap'
            },
            stampListConfirm: {
                tap: 'stampListConfirm_onTap'
            },
            nextNodeList: {
                itemTap: 'nextNodeList_onItemTap'
            },
            appFlowDetailBack: {
                tap: 'appFlowDetailBack_onTap'
            },

            taskContainer: {
                beforeExpand: 'taskContainer_beforeExpand'
            }
        }
    },

    /*审批任务详细界面初始化*/
    appFlowDetailView_init: function (panel, eOpts) {
        var me = this,
            attachData,
            cardViews = me.getDetailMainView();

        me.attachsHashMap = [];
        me.attachsPath = [];
        me.downloadurls = [];

        me.initTaskPanelView();
        me.initFormPanelView();

        //情空store中数据
        Ext.getStore('NextNodeStore').removeAll();
        Ext.getStore('NextNodeTitleStore').removeAll();
        /*附件数据*/
        if (!panel.config.appFlowData.bizAttachment || panel.config.appFlowData.bizAttachment.length == 0 ||
            (me.getAppFlowDetailView().config.appFlowData.bizAttachment.length == 1 && me.getAppFlowDetailView().config.appFlowData.bizAttachment[0].isbizcontent == '1')) {
            cardViews.removeAt(3);
            me.filePath = '';
        }
        else {
            attachData = panel.config.appFlowData.bizAttachment;
            panel.query('taptpl[name=attachPanelViewList]')[0].setData(attachData);
            if(Ext.isArray(attachData) && attachData.length > 0) {
                me.filePath = '?arccode=' + attachData[0].arccode + '&arctable=' + attachData[0].arctable + '&attachname=';
                Ext.Array.forEach(attachData, function(item, position) {
                    if(item.attachname.toLowerCase().indexOf('jpg') > 0 || item.attachname.toLowerCase().indexOf('png') > 0) {
                        me.attachsHashMap.push(item.attachname);
                    }
                });
            }
        }
        //任务详情数据
        if (me.pageType == "Edit" && panel.config.appFlowData.taskInstInfo.length > 0) {
            panel.query('container[name=taskDetailContainer]')[0].setData(me.buildTaskInstInfo(panel.config.appFlowData.taskInstInfo[0]));
        } else if (me.pageType == "View" && panel.config.appFlowData.flowInfo.length > 0) {
            panel.query('container[name=taskDetailContainer]')[0].setData(me.buildTaskInstInfo(panel.config.appFlowData.flowInfo[0]));
        } else if (me.pageType == "View_OAWF") {
            panel.query('container[name=taskDetailContainer]')[0].setData(me.buildTaskInstInfo(panel.config.appFlowData.taskInstInfo[0]));
        }
        //流转历史数据
        var hisItems = panel.config.appFlowData.flowHistory,
            hisLen = hisItems.length,
            hisItem;
        for (var i = 0; i < hisLen; i++) {
            hisItem = hisItems[i];
            hisItem.actdt = hisItem.actdt ? NG.dateFormatOfWork(hisItem.actdt) : "";
            hisItem.nodeStyle = "normal-node";
            if (i == hisLen - 1) {
                hisItem.nodeStyle = "active-node";
            }
        }

        if (hisLen > 0) {
            var hisList = panel.down('.component[name=taskHistoryList]');
            hisList.setData(hisItems);
            hisList.element.on({
                    tap: function (e, target) {
                        var audio = target.audio || target.getAttribute("audio"),
                            fileTransfer,
                            cls = target.className;
                        if (audio && cls == "audio") {
                            if (target.voiceSrc) {
                                if (!target.isLoading) { // 如果加载完成直接播放
                                    me.voice_play(target);
                                }
                                return;
                            }
                            if (window.cordovaFileDirEntry) {
                                target.className = "audio data-loading";
                                target.isLoading = true;
                                window.cordovaFileDirEntry.getDirectory("speech", { create: true, exclusive: false }, function (dirEntry) {
                                    var fileName = audio + '.spx';
                                    target.voiceSrc = [dirEntry.fullPath, "/", fileName].join("");
                                    dirEntry.getFile(fileName, null, function () {
                                        target.className = "audio";
                                        target.isLoading = false;
                                        if (!window.currentAudioBtn) {
                                            me.voice_play(target);
                                        }
                                    }, function () {
                                        Ext.Ajax.request({
                                            url: WeChat_GLOBAL_CONFIG.weChatServeAdr + "?requestType=get&requestAds=" + NG.getProductLoginInfo().productAdr + '/rest/api/workflow/TaskInstance/Get?method=GetAudioRemark&audioremark=' + audio,
                                            method: 'GET',
                                            success: function (response, opts) {
                                                var resp = Ext.JSON.decode(response.responseText);
                                                if (resp.url) {
                                                    fileTransfer = new FileTransfer();
                                                    //下载语音文件
                                                    fileTransfer.download(
                                                        NG.replaceURL(resp.url),
                                                        target.voiceSrc,
                                                        function (entry) {
                                                            target.className = "audio";
                                                            target.isLoading = false;
                                                            if (!window.currentAudioBtn) {
                                                                me.voice_play(target);
                                                            }
                                                        },
                                                        function (error) {
                                                            target.className = "audio";
                                                            target.voiceSrc = "";
                                                            NG.sysLog("下载流转历史中的语音文件出错, andio:" + audio);
                                                        },
                                                        true,
                                                        {
                                                            headers: {
                                                                "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    target.className = "audio";
                                                    target.voiceSrc = "";
                                                    NG.sysLog("获取流转历史中的语音文件的地址出错, andio:" + audio);
                                                }
                                            }
                                        });
                                    });
                                });
                            } else {
                                NG.alert("当前设备不支持播放");
                            }
                        }
                    },
                    delegate: 'div.audio',
                    scope: this
                }
            );
        }

        if (me.pageType == "View" || me.pageType == "View_OAWF") {
            me.getAfdetailViewActionToolbar().setHidden(true);
            if (me.pageType == "View_OAWF") {
                me.getAppTip().setHidden(false);
            }
        } else { //流程类型为业务工作流时，转签功能隐藏掉
            var btnArr = ['提交'];
            var flowtype = me.getAppFlowDetailView().config.appFlowInfo.flowtype;
            var taskInfo = panel.config.appFlowData.taskInstInfo[0];
            if (taskInfo.canUndo != 0) {
                btnArr.push('驳回');
            }
            if (taskInfo.canTransmit && taskInfo.canTransmit == 1) {
                btnArr.push('转签');
            }
            if (taskInfo.canTermi == 1) {
                btnArr.push('终止');
            }
            if (taskInfo.canAddTis == 1) {
                btnArr.push('加签');
            }
            if (btnArr.length > 3) {
                btnArr.splice(2, 0, '更多');
            }
            me.initToolBar(btnArr);
        }
    },

    /*
     * 任务界面初始化，需要初始化默认审批意见
     */
    initTaskPanelView: function() {
        var me = this,
            viewContainer = me.getTaskPanelView(),
            taskContainer = me.getTaskContainer(),
            initConfig = me.getAppFlowDetailView().config;
        me.pageType = initConfig.pageType;
        me.needPerson = false; //默认不需要指定办理人
        if (me.pageType == "Edit") {
            viewContainer.nodeArray = []; //初始化选择的节点
            viewContainer.nodePerson = {}; //初始化选择的节点办理人
            //设置常用审批意见标签
            var myMarks = me.getMyMarks(),
                moreImage = me.getMoreImage(),
                markData = initConfig.appFlowData.commonWord,
                nextNodes = initConfig.appFlowData.nextNodes,
                len = markData.length, max = 3,
                newData = [];

            for (var i = 0; i < len; i++) {
                if (i < max) {
                    newData.push({text: markData[i].text, beforeLine: 0});
                }
                markData[i].beforeLine = 0;
            }
            if (len > max) {
                moreImage.setHidden(false);
                moreImage.element.on('tap', function () {
                    if (moreImage.expand) {
                        moreImage.element.setStyle({
                            '-webkit-transform': 'rotate(0deg)'
                        });
                        myMarks.setData(newData);
                    } else {
                        moreImage.element.setStyle({
                            '-webkit-transform': 'rotate(180deg)'
                        });
                        myMarks.setData(markData);
                    }
                    moreImage.expand = !moreImage.expand;
                });
            }
            myMarks.setData(newData);

            if (nextNodes.length > 0) { //有下级节点
                var signNode = initConfig.appFlowData.taskInstInfo[0].designate_node, //是否需要指派下级节点
                    checked = signNode == 0 ? "btn-checked" : "btn-unchecked";
                Ext.each(nextNodes, function (item) {
                    item.checked = checked;
                    if (item.designate_actor == 1) { //节点需要指派人
                        me.needPerson = true;
                        if (signNode == 0) { //不需要指派下级节点但是节点需要指派人，此时自动勾上所有下级节点，同时创建下级节点办理人
                            me.updateDealPanel(item, true);
                        }
                    }
                });

                me.getNextNodeList().setData(nextNodes);
                if (signNode == 1) { //需要指派下级节点
                    taskContainer.expand(3);
                }
                if (!me.needPerson) { //不需要指派办理人，则直接隐藏
                    taskContainer.setItemhidden(4);
                }
            } else { //没有下级节点，隐藏下级节点 或 下级节点办理人
                taskContainer.setItemhidden([3, 4]);
            }

            me.getVoiceBtn().element.on({
                touchstart: 'startRecordAudio',
                touchend: 'stopRecordAudio',
                scope: me
            });

            me.getPlayBtn().element.on({
                tap: function () {
                    me.voice_play(this);
                },
                scope: me.getPlayBtn()
            });
            me.getDelBtn().element.on({
                tap: 'clearPlayBtnStatus',
                scope: me
            });
        } else {
            taskContainer.setItemhidden([2, 3, 4]);
            taskContainer.expand(1);
        }
    },

    /* 表单初始化 */
    initFormPanelView:function() {
        var me = this,
            formPanel = me.getFormPanelView(),
            initConfig = me.getAppFlowDetailView().config,
            flowType = initConfig.appFlowInfo.flowtype,
            bizType = initConfig.appFlowInfo.biztype,
            bizData,
            attachDatas = [];

        for(var i=0; i<initConfig.appFlowData.bizAttachment.length; i++) {
            if(initConfig.appFlowData.bizAttachment[i].isbizcontent == '1') {
                var container = Ext.create('Ext.Label', {
                    style: 'background-color: #ffffff; padding: 6px 12px; margin-bottom:12px;',
                    html: '<img src="resources/images/word.png" style="width:40px;height: 40px;float:left;"/>' +
                    '<div name="contentattach" class="nowrap" style="position: absolute; left: 58px;right: 12px;text-align: left;height: 40px;line-height: 40px;">' + initConfig.appFlowData.bizAttachment[i].attachname + '</div>'
                });
                formPanel.insert(0, container);
                (function(data) {
                    container.element.down('div[name=contentattach]').addListener('touchend', function (view) {
                        //NG.openFile(wordInfo.data);
                        var parms = {
                            arctable: data.arctable,
                            arccode: data.arccode,
                            attachname: data.attachname
                        };
                        if (view.target.downloadurl) {
                            window.open(view.target.downloadurl.replace('127.0.0.1', GLOBAL_CONFIG.Host));
                            //NG.downLoadFile(view.target.downloadurl, data.arctable + "_" + data.arccode, data.attachname, data.attachsize);
                            return;
                        }
                        NG.setWaiting(true, "正在获取附件地址");
                        Ext.Ajax.request({
                            url: WeChat_GLOBAL_CONFIG.weChatServeAdr + "?requestType=post&requestAds=" +NG.getProductLoginInfo().productAdr + "/rest/api/oa/ArchiveAttach/Get",
                            method: 'POST',
                            params: parms,
                            success: function (response, opts) {
                                var resp = Ext.JSON.decode(response.responseText);
                                NG.setWaiting(false);
                                if (resp.downloadurl) {
                                    view.target.downloadurl = resp.downloadurl;
                                    me.downloadurls.push({
                                        downloadurl: resp.downloadurl,
                                        asratttable: data.asrattachtable,
                                        asrtable: data.arctable,
                                        asrcode: data.arccode,
                                        attachname: data.attachname
                                    });
                                    window.open(resp.downloadurl.replace('127.0.0.1', GLOBAL_CONFIG.Host));
                                    //NG.downLoadFile(resp.downloadurl, data.arctable + "_" + data.arccode, data.attachname, data.attachsize);
                                }
                                else {
                                    NG.alert("无法获取附件地址", 1500);
                                }
                            },
                            failure: function (response, opts) {
                                NG.setWaiting(false);
                                NG.alert(GLOBAL_CONFIG.NetWorkError, 1500);
                            }
                        });
                    });
                })(initConfig.appFlowData.bizAttachment[i]);
            }
        }

        me.hasFieldEdit = false;
        me.ExpMap = {}; //计算关系
        me.calcExpDirs = []; //计算路径
        me.bizDataHasChanged = false;
        // initConfig.appFlowData.bizData = me.getTmpData().bizData; //demo数据
        bizData = initConfig.appFlowData.bizData;
        if (bizData && bizType != "RW_ReportApply" && bizType != "AQ_CHK_M" && bizType != "AQ_CHK_M2") { //报表审批,现场检查单独处理
            if (me.pageType == "Edit") {
                me.getExpMapFromBizData(bizData);
            }
            var mainItems = [], detailItems = [],
                mainBiz = bizData[0], detailBiz,
                d_Idx = 0, len = bizData.length;
            if (mainBiz && mainBiz.Type === 0) { // 有主表信息
                d_Idx = 1;
                Ext.each(mainBiz.FieldSetings, function (item, index) {
                    if (item.ColtrolValue != 2) { //隐藏不需要显示
                        var defaultValue = mainBiz.DataRows.length > 0 ? mainBiz.DataRows[0].FieldValueList[index] : {FieldCode: item.FieldCode, Value: "", DisplayValue: "", OriginalValue: ""};
                        mainItems.push(me.getEditField(item, defaultValue, mainBiz.GroupCode + "-" + item.FieldCode + "-0", mainBiz.Type, mainBiz.GroupCode));
                    }
                });
            }
            if (flowType == "oawf") {
                me.getWordInfo(function (wordInfo) {
                    var container = Ext.create('Ext.Label', {
                        style: 'background-color: #ffffff; padding: 6px 12px; margin-bottom:12px;',
                        html: '<img src="resources/images/word.png" style="width:40px;height: 40px;float:left;"/>' +
                            '<div name="myformurl" class="nowrap" style="position: absolute; left: 58px;right: 12px;text-align: left;height: 40px;line-height: 40px;">' + wordInfo.name + '</div>'
                    });
                    formPanel.insert(0, container);
                    container.element.down('div[name=myformurl]').addListener('touchend', function () {
                        NG.openFile(wordInfo.data);
                    });
                });
            } else {
                mainItems.push({
                    xtype: 'label',
                    style: 'background-color: #ffffff; padding: 6px 12px;',
                    html: [ '<div style="display:-webkit-box; padding: 0px;text-align:center; position: relative;">',
                        '<div style="min-height: 30px; width: 90px; text-align:left;display: -webkit-box;-webkit-box-align: center;  color: #AAA9A9; ">单据截图</div>',
                        '<div class="img form-img" style="-webkit-box-flex:1; text-align:left; height: 42px; line-height: 42px; padding-left: 8px; background-size: contain;background-position: 8px 50%;background-repeat: no-repeat; background-image: url(resources/images/form.png);"></div>' ,
                        '</div>'].join(''),
                    listeners: {
                        initialize: function () {
                            this.element.on({
                                delegate: '.img',
                                tap: function (label, target) {
                                    if (!target.isLoadedImg) {
                                        me.openImage(target);
                                    } else if (target.imgSrc) {
                                        NG.showImage(target, target.imgSrc);
                                    }
                                }
                            });
                        }
                    }
                });
            }
            //生成主表单据信息
            formPanel.add({
                defaults: {
                    labelWidth: 90,
                    cls: 'edit-input',
                    clearIcon: false,
                    labelWrap: true
                },
                items: mainItems
            });

            //生成明细表单据信息
            for (var i = d_Idx; i < len; i++) {
                var fields = [];
                detailBiz = bizData[i];
                detailItems.push({xtype: 'label', html: detailBiz.GroupName, style: 'margin-top:12px; height: 32px;line-height: 32px; background-color: #ffffff;color: #AAA9A9; padding-left: 12px;'});
                detailItems.push({
                    xtype: 'ngaccordion',
                    name: detailBiz.GroupCode,
                    cls: 'simple',
                    defaults: {
                        style: 'background-color: #FFFFFF;'
                    },
                    items: me.getDetailTable(detailBiz)
                });
            }
            formPanel.add({
                items: detailItems
            });
        } else {
            if (!bizData) { //兼容历史版本
                me.getVoiceBtn().setHidden(true);
            }
            me.getDetailMainView().on({
                activeitemchange: "OnActiveItemChange",
                scope: me
            });
        }
    },

    //当表单字段的值变化时发生
    onFieldKeyUp: function(node, table, fieldType) {
        if (node.name) {
            var me = this,
                key = node.name.replace(/-\d+$/, ''),
                map = me.ExpMap[key],
                expIndex,
                newNode,
                oldValue,
                newValue,
                dLen = null,
                tmpCmp;
            me.calcExpDirs.push(key);
            for (var i = 0, len = map ? map.length : 0; i < len; i++) {
                if (me.calcExpDirs.indexOf(map[i]) > -1) {
                    continue;
                }
                expIndex = node.name.match(/\d+$/)[0];
                tmpCmp = Ext.getCmp(map[i] + "-" + expIndex) || Ext.getCmp(map[i] + "-0");
                if (tmpCmp && tmpCmp.config.expr) {
                    if (tmpCmp.config.tableType == 1 && tmpCmp.config.table != table) { //更新明细表
                        expIndex = 0;
                        tmpCmp = Ext.getCmp(map[i] + "-" + expIndex);
                        while (tmpCmp && tmpCmp.config.expr) {
                            oldValue = tmpCmp.getValue();
                            if (tmpCmp.config.fieldType == "int") {
                                dLen = 0;
                            } else {
                                dLen = tmpCmp.config.dLen > 0 ? tmpCmp.config.dLen : null;
                            }
                            newValue = me.calcExp(tmpCmp.config.expr, expIndex, dLen, fieldType);
                            if (oldValue != newValue) { //防止不必要的更新
                                tmpCmp.setValue(newValue);
                                newNode = tmpCmp.element.query("input.x-input-el")[0];
                                newNode && me.onFieldKeyUp(newNode, tmpCmp.config.table, tmpCmp.config.fieldType);
                            }
                            expIndex++;
                            tmpCmp = Ext.getCmp(map[i] + "-" + expIndex);
                        }
                    } else {
                        oldValue = tmpCmp.getValue();
                        if (tmpCmp.config.fieldType == "int") {
                            dLen = 0;
                        } else {
                            dLen = tmpCmp.config.dLen > 0 ? tmpCmp.config.dLen : null;
                        }
                        newValue = me.calcExp(tmpCmp.config.expr, expIndex, dLen, fieldType);
                        if (oldValue != newValue) {
                            tmpCmp.setValue(newValue);
                            newNode = tmpCmp.element.query("input.x-input-el")[0];
                            newNode && me.onFieldKeyUp(newNode, tmpCmp.config.table, tmpCmp.config.fieldType);
                        }
                    }
                }
            }
        }
    },

    /* 获取明细表 */
    getDetailTable: function(detailBiz) {
        var me = this,
            items = [];
        Ext.each(detailBiz.DataRows, function (row, rowIndex) {
            var container = {
                    title: "&nbsp;" + row.RowDesc,
                    xtype: 'container',
                    name: detailBiz.GroupCode + "-" + row.RowNum,
                    spacing: 0,
                    padding: '6 0 6 10',
                    hidden: true,
                    cls: 'noAfter',
                    defaults: {
                        labelWidth: 80,
                        cls: 'edit-input',
                        clearIcon: false,
                        labelWrap: true
                    }
                },
                fields = [];
            Ext.each(detailBiz.FieldSetings, function (item, index) {
                if (item.ColtrolValue != 2) { //隐藏不需要显示
                    fields.push(me.getEditField(item, row.FieldValueList[index], detailBiz.GroupCode + "-" + item.FieldCode + "-" + row.RowNum, detailBiz.Type, detailBiz.GroupCode));
                }
            });
            container.items = fields;
            items.push(container);
        });
        return items;
    },

    //获取表达式字段之间的映射关系
    getExpMapFromBizData: function(bizData) {
        var me = this,
            matchArray, match, field, item;
        me.ExpMap = {};

        for (var i = 0, len1 = bizData.length; i < len1; i++) {
            item = bizData[i];
            for (var j = 0, len2 = item.FieldSetings.length; j < len2; j++) {
                field = item.FieldSetings[j];
                if (field.ComputeExpr) {
                    var name = item.GroupCode + "-" + field.FieldCode;
                    matchArray = field.ComputeExpr.match(/\{([^\{\}]+)\}/g);
                    for (var k = 0, len = matchArray.length; k < len; k++) {
                        match = matchArray[k].substring(1, matchArray[k].length - 1).replace(/\./g, '-');
                        if (!me.ExpMap[match]) {
                            me.ExpMap[match] = [];
                        }
                        if (me.ExpMap[match].indexOf(name) < 0) {
                            me.ExpMap[match].push(name);
                        }
                    }
                }
            }
        }
    },

    /*
     * 获取field
     */
    getEditField: function(item, values, name, tableType, table) {
        var me = this,
            hasKeyUp = false,
            xtypes = { 'string': 'textfield', 'datetime': 'datefieldux', 'date': 'datefieldux', 'int': 'textfield', 'float': 'textfield', 'binary': 'textfield' },
            field = { 'xtype': 'textfield', 'name': '', 'value': '', 'readOnly': true, 'label': '', 'required': false };
        field.name = name;
        field.id = name;
        field.label = item.FieldDesc;
        field.value = values.DisplayValue;
        if (item.FieldType == "binary") { // 二进制数据，设置链接点击查看
            field.xtype = "ngviewtext";
            field.value = '<div class="btn-url" style="color: #3993db; text-decoration: underline; width: 100%;line-height: 30px;">查看</div>';
            if (item.FieldCode == "uploadimage" && Ext.isEmpty(values.DisplayValue)) {
                field.value = "";
            }
            field.fieldCode = item.FieldCode;
            field.fieldValue = values.DisplayValue;
            field.listeners = {
                initialize: function (fd) {
                    fd.element.on({
                        tap: function () {
                            me.downLoadUrl(fd, fd.config.fieldCode, fd.config.fieldValue);
                        },
                        delegate: '.btn-url',
                        scope: me
                    });
                }
            };
        }
        if (me.pageType == "Edit") {
            field.expr = item.ComputeExpr;
            field.table = table;
            field.fieldType = item.FieldType;
            field.tableType = tableType;
            field.inputCls = "x-input-view";
            field.dLen = item.DLen || -99;
            if (item.ColtrolValue != 0 && item.FieldType != "binary") { // 可编辑
                field.inputCls = "x-input-edit";
                field.readOnly = false;
                me.hasFieldEdit = true; //标识当前表单有可编辑字段
                field.required = item.ColtrolValue == 3;
                if (item.HelpString) { // 需要调用通用帮助
                    field.xtype = "ngcommonhelp";
                    field.readOnly = true;
                    field.cls = "edit-input edit-select";
                    field.helper = {title: item.FieldDesc, helpString: item.HelpString};
                    field.fromValues = values;
                } else {
                    field.xtype = xtypes[item.FieldType];
                }
                if (field.xtype == "datefieldux") { //时间控件
                    field.isNull = true;
                    field.dateFormat = item.FieldType == "datetime" ? 'Y-m-d H:i' : 'Y-m-d';
                    field.picker = {
                        xtype: 'timepickerux',
                        slotOrder: item.FieldType == "datetime" ? ['year', 'month', 'day', 'hour', 'minute'] : ['year', 'month', 'day']
                    };
                    if (values.DisplayValue && values.DisplayValue.length > 0) {
                        field.value = new Date(values.DisplayValue);
                        field.isNull = false;
                    }
                } else if (!field.readOnly && me.ExpMap[name.replace(/-\d+$/, '')]) {
                    hasKeyUp = true;
                    field.listeners = {
                        initialize: function (fd) {
                            fd.on({
                                keyup: function (c, e) {
                                    var evt = e.browserEvent || e.event,
                                        currV = "",
                                        target = e.delegatedTarget || e.target,
                                        match;
                                    if (evt.keyCode == 37 || evt.keyCode == 39) { //光标左右移动
                                        return;
                                    }
                                    if (target.tagName == "INPUT") {
                                        if (fd.config.fieldType == "int") {
                                            currV = target.value.replace(/[^\d]/g, '');
                                        } else {
                                            match = target.value.match(/\d+[\.]?(\d+)?/);
                                            currV = match ? match[0] : '';
                                        }
                                        if (target.value != currV) {
                                            target.value = currV;
                                        }
                                        me.calcExpDirs = []; //清空计算路径
                                        me.onFieldKeyUp(e.delegatedTarget, fd.config.table, fd.config.fieldType);
                                    }
                                }
                            });
                        }
                    };
                }
                if(!hasKeyUp && me.ExpMap[name.replace(/-\d+$/, '')]) {
                    field.listeners = {
                        initialize: function (fd) {
                            fd.on({
                                change: function (c, nValue, oValue) {
                                    var el = c.element.down("input");
                                    if (el && el.dom) {
                                        me.calcExpDirs = []; //清空计算路径
                                        me.onFieldKeyUp(el.dom, fd.config.table, fd.config.fieldType);
                                    }
                                }
                            });
                        }
                    };
                }
            }
            if (field.readOnly && field.fieldType == "string" && field.xtype != "ngcommonhelp") {
                field.xtype = "ngviewtext";
            }
        } else {
            field.xtype = "ngviewtext";
        }
        return  field;
    },

    //表达式计算
    calcExp: function(expStr, expIndex, dLen, fType) {
        var rowIndex = 0,
            bizData = this.getAppFlowDetailView().config.appFlowData.bizData, //字段属性为隐藏时，控件的值无法找到，需要通过getHideFieldValue方法来检索数据，
            isString = fType === 'string' || fType === 'datetime' || fType === 'date';
        var AVG = function () {
                if (rowIndex > 0) {
                    return SUM(arguments[0]) / rowIndex;
                } else {
                    return 0;
                }
            },
            SUM = function () {
                var arg = arguments[0],
                    result = 0,
                    cal,
                    find = false,
                    matchArray = arg.match(/\{([^\{\}]+)\}/g),
                    Values = {},
                    field, go = true;
                rowIndex = 0;
                while (matchArray && go) {
                    cal = arg;
                    find = false;
                    for (var i = 0, len = matchArray.length; i < len; i++) {
                        field = Ext.getCmp((matchArray[i].substring(1, matchArray[i].length - 1).replace(/\./g, '-') + "-" + rowIndex).trim());
                        if (field) {
                            find = true;
                            Values[matchArray[i]] = field.getValue() || 0;
                        } else {
                            var hideValue = getHideFieldValue(matchArray[i].substring(1, matchArray[i].length - 1), rowIndex);
                            if (hideValue) {
                                find = true;
                                Values[matchArray[i]] = hideValue;
                            }
                        }
                    }
                    if (find) {
                        for (var f in Values) {
                            cal = cal.replace(f, Values[f]);
                        }
                        try {
                            result += eval(cal);
                            rowIndex++;
                        } catch (ex) {
                            result = 0;
                            go = false;
                            NG.sysLog("表达式错误：" + cal, NG.LogType.JS);
                        }
                    } else {
                        go = false;
                    }
                }
                return result;
            },
            getArguments = function (exp) {
                var b = expStr.indexOf(exp),
                    e, endIndex = 0, partStr = '', len = 0;
                if (b > -1) {
                    b += exp.length;
                    e = b;
                    partStr = expStr.substring(b);
                    len = partStr.length;
                    for (var i = 0; i < len; i++) {
                        e++;
                        if (partStr.charAt(i) == ')') {
                            if (endIndex == 0) {
                                break;
                            } else {
                                endIndex--;
                            }
                        }
                        if (partStr.charAt(i) == '(') {
                            endIndex++;
                        }
                    }
                    partStr = expStr.substring(b, e - 1);
                }
                return partStr;
            },
            calcBasicExp = function (str, basicStr) {
                var matchArray = basicStr.match(/\{([^\{\}]+)\}/g),
                    field;
                if (matchArray) {
                    for (var i = 0, len = matchArray.length; i < len; i++) {
                        field = Ext.getCmp((matchArray[i].substring(1, matchArray[i].length - 1).replace(/\./g, '-') + "-" + expIndex).trim()) || Ext.getCmp((matchArray[i].substring(1, matchArray[i].length - 1).replace(/\./g, '-') + "-0").trim());
                        if (field) {
                            str = str.replace(matchArray[i], (field.getFormattedValue ? field.getFormattedValue() : field.getValue()) || 0);
                        } else {
                            str = str.replace(matchArray[i], getHideFieldValue(matchArray[i].substring(1, matchArray[i].length - 1), expIndex) || 0);
                        }
                    }
                }
                return str;
            },
            getHideFieldValue = function(cid, rIndex) {
                var tmpArray = cid.trim().split('.'),
                    groupCode = tmpArray[0],
                    fieldCode = tmpArray[1];
                for (var i = 0, n = bizData.length; i < n; i++) {
                    var block = bizData[i],
                        dataRows, fieldValues, field;
                    if (block.GroupCode == groupCode) {
                        if (block.Type === 0) {
                            rIndex = 0;
                        }
                        dataRows = block.DataRows;
                        if (dataRows[rIndex]) {
                            fieldValues = dataRows[rIndex].FieldValueList;
                            for (var j = 0, m = fieldValues.length; j < m; j++) {
                                field = fieldValues[j];
                                if (field.FieldCode == fieldCode) {
                                    return field.Value;
                                }
                            }
                        }
                        return null;
                    }
                }
                return null;
            };
        var newExpStr = expStr,
            basicExpStr = expStr,
            retValue = 0,
            avgArgs = getArguments('AVG('),
            sumArgs = getArguments('SUM(');
        if (sumArgs.length > 0) {
            newExpStr = newExpStr.replace(sumArgs, "'" + sumArgs + "'");
            basicExpStr = basicExpStr.replace(sumArgs, '');
        }
        if (avgArgs.length > 0) {
            newExpStr = newExpStr.replace(avgArgs, "'" + avgArgs + "'");
            basicExpStr = basicExpStr.replace(avgArgs, '');
        }
        if ((sumArgs + avgArgs).indexOf("AVG(") > -1 || (sumArgs + avgArgs).indexOf("SUM(") > -1) {
            NG.sysLog("表达式计算，目前不支持函数嵌套：" + expStr, NG.LogType.JS);
            return;
        }
        try {
            var valueStr , idx, fixed, len;
            newExpStr = calcBasicExp(newExpStr, basicExpStr);
            if(isString){
                return newExpStr;
            }
            retValue = eval(newExpStr);
            if (dLen === null || dLen === undefined) {
                valueStr = retValue.toString();
                len = valueStr.length;
                idx = valueStr.indexOf(".");
                if (idx > 0) { //浮点数计算不准确的问题
                    fixed = len - idx - 2;
                    if (fixed > 5) {
                        retValue = retValue.toFixed(fixed).toString();
                        retValue = Number(retValue.replace(/\.?0+$/g, ''));
                    }
                }
            } else {
                retValue = retValue.toFixed(dLen);
            }
        } catch (ex) {
            retValue = 0;
            NG.sysLog("表达式计算错误[" + newExpStr + "]，原表达式[" + expStr + "]", NG.LogType.JS);
        }
        return isFinite(retValue) ? retValue : '';
    },

    /*下载二进制文件*/
    downLoadUrl: function(field, fieldCode, fieldValue) {
        var me = this,
            appFlowInfo = me.getAppFlowDetailView().config.appFlowInfo,
            parms = {
                flowno: appFlowInfo.piid,
                fieldname: fieldCode,
                fieldvalue: fieldValue
            };

        if (field.downloadurl) {
            if (field.downloadurl == "null") {
                NG.alert("文件不存在", 1500);
            } else {
                NG.openFile(field.downloadurl);
            }
            return;
        }

        NG.setWaiting(true, "正在获取" + field.getLabel());
        Ext.Ajax.request({
            url: WeChat_GLOBAL_CONFIG.weChatServeAdr + "?requestType=post&requestAds=" + NG.getProductLoginInfo().productAdr + "/rest/api/oa/ApproveContent/1",
            method: 'POST',
            params: parms,
            success: function (response, opts) {
                NG.setWaiting(false);
                if (response.responseText) {
                    field.downloadurl = response.responseText;
                    if (field.downloadurl.split('.').length == 5) {
                        NG.openFile(field.downloadurl);
                    } else {
                        field.downloadurl = "null";
                        NG.alert("文件不存在", 1500);
                    }
                }
                else {
                    field.downloadurl = "null";
                    NG.alert("文件不存在", 1500);
                }
            },
            failure: function (response, opts) {
                NG.setWaiting(false);
                NG.alert(GLOBAL_CONFIG.NetWorkError, 1500);
            }
        });
    },

    /*打开单据截图*/
    openImage: function(dom) {
        var me = this,
            logid = NG.getProductLoginInfo().productLoginID,
            appFlowInfo = me.getAppFlowDetailView().config.appFlowInfo,
            parms = {
                method: 'GetTaskBizContent',
                logid: logid,
                flowType: appFlowInfo.flowtype,
                piid: appFlowInfo.piid
            };
        dom.isLoadedImg = true;
        me.showWaiting(true, dom);
        me.AFRequst('TaskInstance', parms, function (resp) {
            me.showWaiting(false);
            if (resp.status == 'succeed') {
                if (resp.type == 'bytes' && resp.data) {
                    dom.imgSrc = 'data:image/gif;base64,' + resp.data;
                    // dom.style.backgroundImage = 'url(' + dom.imgSrc + ')';
                    // debugger;
                    NG.showImage(dom, dom.imgSrc);
                } else {
                    dom.style.backgroundImage = 'none';
                    dom.innerHTML = "无";
                    dom.className = "img";
                  //  NG.alert("没有找到单据截图.");
                }
            }
            else {
                dom.isLoadedImg = false;
                NG.alert(GLOBAL_CONFIG.NetWorkError);
            }
        });
    },

    /*获取收发文正文地址*/
    getWordInfo: function(callback) {
        var me = this,
            logid = NG.getProductLoginInfo().productLoginID,
            appFlowInfo = me.getAppFlowDetailView().config.appFlowInfo,
            parms = {
                method: 'GetTaskBizContent',
                logid: logid,
                flowType: appFlowInfo.flowtype,
                piid: appFlowInfo.piid
            };
        me.AFRequst('TaskInstance', parms, function (resp) {
            me.showWaiting(false);
            if (resp.status == 'succeed') {
                if (resp.type.toUpperCase() == 'URL' && resp.data) {
                    callback && callback(resp);
                }
            }
            else {
                NG.sysLog("获取收发文正文地址出错，piid=" + appFlowInfo.piid);
            }
        });
    },

    /*点击展开滚动到底部*/
    taskContainer_beforeExpand: function(accord, head, index) {
        var viewContainer = this.getTaskPanelView(),
            scroll = viewContainer.getScrollable().getScroller();
        if (index > 4 && !viewContainer.scrollEvent) {
            viewContainer.scrollEvent = function (scroller) {
                scroller.scrollToEnd(true);
                viewContainer.scrollEvent = null;
            };
            scroll.on("refresh", viewContainer.scrollEvent, this, {single: true}); //只执行一次
        }
        else if(index < 5 && viewContainer.scrollEvent) {
            scroll.un("refresh", viewContainer.scrollEvent, this, {single: true});
            viewContainer.scrollEvent = null;
        }
    },

    //开始录音
    startRecordAudio: function (e) {
        var me = this,
            cardViews = me.getDetailMainView(),
            playBtn = me.getPlayBtn();
        me.startRecordSpeech = true;
        me.speechcallback = null;
        cardViews.pauseDrag = true;
        //录音成功后，调用此方法
        var transferFunction = function (status, src) {
            window.speechStatusValue = 0;
            if (window.recordingImg) {
                window.recordingImg.destroy();
                window.recordingImg = null;
            }

            if(status == 6) {
                NG.alert('没有开启录音权限');
                window.AudioObject = null;
                me.startRecordSpeech = false;
                return;
            }

            if (window.AudioObject == null) {
                me.startRecordSpeech = false;
                return;
            }

            if (me.startRecordSpeech) {
                window.AudioObject = null;
                me.startRecordSpeech = false;
                return;
            }
            window.AudioObject.getAudioTime(src.substr(src.lastIndexOf('/') + 1), function (timeLength) {
                window.AudioObject = null;
                if (timeLength < 2) {
                    NG.alert('录音时间不能小于两秒');
                    return;
                } else {
                    me.getPlayContainer().setHidden(false);
                    playBtn.voiceSrc = src;
                }
            });
        };

        if (window.speech) {
            me.speechcallback = function () {
                me.startRecordAudio();
            };
            window.speech.stop();
            return;
        }
        if (window.AudioObject) {
            window.AudioObject.stopRecord();
            window.AudioObject = null;
            return;
        }

        //正在录音时显示的图标
        if (!window.recordingImg) {
            var pageBox = me.getCommentsText().element.getPageBox();
            window.recordingImg = Ext.create('Ext.Label', {
                width: pageBox.width || 200,
                height: '40px',
                html: '<div class="voicetime" style="background-image:url(resources/images/work/u282.png);height: 40px; background-position: 40% 50%;background-repeat: no-repeat;background-size: auto 20px;color: white;line-height: 40px; padding-left: 50%;">00:00</div>',
                style: {
                    'background-image': 'url(resources/images/work/u280.png)',
                    'background-position': 'center',
                    'background-size': '100% 40px',
                    'background-repeat': 'no-repeat',
                    'left': '12px',
                    'top': ((pageBox.top || 160) + 39) + 'px'
                },
                renderTo: me.getAppFlowDetailView().element
            });
        }
        window.recordingImg.show();
        var voiceTime = window.recordingImg.element.dom.querySelector("div.voicetime"),
            time = 0;
        voiceTime.innerHTML = "00:00";
        window.recordingImg_sT = window.setInterval(function () {
            if (voiceTime && time < 59) {
                time++;
                voiceTime.innerHTML = "00:" + (time < 10 ? ("0" + time.toString()) : time);
            } else {
                window.clearInterval(window.recordingImg_sT);
                window.recordingImg_sT = null;
                me.stopRecordAudio();
            }
        }, 990);
        if (device.platform == "Windows") {
            return;
        }
        //创建录音对象
        window.AudioObject = new Speech(function () {
            NG.alert('录制失败');
            if (window.recordingImg) {
                window.recordingImg.destroy();
                window.recordingImg = null;
            }
            window.AudioObject = null;
            window.speechStatusValue = 0;
        }, function () {
        }, transferFunction);
        window.speechStatusValue = 0;
        window.AudioObject.startRecord();
        window.speechStatusValue = speechStatus.recording;
    },

    //停止录音
    stopRecordAudio: function (e) {
        var me = this,
            cardViews = me.getDetailMainView();
        cardViews.pauseDrag = false;
        me.startRecordSpeech = false;
        me.speechcallback = null;
        if(window.recordingImg_sT){
            window.clearInterval(window.recordingImg_sT);
            window.recordingImg_sT = null;
        }
        if (window.recordingImg) {
            window.recordingImg.destroy();
            window.recordingImg = null;
        }
        if (window.AudioObject) {
            window.AudioObject.stopRecord();
        }
        window.speechStatusValue = speechStatus.stop;
    },

    //播放录音
    voice_play: function(playBtn) {
        var me = this,
             recTime = 0;
        if (playBtn.voiceSrc) {
            if (window.speech) {
                if (playBtn != window.currentAudioBtn) {
                    me.speechcallback = function () {
                        me.voice_play(playBtn);
                    }
                }
                window.speech.stop();
            }
            else {
                window.currentAudioBtn = playBtn;
                window.speech = new Speech(null, function (status) {
                    if (status == 1) {   //播放结束
                        me.speechStopEnd();
                    } else if (status == 2) { //播放失败
                        me.speechStopEnd();
                        NG.alert("播放失败");
                    }
                }, null);
                window.speechStatusValue = speechStatus.playing;
                me.recordingIT = window.setInterval(function () {
                    if(playBtn.setStyle) {
                        playBtn.setStyle({
                            'background-position-x': (recTime % 3) * 50 + '%'
                        });
                    } else{
                        playBtn.style.backgroundPositionX = (recTime % 3) * 50 + '%';
                    }
                    recTime++;
                }, 300);
                window.speech.play(playBtn.voiceSrc, null);
            }
        }
    },

    /*
     * 语音停止后回调
     */
    speechStopEnd: function () {
        var me = this;
        if (me.recordingIT) {
            window.clearInterval(me.recordingIT);
            me.recordingIT = null;
        }

        if(window.currentAudioBtn) {
            if (window.currentAudioBtn.setStyle && window.currentAudioBtn.element) {
                window.currentAudioBtn.setStyle({
                    'background-position-x': '100%'
                });
            } else {
                window.currentAudioBtn.style && (window.currentAudioBtn.style.backgroundPositionX = "100%");
            }
        }

        window.speech = null;
        window.speechStatusValue = speechStatus.stop;
        window.currentAudioBtn = null;
        me.speechcallback && me.speechcallback();
        me.speechcallback = null;
    },

    //清楚审批意见的语音状态--删除状态
    clearPlayBtnStatus: function(e, target) {
        var comTxt = this.getCommentsText();
        if (window.speech) {
            this.speechcallback = null;
            window.speech.stop();
        }
        comTxt.setReadOnly(true);
        this.getPlayBtn().voiceSrc = null;
        this.getPlayContainer().setHidden(true);
        window.setTimeout(function () {
            if (comTxt) {
                comTxt.setReadOnly(false);
            }
        }, 260);
    },

    //上传语音
    uploadAudio: function(callback, params) {
        var me = this,
            serverUrl = NG.getProductLoginInfo().productAdr + '/rest/api/workflow/TaskInstance/Get?'+params,
            playBtn = me.getPlayBtn(),
            src = playBtn.voiceSrc,
            reSendTime = 0,
            ft,
            options;
        playBtn.audioRemark = "";
        if (!src) { //没有语音直接返回
            callback && callback();
            return;
        }
        ft = new FileTransfer();
        options = new FileUploadOptions();
        options.fileKey = "upload_file";
        options.fileName = src.substr(src.lastIndexOf('/') + 1);
        options.mimeType = "audio/x-mpeg";
        options.chunkedMode = false;
        //上传成功
        var win = function (r) {
            var json = NG.decodeJson(r.response);
            playBtn.audioRemark = json ? json.guid : '';
            callback && callback();
            if (!playBtn.audioRemark) {
                NG.sysLog("审批意见语音上传错误, errmsg:" + r.response);
            }
        };
        //上次失败
        var fail = function (r) {
            if (reSendTime >= 3) {
                callback && callback();
                NG.sysLog("上传语音失败(3次)")
            }
            else {
                reSendTime = reSendTime + 1;
                ft.upload(src, serverUrl, win, fail, options, true);
            }
        }
        //上传语音文件到服务器
        ft.upload(src, serverUrl, win, fail, options, true);
    },

    /*点击下一节点列表*/
    nextNodeList_onItemTap: function (list, record, target) {
        var me = this,
            btn = target.querySelector("div[btntype=radiobtn]"),
            viewContainer = me.getTaskPanelView(),
            initConfig = me.getAppFlowDetailView().config;
        if (initConfig.appFlowData.taskInstInfo[0].designate_node == 0) { //不需要指派下级节点
            return false;
        }
        if (btn) {
            record.checked = record.checked == "btn-checked" ? "btn-unchecked" : "btn-checked";
            btn.className = record.checked;
            me.updateDealPanel(record, record.checked == "btn-checked");
            if (record.checked == "btn-checked") {
                viewContainer.getScrollable().getScroller().on("refresh", function (scroller) {
                    scroller.scrollToEnd(true);
                }, me, {single: true}); //只执行一次
            }
        }
    },

    /*更新节点办理人中的控件，record表示选中或去掉的数据，isadd==true表示增加，false表示去掉*/
    updateDealPanel: function (record, isAdd) {
        var me = this,
            currentDesignateActor = [],
            itemTpl =  '<div btntype="radiobtn" class="{checked}" style="float: left;"></div><div class="nowrap" style="max-width: 51px; margin-left:6px; float:left;">{username}</div>',
            itemStyle = 'position:relative; width: 73px; padding: 4px 0px 8px 0px; float:left; margin-right: 5px; color:#000; line-height:20px;',
            viewContainer = me.getTaskPanelView(),
            dealContainer = me.getDealListContainer(),
            innerItems = dealContainer.getInnerItems(),
            logid = NG.getProductLoginInfo().productLoginID,
            flowtype = me.getAppFlowDetailView().config.appFlowInfo.flowtype,
            nextNodeDesignateActor = me.getAppFlowDetailView().config.appFlowData.nextNodeDesignateActor;
        if (isAdd) {
            var node = {nodeid: record.nodeid};
            viewContainer.nodeArray.push(node);
            viewContainer.nodePerson[record.nodeid] = [];
            record.node = node;
            if (record.designate_actor == 1) {
                Ext.each(nextNodeDesignateActor, function (ite) {
                    var newItem = Ext.clone(ite);
                    if (newItem.nodeid == record.nodeid) {
                        newItem.checked = "btn-unchecked";
                        newItem.beforeLine = 0;
                        currentDesignateActor.push(newItem);
                    }
                });
                dealContainer.add(Ext.create('Ext.Container', {
                    name: 'oneDealContainer-' + record.nodeid,
                    cls: innerItems.length > 0 ? 'before-line' : '',
                    style: {
                        'padding-bottom': '4px'
                    },
                    layout: { type: 'vbox' },
                    items: [
                        {
                            xtype: 'label',
                            style: 'padding:12px 0px 8px 12px; color:#AAA9A9;',
                            html: record.nodetext
                        },
                        {
                            layout: {
                                type: 'hbox',
                                align: 'center'
                            },
                            items: [
                                {
                                    xtype: 'taptpl',
                                    flex: 1,
                                    name: 'taptpl-' + record.nodeid,
                                    nodeid: record.nodeid,
                                    style: 'position:relative; background-color: #FFFFFF; margin-left:12px;',
                                    itemStyle: itemStyle,
                                    itemTpl: itemTpl,
                                    data: currentDesignateActor,
                                    listeners: {
                                        itemTap: function () {
                                            me.dealPerson_tap.apply(me, arguments);
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    nodeid: record.nodeid,
                                    piid: me.getAppFlowDetailView().config.appFlowInfo.piid,
                                    name: 'button-' + record.nodeid,
                                    style: {
                                        borderColor: '#DCDCDC'
                                    },
                                    margin: '-8 10 0 0',
                                    height: 28,
                                    ui: 'plain',
                                    text: '更多',
                                    listeners: {
                                        tap: function (btn, e, eOpts) {
                                            NG.initControllers(me, function () {
                                                var parms = {
                                                        logid: logid,
                                                        method: 'GetNodeUsers',
                                                        flowType: flowtype,
                                                        piid: btn.config.piid,
                                                        nodeid: btn.config.nodeid
                                                    },
                                                    operatorSelectView = me.getOperatorSelectView(),
                                                    nodeUserStore = Ext.getStore('NodeUserStore');
//                                                nodeUserStore.getProxy().setUrl(GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get');
                                                nodeUserStore.getProxy().setUrl(WeChat_GLOBAL_CONFIG.weChatServeAdr);
                                                nodeUserStore.setParams({
                                                    requestType: 'get',
                                                    requestAds: WeChat_GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get'
                                                });
                                                nodeUserStore.setParams(parms);
                                                me.getApplication().getController("work.appflow.OperatorController").nodeid = btn.config.nodeid;
                                                if (!operatorSelectView) {
                                                    operatorSelectView = Ext.create('MyApp.view.work.appflow.OperatorSelectView', {
                                                        nodeid: btn.config.nodeid
                                                    });
                                                    Ext.Viewport.add(operatorSelectView);
                                                } else {
                                                    operatorSelectView.setNodeid(btn.config.nodeid);
                                                }
                                                if (record.designate_anyactor == 0) { //不可以选择系统人员，则隐藏底部工具条
                                                    operatorSelectView.query('.toolbar[name=opertatorSelectViewBottombar]')[0].hide();
                                                }
                                                Ext.Viewport.setActiveItem(operatorSelectView);
                                            }, 'MyApp.controller.work.appflow.OperatorController');
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }));
            }
        }
        else {
            var tmp = dealContainer.query('.container[name=oneDealContainer-' + record.nodeid + ']');
            if (tmp && tmp.length > 0) {
                tmp[0].destroy();
                if (record.node) {
                    Ext.Array.remove(viewContainer.nodeArray, record.node);
                    delete record.node;
                }
            }
        }
    },

    /*
    * 功能描述：选择节点人员后返回
     */
    doSelectedPersons: function(nodeid, persons) {
        var me = this,
            dealContainer = me.getDealListContainer(),
            viewContainer = me.getTaskPanelView(),
            tmpCmp = dealContainer.down('.taptpl[name=taptpl-' + nodeid + ']'),
            data = [];
        if(persons && persons.length > 0 ) {
            viewContainer.nodePerson[nodeid] = [];
            Ext.each(persons, function (person) {
                var newItem = { nodeid: nodeid, elecode: person.elecode, usercode: person.usercode, username: person.username};
                viewContainer.nodePerson[nodeid].push(newItem);
                person.person = newItem;
                person.nodeid = nodeid;
                person.checked = "btn-checked";
                person.beforeLine = 0;
                data.push(person);
            });
            tmpCmp.setData(data);
        }
    },

    /*
    *功能描述：节点人员点击事件
     */
    dealPerson_tap: function(cmp, record, target, index, e) {
        var me = this,
            person = {},
            btn = target.querySelector("div[btntype=radiobtn]"),
            viewContainer = me.getTaskPanelView(),
            initConfig = me.getAppFlowDetailView().config;
        if (btn) {
            person = { nodeid: record.nodeid, elecode: record.elecode, usercode: record.usercode, username: record.username};
            record.checked = record.checked == "btn-checked" ? "btn-unchecked" : "btn-checked";
            btn.className = record.checked;
            if (record.checked == "btn-checked") {
                viewContainer.nodePerson[record.nodeid].push(person);
                record.person = person;
            } else {
                if (record.person) {
                    Ext.Array.remove(viewContainer.nodePerson[record.nodeid], record.person);
                    delete record.person;
                }
            }
        }
    },

    /*印章界面列表点击*/
    stampList_onitemTap: function (list, index, target, record, e, eOpts) {
        var btype = e.target.getAttribute('type');
        var store = list.getStore();
        var cr = store.getAt(index);
        var status = cr.get('checked');
        if (!btype || btype != 'password') {
            if (status == '0') {
                cr.set('checked', '1');
                var crid = cr.get('id');
                Ext.each(store.getData().items, function (aitem) {
                    if (crid != aitem.data.id) {
                        store.getById(aitem.data.id).set('checked', '0');
                    }
                });
            }
            else {
                cr.set('checked', '0');
            }
        }
    },

    /*印章界面返回*/
    stampListBack_onTap: function (btn, e, eOpts) {
        this.getApplication().getController("work.appflow.AppFlowController").backwardView(this.getStampListView(), this.getAppFlowDetailView())
    },

    /*印章界面确定选择*/
    stampListConfirm_onTap: function (btn, e, eOpts) {
        //判断是否选择印章，判断选择印章是否密码正确
        var stampList = this.getStampList();
        if (stampList) {
            var store = stampList.getStore();
            var flag = true, retunId, retunImg;
            Ext.each(store.getData().items, function (aitem) {
                if (aitem.data.checked == '1') {
                    flag = false;
                    var cpwd = document.getElementById('PwdInput' + aitem.data.id);
                    if ((aitem.data.markpass != null) && (cpwd.value != aitem.data.markpass)) {
                        NG.alert('密码不正确', 1500);
                    }
                    else {
                        retunId = aitem.data.ccode;
                        retunImg = aitem.data.content;
                    }
                    return false;
                }
            });
            if (flag) {
                NG.alert('您未选择任何印章', 1500);
            }
            if (retunId) {
                this.getApplication().getController("work.appflow.AppFlowController").backwardView(this.getStampListView(), this.getAppFlowDetailView());
                var sinimage = this.getSignImage();
                sinimage.setSrc('data:image/gif;base64,' + retunImg);
                sinimage.valueId = retunId;
            }
        }
    },

    /*点击印章*/
    signImage_onTap: function (img, e, eOpts) {
        var me = this,
            logid = NG.getProductLoginInfo().productLoginID,
            view = me.getStampListView() || Ext.create('MyApp.view.work.appflow.StampListView'),
            parms = {
                logid: logid,
                method: 'GetAllSignature',
                flowType: 'af'
            };
        me.AFRequst('TaskInstance', parms, function (resp) {
            if (resp.status == 'succeed') {
                if (resp.data.length > 0 && me.getStampList().getStore) {
                    me.getStampList().getStore().setData(resp.data);
                    Ext.Viewport.add(view);
                    Ext.Viewport.setActiveItem(view);
                }
                else if (view) {
                    view.destroy();
                    view = null;
                    NG.alert('无签章数据', 1500);
                }
            }
            else if (view) {
                view.destroy();
                view = null;
                NG.alert(resp.errmsg, 1500);
            }
        });
    },

    /*滑动后激活tab页*/
    OnActiveItemChange: function (fp, panel, oldValue, eOpts) {
        var me = this;
        if(!fp.getParent()){ return; }
        var tabBtn = fp.getParent().query('.segmentedbutton')[0], workView = fp;

        var logid = NG.getProductLoginInfo().productLoginID;
        var fpView = me.getFormPanelView();
        var appFlowInfo;
        if (fpView && !fpView.isLoadFormPanel && panel == fpView && !fpView.isLoadingFormPanel) {
            appFlowInfo = me.getAppFlowDetailView().config.appFlowInfo;
            me.showWaiting(true, panel.element);
            if(me.getAppFlowDetailView().config.appFlowData.bizData && appFlowInfo.biztype == "RW_ReportApply") { // 报表审批
                Ext.Ajax.request({
                    url: WeChat_GLOBAL_CONFIG.weChatServeAdr + "?requestType=post&requestAds=" + NG.getProductLoginInfo().productAdr + "/rest/api/report/RptList/Get",
                    method: 'POST',
                    params: {
                        CallFunc: 'GetReportInfo',
                        id: appFlowInfo.piid,
                        infoType: 'REPORTAPP'
                    },
                    success: function (response, opts) {
                        fpView.isLoadFormPanel = true;
                        me.showWaiting(false);
                        var reArr = NG.decodeJson(response.responseText),
                            detailItems = [],
                            bodyEl = Ext.Viewport.bodyElement,
                            imgHeight = Math.min(bodyEl.getWidth(), bodyEl.getHeight()) * 3 / 4;
                        if (reArr.status == "error" || !Ext.isArray(reArr)) {
                            NG.alert("服务器接口错误");
                        } else {
                            for (var i = 0, len = reArr.length; i < len; i++) {
                                var tmp = reArr[i];
                                detailItems.push({
                                    xtype: 'image',
                                    src: NG.replaceURL(tmp.imgurl),
                                    title: tmp.sheetname,
                                    style: 'background-size:contain;background-color: rgb(255, 255, 255);',
                                    spacing: 0,
                                    height: imgHeight,
                                    hidden: i > 0,
                                    listeners: {
                                        tap: function () {
                                            NG.showImage(this);
                                        }
                                    }
                                });
                            }
                            fpView.add({
                                xtype: 'ngaccordion',
                                cls: 'simple',
                                defaults: {
                                    style: 'background-color: #FFFFFF;'
                                },
                                items: detailItems
                            });
                        }
                        fpView.isLoadingFormPanel = false;
                    },
                    failure: function (response, opts) {
                        me.showWaiting(false);
                        NG.alert("连接服务器失败");
                    }
                });
            } else if(appFlowInfo.biztype == "AQ_CHK_M" || appFlowInfo.biztype == "AQ_CHK_M2") { //现场检查
                var taskInfo = me.pageType == "View" ? me.getAppFlowDetailView().config.appFlowData.flowInfo[0] : me.getAppFlowDetailView().config.appFlowData.taskInstInfo[0]
                NG.initControllers(me, function () {
                    var checkDetailController = NG.application.getController("work.project.ProjectCheckDetailController");
                    checkDetailController.ProjectApi({
                        params: {
                            method: 'getbilldetail',
                            type: "0",
                            login: logid,
                            Code: taskInfo.billcode
                        },
                        success: function (detail) {
                            fpView.isLoadFormPanel = true;
                            me.showWaiting(false);
                            if (detail && detail.m && detail.m.length > 0) {
                                checkDetailController.paramConfig = {
                                    op: 'view',
                                    from: 'appflow',
                                    detail: detail
                                };
                                panel.add(Ext.create("MyApp.view.work.project.ProjectCheckDetailView"));
                            } else {
                                NG.alert("获取现场检查明细数据失败.code=" + taskInfo.billcode);
                            }
                        }
                    });
                }, 'work.project.ProjectCheckDetailController');
            } else {
                var parms = {
                    method: 'GetTaskBizContent',
                    logid: logid,
                    flowType: appFlowInfo.flowtype,
                    piid: appFlowInfo.piid
                };
                var downloadfunc = function (url) {
                    NG.openFile(url);
                };
                fpView.isLoadingFormPanel = true;
                me.AFRequst('TaskInstance', parms, function (resp) {
                    if (resp.status == 'succeed') {
                        fpView.isLoadFormPanel = true;
                        if (resp.type.toUpperCase() == 'URL' && resp.data) {
                            me.showWaiting(false);
                            var container = Ext.create('Ext.Container', {
                                flex: 1,
                                name: 'formPanelContainer',
                                style: 'background-color:#ffffff;',
                                padding: '8 8 8 12',
                                html: '<img src="resources/images/word.png" style="width:32px;height: 32px;float:left;"/>' +
                                    '<div name="myformurl" style="color:#3993db;max-width:220px;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;float: left;text-align: center;height: 32px;line-height: 32px;">' + resp.name + '</div>'
                            });
                            panel.add(container);
                            if (resp.data && resp.data.length > 0) {
                                container.element.down('div[name=myformurl]').addListener('touchend', function () {
                                    downloadfunc(resp.data)
                                });
                            }
                            fpView.isLoadFormPanel = true;
                        }
                        else if (resp.type == 'bytes') {
                            var image = Ext.create('Ext.Img', {
                                flex: 1,
                                name: 'formPanelImg',
                                style: 'background-size: contain;',
                                src: 'data:image/gif;base64,' + resp.data,
                                listeners: {
                                    tap: function (me, index, target, record, e, eOpts) {
                                        NG.showImage(this);
                                    },
                                    load: function () {
                                        var scale = 2,
                                            imgObj = arguments[0].imageObject,
                                            el = panel.element;
                                        if (!el) {
                                            return;
                                        }

                                        var scaleX = scale * el.getWidth(),
                                            scaleY = scaleX * imgObj.height / imgObj.width;
                                        oldValue.element.setStyle("background-color", "white");
                                        image.setHeight(scaleY);
                                        panel.add([
                                            {
                                                xtype: "container",
                                                flex: 1,
                                                style: 'background-color:#ffffff;',
                                                scrollable: {
                                                    direction: 'horizontal',
                                                    directionLock: true,
                                                    outOfBoundRestrictFactor: 0.2
                                                },
                                                layout: {
                                                    type: 'vbox'
                                                },
                                                listeners: {
                                                    initialize: function () {
                                                        this.getScrollable().getScroller().addListener("scrollend", function () {
                                                            if (this.lastDragPosition.x < -10) {
                                                                fp.previous();
                                                            }
                                                            else if (this.lastDragPosition.x > scaleX - el.getWidth() + 10) {
                                                                fp.next();
                                                            }
                                                        });
                                                    }
                                                },
                                                items: [
                                                    {
                                                        xtype: "container",
                                                        width: scaleX,
                                                        flex: 1,
                                                        scrollable: {
                                                            direction: 'vertical',
                                                            directionLock: true
                                                        },
                                                        items: [image]
                                                    }
                                                ]
                                            }
                                        ]);
                                        me.showWaiting(false);
                                    },
                                    error: function () {
                                        me.showWaiting(false);
                                    }
                                }
                            });
                            fpView.isLoadFormPanel = true;
                        } else {
                            panel.add({
                                xtype: 'label',
                                flex: 1,
                                html: '表单内容为空',
                                style: 'background-color:#ffffff;text-align: center;padding-top: 40%;'
                            });
                            me.showWaiting(false);
                        }
                    }
                    else {
                        me.showWaiting(false);
                        NG.alert(GLOBAL_CONFIG.NetWorkError);
                    }
                    fpView.isLoadingFormPanel = false;
                });
            }
        }
    },

    showWaiting: function(show, panel){
        var me = this;
        if(show) {
            me.loading = Ext.create('Ext.Img', {
                renderTo: panel || Ext.getBody(),
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

    /*
     * 功能描述：初始化按钮工具条
     */
    initToolBar: function(btnArr) {
        var toolbar = this.getAfdetailViewActionToolbar(),
            moreMenu = this.getMoreMenuContainer(),
            mitems = [],
            ditems = [];
        for (var i = 0, len = Math.min(btnArr.length, 3); i < len; i++) {
            if (i > 0) {
                mitems.unshift({
                    xtype: 'label',
                    border: '0 0 0 1',
                    style: 'border-left: 1px groove rgba(255,255,255,0.5);'
                });
            }
            mitems.unshift({
                text: btnArr[i],
                flex: 1
            });
        }
        toolbar.setItems(mitems);
        toolbar.element.on({
            scope: this,
            delegate: '.x-button',
            tap: 'btn_tap'
        });

        for(var i = 3, len = btnArr.length; i < len; i++){
            if (i > 3) {
                ditems.unshift({
                    xtype: 'label',
                    height: 1,
                    cls: '',
                    border: 0,
                    width: '100%',
                    style: 'background-color: rgba(255,255,255,0.5);'
                });
            }
            ditems.unshift({
                border: 0,
                width: '100%',
                height: 40,
                cls: i == len - 1 ? 'button-no-radio' : 'button-no-radio before-line',
                text: btnArr[i]
            });
        }
        if (ditems.length > 0) {
            ditems.push({
                xtype: 'label',
                cls: '',
                html: '<div style="border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #fff;position: absolute;top: -6px;left: -5px;"></div>',
                style: 'position: absolute;border-left: 6px solid transparent;border-right: 6px solid transparent;border-top: 6px solid rgba(128, 128, 128, 0.2);margin-left: 50%;left: -6px;'
            });
            moreMenu.setItems(ditems);
            moreMenu.element.on({
                scope: this,
                delegate: '.x-button',
                tap: 'btn_tap'
            });
        }
    },

    /*
     * 功能描述：按钮事件
     */
    btn_tap: function(e) {
        var me = this,
        	btn = Ext.getCmp(e.delegatedTarget.id),
            btnName = btn ? btn.getText() : '';
        if(btnName == '提交' || btnName == '驳回' || btnName == '转签' || btnName == '终止' || btnName == '加签') {
        	var operationFunction = function() {
        		switch (btnName) {
		            case '提交':
		                me.submitbtn_onTap(btn);
		                break;
		            case '驳回':
		                me.rejectbtn_onTap(btn);
		                break;
		            case '转签':
		                me.changebtn_onTap(btn);
		                break;
		            case '终止':
		                Ext.Msg.confirm(
		                    "提示",
		                    '确定终止该流程？',
		                    function (buttonId) {
		                        if (buttonId === 'yes') {
		                            me.stopbtn_onTap();
		                        }
		                    },
		                    me
		                );
		                break;
		            case '加签':
		                me.addbtn_onTap(btn);
		                break;
		        }
        	};
        	NG.setWaiting(true, "正在处理");
            operationFunction();
            NG.setWaiting(false);
            //暂时取消更新附件
//	        me.checkUpdated(me.downloadurls, function(needUpdatedArray) {
//	        	if(needUpdatedArray.length > 0) {
//		        	NG.setWaiting(false);
//		        	NG.setWaiting(true, "正在更新附件");
//		        	var updateFunction = function(index) {
//		        		if(index < needUpdatedArray.length) {
//		        			var serverUrl = NG.getProductLoginInfo().productAdr + '/rest/api/workflow/TaskInstance/Get?method=SaveAttachment&logid=' + NG.getProductLoginInfo().productLoginID +
//		        				'&asratttable=' + needUpdatedArray[index].asratttable + '&asrtable=' + needUpdatedArray[index].asrtable + '&asrcode=' + needUpdatedArray[index].asrcode + '&attachname=' + encodeURI(encodeURI(needUpdatedArray[index].attachname)),
//					            src = needUpdatedArray[index].filePath,
//					            reSendTime = 0,
//					            ft,
//					            options;
//					        ft = new FileTransfer();
//					        options = new FileUploadOptions();
//					        options.fileKey = "upload_file";
//					        options.fileName = src.substr(src.lastIndexOf('/') + 1);
//					        options.mimeType = "application/msword";
//					        options.chunkedMode = false;
//					        //上传成功
//					        var win = function (r) {
//					            var json = NG.decodeJson(r.response);
//					            if(json.status == 'succeed') {
//					            	NG.dbManager.excuteSql("update attach_info set updatetime = ? where fname = ?", [new Date().getTime(), 'ngtmpfile' + needUpdatedArray[index].downloadurl.substr(needUpdatedArray[index].downloadurl.lastIndexOf('/') + 1)], function(){});
//					            	updateFunction(++index);
//					            }
//					            else {
//					            	NG.alert(json.errmsg);
//					            }
//					        };
//					        //上传失败
//					        var fail = function (r) {
//                                if(r.http_status == '404') {
//                                    operationFunction();
//                                }
//                                else {
//                                    if (reSendTime >= 3) {
//                                        NG.alert('更新附件失败');
//                                        NG.sysLog("更新附件失败(3次)")
//                                    }
//                                    else {
//                                        reSendTime = reSendTime + 1;
//                                        ft.upload(src, serverUrl, win, fail, options, true);
//                                    }
//                                }
//					        }
//					        //上传语音文件到服务器
//					        ft.upload(src, serverUrl, win, fail, options, true);
//		        		}
//		        		else {
//		        			NG.setWaiting(false);
//		        			operationFunction();
//		        		}
//		        	}
//		        	updateFunction(0);
//	        	}
//	        	else {
//	        		NG.setWaiting(false);
//	        		operationFunction();
//	        	}
//	        });
        }
        else if(btnName == '更多') {
        	this.morebtn_onTap(btn);
        }
    },

    /*点击终止*/
    stopbtn_onTap: function() {
        var me = this,
            appFlowView = me.getAppFlowDetailView(),
            appFlowData = appFlowView.config.appFlowData,
            appFlowInfo = appFlowView.config.appFlowInfo,
            issigature = appFlowData.taskInstInfo[0].issigature,
            playBtn = me.getPlayBtn(),
            src = playBtn.voiceSrc,
            comments = me.getCommentsText().getValue(),        //审批意见
            signid = me.getSignImage().valueId,        //签章id
            logid = NG.getProductLoginInfo().productLoginID;

        if (!me.validFormData()) {
            return;
        }

        NG.setWaiting(true,"正在终止");

        var parms = {
            method: 'Terminate',
            logid: logid,
            flowType: appFlowInfo.flowtype,
            piid: appFlowInfo.piid,
            nodeid: appFlowInfo.nodeid,
            taskinstid: appFlowInfo.taskinstid,
            remark: comments,
            bizdata: Ext.JSON.encode(me.bizDataHasChanged ? me.editBizData : []),
            audioremark: ''
        };

        me.AFRequst('TaskInstance', parms, function (resp) {
            NG.setWaiting(false);
            if (resp.status == 'succeed') {
                var appFlowController = me.getApplication().getController("work.appflow.AppFlowController");
                appFlowController.backwardView(me.getAppFlowDetailView(), me.getAppFlowListView());
            }
            else {
                NG.alert('终止失败：' + resp.errmsg, 1500);
            }
        });
    },

    /*点击驳回*/
    rejectbtn_onTap: function () {
        var me = this,
            appFlowView = me.getAppFlowDetailView(),
            appFlowData = appFlowView.config.appFlowData,
            appFlowInfo = appFlowView.config.appFlowInfo,
            issigature = appFlowData.taskInstInfo[0].issigature,
            playBtn = me.getPlayBtn(),
            src = playBtn.voiceSrc,
            comments = me.getCommentsText().getValue(),        //审批意见
            signid = me.getSignImage().valueId,        //签章id
            logid = NG.getProductLoginInfo().productLoginID;

        if (comments == '' && !src) {
            NG.alert('审批意见不能为空', 1500);
            return;
        }

        if (issigature == 1 && !signid) {
            NG.alert('需要签章，请选择签章', 1500);
            return;
        }

        if(!me.validFormData()){ return; }

        var parms = {
            method: 'GetRollBackInfo',
            logid: logid,
            flowType: appFlowInfo.flowtype,
            piid: appFlowInfo.piid,
            nodeid: appFlowInfo.nodeid,
            taskinstid: appFlowInfo.taskinstid
        };

        me.AFRequst('TaskInstance', parms, function (resp) {
            if (resp.status == 'succeed') {
                if (resp.rollBackNodes.length == 0) {
                    NG.alert('该流程已过审批节点，不支持驳回操作', 1500);
                }
                else {
                    NG.initControllers(me, function () {
                        var newView = Ext.ComponentQuery.query('rejectPanelView')[0];
                        if (!newView) {
                            newView = Ext.create('MyApp.view.work.appflow.RejectPanelView', {
                                appFlowInfo: appFlowInfo,
                                bizData: Ext.JSON.encode(me.bizDataHasChanged ? me.editBizData : []),
                                rollBackInfo: resp,
                                logid: logid,
                                remark: comments || '语音',
                                signcode: signid
                            });
                            Ext.Viewport.add(newView);
                        }
                        Ext.Viewport.setActiveItem(newView);
                    }, 'MyApp.controller.work.appflow.RejectController');
                }
            }
            else {
                NG.alert('无法驳回：' + resp.errmsg, 1500);
            }
        });
    },

    /*
     * 功能描述：点击更多
     */
    morebtn_onTap: function(btn) {
        var moreMenu = this.getMoreMenuContainer(),
            isHidden = moreMenu.getHidden();
        if (isHidden) {
            Ext.Viewport.element.on({
                touchstart: function (e) {
                    if (btn && btn.element && (btn.element.dom == e.target || btn.element.query('*').indexOf(e.target) > -1)) {
                        return;
                    }
                    moreMenu.setHidden(true);
                },
                scope: this,
                single: true
            });
        }
        moreMenu.setHidden(!isHidden);
    },

    /*
     * 功能描述：加签
     */
    addbtn_onTap: function() {
        var me = this,
            playBtn = me.getPlayBtn(),
            signid = me.getSignImage().valueId, //签章id
            appFlowView = me.getAppFlowDetailView(),
            appFlowData = appFlowView.config.appFlowData,
            issigature = appFlowData.taskInstInfo[0].issigature,
            comments = me.getCommentsText().getValue(), //审批意见
            appFlowInfo = appFlowView.config.appFlowInfo;
        if (issigature == 1 && !signid) {
            NG.alert('需要签章，不能加签', 1500);
            return;
        }
        NG.Helper.openPersonHelp({
            callback: function (persons) {
                var pArr = [];
                if (persons.length == 0) {
                    NG.alert('未选择加签人员.');
                    return;
                }
                NG.setWaiting(true, '正在加签..');
                Ext.each(persons, function (person) {
                    pArr.push(person.usercode);
                });
                me.uploadAudio(function () {
                    me.AFRequst('TaskInstance', {
                        method: 'addtis',
                        logid: NG.getProductLoginInfo().productLoginID,
                        flowType: appFlowInfo.flowtype,
                        piid: appFlowInfo.piid,
                        nodeid: appFlowInfo.nodeid,
                        taskinstid: appFlowInfo.taskinstid,
                        users: pArr.join(','),
                        remark: comments,
                        signcode: signid,
                        //bizdata: '[]',
                        audioremark: playBtn.audioRemark
                    }, function (resp) {
                        NG.setWaiting(false);
                        if (resp.status == 'succeed') {
                            var appFlowController = me.getApplication().getController("work.appflow.AppFlowController");
                            appFlowController.backwardView(me.getAppFlowDetailView(), me.getAppFlowListView());
                        }
                        else {
                            NG.alert('加签失败：' + resp.errmsg, 1500);
                        }
                    });
                }, "method=SaveAudioRemark&flowType=" + appFlowInfo.flowtype + "&piid=" + appFlowInfo.piid + "&nodeid=" + appFlowInfo.nodeid + "&taskinstid=" + appFlowInfo.taskinstid);
            },
            controller: me,
            title: '选择操作员',
            multi: true
        });
    },

    /*
     * 功能描述：点击转签
     */
    changebtn_onTap: function () {
        var me = this,
            appFlowView = me.getAppFlowDetailView(),
            appFlowData = appFlowView.config.appFlowData,
            appFlowInfo = appFlowView.config.appFlowInfo,
            issigature = appFlowData.taskInstInfo[0].issigature,
            signid = me.getSignImage().valueId;        //签章id
        if (issigature == 1 && !signid) {
            NG.alert('需要签章，不能转签', 1500);
            return;
        }
        NG.initControllers(me, function () {
            var changeUserView = Ext.ComponentQuery.query('changeUserView')[0];
            if (!changeUserView) {
                changeUserView = Ext.create('MyApp.view.work.appflow.ChangeUserView');
            }
            Ext.Viewport.add(changeUserView);
            Ext.Viewport.setActiveItem(changeUserView);
        }, 'MyApp.controller.work.appflow.AppFlowSignController');
    },

    /*点击提交*/
    submitbtn_onTap: function () {
        var me = this,
            appFlowView = me.getAppFlowDetailView(),
            appFlowData = appFlowView.config.appFlowData,
            appFlowInfo = appFlowView.config.appFlowInfo,
            issigature = appFlowData.taskInstInfo[0].issigature,  //是否需要签章
            designate_node = appFlowData.taskInstInfo[0].designate_node, // 是否需要指派下级节点
            signid = me.getSignImage().valueId, //签章id
            comments = me.getCommentsText().getValue(), //审批意见
            viewContainer = me.getTaskPanelView(),
            nextNodeList = viewContainer.nodeArray,
            dealArray = [],
            playBtn = me.getPlayBtn(),
            dealContainer = me.getDealListContainer(),
            nodePerson = viewContainer.nodePerson,
            returnFlg = false,
            playBtn = me.getPlayBtn(),
            src = playBtn.voiceSrc,
            logid = NG.getProductLoginInfo().productLoginID;
        if (comments == '' && !src) {
            NG.alert('审批意见不能为空', 1500);
            return;
        }
        if (issigature == 1 && !signid) {
            NG.alert('需要签章，请选择签章', 1500);
            return;
        }
        if (designate_node == 1) {
            if (nextNodeList.length == 0) {
                NG.alert('需要指定下级节点', 1500);
                return;
            }
        }

        if (me.needPerson) { //需要指定下级节点办理人
            Ext.each(nextNodeList, function (node) {
                if (nodePerson[node.nodeid].length == 0) {
                    var tmpCmp = dealContainer.down('.container[name=oneDealContainer-' + node.nodeid + ']');
                    if (tmpCmp) {
                        NG.alert(tmpCmp.getComponent(0).getHtml() + '未指定办理人', 1500);
                        returnFlg = true;
                        return false;
                    }
                } else {
                    Ext.each(nodePerson[node.nodeid], function (person) {
                        dealArray.push({nodeid: person.nodeid, elecode: person.elecode, usercode: person.usercode});
                    });
                }
                if (returnFlg) {
                    return false;
                }
            });
            if (returnFlg) return;
        }

        if (!me.validFormData()) {
            return;
        }
        
        NG.setWaiting(true, "正在提交");
        me.uploadAudio(function () {
            var parms = {
                method: 'Approve',
                flowType: appFlowInfo.flowtype,
                piid: appFlowInfo.piid,
                nodeid: appFlowInfo.nodeid,
                taskinstid: appFlowInfo.taskinstid,
                logid: logid,
                remark: comments || '语音',
                signcode: signid,
                bizdata: Ext.JSON.encode(me.bizDataHasChanged ? me.editBizData : []),
                audioremark: playBtn.audioRemark,
                nextnodes: Ext.JSON.encode(nextNodeList),
                nextnodeactors: Ext.JSON.encode(dealArray)
            };
            me.AFRequst('TaskInstance', parms, function (resp) {
                NG.setWaiting(false);
                if (resp.status == 'succeed') {
                    var appFlowController = me.getApplication().getController("work.appflow.AppFlowController");
                    appFlowController.backwardView(me.getAppFlowDetailView(), me.getAppFlowListView());
                    //NG.refreshMessageToSession(me, NG.MsgType.WORKFLOW, null, true);
                }
                else {
                    NG.alert('失败：' + resp.errmsg, 1500);
                }
            });
        }, "method=SaveAudioRemark&flowType=" + appFlowInfo.flowtype + "&piid=" + appFlowInfo.piid + "&nodeid=" + appFlowInfo.nodeid + "&taskinstid=" + appFlowInfo.taskinstid);
    },

    /* 验证表单数据信息 */
    validFormData: function() {
        var me = this,
            appFlowView = me.getAppFlowDetailView(),
            appFlowData = appFlowView.config.appFlowData,
            editBizData = [],
            bizData = appFlowData.bizData || [];
        if (me.hasFieldEdit) { //判断当前表单是否有可编辑字段
            for (var i = 0, bizLen = bizData.length; i < bizLen; i++) {
                var biz = bizData[i],
                    field, tmpCmp, currValue, matchArr,
                    tmpBiz = {GroupCode: biz.GroupCode, GroupName: "", Type: biz.Type, FieldSetings: [], DataRows: []},
                    fields = biz.FieldSetings;
                for (var k = 0, rowLen = biz.DataRows.length; k < rowLen; k++) {
                    var fValue = [], tf = false, row = {};
                    for (var j = 0, fdLen = fields.length; j < fdLen; j++) {
                        var obj = biz.DataRows[k].FieldValueList[j];
                        field = fields[j];
                        if (field.FieldType != "binary" && (field.ColtrolValue == 1 || field.ColtrolValue == 3 || field.ComputeExpr)) { //可编辑
                            tmpCmp = Ext.getCmp(biz.GroupCode + "-" + field.FieldCode + "-" + biz.DataRows[k].RowNum);
                            if (!tmpCmp) {
                                continue;
                            }
                            currValue = field.HelpString ? tmpCmp.getFromValues().Value : tmpCmp.getValue();
                            if (field.FieldType == "datetime") {
                                currValue = Ext.util.Format.date(currValue, 'Y-m-d H:i') || null;
                            } else if (field.FieldType == "date") {
                                currValue = Ext.util.Format.date(currValue, 'Y-m-d') || null;
                            }

                            if (currValue === "" && obj.Value === null) {
                                currValue = null;
                            }
                            if (obj.Value != currValue) {
                                if (Ext.isEmpty(currValue) && (field.FieldType == "float" || field.FieldType == "int")) {
                                    currValue = 0;
                                }
                                fValue.push({FieldCode: obj.FieldCode, Value: currValue, DisplayValue: obj.DisplayValue, OriginalValue: obj.OriginalValue});
                                me.bizDataHasChanged = true;
                                tf = true;
                                if (!me.validDataFormat(currValue, field.FieldType)) {
                                    NG.alert(field.FieldDesc + " 数据格式错误");
                                    return false;
                                }
                            }

                            if (field.ColtrolValue == 3 && Ext.isEmpty(currValue)) { //必输判断
                                NG.alert(field.FieldDesc + " 不能为空");
                                return false;
                            }
                        } else if (field.IsPk) {
                            fValue.push({FieldCode: obj.FieldCode, Value: obj.Value, DisplayValue: obj.DisplayValue, OriginalValue: obj.OriginalValue});
                        }
                    }
                    if (tf) {
                        row.RowNum = biz.DataRows[k].RowNum;
                        row.RowDesc = "";
                        row.FieldValueList = fValue;
                        tmpBiz.DataRows.push(row);
                    }
                }
                editBizData.push(tmpBiz);
            }
            me.editBizData = editBizData;
        }
        return true;
    },

    //验证数据的格式是否正确
    validDataFormat: function(value, type) {
        var regExp = null;
        if (type == "int") {
            regExp = /^-?\d+$/;
        } else if (type == "float") {
            regExp = /^(-?\d+)(\.\d+)?$/;
        } else {
            return true;
        }
        return Ext.isEmpty(value) || regExp.test(value);
    },

    /*详细界面返回*/
    appFlowDetailBack_onTap: function () {
        this.getApplication().getController("work.appflow.AppFlowController").backwardView(this.getAppFlowDetailView(), this.getAppFlowListView());
    },

    /*任务详情html*/
    buildTaskInstInfo: function (data) {
        var me = this,
            taskInfo = [
                {
                    name: '任务描述', info: (me.pageType == "View" ? data.keyword : data.taskdesc)
                },
                {
                    name: '任务开始时间', info: data.startdt
                },
                {
                    name: (me.pageType == "View" ? '流程结束时间' : '流程开始时间'), info: (me.pageType == "View" ? data.enddt : data.pistartdt)
                },
                {
                    name: '发起人', info: data.initiator
                }
            ];
        return taskInfo;
    },

    getAttachDownloadUrl: function (config) {
        var me = this;
        NG.setWaiting(true, "正在获取附件地址..");
        Ext.Ajax.request({
            url: WeChat_GLOBAL_CONFIG.weChatServeAdr,
            params: {
                requestType: 'get',
                requestAds: NG.getProductLoginInfo().productAdr + "/rest/api/oa/ArchiveAttach/GetArchiveAttachment" + config.fileUrl
            },
            method: 'GET',
            success: function(response, opts) {
                var resp = NG.decodeJson(response.responseText);
                if (resp.downloadurl) {
                    config.success(response, opts);
                }
                else {
                    if (config.attachname) {
                        me.getAttachDownloadUrl({
                            fileUrl: me.filePath + config.attachname,
                            success: config.success,
                            failure: config.failure
                        });
                    }
                }
            },
            failure: config.failure
        });
    },

    checkUpdated: function(dataArray, callback) {
    	var lastModifiedDate,
    		filePath,
    		logInfo = NG.getProductLoginInfo(),
    		needUpdatedArray = [];
		dataArray = dataArray || [];
		var checkFunction = function(index, fullPath) {
			if(index < dataArray.length) {
				filePath = [fullPath, "/", 'ngtmpfile' + dataArray[index].downloadurl.substr(dataArray[index].downloadurl.lastIndexOf('/') + 1)].join("");
            	window.resolveLocalFileSystemURI(filePath, function(fileEntry) {
            		fileEntry.file(function(file) {
            			lastModifiedDate = file.lastModifiedDate;
			    		NG.dbManager.excuteSql(
			    			"select * from attach_info where eno=? and logid=? and fname=?",
			    			[logInfo.eNo, logInfo.loginId, 'ngtmpfile' + dataArray[index].downloadurl.substr(dataArray[index].downloadurl.lastIndexOf('/') + 1)],
			    			function (data) {
			    				if(data.length > 0) {
			    					if(data[0].updatetime < lastModifiedDate) {
			    						dataArray[index].filePath = filePath;
			    						needUpdatedArray.push(dataArray[index]);
			    					}
			    				}
			    				checkFunction(++index, fullPath);
		                    }
		                );
            		});
		    	}, null);
			}
			else {
				callback && callback(needUpdatedArray);
			}
		};
    	if (window.cordovaFileDirEntry) {
            // 调用 cordova phoneGap 的文件系统， 获取logInfo.eNo下的 loginInfo.loginId的文件夹实例,
            // fullPath: 从根目录到当前DirectoryEntry的完整绝对路径
            window.cordovaFileDirEntry.getDirectory(logInfo.eNo, { create: true, exclusive: false }, function (dir) {
                dir.getDirectory(logInfo.loginId, { create: true, exclusive: false }, function (dirEntry) {
                	checkFunction(0, dirEntry.fullPath);
                });
            });
    	}
    },
    
    /*附件下载*/
    attachPanelViewList_onItemTap: function (list, record, target, index, e, eOpts) {
        var me = this;
        record = {data: record};
        var parms = {
            arctable: record.data.arctable,
            arccode: record.data.arccode,
            attachname: record.data.attachname
        };
        if(record.data.attachname.toLowerCase().lastIndexOf('.jpg') > 0 || record.data.attachname.toLowerCase().lastIndexOf('.png') > 0) {
            if(target.downloadurl) {
                NG.showImage(null, target.downloadurl);
                return;
            }
            if(me.attachsPath.length == 0) {
                me.getAttachDownloadUrl({
                    attachname: record.data.attachname,
                    fileUrl: me.filePath + me.attachsHashMap.join(','),
                    success: function (response, opts) {
                        NG.setWaiting(false);
                        var resp = NG.decodeJson(response.responseText);
                        if (resp.downloadurl) {
                            me.attachsPath = resp.downloadurl;
                            var isArray = (typeof me.attachsPath == 'object');
                            if(isArray) {
                                for(var i=0; i<me.attachsPath.length; i++) {
                                    me.attachsPath[i] = NG.replaceURL(me.attachsPath[i]);
                                }
                            }
                            else {
                                me.attachsPath = '';
                                target.downloadurl = NG.replaceURL(resp.downloadurl);
                                me.downloadurls.push({
                                	downloadurl: NG.replaceURL(resp.downloadurl),
                                	asratttable: record.data.asrattachtable,
                                	asrtable: record.data.arctable,
                                	asrcode: record.data.arccode,
                                	attachname: record.data.attachname
                            	});
                            }
                            var position = me.attachsHashMap.indexOf(record.data.attachname);
                            NG.showImage(null, isArray ? me.attachsPath[position] : target.downloadurl, null, null, null, null, {attachs: me.attachsPath, position: position});
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
                var position = me.attachsHashMap.indexOf(record.data.attachname);
                NG.showImage(null, typeof me.attachsPath == 'object' ? me.attachsPath[position] : target.downloadurl, null, null, null, null, {attachs: me.attachsPath, position: position});
            }
        }
        else {
            if (target.downloadurl) {
                window.open(target.downloadurl.replace('127.0.0.1', GLOBAL_CONFIG.Host));
                //NG.downLoadFile(target.downloadurl, record.data.arctable + "_" + record.data.arccode, record.data.attachname, record.data.attachsize);
                return;
            }
            NG.setWaiting(true, "正在获取附件地址");
            Ext.apply(parms, {requestType: 'post', requestAds: NG.getProductLoginInfo().productAdr + "/rest/api/oa/ArchiveAttach/Get"})
            Ext.Ajax.request({
                url: WeChat_GLOBAL_CONFIG.weChatServeAdr,
                method: 'POST',
                params: parms,
                success: function (response, opts) {
                    var resp = Ext.JSON.decode(response.responseText);

                    NG.setWaiting(false);
                    if (resp.downloadurl) {
                        target.downloadurl = resp.downloadurl;
                        me.downloadurls.push({
                            downloadurl: resp.downloadurl,
                            asratttable: record.data.asrattachtable,
                            asrtable: record.data.arctable,
                            asrcode: record.data.arccode,
                            attachname: record.data.attachname
                        });
                        window.open(resp.downloadurl.replace('127.0.0.1', GLOBAL_CONFIG.Host));
                        //NG.downLoadFile(resp.downloadurl, record.data.arctable + "_" + record.data.arccode, record.data.attachname, record.data.attachsize);
                    }
                    else {
                        NG.alert("无法获取附件地址", 1500);
                    }
                },
                failure: function (response, opts) {
                    NG.setWaiting(false);
                    NG.alert(GLOBAL_CONFIG.NetWorkError, 1500);
                }
            });
        }
    },

    /*请求审批/未审批数据*/
    reloadTypeList: function (panel, flag) {
        var store = Ext.getStore('AppFlowTypeListStore');
        panel.setApptype(flag);
        var parms = { method: 'GetTaskInstanceCount', logid: this.logid, type: flag };
        store.removeAll();
        store.setParams(parms);
        store.load();
    },

    /*审批流请求*/
    AFRequst: function (funcname, parms, callback) {
        var me = this;
        Ext.Ajax.request({
            url: WeChat_GLOBAL_CONFIG.weChatServeAdr + "?requestType=post&requestAds=" + NG.getProductLoginInfo().productAdr + "/rest/api/workflow/" + funcname + "/Get",
            method: 'POST',
            params: parms,
            success: function (response, opts) {
                var resp = NG.decodeJson(response.responseText);
                if (resp.status) {
                    callback(resp);
                }
                else {
                    NG.alert("服务器接口异常", 1500);
                    NG.sysLog(resp);
                }
            },
            failure: function (response, opts) {
                NG.setWaiting(false);
                NG.alert("连接服务器失败", 1500);
            }
        });
    },

    getTmpData:function(){
        return {
            "bizData": [
                {
                    "GroupCode": "pur_order_m",
                    "GroupName": "采购订单表头",
                    "Type": 0,
                    "FieldSetings": [
                        {
                            "FieldCode": "order_code",
                            "FieldDesc": "单据名称",
                            "FieldType": "string",
                            "SortID": 0,
                            "ColtrolValue": 2,
                            "HelpString": {
                                "Type": 0,
                                "Value": [
                                    {"code": "000001", "name": "单据00001"},
                                    {"code": "000002", "name": "单据00000002"}
                                ]
                            }
                        },
                        {
                            "FieldCode": "order_name",
                            "FieldDesc": "订单名称",
                            "FieldType": "string",
                            "SortID": 1,
                            "ColtrolValue": 2,
                            "HelpString": {
                                "Type": 1,
                                "Value": "select  pc code ,project_name name from project_table"
                            }
                        } ,
                        {
                            "FieldCode": "dj",
                            "FieldDesc": "采购单价",
                            "FieldType": "float",
                            "SortID": 2,
                            "ColtrolValue": 1,
                            "HelpString":null
                        } ,
                        {
                            "FieldCode": "total",
                            "FieldDesc": "总价",
                            "FieldType": "float",
                            "SortID": 3,
                         /*   "ComputeExpr": "SUM({pur_order_m.price}*{pur_order_d.numb})",*/
                            "ComputeExpr": "{pur_order_m.yc}*{pur_order_m.dj}",
                            "ColtrolValue": 0,
                            "HelpString": null
                        } ,
                        {
                            "FieldCode": "test_b",
                            "FieldDesc": "审批时间",
                            "FieldType": "datetime",
                            "SortID": 4,
                            "ColtrolValue": 1,
                            "HelpString":null
                        }
                        ,
                        {
                            "FieldCode": "price",
                            "FieldDesc": "实际价格",
                            "FieldType": "float",
                            "SortID": 5,
                            "ComputeExpr": "{pur_order_m.dj}*0.1",
                            "ColtrolValue": 0,
                            "HelpString": null
                        },
                        {
                            "FieldCode": "yc",
                            "FieldDesc": "隐藏价格",
                            "FieldType": "float",
                            "SortID": 6,
                            "ColtrolValue": 2,
                            "HelpString": null
                        }
                    ],
                    "DataRows": [
                        {
                            "RowNum": 0,
                            "RowDesc": "第0行",
                            "FieldValueList": [
                                {
                                    "FieldCode": "order_code",
                                    "Value": "0000010039",
                                    "DisplayValue": "0000010039",
                                    "OriginalValue": "0000010039"
                                },
                                {
                                    "FieldCode": "order_name",
                                    "Value": "钢筋采购好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长",
                                    "DisplayValue": "钢筋采购好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长",
                                    "OriginalValue": "钢筋采购好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长好长"
                                }
                                ,
                                {
                                    "FieldCode": "dj",
                                    "Value": "20",
                                    "DisplayValue": "20",
                                    "OriginalValue": "20"
                                }
                                ,
                                {
                                    "FieldCode": "total",
                                    "Value": "600",
                                    "DisplayValue": "600",
                                    "OriginalValue": "600"
                                },
                                {
                                    "FieldCode": "test_b",
                                    "Value": "2015-01-01",
                                    "DisplayValue": "2015-01-01",
                                    "OriginalValue": "2015-01-01"
                                },
                                {
                                    "FieldCode": "price",
                                    "Value": "2",
                                    "DisplayValue": "2",
                                    "OriginalValue": "2"
                                },
                                {
                                    "FieldCode": "yc",
                                    "Value": "10",
                                    "DisplayValue": "10",
                                    "OriginalValue": "10"
                                }
                            ]
                        }
                    ]
                },
                {
                    "GroupCode": "pur_order_d",
                    "GroupName": "采购订单明细",
                    "Type": 1,
                    "FieldSetings": [
                        {
                            "FieldCode": "tm",
                            "FieldDesc": "审批时间",
                            "FieldType": "datetime",
                            "SortID": 0,
                            "ComputeExpr": "{pur_order_m.test_b}",
                            "ColtrolValue": 1,
                            "HelpString":null
                        },
                        {
                            "FieldCode": "numb",
                            "FieldDesc": "数量",
                            "FieldType": "int",
                            "SortID": 1,
                            "ComputeExpr": "{pur_order_d.je}/{pur_order_m.price}",
                            "ColtrolValue": 1,
                            "HelpString": null
                        },
                        {
                            "FieldCode": "je",
                            "FieldDesc": "金额",
                            "FieldType": "float",
                            "SortID": 2,
                            "ComputeExpr": "{pur_order_m.price}*{pur_order_d.numb}",
                            "ColtrolValue": 0,
                            "HelpString": null
                        },
                        {
                            "FieldCode": "pc",
                            "FieldDesc": "工程项目",
                            "FieldType": "string",
                            "SortID": 3,
                            "ColtrolValue": 1,
                            "HelpString": {
                                "Type": 1,
                                "Value": "select  pc code ,project_name name from project_table"
                            }
                        },
                        {
                            "FieldCode": "res_code",
                            "FieldDesc": "合同",
                            "FieldType": "binary",
                            "SortID": 4,
                            "ColtrolValue": 0,
                            "HelpString": null
                        }
                    ],
                    "DataRows": [
                        {
                            "RowNum": 0,
                            "RowDesc": "第1行",
                            "FieldValueList": [
                                {
                                    "FieldCode": "tm",
                                    "Value": "2015-01-01",
                                    "DisplayValue": "2015-01-01",
                                    "OriginalValue": "2015-01-01"
                                },
                                {
                                    "FieldCode": "numb",
                                    "Value": "100",
                                    "DisplayValue": "100",
                                    "OriginalValue": "100"
                                },
                                {
                                    "FieldCode": "je",
                                    "Value": "200",
                                    "DisplayValue": "200",
                                    "OriginalValue": "200"
                                },
                                {
                                    "FieldCode": "pc",
                                    "Value": "0000000044",
                                    "DisplayValue": "海亮教育园区国际二部",
                                    "OriginalValue": "0000000044"
                                },
                                {
                                    "FieldCode": "res_code",
                                    "Value": "G220001210000401",
                                    "DisplayValue": "G220001210000401",
                                    "OriginalValue": "G220001210000401"
                                }
                            ]
                        },
                        {
                            "RowNum": 1,
                            "RowDesc": "第2行",
                            "FieldValueList": [
                                {
                                    "FieldCode": "tm",
                                    "Value": "2015-01-01",
                                    "DisplayValue": "2015-01-01",
                                    "OriginalValue": "2015-01-01"
                                },
                                {
                                    "FieldCode": "numb",
                                    "Value": "200",
                                    "DisplayValue": "200",
                                    "OriginalValue": "200"
                                },
                                {
                                    "FieldCode": "je",
                                    "Value": "400",
                                    "DisplayValue": "400",
                                    "OriginalValue": "400"
                                },
                                {
                                    "FieldCode": "pc",
                                    "Value": "0000000044",
                                    "DisplayValue": "海亮教育园区国际二部",
                                    "OriginalValue": "0000000044"
                                },
                                {
                                    "FieldCode": "res_code",
                                    "Value": "G220001210000601",
                                    "DisplayValue": "G220001210000601",
                                    "OriginalValue": "G220001210000601"
                                }
                            ]
                        }
                    ]
                },
                {
                    "GroupCode": "pur_order_dd",
                    "GroupName": "销售订单明细",
                    "Type": 1,
                    "FieldSetings": [
                        {
                            "FieldCode": "pc",
                            "FieldDesc": "工程项目",
                            "FieldType": "string",
                            "SortID": 0,
                            "ColtrolValue": 1,
                            "HelpString": {
                                "Type": 1,
                                "Value": "select  pc code ,project_name name from project_table"
                            }
                        },
                        {
                            "FieldCode": "res_code",
                            "FieldDesc": "物料编码",
                            "FieldType": "string",
                            "SortID": 1,
                            "ColtrolValue": 0,
                            "HelpString": null
                        }
                    ],
                    "DataRows": [
                        {
                            "RowNum": 0,
                            "RowDesc": "第1行",
                            "FieldValueList": [
                                {
                                    "FieldCode": "pc",
                                    "Value": "0000000044",
                                    "DisplayValue": "海亮教育园区国际二部",
                                    "OriginalValue": "0000000044"
                                },
                                {
                                    "FieldCode": "res_code",
                                    "Value": "G220001210000401",
                                    "DisplayValue": "G220001210000401",
                                    "OriginalValue": "G220001210000401"
                                }
                            ]
                        },
                        {
                            "RowNum": 1,
                            "RowDesc": "第2行",
                            "FieldValueList": [
                                {
                                    "FieldCode": "pc",
                                    "Value": "0000000044",
                                    "DisplayValue": "海亮教育园区国际二部",
                                    "OriginalValue": "0000000044"
                                },
                                {
                                    "FieldCode": "res_code",
                                    "Value": "G220001210000601",
                                    "DisplayValue": "G220001210000601",
                                    "OriginalValue": "G220001210000601"
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }
});