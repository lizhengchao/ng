/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-27
 * Time: 上午10:51
 * To change this template use File | Settings | File Templates.
 */
Ext.define("MyApp.store.work.appflow.StampListStore", {
    extend: "Ext.data.Store",
    config: {
        fields:[{
            name:'ccode'
        },{
            name:'content'
        },{
            name:'markpass'
        },{
            name:'pwd',
            defaultValue: ''
        },{
            name:'checked',
            defaultValue: '0'
        }],
        data: []
    }
});