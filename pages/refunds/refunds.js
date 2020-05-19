const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    statusType: [{
      name: "全部",
      status: 'all'
    }, {
      name: "待退款",
      status: '6'
    }, {
      name: "退款成功",
      status: '7'
    }, {
      name: "拒绝退款",
      status: '8'
    }],
    currentType: 0,
    list: [],
    page: 0,
  },
  
  // tab切换
  statusTap: function (e) {
    this.setData({
      currentType: e.currentTarget.dataset.index,
      list: [],
      page: 0
    })
    this.loadData()
  },

  onShow: function () {
    this.setData({
      list: [],
      page: 0,
    })
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
      status: this.data.statusType[this.data.currentType].status,
      page: that.data.page + 1,
      id: app.globalData.user.id
    }

    Object.assign(param, that.data.param);

    util.wxRequest("wechat/Order/getRefunds", param, res => {
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