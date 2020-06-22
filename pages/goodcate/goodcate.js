const util = require('../../utils/util.js')
const app = getApp()
import Storage from '../../utils/storage'
var storage = new Storage()
Page({

    data: {
        totalGoods: false,
        totalPrice: '0.00',
        totalFavorable: '0.00',
        shopid: false,
        shopname: false,
        deliveryPrice: false,
        select: 0,
        categories: [],
        commodities: [],
        goodsList: [],
        goodsincar: [],
        page: 0,
        is_show: false,
        scrollTop: false,
        scroll: '',
        cateid: false
    },

    onLoad: function(options) {

        var that = this

        app.globalData.shop_id = options.shop_id
        app.globalData.deliveryPrice = options.deliveryPrice * 1

        that.setData({
            cateid: options.cateid,
            shopid: options.shop_id,
            shopname: options.shopname,
            deliveryPrice: options.deliveryPrice * 1
        })
    },

    onShow: function() {
        let that = this

        // 获取门店分类  回调之后再获取产品
        util.wxRequest('wechat/Shop/getCategories', { shop_id: that.data.shopid }, res => {
            if (res.code == 200) {
                that.setData({ categories: res.data })

                for (let i = 0; i < that.data.categories.length; i++) {
                    if (that.data.categories[i].id == that.data.cateid) {
                        that.setData({ select: i, page: 0, goodsList: [] })
                            that.loadData()
                    }
                }
            }
        })

        storage._reVoluationCart()

        var pdt = wx.getStorageSync('pdtincar')
        var shopid = this.data.shopid

        var pdtincar = pdt
        if (pdtincar) {
            var pagearr = pdtincar.commodities
            var pagegoodsincar = []
            pagearr.forEach(function(item, index) {
                if (item && item.shopid == shopid) {
                    pagegoodsincar = item.commodity
                }
            })
        }
        this.setData({ goodsincar: pagegoodsincar ? pagegoodsincar : [] })

        if (pdt) {
            var commodities = pdt.commodities
            this.setData({ commodities: commodities })
            var numstr = pdt.account.toString()
        } else {
            var numstr = '0'
            this.setData({ flag: false })
        }

        if (numstr - 0 > 0) {
            this.setData({ flag: true, account: numstr })
        }
        this.countInfoAtThisShop(pdt, this, this.data.shopid)
    },

    // 点击回到顶部
    bindTop: function() {
        this.setData({ scroll: 0 })
    },

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
        setTimeout(function() {
            that.setData({
                scrollTop: e.detail.scrollTop
            })
        })
    },

    // 计算本门店的购物车信息，赋值到UI
    countInfoAtThisShop: function(pdtincar, that, id) {
        if (!pdtincar) {
            var arr = []
        } else {
            var arr = pdtincar.commodities
        }
        var totalGoods = false
        var totalPrice = '0.00'
        var totalFavorable = '0.00'
        let is_show = false
        if (arr) {
            var num = arr.length
        } else {
            num = 0
        }
        for (let i = 0; i < num; i++) {
            if (arr[i] && arr[i].shopid == id) {
                totalGoods = arr[i].account
                totalPrice = arr[i].totalPrice
                totalFavorable = arr[i].totalfav
            }
        }

        if (that.data.deliveryPrice <= totalPrice) {
            is_show = true
        }

        that.setData({
            is_show: is_show,
            totalGoods: totalGoods,
            totalPrice: totalPrice,
            totalFavorable: totalFavorable
        })
    },

    // 点击搜索  组件事件没有捕获到
    gosearch: function() {
        app.globalData.shop_id = this.data.shopid
        wx.navigateTo({
            url: '/pages/search/search'
        })
    },

    // 切换分类
    categoryClick: function(event) {
        let that = this
        for (let i = 0; i < that.data.categories.length; i++) {
            if (that.data.categories[i].id == event.target.id) {
                that.setData({
                    select: i,
                    cateid:i
                })
            }
        }

        this.setData({
            goodsList: [],
            page: 0,
        })
        this.loadData()
    },

    // 查看商品详情
    gooddetail: function(e) {
        var id = e.currentTarget.dataset.id
        let that = this
        wx.navigateTo({
            url: '/pages/gooddetail/gooddetail?id=' + id + "&deliveryPrice=" + that.data.deliveryPrice,
        })
    },

    // 加入购物车
    addToCart: function(e) {
        if (app.globalData.shop_type != 1) {
            wx.showToast({
                title: '超出距离，不可添加购物车',
                icon: 'none'
            })
            return false
        }

        var that = this
        let is_show = false
        var data = e.currentTarget.dataset.msg
        var oldnum = this.data.totalGoods ? this.data.totalGoods : 0
        var newnum = 1 * oldnum + 1
        var numstr = newnum.toString()
        that.setData({ num: numstr })

        data.shopname = that.data.shopname
        data.deliveryPrice = that.data.deliveryPrice
        storage.operateCar(data, that)

        // 改变当前页底部购物车展示
        var totalGoods = that.data.totalGoods
        var totalPrice = that.data.totalPrice
        var totalFavorable = that.data.totalFavorable

        totalGoods = totalGoods * 1 + 1
        totalPrice = (totalPrice * 1 + data.price * 1).toFixed(2)
        totalFavorable = (totalFavorable * 1 + data.price_orig * 1 - data.price * 1).toFixed(2)

        var newgoodsincar = that.data.goodsincar
        if (newgoodsincar) {
            var s = false
            newgoodsincar.forEach(function(item, index) {
                if (item.id == data.id) {
                    item.count = item.count * 1 + 1
                    s = true
                }
            })
            if (!s) {
                data.count = 1
                newgoodsincar = newgoodsincar.concat(data)
            }
        } else {
            data.count = 1
            newgoodsincar = [data]
        }

        if (that.data.deliveryPrice <= totalPrice) {
            is_show = true
        }
        that.setData({
            is_show: is_show,
            goodsincar: newgoodsincar,
            totalGoods: totalGoods,
            totalPrice: totalPrice,
            totalFavorable: totalFavorable
        })
    },

    // 点击去结算
    godoorder: function() {
        wx.removeStorageSync('makeorder')
        let orderinfo = {
            type: 'cart',
            shop_id: this.data.shopid,
            account: this.data.totalGoods,
            totalPrice: this.data.totalPrice,
            commodity: this.data.goodsincar
        }

        wx.setStorageSync('makeorder', orderinfo)
        wx.navigateTo({
            url: '/pages/doorder/doorder',
        })
    },

    // 上拉加载
    onReachBottom: function() { this.loadData() },

    // 加载数据
    loadData: function() {
        let that = this

        wx.showLoading({ title: '加载中' })
        setTimeout(function() { wx.hideLoading() }, 3000)

        let param = {
            status: 1,
            page: that.data.page + 1,
            shop_id: that.data.shopid,
            category_id: that.data.categories[that.data.select].id
        }

        Object.assign(param, that.data.param)

        util.wxRequest("wechat/Shop/get_goods", param, res => {
            let temp = that.data.goodsList.concat(res.data.data)

            for (let i of temp) {
                i.price1 = i.price.split('.')[1]
                i.price0 = i.price.split('.')[0]
            }

            that.setData({ page: res.data.current_page, goodsList: temp })

            wx.hideLoading()
        })
    },
})