// pages/shopindex/shopindex.js
const app = getApp()
const util = require('../../utils/util.js')
Page({

    data: {
        shopdata: null,
        notice: [],
        categories: [],
        swiper: [],
        shopid: false,
        shopname: false,
    },

    onLoad: function(options) {

        wx.showLoading({ title: '加载中' })
        setTimeout(function() { wx.hideLoading() }, 3000)

        this.setData({
            shopid: options.shopid
        })

        // 获取门店信息
        util.wxRequest('wechat/Shop/getShopInfo', { shop_id: options.shopid }, res => {
            if (res.code == 200) {
                wx.setNavigationBarTitle({
                    title: res.data.name,
                })

                let swiper = res.data.image
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
                wx.hideLoading()
            }
        })

        // 获取门店公告
        util.wxRequest('wechat/Shop/getNotice', { shop_id: options.shopid }, res => {
            if (res.code == 200) {
                this.setData({
                    notice: res.data,
                })
            }
        })
    },

    // 点击分类导航事件
    navito: function(e) {
        var cateid = e.currentTarget.dataset.cateid
        wx.navigateTo({
            url: '/pages/goodcate/goodcate?cateid=' + cateid + '&shop_id=' + this.data.shopid + '&shopname=' + this.data.shopname + '&deliveryPrice=' + this.data.shopdata.deliveryPrice,
        })
    },

    // 点击店内公告
    gonotice: function(e) {
        var noticeid = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/noticedel/noticedel?noticeid=' + noticeid,
        })
    },

})