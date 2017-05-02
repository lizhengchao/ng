/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-26
 * Time: 下午9:24
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.view.work.appflow.StampListView',{
    extend: 'Ext.Panel',
    xtype: 'stampListView',
    config: {
        scrollable: true,
        layout: {
            type: 'vbox'
        },
        items: [{
            docked:'top',
            xtype:'titlebar',
            title:'签名印章',
            items:[
                {
                    ui: 'back',
                    align:'left',
                    name:'stampListBack',
                    text:'',
                    width:46,
                    style:'padding-left:11px; width:46px;'
                },
                {
                    ui: 'action-white',
                    align:'right',
                    text:'完成',
                    cls:'button-no-radio',
                    name:'stampListConfirm'
                }
            ]
        },{
            flex:1,
            xtype: 'list',
            name:'stampList',
            //itemHeight:100,
            store:'StampListStore',
            itemTpl:'<tpl if="checked==0"><img  btntype="radiobtn"  style="width:30px;height: 30px;float: left" src="resources/images/btn_check_off_normal.png"/></tpl>'
                + '<tpl if="checked==1"><img  btntype="radiobtn" style="width:30px;height: 30px;float: left" src="resources/images/btn_check_on_normal.png"/></tpl>'
            +'<img style="margin-left: 12px;margin-top: 0px;width:60px;height: 30px;float: left" src="data:image/gif;base64,{content}"/>'
            +'<input id="PwdInput{id}" style="width:150px;height:30px;float: right" type="password" placeholder="请输入密码"/>'
        }]
    }
});