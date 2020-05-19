const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    statusType: [{
      name: "全部",
      status: 'all'
    }, {
      name: "未接单",
      status: '1'
    }, {
      name: "配送中",
      status: '3'
    }, {
      name: "已完成",
      status: '5'
    }, {
      name: "退款",
      status: '6'
    }],
    currentType: 0,
    list: [],
    page: 0,
    param: {},
  },

  onLoad: function (e) {
    this.setData({
      'param.shop_id': e.shop_id
    })
    this.loadData()
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

  // 点击跳转订单详情页面
  order_details: function (e) {
    wx.navigateTo({
      url: '/pages/shoporderdetail/shoporderdetail?id=' + e.currentTarget.dataset.id,
    })
  },

  // 点击 退单
  order_back: function (e) {
    let param = {
      id: e.currentTarget.dataset.id
    }
    util.wxRequest("wechat/shop/back_order", param, res => {
      wx.showToast({
        title: res.msg,
        icon: res.code == 200 ? "success" : "none"
      })
      this.setData({
        list: [],
        page: 0
      })
      this.loadData()
    })
  },

  // 点击 接单
  order_confirm: function (e) {
    let param = {
      id: e.currentTarget.dataset.id
    }
    util.wxRequest("wechat/shop/accept_order", param, res => {
      wx.showToast({
        title: res.msg,
        icon: res.code == 200 ? "success" : "none"
      })
      this.setData({
        list: [],
        page: 0
      })
      this.loadData()
    })
  },

  // 点击 发货
  send_order: function (e) {
    let param = {
      id: e.currentTarget.dataset.id
    }
    util.wxRequest("wechat/shop/send_order", param, res => {
      wx.showToast({
        title: res.msg,
        icon: res.code == 200 ? "success" : "none"
      })
      this.setData({
        list: [],
        page: 0
      })
      this.loadData()
    })
  },

  // 点击 退款
  agree_order: function (e) {
    let param = {
      id: e.currentTarget.dataset.id
    }
    util.wxRequest("wechat/shop/agree_order", param, res => {
      wx.showToast({
        title: res.msg,
        icon: res.code == 200 ? "success" : "none"
      })
      this.setData({
        list: [],
        page: 0
      })
      this.loadData()
    })
  },

  // 点击 拒绝
  refuse_order: function (e) {
    let param = {
      id: e.currentTarget.dataset.id
    }
    util.wxRequest("wechat/shop/refuse_order", param, res => {
      wx.showToast({
        title: res.msg,
        icon: res.code == 200 ? "success" : "none"
      })
      this.setData({
        list: [],
        page: 0
      })
      this.loadData()
    })
  },

  // 点击 拨打电话
  makeCall: function (e) {
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    });
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
      shop_id: this.data.param.shop_id,
    }

    Object.assign(param, that.data.param);

    util.wxRequest("wechat/shop/get_orders", param, res => {
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