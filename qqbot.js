const { createOpenAPI, createWebsocket } = require('qq-guild-bot');
const Spark = require('./Spark');

class QQBot{
  constructor(QQBotConfig){
    this.Config = QQBotConfig;
    this.help = 
`你好：
  芝士基于官方SDK的QQ频道只因器人!可以调用SparkAPI与您激情对线!
  通用指令：
    1. /help或/帮助—查看本帮助
    2. /ping或/我测—查看哥们的状态
    3. /sign或/签到—签到爆哥们金币
    4. /reset或/布道—让Spark忘了你
    5. /info或/我的—查看自己的信息
    6. /token或/余量—还剩多少token
    78910JQK顺子
    114514./���—神秘功能ᕕ(◠ڼ◠)ᕗ
  后续功能gitee同步激情开发中!
  Star enricliu/qqbot-spark/ 谢谢喵!
`
  };
  get client(){
    return createOpenAPI(this.Config);
  };
  get ws(){
    return createWebsocket(this.Config);
  };
  get cmd(){
    return this.cmd();
  }

  async Reply(Msg, client, SparkConfig){
    try{
      let MsgProcessed = await this.Process(this.Parse(Msg), SparkConfig).catch(err=>console.log(err));
      return await this.Send(MsgProcessed, client).catch(err=>console.log(err));
    }catch(err){
      console.log(err);
    };
  };

  Parse(Msg){
    let MsgParsed = {
      msg_type: 0,
      author: {
      id: '',
      username: '',
      },
      msg_id: '',
      content: '',
      channelID: '',
      guildID: ''
    };// 接受消息的主要信息
    if(Msg.eventType === 'MESSAGE_CREATE'){
      if('content' in Msg.msg){
        MsgParsed.msg_type = 'TEXT';// 是文本
        MsgParsed.author.id = Msg.msg.author.id;
        MsgParsed.author.username = Msg.msg.author.username;
        MsgParsed.content = this.EmojiTrans(Msg.msg.content);
        MsgParsed.msg_id = Msg.msg.id;
        MsgParsed.channelID = Msg.msg.channel_id;
        MsgParsed.guildID = Msg.msg.guild_id;
      };
      if('attachments' in Msg.msg){
        MsgParsed.msg_type = 'MEDIA';// 是媒体
        MsgParsed.author.id = Msg.msg.author.id;
        MsgParsed.author.username = Msg.msg.author.username;
        MsgParsed.content = Msg.msg.attachments.url;
        MsgParsed.msg_id = Msg.msg.id;
        MsgParsed.channelID = Msg.msg.channel_id;
        MsgParsed.guildID = Msg.msg.guild_id;
      }
    };
    if(Msg.eventType === 'MESSAGE_DELETE'){
      MsgParsed.msg_type = 'RECALL';// 很快的撤
      MsgParsed.author.id = Msg.msg.message.author.id;
      MsgParsed.author.username = Msg.msg.message.author.username; 
      MsgParsed.msg_id = Msg.msg.message.id;
      MsgParsed.channelID = Msg.msg.message.channel_id;
      MsgParsed.guildID = Msg.msg.message.guild_id;
    };
    console.log(MsgParsed);
    return MsgParsed;// JSON
  };//分析得收到的消息return MsgParsed(JSON: author content, msg_id, msg_type)
  
