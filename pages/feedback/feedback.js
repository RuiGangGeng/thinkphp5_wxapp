// pages/feedback/feedback.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        flag: true,
        onAsync: false
    },

    //提交
    submit: function(res) {
        let that = this
        that.setData({
            onAsync: true
        })
        let content = res.detail.value.content;
        if (!content) {
            wx.showToast({
                title: '内容不能为空',
                icon: 'none',
            })
            that.setData({
                onAsync: false
            })
            return;
        }
        if (content.length > 150) {
            wx.showToast({
                title: '内容不可超过150字',
                icon: 'none'
            })
            that.setData({
                onAsync: false
            })
            return;
        }
        let url = 'wechat/User/addFeedback';
        let params = {
            uid: app.globalData.user.id,
            content: content,
        };
        util.wxRequest(url, params, data => {
            that.setData({
                flag: false,
            })
            setTimeout(function() {
                wx.navigateBack({})
            }, 1500)
        });
    },
})