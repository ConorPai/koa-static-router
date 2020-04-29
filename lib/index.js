const fs = require('fs')
const Path = require('path')
const send = require('koa-send')

async function get_Route_FilePath(ctx,data,next)
{
    let dir,router
    // console.log('>>>>>>>>>>>',typeof(data) === 'object',data)
    if(typeof(data) === 'object')
    {
        if(data instanceof Array)
        {
            // console.log('for')
            for(var item of data){
                // console.log(item,ctx.request)
                if(ctx.request.url&&ctx.request.url.includes(item.router))
                {
                    dir = item.dir
                    router = item.router
                    console.log(item,router)
                    await toSend(ctx,dir,router,next)
                }
            }
        }
        else
        {
            // console.log('else')
            dir = data.dir
            router = data.router
        }
        
    }
    else
    {
         dir = router = data
    }
    if(!router)
    {
        return
    }

    return await toSend(ctx,dir,router,next)
}

async function toSend(ctx,dir,router,next){
    if (ctx.request.url.indexOf(router) == -1) {
        await next();
        return false;
    }
    const index = ctx.request.url.lastIndexOf(router)+router.length;
    var fileUrl = ctx.request.url.substring(index);
    var filePath = Path.join( dir,fileUrl);
    if (!fs.existsSync(filePath)) {
        await next();
        return false;
    }
    fileUrl = fileUrl == "" ? "/" : fileUrl;
    await send(ctx, fileUrl, {root:dir,index:"index.html"});
    return true;
}

function  static(data){
    return async function static (ctx,next){
        if(ctx.method !== 'HEAD' && ctx.method !== 'GET')
        {
            ctx.body = 'Method Not Allowed'
            await next()
            return;
        }
        if (ctx.body != null || ctx.status !== 404) {
            return;
        }
        if (await get_Route_FilePath(ctx,data,next))
            await next()
    }
}

module.exports =  static