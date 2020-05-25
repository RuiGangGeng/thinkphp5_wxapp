import WxValidate from '../../utils/WxValidate.js'
const util = require('../../utils/util.js');
//获取应用实例
const app = getApp()
Page({

    data: {
        param: {
            image: '/image/add_goods.png',
            detailimg: '/image/add_goods.png',
        },
        categories: [],
        categoriesSelectName: "请选择",
        onAsync: false,
    },

    onLoad: function(e) {
        this.setData({
            'param.shop_id': e.shop_id
        })

        // 更新之前获取商品信息
        if (e.id) {
            util.wxRequest("wechat/Shop/get_good", { id: e.id }, res => {
                if (res.code == 200) {
                    this.setData({
                        param: res.data
                    })
                }
            })
        }

        // 获取分类
        util.wxRequest("wechat/Shop/getCategories", { shop_id: this.data.param.shop_id }, res => {
            if (res.code == 200) {
                this.setData({
                    categories: res.data
                })
            }
        })

        this.initValidate()
    },


    // 选择图像
    chooseImage: function(e) {
        let that = this
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album'],
            success: function(res) {
                let image = res.tempFilePaths[0]
                that.setData({
                    'param.image': image,
                })
            },
        })
    },

    // 选择图像
    choosedetailimg: function(e) {
        let that = this
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album'],
            success: function(res) {
                let detailimg = res.tempFilePaths[0]
                that.setData({
                    'param.detailimg': detailimg,
                })
            },
        })
    },

    // 选择Picker
    bindPicker: function(e) {
        let that = this
        let name = e.currentTarget.dataset.name
        let list = e.currentTarget.dataset.list
        let param = e.currentTarget.dataset.param

        let p = that.data.param;
        p[param] = that.data[list][e.detail.value].id
        for (let i in that.data) {
            if (i == name) {
                that.setData({
                    [name]: that.data[list][e.detail.value].name,
                    param: p
                })
            }
        }
    },

    // 上传
    upload: function(e) {
        let that = this
        if (that.data.onAsync) {
            return false;
        } else {
            that.setData({
                onAsync: true
            })
        }

        Object.assign(that.data.param, e.detail.value);

        // 验证
        if (!this.ValidateName.checkForm(that.data.param)) {
            const error = this.ValidateName.errorList[0]
            wx.showToast({
                title: error.msg,
                icon: "none"
            })
            that.setData({
                onAsync: false
            })
            return false
        }

        // 上传图片
        wx.showLoading({
            title: '提交中',
        })
        wx.uploadFile({
            url: app.globalData.api_host + "wechat/Util/upload",
            filePath: that.data.param.image,
            name: 'file',
            success: function(res) {
                if (JSON.parse(res.data).code == 200) {
                    that.setData({
                        'param.image': JSON.parse(res.data).data,
                    })
                    wx.uploadFile({
                        url: app.globalData.api_host + "wechat/Util/upload",
                        filePath: that.data.param.detailimg,
                        name: 'file',
                        success: function(res) {
                            if (JSON.parse(res.data).code == 200) {
                                that.setData({
                                    'param.detailimg': JSON.parse(res.data).data,
                                })
                                that.submit()
                            }
                        }
                    })
                }
            }
        })
    },

    // 提交
    submit: function() {
        let that = this
        util.wxRequest("wechat/shop/add_goods", that.data.param, res => {
            res.code == 200 ? (wx.showToast({
                title: res.msg,
            }), setTimeout(function() {
                wx.navigateBack({})
            }, 1500)) : (
                wx.showToast({
                    title: res.msg,
                    icon: "none"
                }),
                that.setData({
                    onAsync: false
                })
            )
        })
    },

    // 验证
    initValidate: function() {
        const rules = {
            name: {
                required: true,
            },
            price: {
                required: true,
            },
            price_orig: {
                required: true,
            },
            specifications: {
                required: true,
            },
            category_id: {
                required: true,
            },
        }
        const messages = {
            name: {
                required: "请填写产品名称",
            },
            specifications: {
                required: "请填写商品规格",
            },
            category_id: {
                required: "请选择分类",
            },
            price_orig: {
                required: "请填写原价",
            },
            price: {
                required: "请填写价格",
            },
        }
        this.ValidateName = new WxValidate(rules, messages)
    }
})