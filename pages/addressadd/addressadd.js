// pages/addressadd/addressadd.js
const app = getApp()
const util = require('../../utils/util.js')
const phoneRexp = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
Page({


    data: {
        house: '',
        contact: '',
        phone: '',
        no: false,
        color: '',
        phone: ''
    },

    onLoad: function (options) {
        if (options.id != undefined) {
            this.address(options.id)
            this.setData({
                no: true
            })
        }
    },

    // 输入手机号
    valuein: function (e) {
        this.setData({
            color: 'black'
        })
    },

    // 清空手机号
    clearvalue: function (e) {
        var that = this
        that.setData({
            phone: '',
            color: 'color',
            no: false,
            linkph: false
        })
        that.changebtn(that)
    },

    // 修改地址场景=》填充数据
    address: function (id) {
        let that = this
        let url = 'wechat/User/edit_address'
        let params = {
            id: id
        }
        util.wxRequest(url, params, data => {
            that.setData({
                addr: data,
            })
        })
    },

    // 提交
    formSubmit: function (res) {
        let that = this
        let value = res.detail.value
        value.uid = app.globalData.user.id
        if (!value.address) {
            wx.showToast({
                title: '请填写收货地址',
                icon: 'none',
            })
            return
        }
        if (!value.house) {
            wx.showToast({
                title: '请填写门牌号',
                icon: 'none',
            })
            return
        }
        if (value.house.length == 0 || value.house.length > 30) {
            wx.showToast({
                title: '门牌号字数在30字内',
                icon: 'none',
            })
            return
        }
        if (!value.contact || value.contact > 12) {
            wx.showToast({
                title: '联系人字数在12字内',
                icon: 'none',
            })
            return
        }
        if (!value.phone) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none',
            })
            return
        }
        if (!phoneRexp.test(value.phone)) {
            wx.showToast({
                title: '手机号格式不正确',
                icon: 'none',
            })
            return
        }
        let url = '/wechat/User/addAddress'
        let params = {
            value: value
        }

        util.wxRequest(url, params, data => {
            wx.showToast({
                title: data.msg,
                icon: data.code == 1 ? 'success' : 'none',
            })

            if (data.code == 1) {
                setTimeout(function () {
                    wx.navigateTo({
                        url: '/pages/address/address',
                    })
                }, 1000)
            }
        })
    },

    // 点击地址填写
    location: function () {
        var that = this
        wx.getSetting({
            success: function (res) {
                var locascope = res.authSetting['scope.userLocation']
                if (locascope == 'undefined') {
                    wx.navigateTo({
                        url: '/pages/setting/setting',
                    })
                } else if (locascope == false) {
                    wx.navigateTo({
                        url: '/pages/setting/setting',
                    })
                } else {
                    wx.chooseLocation({
                        success: function (res) {
                            getApp().globalData.debug ? console.log(res) : ''
                            that.setData({
                                address: res.address,
                                lat: res.latitude,
                                lng: res.longitude
                            })
                        },
                    })
                }
            }
        })
    },

    // 授意用户开启权限 打开权限设置页提示框
    showSettingToast: function (e) {
        wx.showModal({
            title: '定位服务未开启',
            confirmText: '请在“设置->应用权限”中打开位置权限',
            showCancel: false,
            content: e,
            success: function (res) {
                setTimeout(function () {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '../setting/setting',
                        })
                    }
                }, 1500)
            }
        })
    },

    // 获取用户授权 回调新增地址
    bindgetuserinfo: function (e) {
        getApp().globalData.debug ? console.log(e) : ''

        // 检查是否授权
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    let param = {
                        user_id: getApp().globalData.user.id,
                        rawData: e.detail.rawData,
                    }
                    // 校验 session_key 同时更新用户信息
                    util.wxRequest("/wechat/User/wx_auth", param, res => {
                        if (res.data.code === 200) {
                            getApp().globalData.debug ? console.log(getApp().globalData) : ''
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

})