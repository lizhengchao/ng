/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-24
 * Time: 下午8:22
 * To change this template use File | Settings | File Templates.
 */
Ext.define("MyApp.store.work.appflow.AppFlowListStore", {
    extend: "Ext.data.Store",
    config: {
        fields: ["biztype", "flowtype", "bizname", "piid", "nodeid", "taskinstid", "initiator", "initiator_name", "taskdesc", "startdt", "rownum_", "sduetime", "keyword", "actdt", "curusername", "curusercode", "pista"],
        remoteFilter: true,
        pageSize: 20,
        proxy: {
            type: 'ajax',
            url: '',//GLOBAL_CONFIG.productAdr + '/rest/api/workflow/TaskInstance/Get',
            pageParam: 'pageindex',
            limitParam: 'pagesize',
            extraParams: {
            },
            reader: {
                type: 'json',
                rootProperty: 'data',
                totalProperty: 'rowcount'
            }
        },
        autoLoad: false,
        clearOnPageLoad: false,
        listeners: {
            'load': function (ss, records) {
                Ext.each(records, function (cr) {
                    if (cr.get('actdt')) {
                        cr.set('actdt', NG.dateFormatOfWork(cr.get('actdt')));
                    }
                });
            }
        }
    }
});