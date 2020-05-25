const util = require('../../utils/util.js');
Page({
    data: {
        searchKey: '',
        shop_id: false,
        list: [],
        noSearch: false,
        page: 0,
        show_button: true
    },

    onLoad: function(e) {
        this.setData({
            shop_id: e.shop_id
        })
    },

    // 监听搜索框输入
    bindinput: function(e) {
        this.setData({
            searchKey: e.detail.value,
            show_button: true
        })
    },

    // 点击搜索
    search: function(e) {
        this.setData({
            page: 0,
            list: [],
            noSearch: false
        })
        this.loadData()
    },

    // 上架 下架 删除
    changegood: function(e) {
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
        }, res => {}, res => {
            that.setData({
                list: [],
                page: 0
            })
            that.loadData()
        });
    },

    // 上拉加载
    onReachBottom: function() {
        this.loadData()
    },

    // 加载数据
    loadData: function() {
        let that = this;

        let param = {
            keyword: that.data.searchKey,
            page: that.data.page + 1,
            shop_id: that.data.shop_id
        }

        util.wxRequest("wechat/Shop/getSearch", param, res => {
            let temp = that.data.list.concat(res.data.data)

            that.setData({
                page: res.data.current_page,
                list: temp
            })

            if (that.data.list.length == 0) {
                that.setData({
                    noSearch: true
                })
            }

            res.data.data.length == 0 ? wx.showToast({
                title: '暂无更多数据',
                icon: "none"
            }) : ''

        })
    },

    bindfocus: function(e) {
        this.setData({
            show_button: true
        })
    },

    bindblur: function(e) {
        this.setData({
            show_button: true
        })
    }

})