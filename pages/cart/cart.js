import Storage from '../../utils/storage'
var storage = new Storage();
const util = require('../../utils/util.js')
    // pages/cart/cart.js
const app = getApp();
Page({

    data: {
        flag: true, //购物车存在或者不存在展示的主体
        cart_img: "http://gw.alicdn.com/tfscom/TB1xdQSJFXXXXcuXXXXy7S8WFXX-176-176.png",

        // 加入购物车的商品
        commodities: [],
        account: 0,
        accountInfo: {
            allCount: 0,
            allAccount: 0,
        },
        checkedAll: false,
    },

    onLoad: function(options) {

        wx.setStorageSync('makeorder', null)
        var pdt = wx.getStorageSync('pdtincar');
        console.log(pdt)
        var allCount = 0;
        var allAccount = 0;
        if (pdt) {
            var arr = pdt.commodities;
            arr.forEach(function(item, index) {
                if (item != null) {
                    (item.commodity).forEach(function(items, indexs) {
                        if (items && items.selected) {
                            allCount = allCount + items.count;
                            allAccount = (allAccount * 1 + items.price * items.count).toFixed(2);
                        }
                    })
                }
            })
        }
        this.setData({
            accountInfo: {
                allCount: allCount,
                allAccount: allAccount
            },
        })
    },

    onShow: function() {
        storage._reVoluationCart()

        var pdt = wx.getStorageSync('pdtincar')

        if (pdt) {
            var ids = null
            storage._getAllGoodidIncart(res => {
                ids = res
            })
            console.log(ids)
            var goodsmsg = null
            util.wxRequest('wechat/shop/getGoodsIncart', { ids: ids, data:JSON.stringify(pdt.commodities)}, data => {
                console.log(data)
                goodsmsg = data.data
            })
            console.log(goodsmsg)

            var commodities = pdt.commodities;
            for (let i of commodities) {
                if (i && i.commodity) {
                    for (let s of i.commodity) {
                        if (s && s.price) {
                            s.price0 = s.price.split('.')[0]
                            s.price1 = s.price.split('.')[1]
                        }

                    }
                }
            }
            this.setData({
                commodities: commodities
            })
            var numstr = pdt.account.toString();
        } else {
            var numstr = '0';
            this.setData({
                flag: false
            })
        }

        if (numstr - 0 > 0) {
            this.setData({
                flag: true,
                account: numstr
            })
            app.setCartNum(numstr)
        }


    },

    // 修改购买数量
    change(ev) {
        let dataset = ev.currentTarget.dataset,
            event = dataset['event'],
            shopidx = dataset['shopidx'],
            commodityidx = dataset['index'],
            commodities = [].concat(this.data.commodities),
            count = commodities[shopidx]['commodity'][commodityidx].count;
        var allCount = this.data.accountInfo.allCount;
        var allAccount = this.data.accountInfo.allAccount;
        if (event === 'decrease') {
            if (allCount - 1 > 0) {
                allCount = allCount - 1;
                allAccount = allAccount - commodities[shopidx]['commodity'][commodityidx].price * 1;
            }
            if (count - 1 == 0) {
                commodities[shopidx].totalPrice = (commodities[shopidx].totalPrice * 1 - commodities[shopidx]['commodity'][commodityidx].price * 1).toFixed(0);

                commodities[shopidx].totalfav = (commodities[shopidx].totalfav * 1 + commodities[shopidx]['commodity'][commodityidx].price * 1 - commodities[shopidx]['commodity'][commodityidx].price_orig * 1).toFixed(0);

                commodities[shopidx].account = commodities[shopidx].account * 1 - 1;

                delete commodities[shopidx]['commodity'][commodityidx];
                if (commodities[shopidx].account == 0) {
                    delete commodities[shopidx];
                }
                var numstr = this.data.account * 1 - 1;
            } else {
                commodities[shopidx].totalPrice = (commodities[shopidx].totalPrice * 1 - commodities[shopidx]['commodity'][commodityidx].price * 1).toFixed(0);

                commodities[shopidx].totalfav = (commodities[shopidx].totalfav * 1 + commodities[shopidx]['commodity'][commodityidx].price * 1 - commodities[shopidx]['commodity'][commodityidx].price_orig * 1).toFixed(0);

                commodities[shopidx].account = commodities[shopidx].account * 1 - 1;
                commodities[shopidx]['commodity'][commodityidx].count = count - 1;
                if (commodities[shopidx].account == 0) {
                    delete commodities[shopidx];
                }
                var numstr = this.data.account * 1 - 1;
            }
            allCount = 0;
            allAccount = 0;
        } else if (event === 'increase') {
            allCount = allCount * 1 + 1;
            allAccount = allAccount * 1 + commodities[shopidx]['commodity'][commodityidx].price * 1;
            commodities[shopidx].totalPrice = (commodities[shopidx].totalPrice * 1 + commodities[shopidx]['commodity'][commodityidx].price * 1).toFixed(0);

            commodities[shopidx].totalfav = (commodities[shopidx].totalfav * 1 - commodities[shopidx]['commodity'][commodityidx].price * 1 + commodities[shopidx]['commodity'][commodityidx].price_orig * 1).toFixed(0);

            commodities[shopidx].account = commodities[shopidx].account * 1 + 1;
            commodities[shopidx]['commodity'][commodityidx].count = count + 1;


            var numstr = this.data.account * 1 + 1;
        };
        console.log(commodities)
        this.setData({
            commodities: commodities,
            account: numstr,
        });
        var pdtincar = {
            account: numstr,
            commodities: commodities
        }
        numstr = numstr.toString();

        if (numstr < 1) {
            pdtincar = null;
            numstr = 0;
            this.setData({
                flag: false
            })
        }

        numstr = numstr.toString();
        app.setCartNum(numstr)
        if (pdtincar) {
            wx.setStorageSync('pdtincar', pdtincar);
        } else {
            wx.setStorageSync('pdtincar', null);
        }

        this.onLoad();
    },


    // 选择 店铺 或 商品
    checked: function(ev) {
        let dataset = ev.currentTarget.dataset;
        console.log(dataset)
        var commodities = [].slice.call(this.data.commodities);
        var shopchoose = '';
        commodities.forEach(function(item, index) {
            if (item) {
                if (item.selected) {
                    shopchoose = item.shopid;
                }
                if (item.selected == false) {
                    var newarr = item.commodity;
                    if (newarr) {
                        newarr.forEach(function(item, index) {
                            if (item) {
                                if (item.selected) {
                                    shopchoose = item.shop_id;
                                }
                            }
                        })
                    }
                }
            }
        })
        console.log(shopchoose);
        var type = dataset.type;
        var shopidx = dataset.shopidx;
        if (type === 'shop') {
            console.log(commodities[shopidx].shopid);
            if (shopchoose && shopchoose != commodities[shopidx].shopid) {
                wx.showToast({
                    title: '门店',
                })
                return;
            }
            let selected = commodities[shopidx]['selected'];
            console.log(selected)
            if (selected) {
                // 取消选中当前店铺包括商品全部
                this.setSelected(commodities, shopidx, null, false);
            } else {
                // 全部选中当前店铺包括商品
                this.setSelected(commodities, shopidx, null, true);
            }
        } else {
            let commodityIdx = dataset.index;
            var selected = commodities[shopidx]['commodity'][commodityIdx].selected;
            if (selected) {
                // 取消选中当前店铺包括商品全部
                this.setSelected(commodities, shopidx, commodityIdx, false);
            } else {
                console.log(commodities[shopidx]['commodity'][commodityIdx].shop_id)
                var shopsid = commodities[shopidx]['commodity'][commodityIdx].shop_id;
                if (shopchoose && shopchoose != shopsid) {
                    wx.showToast({
                        title: '但门店',
                    })
                    return;
                }
                // 全部选中当前店铺包括商品
                this.setSelected(commodities, shopidx, commodityIdx, true);
            }
        };

    },

    // 全选
    checkedAll() {
        let checked = this.data.checkedAll,
            commodities = [].slice.call(this.data.commodities),
            allCount = 0,
            allAccount = 0;
        commodities.forEach(shop => {
            shop['selected'] = !checked;
            shop['commodity'].forEach(i => {
                i['selected'] = !checked;
                allCount = allCount + i['count'] * 1;
                allAccount = allAccount + i['price'] * 1 * i['count'] * 1;
            })
        });

        this.setData({
            commodities,
            accountInfo: {
                allAccount: checked ? 0 : allAccount,
                allCount: checked ? 0 : allCount
            },
            checkedAll: !checked
        })
    },

    setSelected(commodities, shopidx, commodityIdx, boolean) {

        if (!commodities || shopidx == undefined) return;
        let allCount = 0,
            allAccount = 0,
            accountInfo = Object.assign({}, this.data.accountInfo);
        if (commodityIdx == null) {
            commodities[shopidx]['selected'] = boolean;

            if (!boolean) {
                commodities[shopidx].commodity.forEach(item => {
                    console.log('全取消', item)
                    if (item) {
                        item['selected'] = boolean;
                        allCount = 0;
                        allAccount = 0;
                    }
                });
                allAccount = allAccount * 1;
                allCount = allCount * 1;
                accountInfo['allCount'] = allCount * 1;
                accountInfo['allAccount'] = allAccount * 1;

            } else {
                commodities[shopidx].commodity.forEach(item => {
                    console.log('全选', item)
                    if (item) {
                        item['selected'] = boolean;
                        allCount = allCount * 1 + item['count'] * 1;
                        allAccount = allAccount * 1 + item['price'] * item['count'];
                    }
                });
                allAccount = allAccount * 1;
                allCount = allCount * 1;
                accountInfo['allCount'] = allCount * 1;
                accountInfo['allAccount'] = allAccount * 1;
            }
        } else {
            commodities[shopidx].commodity[commodityIdx]['selected'] = boolean;

            if (!boolean) {
                allCount = allCount * 1 - commodities[shopidx].commodity[commodityIdx]['count'] * 1;
                allAccount = allAccount * 1 - commodities[shopidx].commodity[commodityIdx]['price'] * commodities[shopidx].commodity[commodityIdx]['count'] * 1;
                allAccount = allAccount * 1;
                allCount = allCount * 1;
            } else {

                allCount = allCount * 1 + commodities[shopidx].commodity[commodityIdx]['count'] * 1;
                allAccount = allAccount * 1 + commodities[shopidx].commodity[commodityIdx]['price'] * commodities[shopidx].commodity[commodityIdx]['count'] * 1;
                allAccount = allAccount * 1;
                allCount = allCount * 1;
            }
            let result = true;
            commodities[shopidx].commodity.forEach(item => {
                console.log('单一选中', item)
                if (item) {
                    result = result && item['selected']
                }
            });
            commodities[shopidx]['selected'] = result;
            accountInfo['allCount'] = accountInfo['allCount'] * 1 + allCount * 1;
            accountInfo['allAccount'] = accountInfo['allAccount'] * 1 + allAccount * 1;
        }

        this.setData({
            commodities,
            accountInfo
        })
    },

    // 商品编辑
    edit(ev) {
        let shopIdx = ev.currentTarget.dataset['shopidx'],
            commodities = [].slice.call(this.data.commodities);
        commodities[shopIdx]['isEdit'] = !commodities[shopIdx]['isEdit'];
        this.setData({
            commodities
        });
    },

    //开闭订单商店
    changeT: function(e) {
        console.log(e)
        var shopid = e.currentTarget.dataset.shopid;
        var shoplist = this.data.commodities;
        console.log(shoplist)
        shoplist.forEach(function(item, index) {
            if (item) {
                if (item.shopid == shopid) {
                    if (item.ishow == undefined || item.ishow == false) {
                        shoplist[index].ishow = true;
                    } else {
                        shoplist[index].ishow = false;
                    }
                }
            }
        })
        console.log(shoplist)
        this.setData({
            commodities: shoplist
        })
    },

    //再逛逛
    goshop: function(e) {
        console.log(e)
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: '/pages/shopindex/shopindex?shopid=' + shopid,
        })
    },

    //提交订单
    doorder: function() {
        var cart = this.data.commodities
        var shop_id = null
        var orderinfo = {}
        var commodity = []
        var totalnumber = 0
        var totalprice = 0
        var flag = false
        for (let i of cart) {
            if (i) {
                for (let s of i.commodity) {
                    if (s && s.selected) {
                        shop_id = s.shop_id
                        commodity = commodity.concat(s)
                            // totalnumber = totalnumber + s.count*1
                            // totalprice = (totalprice - 0 + s.count*s.price).toFixed(2)
                    }
                }
            }
        }
        // var shopname = null
        // var shopaddr = null
        // for(let i of cart){
        //     if(i){
        //         if(i.shopid == shop_id){
        //             shopname = i.shopname
        //             shopaddr = i.shopaddress
        //         }
        //     }
        // }
        orderinfo = {
            type: 'cart',
            shop_id: shop_id,
            account: this.data.accountInfo.allCount,
            totalPrice: this.data.accountInfo.allAccount,
            commodity: commodity
        }
        console.log(orderinfo)
        wx.setStorageSync('makeorder', orderinfo)
        wx.navigateTo({
            url: '/pages/doorder/doorder',
        })
    }

})