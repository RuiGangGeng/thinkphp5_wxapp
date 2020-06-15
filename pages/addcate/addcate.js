import WxValidate from '../../utils/WxValidate.js'
const app = getApp()
const util = require('../../utils/util.js')
Page({

    data: {
        param: {
            image: '/image/add_goods.png'
        },
        onSync: false
    },

    onLoad: function(e) {

        this.setData({ 'param.shop_id': e.shop_id })

        // 初始化验证
        this.initValidate()
    },

    // 字段输入
    bindInput: function(e) {
        let that = this
        let field = e.currentTarget.dataset.field
        let p = that.data.param;
        p[field] = e.detail.value
        that.setData({
            param: p
        })
    },

    // 选择图片
    chooseImage() {
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

    // 提交
    onSubmit: function() {
        let that = this

        // 立即进入异步状态
        that.setData({
            onAsync: true
        })

        // 验证
        if (!this.Validate.checkForm(that.data.param)) {
            const error = this.Validate.errorList[0]
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
        wx.uploadFile({
            url: app.globalData.api_host + "wechat/Util/upload",
            filePath: that.data.param.image,
            name: 'file',
            success: function(res) {
                if (JSON.parse(res.data).code == 200) {

                    that.setData({
                        'param.image': JSON.parse(res.data).data,
                    })

                    // 提交数据
                    util.wxRequest('wechat/Shop/setShopsCategory', that.data.param, res => {
                        wx.showToast({
                            title: res.msg,
                            icon: res.code == 200 ? 'success' : 'none'
                        })

                        if (res.code = 200) {
                            wx.navigateBack()
                        } else {
                            that.setData({
                                onASync: false
                            })
                        }
                    })
                }
            }
        })
    },

    // 验证规则
    initValidate: function() {
        const rules = {
            name: {
                required: true,
            },
            image: {
                required: true,
            },
        }
        const messages = {
            name: {
                required: "请输入分类名称",
            },
            image: {
                required: "请上传分类图片",
            },

        }
        this.Validate = new WxValidate(rules, messages)
    }
})