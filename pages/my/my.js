const util = require('../../utils/util.js')
const app = getApp()
Page({

    data: {
        shop: {},
        order_0: false,
        order_1: false,
        order_3: false,
        order_4: false,
        auth: false
    },
    onLoad: function() {
        let that = this

        // 检查是否授权
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    that.setData({ auth: true })

                    let param = {
                        user_id: getApp().globalData.user.id,
                        rawData: e.detail.rawData,
                    }

                    // 校验 session_key 同时更新用户信息
                    util.wxRequest("/wechat/User/wx_auth", param, res => {
                        if (res.code === 200) {
                            getApp().globalData.debug ? console.log(getApp().globalData) : ''
                        }
                    })
                }
            }
        })
    },

    onShow: function() {

        this.setData({
            order_0: false,
            order_1: false,
            order_3: false,
            order_4: false,
        })

        // 请求我的订单、是否是商家
        util.wxRequest("wechat/user/getMyPages", { id: app.globalData.user.id }, res => {
            for (let i of res.data.order) {
                i.status == 0 ? this.setData({ order_0: i.number }) : false
                i.status == 1 || i.status == 2 ? this.setData({ order_1: i.number }) : false
                i.status == 3 ? this.setData({ order_3: i.number }) : false
                i.status == 4 ? this.setData({ order_4: i.number }) : false
            }
            this.setData({
                shop: res.data.shop,
            })
        })
    },

    // 点击授权
    authorization: function(e) {
        this.onLoad()
    }
})