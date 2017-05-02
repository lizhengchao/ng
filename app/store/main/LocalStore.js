/**
* User: jt
* Date: 14-3-11
* Time: 上午11:11
* 本地存储store
*/

Ext.define("MyApp.store.main.LocalStore", {
    extend: 'Ext.data.Store',
    config: {
        model: 'MyApp.model.main.LocalModel',
        autoLoad: true
    }
});
