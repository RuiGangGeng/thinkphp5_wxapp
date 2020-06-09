import Storage from '../../utils/storage'
var storage = new Storage();
const util = require('../../utils/util.js')
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
        deliveryPrice: false,
        checkedAll: false,
        is_show: false,
        is_show_deliveryPrice: false
    },

    onShow: function() {
        storage._reVoluationCart()
        var pdt = wx.getStorageSync('pdtincar')

        if (pdt) {
            var ids = null
            storage._getAllGoodidIncart(res => {
                ids = res
            })

            util.wxRequest('wechat/shop/getGoodsIncart', { ids: ids, data: JSON.stringify(pdt.commodities) }, data => {})

            var commodities = pdt.commodities;
            commodities[0].ishow = true
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
        }
        app.setCartNum(numstr)

        let allCount = 0
        let allAccount = 0
        let is_show = false
        let is_show_deliveryPrice = false
        let deliveryPrice = false

        if (pdt) {
            var arr = pdt.commodities;
            for (let item of arr) {
                if (item != null) {
                    let con = false;
                    (item.commodity).forEach(function(items, indexs) {
                        if (items && items.selected) {
                            con = true
                            allCount = allCount + items.count;
                            allAccount = (allAccount * 1 + items.price * items.count).toFixed(2);
                        }
                    })
                    deliveryPrice = item.deliveryPrice
                    if (allAccount * 1 >= item.deliveryPrice * 1) {
                        is_show = true
                    } else {
                        is_show_deliveryPrice = true
                    }
                    if (allAccount == 0) {
                        is_show_deliveryPrice = false
                    }
                    if (con) {
                        break
                    }
                }
            }
        }

        this.setData({
            accountInfo: { allCount: allCount, allAccount: allAccount },
            is_show: is_show,
            is_show_deliveryPrice: is_show_deliveryPrice,
            deliveryPrice: deliveryPrice
        })
    },

    // 修改购买数量
    change(ev) {
        let dataset = ev.currentTarget.dataset,
            event = dataset['event'],
            id = dataset['id'],
            shopidx = dataset['shopidx'],
            commodityidx = dataset['index'],
            commodities = [].concat(this.data.commodities),
            count = commodities[shopidx]['commodity'][commodityidx].count;
        var allCount = this.data.accountInfo.allCount;
        var allAccount = this.data.accountInfo.allAccount * 1;

        // 判断increase增加还是decrease减去
        if (event === 'decrease') {
            if (count - 1 == 0) {
                commodities[shopidx].totalPrice = (commodities[shopidx].totalPrice * 1 - commodities[shopidx]['commodity'][commodityidx].price * 1).toFixed(0);

                commodities[shopidx].totalfav = (commodities[shopidx].totalfav * 1 + commodities[shopidx]['commodity'][commodityidx].price * 1 - commodities[shopidx]['commodity'][commodityidx].price_orig * 1).toFixed(0);

                commodities[shopidx].account = commodities[shopidx].account * 1 - 1;

                let chanpin = commodities[shopidx]['commodity'][commodityidx]
                if (chanpin.selected) {
                    allCount -= chanpin.count * 1
                    allAccount -= (chanpin.count * 1) * (chanpin.price * 1)
                }

                delete commodities[shopidx]['commodity'][commodityidx]

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
        } else if (event === 'increase') {
            commodities[shopidx].totalPrice = (commodities[shopidx].totalPrice * 1 + commodities[shopidx]['commodity'][commodityidx].price * 1).toFixed(0);

            commodities[shopidx].totalfav = (commodities[shopidx].totalfav * 1 - commodities[shopidx]['commodity'][commodityidx].price * 1 + commodities[shopidx]['commodity'][commodityidx].price_orig * 1).toFixed(0);

            commodities[shopidx].account = commodities[shopidx].account * 1 + 1;
            commodities[shopidx]['commodity'][commodityidx].count = count + 1;

            var numstr = this.data.account * 1 + 1;
        }

        let is_show = false
        let is_show_deliveryPrice = false

        // 计算价格 判断是否到达了起送价格
        if (commodities[shopidx]) {
            if (commodities[shopidx].commodity) {
                for (let i of commodities[shopidx].commodity) {
                    if (i) {
                        if (i.selected && id == i.id) {
                            if (event === 'increase') {
                                allCount += 1
                                allAccount += i.price * 1
                            } else {
                                allCount -= 1
                                allAccount -= i.price * 1
                            }
                        }
                    }
                }
                if (allAccount >= commodities[shopidx].deliveryPrice) {
                    is_show = true
                } else {
                    is_show_deliveryPrice = true
                }
                if (allAccount == 0) {
                    is_show_deliveryPrice = false
                }
            }
        }

        this.setData({
            commodities: commodities,
            account: numstr,
            accountInfo: { allCount: allCount, allAccount: allAccount },
            is_show: is_show,
            is_show_deliveryPrice: is_show_deliveryPrice,
            deliveryPrice: commodities[shopidx] ? commodities[shopidx].deliveryPrice : false
        })

        var pdtincar = { account: numstr, commodities: commodities }
        numstr = numstr.toString()

        if (numstr < 1) {
            pdtincar = null;
            numstr = 0;
            this.setData({
                flag: false
            })
        }

        numstr = numstr.toString()
        app.setCartNum(numstr)

        // 设置缓存
        if (pdtincar) {
            wx.setStorageSync('pdtincar', pdtincar);
        } else {
            wx.setStorageSync('pdtincar', null);
        }
    },

    // 选择 店铺 或 商品
    checked: function(ev) {
        let dataset = ev.currentTarget.dataset;
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
        var type = dataset.type;
        var shopidx = dataset.shopidx;
        if (type === 'shop') {
            if (shopchoose && shopchoose != commodities[shopidx].shopid) {
                wx.showToast({
                    title: '请单门店支付',
                    icon: 'none'
                })
                return;
            }
            let selected = commodities[shopidx]['selected'];
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
                var shopsid = commodities[shopidx]['commodity'][commodityIdx].shop_id;
                if (shopchoose && shopchoose != shopsid) {
                    wx.showToast({
                        title: '请单门店支付',
                        icon: 'none'
                    })
                    return;
                }
                // 全部选中当前店铺包括商品
                this.setSelected(commodities, shopidx, commodityIdx, true);
            }
        }

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
                if (item) {
                    result = result && item['selected']
                }
            });
            commodities[shopidx]['selected'] = result;
            accountInfo['allCount'] = accountInfo['allCount'] * 1 + allCount * 1;
            accountInfo['allAccount'] = accountInfo['allAccount'] * 1 + allAccount * 1;
        }

        let is_show = false
        let is_show_deliveryPrice = false


        if (accountInfo['allAccount'] >= commodities[shopidx].deliveryPrice) {
            is_show = true
        } else {
            is_show_deliveryPrice = true
        }

        if (accountInfo['allAccount'] == 0) {
            is_show_deliveryPrice = false
        }

        let temp = wx.getStorageSync('pdtincar');
        var pdtincar = { account: temp.account, commodities: commodities }

        // 设置缓存
        wx.setStorageSync('pdtincar', pdtincar);

        this.setData({
            commodities,
            accountInfo,
            is_show: is_show,
            is_show_deliveryPrice: is_show_deliveryPrice,
            deliveryPrice: commodities[shopidx] ? commodities[shopidx].deliveryPrice : false
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

    // 开闭订单商店
    changeT: function(e) {
        var shopid = e.currentTarget.dataset.shopid;
        var shoplist = this.data.commodities;
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
        this.setData({
            commodities: shoplist
        })
    },

    // 再逛逛
    goshop: function(e) {
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: '/pages/shopindex/shopindex?shopid=' + shopid,
        })
    },

    // 提交订单
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
                    }
                }
            }
        }
        orderinfo = {
            type: 'cart',
            shop_id: shop_id,
            account: this.data.accountInfo.allCount,
            totalPrice: this.data.accountInfo.allAccount,
            commodity: commodity
        }
        wx.setStorageSync('makeorder', orderinfo)
        wx.navigateTo({
            url: '/pages/doorder/doorder',
        })
    }

})