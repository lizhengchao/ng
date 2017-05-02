/**
* User: jt
* Date: 14-3-25
* Time: 上午11:11
* 本地存储store
*/

Ext.define("MyApp.store.main.ProductLoginStore", {
    extend: 'Ext.data.Store',
    config: {
        model: 'MyApp.model.main.ProductLoginModel',
        autoLoad: true,
        autoSync: true
    }
});
