// pages/doorder/doorder.js
const util = require('../../utils/util.js');
const app = getApp();
import Storage from '../../utils/storage';
var storage = new Storage();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cat:false,//订单来自页面false:门店下单；true:购物车下单
        flag: false, //防止重复下单
        shopid: null, //选中的门店ID
        shopInfo: null, //选中的门店信息详情、含配送能力 can>0 可以配送
        userdefaultAddress: null, //默认地址
        oederInfo: null, //订单信息
        leaveawords: null, //留言板
        myorder:null,
        pdtincar:null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var pdtincar = wx.getStorageSync('pdtincar');
        var myorder = wx.getStorageSync('makeorder');
        if(myorder && myorder.hasOwnProperty('type')){
            var oederInfo = myorder.order_detail
            var shopid = myorder.order.shop_id
            var shopInfo = {
                name:myorder.shopname,
                address:myorder.shopaddress
            }
            this.setData({
                cat:true
            })

        } else {
            var shops = wx.getStorageSync('shops');
            var shopInfo = {};
            if (myorder && myorder[0] && shops && shops[0]) {
                var shopid = myorder[0].shopid;
                shops.forEach(function(item, index) {
                    if (item.id == shopid) {
                        shopInfo = item;
                    }
                })
            }
        }
        this.setData({
            userdefaultAddress: app.globalData.defaultaddress,
            shopInfo: shopInfo,
            oederInfo: myorder[0],
            shopid: shopid,
            myorder: myorder,
            pdtincar: pdtincar
        })
    },

    //添加地址
    addaddress: function() {
        wx.navigateTo({
            url: '/pages/address/address',
        })
    },

    //获取留言
    makewords: function(e) {
        console.log(e)
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
        util.wxRequest(
            'wechat/order/createOrder', {
                order: order,
                order_detail: order_detail
            }, res => {
                wx.showToast({
                    title: res.msg,
                    duration: 1500
                })
                var code = res.code;
                if (code == 200){
                    if(cat){
                        var clearCart = wx.getStorageSync('makeorder').order_detail
                    } else {
                        var clearCart = wx.getStorageSync('makeorder')[0];
                    }
                    storage._clearPdtPay(clearCart);
                }
                wx.setStorageSync('makeorder', null);
                setTimeout(res => {
                    wx.redirectTo({
                        url: '/pages/resultpay/resultpay?code=' + code,
                    })
                }, 2000)

            }
        )
    }
})