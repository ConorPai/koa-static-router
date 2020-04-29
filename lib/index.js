const fs = require('fs')
const Path = require('path')
const send = require('koa-send')

async function get_Route_FilePath(ctx,data)
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
                    await toSend(ctx,dir,router)
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

    await toSend(ctx,dir,router)
}

async function toSend(ctx,dir,router){
    if (ctx.request.url.indexOf(router) == -1)
        return;
    const index = ctx.request.url.lastIndexOf(router)+router.length
    var fileUrl = ctx.request.url.substring(index)
    fileUrl = fileUrl == "" ? "/" : fileUrl
    await send(ctx, fileUrl, {root:dir,index:"index.html"})
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
        await get_Route_FilePath(ctx,data)
        await next()
    }
}

module.exports =  static









