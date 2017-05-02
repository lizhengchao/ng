/**
* Created with JetBrains WebStorm.
* User: xnb
* Date: 14-3-31
* Time: 上午10:24
* To change this template use File | Settings | File Templates.
*/
Ext.define("MyApp.store.work.appflow.SysUserStore", {
    extend: "Ext.data.Store",
    config: {
        fields: [{
            name: 'nodeid',
            defaultValue: ''
        }, {
            name: 'elecode',
            defaultValue: ''
        }, {
            name: 'usercode'
        }, {
            name: 'username'
        }, {
            name: 'checked',
            defaultValue: '0'
        }],
        params:{
            method: 'GetAllUser'
        },
        remoteFilter:true,
        pageSize: 15,
        proxy: {
            type: 'ajax',
            url: '',//GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get',
            pageParam: 'pageindex',
            limitParam: 'pagesize',
            reader: {
                type: 'json',
                rootProperty: 'data',
                totalProperty: 'rowcount'
            }
        },
        autoLoad: false,
        listeners:{
            'beforeload':function(store,operation,opts){
                //operation.setPage(operation.getPage()-1);
            }
        }
    }
});
