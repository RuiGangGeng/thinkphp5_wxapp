const app = getApp()
const util = require('../../utils/util.js')
Page({
    data: {
        statusType: [{
            name: "全部",
            status: 'all'
        }, {
            name: "待退款",
            status: '6'
        }, {
            name: "退款成功",
            status: '7'
        }, {
            name: "拒绝退款",
            status: '8'
        }],
        currentType: 0,
        list: [],
        page: 0,
    },

    // tab切换
    statusTap: function(e) {
        this.setData({
            currentType: e.currentTarget.dataset.index,
            list: [],
            page: 0
        })
        this.loadData()
    },

    onShow: function() {
        this.setData({
            list: [],
            page: 0,
        })
        this.loadData()
    },

    // 上拉加载
    onReachBottom: function() {
        this.loadData()
    },

    // 加载数据
    loadData: function() {
        let that = this

        wx.showLoading({ title: '加载中' })
        setTimeout(function() { wx.hideLoading() }, 3000)

        let param = {
            status: this.data.statusType[this.data.currentType].status,
            page: that.data.page + 1,
            id: app.globalData.user.id
        }

        Object.assign(param, that.data.param)

        util.wxRequest("wechat/Order/getRefunds", param, res => {
            let temp = that.data.list.concat(res.data.data)

            that.setData({
                page: res.data.current_page,
                list: temp
            })
            wx.hideLoading()
        })
    },
})