/**
* Created with IntelliJ IDEA.
* User: wcc
* Date: 13-7-24
* Time: 上午11:14
* 配置文件
*/

var GLOBAL_CONFIG = {
    /**
     * 可以缓存到localStorage，如果localStorage中没有，则读取GLOBAL_CONFIG.IP
     */
    IP: "http://218.108.50.4:7070",

    product: 'i6P',

    /**
     * 可以缓存到localStorage，如果localStorage中没有，则读取GLOBAL_CONFIG.HostName
     */
    HostName: "zjx",

    ConferenceName: 'chinagroup.zjx',

    Conference: 'chinagroup',

    FileServer: 'http://218.108.50.4:8096/NCFileServer/files/',

    NetCallApi: 'http://218.108.50.4:9090',

    AuthorizeServer: 'http://appserver.netcall.cc/EnterpriseInfoService/',

    GetColleaguesServer: 'http://218.108.50.4:8081/rest/uiauthentication',

    LogServer: 'http://appserver.netcall.cc/EnterpriseInfoService/log/uploadlog',

    productAdr: 'http://218.108.50.4:8081',

    originHostName: 'zjx',

    contactPhone: '0571-88270588',

    NetWorkError: '网络不稳定或无法连接',

    Host: '218.108.50.4',

    enterprise: '710332',

    netcallAdr: 'http://218.108.50.4:9090',

    requestType: 'af', //请求类型

    //weChatServeAdr: "/Redirect/jsonResult", //微信服务地址
    //weChatServeAdr: 'http://218.108.53.100:81/WeChatCompanyServe/Redirect/jsonResult', //微信服务地址
    weChatServeAdr: 'http://101.37.31.231:81/Redirect/jsonResult', //微信服务地址

    userName: ''
};

/*
* {后缀名，MIME类型} 
*/
var MIME_MapTable = { "3gp": "video/3gpp",
    "apk": "application/vnd.android.package-archive",
    "asf": "video/x-ms-asf",
    "avi": "video/x-msvideo",
    "bin": "application/octet-stream",
    "bmp": "image/bmp",
    "c": "text/plain",
    "class": "application/octet-stream",
    "conf": "text/plain",
    "cpp": "text/plain",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "exe": "application/octet-stream",
    "gif": "image/gif",
    "gtar": "application/x-gtar",
    "gz": "application/x-gzip",
    "h": "text/plain",
    "htm": "text/html",
    "html": "text/html",
    "jar": "application/java-archive",
    "java": "text/plain",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "application/x-javascript",
    "log": "text/plain",
    "m3u": "audio/x-mpegurl",
    "m4a": "audio/mp4a-latm",
    "m4b": "audio/mp4a-latm",
    "m4p": "audio/mp4a-latm",
    "m4u": "video/vnd.mpegurl",
    "m4v": "video/x-m4v",
    "mov": "video/quicktime",
    "mp2": "audio/x-mpeg",
    "mp3": "audio/x-mpeg",
    "mp4": "video/mp4",
    "mpc": "application/vnd.mpohun.certificate",
    "mpe": "video/mpeg",
    "mpeg": "video/mpeg",
    "mpg": "video/mpeg",
    "mpg4": "video/mp4",
    "mpga": "audio/mpeg",
    "msg": "application/vnd.ms-outlook",
    "ogg": "audio/ogg",
    "pdf": "application/pdf",
    "png": "image/png",
    "pps": "application/vnd.ms-powerpoint",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "prop": "text/plain",
    "rc": "text/plain",
    "rmvb": "audio/x-pn-realaudio",
    "rtf": "application/rtf",
    "sh": "text/plain",
    "tar": "application/x-tar",
    "tgz": "application/x-compressed",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "audio/x-ms-wmv",
    "wps": "application/vnd.ms-works",
    "xml": "text/plain",
    "z": "application/x-compress",
    "zip": "application/x-zip-compressed",
    "*": "*/*"
};
