const app = getApp()
const util = require('../../utils/util.js');
Page({

  data: {
    good: {},
  },

  onLoad: function (e) {
    util.wxRequest("wechat/shop/get_good", {
      id: e.id,
    }, res => {
      if (res.code == 200) {
        res.data.price0 = res.data.price.split('.')[0]
        res.data.price1 = res.data.price.split('.')[1]
      }
      this.setData({
        good: res.data,
      })
    })
  },
})