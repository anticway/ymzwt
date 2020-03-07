/*
 * 微信调用的唯一凭证
 *
 *  特点：
 *      1.唯一
 *      2.有效期为2小时，提前5分钟请求
 *      3.接口权限 每天2000次
 *  https请求方式: GET
 *      https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 *
 *  设计思路：
 *      1.首次，发送请求access_token，保存下来（格式，安全？）本地文件
 *      2.第二次之后
 *          - 本地读取文件，判断是否过期
 *              - 过期了
 *                  - 重新请求获取access_token，保持下来覆盖之前的文件（保证文件是唯一的）
 *              - 没过期
 *                  - 直接使用
 *      整理思路：
 *          - 读取本地文件（定义方法readAccessToken）
 *              -本地有文件
 *                  判断是否过期(isValidAccessToken)
 *                      - 过期了
 *                           - 重新请求获取access_token(getAccessToken)，保持下来覆盖之前的文件（保证文件是唯一的）(saveAccessToken)
 *                      - 没过期(true)
 *                           - 直接使用
 *              -本地没有文件
 *                  - 发送请求获取access_token(getAccessToken)，保存下来（本地文件）(saveAccessToken)，直接使用
 *
 */
// 引入request-promise-native
const rp = require('request-promise-native')
// 引入fs模块
const {writeFile, readFile} = require('fs')
// 引入config模块
const {appId,appSecret} = require('../config')

// 定义类，获取access_token
class Wechat {
    constructor() {
    }

    /**
     * 用来获取access_token
     *
     */
    getAccessToken(){
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;

        /** 库
         * request
         * request-promise-native  返回值是一个promise对象
         *  {
              access_token: '31_5ZwolxXsdwvBAJsg3YoqWIp_uhKaJ6jwdE3l1LDHQSSqurF2g3jhRs-tCtXzijhBopuYcalTocBDjbp-g5yBesl9VWstaXCOgxaT9QXH0qUQcEYkz_R7EtuVcjUAAFhACATTY',
              expires_in: 7200
            }
         */
        return  new Promise((resolve, reject) => {
            rp({method: 'GET', url, json: true})
                .then(res =>{
                    console.log(res)
                    //设置access_token的过期时间
                    res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
                    // 将promise对象状态改成正常
                    resolve(res)
                })
                .catch(err =>{
                    console.log(err)
                    // 将promise对象状态改成失败
                    reject('getAccessToken失败')
                })
        })
    }

    /**
     * 用来保存access_token
     * @param accessToken   要保存的凭证
     */
    saveAccessToken(accessToken){
        // 将对象转化成json字符串
        accessToken = JSON.stringify(accessToken);
        return new Promise((resolve,reject) =>{
            writeFile('./accessToken.txt', accessToken, err =>{
                if (!err){
                    console.log('文件保存成功~');
                    resolve();
                } else {
                    reject('saveAccessToken方法异常：' + err);
                }
            })
        })

    }

    /**
     * 用来读取access_token
     */
    readAccessToken(){
        return new Promise(((resolve, reject) => {
            readFile('./accessToken.txt', (err,data) => {
                if (!err) {
                    console.info('读取文件成功')
                    //将json字符串转为对象
                    data = JSON.parse(data);
                    resolve(data);
                }else {
                    reject('readAccessToken方法出了问题：' + err);
                }
            })
        }))
    }

    /**
     *  用来检测access_token是否有效的
     *  @param data
     */
    isValidAccessToken(data) {
        // 过期
        if (!data && !data.access_token && !data.expires_in) {
            return false;
        }
        // 有效期内
        return data.expires_in > Date.now();
    }

    /**
     * 用来获取没有过期的access_token
     * @returns {Promise<{access_token, expires_in: *}>} access_token
     */
    fetchAccessToken(){
        if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
            // 说明保存过且有效，直接使用
            return Promise.resolve({
                access_token: this.access_token,
                expires_in: this.expires_in
            })
        }
        return this.readAccessToken()
            .then(async res => {
                //本地有
                if (wechat.isValidAccessToken(res)) {
                    return Promise.resolve(res);
                } else {
                    const res = wechat.getAccessToken();
                    await this.saveAccessToken(res);
                    return Promise.resolve(res);
                }
            })
            .catch(async err => {
                //本地没有文件
                const res = wechat.getAccessToken();
                await this.saveAccessToken(res);
                return Promise.resolve(res);
            })
            .then(res => {
                // 将access_token挂载到this上
                this.access_token = res.access_token;
                this.expires_in = res.expires_in;
                return Promise.resolve(res);
            });
    }
}

const wechat = new Wechat()

/*    - 读取本地文件（定义方法readAccessToken）
*              -本地有文件
*                  判断是否过期(isValidAccessToken)
*                      - 过期了
*                           - 重新请求获取access_token(getAccessToken)，保持下来覆盖之前的文件（保证文件是唯一的）(saveAccessToken)
*                      - 没过期(true)
*                           - 直接使用
*              -本地没有文件
*                  - 发送请求获取access_token(getAccessToken)，保存下来（本地文件）(saveAccessToken)，直接使用
*/
// new Promise(((resolve, reject) => {
//     wechat.readAccessToken()
//         .then(res => {
//             //本地有
//             if (wechat.isValidAccessToken(res)) {
//                 resolve(res);
//             } else {
//                 const res = wechat.getAccessToken()
//                     .then(res => {
//                         // 保存下来（本地文件）（saveAccessToken）直接使用
//                         wechat.saveAccessToken(res).then(()=>{
//                             resolve(res);
//                         })
//                     }).catch(err => {
//                     reject('保存失败');
//                 })
//             }
//         }).catch(err => {
//             //本地没有文件
//             wechat.getAccessToken()
//             .then(res => {
//                 // 保存下来（本地文件）（saveAccessToken）直接使用
//                 wechat.saveAccessToken(res).then(()=>{
//                     resolve(res);
//                 })
//             }).catch(err => {
//             reject('保存失败');
//         })
//     });
// }))

wechat.fetchAccessToken();

