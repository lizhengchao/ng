/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-31
 * Time: 下午4:31
 * 用于最近联系人本地存储
 */
Ext.define('MyApp.store.work.appflow.RecentContactsStore', {
    extend: 'Ext.data.Store',
    config: {
        model:'MyApp.model.work.RecentContactsModel'
    }
});