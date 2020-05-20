const util = require('../../utils/util.js');
const app = getApp()
Page({
	data: {
		search: true,
		noneHidden: true,
		searchHidden: false,
		recentSearch: [],
		searchValue: '',
		shop_id: false,
		list: [],
		page: 0,
		searchKey: '',
	},

	onLoad: function () {
		this.setData({
			shop_id: app.globalData.shop_id
		})
	},

	// 搜索框获取焦点
	searchFocus: function () {
		let recentSearch = wx.getStorageSync('recentSearch') || [];
		this.setData({
			recentSearch: recentSearch,
			searchHidden: true,
			noneHidden: true,
			search: false,
		})
	},

	// 搜索框输入事件
	chanage: function (e) {
		this.setData({
			searchHidden: false,
			searchKey: e.detail.value,
		})
	},

	//搜索失去焦点时
	getvalue: function (e) {
		this.setData({
			searchHidden: false,
		})
	},

	// 点击搜索
	tapsearch: function () {
		this.setData({
			noneHidden: false,
			list: [],
			page: 0
		})
		this.loadData()
	},

	// 清楚缓存
	clearHistory: function () {
		wx.clearStorageSync('recentSearch')
		this.setData({
			recentSearch: []
		})
	},

	// 点击缓存搜索
	goSearch: function (e) {
		this.setData({
			searchKey: e.currentTarget.dataset.text,
			list: [],
			page: 0
		})
		this.loadData()
	},

	// 跳转商品详情
	toDetailTap: function (e) {
		wx.navigateTo({
			url: "/pages/gooddetail/gooddetail?id=" + e.currentTarget.dataset.id
		})
	},

	// 上拉加载
	onReachBottom: function () {
		this.loadData()
	},

	// 加载数据
	loadData: function () {
		let that = this;

		let keywords = that.data.searchKey
		if (keywords !== '') {
			let recentSearch = wx.getStorageSync('recentSearch') || [];
			if (!that.isStrInArray(keywords, recentSearch)) {
				recentSearch.unshift(that.data.searchKey);
				if (recentSearch.length > 5) {
					recentSearch = recentSearch.slice(0,4)
				}
				wx.setStorageSync('recentSearch', recentSearch)
				that.setData({
					recentSearch: recentSearch,
					page: 0,
					list: []
				})
			}
		}

		let param = {
			keyword: that.data.searchKey,
			page: that.data.page + 1,
			shop_id: that.data.shop_id
		}

		util.wxRequest("wechat/Shop/getSearch", param, res => {
			let temp = that.data.list.concat(res.data.data)

			for (let i of temp) {
				i.price1 = i.price.split('.')[1]
				i.price0 = i.price.split('.')[0]
			}

			that.setData({
				list: temp,
				searchHidden: false,
				noneHidden: true,
				page: res.data.current_page,
			})

			if (that.data.list.length == 0) {
				that.setData({
					searchHidden: false,
					noneHidden: false
				})
			}

			res.data.data.length == 0 ? wx.showToast({
				title: '暂无更多数据',
				icon: "none"
			}) : ''

		})
	},

	// 判断是否某个元素 是否存在于一维数组（这个函数可用 includes() 方法用来判断一个数组是否包含一个指定的值，如果是返回 true，否则false。）
	isStrInArray: function (item, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == item) {
                return true;
            }
        }
        return false;
	},
	
})