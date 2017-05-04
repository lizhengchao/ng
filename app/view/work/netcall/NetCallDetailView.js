/**
 * Created by ibm on 2015/11/12.
 */
Ext.define('MyApp.view.work.netcall.NetCallDetailView', {
    extend: 'Ext.Container',
    xtype: 'netCallDetailView',
    config: {
        autoDestroy: true,
        layout: {type: 'vbox'},
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        hasread: true,
        ncIndex: 0,
        ccode: '',
        recieverCCode: '',
        items: [
            {
                docked: 'top',
                xtype: 'titlebar',
                title: '寻呼查看',
                items: [
                    {
                        ui: 'back',
                        align: 'left',
                        name: 'backBtn',
                        text: '',
                        width: 46,
                        style: 'padding-left:11px; width:46px;'
                    }
                ]
            },

            {
                xtype:'container',
                name:'newsTittle',
                padding: '15 12 5 12',
                cls:'font15'
            },
            {
                xtype: 'container',
                padding: '0 15 0 12',
                cls:'font13',
                style: "color: #AAA9A9; line-height: 36px;",
                layout: 'hbox',
                items: [
                    {
                        xtype: 'ngaccordion',
                        name: 'newsMsg',
                        flex: 1,
                        cls: 'simple',
                        defaults: {
                            style: 'background-color: #FFFFFF;'
                        },
                        items: []
                    }
                ]
            },
            {
                padding: 0,
                html: '<div class="scale-line" style="position: relative; left:0px; right: 0px; "></div>'
            },
            {
                xtype:'container',
                name:'newsImg',
                padding: '11 12 0 12'
            },
            {
                xtype: 'container',
                styleHtmlCls: '',
                name: 'newsContent',
                style: 'word-break: break-all;',
                padding: '2 12 0 12'
            },
            {
                xtype: 'label',
                name: 'hisTitle',
                hidden: true,
                html: '历史消息',
                cls: 'font15',
                style: 'text-align:center;color:#AAA9A9;padding-top:10px;'
            },
            {
                xtype: 'container',
                name: 'historyContent',
                padding: '5 12 0 12',
                getothermsg: 'append',
                cls: 'font14',
                tpl: ['<tpl for=".">',
                    '<div style="color:#AAA9A9;word-break: break-all;width:100%;">',
                    '<div class="scale-line"></div>',
                    '<div style="position:relative; padding: 11px 0px 4px 0px;margin-bottom: 5px;">发送人:{sender}</div>',
                    '<div style="position:relative; padding: 4px 0px;margin-bottom: 5px;">发送时间:{sdt}</div>',
                    '<div style="position:relative; padding: 4px 0px;margin-bottom: 5px;width:100%;">内容:{remark}</div>',
                    '</div>',
                    '</tpl>'
                ],
                data: []
            },
            {
                xtype: 'label',
                name: 'hisMoreLabel',
                hidden: true,
                cls: 'font14',
                html: '上滑加载更多',
                style: 'text-align:center;padding:11px;'
            },
            {
                xtype: 'container',
                name: 'attachHeader1',
                hidden: true,
                style: {
                    backgroundColor: '#ebebeb'
                },
                margin: '10 0 0 0',
                padding: '5 8',
                items: [
                    {
                        xtype: 'label',
                        flex: 1,
                        html: '<span class="font15" style="color: #8A8A8A;">附件</span>'
                    }
                ]
            },
            {
                xtype: 'taptpl',
                name: 'attachList1',
                style: 'top: -1px; position:relative; margin-bottom: 18px;',
                itemStyle: 'position:relative; padding: 13px;',
                itemTpl: ['<div style="position: relative;"><div style="background-image:url({icon});background-repeat: no-repeat;background-position: center;background-size: 40px 40px;width: 40px;height: 40px;"></div>',
                    '<div style="display: block;position: absolute;top: 0px;left: 42px;right: 0px;height: 40px;line-height: 20px;"><div class="nowrap font15">{attachname}</div>',
                    '<span class="nowrap font13" style="color: #AAA9A9;">{attachtime}&nbsp;&nbsp;{attachsize}</span></div></div>'].join(""),
                data: []
            },

            {
                docked: 'bottom',
                hidden: false,
                xtype: 'container',
                style: 'border-top: 1px solid #ebebeb; height: 48px;padding-left: 8px;',
                name: 'bottomBar',
                layout: {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },
                defaults: {
                    xtype: 'button',
                    flex: 1,
                    border: 0,
                    ui: '',
                    cls: 'button-no-radio',
                    style: {
                        'background': 'transparent',
                        'color': '#3993DB',
                        'max-width': '70px'
                    }
                },
                items: [
                    {
                        iconCls: 'ng-edit',
                        ncIndex: [1],
                        style: {
                            'background': 'transparent',
                            'color': '#3993DB',
                            'max-width': '100px'
                        },
                        text: '再次发送'
                    },
                    {
                        iconCls: 'ng-reply',
                        ncIndex: [0, 3],
                        text: '回复'
                    },
                    {
                        iconCls: 'ng-trans',
                        ncIndex: [0, 3, 5],
                        text: '转发'
                    },
                    {
                        iconCls: 'ng-save',
                        ncIndex: [0],
                        text: '收藏'
                    },
                    {
                        iconCls: 'ng-restore',
                        ncIndex: [4],
                        text: '还原'
                    },
                    {
                        iconCls: 'ng-delete',
                        text: '删除'
                    }
                ]
            }
        ]
    }
});