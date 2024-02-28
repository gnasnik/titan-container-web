import { useEffect, useState } from 'react';
import { Modal, Form, Input, Message, Typography } from '@arco-design/web-react';
import {addDeploymentDomain} from '@/api/deployment';
const FormItem = Form.Item;
const TextArea = Input.TextArea;


const DomainConfigModal = ({visible, setVisible, id, reload}) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();

    const onOk = () => {
        console.log(form);
        form.validate().then((data) => {
          setConfirmLoading(true);

          data.ID = id;


        addDeploymentDomain(data).then( (res) => {
            if (res.code === 0) {
                Message.success('Success')
                reload()
            }else {
                Message.error(res.err)
            }
            })

            setConfirmLoading(false);
            setVisible(false);
          
          
        });
      }
    
      const formItemLayout = {
        labelCol: {
          span: 3,
        },
        wrapperCol: {
          span: 30,
        },
      };


    return  <Modal
    title='Add Domain'
    visible={visible}
    onOk={onOk}
    confirmLoading={confirmLoading}
    onCancel={() => setVisible(false)}
  >
    <Typography.Paragraph type='warning'> 注意： 如何使用自定义域名，必须要填写证书的 cert 和 key</Typography.Paragraph>
    <Form
      {...formItemLayout}
      form={form}
    >
      <FormItem label='Host' field='Host'>
        <Input placeholder=''   style={{ width: 400 }} />
        
      </FormItem>
        <FormItem label='Cert' field='Cret'>
            <TextArea placeholder='Please enter certificate crt' style={{ minHeight: 64, width: 350 }} /> 
        </FormItem>
        <FormItem label='Key' field='Key'>
        <TextArea placeholder='Please enter certificate key' style={{ minHeight: 64, width: 350 }} /> 
        </FormItem>
    </Form>
  </Modal>
}

export default DomainConfigModal