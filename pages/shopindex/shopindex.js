// pages/shopindex/shopindex.js
const app = getApp()
const util = require('../../utils/util.js');
Page({

    data: {
        shopdata: null,
        notice: [],
        categories: [],
        swiper: [],
        shopid: false,
        shopname: false,
        imgBaseUrl: '',
    },

    onLoad: function(options) {

        this.setData({
            shopid: options.shopid
        })

        // 获取门店信息
        util.wxRequest('wechat/Shop/getShopInfo', { shop_id: options.shopid }, res => {
            if (res.code == 200) {
                wx.setNavigationBarTitle({
                    title: res.data.name,
                })

                let swiper = [res.data.image]
                this.setData({
                    shopdata: res.data,
                    shopname: res.data.name,
                    swiper: swiper
                })
            }
        })

        // 获取门店分类
        util.wxRequest('wechat/Shop/getCategories', { shop_id: options.shopid }, res => {
            if (res.code == 200) {
                this.setData({
                    categories: res.data
                })
            }
        })

        // 获取门店公告
        util.wxRequest('wechat/Shop/getNotice', { shop_id: options.shopid }, res => {
            if (res.code == 200) {
                var notice = res.data.total > 0 ? res.data.data : null;
                this.setData({
                    notice: notice,
                    imgBaseUrl: app.globalData.api_host
                })
            }
        })


    },

    // 点击分类导航事件
    navito: function(e) {
        var cateid = e.currentTarget.dataset.cateid;
        wx.navigateTo({
            url: '/pages/goodcate/goodcate?cateid=' + cateid + '&shop_id=' + this.data.shopid + '&shopname=' + this.data.shopname,
        })
    },

    //点击店内公告
    gonotice: function(e) {
        var noticeid = e.currentTarget.dataset.cateid;
        wx.navigateTo({
            url: '/pages/noticedel/noticedel?noticeid=' + noticeid,
        })
    },

})