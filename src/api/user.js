import request from '@/utils/request.js';
import { setting } from '@/config/setting';

const { tokenName } = setting;
export const login = async (params) =>
  request({
    url: '/api/v1/user/login',
    method: 'post',
    params
  });

export const getUserInfo = (accessToken) =>
  request({
    url: '/api/v1/user/info',
    method: 'post',
    // data: {
    //   [tokenName]: accessToken
    // }
  });

export const logout = () =>
  request({
    url: '/logout',
    method: 'post'
  });

export const register = async () =>
  request({
    url: '/register',
    method: 'post'
  });
