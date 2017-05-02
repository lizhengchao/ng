/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-25
 * Time: 上午10:30
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.view.work.appflow.FormPanelView',{
    extend:'Ext.Panel',
    xtype: 'formPanelView',
    config:{
        layout:{type:'vbox'},
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        cls: 'form-bg font15',
        items: []
    }
});
