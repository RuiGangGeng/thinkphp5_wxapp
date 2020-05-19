// pages/shopindex/shopindex.js
const app = getApp()
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopdata: null,
    notice: null,
    swiper: [{
        img: '/image/shops/shoplogo.jpg'
      },
      {
        img: '/image/shops/shoplogo.jpg'
      },
      {
        img: '/image/shops/shoplogo.jpg'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取门店信息
    util.wxRequest('wechat/Shop/getShopInfo', {
        shop_id: options.shopid
      },
      res => {
        var shopdata = res.data;
        wx.setNavigationBarTitle({
          title: shopdata.name,
        })
        this.setData({
          shopdata: shopdata,
          shopname: shopdata.name
        })
      })

    //获取门店公告
    util.wxRequest('wechat/Shop/getNotice', {
        shop_id: options.shopid
      },
      res => {
        var notice = res.data.total > 0 ? res.data.data : null;
        this.setData({
          notice: notice,
          imgBaseUrl: app.globalData.api_host
        })
      }

    )
    this.setData({
      shopid: options.shopid
    })
  },

  //点击分类导航事件
  navito: function (e) {
    var cateid = e.currentTarget.dataset.cateid;
    wx.navigateTo({
      url: '/pages/goodcate/goodcate?cateid=' + cateid + '&shop_id=' + this.data.shopid + '&shopname=' + this.data.shopname,
    })
  },

  //点击店内公告
  gonotice: function (e) {
    var noticeid = e.currentTarget.dataset.cateid;
    wx.navigateTo({
      url: '/pages/noticedel/noticedel?noticeid=' + noticeid,
    })
  },

})