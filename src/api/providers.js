import request from '@/utils/request.js';

export const getProviders = () =>
  request({
    url: '/api/v1/container/providers',
    method: 'get'
  });
