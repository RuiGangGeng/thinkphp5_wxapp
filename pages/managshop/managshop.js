const util = require('../../utils/util.js');
Page({
    data: {
        shop_id: null,
        shop_info: null,
        categorys: [],
        category_index: null,
        coupons: [],
        list: [],
        page: 0,
        list_rows: 5,
        select: 1,
        param: {
            status: 1,
        },
    },

    onLoad: function (options) {
        let that = this;

        // 获取屏幕宽度 
        wx.getSystemInfo({
            success(res) {
                that.setData({
                    screenWidth: 750 / res.screenWidth
                })
            }
        })

        // 获取商家ID
        that.setData({
            shop_id: options.shop_id
        })

        // 获取商家基本信息
        util.wxRequest("wechat/Shop/getShopInfo", {
            shop_id: options.shop_id
        }, res => {
            that.setData({
                shop_info: res.data
            })
        })

        // 获取分类
        util.wxRequest("wechat/Shop/get_category", {}, res => {
            that.setData({
                categorys: res.data
            })
        })

        // 获取满减信息
        util.wxRequest("wechat/Shop/getCouponInfo", {
            shop_id: options.shop_id
        }, res => {
            that.setData({
                coupons: res.data
            })
        })
    },

    onShow: function () {
        this.setData({
            list: [],
            page: 0
        })
        this.loadData();
    },

    // 点击筛选条件
    changeSelect: function (e) {
        let that = this
        let status = e.currentTarget.dataset.status
        let param = that.data.param
        if (status < 2) {
            param.status = status * 1
            delete param.price
        } else {
            param.price = "price"
            delete param.status
        }
        that.setData({
            select: status,
            param: param,
            page: 0,
            list: []
        })
        that.loadData();
    },

    // 上架 下架 删除
    changegood: function (e) {
        let that = this
        let act = e.currentTarget.dataset.act
        let id = e.currentTarget.dataset.id
        let param = {
            id: id
        }
        util.wxRequest("wechat/shop/" + act, param, res => {
            if (res.code == 200) {
                wx.showToast({
                    title: res.msg,
                })
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: "none"
                })
            }
        }, res => { }, res => {
            that.setData({
                list: [],
                page: 0
            })
            that.loadData()
        });
    },

    // 点击分类
    categoryClick: function (e) {
        let that = this
        let id = e.currentTarget.dataset.id
        let param = that.data.param
        param.category_id = id
        that.setData({
            category_index: id,
            param: param,
            page: 0,
            list: []
        })
        that.loadData();
    },

    // 加载数据
    loadData: function () {
        let that = this;
        let param = {
            shop_id: that.data.shop_id,
            page: that.data.page + 1,
        }
        Object.assign(param, that.data.param);
        util.wxRequest("wechat/Shop/get_goods", param, res => {
            let temp = that.data.list.concat(res.data.data)
            that.setData({
                page: res.data.current_page,
                list: temp
            })
            res.data.data.length == 0 ? wx.showToast({
                title: '暂无更多数据',
                icon: "none"
            }) : ''
        })
    },

    // 点击搜索
    bindfocus: function (e) {
        wx.navigateTo({
            url: '/pages/managshopSearch/managshopSearch?shop_id=' + this.data.shop_id,
        })
    }
})