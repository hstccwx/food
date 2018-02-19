<template>
    <div>
      <nav-header></nav-header>
      <nav-bread>
        <span>Goods</span>
      </nav-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a href="javascript:void(0)" class="price" v-bind:class="{'sort-up':sortFlag}" @click="sortGoods()">Price <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
            <a href="javascript:void(0)" class="filterby stopPop" @click.stop="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- filter -->
            <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a href="javascript:void(0)" @click="setPriceFilter('all')" v-bind:class="{'cur':priceChecked=='all'}">All</a></dd>
                <dd v-for="(item,index) in priceFilter">
                  <a href="javascript:void(0)" @click="setPriceFilter(index)" v-bind:class="{'cur':priceChecked==index}">{{item.startPrice}} - {{item.endPrice}}</a>
                </dd>
              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="item in goodsList">
                    <div class="pic">
                       <!-- 图片懒加载 -->
                      <a href="#"><img v-lazy="'static/'+item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price">{{item.salePrice}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="view-more-normal"
                   v-infinite-scroll="loadMore"
                   infinite-scroll-disabled="busy"
                   infinite-scroll-distance="20">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
      <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
         <p slot="message">
            请先登录,否则无法加入到购物车中!
         </p>
         <div slot="btnGroup">
             <a class="btn btn--m" href="javascript:;" @click="mdShow = false">关闭</a>
         </div>
      </modal>
      <!-- modal子组件触发，通知父组件触发这个closeModal事件 -->
      <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
       	<p slot="message">
         		<svg class="icon-status-ok">
         		  <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
         		</svg>
         		<span>加入购物车成!</span>
       	</p>
       	<div slot="btnGroup">
       	<!-- 这里引导用户 -->
         		<a class="btn btn--m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
         		<router-link class="btn btn--m btn--red" href="javascript:;" to="/cart">查看购物车</router-link>
       	</div>
       </modal>
      <!-- 窗口变小的遮盖层 -->
      <div class="md-overlay" v-show="overLayFlag" @click.stop="closePop"></div>
      <nav-footer></nav-footer>
    </div>
</template>
<script>
	import './../assets/css/base.css'
	import './../assets/css/product.css'
	import './../assets/css/login.css'
	import NavHeader from '@/components/NavHeader'
	import NavFooter from '@/components/NavFooter'
	import NavBread from '@/components/NavBread'
	import Modal from '@/components/Modal'
	import axios from 'axios'

	export default {
		data(){
			return{
				//商品列表
				goodsList:[],
				// 左边的价格区间
				priceFilter:[
					{
						startPrice:'0.00',
						endPrice:'500.00',
					},
					{
						startPrice:'500.00',
						endPrice:'1000.00',
					},
					{
						startPrice:'1000.00',
						endPrice:'2000.00',
					},
				],
				// 默认显示的是全部的数据
				priceChecked:'all',
				// 价格正序/反序
				sortFlag:true,
				// 每页显示的条数
				pageSize:8,
				// 默认显示的是第一页
				page:1,
				// 滚动加载控制
				busy:true,
				// load用于滚动加载的动画显示
                loading:false,
                // 屏幕缩小之后显示
                filterBy:false,
                // 控制遮罩层显示或者隐藏
                overLayFlag:false,
                // 未登录
                mdShow:false,
                mdShowCart:false
			}
		},
		components:{
			NavHeader,
			NavFooter,
			NavBread,
			Modal
		},
		mounted(){
			this.getGoodsList()
		},
		methods:{
			getGoodsList(flag){
				var param = {
					page:this.page,
					pageSize:this.pageSize,
					sort:this.sortFlag?1:-1,
					// 默认显示的是全部
					priceLevel:this.priceChecked
				};
				this.loading = true;
				axios.get("/goods/list",{
					 params:param
				}).then((response) =>{
					var res = response.data;
					// 加载完之后，加载动画不显示
					this.loading = false;
					if(res.status =='0'){
						// 通过flag 判断是不是滚动加载的
						if(flag){
							this.goodsList = this.goodsList.concat(res.result.list)
							if(res.result.count==0){
								// 如果数量为0,表示数据记载完了，busy 为true表示禁用
								this.busy = true;
							}else{
								this.busy = false;
							}
						}else{
							this.goodsList = res.result.list;
							this.busy = false;
						}
					}else{
						this.goodsList =[];
					}
				});
			},
			// 价格正反序
			sortGoods(){
				this.sortFlag = !this.sortFlag;
				this.page = 1;
				// 重新获取数据
				this.getGoodsList();
			},
			// 滚动加载更多
			loadMore(){
				this.busy = true;
				// 不如不设置鼠标事件会不停地触发
				setTimeout(() => {
					this.page++;
					this.getGoodsList(true);
				},500);
			},
			// 左边的价格筛选
			setPriceFilter(index){
				this.priceChecked = index;
				this.page = 1;
				// 重新获取数据
				this.getGoodsList();
				// 窗口变小之后，选择价格之后关闭
				this.closePop();
			},
			showFilterPop(){
              this.filterBy=true;
              this.overLayFlag=true;
            },
            closePop(){
              this.filterBy=false;
              this.overLayFlag=false;
            },
            addCart(productId){
            	axios.post("/goods/addCart",{
            		productId:productId
            	}).then((res) => {
            		var res = res.data;
            		if(res.status == 0){
            			this.mdShowCart = true;
            		}else{
            			this.mdShow = true;
            		}
            	})
            },
            closeModal(){
              this.mdShow = false;
              this.mdShowCart = false;
            }
		}
	}
</script>

