var md5 = require("./md5")

var _mn = {}
// var order_testStr = "agent="+JSON.stringify(pay_json.agent)+"&"+"channel_platform="+JSON.stringify(pay_json.channel_platform)+"&"+"device="+JSON.stringify(pay_json.device)+"&"+"game="+JSON.stringify(pay_json.game)+"&"+"other="+JSON.stringify(pay_json.other)+"&"+"role="+JSON.stringify(pay_json.role)+"&"+"verify="+JSON.stringify(pay_json.verify)
 


var domain = "https://authorize.aidalan.com/v1/";
var paymain = "https://payments.aidalan.com/v1/";

var dalan_api = {
    login_api : "miniGame/otherOpenAuthorize",
    pay_api : "miniGame/order",
    getBalance_api : "miniGame/getMiniBalance",
}

var systemInfo =wx.getSystemInfoSync();
var android = systemInfo.system.toLowerCase().indexOf('ios') < 0;



_mn.getPubData = function () {
  var time = new Date();
  // 获取时区
  var timeZone = function(v) {
    var newV = Math.abs(v) < 10 ? `0${Math.abs(v)}:00` : `${Math.abs(v)}:00`;
    return v < 0 ? `+ ${newV}` : `- ${newV}`;
  };
  // 获取游戏参数
  var game_config = wx.getStorageSync("game_config")
  var game_id = game_config.game_id
  var game_name = game_config.game_name
  var game_key = game_config.game_key
  var game_ver = game_config.game_ver
  var getDevInfo = function () {   
    var deviceInfo = {};
    var net_type = "";
    var screen_brightness = "";
    var osInfo 
    // 获取设备信息
    // 系统信息
    deviceInfo = wx.getSystemInfoSync()
    // 系统型号
    osInfo = deviceInfo.system.split(' ')

    // 网络信息
    wx.getNetworkType({
      success:function (res) {
        // net_type = res.networkType
        wx.setStorageSync('networkType',res.networkType)
      }
    })
    net_type = wx.getStorageSync('networkType')

    // 屏幕亮度
    wx.getScreenBrightness({
      success:function (res) {
        wx.setStorageSync('screen_brightness',res.value)
        // screen_brightness = (res.value+0)*100
      }
    })
    screen_brightness = (wx.getStorageSync('screen_brightness')+0)*100

    var device = {
        "screen_width": ""+deviceInfo.screenWidth,
        "screen_height": ""+deviceInfo.screenHeight,
        "device_name":  deviceInfo.brand+" "+deviceInfo.model,
        "os_ver": ""+osInfo[1],
        "sdk_ver": "1.0.0",
        "package_name": "com.junhai.union_new",
        "os_type": ""+osInfo[0],
        "net_type": ""+net_type,
        "brand": ""+deviceInfo.brand,
        "model": ""+deviceInfo.model,
        "battery_level": ""+deviceInfo.batteryLevel,
        "screen_brightness": ""+screen_brightness,
    }

    return device
  }


  // 公共参数
  var public_data = {
    "channel_platform": {
      "ad_id": "minigames"
    },
    "device": getDevInfo(),
    "game": {
      "game_name": game_name,
      "game_id": game_id,
      "game_ver": game_ver
    },
    "other": {
      "client_ts": '' + Math.round(time.getTime() / 1000),
      "client_time_zone": "GMT" + timeZone(time.getTimezoneOffset() / 60)
    },
    "verify": {
      "open_id":"",
      "open_key":"open_key",
      "flag":5
    }
  }

  return public_data
}


// 生成sign拼接字符串
_mn.createSign = function (data) {
  var sort_arr = [] 
  for (var item in data) {
    sort_arr.push(item)
  }
  sort_arr.sort()
  var signStr = ""
  for (var index = 0; index < sort_arr.length; index++) {
    signStr += sort_arr[index]+"="+JSON.stringify(data[sort_arr[index]])+"&"
  }
  signStr = signStr.substring(0, signStr.length - 1)

  return signStr
}




// 初始化
_mn.mnInit = function(game_config){
  wx.setStorageSync("game_config",game_config)
  
}




