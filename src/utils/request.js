/**
 * @description axios请求封装
 * @author hu-snail 1217437592@qq.com
 */

import axios from 'axios';
import { Message, Modal } from '@arco-design/web-react';
import config from '@/config/net.config';
// import { setting } from '@/config/setting';


import {
  getAccessToken, setAccessToken, removeAccessToken
} from '@/utils/accessToken';

// const { tokenName } = setting;
let tokenLose = true;

const { baseURL, successCode, invalidCode, requestTimeout, contentType } = config;

const instance = axios.create({
  baseURL,
  timeout: requestTimeout,
  headers: {
    'Content-Type': contentType
  }
});

// request interceptor
instance.interceptors.request.use(
  (configItem) =>  {
     // 在请求头中添加token
     const token = getAccessToken(); 
     if (token) {
       configItem.headers.JwtAuthorization = `Bearer ${token}`;
     }
    return  configItem
  },
  (error) =>
    // do something with request error
    Promise.reject(error)
);

// response interceptor
instance.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */
  (response) => {
    const res = response.data;
    // 请求出错处理
    // -1 超时、token过期或者没有获得授权
    if (res.code == 401 && tokenLose) {
      tokenLose = false;
      Modal.confirm({
        title: 'ReLogin',
        content: 'You have been disconnected or there is an error with your access rights. Please log in again.',
        okText: 'OK',
        cancelText: 'Cancel',
        onOk: () => {
          // 重新登录
          tokenLose = true;
          removeAccessToken();
          // window.location.reload();
          window.location.href = '/';
        },
        onCancel: () => {
          tokenLose = true;
        }
      });
    }

    if (successCode.indexOf(res.code) === -1) {
      Message.error(res.msg);
      return Promise.reject(res);
    }
    return res;
  },
  (error) => {
    Message.error('Error');
    return Promise.reject(error);
  }
);

export default instance;
