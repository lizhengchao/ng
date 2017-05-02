/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-31
 * Time: 下午3:13
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.view.work.appflow.ChangeUserView',{
    extend:'Ext.Panel',
    xtype: 'changeUserView',
    config:{
        layout:{type:'vbox'},
        items:[
            {
                docked:'top',
                xtype:'titlebar',
                title:'转签',
                items:[
                    {
                        ui: 'back',
                        align:'left',
                        name:'changeUserViewBackBtn',
                        text:'',
                        width:46,
                        style:'padding-left:11px; width:46px;'
                    },
                    {
                        ui: 'plain',
                        style:{
                            color:'white'
                        },
                        align:'right',
                        text:'完成',
                        cls:'button-no-radio',
                        name:'changeUserViewConfirmBtn'
                    }
                ]
            },
            {
                xtype: 'appFlowSearchField',
                searchStoreField:['username','usercode'],
                searchStore:'SysUserStore'
            },
            {
                xtype:'list',
                plugins:{
                    xclass:'Ext.plugin.ListPaging',
                    loadMoreText:' ',
                    noMoreRecordsText:'',
                    autoPaging:true
                },
                name:'changeUserViewList',
                flex:1,
                itemTpl:'<tpl if="checked==0"><img  btntype="radiobtn"  style="margin-top: -6px;width:32px;height: 32px;float: left" src="resources/images/btn_check_off_normal.png"/></tpl>'
                    + '<tpl if="checked==1"><img  btntype="radiobtn" style="margin-top: -6px;width:32px;height: 32px;float: left" src="resources/images/btn_check_on_normal.png"/></tpl>'+'<div style="margin-top: -6px;margin-left: 12px; max-width:220px;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;float: left;text-align: center;height: 32px;line-height: 32px;">{username}({usercode})</div>'
            },
            {
                xtype:'toolbar',
                docked:'bottom',
                items:[
                    {
                        name:'changeUserViewLastedUserBtn',
                        text:'最近联系人',
                        cls: 'button-no-radio',
                        ui: 'normal',
                        width: '50%'
                    },
                    {
                        name:'changeUserViewSysUserBtn',
                        text:'操作员',
                        cls: 'button-no-radio',
                        ui: 'action-white',
                        width: '50%'
                    }
                ]
            }
        ]
    }
});