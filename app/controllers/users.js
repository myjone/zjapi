// const db = [{ name: "李雷" }]
const jsonwebtoken = require('jsonwebtoken')
const {secret} = require('../config')
const User = require('../models/users')
class UsersCtl {
    async  find(ctx) {
        const {page_num =1,page_size=10} = ctx.query;
        const pageNum = Math.ceil(page_num*1,1)-1
        const pageSize = Math.ceil(page_size*1,1);
        ctx.body = await User
        .find({name:new RegExp(ctx.query.q)})
        .limit(pageSize).skip(pageNum*pageSize);
    }
    async findById(ctx) {
        const {fields =" "}  = ctx.query;
        const selectFields = fields.split(';').filter(f=>f).map(f=>'+'+f).join('');
        const populateStr = fields.split(';').filter(f=>f).map(f=>{
            if(f== 'employments'){
                return 'employments.company employments.job'
            }else if(f=='educations'){
                return 'educations.school educations.major'
            }
        }).join(' ');
        const user = await User.findById(ctx.params.id)
        .select(selectFields)
        .populate(populateStr);
        if (!user) {
            ctx.throw(404, '用户不存在')
        } else {
            ctx.body = user
        }
    }
    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        const { name } = ctx.request.body;
        const repeatedUser = await User.findOne({ name })
        if (repeatedUser) {
            ctx.throw(409, "用户已经占用")
        }
        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }
//检查是不是我自己
    async checkOwner(ctx,next){
        console.log(ctx.state)
            if(ctx.params.id !== ctx.state.user._id){
                ctx.throw(403,'你没有权限')
            }
            await next()
    }
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false },
            avatar_url:{type:'string',required:false},
            gender:{type:'string',required:false},
            headline:{type:'string',required:false},
            locations:{type:'array',itemType:'string',required:false},
            business:{type:'string',required:false},
            employments:{type:'string',itemType:'object',required:false},
            educations:{type:'string',itemType:'object',required:false},
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body,{new:true})
        console.log(user)
        if (!user) { ctx.throw(404, '用户不存在') }
        ctx.body = user
    }

    async delete(ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id)
        if (!user) { throw (404, '用户不存在') }
        ctx.status = 204

    }
    //用户登录接口
    async login(ctx){
        //校验请求体参数
            ctx.verifyParams({
                name:{type:'string',required:true},
                password:{type:'string',required:true}
            })
            const user = await User.findOne(ctx.request.body)
            if(!user){ctx.throw(401,'用户名或密码不正确')}
            const {_id,name} = user 
            const token = jsonwebtoken.sign({_id,name},secret,{expiresIn:'1d'})
            ctx.body ={token}

    }

    //中间键
    async checkUserExist(ctx,next){
        const user = await User.findById(ctx.params.id);
        if(!user){ctx.throw(404,'用户不存在')}
        await next()
    }
    //获取用户的关注者
    async listFollowing(ctx){
        console.log(ctx)
        const user = await  User.findById(ctx.params.id).select('+following').populate('following');
        if(!user){ctx.throw(404)}
        ctx.body = user.following;
    }
    //关注粉丝
    async follow(ctx){
        console.log(ctx.state)
        const me = await User.findById(ctx.state.user._id).select('+following');
       // console.log(me)
        if(!me.following.map(id=>id.toString()).includes(ctx.params.id)){
            me.following.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204 
    }
    //取消关注
    async unfollow(ctx){
        console.log(ctx.state)
        const me = await User.findById(ctx.state.user._id).select('+following');
        const index = me.following.map(id=>id.toString()).indexOf(ctx.params.id)
        if(index>-1){
            me.following.splice(index,1);
            me.save();
        }
        ctx.status = 204 
    }

    //获取粉丝
    async listFollowers(ctx){
        const users = await  User.find({following:ctx.params.id});
        if(!users){ctx.throw(404)}
        ctx.body = users;
    }
    

    
}
module.exports = new UsersCtl();