const util = require('../../utils/util.js');
const app = getApp();
import Storage from '../../utils/storage';
var storage = new Storage();
Page({

    data: {
        totalGoods: false,
        totalPrice: false,
        totalFavorable: false,
        shopid: false,
        shopname: false,
        select: 0,
        categories: [{
                id: 1,
                name: '新鲜水果'
            },
            {
                id: 2,
                name: '时令果蔬'
            },
            {
                id: 3,
                name: '肉禽蛋品'
            },
            {
                id: 4,
                name: '米面粮油'
            },
            {
                id: 5,
                name: '海鲜水产'
            },
            {
                id: 6,
                name: '休闲零食'
            },
            {
                id: 7,
                name: '日用百货'
            },
            {
                id: 8,
                name: '其他商品'
            }
        ],
        goodsList: [],
        goodsincar: [],
        page: 0,
    },

    onLoad: function (options) {
        this.setData({
            shopname: options.shopname
        })

        app.globalData.shop_id = options.shop_id;
        var shopid = options.shop_id
        var pdtincar = wx.getStorageSync('pdtincar');
        if (pdtincar) {
            var pagearr = pdtincar.commodities;
            var pagegoodsincar = [];
            pagearr.forEach(function (item, index) {
                if (item.shopid == options.shop_id) {
                    pagegoodsincar = item.commodity
                }
            })
        }

        var that = this;
        that.countInfoAtThisShop(pdtincar, that, options.shop_id)
        that.setData({
            goodsincar: pagegoodsincar,
            select: options.cateid - 1,
            shopid: shopid,
        })
        that.loadData()
    },

    /**
     * 计算本门店的购物车信息，赋值到UI
     * @pdtincar 购物车缓存
     * @that
     * @id 门店id
     * @return 当前门店商品数量，合计金额，合计优惠
     */
    countInfoAtThisShop: function (pdtincar, that, id) {
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
            if (arr[i].shopid == id) {
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

    // 点击搜索  组件事件没有捕获到
    gosearch: function () {
        app.globalData.shop_id = this.data.shopid
        wx.navigateTo({
            url: '/pages/search/search'
        })
    },

    // 切换分类
    categoryClick: function (event) {
        this.setData({
            select: event.target.id - 1,
            goodsList: [],
            page: 0
        })
        this.loadData()
    },

    // 查看商品详情
    gooddetail: e => {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/gooddetail/gooddetail?id=' + id,
        })
    },

    // 加入购物车
    addToCart: function (e) {
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
            newgoodsincar.forEach(function (item, index) {
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

    // 点击去结算
    godoorder: function () {
        wx.removeStorageSync('makeorder');
        //设置当前门店购物车商品为选中状态
        var shop_id = this.data.shopid;
        var arr = wx.getStorageSync('pdtincar').commodities;
        arr.forEach(function (item, index) {
            if (item.shopid == shop_id) {
                item.selected = true;
                (item.commodity).forEach(function (item, index) {
                    item.selected = true;
                })
            }
        })
        wx.setStorageSync('makeorder', arr)
        wx.setStorageSync('shops', app.globalData.shops)
        wx.navigateTo({
            url: '/pages/doorder/doorder',
        })
    },

    // 上拉加载
    onReachBottom: function () {
        this.loadData()
    },

    // 加载数据
    loadData: function () {
        let that = this;

        let param = {
            status: 1,
            page: that.data.page + 1,
            shop_id: that.data.shopid,
            category_id: that.data.select + 1
        }

        Object.assign(param, that.data.param);

        util.wxRequest("wechat/Shop/get_goods", param, res => {
            let temp = that.data.goodsList.concat(res.data.data)

            for(let i of temp){
                i.price1 = i.price.split('.')[1]
                i.price0  = i.price.split('.')[0]
            }

            that.setData({
                page: res.data.current_page,
                goodsList: temp
            })

            res.data.data.length == 0 ? wx.showToast({
                title: '暂无更多数据',
                icon: "none"
            }) : ''
        })
    },

})