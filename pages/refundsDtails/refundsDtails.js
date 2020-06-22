const util = require('../../utils/util.js');
const app = getApp();
Page({

    data: {
        info: [],
        goods: [],
        c:false
    },

    onLoad: function (e) {
        util.wxRequest("wechat/Order/getRefund", {
            id: e.id
        }, res => {
            this.setData({
                info: res.data,
                goods: res.data.order_detail
            })
            let s = res.data.order_detail
            let c = 0;
            for (let i of s) {
                c += i.number * i.price
            }
            this.setData({ c: (c - Number(res.data.price)).toFixed(2) })
        })
    },

    goFeedback: function () {
        wx.navigateTo({
            url: '/pages/feedback/feedback'
        })
    }
})