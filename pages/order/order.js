const app = getApp()
const util = require('../../utils/util.js');
Page({
    data: {
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
        stars: [{
                flag: 1,
                bgImg: app.globalData.api_host+"public/uploads/category/star.png",
                bgfImg: app.globalData.api_host+"public/uploads/category/fstar.png"
            },
            {
                flag: 1,
                bgImg: app.globalData.api_host+"public/uploads/category/star.png",
                bgfImg: app.globalData.api_host+"public/uploads/category/fstar.png"
            },
            {
                flag: 1,
                bgImg: app.globalData.api_host+"public/uploads/category/star.png",
                bgfImg: app.globalData.api_host+"public/uploads/category/fstar.png"
            },
            {
                flag: 1,
                bgImg: app.globalData.api_host+"public/uploads/category/star.png",
                bgfImg: app.globalData.api_host+"public/uploads/category/fstar.png"
            },
            {
                flag: 1,
                bgImg: app.globalData.api_host+"public/uploads/category/star.png",
                bgfImg: app.globalData.api_host+"public/uploads/category/fstar.png"
            }
        ],
        currentType: 0,
        list: [],
        page: 0,
        is_score: false,
        id: 0,
        comment: ''
    },

    onLoad: function (e) {
        let currentType = e.status ? e.status : 0
        this.setData({
            currentType: currentType
        })
    },

    onShow: function () {
        this.setData({
            list: [],
            page: 0,
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

    // 校验是否可以继续支付 未超时跳转页面
    paycontinue: function (e) {
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
                    success: function () {
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
    dingdanxiangqing: function (e) {
        wx.navigateTo({
            url: '/pages/dingdanxiangqing/dingdanxiangqing?act=detail&id=' + e.currentTarget.dataset.id,
        })
    },

    //点击取消订单
    canclorder: function (e) {
        let param = {
            id: e.currentTarget.dataset.id
        }
        wx.showModal({
            confirmColor: '#39a335',
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
                        this.loadData();
                    })
                }
            },
        })
    },

    //点击确认收货
    conreceipt: function (e) {
        let param = {
            id: e.currentTarget.dataset.id
        }
        wx.showModal({
            confirmColor: '#39a335',
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
                            list: [],
                            page: 0
                        })
                        this.loadData();
                    })
                }
            },
        })
    },

    //点击申请退款
    askpayback: function (e) {
        let param = {
            id: e.currentTarget.dataset.id
        }
        wx.showModal({
            confirmColor: '#39a335',
            title: '温馨提示',
            content: '好不容易选好，确定要向商家申请退款吗？',
            success: res => {
                if (res.confirm) {
                    util.wxRequest("wechat/Order/askForRefund", param, res => {
                        wx.showToast({
                            title: res.msg,
                            icon: res.code == 200 ? 'success' : 'none'
                        })
                        this.setData({
                            list: [],
                            page: 0
                        })
                        this.loadData();
                    })
                }
            },
        })
    },

    //点击去评价
    givewords: function (e) {
        this.setData({
            is_score: true,
            id: e.currentTarget.dataset.id
        })
    },

    // 监听评价输入
    bindinput: function (e) {
        this.setData({
            comment: e.detail.value
        })
    },

    // 打分
    grade: function (e) {
        let that = this
        let val = 0;
        let temp_start = that.data.stars
        for (let i of temp_start) {
            i.flag == 2 ? val++ : ''
        }
        if (that.data.comment == '') {
            wx.showToast({
                title: '请输入评价',
                icon: 'none'
            })
            return false;
        }
        if (val == 0) {
            wx.showToast({
                title: '请选择评分',
                icon: 'none'
            })
            return false;
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
            that.setData({
                list: [],
                page: 0,
                is_score: !1
            })
            that.loadData();
        })
    },

    // 取消打分
    grade_: function () {
        this.setData({
            is_score: false
        })
    },

    // 评分星级
    score: function (e) {
        var that = this;
        for (var i = 0; i < that.data.stars.length; i++) {
            var allItem = 'stars[' + i + '].flag';
            that.setData({
                [allItem]: 1
            })
        }
        var index = e.currentTarget.dataset.index;
        for (var i = 0; i <= index; i++) {
            var item = 'stars[' + i + '].flag';
            that.setData({
                [item]: 2
            })
        }
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

        util.wxRequest("wechat/Order/waitPayOrders", param, res => {
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