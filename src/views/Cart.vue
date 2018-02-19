<template>
	<div>
    	<nav-header></nav-header>
    	<nav-bread>
      		<span>My Cart</span>
    	</nav-bread>
    <div class="container">
      <div class="cart">
        <div class="page-title-normal">
          <h2 class="page-title-h2"><span>My Cart</span></h2>
        </div>
        <div class="item-list-wrap">
          <div class="cart-item">
            <div class="cart-item-head">
              <ul>
                <li>Items</li>
                <li>Price</li>
                <li>Quantity</li>
                <li>Subtotal</li>
                <li>Edit</li>
              </ul>
            </div>
            <ul class="cart-item-list">
              <li v-for="item in cartList">
                <!-- 是否选中、图片、商品名 -->
                <div class="cart-tab-1">
                  <!-- 1 -->
                  <div class="cart-item-check">
                    <!-- 是否选中 -->
                    <a href="javascipt:;" class="checkbox-btn item-check-btn" v-bind:class="{'check':item.checked =='1'}" @click="editCart('checked',item)">
                      <svg class="icon icon-ok">
                        <use xlink:href="#icon-ok"></use>
                      </svg>
                    </a>
                  </div>
                  <!-- 2 -->
                  <div class="cart-item-pic">
                    <img v-lazy="'/static/'+item.productImage" v-bind:alt="item.productName">
                  </div>
                  <!-- 3 -->
                  <div class="cart-item-title">
                    <div class="item-name">{{item.productName}}</div>
                  </div>
                </div>
                <!-- 单件商品的价格 -->
                <div class="cart-tab-2">
                  <div class="item-price">{{item.salePrice|currency('$')}}</div>
                </div>
                <!-- 购物车费数量的加减 -->
                <div class="cart-tab-3">
                  <div class="item-quantity">
                    <div class="select-self select-self-open">
                      <div class="select-self-area">
                        <a class="input-sub" @click="editCart('minus',item)">-</a>
                        <span class="select-ipt">{{item.productNum}}</span>
                        <a class="input-add" @click="editCart('add',item)">+</a>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 单个商品的总价 -->
                <div class="cart-tab-4">
                  <div class="item-price-total">{{(item.productNum*item.salePrice)}}</div>
                </div>
                <!-- 点击的删除图标 -->
                <div class="cart-tab-5">
                  <div class="cart-item-opration">
                    <a href="javascript:;" class="item-edit-btn"  @click="delCartConfirm(item.productId)">
                      <!-- <svg class="icon icon-del">
                        <use xlink:href="#icon-del">111</use>
                      </svg> -->
                      <button> 删除</button>
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="cart-foot-wrap">
          <div class="cart-foot-inner">
            <div class="cart-foot-l">
              <div class="item-all-check">
                <a href="javascipt:;" @click="toggleCheckAll">
                  <span class="checkbox-btn item-check-btn" v-bind:class="{'check':checkAllFlag}">
                      <svg class="icon icon-ok"><use xlink:href="#icon-ok"/></svg>
                  </span>
                  <span>Select all</span>
                </a>
              </div>
            </div>
            <div class="cart-foot-r">
              <div class="item-total">
                Item total: <span class="total-price">{{totalPrice|currency('$')}}</span>
              </div>
              <div class="btn-wrap">
                  <!-- 数量为0的时候，禁止跳转 -->
                <a class="btn btn--red" v-bind:class="{'btn--dis':checkedCount==0}" @click="checkOut">Checkout</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal :mdShow="modalConfirm" @close=" ">
      <p slot="message">你确认要删除此条数据吗?</p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;" @click="delCart">确认</a>
        <a class="btn btn--m btn--red" href="javascript:;" @click="modalConfirm = false">关闭</a>
      </div>  
    </Modal>
    	<nav-footer></nav-footer>
	</div>
</template>
<script>
    import './../assets/css/checkout.css'
    import NavHeader from '@/components/NavHeader'
    import NavFooter from '@/components/NavFooter'
    import NavBread from '@/components/NavBread'
    import Modal from '@/components/Modal'
    import {currency} from './../util/currency'
    import axios from 'axios'
    export default{
         data(){
            return{
                cartList:[],
                // productId全局缓存起来
                productId:'',
                modalConfirm:false
                
            }
        },
        computed:{
          // 对属性计算了，data里面就不需要声明了
          checkAllFlag(){
             // 返回true的条件是所有的商品都选中了，就是选中的数量与购物车的数量相等
            return this.checkedCount == this.cartList.length;
          },
          // 选中的数量
          checkedCount(){
            var i = 0;
            this.cartList.forEach((item)=>{
              if(item.checked=='1')i++;
            })
            return i;
          },
          totalPrice(){
            var money = 0;
            this.cartList.forEach((item)=>{
              if(item.checked=='1'){
                money += parseFloat(item.salePrice)*parseInt(item.productNum);
              }
            })
            return money;
          }
        },
        mounted(){
            this.init();
        },
        // s表示定义多个过滤器
        filters:{
          currency:currency
        },
        methods:{
            //初始化，拿到购物车的数据 
            init(){
              axios.get("/users/cartList").then((response)=>{
                  let res = response.data;
                  this.cartList = res.result;
              });
            },
            // 显示删除弹框
            delCartConfirm(productId){
              this.productId = productId;
              this.modalConfirm = true;
            },
            // 删除商品
            delCart(){
              axios.post("/users/cartDel",{
                productId:this.productId
              }).then((response)=>{
                let res = response.data;
                if(res.status == '0'){
                  this.modalConfirm = false;
                  this.init();
                }
              })
            },
            // 关闭模态框的方法
            closeModal(){
              this.modalConfirm = false;
            },
            // 编辑商品数量加减
            editCart(flag,item){
                if(flag == 'add'){
                  item.productNum++;
                }else if(flag =="minus"){
                  if(item.productNum<=1){
                    return
                  }
                  item.productNum--;
                }else{
                  // 用于修改是否选中，点击之后取反
                  item.checked = item.checked=="1"?'0':'1';
                }
                axios.post("/users/cartEdit",{
                  productId:item.productId,
                  productNum:item.productNum,
                  checked:item.checked
                }).then((response)=>{
                  let res = response.data;
                })
            },
            // 选中和取消选中
            toggleCheckAll(){
                var flag = !this.checkAllFlag;
                this.cartList.forEach((item)=>{
                  item.checked = flag?'1':'0';
                })
                axios.post("/users/editCheckAll",{
                  checkAll:flag
                }).then((response)=>{
                    let res = response.data;
                    if(res.status=='0'){
                        console.log("update suc");
                    }
                })
            },
            // 结算 checkout
            checkOut(){
                if(this.checkedCount>0){
                    //页面跳转
                    this.$router.push({
                        path:"/address"
                    });
                }
            }
        },
    	   components:{
            NavHeader,
            NavFooter,
            NavBread,
            Modal
    	}
    }
</script>
<style>
  .input-sub,.input-add{
    min-width: 40px;
    height: 100%;
    border: 0;
    color: #605F5F;
    text-align: center;
    font-size: 16px;
    overflow: hidden;
    display: inline-block;
    background: #f0f0f0;
  }
  .item-quantity .select-self-area{
    background:none;
    border: 1px solid #f0f0f0;
  }
  .item-quantity .select-self-area .select-ipt{
    display: inline-block;
    padding:0 3px;
    width: 30px;
    min-width: 30px;
    text-align: center;
  }
</style>