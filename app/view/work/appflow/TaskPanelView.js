/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-25
 * Time: 上午10:30
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.view.work.appflow.TaskPanelView', {
    requires: ['Ext.Img'],
    extend: 'Ext.Panel',
    xtype: 'taskPanelView',
    config: {
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
                        title: '任务详细',
                        xtype: 'container',
                        name: 'taskDetailContainer',
                        padding: '8 0',
                        tpl: ['<tpl for=".">',
                            '<div style="display:-webkit-box; padding: 5px 12px 0px 12px;text-align:center; position: relative; ">',
                            '<div style="min-height: 30px; width: 90px; text-align:left;display: -webkit-box;-webkit-box-align: center;  color: #AAA9A9; ">{name}</div>',
                            '<div style="padding-left: 14px; -webkit-box-flex:1; text-align:left; word-break: break-all; word-wrap:break-word; display: -webkit-box; -webkit-box-align: center;-webkit-box-pack: start;">{info}</div>' ,
                            '</div>', '</tpl>'],
                        data: [ ]
                    },
                    {
                        title: '流转历史',
                        xtype: 'component',
                        name: 'taskHistoryList',
                        data: [],
                        cls: 'left-line',
                        hidden: true,
                        tpl: new Ext.XTemplate('<tpl for="."><div class="line {nodeStyle}" style="padding: 12px 12px 12px 32px; min-height: 66px; color: #AAA9A9; ">'
                            , '<div class="mark" style="margin: auto 0; position: relative;">{remark}&nbsp;</div>'
                            , '<tpl if="audioremark"><div class="audio" audio="{audioremark}" style="position: relative; height: 22px; width:20px; margin-top: 8px;background-repeat: no-repeat;background-size: auto 20px; background-position: 100% 50%; background-image: url(resources/images/left_play.png);"></div></tpl>'
                            , '<table width="100%" style="table-layout: fixed; margin-top: 8px;" border=0><tr>'
                            , '<td class="nowrap" style="width:100%;">{actualactor}</td>'
                            , '<tpl if="action!=null"><td style="width:90px">{action}</td></tpl>'
                            , '<td style="width: 80px;text-align: right;">{actdt}</td>'
                            , '</tr></table></div></tpl>')
                    },
                    {
                        xtype: 'panel',
                        title: '',
                        layout: {type: 'vbox'},
                        padding: '10 12 6 12',
                        margin: '8 0 0 0',
                        items: [
                            {
                                xtype: "container",
                                layout: {type: 'hbox'},
                                items: [
                                    {
                                        flex: 1,
                                        name: 'commentsText',
                                        xtype: 'textareafield',
                                        cls: 'comment',
                                        draggable: false,
                                        padding: 0,
                                        maxRows: 3,
                                        placeHolder: '审批意见',
                                        margin: '0 10 0 0'
                                    },
                                    {
                                        xtype: 'container',
                                        layout: { type: 'vbox'},
                                        items: [
                                            {
                                                xtype: 'image',
                                                name: 'voiceImage',
                                                width: 36,
                                                src: 'resources/images/newIcon/u167.png',
                                                style:'-webkit-box-flex: 1;background-position: center;background-size: contain;'
                                            },
                                            {
                                                xtype: 'image',
                                                name: 'signImage',
                                                margin: '5 0 0 0',
                                                width: 36,
                                                src: 'resources/images/newIcon/u169.png',
                                                style:'-webkit-box-flex: 1;background-position: center;background-size: contain;'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                name:'playImage',
                                hidden: true,
                                style: 'position: absolute;top: 58px;left: 13px;background-color: rgba(225,225,225,.1);right: 59px;border-radius: 0px 0px 6px 6px;',
                                layout:{
                                    type: 'hbox'
                                },
                                items: [
                                    {
                                        xtype: 'label',
                                        name: 'play',
                                        width: 20,
                                        height: 20,
                                        style: 'margin-top: 5px; margin-left: 8px;background-color: rgba(235, 235, 235, 0.2);border-radius: 3px;background-size: auto 20px;background-position: 100% 50%;background-repeat: no-repeat;background-image: url("resources/images/left_play.png");'

                                    },
                                    {
                                        xtype: 'label',
                                        name:'delete',
                                        html: '<div style="color: #3993db; text-decoration: underline; width:35px;line-height: 30px;  margin-left: 20px;">删除</div>'
                                    }
                                ]
                            },
                            {
                                xtype: "container",
                                style: 'margin-top: 4px;',
                                layout: {type: 'hbox'},
                                items: [
                                    {
                                        xtype: 'taptpl',
                                        flex: 1,
                                        name: 'myMarks',
                                        itemStyle: 'position:relative; width: 33.3%; height: 30px; float:left; margin-bottom: 5px; color:#000;',
                                        itemTpl: '<div class="mymark nowrap" style="position: absolute;left: 0px; right: 5px;">{text}</div>',
                                        data: []
                                    },
                                    {
                                        xtype: 'image',
                                        name: 'moreImage',
                                        hidden: true,
                                        width: 36,
                                        height: 30,
                                        style: 'background-size: 16px; margin-bottom: 5px;',
                                        src: 'resources/images/newIcon/u189.png'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: '下一节点',
                        xtype: 'taptpl',
                        name: 'nextNodeList',
                        hidden: true,
                        style: 'position:relative; background-color: #FFFFFF;',
                        itemStyle: 'position:relative; padding: 10px 12px; line-height: 20px; height: 40px;',
                        data: [],
                        itemTpl: '<div btntype="radiobtn" class="{checked}" style="float: left;"></div>'
                            + '<div class="nowrap" style="white-space:normal; max-width:90%; margin-left:6px; float:left;">{nodetext}</div>'
                    },
                    {
                        title: '指派下级节点办理人',
                        xtype: 'container',
                        name: 'dealListContainer',
                        margin: 0,
                        layout: {type: 'vbox'},
                        hidden: false,
                        items: []
                    }
                ]
            }
        ]
    }
});