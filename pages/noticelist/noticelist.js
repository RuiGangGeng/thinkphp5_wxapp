const app = getApp()
const util = require('../../utils/util.js')
Page({
    data: {
        shop_id: false,
        list: [],
    },

    onLoad: function(e) {
        this.setData({ shop_id: e.shop_id })
    },

    onShow: function() {
        let that = this

        wx.showLoading()
        setTimeout(function() { wx.hideLoading() }, 2000)

        // 请求公告
        util.wxRequest('wechat/Shop/getNotices', { shop_id: that.data.shop_id }, res => {
            res.code == 200 && function() {
                that.setData({ list: res.data })
                wx.hideLoading()
            }()
        })
    },

    // 删除公告
    categoryDel: function(e) {
        let that = this
        wx.showModal({
            title: '提示',
            content: '您确定要删除该公告吗？',
            success: function(res) {
                res.confirm && util.wxRequest('wechat/Shop/noticeDel', { id: e.currentTarget.dataset.id }, res => {
                    wx.showToast({ title: res.msg, icon: res.code == 200 ? 'success' : "none" })
                }, res => {}, res => { setTimeout(function() { that.onShow() }, 1000) })
            }
        });
    },
})