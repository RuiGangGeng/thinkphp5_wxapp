Page({

    data: {
        flag: true
    },
    onLoad: function(options) {
        this.setData({
            flag: options.code == 500 ? false : true
        })
    },

    goindex: function() {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },

})