  async Process(MsgParsed, SparkConfig){
    let MsgProcessed = MsgParsed;
    let Content = '';
    try {
      if      ( MsgProcessed.msg_type === 'TEXT' ){
        if(MsgParsed.content.charAt(0) == '/') {
          if      ( MsgParsed.content === '/help' || MsgParsed.content === '/帮助' ) { Content = this.help }
          else if ( MsgParsed.content === '/ping' || MsgParsed.content === '/我测' ) { Content = await this.cmd.ping() }
          else if ( MsgParsed.content === '/sign' || MsgParsed.content === '/签到' ) { Content = await this.cmd.sign() }
          else if ( MsgParsed.content === '/info' || MsgParsed.content === '/我的' ) { Content = await this.cmd.info() }
          else if ( MsgParsed.content === '/reset'|| MsgParsed.content === '/布道' ) { Content = await this.cmd.reset()}
          else if ( MsgParsed.content === '/token'|| MsgParsed.content === '/余量' ) { Content = await this.cmd.token()}
          else if ( MsgParsed.content === '/ᕕ(◠ڼ◠)ᕗ' ) { MsgProcessed = '6' }
          else    { Content = '指令不对 请不要冒充职业选手<emoji:14>' }
          //else if(  )
        }
        else { 
          let spark = new Spark(SparkConfig);
          Content = await spark.getReply(MsgParsed.content);
         }
      }else if(MsgProcessed.msg_type === 'MEDIA' ){
        Content = "看不懂捏(。_。)";
      }else if(MsgProcessed.msg_type === 'RECALL'){
        Content = "怎么撤了(｀へ´)?";
      } else  {
        console.log('[ERROR]  ' + MsgParsed.msg_type + ' 消息类型暂不支持');
        Content = "工口发生Σ( ° △ °|||)︴";
      };

      MsgProcessed.content = Content;
      delete MsgProcessed.msg_type;
      return MsgProcessed;
    } catch (err) {
      console.log('[ERROR]  qqbotProcessERR: ' + err);
    }

  };// return MsgProcessed(JSON: author, content, msg_id)

  async Send(MsgProcessed, client){
    try {
      // console.log("[MsgProcessed] " + MsgProcessed.content);
      let Msg = {
        content: `@${MsgProcessed.author.username} ${MsgProcessed.content}`,// spark回答
        msg_id: MsgProcessed.msg_id,// 回复msg id
        message_reference: {
          message_id: MsgProcessed.msg_id, 
          ignore_get_message_error: true,
        },
      }
      client.messageApi.postMessage(MsgProcessed.channelID, Msg).catch(err=>console.log(err));
      console.log('[QQBot]  ' + MsgProcessed.content);
    } catch (err) {
      console.log(err);
    };
  };// 发送Content消息

  async memberCheck(db) {
    let { data } = await client.guildApi.guildMembers(guildID,{limit: 1000});
    for (let i of data){
      dbMember.find({memberID: i.user.id}, (err)=>{
        if(err){
          db.insert({
            memberID: i.user.id,
            memberName: i.user.username,
          });
        }
      });
      console.log(i.user.id, i.user.username);
    };

  // };
  // memberCheck();

  };// 没试过

  async cmd(){
    async function ping(){
      return 'pong';
    };
    async function sign(){
      
    };
  }

