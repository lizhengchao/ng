//微信企业号页面特有js，初始化时调用
//初始化配置信息
(function () {
    var userName = getQueryString("userId");
    if (userName) {
        WeChat_GLOBAL_CONFIG.userName = userName;
    }
    var enterprise = getQueryString("NGCorpId");
    if(enterprise) {
        WeChat_GLOBAL_CONFIG.enterprise = enterprise;
        WeChat_GLOBAL_CONFIG.NGCorpID = enterprise;
    }
    var host = getQueryString("host");
    if(host){
        WeChat_GLOBAL_CONFIG.productAdr = "http://" + host + ":8081";
        WeChat_GLOBAL_CONFIG.netcallAdr = "http://" + host + ":7070";
        GLOBAL_CONFIG.productAdr = "http://" + host + ":8081";
        GLOBAL_CONFIG.FileServer = "http://" + host + ":8096/NCFileServer/files/";
        GLOBAL_CONFIG.GetColleaguesServer = "http://" + host + ":8081/rest/uiauthentication";
        GLOBAL_CONFIG.IP = "http://" + host + ":7070";
        GLOBAL_CONFIG.NetCallApi = "http://" + host + ":9090";
        GLOBAL_CONFIG.Host = host;
    }
    var requestType = getQueryString('requestType');
    if(requestType){
        WeChat_GLOBAL_CONFIG.requestType = requestType;
    }

    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
})();



