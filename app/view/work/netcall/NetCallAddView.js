/**
 * Created by ibm on 2015/11/12.
 */
Ext.define('MyApp.view.work.netcall.NetCallAddView', {
    extend: 'Ext.Container',
    xtype: 'netCallAddView',
    config: {
        autoDestroy: true,
        layout: {type: 'vbox'},
        cls: ['prevent-pointer-events'],
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        initObject: null,
        messageType: '0',
        items: [
            {
                docked: 'top',
                xtype: 'titlebar',
                name: 'netcallAddBar',
                title: '寻呼发布',
                items: [
                    {
                        ui: 'back',
                        align: 'left',
                        name: 'backBtn',
                        text: '',
                        width: 46,
                        style: 'padding-left:11px; width:46px;'
                    },
                    {
                        xtype: 'button',
                        name: 'sendBtn',
                        text: '发送',
                        ui: 'action-white',
                        align: 'right',
                        cls: 'button-no-radio tbr-btn'
                    }
                ]
            },
            {
                flex: 1,
                xtype: 'container',
                layout: {type: 'vbox'},
                cls: 'font15',
                defaults: {
                    xtype: 'container',
                    style: 'position: relative;'
                },
                items: [
                    {
                        name: 'masterContainer',
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'masterField',
                                label: '主送：',
                                labelWidth: 55,
                                cls: 'nopadding',
                                readOnly: true,
                                clearIcon: false,
                                style: 'padding:2px 39px 2px 11px;',
                                inputCls: 'new-blue-text',
                                component: {
                                    style: 'border: 0px;'
                                }
                            },
                            {
                                xtype: 'button',
                                name: 'master',
                                height: '39px',
                                width: '39px',
                                padding: 0,
                                border: 0,
                                margin: 0,
                                style: {
                                    'background-image': 'url(resources/images/nfc/add.png)',
                                    'background-position': '50% 50%',
                                    'background-size': '25px 25px',
                                    'background-repeat': 'no-repeat',
                                    'background-color': 'transparent',
                                    'border-radius': '50px',
                                    'position': 'absolute',
                                    'right': '6px',
                                    'top': '0px'
                                }
                            }
                        ]

                    },
                    {
                        name: 'ccContainer',
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'ccField',
                                label: '抄送：',
                                labelWidth: 55,
                                readOnly: true,
                                cls: 'nopadding before-line',
                                clearIcon: false,
                                style: 'padding:2px 39px 2px 11px;',
                                inputCls: 'new-blue-text',
                                component: {
                                    style: 'border: 0px;'
                                }
                            },
                            {
                                xtype: 'button',
                                name: 'cc',
                                height: '39px',
                                width: '39px',
                                padding: 0,
                                border: 0,
                                margin: 0,
                                style: {
                                    'background-image': 'url(resources/images/nfc/add.png)',
                                    'background-position': '50% 50%',
                                    'background-size': '25px 25px',
                                    'background-repeat': 'no-repeat',
                                    'background-color': 'transparent',
                                    'border-radius': '50px',
                                    'position': 'absolute',
                                    'right': '6px',
                                    'top': '0px'
                                }
                            }
                        ]
                    },
                    {
                        layout: {type: 'vbox'},
                        items: [
                            {
                                xtype: 'label',
                                cls: 'before-line',
                                name: 'outer',
                                style: 'padding:5px 11px;',
                                html: '外部手机、邮箱(多条用‘,’隔开)<div style="border-left: 5px solid transparent; border-right: 5px solid transparent;border-top: 5px solid gray;top: 12px;right: 20px;position: absolute;"></div>'
                            },
                            {
                                xtype: 'container',
                                name: 'outer',
                                hidden: true,
                                layout: {type: 'vbox'},
                                defaults: {
                                    xtype: 'textfield',
                                    labelWidth: 55,
                                    cls: 'nopadding before-line',
                                    clearIcon: false,
                                    style: 'padding:2px 11px 2px 11px;',
                                    inputCls: 'new-blue-text',
                                    component: {
                                        style: 'border: 0px;'
                                    }
                                },
                                items: [
                                    {
                                        label: '手机：',
                                        fieldName: 'outer_phone'
                                    },
                                    {
                                        label: '邮箱：',
                                        fieldName: 'outer_email'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'themeField',
                                label: '主题：',
                                labelWidth: 55,
                                fieldName: 'subject',
                                cls: 'nopadding before-line',
                                clearIcon: false,
                                style: 'padding:2px 39px 2px 11px;',
                                inputCls: 'new-blue-text',
                                component: {
                                    style: 'border: 0px;'
                                }
                            },
                            {
                                xtype: 'button',
                                name: 'attach',
                                height: '39px',
                                width: '39px',
                                padding: 0,
                                border: 0,
                                margin: 0,
                                style: {
                                    'background-image': 'url(resources/images/work/attach.png)',
                                    'background-position': '50% 50%',
                                    'background-size': '20px 20px',
                                    'background-repeat': 'no-repeat',
                                    'background-color': 'transparent',
                                    'border-radius': '50px',
                                    'position': 'absolute',
                                    'right': '6px',
                                    'top': '0px'
                                }
                            }
                        ]
                    },
                    {
                        cls: 'before-line',
                        style: 'position: relative;padding: 5px 11px;',
                        hidden: true,
                        layout: {type: 'hbox'},
                        items: [
                            {
                                html: '附件:',
                                width: 55,
                                style: 'color:#AAA9A9; line-height:30px;'
                            },
                            {
                                xtype: 'container',
                                flex: 1,
                                name: 'attachmentContainer',
                                layout: {
                                    type: 'hbox',
                                    align: 'center'
                                },
                                items: []
                            }
                        ]
                    },
                    {
                        //flex: 1,
                        cls: 'before-line',
                        items: [
                            {
                                xtype: 'textareainput',
                                name: 'contentInput',
                                maxRows: 8,
                                fieldName: 'content',
                                style: 'padding:11px;border:0px;width:100%;height:100%;',
                                placeHolder: '此处输入寻呼内容',
                                cls: 'new-blue-text full-screen'
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        name: 'originalContent',
                        hidden: true,
                        flex: 1,
                        margin: 11,
                        html: 'hello'
                    }
                ]
            }
        ]
    }
});