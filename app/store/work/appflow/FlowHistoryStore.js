/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-25
 * Time: 下午7:16
 * To change this template use File | Settings | File Templates.
 */
Ext.define("MyApp.store.work.appflow.FlowHistoryStore", {
    extend: "Ext.data.Store",
    config: {
        fields: ["actualactor", "actdt",{
            name:'action',
            defaultValue: ''
        },"remark"],
        data: []
    }
});