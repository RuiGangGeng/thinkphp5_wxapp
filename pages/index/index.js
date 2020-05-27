const app = getApp()
const util = require('../../utils/util.js')
import Storage from '../../utils/storage'
var storage = new Storage();
Page({

    data: {
        top_bg: app.globalData.api_host + "public/uploads/category/8e7e32c3ddbce7ea1839859e22a8d1dd.png",
        banner_image: app.globalData.api_host + "public/uploads/category/f1bc7a59af3aa5c7eaf3f5bd7364c055.png",
        shop_list: [],
        address: '',
        titlmargintop: 0,
        margintop: 0,
    },

    // 小程序加载
    onLoad: function() {
        storage._reVoluationCart()
        let that = this
            // 获取缓存设置 tabar 的数字角标
        var num = wx.getStorageSync('pdtincar')
        if (num) {
            var numstr = num.account.toString()
            if (numstr - 0 > 0) {
                this.setData({
                    flag: true
                })
            }
            app.setCartNum(numstr)
        }
        // 判断是否获取到用户信息
        if (app.globalData.user) {
            that.checkAddress(app.globalData.user.id)
        } else {
            app.userInfoReadyCallback = function(res) {
                that.checkAddress(res.id)
            }
        }
    },

    // 检查是否存在默认地址
    checkAddress: function(id) {
        let that = this
        util.wxRequest("wechat/user/checkAddress", {
            id: id
        }, res => {
            if (res.code == 200) {
                app.globalData.defaultaddress = res.data
                app.globalData.user_address = res.data.address + res.data.house
                app.globalData.addrss_id = res.data.id

                that.setData({
                    address: res.data.address
                })

                // 获取商家列表
                that.loadShops()
            } else {
                wx.redirectTo({ url: '/pages/address/address' })
            }
        })
    },

    onShow: function() {
        // 设置顶部偏移
        var titlehei = app.globalData.status_bar_height
        var margintop = titlehei * 2 - 0 + 44 + 52
        var titlmargintop = titlehei * 2

        this.setData({
            titlmargintop: titlmargintop,
            margintop: margintop,
        })

        // 是否更换了默认地址 更换则重新拉取商家列表
        if (app.globalData.refresh) {
            app.globalData.refresh = false
            this.setData({
                address: app.globalData.user_address
            })
            this.loadShops()
        }
    },

    videoPlay: function() {
        util.wxRequest("wechat/index/getVideo", {}, res => {
            this.setData({
                address: res.data
            })
            var _index = res.id
            this.setData({
                    _index: _index
                })
                //停止正在播放的视频
            var videoContextPrev = wx.createVideoContext(this.data._index)
            console.log(videoContextPrev);
            videoContextPrev.stop();
            setTimeout(function() {
                //将点击视频进行播放
                var videoContext = wx.createVideoContext(_index)
                videoContext.play();
            }, 500)
        })
    },

    // 前往商铺首页
    goshop: function(e) {
        wx.navigateTo({
            url: '/pages/shopindex/shopindex?shopid=' + e.currentTarget.dataset.shopid,
        })
    },

    loadShops: function() {
        util.wxRequest('wechat/user/loadShops', { id: app.globalData.addrss_id }, res => {
            // 计算门店显示进店购物或者去逛逛
            let shops = res.data

            for (let item of shops) {
                item.can = (item.deliveryGap - item.distance).toFixed(2);
                item.gap = (item.distance / 1000).toFixed(1);
            }

            app.globalData.shops = shops
            this.setData({
                shops: shops
            })
        })
    },

    // 分享
    onShareAppMessage: function() {
        let that = this;
        return {
            title: '邻里快达.社区配送',
            path: 'pages/index/index', // 路径，传递参数到指定页面。
            imageUrl: that.data.banner_image, // 分享的封面图
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