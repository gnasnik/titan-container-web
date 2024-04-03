import {
  Form, Input, Button, Space, Checkbox, Typography
} from '@arco-design/web-react';
import {
  IconUser, IconSafe, IconGithub, IconWechat, IconFile
} from '@arco-design/web-react/icon';

// 路由
import { useNavigate } from 'react-router-dom';

// redux
import { useDispatch } from 'react-redux';
// store
import { loginHandler } from '@/store/actions/user';

import { getAccessToken } from '@/utils/accessToken';

import './login.less';
import store from '@/store';

export default function Login() {
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const navigate = useNavigate();
  

  const handleSubmit = async (formItem) => {
    await dispatch(loginHandler(formItem));
    // const { accessToken } = store.getState().userReducer;
    const accessToken = getAccessToken();
    if (accessToken) {
      navigate('/dashboard/providers', { replace: true });
      navigate(0);
    };
  };
  return (
    <div className="login-wrap">
      <div className="login-left">
         <main className="login-text container flex flex-col gap-8 p-10 justify-center text-center md:text-left">
          
          <h1 className="text-6xl font-bold decoration-blue-400">
            Deploy Your Applications on <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500  to-blue-500 font-black">Titan Container</span>
          </h1>
          
          <Typography.Paragraph style={{ color: 'white', fontSize: 18}}>Titan Container is an important component of the Titan network. 
            It is a container management tool specifically designed for decentralized cloud computing networks. Leveraging the latest container technology, 
            Titan-Container assists developers in effortlessly deploying and managing applications on the Titan network.
          </Typography.Paragraph>  
          
        </main>
      </div>

      <div className="login-form">
        <div className="form-warp">
          {/* <Typography.Title>您好！</Typography.Title> */}
          <Typography.Title heading={5}>Login Titan Container</Typography.Title>
          <Form
            form={form}
            wrapperCol={{
              span: 24
            }}
            // initialValues={{
            //   username: 'admin',
            //   password: 123456
            // }}
            onSubmit={handleSubmit}
          >
            <Space direction="vertical" size={10}>
              <Form.Item
                field="username"
                rules={[
                  {
                    required: true,
                    message: 'The username cannot be empty'
                  }
                ]}
              >
                <Input prefix={<IconUser />} placeholder="Please enter your username" />
              </Form.Item>
              <Form.Item
                field="password"
                rules={[
                  {
                    required: true,
                    message: 'The password cannot be empty'
                  }
                ]}
              >
                <Input.Password prefix={<IconSafe />} placeholder="Please enter your password" />
              </Form.Item>
              <Form.Item className="forget-pwd">
                <Checkbox>Remember password</Checkbox>
                {/* <Button type="text">忘记密码</Button> */}
              </Form.Item>
              <Form.Item>
                <Button type="primary" shape="round" htmlType="submit" long>
                  Login
                </Button>
              </Form.Item>
            </Space>
          </Form>
        </div>
      </div>
      {/* <div className="login-bg">
        <div className="logo-bg-img"></div>
      </div>
      */}
    </div>
  );
}
