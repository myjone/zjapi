const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const mongoose = require('mongoose')
const path = require('path')
//用于校验请求体
const parameter = require('koa-parameter')
const app = new Koa();
const routing = require('./routes')
const { connectionStr } = require('./config')
//链接数据库
mongoose.connect(connectionStr, { useUnifiedTopology: true }, () => { console.log('MongoDB 链接成功了') });
//当链接数据库出错的时候
mongoose.connection.on('error', (error) => {
    console.log(error)
})
//静态资源
app.use(koaStatic(path.join(__dirname, '/static/')))
app.use(error({
    //判断环境返回不通的报错信息
    postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === "production" ? rest : { stack, ...rest }
}))
app.use(koaBody({
    multipart: true,//表示启用文件s
    formidable: {
        uploadDir: path.join(__dirname, '/static/uploads'),//保存的目录
        keepExtensions: true,//保存文件的扩展名字
    }
}))
app.use(parameter(app))
routing(app)
app.listen(3000, () => {
    console.log('server start 3000 successful')
})