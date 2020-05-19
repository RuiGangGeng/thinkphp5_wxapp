const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    info: {},
    goods: [],
    stars: [{
        flag: 1,
        bgImg: "/image/star.png",
        bgfImg: "/image/fstar.png"
      },
      {
        flag: 1,
        bgImg: "/image/star.png",
        bgfImg: "/image/fstar.png"
      },
      {
        flag: 1,
        bgImg: "/image/star.png",
        bgfImg: "/image/fstar.png"
      },
      {
        flag: 1,
        bgImg: "/image/star.png",
        bgfImg: "/image/fstar.png"
      },
      {
        flag: 1,
        bgImg: "/image/star.png",
        bgfImg: "/image/fstar.png"
      }
    ],
  },

  onLoad: function (e) {
    let that = this
    util.wxRequest("wechat/order/orderDetail", {
      id: e.id,
    }, res => {
      let s = that.data.stars
      for (let i = 0; i < res.data.starlevel; i++) {
        s[i].flag=2
      }
      this.setData({
        stars:s,
        info: res.data,
        goods: res.data.order_detail
      })
    })
  },
})