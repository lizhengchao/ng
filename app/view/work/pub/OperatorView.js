/**
 * Created by ibm on 2015/5/6.
 */
Ext.define('MyApp.view.work.pub.OperatorView', {
    extend: 'Ext.Panel',
    xtype: 'operatorView',
    config: {
        callback: Ext.emptyFn,
        multi: false,
        title: '选择操作员',
        isEmp: false,
        layout: {type: 'vbox'},
        items: [
            {
                docked: 'top',
                xtype: 'titlebar',
                title: '选择操作员',
                items: [
                    {
                        ui: 'back',
                        align: 'left',
                        name: 'backBtn',
                        text: '',
                        width: 46,
                        style: 'padding-left:11px; width:46px;'
                    },
                    {
                        xtype: 'button',
                        name: 'okBtn',
                        hidden: true,
                        text: '确定',
                        ui: 'action-white',
                        align: 'right',
                        cls: 'button-no-radio tbr-btn'
                    }
                ]
            },
            {
                xtype: 'searchfield',
                placeHolder: '按编号或名称搜索',
                padding: "13.5 10"
            },
            {
                flex: 1,
                xtype: 'list',
                plugins: {
                    xclass: 'Ext.plugin.ListPaging',
                    loadMoreText: '',
                    noMoreRecordsText: '',
                    autoPaging: true
                },
                scrollable: {
                    direction: 'vertical',
                    directionLock: true
                },
                itemCls: "nglist",
                itemHeight: 42,
                disableSelection: true,
                useSimpleItems: true,
                onItemDisclosure: false,
                variableHeights: false,
                striped: false,
                store: 'OperatorPubStore',
                itemTpl: '<div class="nowrap font15" style="width: 100%; min-height: 16px;display: -webkit-box;-webkit-box-align: center; ">{username}{name}&nbsp;<font color="#AAA9A9" style="font-size: 0.8125rem;">({usercode}{code})</font></div>'
            }
        ]
    }
});