// pages/noticedel/noticedel.js
var WxParse = require('../../wxParse/wxParse.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({
    data: {
        notice: ''
    },

    onLoad: function(options) {
        var that = this;
        util.wxRequest('wechat/shop/getNoticeDetail', { id: options.noticeid }, res => {
            var article = res.data.content;
            WxParse.wxParse('article', 'html', article, that, 5);
            that.setData({ notice: res.data });
            /*** WxParse.wxParse(bindName , type, data, target,imagePadding)
             * 1.bindName绑定的数据名(必填)
             * 2.type可以为html或者md(必填)
             * 3.data为传入的具体数据(必填)
             * 4.target为Page对象,一般为this(必填)
             * 5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选)*/
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