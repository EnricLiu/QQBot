/*
//  Author:   Lechi66(EnricLiu)
//  Version:  ?
//  Date:     2023/11/26
//  DocRef:   https://www.xfyun.cn/doc/spark/%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E.html
//            https://bot.q.qq.com/wiki/develop/nodesdk/
//
//  test
//
*/
const fs = require('fs');
const NeDB = require('nedb');
const { createOpenAPI, createWebsocket } = require('qq-guild-bot');




async function readAPI() {
  try{
    let {SparkConfig: sparkcfg, QQBotConfig: qqbotcfg, guildID: gid, channelID: cid} = JSON.parse(fs.readFileSync('APIconfig.json'));
    SparkConfig = sparkcfg;
    QQBotConfig = qqbotcfg;
    guildID = gid;
    channelID = cid;
    console.log('[INFO]   APIconfig.json 读取成功');
  }
  catch(err){
    console.log(err);

  };
};

async function main(){
  try {
    await readAPI();
    const client =  createOpenAPI(QQBotConfig);// 创建 client
    const wsQQBot = createWebsocket(QQBotConfig);// 创建websocket连接

    wsQQBot.on('GUILD_MESSAGES', ( data ) => {
      console.log(data);
      if( 'attachments' in data.msg ){
        console.log(data.msg.attachments);
      };
    });
  } 
  catch(err){
    console.log(err);
  };
};
// const dbContext = new NeDB({
//   filename: './contxt.db',
//   autoload: true
// });// 实例化context数据库
// const dbMember = new NeDB({
//   filename: './user.db',
//   autoload: true
// });// 实例化context数据库

main();