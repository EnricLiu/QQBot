/*
//  Author:   Lechi66
//  Version:  1.1.1
//  Date:     2023/11/25
//  DocRef:   https://www.xfyun.cn/doc/spark/%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E.html
//            https://bot.q.qq.com/wiki/develop/nodesdk/
//
//  Accomplished SparkAPI invoking(no context) and QQBotAPI replying
//  Accomplished basic Commands('/...') identify
//  Accomplished QQ emoji escape
//
*/
const fs = require('fs');
const spark = require('./Spark');
const QQBot = require('./qqbot');
const NeDB = require('nedb');
// const EventEmitter = require('events').EventEmitter;
// const Event = new EventEmitter(); 万一呢

let SparkConfig, QQBotConfig, guildID, channelID;


// 读取APIconfig.json文件，获取SparkConfig, QQBotConfig, guildID, channelID
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
    const qqbot = new QQBot(QQBotConfig);
    const client = qqbot.client;// 创建 client
    const wsqqbot = qqbot.ws;// 创建websocket连接

    wsqqbot.on('GUILD_MESSAGES', data => {
      qqbot.Reply(data, client, SparkConfig);
    });
  } catch (err) {
    console.error(err);
  }
};

main();