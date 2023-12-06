

const timeago = (timestamp) => {
    let mistiming = Math.round((new Date())-timestamp)/1000;
  
    if(mistiming <= 1){
      return '1秒前';
    }
    let arrr = ['年','个月','星期','天','小时','分钟','秒'];
    let arrn = [31536000,2592000,604800,86400,3600,60,1];
    let inms=[];
    for(let i=6;i>=0;i--){
        let inm = Math.floor(mistiming/arrn[i]);
        if(inm != 0){
            inms.push(inm+arrr[i]+'前');
        }
    }

    return inms[inms.length-1]
}

const getLocalTime = (nS, symbol, index) => {
    if(nS){
        symbol = symbol || '-';
        index = index || 5;
        var date = new Date(Number(nS)),
            Y, M, D, h, m, s;
        Y = date.getFullYear() + symbol;
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + (index >= 2 && index <= 3 ? '' : symbol);
        D = date.getDate() < 10 ? '0'+ date.getDate() : date.getDate()+'';
        h = appendzero(date.getHours()) + ':';
        m = appendzero(date.getMinutes()) + ':';
        s = appendzero(date.getSeconds());
        switch (index) {
            case 1:
                return (Y + M + D);
            case 2:
                return (Y + M);
            case 3:
                return (M + D);
            case 4:
                return (h + m + s);
            case 5:
                return (Y + M + D + h + m + s);
        }
    }else{
        return '';
    }
}

const setValue = (label,value) => {
	window.localStorage.setItem(label,value);
}

const getValue = (label) => {
	return window.localStorage.getItem(label);
}

const appendzero = (s) => {
	if (s < 10) return "0" + s;
	else return s;
}

const obj2str = (O) => {
    let s ='';
    for(let k in O){
        s = s + (!s ? '?' : '&') + k + '=' +O[k];
    }
    return s;
}

const createMsg = (msg='ok', flag = false) => {
    let time = Date.now(),className = flag ? 'msg_wrap_ok' : 'msg_wrap_warn';

    let str = '<span id='+time+' class="msg_wrap '+className+'">'+msg+'</span>';
    let range = document.createRange();
    range.selectNodeContents(document.documentElement); 
    let fragment = range.createContextualFragment(str);
    document.body.appendChild(fragment);

    let timer = setTimeout(function(){
        document.body.removeChild(document.getElementById(time));
        clearTimeout(timer);
    },3000);
}

const initMediaDevices = (config,callback) => {// 打开摄像头 麦克风
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }

    navigator.mediaDevices.getUserMedia(config).then(stream => {
        callback(stream);
    }).catch(console.error);
}

const qrcode = (url, id, w = 180) => {
    let qrcode = document.getElementById(id);
    qrcode.innerHTML = '';
    let QRCode = window.QRCode;
    let adaiQrcode = new QRCode(id,{
        text: url,
        width: w,
        height: w,
        colorDark : '#000000',
        colorLight : '#ffffff',
        correctLevel : QRCode.CorrectLevel.H
    });
}

const cacheImage = (data, callback) =>{
    let bg = new Image();
    bg.setAttribute("crossOrigin",'Anonymous');

    bg.src = data;
    bg.onload = () => {
        callback(data)
    }
}

Array.prototype.shuffle = function() {
    let m = this.length, i;
    while (m) {
        i = (Math.random() * m--) >>> 0;
        [this[m], this[i]] = [this[i], this[m]]
    }
    return this;
}

function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for(var i=0;i<vars.length;i++) {
         var pair = vars[i].split("=");
         if(pair[0] == variable){return pair[1];}
    }
    return '';
}

function getTodayZero(timestamp = ''){
    if(timestamp){
        return new Date(new Date(timestamp).toLocaleDateString()).getTime();
    }else{
        return new Date(new Date().toLocaleDateString()).getTime();
    }
}

function getSurplusDays(timestamp){
    return (getTodayZero() - getTodayZero(timestamp))/24/60/60/1000;
}

/**
 * html2canvas -> Canvas2Image
 * html DOM 转换成图片
 */
 function convert2canvas(id,callback) {
    var shareContent = document.querySelector(id);//需要截图的包裹的（原生的）DOM 对象
    var width = shareContent.offsetWidth; //获取dom 宽度
    var height = shareContent.offsetHeight; //获取dom 高度
    var canvas = document.createElement("canvas"); //创建一个canvas节点
    var scale = 2; //定义任意放大倍数 支持小数
    canvas.width = width * scale; //定义canvas 宽度 * 缩放
    canvas.height = height * scale; //定义canvas高度 *缩放
    canvas.getContext("2d").scale(scale, scale); //获取context,设置scale 
    var opts = {
        scale: scale, // 添加的scale 参数
        canvas: canvas, //自定义 canvas
        // logging: true, //日志开关，便于查看html2canvas的内部执行流程
        width: width, //dom 原始宽度
        height: height,
        useCORS: true // 【重要】开启跨域配置
    };
    
    html2canvas(shareContent, opts).then(function (canvas) {
        var context = canvas.getContext('2d');
        // 【重要】关闭抗锯齿
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;

        //获取base64
        let base64='';
        base64 = canvas.toDataURL('image/png')
        // 【重要】默认转化的格式为png,也可设置为其他格式 .replace("image/png", "image/octet-stream")
        // var img = Canvas2Image.convertToJPEG(canvas, canvas.width, canvas.height);
        callback(base64, canvas.width, canvas.height);
    });
}

