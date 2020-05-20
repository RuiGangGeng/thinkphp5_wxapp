const util = require('util.js');

// 获取用户授权
const getUserAuth = (e) => {
    getApp().globalData.debug ? console.log(e) : ''
    // 检查是否授权
    wx.getSetting({
        success: res => {
            if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                let param = {
                    user_id: getApp().globalData.user_id,
                    rawData: e.detail.rawData,
                    signature: e.detail.signature
                }
                // 校验 session_key 同时更新用户信息
                util.wxRequest("User/check_session_key", param, res => {
                    if (res.data === true) {
                        wx.showToast({
                            title: '授权成功',
                        })
                        getApp().globalData.userAuth = e.detail.userInfo
                        util.setStorageStudyfox("auth", e.detail.userInfo)
                        getApp().globalData.debug ? console.log(getApp().globalData) : ''
                        if (getApp().userAuthReadyCallback) {
                            getApp().userAuthReadyCallback(e.detail.userInfo)
                        }
                    }
                })
            } else {
                wx.showToast({
                    title: '您取消了授权',
                    icon: 'none'
                })
            }
        }
    })
}

// 获取地理位置
const getUserLocation = (call) => {
    let change = changePoistion
    wx.getLocation({
        type: 'wgs84',
        success(res) {
            change(res.longitude, res.latitude, function(r) {
                call(r)
            })
        },
        fail: function() {
            wx.showToast({
                title: '获取定位失败，请手动获取',
                icon: 'none'
            })
        }
    })
}

// 转换坐标系
const changePoistion = (longitude, latitude, callBack) => {
    wx.request({
        url: "https://api.map.baidu.com/geoconv/v1/",
        data: {
            "coords": longitude + "," + latitude,
            "from": 3,
            "to": 5,
            "ak": "ZDmTwlk0HlfuUR0AS2vhB4w6RazdubH3"
        },
        header: {
            'content-type': 'application/json',
        },
        method: 'GET',
        success: function(res) {
            if (res.statusCode == 200) {
                let s = {
                    latitude: String(res.data.result[0].y),
                    longitude: String(res.data.result[0].x)
                }
                callBack(s)
            }
        },
    })
}

module.exports = {
    getUserAuth: getUserAuth,
    getUserLocation: getUserLocation,
    changePoistion: changePoistion
}