import WxValidate from '../../utils/WxValidate.js'
const app = getApp()
const util = require('../../utils/util.js')
Page({


    data: {
        no: false,
        addr: {},
        has_location: true,
        onAsync: false
    },

    onLoad: function(options) {
        let that = this
        if (options.id != undefined) {
            this.address(options.id)
        }

        that.initValidate()

        // 轮询验证 时间来不及做事实验证
        setInterval(() => {
            that.setData({
                no: this.ValidateName.checkForm(that.data.addr)
            })
        }, 300);
    },

    // 修改地址场景=》填充数据
    address: function(id) {
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

    // 选择地址
    location: function() {
        var that = this
        wx.getSetting({
            success: function(res) {
                var locascope = res.authSetting['scope.userLocation']
                if (locascope == 'undefined') {
                    that.showSettingToast()
                } else if (locascope == false) {
                    that.showSettingToast()
                } else {
                    that.setData({
                        has_location: true
                    })
                    wx.chooseLocation({
                        success: function(res) {
                            getApp().globalData.debug ? console.log(res) : ''
                            that.setData({
                                'addr.address': res.address,
                                'addr.lat': res.latitude,
                                'addr.lng': res.longitude
                            })
                        },
                        fail: function(res) {
                            res.errMsg == "chooseLocation:fail auth deny" ? that.showSettingToast() : ''
                        }
                    })
                }
            },
        })
    },

    // 输入门牌号
    housewords: function(e) {
        this.setData({
            'addr.house': e.detail.value,
        })
    },

    // 输入联系人
    linkuwords: function(e) {
        this.setData({
            'addr.contact': e.detail.value,
        })
    },

    // 输入手机号
    linkphwords: function(e) {
        this.setData({
            'addr.phone': e.detail.value,
        })
    },

    // 清空手机号
    clearvalue: function(e) {
        this.setData({
            'addr.phone': '',
        })
    },

    // 提交
    formSubmit: function() {
        let that = this

        let id = { uid: app.globalData.user.id }

        Object.assign(that.data.addr, id);

        // 验证
        if (!this.ValidateName.checkForm(that.data.addr)) {
            const error = this.ValidateName.errorList[0]
            wx.showToast({
                title: error.msg,
                icon: "none"
            })
            that.setData({
                onAsync: false
            })
            return false
        }

        util.wxRequest('wechat/User/addAddress', that.data.addr, data => {
            wx.showToast({
                title: data.msg,
                icon: data.code == 1 ? 'success' : 'none',
            })

            if (data.code == 200) {

                // 新用户新增地址需要重新拉取商店列表
                app.globalData.user_address = that.data.addr.address + that.data.addr.house
                app.globalData.defaultaddress = that.data

                setTimeout(function() {
                    wx.switchTab({
                        url: '/pages/index/index',
                    })
                }, 1000)
            }

            if (data.code == 1) {
                setTimeout(function() {
                    wx.navigateBack()
                }, 1000)
            }
        })
    },

    // 授意用户开启权限 打开权限设置页提示框
    showSettingToast: function(e) {
        wx.showToast({
            title: '请授权获取位置信息',
            icon: 'none'
        })
        this.setData({
            has_location: false
        })
    },

    // 获取用户授权 回调新增地址
    bindgetuserinfo: function(e) {
        this.formSubmit()
    },

    // 验证
    initValidate: function() {
        const rules = {
            address: {
                required: true,
            },
            house: {
                required: true,
            },
            contact: {
                required: true,
            },
            phone: {
                required: true,
                tel: true
            },
        }
        const messages = {
            address: {
                required: "请选择地址",
            },
            house: {
                required: "请输入门牌号信息",
            },
            contact: {
                required: "请输入联系人信息",
            },

        }
        this.ValidateName = new WxValidate(rules, messages)
    }

})