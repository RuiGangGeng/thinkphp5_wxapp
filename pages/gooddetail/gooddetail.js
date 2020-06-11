const app = getApp();
const util = require('../../utils/util.js');
import Storage from '../../utils/storage';
var storage = new Storage();
Page({

    data: {
        good: {},
        cargood: null,
        shop_id: false,
        totalGoods: false,
        totalPrice: '0.00',
        totalFavorable: '0.00',
        deliveryPrice: false,
        shopname: false,
        goodsList: [],
        goodsincar: [],
        is_show: false
    },

    onLoad: function(e) {
        var that = this
        util.wxRequest('wechat/Shop/getShopName', { shop_id: app.globalData.shop_id }, res => { that.setData({ shopname: res.name }) })
        that.setData({ deliveryPrice: e.deliveryPrice * 1 })
        var pdtincar = wx.getStorageSync('pdtincar');
        if (pdtincar) {
            var pagearr = pdtincar.commodities;
            var pagegoodsincar = [];
            pagearr.forEach(function(item, index) {
                if (item && item.shopid == app.globalData.shop_id) {
                    pagegoodsincar = item.commodity
                }
            })
        }
        that.countInfoAtThisShop(pdtincar, that, app.globalData.shop_id)

        storage._getGoodInCart(e.id, data => {
            var cargood = null;
            if (data) {
                var goodcount = data.count
                var goodPrice = (data.count * data.price).toFixed(2)
                var goodFavorable = ((data.price_orig - data.price) * data.count).toFixed(2)
                cargood = {
                    goodcount: goodcount,
                    goodPrice: goodPrice,
                    goodFavorable: goodFavorable
                }
            }
            that.setData({ cargood: cargood, deliveryPrice: e.deliveryPrice * 1 })
        })

        util.wxRequest("wechat/shop/get_good", { id: e.id, }, res => {
            if (res.code == 200) {
                res.data.price0 = res.data.price.split('.')[0]
                res.data.price1 = res.data.price.split('.')[1]
            }
            this.setData({
                good: res.data,
            })
        })
        that.setData({
            goodsincar: pagegoodsincar,
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
            num = 0;
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

    // 点击去结算
    godoorder: function() {
        wx.removeStorageSync('makeorder');
        //设置当前门店购物车商品为选中状态
        var shop_id = this.data.shopid;
        var arr = wx.getStorageSync('pdtincar').commodities;
        arr.forEach(function(item, index) {
            if (item.shopid == shop_id) {
                item.selected = true;
                (item.commodity).forEach(function(item, index) {
                    item.selected = true;
                })
            }
        })

        wx.setStorageSync('makeorder', arr)
        wx.navigateTo({
            url: '/pages/doorder/doorder',
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
        var data = e.currentTarget.dataset.msg
        var oldnum = this.data.totalGoods ? this.data.totalGoods : 0
        var newnum = 1 * oldnum + 1
        var numstr = newnum.toString()
        this.setData({ num: numstr })

        let is_show = false
        data.shopname = that.data.shopname;
        data.deliveryPrice = that.data.deliveryPrice
        storage.operateCar(data, that)

        //改变当前页底部购物车展示
        var totalGoods = that.data.totalGoods;
        var totalPrice = that.data.totalPrice;
        var totalFavorable = that.data.totalFavorable;

        totalGoods = totalGoods * 1 + 1;
        totalPrice = (totalPrice * 1 + data.price * 1).toFixed(2);
        totalFavorable = (totalFavorable * 1 + data.price_orig * 1 - data.price * 1).toFixed(2);

        var newgoodsincar = that.data.goodsincar;
        if (newgoodsincar) {
            var s = false;
            newgoodsincar.forEach(function(item, index) {
                if (item.id == data.id) {
                    item.count = item.count * 1 + 1;
                    s = true;
                }
            })
            if (!s) {
                data.count = 1;
                newgoodsincar = newgoodsincar.concat(data)
            }
        } else {
            data.count = 1;
            newgoodsincar = [data];
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

    // 分享
    onShareAppMessage: function() {
        let that = this;
        return {
            title: that.data.good.name,
            path: 'pages/gooddetail/gooddetail?id=' + that.data.good.id, // 路径，传递参数到指定页面。
            imageUrl: that.data.good.detailimg, // 分享的封面图
            success: function(res) {
                wx.showToast({
                    title: '转发成功',
                })
            },
            fail: function(res) {
                wx.showToast({
                    title: '转发失败',
                    icon: "none"
                })
            }
        }
    },

})