  EmojiTrans(content){
    if ( content.indexOf("<emoji:") === -1 ) { return content; }
    else{
      let emojiDic = {
        "<emoji:14>":  "(emoji:嘲讽的微笑)",
        "<emoji:1>":   "(emoji:撇嘴)",
        "<emoji:2>":   "(emoji:色咪咪)",
        "<emoji:3>":   "(emoji:发呆)",
        "<emoji:4>":   "(emoji:得意)",
        "<emoji:6>":   "(emoji:害羞)",
        "<emoji:7>":   "(emoji:闭嘴)",
        "<emoji:8>":   "(emoji:要睡着了)",
        "<emoji:9>":   "(emoji:撒娇大哭)",
        "<emoji:10>":  "(emoji:尴尬)",
        "<emoji:11>":  "(emoji:愤怒万分)",
        "<emoji:12>":  "(emoji:调戏)",
        "<emoji:13>":  "(emoji:呲牙)",
        "<emoji:0>":   "(emoji:惊讶)",
        "<emoji:15>":  "(emoji:难过)",
        "<emoji:16>":  "(emoji:装酷)",
        "<emoji:96>":  "(emoji:冷汗)",
        "<emoji:18>":  "(emoji:抓狂)",
        "<emoji:19>":  "(emoji:吐了)",
        "<emoji:20>":  "(emoji:偷笑)",
        "<emoji:21>":  "(emoji:可爱)",
        "<emoji:22>":  "(emoji:白眼)",
        "<emoji:23>":  "(emoji:傲慢)",
        "<emoji:24>":  "(emoji:饥饿)",
        "<emoji:25>":  "(emoji:困倦)",
        "<emoji:26>":  "(emoji:惊恐)",
        "<emoji:27>":  "(emoji:流汗)",
        "<emoji:28>":  "(emoji:憨笑)",
        "<emoji:29>":  "(emoji:绿盔)",
        "<emoji:30>":  "(emoji:奋斗)",
        "<emoji:31>":  "(emoji:咒骂)",
        "<emoji:32>":  "(emoji:疑问)",
        "<emoji:33>":  "(emoji:小声点)",
        "<emoji:34>":  "(emoji:晕了)",
        "<emoji:35>":  "(emoji:折磨)",
        "<emoji:36>":  "(emoji:衰)",
        "<emoji:37>":  "(emoji:骷髅)",
        "<emoji:38>":  "(emoji:敲打)",
        "<emoji:39>":  "(emoji:再见)",
        "<emoji:97>":  "(emoji:擦汗)",
        "<emoji:98>":  "(emoji:抠鼻子)",
        "<emoji:99>":  "(emoji:嘲讽的鼓掌)",
        "<emoji:100>": "(emoji:糗大了)",
        "<emoji:101>": "(emoji:坏笑)",
        "<emoji:102>": "(emoji:左哼哼)",
        "<emoji:103>": "(emoji:右哼哼)",
        "<emoji:104>": "(emoji:哈欠)",
        "<emoji:105>": "(emoji:鄙视)",
        "<emoji:106>": "(emoji:委屈)",
        "<emoji:107>": "(emoji:快哭了)",
        "<emoji:108>": "(emoji:阴险的笑)",
        "<emoji:305>": "(emoji:右亲亲)",
        "<emoji:109>": "(emoji:左亲亲)",
        "<emoji:110>": "(emoji:受惊)",
        "<emoji:111>": "(emoji:可怜)",
        "<emoji:172>": "(emoji:调皮地眨眼)",
        "<emoji:182>": "(emoji:笑哭)",
        "<emoji:179>": "(emoji:DOGE)",
        "<emoji:173>": "(emoji:泪奔)",
        "<emoji:174>": "(emoji:无奈)",
        "<emoji:212>": "(emoji:托腮)",
        "<emoji:175>": "(emoji:幸灾乐祸)",
        "<emoji:178>": "(emoji:奸笑)",
        "<emoji:177>": "(emoji:吐血)",
        "<emoji:176>": "(emoji:皱眉)",
        "<emoji:183>": "(emoji:我最美)",
        "<emoji:262>": "(emoji:脑阔疼)",
        "<emoji:263>": "(emoji:沧桑)",
        "<emoji:264>": "(emoji:捂脸)",
        "<emoji:265>": "(emoji:地铁老人手机)",
        "<emoji:266>": "(emoji:哦呦)",
        "<emoji:267>": "(emoji:头秃)",
        "<emoji:268>": "(emoji:黑人问号)",
        "<emoji:269>": "(emoji:暗中观察)",
        "<emoji:270>": "(emoji:emmm)",
        "<emoji:271>": "(emoji:吃瓜)",
        "<emoji:272>": "(emoji:呵呵哒)",
        "<emoji:277>": "(emoji:狗头)",
        "<emoji:307>": "(emoji:喵喵头)",
        "<emoji:306>": "(emoji:牛气冲天)",
        "<emoji:281>": "(emoji:翻白眼)",
        "<emoji:282>": "(emoji:敬礼salute)",
        "<emoji:283>": "(emoji:狂笑)",
        "<emoji:284>": "(emoji:面无表情)",
        "<emoji:285>": "(emoji:摸鱼)",
        "<emoji:293>": "(emoji:摸锦鲤)",
        "<emoji:286>": "(emoji:魔鬼笑)",
        "<emoji:287>": "(emoji:喝茶)",
        "<emoji:289>": "(emoji:让我康康)",
        "<emoji:294>": "(emoji:期待)",
        "<emoji:297>": "(emoji:拜谢)",
        "<emoji:298>": "(emoji:元宝)",
        "<emoji:299>": "(emoji:牛啊)",
        "<emoji:300>": "(emoji:胖三斤)",
        "<emoji:323>": "(emoji:痛苦面具)",
        "<emoji:332>": "(emoji:加油2023)",
        "<emoji:336>": "(emoji:豹富)",
        "<emoji:353>": "(emoji:拜托拜托)",
        "<emoji:355>": "(emoji:可爱捏)",
        "<emoji:356>": "(emoji:双击666)",
        "<emoji:354>": "(emoji:尊嘟假嘟)",
        "<emoji:352>": "(emoji:咦)",
        "<emoji:357>": "(emoji:我裂开了)",
        "<emoji:334>": "(emoji:虎虎生威)",
        "<emoji:347>": "(emoji:大展宏兔)",
        "<emoji:303>": "(emoji:右拜年)",
        "<emoji:302>": "(emoji:左拜年)",
        "<emoji:295>": "(emoji:抢红包)",
        "<emoji:49>":  "(emoji:拥抱)",
        "<emoji:66>":  "(emoji:爱心)",
        "<emoji:63>":  "(emoji:鲜花)",
        "<emoji:64>":  "(emoji:凋谢)",
        "<emoji:187>": "(emoji:幽灵)",
        "<emoji:146>": "(emoji:生气)",
        "<emoji:116>": "(emoji:烈焰红唇)",
        "<emoji:67>":  "(emoji:心碎)",
        "<emoji:60>":  "(emoji:咖啡)",
        "<emoji:185>": "(emoji:羊驼)",
        "<emoji:76>":  "(emoji:点赞)",
        "<emoji:124>": "(emoji:OK)",
        "<emoji:118>": "(emoji:抱拳)",
        "<emoji:78>":  "(emoji:握手)",
        "<emoji:119>": "(emoji:勾引)",
        "<emoji:79>":  "(emoji:胜利)",
        "<emoji:120>": "(emoji:拳头)",
        "<emoji:121>": "(emoji:差劲)",
        "<emoji:77>":  "(emoji:点踩)",
        "<emoji:123>": "(emoji:NO)",
        "<emoji:201>": "(emoji:熊熊点赞)",
        "<emoji:273>": "(emoji:我酸了)",
        "<emoji:46>":  "(emoji:猪头)",
        "<emoji:112>": "(emoji:菜刀)",
        "<emoji:56>":  "(emoji:大刀)",
        "<emoji:169>": "(emoji:左轮)",
        "<emoji:171>": "(emoji:豆汁)",
        "<emoji:59>":  "(emoji:粑粑)",
        "<emoji:144>": "(emoji:喝彩)",
        "<emoji:147>": "(emoji:棒棒糖)",
        "<emoji:89>":  "(emoji:西瓜)",
        "<emoji:41>":  "(emoji:呆坐)",
        "<emoji:125>": "(emoji:转圈)",
        "<emoji:42>":  "(emoji:爱情)",
        "<emoji:43>":  "(emoji:左右横跳)",
        "<emoji:86>":  "(emoji:怄火)",
        "<emoji:129>": "(emoji:告别)",
        "<emoji:85>":  "(emoji:飞吻)"}
      for(let emoji in emojiDic){
        content = content.replaceAll(emoji, emojiDic[emoji]);
      };
    };
    return content;
  };
};


module.exports = QQBot;