// 获取当前月零点时间戳
function getCurrentMonthZero(t = 11){
    let time = new Date().setMonth(t >= 0 ? new Date().getMonth() - t : new Date().getMonth() + Math.abs(t)); // || new Date(Date.now() - 1000*60*60*24*30*t)
        time = new Date(time);
        time.setDate(1);
        time.setHours(0);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);

    return time;
}

// 获取当前月份天数
function getDays(t = Date.now()){
    const date = new Date(t);
    const year = date.getFullYear();
    const month = date.getMonth()+1;

    const days = new Date(year, month, 0).getDate();

    return days*24*60*60*1000;
}

// 获取指定月份开始时间、结束时间
function getMonthTimestamp(year, month){
    // 计算月初时间戳
    const firstDay = new Date(year, month - 1, 1);
    const firstDayTimestamp = firstDay.getTime();

    // 计算月末时间戳
    const lastDay = new Date(year, month, 0);
    const lastDayTimestamp = lastDay.getTime() + 24*60*60*1000 - 1;

    return {
        'firstDayTimestamp': firstDayTimestamp,
        'lastDayTimestamp': lastDayTimestamp,
    };
}

// 获取当天凌晨时间戳
function getNowTimestamp(d = 0){// d = 0 当天、d = 1 明天、d = -1 昨天
    // 获取当前日期
    const now = new Date();

    // 将日期增加一天
    now.setDate(now.getDate() + d);

    // 将日期的时间部分设为 0
    // now.setHours(0, 0, 0, 0);
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    const midnightTimestamp = now.getTime();

    return midnightTimestamp;
}

// 获取一年前的今天时间戳
function getLastYearTodayTimestamp(){
    // 获取当前日期
    const now = new Date();

    // 获取一年前的日期
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // 获取一年前的今天时间戳
    const lastYearTodayTimestamp = lastYear.getTime();

    return lastYearTodayTimestamp;
}

// 下载链接
let APIURL='https://genealogydatatest.qingtime.cn/';
if(window.location.origin.indexOf('suppliersys.1jiapu.com') > -1){
    APIURL = 'https://genealogydata.1jiapu.com/';
}
function downliadLink(fileName){
    var a = document.createElement('a');
    a.download = fileName;
    a.href = APIURL+fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/** 
 * 数字千分位逗号分割 
 * @param {Number} [num=0] - 数字
 * @returns {String} 千分位逗号分割的字符串，如 12,345
 */
function thousands(num){
    return (num || 0).toLocaleString();
}

// 下载
const initDownloadExcel = (aoa, title) => {
    /** 
    * 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
    * @param sheet
    * @param sheetName
    */
    function sheet2blob(sheet, sheetName) {
        sheetName = sheetName || 'sheet1';
        var workbook = {
            SheetNames: [sheetName],
            Sheets: {}
        };
        workbook.Sheets[sheetName] = sheet;
        // 生成excel的配置项
        var wopts = {
            bookType: 'xlsx', // 要生成的文件类型
            bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
            type: 'binary'
        };
        var wbout = XLSX.write(workbook, wopts);
        var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
        // 字符串转ArrayBuffer
        function s2ab(s) {
            var buf = new ArrayBuffer(s.length), view = new Uint8Array(buf);
            for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
        return blob;
    }

    /**
     * 通用的打开下载对话框方法，没有测试过具体兼容性
     * @param url 下载地址，也可以是一个blob对象，必选
     * @param saveName 保存文件名，可选
     */
    function openDownloadDialog(url, saveName){
        if(typeof url == 'object' && url instanceof Blob){
            url = URL.createObjectURL(url); // 创建blob地址
        }
        var aLink = document.createElement('a'), event;
        aLink.href = url;
        aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
        if(window.MouseEvent) event = new MouseEvent('click');
        else{
            event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        aLink.dispatchEvent(event);
    }

    /**
     * 导出excel
     * @param aoa 二维数组，表格头部数据
    */
    (function aoa_to_sheet(aoa){
        let XLSX = window.XLSX;
        var sheet = XLSX.utils.aoa_to_sheet(aoa);
        openDownloadDialog(sheet2blob(sheet), title+'.xlsx');
    })(aoa)
}

// 命名导出 可以导出多个
export {
    timeago,
    getLocalTime,
    setValue,
    getValue,
    obj2str,
    createMsg,
    initMediaDevices,
    qrcode,
    cacheImage,
    getQueryVariable,
    getSurplusDays,
    convert2canvas,
    getCurrentMonthZero, 
    getDays, 
    getMonthTimestamp, 
    downliadLink, 
    getNowTimestamp, 
    getLastYearTodayTimestamp,
    thousands,
    getTodayZero,
    initDownloadExcel,
}