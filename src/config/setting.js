/**
 * @description 公共配置文件
 * @author hu-snail 1217437592@qq.com
 */
export const setting = {
  // 是否开启登录拦截, mock数据的时候可以启用
  loginInterception: true,
  // 默认展开路由
  defaultOpeneds: ['/comp', '/errorPage', '/chart'],
  // token名称
  tokenName: 'token',
  // 标题
  title: 'titan container',
  // 版权信息
  copyright: '©Titan Network',
  // 路由白名单不经过token校验的路由
  routesWhiteList: ['/login', '/register', '/404', '/401']
};
