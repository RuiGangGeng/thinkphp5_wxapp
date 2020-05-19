const app = getApp()
const util = require('../../utils/util.js');
Page({
    data: {
        top_bg: app.globalData.api_host + "public/uploads/category/8e7e32c3ddbce7ea1839859e22a8d1dd.png",
        banner_image: app.globalData.api_host + "public/uploads/category/f1bc7a59af3aa5c7eaf3f5bd7364c055.png",
        shop_list: [],
        address: '',
        titlmargintop: 0,
        margintop: 0,
    },

    onLoad: function () {
        var num = wx.getStorageSync('pdtincar');
        if (num * 1 > 0) {
            var numstr = num.account.toString();
            if (numstr - 0 > 0) {
                this.setData({
                    flag: true
                })
            }
            app.setCartNum(numstr)
        }
        wx.showLoading({
            title: '加载中',
            mask: true,
        });
        //获取用户登陆信息及地址
        wx.login({
            success: res => {
                util.wxRequest("wechat/user/wx_login", {
                    code: res.code
                }, res => {
                    wx.hideLoading();
                    app.globalData.user = res.data.user
                    app.globalData.defaultaddress = res.data.address
                    app.globalData.user_address = res.data.address.address + res.data.address.house
                    var shops = res.data.shops;
                    // 计算门店显示进店购物或者去逛逛
                    shops.forEach(function (item, index) {
                        item.can = (item.deliveryGap - item.distance).toFixed(2);
                        item.gap = (item.distance / 1000).toFixed(1);
                    })

                    app.globalData.shops = shops
                    this.setData({
                        address: app.globalData.user_address,
                        shops: shops
                    })
                })
            }
        })

    },


    onShow: function () {
        var titlehei = app.globalData.status_bar_height;
        var margintop = titlehei * 2 - 0 + 44 + 80;
        var titlmargintop = titlehei * 2;
        this.setData({
            titlmargintop: titlmargintop,
            margintop: margintop,
        })
        if (app.globalData.user_address) {
            app.globalData.refresh ? (this.onLoad(), app.globalData.refresh = false) : ''
            this.setData({
                address: app.globalData.user_address
            })
        }
    },

    // 前往商铺首页
    goshop: function (e) {
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: '/pages/shopindex/shopindex?shopid=' + shopid,
        })
    },

    // 点击收藏或者取消收藏
    docollect: function () {
        if (this.data.iscollect == undefined || this.data.iscollect == false) {
            this.setData({
                iscollect: true
            })
            wx.showToast({
                title: '已加入收藏',
                icon: 'success',
                duration: 2000
            })
        } else {
            this.setData({
                iscollect: false
            })
            wx.showToast({
                title: '已取消收藏',
                icon: 'none',
                duration: 2000
            })
        }
    },
})