/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-31
 * Time: 下午7:37
 * 最近联系人store
 */
Ext.define("MyApp.store.work.appflow.RecentListStore", {
    extend: 'Ext.data.Store',
    config: {
        autoLoad: true,
        autoSync: true,
        model: 'MyApp.model.work.RecentContactsModel'
    }
});