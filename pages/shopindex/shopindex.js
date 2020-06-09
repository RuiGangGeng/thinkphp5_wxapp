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
        page: 0,
        onAsync: false,
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

        this.loadData()
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

    // 上拉加载
    onReachBottom: function() {
        this.loadData()
    },

    // 加载数据
    loadData: function() {
        let that = this
        if (that.data.onAsync) return false

        that.setData({ onAsync: true })

        let param = {
            page: that.data.page + 1,
            shop_id: that.data.shopid
        }

        util.wxRequest("wechat/Shop/getNotice", param, res => {
            let temp = that.data.notice.concat(res.data.data)

            that.setData({
                notice: temp,
                page: res.data.current_page,
                onAsync: false
            })

            res.data.data.length == 0 && res.data.current_page !== 1 ? wx.showToast({
                title: '暂无更多公告信息',
                icon: "none"
            }) : ''

        })
    },
})