/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-31
 * Time: 上午10:25
 * To change this template use File | Settings | File Templates.
 */
Ext.define("MyApp.store.work.appflow.NodeUserStore", {
    extend: "Ext.data.Store",
    config: {
        fields:[{
            name:'nodeid',
            defaultValue: ''
        },{
            name:'elecode',
            defaultValue: ''
        },{
            name:'usercode'
        },{
            name:'username'
        },{
            name:'checked',
            defaultValue: '0'
        }],
        proxy:{
            type:'ajax',
            url: '',//GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get',
            extraParams: {
            },
            //url:GLOBAL_CONFIG.AppFlowServer +'TaskInstance',
            reader:{
                type:'json',
                rootProperty:'data',
                totalProperty:'rowcount'
            }
        },
        autoLoad:false
    }
});