var WxParse = require('../../wxParse/wxParse.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({
    data: {
        notice: ''
    },

    onLoad: function(options) {
        var that = this
        util.wxRequest('wechat/shop/getNoticeDetail', { id: options.noticeid }, res => {
            that.setData({ notice: res.data })
        });
    },

    // 分享
    onShareAppMessage: function() {
        let that = this;
        return {
            title: that.data.notice.title,
            path: 'pages/gooddetail/gooddetail?noticeid=' + that.data.notice.id, // 路径，传递参数到指定页面。
            imageUrl: that.data.good.detailimg, // 分享的封面图
            success: function(res) {
                wx.showToast({
                    title: '转发成功',
                })
            },
            fail: function(res) {
                wx.showToast({
                    title: '转发失败',
                    icon: "none"
                })
            }
        }
    },
})