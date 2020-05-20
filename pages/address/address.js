// pages/address/address.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

    data: {
        has_address: false,
        can_add_address: true,
        address: [],
        addrId: false,
        delete_: false
    },

    onLoad: function (options) {
        let that = this
        util.wxRequest("wechat/User/getAddress", {
            uid: app.globalData.user.id,
        }, data => {
            if (data.code == 200) {
                that.setData({
                    has_address: true,
                    address: data.data
                })

                // 设置默认地址
                for (let i of data) {
                    i.is_default === 1 ? app.globalData.user_address = i.address + i.house : ''
                }
                if (data.length > 4) {
                    this.setData({
                        can_add_address: false
                    })
                }
            }
        });
    },

    // 设置默认地址
    setDefault: function (e) {
        var that = this;
        let addrId = e.currentTarget.dataset.id;
        let url = 'wechat/User/set_default';
        let params = {
            uid: app.globalData.user.id,
            addrid: addrId,
        };
        this.setData({
            addrId: addrId
        })
        util.wxRequest(url, params, data => {
            var cartId = that.data.cartId;
            if (data.code == 1) {
                wx.showToast({
                    title: data.msg,
                    icon: 'success',
                    duration: 2000
                });
                let addrId = that.data.addrId
                let temp = that.data.address
                for (let i of temp) {
                    if (i.id == addrId) {
                        i.is_default = 1
                    } else {
                        i.is_default = ''
                    }
                }
                this.setData({
                    address: temp
                })
                app.globalData.refresh = true
            } else {
                wx.showToast({
                    title: data.msg,
                    icon: 'warn',
                    duration: 2000
                });
            }
        });
    },

    //删除地址
    deladdress: function (e) {
        var that = this;
        if (e.currentTarget.dataset.default == 1) {
            wx.showModal({
                title: '提示',
                content: '删除默认地址前，请先修改一个地址为默认地址！！',
            })
            return;
        }
        var addrId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '提示',
            content: '你确认移除吗',
            success: function (res) {
                let url = 'wechat/User/del_address';
                let params = {
                    uid: app.globalData.user.id,
                    addrid: addrId
                };
                res.confirm && util.wxRequest(url, params, data => {
                    if (data.code == 1) {
                        that.onLoad();
                    } else {
                        wx.showToast({
                            title: data.msg,
                            icon: 'loading',
                            duration: 2000
                        });
                    }
                }, data => { }, data => { });
            }
        });
    },

    //编辑地址
    editaddress: function (e) {
        var addrId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/addressadd/addressadd?id=' + addrId,
        })
    },

    //点击去购物
    goshopping: function () {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },

    // 提示不可新增地址
    no_add_address: function () {
        wx.showToast({
            title: '不可超过五个收货地址',
            icon: 'none'
        })
    }
    
})