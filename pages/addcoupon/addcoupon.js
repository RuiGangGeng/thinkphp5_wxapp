const app = getApp()
const util = require('../../utils/util.js')
import WxValidate from '../../utils/WxValidate.js'
Page({
    data: {
        shop_id: false,
        param: {},
        onSync: false
    },

    onLoad: function(options) {
        let that = this

        that.setData({ shop_id: options.shop_id, 'param.shop_id': options.shop_id })

        // 初始化验证
        that.initValidate()
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

    // 提交
    onSubmit: function() {
        let that = this

        // 立即进入异步状态
        that.setData({ onAsync: true })

        // 验证
        if (!this.Validate.checkForm(that.data.param)) {
            let error = this.Validate.errorList[0]
            wx.showToast({ title: error.msg, icon: "none" })
            that.setData({ onAsync: false })
            return false
        }
        if (that.data.param.full < that.data.param.full_reduction) {
            wx.showToast({ title: "满减不能大于满额", icon: "none" })
            return false
        }

        // 提交数据
        util.wxRequest('wechat/Shop/setShopsCoupon', that.data.param, res => {
            wx.showToast({ title: res.msg, icon: res.code == 200 ? 'success' : 'none' })

            if (res.code = 200) {
                setTimeout(() => {
                    wx.navigateBack()
                }, 2000)
            } else {
                that.setData({ onASync: false })
            }
        })
    },

    // 验证规则
    initValidate: function() {
        const rules = {
            name: {
                required: true,
            },
            full: {
                required: true,
            },
            full_reduction: {
                required: true,
            },
        }
        const messages = {
            name: {
                required: "请输入名称",
            },
            full: {
                required: "请输入满额",
            },
            full_reduction: {
                required: "请输入满减",
            },

        }
        this.Validate = new WxValidate(rules, messages)
    }
})