/**
* User: jt
* Date: 14-3-11
* Time: 上午11:11
* 本地存储model
*/

Ext.define("MyApp.model.main.LocalModel", {
    extend: 'Ext.data.Model',
    config: {
        fields: ['id', 'enterprise', 'isAppDemo', 'userName', 'userPassWord', 'trueName', 'enterpriseCode', 'enterpriseId', 'enterpriseName', 'innerNetcallAdr', 'productAdr', 'netcallAdr', { name: 'loginDate', type: 'Date' }, { name: 'lastLoginDate', type: 'Date' }, 'headshotInit', 'headshot', { name: 'vcard', type: 'Object'}],
        proxy: {
            type: 'localstorage',
            id: 'userInfo'
        }
    }
});
