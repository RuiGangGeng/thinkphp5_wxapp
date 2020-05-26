const util = require('../../utils/util.js');
const app = getApp();
Page({

    data: {
        info: [],
        goods: []
    },

    onLoad: function(e) {
        util.wxRequest("wechat/Order/getRefund", {
            id: e.id,
        }, res => {
            this.setData({
                info: res.data,
                goods: res.data.order_detail
            })
        })
    },
    goFeedback: function() {
        wx.navigateTo({
            url: '/pages/feedback/feedback',
        })
    }
})