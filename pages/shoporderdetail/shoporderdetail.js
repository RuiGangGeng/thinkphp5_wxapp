const util = require('../../utils/util.js');
const app = getApp();
Page({

  data: {
    info: [],
    goods:[]
  },

  onLoad: function (e) {
    util.wxRequest("wechat/shop/get_order", {
      id: e.id,
    }, res => {
      this.setData({
        info: res.data,
        goods:res.data.order_detail 
      })
    })
  }
})