// 一次登录
_mn.mnLogin = function (callback) {
  console.log("=====login=====")
  var post_url = domain + dalan_api.login_api

  wx.login({
    success: function(res) {
      var public_data = _mn.getPubData()
      public_data.verify.open_id = res.code

      var game_config = wx.getStorageSync("game_config")
      var key = game_config.game_key

      var signStr = _mn.createSign(public_data) + key
      var sign = md5.md5(signStr)
      public_data['sign'] = sign
      wx.request({
        url: post_url, //仅为示例，并非真实的接口地址
        data:public_data,
        method:'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          var ret = res.data.ret  
          if (ret == 1) {
            console.log("登录成功")
            var first_login_info = {
              ret :1,
              data:res.data.content ,
              msg:"登录成功"
            }
            wx.setStorageSync("open_id",res.data.content.open_id)
            callback(first_login_info)
          } else {
            console.log("登录失败",res.data)
            var errInfo = {
              ret : 0,
              data : res.data,
              post_url : post_url,
              msg : "登录失败"
            }
            callback(errInfo)
          } 
        }
      })
      
    }
  })
}

// 二次登录回调
_mn.onLoginRsp = function (obj) {
  var login_rsp = {}
  login_rsp.access_token = obj.access_token
  login_rsp.union_user_id = obj.union_user_id
  wx.setStorageSync("login_rsp",login_rsp)
}


// 查询余额
_mn.getBalance = function (obj,callback,change_type) {
  var game_config = wx.getStorageSync("game_config")
  var key = game_config.game_key
  var balance_json = _mn.getPubData()
  var login_rsp = wx.getStorageSync("login_rsp")
  var user_id = login_rsp.union_user_id
  balance_json.verify = {
      "open_id" :wx.getStorageSync("open_id"),
      "user_id" : user_id,
      "type" : 1
  }
  var post_url = domain + dalan_api.getBalance_api
  var balance_testStr = _mn.createSign(balance_json) + key
  // console.log(balance_testStr)
  var sign = md5.md5(balance_testStr)
  balance_json['sign'] = sign
  wx.request({
    url:post_url , 
    data:balance_json,
    method:'POST',
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function(res) {
      console.log(res)
      
      if (res.data.content.balance === 0) {
        console.log("余额为0，可以下单",res.data)
        _mn.sendOrder(obj,callback,change_type)
      } else {
        console.log("余额不为0，不能下单",res.data)
        var errInfo = {
          ret : 0,
          data : res.data,
          post_url :post_url,
          msg : "余额不为0，不能下单"
        }
        callback(errInfo)
      }
    }
  })
}

// 发送下单请求
_mn.sendOrder  = function (obj,callback,change_type) {
  var login_rsp = wx.getStorageSync("login_rsp")
  
  var game_config = wx.getStorageSync("game_config")
  var key = game_config.game_key

  var post_url = domain + dalan_api.pay_api
  var pay_json = _mn.getPubData()

    var pay_type = '';
    if(android){
        pay_type = '37';
    }else {
        pay_type = '54';
    }
  // 游戏角色参数
  var pay_role = {
    "role_level":obj.role_level,
		"role_online_time":obj.role_online_time,
		"role_name":obj.role_name,
		"role_server":obj.role_server,
		"role_id":obj.role_id,
		"role_type":obj.role_type,
		"role_gender":obj.role_gender,
		"association_id":obj.association_id,
		"association_name":obj.association_name,
		"association_rank":obj.association_rank
  }

  // 订单参数
  var pay_verify = {
    "access_token":	login_rsp.access_token,		
		"total_charge":obj.total_charge,
		"currency_code":"RMB",
		"async_callback_url":obj.async_callback_url,
		"server_id":obj.server_id,
		"out_trade_no":obj.out_trade_no,
		"product_amount":obj.product_amount,
		"product_desc":obj.product_desc,
		"product_id":obj.product_id,
		"product_name":obj.product_name,
		"rate":obj.rate,
		"role_id":obj.role_id,
		"role_name":obj.role_name,
		"pay_type":pay_type,
		"agent_type":1,
		"platform_id":5
  }
  pay_json.role = pay_role;
  pay_json.verify = pay_verify;
  var order_testStr = _mn.createSign(pay_json) + key
  var sign = md5.md5(order_testStr)
  pay_json['sign'] = sign

  wx.request({
    url:post_url ,
    data:pay_json,
    method:'POST',
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function(res) {
      if (res.data.msg == "success") {
        console.log("下单请求成功:",res.data) 
        var payment  = parseInt(pay_verify.total_charge)*parseInt(pay_verify.rate)/100
        console.log("下单金额（分）:",payment)
        // _mn.payCallback(res.data,callback)
        if(change_type){
            _mn.changeMiniPay(res.data.content.order_sn)
        }else {
            _mn.androidMiniPay(payment,res.data,callback)
        }
      } else {
        console.log("下单请求失败:",res.data)
        var errInfo = {
          ret : 0,
          data : res.data,
          post_url : post_url,
          msg : "下单请求失败"
        }
        callback(errInfo)
      } 
    }
  })

}

