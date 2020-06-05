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
        pdtincar: null
    },

    onLoad: function(options) {
        var shops = app.globalData.shops;
        var pdtincar = wx.getStorageSync('pdtincar');

        var myorder = wx.getStorageSync('makeorder');
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
                userdefaultAddress: app.globalData.defaultaddress,
                shopid: shopid,
                myorder: myorder,
                pdtincar: pdtincar
            })

        } else {
            var shopid = myorder[0].shopid;
            if (shops) {
                shops.forEach(function(item, index) {
                    if (item.id == shopid) {
                        shopInfo = item;
                    }
                })
            }
            this.setData({
                userdefaultAddress: app.globalData.defaultaddress,
                shopInfo: shopInfo,
                oederInfo: myorder[0],
                shopid: shopid,
                myorder: myorder,
                pdtincar: pdtincar
            })
        }

    },

    //添加地址
    addaddress: function() {
        wx.navigateTo({
            url: '/pages/address/address',
        })
    },

    //获取留言
    makewords: function(e) {
        this.setData({
            leaveawords: e.detail.value
        })
    },

    //提交支付
    formSubmit: function(e) {
        if (this.data.flag) {
            wx.showToast({
                title: '请不要重复下单',
            })
            return;
        }
        //超出配送距离
        if (this.data.shopInfo.can < 0) {
            wx.showModal({
                title: '提示',
                content: '你选择的收货地址已超出所买商品门店的配送范围，请检查',
            })
            return;
        }
        //总金额小于20元
        if (this.data.oederInfo.totalPrice < 20) {
            wx.showModal({
                title: '提示',
                content: '订单金额不足20元',
            })
            return;
        }
        var order = {
            remark: e.detail.value.words,
            uid: app.globalData.user.id,
            shop_id: this.data.shopid,
            contact: this.data.userdefaultAddress.contact,
            phone: this.data.userdefaultAddress.phone,
            address: this.data.userdefaultAddress.address + this.data.userdefaultAddress.house,
            number: this.data.oederInfo.account,
            price: this.data.oederInfo.totalPrice,

        };
        var order_detail = {
            order_detail: this.data.oederInfo.commodity
        }
        this.setData({
            flag: true
        })

        //调用订单创建接口
        util.wxRequest('wechat/order/createOrder', { order: order, order_detail: order_detail }, res => {
            var that = this
            if (res.code == 200) {
                // var clearCart = wx.getStorageSync('makeorder');
                var clearCart = wx.getStorageSync('makeorder').commodity
                var acconutde = that.data.oederInfo.account
                    // 判断订单为什么来自商家还是购物车
                    // if (that.data.cat) {
                    //     var clearCart = wx.getStorageSync('makeorder').commodity
                    //     var acconutde = that.data.oederInfo.account
                    // } else {
                    //   var clearCart = wx.getStorageSync('makeorder')[0];
                    //     var acconutde = that.data.oederInfo.account
                    // }
                    // 删除已下单的购物车商品
                storage._clearPdtPay(clearCart, acconutde);
                wx.setStorageSync('makeorder', null)
                    // 发起支付
                wx.requestPayment({
                    timeStamp: res.data.pay.timeStamp + '',
                    nonceStr: res.data.pay.nonceStr,
                    package: res.data.pay.package,
                    signType: res.data.pay.signType,
                    paySign: res.data.pay.sign,
                    success() {
                        // wx.redirectTo({
                        //     url: '/pages/resultpay/resultpay?id=' + res.data.id + '&code=200',
                        // })
                        wx.redirectTo({
                            url: '/pages/order/order',
                        })
                    },
                    fail(e) {
                        // if (e.errMsg == "requestPayment:fail cancel") {
                        //     wx.redirectTo({
                        //         url: '/pages/resultpay/resultpay?id=' + res.data.id + '&code=500',
                        //     })
                        // }
                        wx.redirectTo({
                            url: '/pages/order/order',
                        })
                    },
                    complete() {
                        util.wxRequest('wechat/order/orderQuery', { id: res.data.id }, res => {
                            wx.redirectTo({
                                url: '/pages/order/order',
                            })
                        })
                    }
                })
            }
        })
    }
})