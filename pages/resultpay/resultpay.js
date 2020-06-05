Page({

    data: {
        flag: true
    },
    onLoad: function(options) {
        this.setData({
            flag: options.code == 500 ? false : true,
            id: options.id
        })
    },

    goindex: function(e) {
        // wx.switchTab({
        //     url: '/pages/index/index',
        // })
        wx.navigateTo({
            url: '/pages/dingdanxiangqing/dingdanxiangqing?act=detail&id=' + e.currentTarget.dataset.id,
        })
    },

})