/**
 * 验证服务器有效性的模块
 * @returns {function(...[*]=)}
 */
const sha1 = require('sha1');
const config = require("../config")
// tool模块
const {getUserDataAsync,parseXmlAsync,formatMessage} = require("../untils/tool")
module.exports = () => {
    return async (req, res, next) => {
        // console.log(req.query)
        const {signature, echostr, timestamp, nonce} = req.query;
        const {token} = config

        // const arr = [timestamp, nonce, token];
        // const arrSort = arr.sort();
        // console.log(arrSort);
        //
        // const str = arr.join('');
        // console.log(str);
        // const sha1Str = sha1(str);
        // console.log(sha1Str);

        const sha1Str = sha1([timestamp, nonce, token].sort().join(''));
        if (req.method === 'GET') {

            if (sha1Str === signature) {
                res.send(echostr);
            } else {
                res.end();
            }
        } else if (req.method === 'POST') {
            if (sha1Str !== signature) {
                // 说明消息不是来自微信服务器
                res.send('error');
            }
            //console.info(res.query);
            /**
             {
                  signature: 'ade00ab4c8d1a840c546eb331226116746378e2e',
                  timestamp: '1583583149',
                  nonce: '131628283',
                  openid: 'oACrRwxOIgyR7wZWeuFbK7WX01NI'
                }
             */
            // console.log('-----------------------')
                // 接受请求体中的数据，数据流
            const xmlData = await getUserDataAsync(req);
            console.log(xmlData)
            /*
            <xml>
            <ToUserName><![CDATA[gh_67c516e90c3b]]></ToUserName> //开发者id
            <FromUserName><![CDATA[oACrRwxOIgyR7wZWeuFbK7WX01NI]]></FromUserName>   //用户openid
            <CreateTime>1583584337</CreateTime>     //发送的时间戳
            <MsgType><![CDATA[text]]></MsgType>     // 发送消息类型
            <Content><![CDATA[123]]></Content>      // 发送内容
            <MsgId>22671477948774749</MsgId>        // 消息id     微信服务器会默认保存3天，通过3天内可以查询到消息，3天后消失
            </xml>
             */

            // 将xml数据解析为js对象
            const jsData = await parseXmlAsync(xmlData);
            console.log(jsData);
            /**
             * {
                  xml: {
                    ToUserName: [ 'gh_67c516e90c3b' ],
                    FromUserName: [ 'oACrRwxOIgyR7wZWeuFbK7WX01NI' ],
                    CreateTime: [ '1583585050' ],
                    MsgType: [ 'text' ],
                    Content: [ '11223' ],
                    MsgId: [ '22671485782907207' ]
                  }
                }
             */
            // 格式化数据
            const message = formatMessage(jsData);
            console.log(message);
            // 简单的自动回复
            /**
             *
             *1、直接回复success（推荐方式） 2、直接回复空串（指字节长度为0的空字符串，而不是XML结构体中content字段的内容为空）

             一旦遇到以下情况，微信都会在公众号会话中，向用户下发系统提示“该公众号暂时无法提供服务，请稍后再试”：

             1、开发者在5秒内未回复任何内容 2、开发者回复了异常数据，比如JSON数据等

             另外，请注意，回复图片（不支持gif动图）等多媒体消息时需要预先通过素材管理接口上传临时素材到微信服务器，可以使用素材管理中的临时素材，也可以使用永久素材。
             */
                // 判断用户发送的消息是否是文本消息
            let content = '';
            if (message.MsgType === 'text') {
                if (message.Content === '1') {
                    content = '大吉大利';
                }else if (message.Content === '2') {
                    content = '落地成盒';
                } else if (message.Content.match('爱')) {
                    content = '我爱你'
                }
            }
            let replyMessage = `<xml>
                <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                <CreateTime>${Date.now()}</CreateTime>
                <MsgType><![CDATA[text]]></MsgType>
                <Content><![CDATA[${content}]]></Content></xml>`;
            res.end(replyMessage);
        } else {
            res.end('error');
        }

        /**
         * 微信服务器会发送两种类型的消息给开发者服务器
         *  1. GET请求
         *      - 验证服务器的有效性
         *  2. POST请求
         *      - 微信服务器
         */

    }
}
