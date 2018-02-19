var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  "userId":String,
  "userName":String,
  "userPwd":String,
  // 订单
  "orderList":Array,
  // 购物车列表
  "cartList":[
    {
      "productId":String,
      "productName":String,
      "salePrice":String,
      "productImage":String,
      // 是否选中
      "checked":String,
      "productNum":String
    }
  ],
  // 地址列表
  "addressList":[
    {
      "addressId": String,
      "userName": String,
      "streetName": String,
      "postCode": Number,
      "tel": Number,
      "isDefault": Boolean
    }
  ]
});

module.exports = mongoose.model("User",userSchema);
