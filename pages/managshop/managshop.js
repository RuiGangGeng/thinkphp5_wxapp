const util = require('../../utils/util.js');
Page({
    data: {
        shop_id: null,
        shop_info: null,
        categories: [],
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

    onLoad: function(options) {
        let that = this;

        // 获取商家ID
        that.setData({
            shop_id: options.shop_id
        })

        // 获取商家基本信息
        util.wxRequest("wechat/Shop/getShopInfo", { shop_id: options.shop_id }, res => {
            if (res.code == 200) {
                that.setData({
                    shop_info: res.data
                })
            }
        })

        // 获取满减信息
        util.wxRequest("wechat/Shop/getCouponInfo", { shop_id: options.shop_id }, res => {
            if (res.code == 200) {
                that.setData({
                    coupons: res.data
                })
            }
        })
    },

    onShow: function() {
        let that = this;
        // 获取分类
        util.wxRequest("wechat/Shop/getCategories", { shop_id: that.data.shop_id }, res => {
            if (res.code == 200) {
                that.setData({
                    categories: res.data
                })
            }
        })

        that.setData({
            list: [],
            page: 0
        })
        that.loadData();
    },

    // 点击筛选条件
    changeSelect: function(e) {
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

    // 跳转到编辑页面
    navEdit: function(e) {
        return
        wx.navigateTo({
            url: '/pages/addpdt/addpdt?shop_id=' + this.data.shop_id + '&id=' + e.currentTarget.dataset.id
        })
    },

    // 上架 下架 删除
    changegood: function(e) {
        let that = this
        let act = e.currentTarget.dataset.act

        util.wxRequest("wechat/shop/" + act, { id: e.currentTarget.dataset.id }, res => {
            wx.showToast({
                title: res.msg,
                icon: res.code == 200 ? 'success' : "none"
            })
        }, res => {}, res => {
            that.setData({
                list: [],
                page: 0
            })
            that.loadData()
        });
    },

    // 点击分类
    categoryClick: function(e) {
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

    categoryDel: function (e) {
      let that = this
      wx.showModal({
        title: '提示',
        content: '您确定要删除该分类吗？',
        success: function (res) {
          res.confirm && util.wxRequest('wechat/Shop/categoryDel', { id: e.currentTarget.dataset.id }, res => {
            wx.showToast({
              title: res.msg,
              icon: res.code == 200 ? 'success' : "none"
            })
          }, res => { }, res => {
            that.onShow();
          })
        }
      });
    },

    // 加载数据
    loadData: function() {
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
    bindfocus: function(e) {
        wx.navigateTo({
            url: '/pages/managshopSearch/managshopSearch?shop_id=' + this.data.shop_id,
        })
    }
})