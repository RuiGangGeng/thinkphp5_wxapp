//app.js
App({

    onLaunch: function () {
        let that = this
        if (wx.getStorageSync('pdtincar')) {
            var cart = wx.getStorageSync('pdtincar').account.toString();
        } else {
            var cart = 0;
        }
        that.globalData.accountincart = cart;
        that.setCartNum(cart);
    },

    globalData: {
        defaultaddress: null,// 默认地址信息
        debug: true, // 是否开启调试
        accountincart: '0', // 购物车信息
        user: null, // 服务器端用户信息
        user_info: null, // 微信端用户信息
        user_address: null, // 用户默认地址
        api_host: 'https://www.ananw.cn/public/shop/', // 全局请求URL
        status_bar_height: wx.getSystemInfoSync()['statusBarHeight'], // 主页顶部偏移量
        shops: null, //门店列表，含距离、配送能力等信息
        shop_id: false, // 用户产品搜索传参
        refresh: false, //用户切换了收货地址是否需要更新首页商家列表
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

    // 
    isStrInArray: function (item, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == item) {
                return true;
            }
        }
        return false;
    },

})