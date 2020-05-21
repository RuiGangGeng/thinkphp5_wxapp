const app = getApp()
const util = require('../../utils/util.js');
import Storage from '../../utils/storage';
var storage = new Storage();
Page({

  data: {
    good: {},
    cargood:null
  },

  onLoad: function (e) {
      storage._getGoodInCart(e.id,data=>{
          var cargood =null;
          if(data){
              var goodcount = data.count
              var goodPrice = (data.count * data.price).toFixed(2)
              var goodFavorable = ((data.price_orig - data.price) * data.count).toFixed(2)
              cargood={
                  goodcount: goodcount,
                  goodPrice: goodPrice,
                  goodFavorable: goodFavorable
              }
          }
          this.setData({
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
  },

  // 加入购物车
  addToCart: function (e) {
    var data = e;
    console.log(data)
    var oldnum = this.data.totalGoods ? this.data.totalGoods : 0;
    var newnum = 1 * oldnum + 1;
    var numstr = newnum.toString();
    this.setData({
      num: numstr
    })
    var that = this;
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