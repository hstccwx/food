var express = require('express');
var router = express.Router();
var User = require('./../models/user');
require('./../util/util')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 登录
router.post("/login", function (req,res,next) {
  var param = {
      userName:req.body.userName,
      userPwd:req.body.userPwd
  }
  User.findOne(param, function (err,doc) {
      if(err){
          res.json({
              status:"1",
              msg:err.message
          });
      }else{
          if(doc){
              res.cookie("userId",doc.userId,{
                  //指定存储位置和有效时间
                  path:'/',
                  maxAge:1000*60*60
              });
              res.cookie("userName",doc.userName,{
                path:'/',
                maxAge:1000*60*60
              });
              //req.session.user = doc;
              res.json({
                  status:'0',
                  msg:'',
                  result:{
                  		// 用户名显示在页面上
                      userName:doc.userName
                  }
              });
          }
      }
  });
});

//登出接口
router.post("/logout", function (req,res,next) {
  // 清空cookie
  res.cookie("userId","",{
    path:"/",
    maxAge:-1
  });
  res.json({
    status:"0",
    msg:'',
    result:''
  })
});

// 校验，刷新之后不会退出
router.get("/checkLogin", function (req,res,next) {
  if(req.cookies.userId){
      res.json({
        status:'0',
        msg:'',
        result:req.cookies.userName || ''
      });
  }else{
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    });
  }
});

//查询当前用户的购物车数据
router.get("/cartList", function (req,res,next) {
  var userId = req.cookies.userId;
  User.findOne({userId:userId}, function (err,doc) {
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
          if(doc){
            res.json({
              status:'0',
              msg:'',
              result:doc.cartList
            });
          }
      }
  });
});

//购物车删除
router.post("/cartDel", function (req,res,next) {
  var userId = req.cookies.userId,productId = req.body.productId;
  // mongo api提供的方法
  User.update({
    // 找到用户信息
    userId:userId
  },{
    // 删除数组元素
    $pull:{
      'cartList':{
        'productId':productId
      }
    }
  }, function (err,doc) {  
    // 回调函数
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  });
});

//修改商品数量
router.post("/cartEdit", function (req,res,next) {
  var userId = req.cookies.userId,
      productId = req.body.productId,
      productNum = req.body.productNum,
      checked = req.body.checked;
  User.update({"userId":userId,"cartList.productId":productId},{
    // 更新子文档的方式
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked,
  }, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  })
});

// 全选
router.post("/editCheckAll", function (req,res,next) {
  var userId = req.cookies.userId,
      checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId:userId}, function (err,user) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      if(user){
        user.cartList.forEach((item)=>{
          item.checked = checkAll;
        })
        user.save(function (err1,doc) {
            if(err1){
              res.json({
                status:'1',
                msg:err1,message,
                result:''
              });
            }else{
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              });
            }
        })
      }
    }
  });
});

//查询用户地址接口
router.get("/addressList", function (req,res,next) {
  var userId = req.cookies.userId;
  User.findOne({userId:userId}, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:doc.addressList
      });
    }
  })
});

//设置默认地址接口
router.post("/setDefault", function (req,res,next) {
  var userId = req.cookies.userId,
      addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status:'1003',
      msg:'addressId is null',
      result:''
    });
  }else{
    User.findOne({userId:userId}, function (err,doc) {
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
        var addressList = doc.addressList;
        addressList.forEach((item)=>{
          if(item.addressId ==addressId){
            // 相同的这个为true
             item.isDefault = true;
          }else{
            // 其他的为false
            item.isDefault = false;
          }
        });

        doc.save(function (err1,doc1) {
          if(err){
            res.json({
              status:'1',
              msg:err.message,
              result:''
            });
          }else{
              res.json({
                status:'0',
                msg:'',
                result:''
              });
          }
        })
      }
    });
  }
});

//删除地址接口
router.post("/delAddress", function (req,res,next) {
  var userId = req.cookies.userId,addressId = req.body.addressId;
  User.update({
    userId:userId
  },{
    $pull:{
      'addressList':{
        'addressId':addressId
      }
    }
  }, function (err,doc) {
      if(err){
        res.json({
            status:'1',
            msg:err.message,
            result:''
        });
      }else{
        res.json({
          status:'0',
          msg:'',
          result:''
        });
      }
  });
});


// 支付
router.post("/payMent", function (req,res,next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId,
    orderTotal = req.body.orderTotal;
    // 需要生产订单，往数据库里面插入数据
  User.findOne({userId:userId}, function (err,doc) {
     if(err){
        res.json({
            status:"1",
            msg:err.message,
            result:''
        });
     }else{
       var address = '',goodsList = [];
       //获取当前用户的地址信息
       doc.addressList.forEach((item)=>{
          if(addressId==item.addressId){
            address = item;
          }
       })
       //获取用户购物车的购买商品
       // filter 也可以实现遍历
       doc.cartList.filter((item)=>{
         if(item.checked=='1'){
          // 找到选中的商品存起来
           goodsList.push(item);
         }
       });

       // 创建订单的方法
       var platform = '622';
       // random 为0-1 *10表示1-10 floor表示1-9
       // 生成2个随机数
       var r1 = Math.floor(Math.random()*10);
       var r2 = Math.floor(Math.random()*10);

       // 自己扩展的方法
       var sysDate = new Date().Format('yyyyMMddhhmmss');
       var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
       // 拼接
       var orderId = platform+r1+sysDate+r2;
       var order = {
          orderId:orderId,
          orderTotal:orderTotal,
          addressInfo:address,
          goodsList:goodsList,
          orderStatus:'1',
          // 订单创建时间
          createDate:createDate
       };

       doc.orderList.push(order);

       doc.save(function (err1,doc1) {
          if(err1){
            res.json({
              status:"1",
              msg:err.message,
              result:''
            });
          }else{
            res.json({
              status:"0",
              msg:'',
              result:{
                orderId:order.orderId,
                orderTotal:order.orderTotal
              }
            });
          }
       });
     }
  })
});

//根据订单Id查询订单信息
router.get("/orderDetail", function (req,res,next) {
  var userId = req.cookies.userId,orderId = req.param("orderId");
  User.findOne({userId:userId}, function (err,userInfo) {
      if(err){
          res.json({
             status:'1',
             msg:err.message,
             result:''
          });
      }else{
         var orderList = userInfo.orderList;
         if(orderList.length>0){
           var orderTotal = 0;
           orderList.forEach((item)=>{
              if(item.orderId == orderId){
                orderTotal = item.orderTotal;
              }
           });
           if(orderTotal>0){
             res.json({
               status:'0',
               msg:'',
               result:{
                 orderId:orderId,
                 orderTotal:orderTotal
               }
             })
           }else{
             res.json({
               status:'120002',
               msg:'无此订单',
               result:''
             });
           }
         }else{
           res.json({
             status:'120001',
             msg:'当前用户未创建订单',
             result:''
           });
         }
      }
  })
});
module.exports = router;
