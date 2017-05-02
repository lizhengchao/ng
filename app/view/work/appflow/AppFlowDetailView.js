/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-24
 * Time: 下午9:17
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.view.work.appflow.AppFlowDetailView', {
    extend: 'Ext.Panel',
    xtype: 'appFlowDetailView',
    config: {
        layout: {type: 'vbox'},
        scrollable: null,
        items: [
            {
                docked: 'top',
                xtype: 'titlebar',
                items: [
                    {
                        ui: 'back',
                        align: 'left',
                        name: 'backbtn',
                        text: '',
                        width: 46,
                        style: 'padding-left:11px; width:46px;'
                    }
                ]
            },
            {
                xtype: 'ngtabpanel',
                name: 'detailmainview',
                tabBar: true,
                flex: 1,
                items: [
                    {
                        title: '任务',
                        flex: 1,
                        xtype: 'taskPanelView'
                    },
                    {
                        title: '表单',
                        flex: 1,
                        xtype: 'formPanelView'
                    },
                    {
                        title: '附件',
                        flex: 1,
                        xtype: 'attachPanelView'
                    }
                ]
            },
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },
                style: 'border-top: 1px solid #ebebeb;',
                name: 'afdetailViewActionToolbar',
                docked: 'bottom',
                defaults: {
                    xtype: 'button',
                    border: 0,
                    ui: '',
                    cls: 'button-no-radio',
                    style: {
                        'background': 'transparent',
                        'color': '#3993DB'
                    }
                },
                items: [ ]
            },
            {
                xtype: 'container',
                name: 'appTip',
                html: '*当前节点无法在手机上操作，请到PC端处理',
                hidden: true,
                style: 'position: absolute; bottom:11px; left:11px; color: red; font-size: 14px;'
            },
            {
                xtype: 'container',
                name: 'moreMenuContainer',
                hidden: true,
                layout: {
                    type: 'vbox',
                    align: 'center',
                    pack: 'center'
                },
                cls:'',
                width: 100,
                style: 'position: absolute; border: 1px solid rgba(128, 128, 128, 0.2);border-radius: 4px; bottom: 6px; z-index: 999; background-color:#fff;',
                defaults: {
                    xtype: 'button',
                    ui: '',
                    style: {
                        'background': 'transparent',
                        'color': '#3993DB'
                    }
                },
                items: [ ],
                listeners: {
                    initialize: function () {
                        var left = ((Ext.Viewport.element.getWidth() - 2) / 3 - 100) / 2;
                        if (left > 0) {
                            this.element.setStyle({'left': left + 'px'});
                        }
                    }
                }
            }
        ]
    }
});