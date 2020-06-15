const util = require('../../utils/util.js');
const app = getApp();
import Storage from '../../utils/storage';
var storage = new Storage();
Page({

    data: {
        cat: false, //订单来自页面false:门店下单；true:购物车下单
        flag: false, //防止重复下单
        shopid: null, //选中的门店ID
        shopInfo: null, //选中的门店信息详情、含配送能力 can>0 可以配送
        userdefaultAddress: null, //默认地址
        oederInfo: null, //订单信息
        leaveawords: null, //留言板
        myorder: null,
        type: 1,
        coupon: []
    },

    onLoad: function() {
        var shops = app.globalData.shops;
        var myorder = wx.getStorageSync('makeorder')

        var shopInfo = {};
        if (myorder.hasOwnProperty('type')) {
            var shopid = myorder.shop_id
            if (shops) {
                for (let i of shops) {
                    if (i) {
                        if (i.id == shopid) {
                            shopInfo = i
                        }
                    }
                }
            }
            this.setData({
                cat: true,
                oederInfo: myorder,
                shopInfo: shopInfo,
                shopid: shopid,
                myorder: myorder,
            })

        } else {
            var shopid = myorder[0].shopid
            if (shops) {
                shops.forEach(function(item, index) {
                    if (item.id == shopid) {
                        shopInfo = item;
                    }
                })
            }
            this.setData({
                shopInfo: shopInfo,
                oederInfo: myorder[0],
                shopid: shopid,
                myorder: myorder,
            })
        }

        // 获取满减信息
        util.wxRequest('wechat/shop/getCouponInfo', { shop_id: this.data.shopid }, res => {
            this.setData({ coupon: res.data })
        })
    },

    onShow: function() {
        let that = this

        // 产品参数发生了改变就得提示并更新
        // 收货地址发生了改变就得更新
        // 检测地址是否发生变化
        let order = []
        for (let i of this.data.oederInfo.commodity) order.push({ 'id': i.id, 'price': i.price, 'name': i.name })
        util.wxRequest('wechat/shop/getGoodsIncart', { order: order }, res => {
            if (res.code == 500) {
                let msg = ''
                for (let i of res.data) {
                    i.msg
                    i.type == 1 ? msg += i.name + '：商品已经删除或者下架；' : i.type == 2 ? msg += i.name + '：商品价格变为:' + i.msg : msg += i.name + '：商品名称变为，' + i.msg
                }

                let origin_goods = res.data
                wx.showModal({
                    title: '提示',
                    content: msg,
                    showCancel: false,
                    success: function(res) {
                        if (res.confirm) {
                            let s = wx.getStorageSync('pdtincar')
                            let l_index = 0
                            for (let l of s.commodities) {
                                if (l.shopid == that.data.shopid) {
                                    for (let j of origin_goods) {
                                        for (let i = 0; i < l.commodity.length; i++) {
                                            if (j.id == l.commodity[i].id) {
                                                if (j.type == 1) {
                                                    l.account = Number(l.account) - l.commodity[i].count
                                                    s.account = Number(s.account) - l.commodity[i].count
                                                    l.totalPrice = Number(l.totalPrice) - l.commodity[i].price * l.commodity[i].count
                                                    l.totalfav = Number(l.totalfav) - (Number(l.commodity[i].price_orig) - Number(l.commodity[i].price)) * l.commodity[i].count
                                                    l.commodity.splice(l.commodity[i], 1)
                                                    if (l.commodity.length == 0) {
                                                        s.commodities.splice([s.commodities.l_index], 1)
                                                    }
                                                }
                                                if (j.type == 2) {
                                                    if (l.commodity[i].price * 1 > j.msg * 1) {
                                                        l.totalPrice = Number(l.totalPrice) - (Number(l.commodity[i].price) - Number(j.msg)) * l.commodity[i].count
                                                        l.totalfav = Number(l.totalfav) + (Number(j.price_orig) - Number(j.msg)) * l.commodity[i].count - (Number(l.commodity[i].price_orig) - Number(l.commodity[i].price)) * l.commodity[i].count
                                                    } else {
                                                        l.totalPrice = Number(l.totalPrice) + (Number(j.msg) - Number(l.commodity[i].price)) * l.commodity[i].count
                                                        l.totalfav = Number(l.totalfav) - (Number(j.price_orig) - Number(j.msg)) * l.commodity[i].count
                                                    }
                                                    l.commodity[i].price = j.msg
                                                }
                                                if (j.type == 3) l.commodity[i].name = j.msg
                                            }
                                        }
                                    }
                                }
                                l_index++
                            }
                            wx.setStorageSync('pdtincar', s)
                            wx.setStorageSync('makeorder', '')
                            wx.navigateBack()
                        }
                    }
                });
            }
        })

        setTimeout(function() {
            that.setData({ userdefaultAddress: app.globalData.defaultaddress })
        }, 0)
    },

    // 切换地址
    addaddress: function() { wx.navigateTo({ url: '/pages/address/address?type=order&shop_id=' + this.data.shopid }) },

    // 切换配送方式
    changeType: function(e) { this.setData({ type: e.currentTarget.dataset.type }) },

    // 输入留言
    makewords: function(e) { this.setData({ leaveawords: e.detail.value }) },

    //提交支付
    formSubmit: function(e) {
        var that = this

        util.wxRequest('wechat/User/checkAddressForShop', { shop_id: that.data.shopid, id: that.data.userdefaultAddress.id }, res => {
            if (res.code != 200) {
                wx.showModal({
                    title: '警告',
                    content: res.msg,
                    showCancel: false,
                    success: function(res) {
                        if (res.confirm) { that.addaddress() }
                    }
                })
            } else {
                var order = {
                    remark: e.detail.value.words,
                    uid: app.globalData.user.id,
                    shop_id: that.data.shopid,
                    contact: that.data.userdefaultAddress.contact,
                    phone: that.data.userdefaultAddress.phone,
                    address: that.data.userdefaultAddress.address + that.data.userdefaultAddress.house,
                    number: that.data.oederInfo.account,
                    price: that.data.oederInfo.totalPrice,
                    type: that.data.type
                }

                var order_detail = { order_detail: that.data.oederInfo.commodity }
                that.setData({ flag: true })

                //调用订单创建接口
                util.wxRequest('wechat/order/createOrder', { order: order, order_detail: order_detail }, res => {
                    if (res.code == 200) {
                        var clearCart = wx.getStorageSync('makeorder').commodity
                        var acconutde = that.data.oederInfo.account
                        storage._clearPdtPay(clearCart, acconutde)
                        wx.setStorageSync('makeorder', null)

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
                                    wx.redirectTo({ url: '/pages/order/order' })
                                })
                            }
                        })
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: res.msg,
                            success: function(res) {
                                var clearCart = wx.getStorageSync('makeorder').commodity
                                var acconutde = that.data.oederInfo.account
                                storage._clearPdtPay(clearCart, acconutde)
                                wx.navigateBack()
                            }
                        })
                    }
                })
            }
        })
    }
})