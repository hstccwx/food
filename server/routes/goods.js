var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall',{useMongoClient: true});

mongoose.connection.on("connected", function () {
  console.log("MongoDB connected success.")
});

mongoose.connection.on("error", function () {
  console.log("MongoDB connected fail.")
});

// 断开
mongoose.connection.on("disconnected", function () {
  console.log("MongoDB connected disconnected.")
});


// 获取商品列表函数
router.get('/list',function(req,res,next){
	let page = parseInt(req.param("page"));

	let pageSize = parseInt(req.param("pageSize"));

	let sort = req.param("sort");

	let skip = (page-1)*pageSize;

	let priceLevel = req.param("priceLevel");

	var priceGt = '',priceLte = '';
	let params = {};

	if(priceLevel != 'all'){
		switch(priceLevel){
			case '0':priceGt =0;priceLte=100;break;
			case '1':priceGt =100;priceLte=500;break;
			case '2':priceGt =500;priceLte=1000;break;
			case '3':priceGt =1000;priceLte=5000;break;
		}
		params = {
			salePrice:{
				$gt:priceGt,
				$lte:priceLte
			}
		}
	}
	// limit 用来指定返回结果的最大数量
	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
	goodsModel.sort({'salePrice':sort});
	goodsModel.exec(function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:err.message
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:{
					count:doc.length,
					// doc是查出来的集合
					list:doc
				}
			});
		}
	});
});

// 加入购物车
// get和post，获取参数的方法是不一样的
router.post("/addCart",function(req,res,next){
	// 假设已经登录了，获取商品 productId
	var userId = '100000077',productId = req.body.productId;
	var User = require('../models/user');
	// 第一个参数是查询的条件，userDoc返回当前的用户信息
	User.findOne({userId:userId},function(err,userDoc){
		if(err){
			// 如果没有这个用户
			res.json({
				status:"1",
				msg:err.message
			});
		}else{
			console.log("userDoc:" + userDoc);
			if(userDoc){
				// 拿到商品之后，遍历用户的购物车，查看是否有这件商品
				// 有的话，数量加1就可以了
				var goodsItem = '';
				// 遍历购物车
				userDoc.cartList.forEach(function(item){
					// item表示当前遍历到的商品
					if(item.productId == productId){
						goodsItem = item;
						item.productNum ++;
					}
				});
				// 如果当前的购物车有这件商品
				if(goodsItem){
					userDoc.save(function(err2,doc2){
						if(err2){
							res.json({
								status:'1',
								msg:err2.message
							});
						}else{
							res.json({
								status:'0',
								msg:'',
								resultL:'suc'
							})
						}
					});
				}else{
					// 购物车没有就添加一条新的数据
					Goods.findOne({productId:productId},function(err1,doc){
						if(err1){
							res.josn({
								status:'1',
								msg:err1.message
							})
						}else{
							// 拿到商品当前的商品信息，添加属性添加到当前用户下
							if(doc){
								// 添加2个属性
								doc.productNum =1;
								// 加入购物车默认是选中的
								doc.checked = 1;
								userDoc.cartList.push(doc);
								userDoc.save(function(err2,doc2){
									if(err2){
										res.json({
											status:"1",
											msg:err2.message
										});
									}else{
										res.json({
											status:'0',
											msg:'',
											result:'suc'
										});
									}
								});
							}
						}
					});
				}
			}
		}
	});
})


module.exports = router;

