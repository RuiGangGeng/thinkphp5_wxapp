const util = require('utils/util.js')
App({

    onLaunch: function () {
        let that = this

        // 微信登录 注意登录和授权是不一样的
        wx.login({
            success: res => {
                util.wxRequest("wechat/user/wx_login", {
                    code: res.code
                }, res => {
                    that.globalData.user = res.data

                    // Callback 回调用户信息
                    if (that.userInfoReadyCallback) {
                        that.userInfoReadyCallback(res.data)
                    }

                })
            }
        })
    },

    globalData: {
        debug: true, // 是否开启调试
        api_host: 'https://www.ananw.cn/public/shop/', // 全局请求URL

        user: null, // 服务器端用户信息
        user_address: null, // 默认地址信息 合并手机号
        defaultaddress: null,// 默认地址信息 不合并手机号
        addrss_id: false, // 默认地址的id

        shops: null, //门店列表，含距离、配送能力等信息

        accountincart: '0', // 购物车信息

        status_bar_height: wx.getSystemInfoSync()['statusBarHeight'], // 主页顶部偏移量

        shop_id: false, // 用户产品搜索传参
        refresh: false, // 用户切换了收货地址是否需要更新首页商家列表
    },

    // 购物车底部导航数字
    setCartNum: function (accountincart) {
        if (accountincart * 1 > 0) {
            wx.setTabBarBadge({
                index: 1,
                text: accountincart
            })
        } else {
            wx.hideTabBarRedDot({
                index: 1
            })
        }
    },

})