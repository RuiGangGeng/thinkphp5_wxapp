class Storage {
  constructor() {}

  //操作购物车 event:事件函数；data:商品详情；that:函数page
  operateCar(data, that) {
    console.log(data)
    var carInfo = wx.getStorageSync('pdtincar'); //获取购物车数据

    if (carInfo) {
      this._addPdtTocar(carInfo, data, that)

    } else {
      //购物车无商品 addToCart添加商品
      this._addPdtIncar(data, that)
    }
    console.log(wx.getStorageSync('pdtincar'))
    wx.showToast({
      title: '加入购物车成功',
      duration: 2000
    })
  }

  //无商品时添加商品到购物车
  _addPdtIncar(data, that) {
    var goodsIncar = {
      account: 1,
      commodities: []
    };
    data.count = 1;
    data.selected = false;
    goodsIncar.commodities[0] = {
      shopid: data.shop_id,
      shopName: data.shopname,
      account: 1,
      totalPrice: data.price,
      totalfav: (data.price_orig * 1 - data.price * 1).toFixed(2),
      selected: false, //店铺全选
      //商品详情 array
      commodity: [
        data
      ]
    }
    wx.setStorageSync('pdtincar', goodsIncar);
    that.setData({
      pageCar: goodsIncar
    })
  }

  //有商品时添加商品到购物车
  _addPdtTocar(carInfo, data, that) {
    carInfo.account = carInfo.account * 1 + 1;
    var arr = carInfo.commodities;
    var s = false;
    if(!arr){
        arr =[];
    }
    arr.forEach(function(item, index) {
      if (item.shopid == data.shop_id) {
        item.account = item.account * 1 + 1;
        item.shopName = data.shopname;
        item.totalPrice = (item.totalPrice * 1 + data.price * 1).toFixed(2);
        item.totalfav = (item.totalfav * 1 + data.price_orig * 1 - data.price * 1).toFixed(2);
        var arr1 = item.commodity;
        var s1 = false;
        arr1.forEach(function(item1, index1) {
          if (item1.id == data.id) {
            item1.count = item1.count * 1 + 1;
            s1 = true;
          }
        })
        if (!s1) {
          data.count = 1;
    data.selected = false;
          arr1.push(data);
        }
        arr.commodity = arr1;
        carInfo.commodities = arr;
        s = true
      }
    })
    if (!s) {
        data.count = 1;
        data.selected = false;
      var newUnit = {
        shopid: data.shop_id,
        shopName: data.shopname,
        account: 1,
        totalPrice: data.price,
        totalfav: (data.price_orig * 1 - data.price * 1).toFixed(2),
        selected: false,
        commodity: [
          data
        ]
      }
      arr.push(newUnit)
      carInfo.commodities = arr;
    }
    wx.setStorageSync('pdtincar', carInfo);
    that.setData({
      pageCar: carInfo
    })
  }

  //下单后清除已下单的商品
    _clearPdtPay(clearCart){
        var pdtincar = wx.getStorageSync('pdtincar');
        console.log(clearCart);
        console.log(pdtincar);
        pdtincar.account = pdtincar.account  - clearCart.account;
        if (pdtincar.account == 0){
            pdtincar =null;
        } else {
            (pdtincar.commodities).forEach(function (item, index) {
                if (item.shopid == clearCart.shopid) { 
                    pdtincar.commodities[index].account = pdtincar.commodities[index].account - clearCart.account;
                    if (pdtincar.commodities[index].account == 0){
                        delete pdtincar.commodities[index];
                    } else {
                        pdtincar.commodities[index].totalPrice = pdtincar.commodities[index].totalPrice - clearCart.totalPrice;
                        pdtincar.commodities[index].totalfav = pdtincar.commodities[index].totalfav - clearCart.totalfav;
                        (pdtincar.commodities[index].commodity).forEach(function(item,index){
                            clearCart.commodity.forEach(function(items,indexs){
                                if (item.id == items.id){
                                    pdtincar.commodities[index].commodity[index].count = pdtincar.commodities[index].commodity[index].count - clearCart.commodity[indexs];
                                    if (pdtincar.commodities[index].commodity[index].count ==0){
                                        delete pdtincar.commodities[index].commodity[index];
                                    }
                                }
                            })
                        })
                    }
                }
            })
        }

        wx.setStorageSync('pdtincar', pdtincar);
  }

}

export default Storage