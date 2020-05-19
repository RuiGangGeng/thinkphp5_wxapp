const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    info: {}
  },

  onLoad: function (options) {
    let that = this
    // 获取商家基本信息
    util.wxRequest("wechat/Shop/getShopInfo", {
      shop_id: options.shop_id
    }, res => {
      that.setData({
        info: res.data
      })
    })
  },
})