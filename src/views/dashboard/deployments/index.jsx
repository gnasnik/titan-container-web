import React from 'react';
import { useEffect, useState } from 'react';
import { getDeployments, deleteDeployment } from '@/api/deployment';
import { Button, Table, Typography, Message } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';

const App = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id'
      },
      {
        title: 'Name',
        dataIndex: 'name'
      },
      {
        title: 'Image',
        dataIndex: 'image'
      },
      {
        title: 'State',
        dataIndex: 'state'
      },
      {
        title: 'IP',
        dataIndex: 'ip'
      },
      // {
      //   title: 'Total',
      //   dataIndex: 'total'
      // },
      // {
      //   title: 'Ready',
      //   dataIndex: 'ready'
      // },
      // {
      //   title: 'Available',
      //   dataIndex: 'available'
      // },
      {
        title: 'CPU',
        dataIndex: 'cpu'
      },
      {
        title: 'GPU',
        dataIndex: 'gpu'
      },
      {
        title: 'Memory',
        dataIndex: 'memory'
      },
      {
        title: 'Storage',
        dataIndex: 'storage'
      },
      // {
      //   title: 'Provider',
      //   dataIndex: 'provider'
      // },
      {
        title: 'Port',
        dataIndex: 'port'
      },
      {
        title: 'CreatedTime',
        dataIndex: 'created_time'
      },
      {
        title: 'Operation',
        dataIndex: 'op',
        render: (_, record) => (
          <Button
            onClick={(e) => deleteRow(e,record.id)}
            type='primary'
            status='danger'
          >
            Delete
          </Button>
          
        )
      }
    ];

    const deleteRow = (e,id) => {
      e.stopPropagation();
    
      deleteDeployment({ID: id}).then( (res) => {
          if (res.code == 0) {
            Message.success('删除成功！');
            onGetDeployments();
          }else {
            Message.error('删除出错了！');
          }
        
      }).catch(error => {
          Message.info(error);
      })
    }

    const onGetDeployments = () => {
      getDeployments().then((res) => {
      // console.log(res.data)
      setData(res.data.deployments);
      setTotal(res.data.total);
      setLoading(false);
    });
    };

    useEffect(() => {
      setLoading(true);
      onGetDeployments();
    }, []);

  return <div>
    <Typography.Text type='secondary' style={{marginBottom: 10}}> You have 1 active deployments</Typography.Text>
    <Table columns={columns} data={data} loading={loading} rowKey='id' onRow={(record,index) => {
      return { onClick: () => {navigate('/dashboard/deployments/detail', {state: data[index]})}}
    }} />
  </div>


};

export default App;
