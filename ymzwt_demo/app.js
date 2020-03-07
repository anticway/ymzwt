//
const express = require('express');
const auth = require('./wechat/auth')
const app = express();

/**
 * 1.服务器验证
 * {
  signature: 'b746d268fd46d0682c828399db0a95448eb23c92',
  echostr: '2744614684180346847',
  timestamp: '1583575948',
  nonce: '2057448213'
}
 */
//接受处理所有消息
app.use(
    auth()
)



// 验证监听
app.listen(3000, () => console.log('服务已启动'));