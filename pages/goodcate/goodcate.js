const util = require('../../utils/util.js')
const app = getApp()
import Storage from '../../utils/storage'
var storage = new Storage()
Page({

    data: {
        totalGoods: false,
        totalPrice: false,
        totalFavorable: false,
        shopid: false,
        shopname: false,
        select: 0,
        categories: [],
        commodities: [],
        goodsList: [],
        goodsincar: [],
        page: 0,
    },

    onLoad: function(options) {

        var that = this

        app.globalData.shop_id = options.shop_id
        var shopid = options.shop_id

        var pdtincar = wx.getStorageSync('pdtincar')
        if (pdtincar) {
            var pagearr = pdtincar.commodities
            var pagegoodsincar = []
            pagearr.forEach(function(item, index) {
                if (item && item.shopid == options.shop_id) {
                    pagegoodsincar = item.commodity
                }
            })
        }

        that.setData({
            goodsincar: pagegoodsincar,
            shopid: shopid,
            shopname: options.shopname,
        })

        that.countInfoAtThisShop(pdtincar, that, options.shop_id)

        // 获取门店分类  回调之后再获取产品
        util.wxRequest('wechat/Shop/getCategories', { shop_id: options.shop_id }, res => {
            if (res.code == 200) {
                that.setData({
                    categories: res.data
                })

                for (let i = 0; i < that.data.categories.length; i++) {
                    if (that.data.categories[i].id == options.cateid) {
                        that.setData({
                            select: i,
                        })
                    }
                }

                that.loadData()
            }
        })

    },

    onShow: function() {
        storage._reVoluationCart()

        var pdt = wx.getStorageSync('pdtincar')
        console.log(pdt)

        if (pdt) {
            var ids = null
            storage._getAllGoodidIncart(res => {
                ids = res
            })
            console.log(ids)
            var goodsmsg = null
            util.wxRequest('wechat/shop/getGoodsIncart', { ids: ids, data: JSON.stringify(pdt.commodities) }, data => {
                console.log(data)
                goodsmsg = data.data
            })

            var commodities = pdt.commodities
                // commodities[0].ishow = true
            this.setData({
                commodities: commodities
            })
            var numstr = pdt.account.toString()
        } else {
            var numstr = '0'
            this.setData({
                flag: false
            })
        }

        if (numstr - 0 > 0) {
            this.setData({
                flag: true,
                account: numstr
            })
            app.setCartNum(numstr)
        }


    },

    // 计算本门店的购物车信息，赋值到UI
    countInfoAtThisShop: function(pdtincar, that, id) {
        if (!pdtincar) {
            var arr = []
        } else {
            var arr = pdtincar.commodities
        }
        var totalGoods = false
        var totalPrice = false
        var totalFavorable = false
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
        that.setData({
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
                })
            }
        }

        this.setData({
            goodsList: [],
            page: 0
        })
        this.loadData()
    },

    // 查看商品详情
    gooddetail: e => {
        var id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/gooddetail/gooddetail?id=' + id,
        })
    },

    // 加入购物车
    addToCart: function(e) {
        var data = e.currentTarget.dataset.msg

        var oldnum = this.data.totalGoods ? this.data.totalGoods : 0
        var newnum = 1 * oldnum + 1
        var numstr = newnum.toString()
        this.setData({
            num: numstr
        })
        var that = this
        data.shopname = that.data.shopname
        storage.operateCar(data, that)

        //改变当前页底部购物车展示
        var totalGoods = that.data.totalGoods
        var totalPrice = that.data.totalPrice
        var totalFavorable = that.data.totalFavorable

        totalGoods = totalGoods * 1 + 1
        totalPrice = (totalPrice * 1 + data.price * 1).toFixed(2)
        console.log(totalPrice)
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

        that.setData({
            goodsincar: newgoodsincar,
            totalGoods: totalGoods,
            totalPrice: totalPrice,
            totalFavorable: totalFavorable
        })
    },

    // 点击去结算
    godoorder: function() {
        wx.removeStorageSync('makeorder')
        var commodity = []
        var orderinfo = []
            //设置当前门店购物车商品为选中状态
        var shop_id = this.data.shopid
        console.log(shop_id)
        var arr = wx.getStorageSync('pdtincar').commodities
        arr.forEach(function(item, index) {
            if (item.shopid == shop_id) {
                item.selected = true;
                (item.commodity).forEach(function(item, index) {
                    item.selected = true
                })
            } else {
                item.selected = false
            }
        })
        console.log(arr)
        for (let i of arr) {
            if (i.selected) {
                for (let s of i.commodity) {
                    if (s && s.selected) {
                        commodity = commodity.concat(s)
                    }
                }
            }
        }
        orderinfo = {
            type: 'cart',
            shop_id: shop_id,
            account: this.data.totalGoods,
            totalPrice: this.data.totalPrice,
            commodity: commodity
        }
        wx.setStorageSync('makeorder', arr)
        wx.redirectTo({
            url: '/pages/doorder/doorder',
        })
    },

    // 上拉加载
    onReachBottom: function() {
        this.loadData()
    },

    // 加载数据
    loadData: function() {
        let that = this

        wx.showLoading({
            title: '加载中',
            mask: true
        })

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

            that.setData({
                page: res.data.current_page,
                goodsList: temp
            })
            wx.hideLoading()
        })
    },

})