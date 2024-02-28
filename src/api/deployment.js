import request from '@/utils/request.js';

export const getDeployments = () =>
  request({
    url: '/api/v1/container/deployments',
    method: 'get'
  });

export const getDeploymentManifest = (params) =>
request({
    url: '/api/v1/container/deployment/manifest',
    method: 'get',
    params
})

export const createDeployment = (data) => 
  request({
    url: '/api/v1/container/deployment/create',
    method: 'post',
    data
  })

export const deleteDeployment = (data) => 
request({
    url: '/api/v1/container/deployment/delete',
    method: 'post',
    data
})

export const updateDeployment = (data) => 
request({
    url: '/api/v1/container/deployment/update',
    method: 'post',
    data
})

export const getDeploymentLogs = (params) => 
request({
  url: '/api/v1/container/deployment/logs',
  method: 'get',
  params
})


export const getDeploymentEvents = (params) => 
request({
  url: '/api/v1/container/deployment/events',
  method: 'get',
  params
})

export const getDeploymentDomains = (params) => 
request({
  url: '/api/v1/container/deployment/domains',
  method: 'get',
  params
})

export const addDeploymentDomain = (data) => 
  request({
    url: '/api/v1/container/deployment/domain/add',
    method: 'post',
    data
  })

export const deleteDeploymentDomain = (params) => 
  request({
    url: '/api/v1/container/deployment/domain/del',
    method: 'post',
    params
})

export const getDeploymentShell = (params) => 
request({
  url: '/api/v1/container/deployment/shell',
  method: 'get',
  params
})