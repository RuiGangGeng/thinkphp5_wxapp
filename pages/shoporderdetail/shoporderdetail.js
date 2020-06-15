const util = require('../../utils/util.js');
const app = getApp();
Page({

    data: {
        info: [],
        goods: [],
        coupon: "0.00",
        all: "0.00"
    },

    onLoad: function(e) {
        util.wxRequest("wechat/shop/get_order", {
            id: e.id,
        }, res => {
            let all = 0
            for (let i of res.data.order_detail) {
                all += Number(i.price) * i.number
            }
            let coupon = Number(res.data.price) - all
            this.setData({
                info: res.data,
                goods: res.data.order_detail,
                all: all.toFixed(2),
                coupon: coupon.toFixed(2)
            })
        })
    }
})