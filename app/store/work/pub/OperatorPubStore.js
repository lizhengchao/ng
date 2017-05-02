/**
 * Created by ibm on 2015/5/6.
 */
Ext.define("MyApp.store.work.pub.OperatorPubStore", {
    extend: "Ext.data.Store",
    config: {
        fields: ["usercode", "username", "code", "name", {
            name: 'checked',
            defaultValue: '0'
        }],
        remoteFilter: true,
        pageSize: 20,
        proxy: {
            type: 'ajax',
            url: '',//GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get'
            pageParam: 'pageindex',
            limitParam: 'pagesize',
            reader: {
                type: 'json',
                rootProperty: 'data',
                totalProperty: 'rowcount'
            }
        },
        autoLoad: false,
        clearOnPageLoad: false
    }
});