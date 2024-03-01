import request from '@/utils/request.js';

export const getProviders = (params) =>
  request({
    url: '/api/v1/container/providers',
    method: 'get',
    params
  });
