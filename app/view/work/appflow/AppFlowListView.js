/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-24
 * Time: 下午8:18
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.view.work.appflow.AppFlowListView', {
    requires: ['Ext.Label', 'Ext.Img', 'Ext.plugin.ListPaging'],
    extend: 'Ext.Panel',
    xtype: 'appFlowListView',
    config: {
        layout: {type: 'vbox'},
        items: [
            {
                xtype: 'toolbar',
                docked: 'top',
                items: [
//                    {
//                        xtype: 'button',
//                        name: 'backbtn',
//                        ui: 'back',
//                        text: '',
//                        width: 46,
//                        style: 'padding-left:11px; width:46px;'
//                    },
                    {
                        xtype: 'spacer'
                    },
                    {
                        xtype: 'label',
                        name: 'titlelabel',
                        html: '<span style="font-size: 1.125rem;color: #ffffff; margin-left: 40px">审批任务</span>'
                    },
                    {
                        xtype: 'spacer'
                    },
                    {
                        xtype: 'searchbutton',
                        name: 'searchBtn',
                        align: 'right',
                        placeHolder: '在全部审批任务中搜索',
                        itemTpl: ''
                    }
                ]
            },
            {
                xtype: 'container',
                name: 'typeSelectContainer',
                cls: 'my-gray',
                style: {
                    height: '32px'
                },
                layout: {type: 'hbox'},
                items: [
                    {
                        margin: '4px 11px',
                        textField: 'typename',
                        flex: 1,
                        xtype: 'typeviewer',
                        text: '待办任务',
                        viewData: [
                            {
                                name: "",
                                data: [
                                    {
                                        "typecno": "001",
                                        "typename": "待办任务"
                                    },
                                    {
                                        "typecno": "002",
                                        "typename": "已办任务"
                                    },
                                    {
                                        "typecno": "003",
                                        "typename": "我发起的流程"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'images',
                        name: 'sortImg',
                        src: 'resources/images/work/time.png',
                        style: 'background-size: 50%; margin-right: 7px;　background-repeat:no-repeat;',
                        height: 32,
                        width: 32,
                        listeners: {
                            initialize: function () {
                                var el = this.element;
                                el.on({
                                    'touchstart': function () {
                                        el.addCls("x-button-pressed");
                                    },
                                    'touchend': function () {
                                        el.removeCls("x-button-pressed");
                                    }
                                });
                            }
                        }
                    }
                ]
            },
            {
                xtype: 'list',
                store: 'AppFlowListStore',
                itemHeight: 67,
                itemCls: "nglist",
                disableSelection: true,
                useSimpleItems: true,
                onItemDisclosure: false,
                variableHeights: false,
                scrollable: {
                    direction: 'vertical',
                    directionLock: true,
                    momentumEasing: {
                        momentum: {
                            acceleration: 30,
                            friction: 0.5
                        },
                        bounce: {
                            acceleration: 3,
                            springTension: 0.9999
                        },
                        minVelocity: 5
                    },
                    outOfBoundRestrictFactor: 0.5
                },
                striped: false,
                loadingText: "正在加载数据..",
                flex: 1,
                plugins: {
                    xclass: 'Ext.plugin.ListPaging',
                    loadMoreText: '',
                    noMoreRecordsText: '',
                    autoPaging: true
                }
            }
        ]
    }
});