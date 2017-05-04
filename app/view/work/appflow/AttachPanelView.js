/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-3-25
 * Time: 上午10:31
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.view.work.appflow.AttachPanelView', {
    extend: 'Ext.Panel',
    xtype: 'attachPanelView',
    config: {
        cls: 'form-bg',
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        items: [
            {
                xtype: 'taptpl',
                name: 'attachPanelViewList',
                style: 'top: -1px; position:relative; background-color:#ffffff;',
                itemStyle: 'position:relative; color: #000;',
                itemTpl: ['<div style="padding: 11px 13px;<tpl if=\"isbizcontent==1\">display:none;</tpl>"><div style="position: relative;"><div style="background-image:url({icon});background-repeat: no-repeat;background-position: center;background-size: 40px 40px;width: 40px;height: 40px;"></div>',
                    '<div style="display: block;position: absolute;top: 0px;left: 42px;right: 0px;height: 40px;line-height: 20px;"><div class="nowrap font15">{attachname}</div>',
                    '<span class="nowrap font13" style="color: #AAA9A9;">{attachtime}&nbsp;&nbsp;{attachsize}</span></div></div></div>'].join(""),
                data: []
            }
        ]
    }
});