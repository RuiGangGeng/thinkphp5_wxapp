const app = getApp()
const util = require('../../utils/util.js')
Page({
    data: {
        id: 0,
        list: [],
        page: 0,
        statusType: [{
            name: "全部",
            status: 'all'
        }, {
            name: "待付款",
            status: '0'
        }, {
            name: "待发货",
            status: '1'
        }, {
            name: "待收货",
            status: '3'
        }, {
            name: "待评价",
            status: '4'
        }],
        currentType: 0,
        is_score: false, // 是否显示打分框
        // 打分框评价星星
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
        comment: '', // 评价内容
        is_refund: false, // 是否显示申请退款框
        refund_msg: false, // 退款申请内容

    },

    onLoad: function(e) {
        let currentType = e.status ? e.status : 0
        this.setData({
            currentType: currentType
        })
    },

    onShow: function() {
        this.setData({
            list: [],
            page: 0,
            is_refund: false,
            is_score: !1,
        })
        this.loadData()
    },

    // tab切换
    statusTap: function(e) {
        this.setData({
            currentType: e.currentTarget.dataset.index,
            list: [],
            page: 0
        })
        this.loadData()
    },

    // 校验是否可以继续支付 未超时跳转页面
    paycontinue: function(e) {
        let that = this
        let param = {
            id: e.currentTarget.dataset.id
        }
        util.wxRequest("wechat/Order/payContinue", param, res => {
            if (res.code == 200) {
                wx.navigateTo({
                    url: '/pages/dingdanxiangqing/dingdanxiangqing?act=pay&id=' + e.currentTarget.dataset.id,
                })
            } else {
                wx.showModal({
                    title: '支付失败',
                    content: '超时未付款，系统已将订单关闭',
                    showCancel: false,
                    success: function() {
                        that.setData({
                            list: [],
                            page: 0
                        })
                        that.loadData()
                    }
                })
            }
        })
    },

    // 点击跳转订单详情
    dingdanxiangqing: function(e) {
        wx.navigateTo({
            url: '/pages/dingdanxiangqing/dingdanxiangqing?act=detail&id=' + e.currentTarget.dataset.id,
        })
    },




    // 点击取消订单
    canclorder: function(e) {
        let param = {
            id: e.currentTarget.dataset.id
        }
        wx.showModal({
            confirmColor: '#39a336',
            title: '温馨提示',
            content: '好不容易选好，确定要取消吗？',
            success: res => {
                if (res.confirm) {
                    util.wxRequest("wechat/Order/cancelOrder", param, res => {
                        wx.showToast({
                            title: res.msg,
                            icon: res.code == 200 ? 'success' : 'none'
                        })
                        this.setData({
                            list: [],
                            page: 0
                        })
                        this.loadData()
                    })
                }
            },
        })
    },

    // 点击确认收货
    conreceipt: function(e) {
        let param = {
            id: e.currentTarget.dataset.id
        }
        wx.showModal({
            confirmColor: '#39a336',
            title: '温馨提示',
            content: '收货商品无误，确认已收货吗？',
            success: res => {
                if (res.confirm) {
                    util.wxRequest("wechat/Order/confirmReceiptGoods", param, res => {
                        wx.showToast({
                            title: res.msg,
                            icon: res.code == 200 ? 'success' : 'none'
                        })
                        this.setData({
                            currentType: 4,
                            list: [],
                            page: 0
                        })
                        this.loadData()
                    })
                }
            },
        })
    },



    // 点击弹出申请退款框
    askpayback: function(e) {
        let that = this
        wx.showModal({
            confirmColor: '#39a336',
            title: '温馨提示',
            content: '好不容易选好，确定要向商家申请退款吗？',
            success: res => {
                if (res.confirm) {
                    that.setData({
                        is_refund: true,
                        id: e.currentTarget.dataset.id
                    })
                }
            },
        })
    },

    // 提交退款申请
    onAskPayBack: function(e) {
        let that = this

        if (that.data.refund_msg == '') {
            wx.showToast({
                title: '请输入退款理由',
                icon: 'none'
            })
            return false
        }

        let param = {
            id: that.data.id,
            refund_msg: that.data.refund_msg
        }

        util.wxRequest("wechat/Order/askForRefund", param, res => {
            wx.showToast({
                title: res.msg,
                icon: res.code == 200 ? 'success' : 'none'
            })
            if (res.code == 200) {
                setTimeout(() => { wx.navigateTo({ url: "/pages/refunds/refunds" }) }, 1000)
            } else {
                this.setData({
                    list: [],
                    page: 0,
                    is_refund: false
                })
                this.loadData()
            }
        })
    },




    // 点击弹出评价框
    givewords: function(e) {
        this.setData({
            is_score: true,
            id: e.currentTarget.dataset.id
        })
    },

    // 评分星级
    score: function(e) {
        var that = this
        for (var i = 0; i < that.data.stars.length; i++) {
            var allItem = 'stars[' + i + '].flag'
            that.setData({
                [allItem]: 1
            })
        }
        var index = e.currentTarget.dataset.index
        for (var i = 0; i <= index; i++) {
            var item = 'stars[' + i + '].flag'
            that.setData({
                [item]: 2
            })
        }
    },

    // 监听评价和退款输入
    bindinput: function(e) {
        this.setData({
            comment: e.detail.value,
            refund_msg: e.detail.value,
        })
    },

    // 取消评价和申请退款
    grade_: function() {
        this.setData({
            is_score: false,
            is_refund: false,
            comment: '',
            refund_msg: '',
        })
    },

    // 提交评价打分
    grade: function(e) {
        let that = this
        let val = 0
        let temp_start = that.data.stars
        for (let i of temp_start) {
            i.flag == 2 ? val++ : ''
        }
        if (that.data.comment == '') {
            wx.showToast({
                title: '请输入评价',
                icon: 'none'
            })
            return false
        }
        if (val == 0) {
            wx.showToast({
                title: '请选择评分',
                icon: 'none'
            })
            return false
        }
        let param = {
            id: that.data.id,
            starlevel: val,
            comment: that.data.comment,
        }
        util.wxRequest("wechat/Order/evaluateOrder", param, res => {
            wx.showToast({
                title: res.msg,
                icon: res.code == 200 ? 'success' : 'none'
            })
            if (res.code == 200) {
                setTimeout(() => { wx.navigateTo({ url: "/pages/myappraise/myappraise" }) }, 1000)
            } else {
                that.setData({
                    list: [],
                    page: 0,
                    is_score: !1,
                    comment: '',
                    refund_msg: '',
                })
                that.loadData()
            }
        })
    },



    // 上拉加载
    onReachBottom: function() {
        this.loadData()
    },

    // 加载数据
    loadData: function() {
        let that = this

        wx.showLoading({ title: '加载中' })
        setTimeout(function() { wx.hideLoading() }, 3000)

        let param = {
            status: this.data.statusType[this.data.currentType].status,
            page: that.data.page + 1,
            id: app.globalData.user.id
        }

        Object.assign(param, that.data.param)

        util.wxRequest("wechat/Order/waitPayOrders", param, res => {
            let temp = that.data.list.concat(res.data.data)

            that.setData({
                page: res.data.current_page,
                list: temp
            })
            wx.hideLoading()
        })
    },
})