// 下单
_mn.mnBuy = function (obj,logoutCallback,callback) { 
  wx.checkSession({
    success:function (res) {
      if (res.errMsg == "checkSession:ok") {
        console.log("登录有效",res)
        _mn.isChangePay(obj,callback);
      } else {
        console.log("登录过期。请重新登录",res)
        var errInfo = {
          ret : 0,
          data : res.data,
          msg : "登录过期。请重新登录"
        }
        callback(errInfo)
        logoutCallback();
      }
    },
    fail: function() {
      console.log("登录过期。请重新登录",res)
      var errInfo = {
        ret : 0,
        data : res.data,
        msg : "登录过期。请重新登录"
      }
      callback(errInfo)
      logoutCallback();
    }
  })
  
      
}

//判断是否切支付
_mn.isChangePay = function(obj,callback){
    var public_data = _mn.getPubData();
    var device = public_data.device;
    var game = public_data.game;
    var channel_platform = public_data.channel_platform;
    var login_rsp = wx.getStorageSync("login_rsp");
    var game_config = wx.getStorageSync("game_config");
    var game_id = game_config.game_id;
    var change_data = {
        "extra_data": {
            "screen_brightness": device.screen_brightness,
            "bluetooth": "",
            "system_version": device.os_ver,
            "application_name": game.game_name,
            "mac": "",
            "orientation_sensor": "",
            "from": device.os_type,
            "inner_ip": "",
            "package_name": device.package_name,
            "battery_level": device.battery_level,
            "device_id": "",
            "application_version": game.game_ver,
            "imei": "",
            "is_root": "",
            "brand": device.brand,
            "screen_size": device.screen_width|device.screen_height,
            "sdk_version": device.sdk_ver,
            "device_name": device.device_name,
            "wifi_name": "",
            "cpu_type": "",
            "imsi": "",
            "model": device.model
        },
        "order": {
            "access_token": login_rsp.access_token,
            "async_callback_url": obj.async_callback_url,
            "currency_code": obj.currency_code,
            "extend": {
                "game_channel_id": channel_platform.ad_id
            },
            "out_trade_no": obj.out_trade_no,
            "product_amount": obj.product_amount,
            "product_desc": obj.product_desc,
            "product_id": obj.product_id,
            "product_name": obj.product_name,
            "rate": "10",
            "role_id": obj.role_id,
            "role_level": obj.role_level,
            "role_name": obj.role_name,
            "server_id": obj.server_id,
            "total_charge": obj.total_charge,
            "user_id": obj.role_id,
            "user_online_time": obj.role_online_time
        },
        "time": Math.round(new Date().getTime() / 1000),
        "union_app_id": game_id,
        "union_channel": channel_platform.ad_id
    }
    wx.request({
        url: paymain + 'miniGame/ystaticSwitch',
        data: change_data,
        method:'POST',
        header: {
        'content-type': 'application/json' // 默认值
        },
        success: function(res) {
            if (res.data.ret == 1) {
                var url = res.data.content.url;
                if(url != ""){
                    console.log("切支付");
                    _mn.sendOrder(obj,callback,true)
                }else {
                    console.log("不切支付");
                    _mn.judgePay(obj,callback,false)
                }
            } else {
                console.log(res)
                _mn.judgePay(obj,callback,false)
            }
        },
        fail: function(res){
            console.log(res)
            _mn.judgePay(obj,callback,false)
        }
    })
}

//不切支付友好提示
_mn.judgePay = function(obj,callback,change_type){
    if(android){
        _mn.getBalance(obj,callback,change_type)
    }else {
        wx.showToast({
            title : "暂未开通",
            icon : "none"
        })
    }
}

