// pages/settled/settled.js
const app = getApp();
const util = require('../../utils/util.js');
const phoneRexp = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag:false,
    phonetrue: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //提交
  formSubmit: function (res) {
    let that = this;
    let value = res.detail.value;
    value.uid = app.data.user.id;
    if (!value.name) {
      wx.showToast({
        title: '请输入店铺名称',
        icon: 'none',
      })
      return;
    } else if (value.name.length > 32) {
      wx.showToast({
        title: '店铺名称超过32字',
        icon: 'none',
      })
      return;
    }
    if (!value.community) {
      wx.showToast({
        title: '请选择店铺所在地址',
        icon: 'none',
      })
      return;
    }
    if (!value.address) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none',
      })
      return;
    } else if (value.address.length > 50) {
      wx.showToast({
        title: '详细地址超过50字',
        icon: 'none',
      })
      return;
    }
    if (!value.contact) {
      wx.showToast({
        title: '请输入联系人',
        icon: 'none',
      })
      return;
    } else if (value.contact.length > 6) {
      wx.showToast({
        title: '联系人超过字',
        icon: 'none',
      })
      return;
    }
    if (!phoneRexp.test(value.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
      })
      return;
    }
    let url = app.globalData.domain + 'User/addJoin';
    let params = {
      value: value
    };
    util.wxRequest(url, params, data => {
      wx.showToast({
        title: '提交成功',
        icon: 'success',
      });
      that.setData({
        flag:true
      })
    }, data => { }, data => { });
  },
  openConfirm: function () {
    wx.showModal({
      content: '检测到您没打开京小美的定位权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        //点击“确认”时打开设置页面
        if (res.confirm) {
          wx.openSetting({
            success: (res) => { }
          })
        } else {
        }
      }
    });
  },
  //选择地理定位
  chooseMyLocation: function () {
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          that.openConfirm()
        }
      }
    })
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          region: res.address,
          lat: res.latitude,
          lng: res.longitude
        })
      },
    })
  },
})