/**
 * Created by ibm on 2015/11/11.
 */
Ext.define('MyApp.view.work.netcall.NetCallView', {
    extend: 'Ext.Container',
    xtype: 'netCallView',
    config: {
        autoDestroy: true,
        layout: {type: 'vbox'},
        items: [
            {
                docked: 'top',
                xtype: 'titlebar',
                title: '已收寻呼<div style="border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid white;display: inline-block;margin-left: 6px;margin-bottom: 3px;"></div>',
                items: [
                    {
                        ui: 'back',
                        hidden: true,
                        align: 'left',
                        name: 'backBtn',
                        text: '',
                        width: 46,
                        style: 'padding-left:11px; width:46px;'
                    },
                    {
                        xtype: 'button',
                        name: 'editBtn',
                        text: '编辑',
                        ui: 'action-white',
                        align: 'right',
                        cls: 'button-no-radio tbr-btn'
                    }
                ]
            },
            {
                docked: 'bottom',
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                style: 'border-top: 1px solid #ebebeb; height: 48px;',
                name: 'bottomBar',
                hidden: true,
                items: [
                    {
                        xtype: 'button',
                        border: 0,
                        ui: '',
                        width: 93,
                        iconCls: 'ng-select',
                        text: '全选',
                        cls: 'button-no-radio',
                        style: {
                            'background': 'transparent',
                            'color': '#3993DB'
                        }
                    },
                    {
                        xtype: 'container',
                        flex: 1,
                        layout: {
                            type: 'hbox',
                            align: 'center',
                            pack: 'end'
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
                                iconCls: 'ng-read',
                                ncIndex: [0],
                                text: '已阅'
                            },
                            {
                                iconCls: 'ng-save',
                                ncIndex: [0],
                                text: '收藏'
                            },
                            {
                                iconCls: 'ng-restore',
                                ncIndex: [4],
                                hidden: true,
                                text: '还原'
                            },
                            {
                                iconCls: 'ng-delete',
                                text: '删除'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'ngtabpanel',
                cls: 'font15',
                flex: 1,
                name: 'callTab',
                tabBar: {
                    style: 'margin-bottom:59px;'
                },
                defaults: {
                    xtype: 'nglist',
                    cls: ['ng-select-hidden'],
                    itemCls: "nglist nopadding",
                    loadingText: "努力加载中",
                    store: null,
                    itemTpl: ['<div style="padding: 7px 11px 7px 0px; position: relative; display: -webkit-box; -webkit-box-align: center;">',
                        '<div class="ng-select-item<tpl if=\"selected==1\"> ng-select-item-selected</tpl>" style="width: 40px;height: 40px;position: relative;"></div>',
                        '<div style="-webkit-box-flex:1; position: relative;padding-left: 17px;">',
                        '<div style="line-height: 23px;height: 23px;"><span>{name}</span><span class="msg-data" style="top:0px; right: 23px;">{cdt}</span>',
                        '<div class="center-image nfc-click" style="position: absolute;opacity: 0.5;right:0px;top:0px;width: 23px;height: 23px;background-size: 12px !important;background-image: url(\'resources/images/newIcon/u6.png\') !important;-webkit-transform: rotate(-90deg);"></div>',
                        '<tpl if="hasAttach==1"><div style="display: inline-block;height: 18px;width: 18px;top: 2px;left: 8px;position: relative;background:url(\'resources/images/work/attach.png\') no-repeat center;background-size: 18px;"></div></tpl></div>',
                        '<tpl if="read==0"><li style="list-style-type:disc;color: #3993db;font-size: 20px;left: 6px;position: absolute;top: 22px;line-height: 21px;"></li></tpl>',
                        '<div class="nowrap" style="line-height: 21px;">{subject}</div>',
                        '<div class="font14" style="margin:2px 1px;text-overflow: ellipsis;display: -webkit-box;-webkit-box-pack: end; -webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;color: #AAA9A9;">{msg}</div>',
                        '</div></div>'].join(''),
                    plugins: [
                        {
                            xclass: 'Ext.plugin.ListPaging',
                            loadMoreText: '',
                            noMoreRecordsText: '',
                            autoPaging: true
                        }
                    ]
                },
                items: [
                    {
                        title: '已收',
                        name:'list0'
                    },
                    {
                        title: '已发',
                        name:'list1'
                    },
                    {
                        title: '未达',
                        name:'list2'
                    },
                    {
                        title: '收藏',
                        name:'list3'
                    },
                    {
                        title: '已删',
                        name: 'list4'
                    }  ,
                    {
                        title: '短信',
                        name:'list5'
                    }
                ]
            },
            {
                xtype: 'searchfield',
                name:'search',
                placeHolder: '搜索',
                readOnly: true,
                padding: "13.5 10",
                style: 'position: absolute;top: 34px;width: 100%;'
            },
            {
                xtype: 'button',
                name:'addBtn',
                /*draggable: {
                    constraint: {
                        min: { x: -Infinity, y: -Infinity },
                        max: { x: Infinity, y: Infinity }
                    }
                },*/
                style: "z-index:990;position:absolute;bottom:15px;right:20px;width:50px;height:50px;padding: 0px;border: 0px;border-radius: 25px;background-image:url('resources/images/new_add.png');background-repeat: no-repeat;background-size:contain;"
            }
        ]
    }
});