import Storage from '../../utils/storage'

// pages/cart/cart.js
const app = getApp();
Page({

    data: {
        flag: true, //购物车存在或者不存在展示的主体
        cart_img: "http://gw.alicdn.com/tfscom/TB1xdQSJFXXXXcuXXXXy7S8WFXX-176-176.png",

        // 加入购物车的商品
        commodities: [],asd 
        account: 0,
        accountInfo: {
            allCount: 0,
            allAccount: 0,
        },
        checkedAll: false,
    },

    onLoad: function (options) {
        var pdt = wx.getStorageSync('pdtincar');
        console.log(options)
        var allCount = 0;
        var allAccount = 0;
        if (pdt) {
            var arr = pdt.commodities;
            arr.forEach(function (item, index) {
                (item.commodity).forEach(function (items, indexs) {
                    if (items.selected) {
                        allCount = allCount + items.count;
                        allAccount = (allAccount*1 + items.price * items.count).toFixed(2);
                    }
                })
            })
        }
        this.setData({
            accountInfo: {
                allCount: allCount,
                allAccount: allAccount
            },
        })
    },

    onShow: function () {

        if (wx.getStorageSync('pdtincar')) {
            console.log(wx.getStorageSync('pdtincar'))
            var commodities = wx.getStorageSync('pdtincar').commodities;

            for(let i of commodities){
                for(let s of i.commodity){
                    s.price0 = s.price.split('.')[0]
                    s.price1 = s.price.split('.')[1]
                }
            }

            this.setData({
                commodities: commodities
            })
            var numstr = wx.getStorageSync('pdtincar').account.toString();
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
            if (allCount - 1 >0){
                allCount = allCount - 1;
                allAccount = allAccount - commodities[shopidx]['commodity'][commodityidx].price * 1;
            } else {
                allCount = 0;
                allAccount = 0;
            }
            
            if (count - 1 == 0) {
                
                // wx.showToast({ title: "宝贝数量已经不能再减少啦！", icon: 'none' });
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
        } else if (event === 'increase') {
            allCount = allCount*1 + 1;
            allAccount = allAccount*1 + commodities[shopidx]['commodity'][commodityidx].price * 1;
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
        wx.setStorageSync('pdtincar', pdtincar);
        console.log(wx.getStorageSync('pdtincar'))
        this.onLoad();
    },
    // 选择 店铺 或 商品
    checked: function (ev) {
        let dataset = ev.currentTarget.dataset;
        console.log(dataset)
       var commodities = [].slice.call(this.data.commodities),
            type = dataset.type,
            shopidx = dataset.shopidx;
        if (type === 'shop') {
            let selected = commodities[shopidx]['selected'];
            if (selected) {
                // 取消选中当前店铺包括商品全部
                this.setSelected(commodities, shopidx, null, false);
            } else {
                // 全部选中当前店铺包括商品
                this.setSelected(commodities, shopidx, null, true);
            }
        } else {
            let commodityIdx = dataset.index,
                selected = commodities[shopidx]['commodity'][commodityIdx].selected;
            if (selected) {
                // 取消选中当前店铺包括商品全部
                this.setSelected(commodities, shopidx, commodityIdx, false);
            } else {
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
                allCount += i['count'];
                allAccount += i['price'] * i['count'];
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
        if (commodityIdx == undefined) {
            commodities[shopidx]['selected'] = boolean;
            commodities[shopidx].commodity.forEach(item => {
                item['selected'] = boolean;
                allCount += item['count'];
                allAccount += item['price'] * item['count'];
            });
            if (!boolean) {
                allAccount = allAccount * -1;
                allCount = allCount * -1
            };
        } else {
            commodities[shopidx].commodity[commodityIdx]['selected'] = boolean;
            allCount += commodities[shopidx].commodity[commodityIdx]['count'];
            allAccount += commodities[shopidx].commodity[commodityIdx]['price'] * commodities[shopidx].commodity[commodityIdx]['count'];
            if (!boolean) {
                allAccount = allAccount * -1;
                allCount = allCount * -1
            };
            let result = true;
            commodities[shopidx].commodity.forEach(item => {
                result = result && item['selected']
            });
            commodities[shopidx]['selected'] = result;
        }

        accountInfo['allCount'] += allCount;
        accountInfo['allAccount'] += allAccount;

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
    changeT: function (e) {
        console.log(e)
        var shopid = e.currentTarget.dataset.shopid;
        var shoplist = this.data.commodities;
        console.log(shoplist)
        shoplist.forEach(function (item, index) {
            if (item.shopid == shopid) {
                if (item.ishow == undefined || item.ishow == false) {
                    shoplist[index].ishow = true;
                } else {
                    shoplist[index].ishow = false;
                }
            }
        })
        console.log(shoplist)
        this.setData({
            commodities: shoplist
        })
    },

    //再逛逛
    goshop: function (e) {
        console.log(e)
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: '/pages/shopindex/shopindex?shopid=' + shopid,
        })
    },

    //提交订单
    doorder: function () {
        wx.navigateTo({
            url: '/pages/doorder/doorder',
        })
    }

})