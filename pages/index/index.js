const app = getApp()
const util = require('../../utils/util.js')
import Storage from '../../utils/storage'
var storage = new Storage()
Page({

    data: {
        scrollTop: 0,
        videoPlay: null,
        top_bg: app.globalData.api_host + "public/uploads/category/8e7e32c3ddbce7ea1839859e22a8d1dd.png",
        shop_list: [],
        address: '',
        titlmargintop: 0,
        margintop: 0,
        color: !0
    },

    onLoad: function() {
        let that = this

        // 判断是否获取到用户信息
        if (app.globalData.user) {
            that.checkAddress(app.globalData.user.id)
        } else {
            app.userInfoReadyCallback = function(res) { that.checkAddress(res.id) }
        }
        util.wxRequest("wechat/index/getVideo", {}, res => { this.setData({ video: res }) })
    },

    // 检查是否存在默认地址
    checkAddress: function(id) {
        let that = this
        util.wxRequest("wechat/user/checkAddress", { id: id }, res => {
            if (res.code == 200) {
                app.globalData.defaultaddress = res.data
                app.globalData.user_address = res.data.address + res.data.house
                app.globalData.addrss_id = res.data.id

                that.setData({ address: app.globalData.user_address })

                // 获取商家列表
                that.loadShops()
            } else {
                wx.redirectTo({ url: '/pages/address/address' })
            }
        })
    },

    onShow: function() {

        // 获取缓存设置 tabar 的数字角标
        var num = wx.getStorageSync('pdtincar')
        if (num) {
            var numstr = num.account.toString()
            if (numstr - 0 > 0) {
                this.setData({ flag: true })
            }
            app.setCartNum(numstr)
        }

        // 设置顶部偏移
        var titlehei = app.globalData.status_bar_height
        var margintop = titlehei * 2 - 0 + 44 + 52
        var titlmargintop = titlehei * 2

        this.setData({ titlmargintop: titlmargintop, margintop: margintop })

        // 是否更换了默认地址 更换则重新拉取商家列表
        if (app.globalData.refresh) {
            app.globalData.refresh = false
            this.checkAddress(app.globalData.user.id)
        }
    },

    // 前往商铺首页
    goshop: function(e) {
        app.globalData.shop_type = e.currentTarget.dataset.type,
            wx.navigateTo({
                url: '/pages/shopindex/shopindex?shopid=' + e.currentTarget.dataset.shopid,
            })
    },

    loadShops: function() {

        wx.showLoading({ title: '加载中' })
        setTimeout(function() { wx.hideLoading() }, 3000)

        util.wxRequest('wechat/user/loadShops', { id: app.globalData.addrss_id }, res => {
            // 计算门店显示进店购物或者去逛逛
            let shops = res.data
            for (let item of shops) {
                item.can = (item.deliveryGap - item.distance).toFixed(2)
                item.gap = (item.distance / 1000).toFixed(1)
            }

            app.globalData.shops = shops
            this.setData({ shops: shops })

            wx.hideLoading()
        })
    },

    // 分享
    onShareAppMessage: function() {
        let that = this
        return {
            title: '邻里快达.社区配送',
            path: 'pages/index/index', // 路径，传递参数到指定页面。
            imageUrl: that.data.banner_image, // 分享的封面图
            success: function(res) {
                wx.showToast({ title: '转发成功' })
            },
            fail: function(res) {
                wx.showToast({ title: '转发失败', icon: "none" })
            }
        }
    },

    // 视频播放
    videoPlay: function(e) {
        var _index = e.currentTarget.id
        this.setData({ _index: _index })

        //停止正在播放的视频
        var videoContextPre = wx.createideoContext(this.data._index)
        videoContextPre.stop()

        setTimeout(function() {
            //将点击视频进行播放
            var videoContext = wx.createideoContext(_index)
            videoContext.play()
        }, 500)
    },

    // 滑动到顶部
    bindscrolltoupper: function(e) { this.setData({ color: !0 }) },

    // 滑动
    bindscroll: function(e) {
        var that = this

        //当滚动的top值最大或者最小时，为什么要做这一步是由于在手机实测小程序的时候会发生滚动条回弹，所以为了解决回弹，设置默认最大最小值   
        if (e.detail.scrollTop <= 0) {
            e.detail.scrollTop = 0
        } else if (e.detail.scrollTop > wx.getSystemInfoSync().windowHeight) {
            e.detail.scrollTop = wx.getSystemInfoSync().windowHeight
        }
        //判断浏览器滚动条上下滚动
        if (e.detail.scrollTop > this.data.scrollTop || e.detail.scrollTop == wx.getSystemInfoSync().windowHeight) {
            this.setData({ color: !1 })
        }

        //给scrollTop重新赋值
        setTimeout(function() { that.setData({ scrollTop: e.detail.scrollTop }) })
    }
})