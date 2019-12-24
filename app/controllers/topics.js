
const Topic = require('../models/topics')
class TopicsCtl {
    async find(ctx){
        const {page_num =1,page_size=10} = ctx.query;
        const pageNum = Math.ceil(page_num*1,1)-1
        const pageSize = Math.ceil(page_size*1,1);
        ctx.body = await Topic
        .find({name:new RegExp(ctx.query.q)}) //模糊搜索
        .limit(pageSize).skip(pageNum*pageSize);
    }
    async findById(ctx){
        const {fields = " "} = ctx.query;
        const selectFields = fields.split(';').filter(f=>f).map(f=>'+'+f).join('');
        const topic = await Topic.findById(ctx.params.id).select(selectFields)
        ctx.body = topic
    }
    async create(ctx){
        ctx.verifyParams({
             name:{type:'string',required:true},
             avatar_url:{type:'string',required:false},
             introduction:{type:'string',required:false},
        })
        const topic = await  new Topic(ctx.request.body).save();
        ctx.body = topic;
    }

    async update(ctx){
         ctx.verifyParams({
            name:{type:'string',required:false},
            avatar_url:{type:'string',required:false},
            introduction:{type:'string',required:false},
         })
         const topic = await Topic.findByIdAndUpdate(ctx.params.id,ctx.request.body,{new:true})
         ctx.body = topic

    }
}
module.exports = new TopicsCtl();