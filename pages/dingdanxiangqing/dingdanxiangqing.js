const app = getApp()
const util = require('../../utils/util.js');
Page({
    data: {
        status: 0,
        id: '',
        act: false,
        info: {},
        goods: [],
        is_score: false,
        comment: '',
        stars: [{
                flag: 1,
                bgImg: app.globalData.api_host + "public/uploads/category/star.png",
                bgfImg: app.globalData.api_host + "public/uploads/category/fstar.png"
            },
            {
                flag: 1,
                bgImg: app.globalData.api_host + "public/uploads/category/star.png",
                bgfImg: app.globalData.api_host + "public/uploads/category/fstar.png"
            },
            {
                flag: 1,
                bgImg: app.globalData.api_host + "public/uploads/category/star.png",
                bgfImg: app.globalData.api_host + "public/uploads/category/fstar.png"
            },
            {
                flag: 1,
                bgImg: app.globalData.api_host + "public/uploads/category/star.png",
                bgfImg: app.globalData.api_host + "public/uploads/category/fstar.png"
            },
            {
                flag: 1,
                bgImg: app.globalData.api_host + "public/uploads/category/star.png",
                bgfImg: app.globalData.api_host + "public/uploads/category/fstar.png"
            }
        ],
        onAsync: false,
    },

    onLoad: function(e) {
        this.setData({ id: e.id, act: e.act })
        util.wxRequest("wechat/order/orderDetail", { id: e.id, }, res => {
            this.setData({ info: res.data, goods: res.data.order_detail })
            if (res.data.createTimes === false && res.data.status == 0) {
                this.setData({ act: 'pay_' })
                util.wxRequest("wechat/Order/cancelOrder", { id: e.id }, res => {})
            }
        })
    },

    // 拉起支付
    pay: function(e) {
        wx.showLoading({ titile: '加载中', mask: !0 })

        //调用订单创建接口
        util.wxRequest('wechat/order/payOrder', { id: e.currentTarget.dataset.id }, res => {
            if (res.code == 200) {
                // 发起支付
                wx.requestPayment({
                    timeStamp: res.data.pay.timeStamp + '',
                    nonceStr: res.data.pay.nonceStr,
                    package: res.data.pay.package,
                    signType: res.data.pay.signType,
                    paySign: res.data.pay.sign,
                    complete() {
                        wx.showLoading({ title: '查询订单状态', mask: true })
                        util.wxRequest('wechat/order/orderQuery', { id: res.data.id }, res => {
                            wx.hideLoading()
                            wx.navigateBack()
                        })
                    }
                })
            } else {
                wx.hideLoading()
                wx.showModal({
                    titile: '警告',
                    content: res.msg,
                    showCancel: false,
                    success: function(res) {
                        res.confirm ? wx.navigateBack() : ''
                    }
                })
            }
        })
    },

    //点击取消订单
    canclorder: function(e) {
        let param = { id: e.currentTarget.dataset.id }
        wx.showModal({
            confirmColor: '#39a336',
            title: '温馨提示',
            content: '好不容易选好，确定要取消吗？',
            success: res => {
                if (res.confirm) {
                    util.wxRequest("wechat/Order/cancelOrder", param, res => {
                        wx.showToast({ title: res.msg, icon: res.code == 200 ? 'success' : 'none' })
                        setTimeout(function() { wx.navigateBack() }, 1000)
                    })
                }
            },
        })
    },

    //点击去评价
    givewords: function(e) { this.setData({ is_score: true, id: e.currentTarget.dataset.id }) },

    // 监听评价输入
    bindinput: function(e) { this.setData({ comment: e.detail.value }) },

    // 打分
    grade: function(e) {
        let that = this
        let val = 0
        let temp_start = that.data.stars

        for (let i of temp_start) i.flag == 2 ? val++ : ''

        if (that.data.comment == '') {
            wx.showToast({ title: '请输入评价', icon: 'none' })
            return false
        }
        if (val == 0) {
            wx.showToast({ title: '请选择评分', icon: 'none' })
            return false
        }
        let param = {
            id: that.data.id,
            starlevel: val,
            comment: that.data.comment,
        }
        util.wxRequest("wechat/Order/evaluateOrder", param, res => {
            wx.showToast({ title: res.msg, icon: res.code == 200 ? 'success' : 'none' })

            if (res.code == 200) {
                setTimeout(() => { wx.navigateTo({ url: "/pages/myappraise/myappraise" }) }, 1000)
            } else {
                this.setData({ list: [], page: 0, is_refund: false })
                this.loadData()
            }
        })
    },

    // 取消打分
    grade_: function() { this.setData({ is_score: false }) },

    // 评分星级
    score: function(e) {
        var that = this
        for (var i = 0; i < that.data.stars.length; i++) {
            var allItem = 'stars[' + i + '].flag'
            that.setData({
                [allItem]: 1
            })
        }
        var index = e.currentTarget.dataset.index;
        for (var i = 0; i <= index; i++) {
            var item = 'stars[' + i + '].flag'
            that.setData({
                [item]: 2
            })
        }
    },
})