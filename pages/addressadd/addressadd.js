// pages/addressadd/addressadd.js
const app = getApp();
const util = require('../../utils/util.js');
const phoneRexp = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        house: '',
        contact: '',
        phone: '',
        no: false,
        color: '',
        phone: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options.id != undefined) {
            this.address(options.id);
            this.setData({
                no: true
            })
        }
    },

    // 改变保存按钮状态
    changebtn: function(that) {
        if (that.data.address && that.data.house && that.data.linku && that.data.linkph) {
            that.setData({
                no: true
            })
        } else {
            that.setData({
                no: false
            })
        }
    },

    // 门牌号失焦事件
    housewords: function(e) {
            this.setData({
                house: e.detail.value,
            })
            var that = this;
        that.changebtn(that)

    },
    //   输入手机号
    valuein: function(e) {
        this.setData({
            color: 'black'
        })
    },
    // 清空手机号
    clearvalue: function(e) {
        var that = this;
        that.setData({
            phone: '',
            color: 'color',
            no: false,
            linkph: false
        })
        that.changebtn(that)
    },
    // 联系人失焦事件
    linkuwords: function(e) {

     
            var that = this;
            that.setData({
                linku: e.detail.value,
            })
            that.changebtn(that)

    },

    // 手机号失焦事件
    linkphup: function(e) { 
            var that = this;
            that.setData({
                linkph: e.detail.value
            })
            that.changebtn(that)
    },

    address: function(id) {
        let that = this;
        let url = 'wechat/User/edit_address';
        let params = {
            id: id
        };
        util.wxRequest(url, params, data => {
            that.setData({
                addr: data,
            })
        });
    },

    // 提交
    formSubmit: function(res) {
        let that = this;
        let value = res.detail.value;
        value.uid = app.globalData.user.id;
        if (!value.address) {
            wx.showToast({
                title: '请填写收货地址',
                icon: 'none',
            })
            return;
        }
        if (!value.house) {
            wx.showToast({
                title: '请填写门牌号',
                icon: 'none',
            })
            return;
        }
        if (value.house.length == 0 || value.house.length > 30) {
            wx.showToast({
                title: '门牌号字数在30字内',
                icon: 'none',
            })
            return;
        }
        if (!value.contact || value.contact > 12) {
            wx.showToast({
                title: '联系人字数在12字内',
                icon: 'none',
            })
            return;
        }
        if (!value.phone) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none',
            })
            return;
        }
        if (!phoneRexp.test(value.phone)) {
            wx.showToast({
                title: '手机号格式不正确',
                icon: 'none',
            })
            return;
        }
        let url = '/wechat/User/addAddress';
        let params = {
            value: value
        };
        util.wxRequest(url, params, data => {
            if (data.code == 1) {
                wx.showToast({
                    title: data.msg,
                    icon: 'success',
                });
                setTimeout(function() {
                    wx.navigateTo({
                        url: '/pages/address/address',
                    })
                }, 1000)
            } else {
                wx.showToast({
                    title: data.msg,
                    icon: 'error',
                });
            }

        });
    },

    // 点击地址填写
    location: function() {
        var that = this;
        wx.getSetting({
            success: function(res) {
                var locascope = res.authSetting['scope.userLocation'];
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
                        success: function(res) {
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

    // 授意用户开启权限
    // 打开权限设置页提示框
    showSettingToast: function(e) {
        wx.showModal({
            title: '定位服务未开启',
            confirmText: '请在“设置->应用权限”中打开位置权限',
            showCancel: false,
            content: e,
            success: function(res) {
                if (res.confirm) {
                    wx.navigateTo({
                        url: '../setting/setting',
                    })
                }
            }
        })
    }

})