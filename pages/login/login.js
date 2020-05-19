// pages/login/login.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  userInfoHandler: function (e) {
    if (e.detail.errMsg == "getUserInfo:ok") {
      wx.login({
        success: res => {
          if (res.code) {
            var url = app.globalData.domain + 'User/getUser';
            var params = {
              code: res.code,
              nickName: e.detail.userInfo.nickName,
              avatarUrl: e.detail.userInfo.avatarUrl,
            };
            util.wxRequest(url, params, data => {
              wx.setStorageSync("user", data);
              app.data.user = data;
              console.log(app.data.user)
              wx.redirectTo({
                url: '/pages/addressadd/addressadd',
              })
            }, data => { }, data => { });
          } else {
            console.log('error');
          }
        }
      });
    }else{
      wx.showToast({
        title: '需要获取用户信息',
        icon: "none",
      })
      return false;
    }
  },
})