// 调起切支付付款
_mn.changeMiniPay = function(order_sn){
    console.log('切支付进入客服')
    wx.showModal({
        title: '订单支付',
        content: '我告诉你如何支付',
        showCancel:false,
        confirmText:'进入客服',
        success (res) {
            if (res.confirm) {
                console.log('用户点击确定')
                wx.openCustomerServiceConversation({
                    showMessageCard: true,
                    sessionFrom:order_sn,
                    sendMessageTitle:order_sn,
                    success:function(e){
                        console.log(e)
                    },
                    fail:function(e){
                        console.log(e)
                    }
                })
            } else if (res.cancel) {
                console.log('用户点击取消')
            }
        }
    })
}

// 调起android付款
_mn.androidMiniPay = function (payment,obj,callback) {
  var game_config = wx.getStorageSync('game_config') 
  var offerId = game_config.offer_id 
  var midas_config = {
    mode: "game",
    env: 1,
    offerId: offerId,
    currencyType: "CNY",
    buyQuantity: payment,
    platform: "android",
    zoneId: 1,
    success: function(e) {
        console.log("支付成功",e);
        _mn.payCallback(obj,callback)
    },
    fail: function(e) {
        console.error("支付错误: ",e);
        var errInfo = {
          ret : 0,
          data : res.data,
          msg : "米大师支付错误"
        }
        callback(errInfo)
    }
  }
  wx.requestMidasPayment(midas_config)
} 


// 支付回调
_mn.payCallback = function (obj,callback) {

  // 获取游戏参数
  var game_config = wx.getStorageSync("game_config")
  var game_id = game_config.game_id
  var game_name = game_config.game_name
  var game_ver = game_config.game_ver

  var key = game_config.game_key

  var time = new Date();
  var post_url = obj.content.union_notify_url
  var order_sn = obj.content.order_sn
  var payCallback_json = {
    union_app_id:game_id,
    out_trade_no:order_sn,
    open_id:wx.getStorageSync("open_id"),
    time	:"" + Math.round(time.getTime() / 1000),
  }
  var extra_info = {
    game_name: game_name,
    game_id: game_id,
    game_ver: game_ver,
    pay_type:"37"
  }
  var payCallback_testStr = _mn.createSign(payCallback_json) + key
  // 去掉双引号
  payCallback_testStr = payCallback_testStr.replace(/\"/g,"") 
  // console.log(payCallback_testStr)
  var sign = md5.md5(payCallback_testStr)
  payCallback_json['sign'] = sign
  payCallback_json['extra_info'] = extra_info
  wx.request({
    url:post_url ,
    data:payCallback_json,
    method:'POST',
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function(res) {
      console.log("payCallback:",res.data)
      if (res.data.ret == 1) {
        var info = {
          ret : 1,
          data : res.data,
          msg : "支付成功"
        }
        callback(info)
      } else {
        var errInfo = {
          ret : 0,
          data : res.data,
          post_url :post_url,
          msg : "支付失败"
        }
        callback(errInfo)
      }
    }
  })
}

//监控点击
_mn.listenClick = function(time){
    wx.onTouchEnd(function(res){
        function GetDateStr(dd,day) {
            dd.setDate(dd.getDate()+day);//获取AddDayCount天后的日期
            var y = dd.getFullYear();
            var m = (dd.getMonth()+1)<10 ? ('0'+(dd.getMonth()+1)) : (dd.getMonth()+1);
            var d = dd.getDate() <10 ? ('0'+ dd.getDate()) :dd.getDate();
            return Number(y+m+d);
        }
        var today = GetDateStr(new Date(),0);
        var after_day = GetDateStr(new Date(time),15);
        if(today<=after_day){
            var client = res.changedTouches[0];
            var x = client.clientX;
            var y = client.clientY;
            var listen_data = _mn.getPubData()
            var listen_verify = {
                event:'mini_game',
                x:x,
                y:y
            }
            listen_data.verify = listen_verify;
            wx.request({
                url: domain + 'miniGame/record',
                data: listen_data,
                method:'POST',
                header: {
                'content-type': 'application/json' // 默认值
                },
                success: function(res) {
                    console.log(res)
                if (res.data.ret == 1) {
                    console.log('监听成功')
                } else {
                    console.log('监听失败')
                }
                }
            })
        }
    })
}

module.exports =  _mn;

