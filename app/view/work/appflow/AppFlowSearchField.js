/**
 * Created with JetBrains WebStorm.
 * User: xnb
 * Date: 14-4-14
 * Time: 上午10:55
 * To change this template use File | Settings | File Templates.
 */
Ext.define('MyApp.view.work.appflow.AppFlowSearchField', {
    extend: 'Ext.field.Search',
    xtype: 'appFlowSearchField',
    config: {
        loadInterval: 2000,
        searchStoreField: null,
        searchStore: null,
        placeHolder: 'Search',
        docked: "top",
        padding: "5",
        clearIcon: true
    },
    onkeyup: function () {
        var value = this.getValue(), store;
        if (Ext.isObject(this.getSearchStore())) {
            store = this.getSearchStore();
        }
        else if (Ext.isString(this.getSearchStore())) {
            store = Ext.getStore(this.getSearchStore());
        }
        if (store) {
            store.clearFilter(!!value);
            if (store.getRemoteFilter()) {
                this.removeListener('keyup', this.onkeyup);
                var me = this;
                me.timeIT = setTimeout(function () {
                    if (store.getProxy().getUrl()) {
                        store.getProxy().setExtraParams({'filter': me.getValue()});
                        store.removeAll();
                        store.loadPage(1);
                    }
                    me.addListener('keyup', me.onkeyup);
                }, 500);
            }
            else {
                var searches = value.split(','),
                    regexps = [],
                    i, regex;
                for (i = 0; i < searches.length; i++) {
                    if (!searches[i]) continue;
                    regex = searches[i].trim();
                    regex = regex.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                    regexps.push(new RegExp(regex.trim(), 'i'));
                }
                var allsearchfield = this.getSearchStoreField();
                store.filter(function (record) {
                    var matched = [];
                    for (i = 0; i < regexps.length; i++) {
                        var search = regexps[i];
                        var didMatch = false;
                        Ext.each(allsearchfield, function (afield) {
                            if (search.test(record.get(afield))) {
                                didMatch = true;
                                return false;
                            }
                        });
                        matched.push(didMatch);
                    }
                    return (regexps.length && matched.indexOf(true) !== -1);
                });
            }
        }
    },
    onclearicontap: function () {
        var store;
        if (Ext.isObject(this.getSearchStore())) {
            store = this.getSearchStore();
        }
        else if (Ext.isString(this.getSearchStore())) {
            store = Ext.getStore(this.getSearchStore());
        }
        store.removeAll();
        if (store.getRemoteFilter()) {
            store.getProxy().setExtraParams({});
            store.loadPage(1);
        }
        else {
            store.clearFilter();
            store.load();
        }
    },
    initialize: function () {
        this.callParent();
        this.addListener('keyup', this.onkeyup);
        this.addListener('clearicontap', this.onclearicontap);
    }
});