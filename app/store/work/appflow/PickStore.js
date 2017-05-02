/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-28
 * Time: 下午3:20
 * To change this template use File | Settings | File Templates.
 */
Ext.define("MyApp.store.work.appflow.PickStore", {
    extend: 'Ext.data.Store',
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
        data: []
    }
});