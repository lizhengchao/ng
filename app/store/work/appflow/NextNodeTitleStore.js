/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-30
 * Time: 下午12:47
 * To change this template use File | Settings | File Templates.
 */
Ext.define("MyApp.store.work.appflow.NextNodeTitleStore", {
    extend: "Ext.data.Store",
    config: {
        fields: [
            {
                name:'nodeid',
                type:'string'
            },
            {
                name:'nodetext',
                type:'string'
            },
            {
                name:'designate_actor',
                type:'int'
            },
            {
                name:'designate_anyactor',
                type:'int'
            }
        ],
        data: []
    }
});
