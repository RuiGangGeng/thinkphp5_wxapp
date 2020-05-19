const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    list: [],
    page: 0,
  },
  
  onLoad: function () {
    this.loadData()
  },

  // 上拉加载
  onReachBottom: function () {
    this.loadData()
  },

  // 加载数据
  loadData: function () {
    let that = this;

    let param = {
      page: that.data.page + 1,
      id: app.globalData.user.id
    }

    Object.assign(param, that.data.param);

    util.wxRequest("wechat/Order/getEvaluates", param, res => {
      let temp = that.data.list.concat(res.data.data)

      that.setData({
        page: res.data.current_page,
        list: temp
      })

      res.data.data.length == 0 ? wx.showToast({
        title: '暂无更多数据',
        icon: "none"
      }) : ''
    })
  },
})