/**
 * Created by ibm on 2015/11/11.
 */
/**
 * Created with JetBrains WebStorm.
 * User: jt
 * Date: 15-11-11
 * Time: 上午11:11
 * To change this template use File | Settings | File Templates.
 */
Ext.define("MyApp.store.work.netcall.NetCallListStore", {
    extend: "Ext.data.Store",
    config: {
        fields: [
            {name: 'RecieverCCode', type: 'string', mapping: 'cno'},
            {name: 'ccode', type: 'string', mapping: 'ccode'},
            {name: 'recieverName', type: 'string', mapping: 'recieverName'},
            {name: 'name', type: 'string', mapping: 'SenderName', convert: function (v, r) {
                var name = r.get('recieverName');
                if (name) {
                    return v + ' > ' + name;
                }
                return v;
            }},
            {name: 'hasAttach', type: 'int', mapping: 'Attachment', convert: function (v) {
                return v == 'yes' ? 1 : 0;
            }},
            {name: 'read', type: 'int', mapping: 'c_status'},
            {name: 'cdt', type: 'string', mapping: 'sendtime', convert: function (v) {
                return NG.dateFormatOfWork(v);
            }},
            {name: 'subject', type: 'string', mapping: 'cname'},
            {name: 'msg', type: 'string', mapping: 'remarks'},
            {name: 'selected', type: 'int', defaultValue: 0}
        ],
        remoteFilter: true,
        pageSize: 6,
        proxy: {
            type: 'ajax',
            url: '',
            pageParam: 'pageindex',
            startParam: false,
            limitParam: 'pagesize',
            reader: {
                type: 'json',
                rootProperty: 'Content',
                totalProperty: 'RowCount'
            }
        },
        autoLoad: false,
        clearOnPageLoad: false
    }
});