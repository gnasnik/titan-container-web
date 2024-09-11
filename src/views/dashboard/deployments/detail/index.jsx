import { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Tabs, 
  Typography,
  Button,
  Message,
  Radio,
} from '@arco-design/web-react';
import { IconCopy, IconPlus, IconMinus } from '@arco-design/web-react/icon';
import { useLocation } from 'react-router-dom';
import { 
  getDeploymentManifest, 
  updateDeployment, 
  getDeploymentLogs,
  getDeploymentShell,
  deleteDeploymentDomain,
  getDeploymentDomains,
  getIngress,
  updateIngress, 
} from '@/api/deployment';
import Editor from '@monaco-editor/react';
import yaml from 'js-yaml';
import Term from './term'
import DomainConfigModal from './modal';
import LogWindow from './logwindow';

const TabPane = Tabs.TabPane;

const App = () => {
  const location = useLocation();
  const [deploymentDesc, setDeploymentDesc] = useState([]);
  const [serviceDesc, setServiceDesc] = useState([]);
  const [manifest, setManifest] = useState('');
  const [logs, setLogs] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [serviceName, setServiceName] = useState('');
  const [domains, setDomains] = useState([]);
  const [websocket, setWebsokcet] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);
  const [ingress, setIngress] = useState('');

  const deploy = location.state;
  const params = {
    id: deploy.ID,
    area_id: deploy.AreaId,
  }
  
  console.log(deploy)

  const onGetDeploymentWebsocketURL = () => {
    getDeploymentShell(params).then( res => {
      if (res.code == 0) {
        const scheme = res.data.endpoint.Scheme == "https" ? "wss://" : "ws://";
        const endpoint = res.data.endpoint;
        const url = scheme + endpoint.Host + endpoint.ShellPath;
      
        setWebsokcet({url: url, token: endpoint.Token});
      }else{
        console.log(res.err);
      }
    })
}


  const onGetDeploymentLogs = () =>{
    getDeploymentLogs(params).then((res) => {
      if (res.code == 0) {
        let lines = [];
        res.data.logs.map((serviceLogs) => {
          if (serviceLogs.Logs) {
            serviceLogs.Logs.map((logLines) => {
              logLines.split('\n').map((line) => {
              lines.push(line);
              })
            })
          }
        })
        if (lines.length > 300) {
            lines.slice(-300)
        }
        setLogs(lines);
      }
    })
  }

  const onUpdateDeployment = () => {
    let yamlData = yaml.load(manifest);
    yamlData.AreaId = params.area_id;
    const jsonData = JSON.stringify(yamlData);
    updateDeployment(jsonData).then( (res) => {
      if (res.code === 0) {
        Message.success('Success')
      }else {
        Message.error(res.err)
      }
    })
  }

  const onGetIngress = () => {
    getIngress(params).then((res) => {
      if (res.code == 0) {

        const data = res.data.ingress;
        const yamlData = yaml.dump(data);
  
  
        setIngress(yamlData);
      
      }
    })
  }

  const onUpdateIngress = () => {
    const yamlData = yaml.load(ingress);
    const jsonData = JSON.stringify(yamlData);
    updateIngress(params, jsonData).then( (res) => {
      if (res.code === 0) {
        Message.success('Success')
      }else {
        Message.error(res.err)
      }
    })
  }

  const onGetDeploymentDomains = () => {
    getDeploymentDomains(params).then( (res) => {
     if (res.code == 0) {
          const ds = res.data.domains.map( item => {
            return item.Name
        })
        setDomains(ds);
     }else{
        // Message.error('Get Domains: ', res);
     }
    })
  }

  const onDelteDeploymentDomains = (params) => {
    deleteDeploymentDomain(params).then( (res) => {
      if (res.code == 0 ) {
          Message.success('Success');
          onGetDeploymentDomains();
      }else{
        Message.error('出错了');
      }
    })
  }

  const formateService = (services) => {
      return services.map((service) => {          
  
          var ports = '';
          if (service.Ports) {
              ports = service.Ports.map( (item) => {
              return item.Port + '->' + item.ExposePort;
            })
          }


          var sum = 0;
          if (service.Storage) {
            service.Storage.map( (item) => {
              sum += item.Quantity}
            )}

          
          service.Storage = sum;
          service.Ports = ports;
          
         return service
      })
  }

  const getActiveState = (services) => {
    if (services.length == 0) return 'InActive'
    return services.map((service) => {
       if (service.Status.TotalReplicas != service.Status.ReadyReplicas) {
         return 'InActive'
       }
       return 'Active';
     })
   }

  

  const onGetDeploymentManifest = () => {
    getDeploymentManifest(params).then((res) => {
      const data = res.data.deployment;
      const yamlData = yaml.dump(data);
      let services = [];
      var isPersistent = 'false';
      data.Services.map(service => {
        isPersistent = service.Storage.map(item => {return isPersistent | item.Persistent})  == 1 ?'true': 'false';
        services.push(service.Name);
      })

      setManifest(yamlData);
      setServiceOptions(services);

      let urls = [];
      var service = {
        Image: '',
        CPU: 0,
        Memory: 0,
        Storage: 0,
        Ports: '',
        Status: {
          AvailableReplicas: '',
          ReadyReplicas: '',
          TotalReplicas: '',
        }
      };

      if (data.Services.length > 0) {
        if (data.Services[0].Ports) {
          data.Services[0].Ports.map( (item) => {
            urls.push( data.Services[0].Name + '-np.' + data.ID + ":"+ item.Port);
          })
        }
        data.ClusterURL = urls;
  
        data.Persistent = isPersistent;
  
        service = formateService(data.Services)[0];
        setServiceName(service.Name);
      }

      const depDesc = [
        {
            label: 'ID',
            value:  data.ID,
            span: 4,
        },
        {
          label: 'State',
          value: getActiveState(data.Services),
          span: 4,
        },
        {
          label: 'CreatedTime',
          value: deploy.CreatedAt,
        }]
        
      const srvDesc =  [
        {
          label: 'Provider',
          value: data.ProviderID,
        },
        {
          label: 'ClusterURL',
          value: data.ClusterURL,
        },
        {
          label: 'Image',
          value: service.Image,
          },
        {
          label: 'CPU(Cores)',
          value: service.CPU,
        },
        {
          label: 'GPU(Cores)',
          value: service.GPU,
        },
        {
          label: 'Memory(GiB)',
          value: service.Memory/1000,
        },
        {
          label: 'Storage(GiB)',
          value: service.Storage/1000,
        },
        {
          label: 'Persistent',
          value: data.Persistent,
        },
        {
          label: 'Available',
          value: service.Status.AvailableReplicas,
        },
        {
          label: 'Ready Replicas',
          value: service.Status.ReadyReplicas,
        },
        {
          label: 'Total',
          value: service.Status.TotalReplicas,
        },
        {
          label: 'Expose Port',
          value: service.Ports,
        },
      ];

      setServiceDesc(srvDesc);
      setDeploymentDesc(depDesc)
    })
  }

  const onClickTab = (key) => {
    if (key == 'details') {
      onGetDeploymentManifest();
    } else if (key == 'manifest') {
      onGetDeploymentManifest()
    } else if (key == 'logs') {
      onGetDeploymentLogs();
    }else if (key == 'ingress') {
      onGetIngress();
    }
  }

  useEffect(() => {
    onGetDeploymentManifest();
    onGetDeploymentDomains();
    onGetDeploymentWebsocketURL();
    // onGetIngress();
  }, [])

    return (
      <div style={{display: 'flex'}}>
         <Card style={{width: '100vw', padding: 20}}>
            <DomainConfigModal visible={visibleModal} setVisible={setVisibleModal} id={deploy.ID} reload={onGetDeploymentDomains}></DomainConfigModal>
            <Typography.Title>Deployment detail</Typography.Title>
            <Descriptions colon=' :' layout='inline-horizontal' size='large'  data={deploymentDesc} />
            <Typography.Text type=''>Domains: </Typography.Text>
            <Button type='primary' shape='circle' size='mini' style={{marginLeft: 10}} icon={<IconPlus />} onClick={() => {setVisibleModal(true)}}/>
            {domains? domains.map( (domain,index) => {
              return (
                  <div  key={index} style={{display: 'flex', marginTop: 10}}>
                    <Button type='primary' status='danger' shape='circle' size='mini' style={{marginRight: 10, width: 18, height:18}} icon={<IconMinus />} 
                        onClick={() => { onDelteDeploymentDomains({id: deploy.ID, host: domain})}}/> 
                    <a href={'https://' + domain} target='_blank' style={{color: '#165DFF'}}>{'https://' + domain}</a>
                    <IconCopy style={{marginLeft: 10, fontSize: 18}} onClick={() => {
                        navigator.clipboard.writeText(domain);
                        Message.success("Copied");
                      }}/>
                  </div>
              )
            }): <></>}

            <Typography.Text>Services : </Typography.Text>
            <Radio.Group
              type='button'
              name='serviceName'
              value={serviceName}
              onChange={setServiceName}
              style={{ marginBottom: 10, marginTop: 10 }}
              options={serviceOptions}
            ></Radio.Group>

            <Tabs defaultActiveTab='details' size='large'   onClickTab={onClickTab}>
            <TabPane key='details' title='DETAILS'>
            <Descriptions
              column={1}
              title='Services'
              data={serviceDesc}
              style={{ marginBottom: 20 }}
              labelStyle={{ paddingRight: 36 }}
            />
            </TabPane>
            <TabPane key='manifest' title='MANIFEST' >
                <Button type='primary' style={{ margin: 20}} onClick={onUpdateDeployment}>Update</Button>
                <Editor height="60vh" value={manifest} onChange={setManifest}/>
            </TabPane>

            <TabPane key='logs' title='LOGS'>
           <Button type='primary' style={{marginBottom: 20}} onClick={onGetDeploymentLogs}>Reflesh</Button>
            {/* {logs.map((line, index) => {
              return <Typography.Paragraph type={line.includes('Error') ? 'error': ''} key={index}>{line}</Typography.Paragraph> 
            })} */}
            <LogWindow logs={logs}></LogWindow>
           
            </TabPane>
            <TabPane key='terminal' title='TERMINAL'>
              <Term websocket={websocket} serviceName={serviceName}></Term>
            </TabPane>
            <TabPane key='ingress' title='INGRESS'>
                <Button type='primary' style={{ margin: 20}} onClick={onUpdateIngress}>Update</Button>
                <Editor height="60vh" value={ingress} onChange={setIngress}/>
            </TabPane>
            </Tabs>
        </Card>
      </div> 
    )
}

export default App
