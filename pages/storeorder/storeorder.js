const app = getApp()
const util = require('../../utils/util.js');
Page({
    data: {
        id: false,
        list: [],
        page: 0,
        param: {},
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
        is_refund: false,
        answer_msg: ''
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

    // 点击 发货【放弃使用】
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



    // 点击 同意退款
    agree_order: function (e) {
        let that = this

        let param = {
            id: e.currentTarget.dataset.id
        }

        wx.showModal({
            confirmColor: '#39a336',
            title: '温馨提示',
            content: '确认同意退款申请么？',
            success: res => {
                if (res.confirm) {
                    util.wxRequest("wechat/shop/agree_order", param, res => {
                        if (res.code == 200) {
                            wx.showToast({
                                title: res.msg,
                            })
                            that.setData({
                                list: [],
                                page: 0
                            })
                            that.loadData()
                        } else {
                            wx.showModal({
                                title: '警告',
                                content: res.msg,
                                showCancel: false,
                                success(res) {
                                    if (res.confirm) {
                                        that.setData({
                                            list: [],
                                            page: 0
                                        })
                                        that.loadData()
                                    }
                                }
                            })
                        }
                    })
                }
            },
        })
    },

    // 点击 弹出拒绝退款输入框
    refuse_order: function (e) {
        let that = this
        that.setData({
            is_refund: true,
            id: e.currentTarget.dataset.id
        })
    },

    // 监听拒绝理由输入
    bindinput: function (e) {
        this.setData({
            answer_msg: e.detail.value,
        })
    },

    // 提交拒绝退款理由
    onRefuse: function () {
        let that = this

        if (that.data.answer_msg == '') {
            wx.showToast({
                title: '请输入拒绝理由',
                icon: 'none'
            })
            return false;
        }

        let param = {
            id: that.data.id,
            answer_msg: that.data.answer_msg
        }

        util.wxRequest("wechat/shop/refuse_order", param, res => {
            wx.showToast({
                title: res.msg,
                icon: res.code == 200 ? "success" : "none"
            })
            this.setData({
                list: [],
                page: 0,
                is_refund: false
            })
            this.loadData()
        })
    },

    // 取消拒绝退款
    grade_: function () {
        this.setData({
            is_refund: false,
            answer_msg: '',
        })
    },


    // 点击 拨打电话
    makeCall: function (e) {
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

            res.data.data.length == 0 && res.data.current_page !== 1 ? wx.showToast({
                title: '暂无更多数据',
                icon: "none"
            }) : ''
        })
    },

})