import { useRef, useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Tabs, 
  Typography,
  Button,
  Message,
  Radio
} from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import { useLocation } from 'react-router-dom';
import { 
  getDeploymentManifest, 
  updateDeployment, 
  getDeploymentLogs,
  getDeploymentShell,
  getDeploymentDomains } from '@/api/deployment';
import Editor from '@monaco-editor/react';
import yaml from 'js-yaml';
import Term from './term'

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

  const deploy = location.state;

  const params = {
    id: deploy.id
  }

  const onGetDeploymentWebsocketURL = () => {
    getDeploymentShell(params).then( res => {
        console.log(res)
      if (res.code == 0) {
        setWebsokcet("ws://" + res.data.shell.Host + res.data.shell.ShellPath);
      }else{
        console.log(res.err);
      }
    })
}

  const onGetDeploymentLogs = () =>{
    getDeploymentLogs(params).then((res) => {
      let lines = [];
      res.data.logs.map((serviceLogs) => {
        serviceLogs.Logs.map((logLines) => {
          logLines.split('\n').map((line) => {
          lines.push(line);
          })
        })
      })
      if (lines.length > 300) {
          lines.slice(-300)
      }
      setLogs(lines);
    })
  }

  const onUpdateDeployment = () => {
    const yamlData = yaml.load(manifest);
    const jsonData = JSON.stringify(yamlData);
    updateDeployment(jsonData).then( (res) => {
      if (res.code === 0) {
        Message.success('修改成功')
      }else {
        Message.error(res.err)
      }
    })
  }

  const onGetDeploymentDomains = () => {
    getDeploymentDomains(params).then( (res) => {
      console.log(res.data.domains);
      const ds = res.data.domains.map( item => {
         return 'https://' + item.Name
      })
      setDomains(ds);
    })
  }

  const formateService = (services) => {
      return services.map((service) => {
          const storage = service.Storage
          delete service.Ports
         
          let sum = 0;
          storage.map( s => { sum += s.Quantity})
          service.Storage = sum;
          
         return service
      })
  }

  const parseState = (state) => {
    switch (state) {
      case 1 : return "Active"
      case 2 : return "InActive"
      case 3 : return "Deleted"
      default: return "Unkown"
    }
  }


  const onGetDeploymentManifest = () => {
    getDeploymentManifest(params).then((res) => {
      const data = res.data.deployment;
      const yamlData = yaml.dump(data);
      let services = [];
      data.Services.map(service => {
        services.push(service.Name);
      })
      console.log(data);
      setManifest(yamlData);
      setServiceOptions(services);

      const service = formateService(data.Services)[0];

      const depDesc = [
        {
            label: 'ID',
            value:  deploy.id,
            span: 4,
        },
        {
          label: 'State',
          value: parseState(data.State),
        },
        {
          label: 'CreatedTime',
          value: deploy.created_time,
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
            <Typography.Title>Deployment detail</Typography.Title>
            
            <Descriptions colon=' :' layout='inline-horizontal' size='large'  data={deploymentDesc} />
            <Typography.Text type=''>Domains: </Typography.Text>
            {domains? domains.map( (domain,index) => {
              return (
                  <div  key={index} style={{display: 'flex', marginTop: 10}}>
                    {/* <Typography.Text key={index}>{domain}</Typography.Text> */}
                    <a href={domain} target='_blank' style={{color: '#165DFF'}}>{domain}</a>
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
              return <Typography.Paragraph key={index}>{line}</Typography.Paragraph> 
            })}
            </TabPane>
            <TabPane key='terminal' title='TERMINAL'>
              <Term websocket={websocket}></Term>
            </TabPane>
            </Tabs>
        </Card>
      </div> 
    )
}

export default App
