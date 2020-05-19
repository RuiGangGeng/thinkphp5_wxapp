const util = require('../../utils/util.js');
const app = getApp();
Page({

  data: {
    shop: {},
    order_0:false,
    order_1:false,
    order_3:false,
    order_4:false,
  },

  onShow: function () {

    this.setData({
      order_0:false,
      order_1:false,
      order_3:false,
      order_4:false,
    })
    util.wxRequest("wechat/user/getMyPages", {
      id: app.globalData.user.id,
    }, res => {
      for(let i of res.data.order){
        i.status == 0 ?this.setData({order_0:i.number}):false
        i.status == 1||i.status == 2 ?this.setData({order_1:i.number}):false
        i.status == 3 ?this.setData({order_3:i.number}):false
        i.status == 4 ?this.setData({order_4:i.number}):false
      }
      this.setData({
        shop: res.data.shop,
      })
    })
  },
})