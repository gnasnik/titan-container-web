export default {
  //  axios 基础url地址
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://api-storage.container1.titannet.io', //http://localhost:8080
  // 操作正常返回的code,根据后端第一
  successCode: [200, 0],
  // 超时时间
  requestTimeout: 10 * 1000,
  // 请求content_type类型,根据后端配置定义
  contentType: 'application/json;charset=UTF-8',
  // 登录失效code
  invalidCode: -1
};
