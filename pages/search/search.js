const util = require('../../utils/util.js');
const app = getApp();
import Storage from '../../utils/storage';
var storage = new Storage();
Page({
    data: {
        search: true,
        noneHidden: true,
        searchHidden: false,
        recentSearch: [],
        searchValue: '',
        shop_id: false,
        totalGoods: false,
        totalPrice: false,
        totalFavorable: false,
        shopname: false,
        list: [],
        page: 0,
        searchKey: '',
        goodsList: [],
        goodsincar: [],
    },

    onLoad: function(options) {
        var that = this;
        util.wxRequest('wechat/Shop/getShopName', { shop_id: app.globalData.shop_id }, res => {
            that.setData({
                shopname: res.name
            })
        })

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
        this.setData({
            goodsincar: pagegoodsincar,
            shop_id: app.globalData.shop_id
        })
    },

    // 搜索框获取焦点
    searchFocus: function() {
        let recentSearch = wx.getStorageSync('recentSearch') || [];
        this.setData({
            recentSearch: recentSearch,
            searchHidden: true,
            noneHidden: true,
            search: false,
        })
    },

    // 搜索框输入事件
    chanage: function(e) {
        this.setData({
            searchHidden: true,
            searchKey: e.detail.value,
        })
    },

    //搜索失去焦点时
    getvalue: function(e) {
        this.setData({
            searchHidden: false,
        })
    },

    // 加入购物车
    addToCart: function(e) {
        var data = e.currentTarget.dataset.msg;

        var oldnum = this.data.totalGoods ? this.data.totalGoods : 0;
        var newnum = 1 * oldnum + 1;
        var numstr = newnum.toString();
        this.setData({
            num: numstr
        })
        var that = this;
        data.shopname = that.data.shopname;
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

        that.setData({
            goodsincar: newgoodsincar,
            totalGoods: totalGoods,
            totalPrice: totalPrice,
            totalFavorable: totalFavorable
        })
    },

    // 计算本门店的购物车信息，赋值到UI
    countInfoAtThisShop: function(pdtincar, that, id) {
        if (!pdtincar) {
            var arr = []
        } else {
            var arr = pdtincar.commodities;
        }
        var totalGoods = false;
        var totalPrice = false;
        var totalFavorable = false;
        if (arr) {
            var num = arr.length;
        } else {
            num = 0;
        }
        for (let i = 0; i < num; i++) {
            if (arr[i] && arr[i].shopid == id) {
                totalGoods = arr[i].account;
                totalPrice = arr[i].totalPrice;
                totalFavorable = arr[i].totalfav;
            }
        }
        that.setData({
            totalGoods: totalGoods,
            totalPrice: totalPrice,
            totalFavorable: totalFavorable
        })
    },

    // 点击键盘的搜索
    bindconfirm: function() {
        this.tapsearch()
    },

    // 点击搜索
    tapsearch: function() {
        this.setData({
            noneHidden: false,
            list: [],
            page: 0
        })
        this.loadData()
    },

    // 清楚缓存
    clearHistory: function() {
        wx.clearStorageSync('recentSearch')
        this.setData({
            recentSearch: []
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

    // 点击缓存搜索
    goSearch: function(e) {
        this.setData({
            searchKey: e.currentTarget.dataset.text,
            list: [],
            page: 0
        })
        this.loadData()
    },

    // 跳转商品详情
    toDetailTap: function(e) {
        wx.navigateTo({
            url: "/pages/gooddetail/gooddetail?id=" + e.currentTarget.dataset.id
        })
    },

    // 上拉加载
    onReachBottom: function() {
        this.loadData()
    },

    // 加载数据
    loadData: function() {
        let that = this;

        let keywords = that.data.searchKey
        if (keywords !== '') {
            let recentSearch = wx.getStorageSync('recentSearch') || [];
            if (!that.isStrInArray(keywords, recentSearch)) {
                recentSearch.unshift(that.data.searchKey);
                if (recentSearch.length > 5) {
                    recentSearch = recentSearch.slice(0, 4)
                }
                wx.setStorageSync('recentSearch', recentSearch)
                that.setData({
                    recentSearch: recentSearch,
                    page: 0,
                    list: []
                })
            }
        }

        let param = {
            keyword: that.data.searchKey,
            page: that.data.page + 1,
            shop_id: that.data.shop_id
        }

        util.wxRequest("wechat/Shop/getSearch", param, res => {
            let temp = that.data.list.concat(res.data.data)

            for (let i of temp) {
                i.price1 = i.price.split('.')[1]
                i.price0 = i.price.split('.')[0]
            }

            that.setData({
                list: temp,
                searchHidden: false,
                noneHidden: true,
                page: res.data.current_page,
            })

            if (that.data.list.length == 0) {
                that.setData({
                    searchHidden: false,
                    noneHidden: false
                })
            }

            res.data.data.length == 0 ? wx.showToast({
                title: '暂无更多数据',
                icon: "none"
            }) : ''

        })
    },

    // 判断是否某个元素 是否存在于一维数组（这个函数可用 includes() 方法用来判断一个数组是否包含一个指定的值，如果是返回 true，否则false。）
    isStrInArray: function(item, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == item) {
                return true;
            }
        }
        return false;
    },

})