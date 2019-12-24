const fs = require('fs')
module.exports =(app)=>{
    //readdirSync 同步读取出当前目录下文件名称 返回文件名称组成的数组
    fs.readdirSync(__dirname).forEach(file=>{
        if(file==='index.js'){
            return;
        }else{
            const route = require(`./${file}`);
            app.use(route.routes()).use(route.allowedMethods());
        }
    })
}