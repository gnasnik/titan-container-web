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
  getDeploymentDomains } from '@/api/deployment';
import Editor from '@monaco-editor/react';
import yaml from 'js-yaml';
import Term from './term'
import DomainConfigModal from './modal';

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
  const [websocket, setWebsokcet] = useState('');
  const [visibleModal, setVisibleModal] = useState(false);

  const deploy = location.state;
  const params = {
    id: deploy.ID
  }

  const onGetDeploymentWebsocketURL = () => {
    getDeploymentShell(params).then( res => {
      if (res.code == 0) {
        const scheme = res.data.shell.Scheme == "https" ? "wss://" : "ws://";
        setWebsokcet(scheme + res.data.shell.Host + res.data.shell.ShellPath);
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
    const yamlData = yaml.load(manifest);
    const jsonData = JSON.stringify(yamlData);
    updateDeployment(jsonData).then( (res) => {
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
     }
    })
  }

  const onDelteDeploymentDomains = (params) => {
    deleteDeploymentDomain(params).then( (res) => {
      if (res.code == 0 ) {
          Message.success('Success');
          onGetDeploymentDomains();
      }else{
        Message.success('出错了');
      }
    })
  }

  const formateService = (services) => {
      return services.map((service) => {
          const storage = service.Storage
          const ports = service.Ports.map( (item) => {
            return item.Port + '->' + item.ExposePort;
          })
         
          let sum = 0;
          storage.map( s => { sum += s.Quantity})
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
      data.Services.map(service => {
        services.push(service.Name);
      })

      setManifest(yamlData);
      setServiceOptions(services);

      const service = formateService(data.Services)[0];
      setServiceName(service.Name);

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
          label: 'Image',
          value: service.Image,
          },
        {
          label: 'CPU',
          value: service.CPU,
        },
        {
          label: 'Memory',
          value: service.Memory,
        },
        {
          label: 'Storage',
          value: service.Storage,
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
    }
  }

  useEffect(() => {
    onGetDeploymentManifest();
    onGetDeploymentDomains();
    onGetDeploymentWebsocketURL();
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
                    <a href={domain} target='_blank' style={{color: '#165DFF'}}>{ 'https://' + domain}</a>
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
            {logs.map((line, index) => {
              return <Typography.Paragraph type={line.includes('Error') ? 'error': ''} key={index}>{line}</Typography.Paragraph> 
            })}
            </TabPane>
            <TabPane key='terminal' title='TERMINAL'>
              <Term websocketUrl={websocket} serviceName={serviceName}></Term>
            </TabPane>
            </Tabs>
        </Card>
      </div> 
    )
}

export default App
