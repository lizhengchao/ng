(function (window) {
    //逆地理编码服务,返回码状态表
   /* 1	服务器内部错误 2	请求参数非法  3	权限校验失败4	配额校验失败 5	ak不存在或者非法
    101	服务禁用 102	不通过白名单或者安全码不对   2xx	无权限3xx	配额错误*/
    var NGMap = {
        isLoaded: false, //百度地图接口是否加载完成，默认false
        isLoading: false, //百度地图接口是否正在加载
        lat: 0,
        lng:0,

        openMap: function(config) {
            NGMap.lat = config.lat;
            NGMap.lng = config.lng;
            var callback = config.callback;
            if(window.BaiduMap && device.platform != 'iOS') {
                window.BaiduMap.openMap({
                    latitude: NGMap.lat,
                    longitude: NGMap.lng
                }, function(response) {
                	callback && callback(response);
                });
            }
            else {
                NG.initControllers(null, function () {
                    var mapview = Ext.create('MyApp.view.work.oa.clockin.NGSearchMapView', {
                        callback: config.callback
                    });
                    mapview.add(Ext.create('Ext.Label', {
                        html: '<div id="map" style="width:100%;height:320px;"></div><div id="r-result" style="width:100%;"></div>'
                    }));
                    Ext.Viewport.add(mapview);
                    Ext.Viewport.setActiveItem(mapview);
                    if (!NGMap.isLoading) {
                        NGMap.loadScript();
                    } else {
                        NGMap.BMapCallBack();
                    }
                }, ['work.oa.clockin.NGSearchMapController']);


            }
        },

        /**
         * 获取位置信息
         * @param fn 回调函数
         */
        getLocation: function (fn, config) {
            if (!window.locationService && !navigator.geolocation) {
                fn && fn(null);
                NG.sysLog("NGMap:当前浏览器不支持地理定位.");
                return;
            }
            //逆地理编码服务不需要加载js
            NGMap.getCurrentPosition(fn, config);
        },

        /*
         * 功能描述：异步加载百度地图js
         */
        loadScript: function () {
            var documentHead = document.head || document.getElementsByTagName('head')[0],
                script = document.createElement("script"),
                clearFn = function(){
                    NGMap.isLoading = false;
                    if(script){
                        script.onload = null;
                        script.onreadystatechange = null;
                        script.onerror = null;
                    }
                },
                onLoadFn = function () {
                    NGMap.isLoaded = true;
                    clearFn();
                },
                onErrorFn = function () {
                    clearFn();
                    documentHead.removeChild(script);
                };
            NGMap.isLoading = true;
            script.src = "http://api.map.baidu.com/api?v=2.0&ak=VlrhovzjHDcKatPXD948qWLb&callback=NGMap.BMapCallBack";
            script.onload = onLoadFn;
            script.onerror = onErrorFn;
            script.onreadystatechange = function () {
                if (this.readyState === 'loaded' || this.readyState === 'complete') {
                    onLoadFn();
                }
            };
            documentHead.appendChild(script);
        },

        /*
         * 功能描述：异步加载百度地图js回调函数
         */
        BMapCallBack: function () {
            var map = new BMap.Map('map', {
                enableMapClick: false
            });
            NGMap.map = map;
            map.centerAndZoom(new BMap.Point(NGMap.lng, NGMap.lat), 11);
            var local = new BMap.LocalSearch(map, {
                renderOptions: {map: map, panel: "r-result"}
            });
            NGMap.local = local;
            local.setInfoHtmlSetCallback(function(data){
                NG.application.getController('work.oa.clockin.NGSearchMapController').setPlaceInfo(data);
            });
            local.enableFirstResultSelection();
        },

        SearchMap: function(place) {
            if(NGMap.isLoaded) {
                NGMap.local.search(place);
            }
            else if(NGMap.isLoading) {
                NG.alert('正在加载地图，请稍等');
            }
            else {
                NG.alert('加载地图失败');
            }
        },

        /*
         * 功能描述：获取当前地理位置
         */
        getCurrentPosition: function (callback, config) {
            var Geo = navigator.geolocation,
                isBaidu = !!window.locationService;
            if(isBaidu){
                Geo = window.locationService;
            }
            Geo.getCurrentPosition(
                // 获取地理位置成功
                function (position) {
                    if (!position || position.code == 60) {
                        callback && callback(null, position);
                        if (position && position.message) {
                            NG.sysLog("NGMap:" + position.message);
                        }
                        return;
                    }
                    console.log(position);
                    var geoCoderUrl = 'http://api.map.baidu.com/geocoder/v2/?ak={0}&output=json&location={1},{2}&coordtype={3}&pois={4}',
                        coords = position.coords,
                        pois = config ? (config.pois || '0') : '0',
                        ak = "VlrhovzjHDcKatPXD948qWLb",
                        coordtype = isBaidu ? "bd09ll" : "wgs84ll"; // bd09ll（百度经纬度坐标）、gcj02ll（国测局经纬度坐标）、wgs84ll（ GPS经纬度）

                    //逆地理编码服务,代替getLocation api
                    Ext.data.JsonP.request({
                        url: Ext.String.format(geoCoderUrl, ak, coords.latitude, coords.longitude, coordtype, pois),
                        success: function (result) {
                            if (result.status == 0) {
                                console.log(result.result);
                                callback && callback(result.result.formatted_address, result.result.location, result.result.pois);
                            } else {
                                callback && callback(null);
                                NG.sysLog('逆地理编码服务错误,错误码：' + result.status);
                            }
                        },
                        failure: function (err) {
                            callback && callback(null);
                        }
                    });
                },
                // 获取地理位置失败
                function (error) { // navigator.geolocation有效
                    var logInfo = "";
                    callback && callback(null);
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            logInfo = "用户不允许地理定位."
                            break;
                        case error.POSITION_UNAVAILABLE:
                            logInfo = "无法获取当前位置."
                            break;
                        case error.TIMEOUT:
                            logInfo = "获取当前位置超时."
                            break;
                        case error.UNKNOWN_ERROR:
                            logInfo = "位置错误."
                            break;
                    }
                    NG.sysLog("NGMap:" + logInfo + '[' + error.code + ']');
                },
                {
                    // 指示浏览器获取高精度的位置，默认为false
                    enableHighAccuracy: true,
                    // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
                    timeout: 30000,
                    // 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
                    maximumAge: 60000
                }
            );
        }
    };

    window.NGMap = NGMap;

})(window);