const app = getApp();
const util = require('../../utils/util.js');
import Storage from '../../utils/storage';
var storage = new Storage();
Page({

    data: {
        good: {},
        cargood: null,
        shop_id: false,
        totalGoods: false,
        totalPrice: false,
        totalFavorable: false,
        shopname: false,
        goodsList: [],
        goodsincar: [],
    },

    onLoad: function (e) {
      var that = this;
      util.wxRequest('wechat/Shop/getShopName', { shop_id: app.globalData.shop_id }, res => {
        that.setData({
          shopname: res.name
        })
      })

      var pdtincar = wx.getStorageSync('pdtincar');
      if (pdtincar) {
        var pagearr = pdtincar.commodities;
        var pagegoodsincar = [];
        pagearr.forEach(function (item, index) {
          console.log(item);
          if (item && item.shopid == app.globalData.shop_id) {
            pagegoodsincar = item.commodity
          }
        })
      }
      console.log(pagegoodsincar);
      that.countInfoAtThisShop(pdtincar, that, app.globalData.shop_id)
      
      storage._getGoodInCart(e.id, data => {
        var cargood = null;
        if (data) {
            var goodcount = data.count
            var goodPrice = (data.count * data.price).toFixed(2)
            var goodFavorable = ((data.price_orig - data.price) * data.count).toFixed(2)
            cargood = {
                goodcount: goodcount,
                goodPrice: goodPrice,
                goodFavorable: goodFavorable
            }
        }
        that.setData({
            cargood: cargood
        })
      })
      util.wxRequest("wechat/shop/get_good", {
          id: e.id,
      }, res => {
          if (res.code == 200) {
              res.data.price0 = res.data.price.split('.')[0]
              res.data.price1 = res.data.price.split('.')[1]
          }
          this.setData({
              good: res.data,
          })
      })
      that.setData({
        goodsincar: pagegoodsincar,
      })
    },

  // 计算本门店的购物车信息，赋值到UI
  countInfoAtThisShop: function (pdtincar, that, id) {
    if (!pdtincar) {
      var arr = []
    } else {
      var arr = pdtincar.commodities;
    }
    var totalGoods = false;
    var totalPrice = false;
    var totalFavorable = false;
    if (arr) {
      var num = arr.length;
    } else {
      num = 0;
    }
    for (let i = 0; i < num; i++) {
      if (arr[i] && arr[i].shopid == id) {
        totalGoods = arr[i].account;
        totalPrice = arr[i].totalPrice;
        totalFavorable = arr[i].totalfav;
      }
    }
    that.setData({
      totalGoods: totalGoods,
      totalPrice: totalPrice,
      totalFavorable: totalFavorable
    })
  },

  // 点击去结算
  godoorder: function () {
    wx.removeStorageSync('makeorder');
    //设置当前门店购物车商品为选中状态
    var shop_id = this.data.shopid;
    var arr = wx.getStorageSync('pdtincar').commodities;
    arr.forEach(function (item, index) {
      if (item.shopid == shop_id) {
        item.selected = true;
        (item.commodity).forEach(function (item, index) {
          item.selected = true;
        })
      }
    })
    wx.setStorageSync('makeorder', arr)
    wx.navigateTo({
      url: '/pages/doorder/doorder',
    })
  },

  // 加入购物车
  addToCart: function (e) {
    console.log(e);
    var data = e.currentTarget.dataset.msg;

    var oldnum = this.data.totalGoods ? this.data.totalGoods : 0;
    var newnum = 1 * oldnum + 1;
    var numstr = newnum.toString();
    this.setData({
      num: numstr
    })
    var that = this;
    console.log(that.data.shopname);
    data.shopname = that.data.shopname;
    
    storage.operateCar(data, that)

    //改变当前页底部购物车展示
    var totalGoods = that.data.totalGoods;
    var totalPrice = that.data.totalPrice;
    var totalFavorable = that.data.totalFavorable;

    totalGoods = totalGoods * 1 + 1;
    totalPrice = (totalPrice * 1 + data.price * 1).toFixed(2);
    totalFavorable = (totalFavorable * 1 + data.price_orig * 1 - data.price * 1).toFixed(2);

    var newgoodsincar = that.data.goodsincar;
    if (newgoodsincar) {
      var s = false;
      newgoodsincar.forEach(function (item, index) {
        if (item.id == data.id) {
          item.count = item.count * 1 + 1;
          s = true;
        }
      })
      if (!s) {
        data.count = 1;
        newgoodsincar = newgoodsincar.concat(data)
      }
    } else {
      data.count = 1;
      newgoodsincar = [data];
    }
    that.setData({
      goodsincar: newgoodsincar,
      totalGoods: totalGoods,
      totalPrice: totalPrice,
      totalFavorable: totalFavorable
    })
  },

})