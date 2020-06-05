// pages/storeindex/storeorderback.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        items: [
            { name: '大黑耗子', value: '99', v: "55", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
            { name: '大黑耗子', value: '2', v: "1", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
            { name: '大黑耗子', value: '2', v: "1", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
            { name: '大黑耗子', value: '2', v: "1", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
            { name: '大黑耗子', value: '2', v: "1", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
            { name: '大黑耗子', value: '2', v: "1", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
            { name: '大黑耗子', value: '2', v: "1", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
            { name: '大黑耗子', value: '2', v: "1", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
            { name: '大黑耗子', value: '2', v: "1", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
            { name: '大黑耗子', value: '2', v: "1", url: "http://img.dcdy81.com/img/zixun/zixunchanggui10.png", price: "3.25", checked: 'true' },
        ]
    },

    // 选择事件回调
    checkboxChange: function(e) {},

    // 选择全部
    select_all: function() {
        let arr = this.data.items;
        for (let i of arr) {
            i.checked = true;
        }
        this.setData({ items: arr })
    },

    // 减少
    valuedown: function(e) {
        let index = e.target.dataset.index
        let arr = this.data.items
        if (arr[index].v > 1) {
            arr[index].v--
                this.setData({ items: arr })
        }
    },

    // 增加
    valueup: function(e) {
        let index = e.target.dataset.index
        let arr = this.data.items
        if (arr[index].v < arr[index].value) {
            arr[index].v++
                this.setData({ items: arr })
        }
    },

    // 确定
    order_back: function() {

    }
})