import { useRef, useEffect, useState } from 'react';
import {
  Form,
  Card,
  Input,
  Button,
  Checkbox,
  Message,
  InputNumber,
  Divider,
  Slider,
  Typography,
  Space,
  Select,
} from '@arco-design/web-react';
import { createDeployment } from '@/api/deployment';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 17,
  },
};
const noLabelLayout = {
  wrapperCol: {
    span: 17,
    offset: 7,
  },
};

function App({ route }) {
  const formRef = useRef();
  const [deployName, setDeployName] = useState('');
  const [persistent, setPersistent] = useState(false);
  const [ephemeralStorageValue, setEphemeralStorageValue] = useState(100);
  const [persistentStorageValue, setPersistentStorageValue] = useState(0);
  const [protocolValue, setProtocolValue] = useState('');
  const [envsValue, setEnvsValue] = useState('');
  const [argsValue, setArgsValue] = useState('');
  const [portValue, setPortValue] = useState(0);
  const [exposPortValue, setExposPortValue] = useState(80);

  const navigate = useNavigate();
  const location = useLocation();
  const onGetDomains = () => {
    
  }


  useEffect(() => {
    // formRef.current.setFieldsValue({
    
    // });
    setProtocolValue('TCP')
  }, []);

  return (
   <div style={{display: 'flex'}}>
        <Card style={{width: '100vw'}}>
            <div style={{ width: '100%' }}>
            
                <Space style={{ justifyContent: 'center', width: '70vw'}}> 
                    <Typography.Text>Name Your Deplpoyment:</Typography.Text> <Input placeholder='' value={deployName} onChange={setDeployName} style={{width: 480}} />
                    <Button
                    onClick={ async () => {
                    if (formRef.current) {
                        try {
                        await formRef.current.validate();
                        let service = formRef.current.getFields();
                        service.Storage = [{
                            Quantity: persistent ? persistentStorageValue: ephemeralStorageValue,
                            Persistent: persistent,
                            Mount: service.mount || '',
                        }]

                        delete(service.mount);
                       
                        if (portValue > 0) {
                            service.Ports = [{
                                Protocol: protocolValue,
                                Port: portValue,
                                ExposePort: exposPortValue,
                            }]
                        }

                        if (envsValue) {
                            const json = {};
                            envsValue.split(",").forEach(pair => {
                                const [key, val] = pair.split("=");
                                json[key] = val;
                            });
                            service.Env = json;    
                        }

                        if (argsValue) {
                            const args = [];
                            argsValue.split(",").forEach(arg => {
                                args.push(arg)
                            });
                            service.Arguments = args;
                        }
                        

                        if (ephemeralStorageValue == 0 && persistentStorageValue == 0) {
                            Message.error('ephemeral storage or persistent storage must set');
                            return 
                        }
                        
                        const data = {
                            Name: deployName,
                            ProviderID: location.state,
                            Services:[service],
                        }
                 
                        createDeployment(data).then((res) => {
                            Message.info('创建成功！');
                            navigate("/dashboard/deployments");
                        }).catch(error => {
                            console.log(error)
                        })
                    
                        } catch (error) {
                        console.log(formRef.current.getFieldsError());
                        Message.error('请检查字段！');
                        }
                    }
                    }}
                    type='primary'
                    style={{ marginLeft: 24 }}
                >
                    Deploy
                </Button>
                </Space>
            
            </div>
            <Form
                ref={formRef}
                autoComplete='off'
                {...formItemLayout}
                initialValues={{
                    CPU: 0.1,
                    Memory: 100,
                }}
                scrollToFirstError
            >

                <FormItem {...formItemLayout} > <Divider orientation={'left'} style={{width: 480}} >Service</Divider></FormItem>

                <FormItem label='Docker Image' field='Image' rules={[{ required: true }]}>
                <Input placeholder='' style={{width: 480}} />
                </FormItem>
                <FormItem label='Service Name' field='Name' >
                <Input placeholder='' style={{width: 480}} />
                </FormItem>
                <FormItem
                label='CPU'
                field='CPU'
                >
                <Slider step={0.1} max={1} showInput  style={{ width: 280 }}/>
                </FormItem>
                <FormItem
                label='Memory'
                field='Memory'
                >
                <Slider step={100} max={500}  showInput  style={{ width: 280 }}/>
                </FormItem>
                <FormItem label='Ephemeral Storage'>
                <Slider step={100} max={5000} value={ephemeralStorageValue} showInput onChange={setEphemeralStorageValue} style={{ width: 380 }}/>
                </FormItem>
                <FormItem 
                label='Persistent Storage'
                field='persistent'
                >
                <Checkbox value={persistent} onChange={setPersistent}></Checkbox>
                </FormItem>
                { persistent ? 
                    <div>
                        <FormItem label='Persistent Storage'>
                        <Slider step={100} max={5000} value={persistentStorageValue} showInput onChange={setPersistentStorageValue} style={{ width: 380 }}/>
                        </FormItem>
                        <FormItem label='Mount Path' field='mount'>
                        <Input placeholder='' style={{width: 480}} />
                        </FormItem>
                    </div>:
                 <></>}
                <FormItem label='Environment Variables'>
                        <Input placeholder='KEY1=VALUE1,KEY2=VALUE2' style={{width: 480}} value={envsValue} onChange={setEnvsValue}/>
                </FormItem>
                <FormItem label='Arguments Variables'>
                        <Input placeholder='--requirepass password, --test' style={{width: 480}}  value={argsValue} onChange={setArgsValue}/>
                </FormItem>
                <FormItem label='Expose port' rules={[{ type: 'number' }]}>
                <InputNumber value={portValue} onChange={setPortValue} style={{width: 180}} />
                <span>--></span>
                <InputNumber value={exposPortValue} onChange={setExposPortValue} style={{width: 180}} />
                <Select style={{width: 80, marginLeft:24}} 
                    placeholder=''
                    value={protocolValue}
                    onChange={setProtocolValue}
                    options={[
                    {
                        label: 'TCP',
                        value: 'TCP',
                    },
                    {
                        label: 'UDP',
                        value: 'UDP',
                    },
                    ]}
                />
                </FormItem>

            </Form>
            
        </Card>
   </div>
  );
}

export default App;
