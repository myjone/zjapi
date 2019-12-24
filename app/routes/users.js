const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix:'/users'})
const {find,findById,create,update,
    delete:del,login,checkOwner,
    checkUserExist,
    listFollowing,
    follow,
    unfollow,
    listFollowers
} = require('../controllers/users')
const {secret} = require('../config')
//中间键
const auth = jwt({secret})
router.get('/',find)
router.post("/",create)
router.get("/:id",findById)
//修改用户信息
router.patch('/:id',auth,checkOwner,update)
//删除用户信息
router.delete('/:id',auth,checkOwner,del)
router.post('/login',login)
//获取粉丝列表
router.get('/:id/followers',listFollowers)
router.get('/:id/following',listFollowing)
router.put('/following/:id',auth,checkUserExist,follow)
router.delete('/following/:id',auth,checkUserExist,unfollow)
module.exports = router