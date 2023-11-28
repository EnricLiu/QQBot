# QQBot-Spark

#### 介绍
QQBotSDK，接入了讯飞Spark大模型，为群友的与弱智吧吧主对线的精神需要提供了赛博平替。
不觉得这很酷吗？作为一名理工男我觉得这太酷了，很符合我对未来生活的想象，科技并带着趣味。

#### 软件架构
“他说他是乱写的”


#### 安装教程

1.  安装node.js
2.  ```npm install --save qq-guild-bot crypto-js```
3.  git clone
4.  在main.js同级新建APIconfig.json文件(待会说)
4.  node main.js
5.  激爽对线 

#### 配置APIconfig.json文件
APIconfig.json是一个形如：
```
    {"SparkConfig": 
        {
            "APPID":      "",
            "APISecret":  "",
            "APIKey":     "",
            "Version":    1
        },
    "QQBotConfig":
        {
            "appID":    "",
            "token":    "",
            "intents":  ["PUBLIC_GUILD_MESSAGES", "DIRECT_MESSAGE", "GUILD_MESSAGES"],
            "sandbox":  false
        },
    "guildID":    "",
    "channelID":  ""
    }
```
的JSON文件，SparkConfig是讯飞Spark API的配置，QQBotConfig是QQBot API的配置，在相应的平台都能找到相应的值。
guildID和channelID作为程序默的认QQ频道号和子频道号，填不填无所谓，以后会添加自动获取功能（**现在必须给我填👊👊👊**）


#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  哈哈 ᕕ(◠ڼ◠)ᕗ
2.  芝士我首次使用JavaScript和Node.JS
3.  芝也士我首次尝试使用面向对象编程
4.  写得拉 别骂我
5.  别骂了真别骂了
6.  不会特技
