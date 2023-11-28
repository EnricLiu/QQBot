const ws = require('ws');
const url = require('url');
const HmacSHA256 = require('crypto-js/hmac-sha256');
const Base64 = require('crypto-js/enc-base64');
const UTF8 = require('crypto-js/enc-utf8');

class Spark{
    constructor(SparkConfig){
      this.Config = SparkConfig;
    };
    get ws() {
        return new ws(this.Url());
    };// WebSocket
    Url(){
        let UTC_date = new Date(Date.now()).toUTCString();//获取RFC1123时间 .toLocaleString()
        let tmp = `host: spark-api.xf-yun.com
date: ${UTC_date}
GET /v${this.Config.Version}.1/chat HTTP/1.1`;// 原始tmp 
        let tmp_sha = HmacSHA256(tmp, this.Config.APISecret).toString();
        let signature = Buffer.from(tmp_sha, 'hex').toString('base64');// 最抽象的一集
        let authorization_origin = `api_key="${this.Config.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
        let authorization = Base64.stringify(UTF8.parse(authorization_origin));// 最复杂的一集
      return url.format({
        protocol: 'ws',
        hostname: 'spark-api.xf-yun.com',
        pathname: `/v${this.Config.Version}.1/chat`,
        query: {
            authorization: authorization,
            date: UTC_date,
            host: 'spark-api.xf-yun.com'
        },
      });
    };// 获取鉴权URL

    getReply(MsgContent){
      return new Promise((resolve, reject) => {
        let SparkReply = '';
        let wsSpark = this.ws;// 创建websocket连接

        let SendToSparkMsg = {
          header: {
            app_id: this.Config.APPID,
          },
          parameter: {
            chat: {
              domain: "general",
              temperature: 0.5,
              max_tokens: 1024,
              top_k: 2,
            }
          },
          payload: {
            message: {
              "text": [
                { role: "user", content: MsgContent }
              ]
            }
          }
        };// Spark消息结构体
    
        wsSpark.on('open', (data, err) => {
          if (err) {
            console.log(`[ERR] wsSpark_Open_ERR: ${err}`);
            reject(err);
          }
          console.log('[INFO] SparkAPI鉴权成功 回答中');
          wsSpark.send(JSON.stringify(SendToSparkMsg));
        });// 发送SendToSparkMsg
        wsSpark.on('message', (data, err) => {
          if (err) {
            console.log(`[ERR] wsSpark_Message_ERR: ${err}`);
            reject(err);
          };
          if (JSON.parse(data).header.code != 0){
            resolve('李再嗦神魔？');
          }
          else {
            if (JSON.parse(data).payload.choices.status == 0) {
              SparkReply = '';
            }
            SparkReply += JSON.parse(data).payload.choices.text[0].content;
            if (JSON.parse(data).payload.choices.status == 2) {
              //console.log('[Spark] ' + SparkReply);
              resolve(SparkReply);
            };
          }
        });
      });
    };// getReply

};

module.exports = Spark;
// let spark = new Spark(SparkConfig);
// spark.getReply("你好");