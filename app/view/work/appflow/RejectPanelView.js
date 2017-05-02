/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-31
 * Time: 下午7:05
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.view.work.appflow.RejectPanelView', {
    extend: 'Ext.Panel',
    xtype: 'rejectPanelView',
    config: {
        layout: {type: 'vbox'},
        items: [
            {
                docked: 'top',
                xtype: 'titlebar',
                title: '驳回',
                items: [
                    {
                        ui: 'back',
                        align: 'left',
                        name: 'rejectPanelViewBackBtn',
                        text: '',
                        width: 46,
                        style: 'padding-left:11px; width:46px;'
                    },
                    {
                        ui: 'plain',
                        style: {
                            color: 'white'
                        },
                        align: 'right',
                        text: '完成',
                        cls: 'button-no-radio',
                        name: 'rejectPanelViewConfirmBtn'
                    }
                ]
            },
            {
                flex:1,
                xtype: 'panel',
                layout: {type: 'vbox'},
                scrollable: {
                    direction: 'vertical',
                    directionLock: true
                },
                cls: 'form-bg font15',
                items: [
                    {
                        xtype: 'ngaccordion',
                        name: 'taskContainer',
                        defaults: {
                            style: 'background-color: #FFFFFF;'
                        },
                        style: 'padding-bottom:20px;',
                        items: [
                            {
                                title: '回退节点',
                                xtype: 'taptpl',
                                name: 'rejectNodeList',
                                fixed: true,
                                style: 'position:relative; background-color: #FFFFFF;',
                                itemStyle: 'position:relative; padding: 12px 12px;color: #000; height:40px;',
                                data: [],
                                itemTpl: '<div btntype="radiobtn" class="{checked}" style="float: left;"></div>'
                                    + '<div class="nowrap" style="margin-left:12px; line-height:16px;float:left;">{nodetext}</div>'
                            },
                            {
                                title: '指派回退节点办理人',
                                xtype: 'container',
                                fixed: true,
                                name: 'rejectDealListContainer',
                                margin: 0,
                                layout: {type: 'vbox'},
                                hidden: false,
                                items: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
});