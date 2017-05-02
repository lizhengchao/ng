/**
* User: jt
* Date: 14-3-25
* Time: 上午11:11
* 本地存储model
*/

Ext.define("MyApp.model.main.ProductLoginModel", {
    extend: 'Ext.data.Model',
    config: {
        fields: ['isLogin',
            { name: 'loginDate', type: 'Date'},
            'enterprise',
            'enterprises',
            'username',
            'approvalTaskTitle',
            'netCallTitle',
            'documentReceivedTitle',
            {name: 'netCall', type: 'int', defaultValue: 0},
            {name: 'approvalTask', type: 'int', defaultValue: 0},
            {name: 'documentReceived', type: 'int', defaultValue: 0}
        ],
        proxy: {
            type: 'localstorage',
            id: 'productLoginInfo'
        }
    }
});