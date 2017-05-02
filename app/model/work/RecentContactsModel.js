/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-31
 * Time: 下午4:56
 * 保存最近联系人
 */
Ext.define('MyApp.model.work.RecentContactsModel', {
    extend: 'Ext.data.Model',
    config: {
        fields:[{
            name:'usercode'
        },{
            name:'username'
        },{
            name:'checked',
            defaultValue: '0'
        }],
        proxy: {
            type: 'localstorage'
        }
    }
});
