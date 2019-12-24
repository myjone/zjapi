const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix:'/topics'})
const {find,findById,create,update,
} = require('../controllers/topics')
const {secret} = require('../config')
//中间键
const auth = jwt({secret})
router.get('/',find)
router.post("/",auth,create)
router.get("/:id",findById)
//修改话题信息
router.patch('/:id',auth,update)
module.exports = router