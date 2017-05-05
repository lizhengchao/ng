/**
 * Created with IntelliJ IDEA.
 * User: wcc
 * Date: 13-7-9
 * Time: 上午11:37
 * 聊天功能的controller
 */

Ext.define('MyApp.controller.contact.PublicContactDetailController', {
    extend: 'Ext.app.Controller',
    requires: [ ],
    config: {
        toId: '',
        ptype: null,
        views: [ 'contact.PublicContactDetailView'],
        //controllers: ['contact.ContactDetailController'],
        refs: {
            publicContactDetailView: 'publiccontactdetailview',
            chatMainView: 'chatMainView',
            chatRoomView: 'chatRoomView',
            wmain: 'mainview',
            contactdetailview: 'publiccontactdetailview container[name=detailview]',
            content: 'publiccontactdetailview container[name=detailview] container[name=content]',
            sendBtn: 'publiccontactdetailview container[name=detailview] button[name=intoChatRoomButton]',
            backBtn: 'publiccontactdetailview titlebar button[name=backbtn]',
            deleteBtn: 'publiccontactdetailview titlebar button[name=deletebtn]',
            chatarea: 'chatRoomView container[name=chatarea]',
            addMenuButton: 'chatMainView button[name = add]'
        },
        control: {
            publicContactDetailView: {
                initialize: 'publicContactDetailView_init'
            },
            sendBtn: {
                tap: 'sendBtn_Tap'
            },
            backBtn: {
                tap: 'backBtn_Tap'
            },
            deleteBtn: {
                tap: 'deleteBtn_Tap'
            }
        }
    },

    publicContactDetailView_init: function () {
        var me = this;
        me.getContent().setData({
            headshot: 'resources/images/headshots/2.png',
            name: '',
            org: '',
            tel: '',
            netcall: '',
            email: ''
        });
        me.getContactdetailview().element.on("touchend", function () {
            var data = me.getContent().getData();
            if (arguments[1].tagName == "IMG") {
                switch (arguments[1].id) {
                    case "tel":
                        if (data.tel && data.companyMobile) {
                            NG.showWindowList({
                                itemTpl: '<div style="font-size: {size}px; line-height: 24px;">{name}</div>',
                                data: [
                                    {name: data.tel},
                                    {name: data.companyMobile}
                                ],
                                cancel: false,
                                callback: function (record) {
                                    var name = record.name.toString();
                                    window.Communication.callPhone(name);
                                }
                            });
                        }
                        else if(data.tel) {
                            window.Communication.callPhone(data.tel);
                        }
                        else if(data.companyMobile) {
                            window.Communication.callPhone(data.companyMobile);
                        }
                        else {
                            NG.alert('电话号码不存在，无法拨打电话');
                        }
                        return false;
                    case "sms":
                        if (data.tel && data.companyMobile) {
                            NG.showWindowList({
                                itemTpl: '<div style="font-size: {size}px; line-height: 24px;">{name}</div>',
                                data: [
                                    {name: data.tel},
                                    {name: data.companyMobile}
                                ],
                                cancel: false,
                                callback: function (record) {
                                    var name = record.name.toString();
                                    window.Communication.sendSMS(name);
                                }
                            });
                        }
                        else if(data.tel) {
                            window.Communication.sendSMS(data.tel);
                        }
                        else if(data.companyMobile) {
                            window.Communication.sendSMS(data.companyMobile);
                        }
                        else {
                            NG.alert('电话号码不存在，无法发送短信');
                        }
                        return false;
                    case "email":
                        NG.alert('暂不支持邮件');
                        return false;
                }
            }
            else if (arguments[1].className == "headshot") {
                if (data.headshot && data.headshot != 'resources/images/headshots/2.png') {
                    // 修改为查看原图
                    var sender = data.jid.substr(0, data.jid.indexOf('@')),
                        url = GLOBAL_CONFIG.FileServer + '?operation=downloadavatar&sender=' + sender + ',' + NG.getProductLoginInfo().eNo;
                        
                    NG.showImage(null, [url], null, [data.headshot], 'avatarimage');
                }
            }
        });
    },

    sendBtn_Tap: function () {
        var me = this,
            chatMainView = me.getChatMainView(),
            wMain = me.getWmain(),
            chatRoomView = me.getChatRoomView() || Ext.create('MyApp.view.session.ChatRoomView'),
            personInfo = me.getContent().getData(),
            localStore = Ext.getStore('LocalStore'),
            userInfo = localStore.getById('userInfo'),
            charArea = me.getChatarea();
        if(personInfo.jid == userInfo.get('userName') + '@' + GLOBAL_CONFIG.HostName) {
            NG.alert('不能给自己发消息');
            return;
        }
        NG.initControllers(this, function () {
            if(me.LastActiveItem && me.LastActiveItem != wMain) {
                me.LastActiveItem.destroy();
                me.LastActiveItem = null;
            }
            charArea.removeAll(true, true);
            chatRoomView.setTitle(personInfo.name);
            chatMainView.pop(chatMainView.getInnerItems().length - 1);
            chatRoomView.element.addCls('prevent-pointer-events'); //防止事件穿透执行
            var store = Ext.getStore('SettingStore');
            var setting = store.getById('userSetting');
            if (setting != undefined && setting.get('chatBackground') != null) {
                window.NG.setBackgroundImage(charArea, setting.get('chatBackground'));
            }
            chatRoomView.setToId(me.getToId());
            chatMainView.push(chatRoomView);
            chatMainView.setActiveItem(chatRoomView);
            wMain.setActiveItem(chatMainView);
            wMain.getTabBar().hide();
            me.getAddMenuButton().setHidden(true);
            Ext.Viewport.remove(me.getPublicContactDetailView(), true);
            var inners = Ext.Viewport.getInnerItems();
            if(inners.length > 1) {
                for(var i=inners.length-1; i>0; i--) {
                    if(inners[i].id == 'mainview') {
                        break;
                    }
                    else {
                        inners[i].destroy();
                    }
                }
            }
            me.getApplication().getController("contact.ContactDetailController").loadChatHistoryLog();
            setTimeout(function () {
                if (chatRoomView.element) {
                    chatRoomView.element.removeCls('prevent-pointer-events');
                }
            }, 300);
        }, ['contact.ContactDetailController']);
    },

    loadPersonInfo: function (personId, personName, ptype, isEmp) {
        isEmp = true;


        var index = personId.indexOf("@" + GLOBAL_CONFIG.HostName);
        if(index > 0) {
            personId = personId.substr(0, index);
        }
        var me = this,
            content,
            //conn = me.getApplication().getConn(),
            eno = NG.getProductLoginInfo().eNo,
            defaultHeadshot = 'resources/images/headshots/2.png',
            dbID = null,
            record = {data: {jid: personId + "@" + GLOBAL_CONFIG.HostName}},
            publiccontactdetailview = me.getPublicContactDetailView() || Ext.create('MyApp.view.contact.PublicContactDetailView'),
            contactdetailview = me.getContactdetailview();
        me.getDeleteBtn().setHtml('删除');
        if (ptype) {
            me.setPtype(ptype);
            if (ptype == 2) {
                me.getDeleteBtn().setHtml('添加');
            }
        }
        else {
            this.setPtype(null);
        }
        me.setToId(record.data.jid);
        me.personName = personName;
        if (personId != NG.getProductLoginInfo().loginId && (ptype == 1 || ptype == 2)) {
            me.getDeleteBtn().setHidden(false);
        }
        else {
            me.getDeleteBtn().setHidden(true);
        }
        me.LastActiveItem = Ext.Viewport.getActiveItem();
        Ext.Viewport.add(publiccontactdetailview);
        Ext.Viewport.setActiveItem(publiccontactdetailview);

        if (isEmp == true) {
            NG.setWaiting(true);
            me.getSendBtn().setHidden(true);
            Ext.Ajax.request({
                url: NG.getProductLoginInfo().productAdr + "/rest/api/PsoftMobileApp/get",
                method: 'post',
                params: {
                    method: 'GetEmpInfo',
                    code: personId
                },
                success: function (response, opts) {
                    NG.setWaiting(false);
                    var responseText = response.responseText;
                    if (responseText) {
                        var resp = NG.decodeJson(responseText);
                        if (resp.length > 0) {
                            var tmpData = {
                                headshot: defaultHeadshot,
                                name: resp[0].cname,
                                org: resp[0].deptname,
                                tel: resp[0].mobile1,
                                email: resp[0].email
                            };
                            me.getContent().setData(tmpData);
                        }
                        else {
                            NG.alert('获取数据失败');
                        }
                    } else {
                        NG.sysLog("ProjectPersonInfo error.");
                    }
                },
                failure: function (response, opts) {
                    NG.setWaiting(false);
                }
            });
        }
        else {
            NG.setWaiting(true);
            var jid = record.data.jid;
            //发送vCard请求更新用户个人信息
            var execFn = function (data) {
                conn.vcard.get(function (item) {
                    var vcardXml = item.getElementsByTagName('vCard')[0];
                    var headshot = defaultHeadshot,
                        name = '',
                        org = '',
                        tel = '',
                        companyMobile,
                        netcall = '',
                        email = '',
                        model = null,
                        elementTel;
                    if (vcardXml.querySelector('PHOTO')) {
                        headshot = 'data:' + vcardXml.querySelector('PHOTO').querySelector('TYPE').textContent + ';base64,' + vcardXml.querySelector('PHOTO').querySelector('BINVAL').textContent;
                    }
                    var elementTels = vcardXml.getElementsByTagName('TEL');
                    for (var i = 0; i < elementTels.length; i++) {
                        elementTel = elementTels[i];
                        if (elementTel.querySelector('WORK') && elementTel.querySelector('CELL')) {
                            tel = elementTel.querySelector('NUMBER') != null ? elementTel.querySelector('NUMBER').textContent : '';
                            if (tel.length > 0) {
                                break;
                            }
                            else {
                                for (var i = 0; i < elementTels.length; i++) {
                                    elementTel = elementTels[i];
                                    if (elementTel.querySelector('WORK') && elementTel.querySelector('VOICE')) {
                                        tel = elementTel.querySelector('NUMBER') != null ? elementTel.querySelector('NUMBER').textContent : '';
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    for (var i = 0; i < elementTels.length; i++) {
                        elementTel = elementTels[i];
                        if (elementTel.querySelector('WORK') && elementTel.querySelector('COMPANYMOBILE')) {
                            companyMobile = elementTel.querySelector('NUMBER') != null ? elementTel.querySelector('NUMBER').textContent : '';
                        }
                    }
                    if (vcardXml.querySelector('TEL')) {
                        tel = vcardXml.querySelector('TEL').querySelector('NUMBER').textContent;
                    }
                    if (vcardXml.querySelector('EMAIL')) {
                        email = vcardXml.querySelector('EMAIL').querySelector('USERID').textContent;
                    }
                    if (vcardXml.querySelector('ORG')) {
                        org = vcardXml.querySelector('ORG').querySelector('ORGUNIT').textContent.replace(/::/g, ">");
                    }
                    if (vcardXml.querySelector('NICKNAME')) {
                        name = vcardXml.querySelector('NICKNAME').textContent;
                    } else if (vcardXml.querySelector('GIVEN') != null) {
                        name = vcardXml.querySelector('GIVEN').textContent;
                    } else if (personName) {
                        name = personName;
                    } else {
                        name = personId;
                    }
                    if (data.length == 0 || (data.length == 1 && data[0].headshot != headshot)) { //头像没有变化，不用更新通讯录头像
                        var conController = me.getApplication().getController("contact.ContactController");
                        var friend = conController.isMyFriend(record.data.jid);
                        if (friend) {
                            friend.headshot = headshot;
                            conController.refreshMyFriend();
                        }
                    }
                    //更新对话列表头像，或昵称
                    var chatListStore = Ext.getStore('ChatListStore');
                    var chatListModel = chatListStore.findRecord('jid', personId);
                    if (chatListModel) {
                        chatListModel.set('headshot', headshot);
                        chatListModel.set('name', name);
                    }

                    var headshotstore = Ext.getStore('HeadshotListStore');
                    var headshotModel = headshotstore.findRecord('jid', record.data.jid);
                    if (headshotModel) {
                        headshotModel.set('headshot', headshot);
                        headshotModel.save();
                    }

                    var tmpData = {
                        eno: eno,
                        jid: record.data.jid,
                        headshot: headshot,
                        name: name,
                        org: org,
                        netcall: personId,
                        tel: tel,
                        email: email
                    };

                    content = Ext.clone(tmpData);
                    if(companyMobile != null) {
                        content.companyMobile = companyMobile;
                        tmpData.tel = tmpData + ',' + companyMobile;
                    }
                    content.headshot = content.headshot.replace('/22.png', '/2.png');
                    me.getContent().setData(content);
                    if (dbID) {
                        NG.dbManager.excuteSql("update person_detail set headshot=?,name=?,org=?,netcall=?,tel=?,email=? where id=?", [headshot, name, org, personId, tel, email, dbID], function () {
                        });
                    } else {
                        if (data.length > 1) {
                            NG.dbManager.deleteData("person_detail", "eno=? and jid=?", [eno, record.data.jid], function () {
                                NG.dbManager.insert("person_detail", [tmpData]);
                            });
                        } else {
                            NG.dbManager.insert("person_detail", [tmpData]);
                        }
                    }
                    NG.setWaiting(false);
                }, jid, function () {
                    NG.setWaiting(false);
                });
            };
            NG.dbManager.excuteSql("select * from person_detail where eno=? and jid=?", [eno, jid], function (data) {
                if (data.length == 1) {
                    if (jid.indexOf('@') < 0) {
                        jid = jid + '@' + GLOBAL_CONFIG.HostName;
                    }
                    content = Ext.clone(data[0]);
                    content.headshot = content.headshot.replace('/22.png', '/2.png') || defaultHeadshot;
                    var headshot = content.headshot;
                    dbID = data[0].id;
                    var email = content.email || '',
                        nickname = content.name,
                        modifyDate = email.substr(0, email.indexOf(',')) || 0,
                        tel = content.tel || '';
                    if(tel.indexOf(',') >= 0) {
                        content.companyMobile = tel.split(',')[1];
                        content.tel = tel.split(',')[0];
                    }
                    content.email = email.indexOf(',') >= 0 ? email.substr(email.indexOf(',') + 1) : '';
                    me.getContent().setData(content);
                    Ext.Ajax.request({
                        url: GLOBAL_CONFIG.NetCallApi + '/plugins/uiauthentication/getvcard',
                        method: 'GET',
                        params: {
                            username: jid.replace('@' + GLOBAL_CONFIG.HostName, ''),
                            date: modifyDate
                        },
                        success: function (response, opts) {
                            NG.setWaiting(false);
                            var resp = response.responseText;
                            if (resp != 'NO NEED TO UPDATE') {
                                var updateData = Ext.JSON.decode(resp);
                                var image = updateData.image || defaultHeadshot,
                                    truename = updateData.truename,
                                    org = updateData.organization,
                                    personId = updateData.jid,
                                    tel = updateData.cellphone,
                                    companyMobile = updateData.companyMobile,
                                    myemail = updateData.email;
                                nickname = updateData.nickname;
                                var tmpData = {
                                    eno: eno,
                                    jid: jid,
                                    headshot: image,
                                    name: nickname,
                                    org: org,
                                    netcall: personId,
                                    tel: tel,
                                    email: myemail
                                };
                                if(companyMobile != null) {
                                    tmpData.companyMobile = companyMobile;
                                }
                                content = Ext.clone(tmpData);
                                content.headshot = content.headshot.replace('/22.png', '/2.png');
                                me.getContent().setData(content);
                                NG.dbManager.excuteSql("update person_detail set headshot=?,name=?,org=?,netcall=?,tel=?,email=? where id=?", [image, nickname, org, personId, companyMobile == null ? tel : tel + ',' + companyMobile, updateData.modifydate + ',' + myemail, data[0].id], function () {
                                });
                                if (image != headshot || truename != data[0].name) { //头像和昵称没有变化，不用更新通讯录
                                    var conController = me.getApplication().getController("contact.ContactController");
                                    var friend = conController.isMyFriend(jid);
                                    if (friend) {
                                        friend.headshot = image;
                                        friend.name = truename;
                                        conController.refreshMyFriend();
                                    }
                                }
                            }
                            //更新对话信息列表
                            var chatListStore = Ext.getStore('ChatListStore');
                            var chatListModel = chatListStore.findRecord('jid', jid);
                            if (chatListModel) {
                                chatListModel.set('headshot', headshot.replace('/22.png', '/2.png'));
                                chatListModel.set('name', nickname);
                            }
                        },
                        failure: function () {
                            execFn(data);
                        }
                    });

                } else {
                    execFn(data);
                }
            });
        }
    },

    backBtn_Tap: function () {
        Ext.Viewport.remove(this.getPublicContactDetailView(), true);
        if (this.LastActiveItem) {
            Ext.Viewport.setActiveItem(this.LastActiveItem);
        }
    },

    //删除好友
    deleteBtn_Tap: function () {
        var me = this,
            toId = me.getToId(),
            jid = toId.replace("@" + GLOBAL_CONFIG.HostName, "");
        if(this.getPtype() == 2) {
            var application = me.getApplication(),
                conn = application.getConn(),
                conController = application.getController('contact.ContactController');
            if (conController.isMyFriend(toId)) {
                NG.alert(me.personName + '已经是您的好友');
                return;
            }
            if(application.getController("contact.ProcessInvitationController").isContained(toId)>-1) {
                NG.alert(me.personName + '的好友请求还未处理');
                return;
            }

            Ext.Ajax.request({
                url: NG.getProductLoginInfo().productAdr + '/rest/uiauthentication/getrostergroup',
                method: 'GET',
                params: {
                    username: jid,
                    serviceNickName: "netcallservice"
                },
                success: function (response, opts) {
                    console.log(response.responseText);
                    var res = Ext.JSON.decode(response.responseText);
                    var groupname = [];
                    console.log(res.length);
                    for (var i = 0; i < res.length; i++) {
                        groupname.push(res[i].groupname);
                    }
                    groupname.push('我的联系人');
                    me.getApplication().getConn().roster.add(toId, me.personName, groupname, function (response) {
                        console.log(response);
                        var error = response.getElementsByTagName('error');
                        if (error.length <= 0) {
                            NG.alert('好友请求发送成功');
                            var localStore = Ext.getStore('LocalStore');
                            var userInfo = localStore.getById('userInfo');
                            var iq = $iq({type: 'set', from: userInfo.get('userName') + '@' + GLOBAL_CONFIG.HostName, to: GLOBAL_CONFIG.HostName})
                                .c('query', {xmlns: 'ng:iq:customfriend'})
                                .c('type', null, '0')
                                .c('friendname', null, jid);
                            console.log(iq.tree());
                            conn.sendIQ(iq.tree(), function () {
                                var msg = $msg({ type: 'chat', to: toId, from: userInfo.get('userName') + '@' + GLOBAL_CONFIG.HostName})
                                    .c('friendrelation', {'xmlns': 'ng:iq:friendrelate', 'relatetype': '0'}).up().cnode(Strophe.xmlElement('body', '', Ext.htmlDecode('向您发送了好友请求')));
                                conn.send(msg.tree());
                                NG.initControllers(me, Ext.bind(function () {
                                    var headshotstore = Ext.getStore('HeadshotListStore');
                                    var model = headshotstore.findRecord('jid', toId);
                                    if (model) {
                                        var headshot = model.get('headshot');
                                        var name = me.personName;
                                        application.getController("contact.ProcessInvitationController").addNewFriends(headshot, name, toId, 2);
                                    }
                                    else {
                                        conn.vcard.get(function (item) {
                                            console.log(item);
                                            var vcardXml = item.getElementsByTagName('vCard')[0];
                                            var headshot = 'resources/images/headshots/2.png';
                                            var name = jid;
                                            if (vcardXml.querySelector('PHOTO') != null) {
                                                headshot = 'data:' + vcardXml.querySelector('PHOTO').querySelector('TYPE').textContent + ';base64,' + vcardXml.querySelector('PHOTO').querySelector('BINVAL').textContent;
                                            }
                                            if (vcardXml.querySelector('GIVEN') != null) {
                                                name = vcardXml.querySelector('GIVEN').textContent;
                                            }
                                            application.getController("contact.ProcessInvitationController").addNewFriends(headshot, name, toId, 2);
                                        }, toId, function () {
                                            var headshot = 'resources/images/headshots/2.png';
                                            var name = me.personName;
                                            application.getController("contact.ProcessInvitationController").addNewFriends(headshot, name, toId, 2);
                                        });
                                    }
                                }, me), ['contact.ProcessInvitationController']);
                            }, function () {
                                NG.alert('添加失败');
                            });
                        } else {
                            NG.alert('添加失败');
                        }
                    });
                }
            });
        }
        else {
            Ext.Ajax.request({
                url: NG.getProductLoginInfo().productAdr + '/rest/uiauthentication/getrostergroup',
                method: 'GET',
                params: {
                    username: jid,
                    serviceNickName: "netcallservice"
                },
                success: function (response, opts) {
                    var res = Ext.JSON.decode(response.responseText);
                    var groupname = [];
                    for (var i = 0; i < res.length; i++) {
                        if (res[i] != '我的联系人') {
                            groupname.push(res[i].groupname);
                        }
                    }
                    me.getApplication().getConn().roster.add(toId, me.personName, groupname, function (response) {
                        var error = response.getElementsByTagName('error');
                        if (error.length <= 0) {
                            var localStore = Ext.getStore('LocalStore');
                            var userInfo = localStore.getById('userInfo');
                            var iq = $iq({
                                type: 'set',
                                from: userInfo.get('userName') + '@' + GLOBAL_CONFIG.HostName,
                                to: GLOBAL_CONFIG.HostName
                            })
                                .c('query', {xmlns: 'ng:iq:customfriend'})
                                .c('type', null, '3')
                                .c('friendname', null, jid);
                            me.getApplication().getConn().sendIQ(iq.tree(), function () {
                                var msg = $msg({
                                    to: toId,
                                    from: userInfo.get('userName') + '@' + GLOBAL_CONFIG.HostName
                                })
                                    .c('friendrelation', {'xmlns': 'ng:iq:friendrelate', 'relatetype': '1'});
                                me.getApplication().getConn().send(msg.tree());
                                me.getApplication().getController("contact.ContactController").removeMyFriend(toId);
                                me.backBtn_Tap();
                                NG.alert('删除成功');
                            }, function () {
                                NG.alert('删除失败');
                            });
                        } else {
                            NG.alert('删除失败');
                        }
                    });
                },
                failure: function (response, opts) {

                }
            });
        }
    }
});

