/**
 * Created with IntelliJ IDEA.
 * User: wcc
 * Date: 13-7-9
 * Time: 下午4:29
 * 通讯录联系人的详细资料
 */

Ext.define('MyApp.view.contact.PublicContactDetailView', {
    extend: 'Ext.Panel',
    xtype: 'publiccontactdetailview',
    config: {
        layout: 'vbox',
        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                title: '详细资料',
                items: [
                    {
                        xtype: 'button',
                        name: 'backbtn',
                        ui: 'back',
                        text:'',
                        width:46,
                        style:'padding-left:11px; width:46px;'
                    },
                    {
                        xtype: 'button',
                        text: '删除',
                        name: 'deletebtn',
                        ui: 'action-white',
                        padding: 0,
                        align: 'right',
                        cls: 'button-no-radio',
                        hidden: false,
                        width: 55,
                        style: 'font-size: .9375rem;'
                    }
                ]
            },
            {
                xtype: 'container',
                name: 'detailview',
                flex: 1,
                layout: 'vbox',
                scrollable: {
                    direction: 'vertical',
                    directionLock: true
                },
                cls:'form-bg',
                items: [
                    {
                        xtype: 'container',
                        name: 'content',
                        tpl: '<div>' +
                            '<div style="display:-webkit-box;padding:9px 18px 9px 18px;background-color:#ffffff;margin:10px 0px 10px 0px;">' +
                            '<tpl if="headshot==\'resources/images/headshots/2.png\'||headshot==\'resources/images/headshots/22.png\'">' +
                                '<div class="headshot" style="width:48px; background-color:{[NG.randomColors(values.name)]}; color:white; text-align:center; line-height:48px; border-radius:5px 5px 5px 5px; border-color:gray;">{[values.name.substr(0,1)]}</div>' +
                            '</tpl>' + 
                            '<tpl if="headshot!=\'resources/images/headshots/2.png\'&&headshot!=\'resources/images/headshots/22.png\'">' +
                                '<div class="headshot" style="background-image:url({headshot});background-size:cover;background-position:center; width:48px; height:48px; border-radius:5px 5px 5px 5px; border-color:gray;"></div>' + 
                            '</tpl>' + 
                            '<div class="nowrap" style="-webkit-box-flex:1;padding-left:12px;font-size:1rem; max-width: 150px;"><span style="line-height: 48px;">{name}</span></div>' +
                            '</div>' +
                            '<div  style="min-height:42px;line-height:22px;background-color:#ffffff;display:-webkit-box;text-align:center;padding:10px 18px 10px 18px;">' +
                            '<div style="padding-left:0px;width:100px;text-align:left;display: -webkit-box;-webkit-box-align: center;"><span>组织</span></div>' +
                            '<div style="-webkit-box-flex:1;text-align:left; word-break: break-all; word-wrap:break-word;">{org}</div>' +
                            '</div>' +
                            '<div class="before-line" style="min-height:42px;line-height:22px;background-color:#ffffff;display:-webkit-box;text-align:center;padding:10px 18px 10px 18px;">' +
                            '<div style="padding-left:0px;width:100px;text-align:left;"><span>Netcall</span></div>' +
                            '<div style="-webkit-box-flex:1;text-align:left;">{netcall}</div>' +
                            '</div>' +
                            '<div class="before-line" style="min-height:42px;line-height:22px;background-color:#ffffff;display:-webkit-box;text-align:center;padding:10px 18px 10px 18px;">' +
                            '<div style="padding-left:0px;width:100px;text-align:left;">手机</div>' +
                            '<div style="-webkit-box-flex:1;text-align:left;">{tel}</div>' +
                            '</div>' +
                            '<div class="before-line" style="min-height:42px;line-height:22px;background-color:#ffffff;display:-webkit-box;text-align:center;padding:10px 18px 10px 18px;">' +
                            '<div style="padding-left:0px;width:100px;text-align:left;">企业短号</div>' +
                            '<div style="-webkit-box-flex:1;text-align:left;">{companyMobile}</div>' +
                            '</div>' +
                            '<div class="before-line" style="min-height:42px;line-height:22px;background-color:#ffffff;display:-webkit-box;text-align:center;padding:10px 18px 10px 18px;">' +
                            '<div style="padding-left:0px;margin-left:0px;width:100px;text-align:left;display: -webkit-box;-webkit-box-align: center;">邮箱</div>' +
                            '<div style="-webkit-box-flex:1;text-align:left; word-break: break-all; word-wrap:break-word;">{email}</div>' +
                            '</div>' +
                            //'<div class="before-line" style="height:66px;background-color:#ffffff;display:-webkit-box;text-align:center;padding:8px 18px 8px 18px;">' +
                            //'<div style="padding-left:0px;line-height:50px;width: 100px;text-align: left;"><span>快捷通讯</span></div>' +
                            //'<div style="-webkit-box-flex:1;text-align:left;">' +
                            //'<image id="tel" style="margin-right:10px;width:50px;height:50px;" src="resources/images/k1.png"/>' +
                            //'<image id="sms" style="margin-right:10px;width:50px;height:50px;" src="resources/images/k3.png"/>' +
                            //'<image id="email" style="width:60px;height:60px; display: none;" src="resources/images/k2.png"/>' +
                            //'</div>' +
                            //'</div>' +
                            '</div>'
                    },
                    {
                        xtype: 'button',
                        hidden: true,
                        name: 'intoChatRoomButton',
                        height: 40,
                        ui: 'action-yellow',
                        margin: '20 20 20 20',
                        style: {
                            'margin': '1em',
                            'color': 'white',
                            'font-size': '1rem',
                            'background-color': '#fea500'
                        },
                        text: '发消息'
                    }
                ]
            }
        ]
    }
});
