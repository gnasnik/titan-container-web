import React from 'react';
import { useEffect, useState } from 'react';
import { getDeployments, deleteDeployment } from '@/api/deployment';
import { Button, Table, Typography, Message } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';

const styleYellow = { color: '#F7BA1E' };
const styleGreen = { color: '#00B42A'};

const App = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getActiveState = (services) => {
     if (services && services.length == 0) return 'Error'
     return services.map((service) => {
        if (service.Status.TotalReplicas != service.Status.ReadyReplicas) {
          return 'Waiting'
        }
        return 'Active';
      })
    }

    const columns = [
      {
        title: 'ID',
        dataIndex: 'ID'
      },
      {
        title: 'Name',
        dataIndex: 'Name'
      },
      {
        title: 'Owner',
        dataIndex: 'Owner'
      },
      {
        title: 'State',
        dataIndex: 'State',
        render: (col, record, index) => (
          <span style={ getActiveState(record.Services) == 'Active' ? styleGreen : styleYellow }>
            { getActiveState(record.Services)}
          </span>
        ),
      },
      {
        title: 'Services',
        render: (col, record, index) => (
          <span>
            { record.Services.length || 0}
          </span>
        ),
      },
      {
        title: 'CreatedTime',
        dataIndex: 'CreatedAt'
      },
      {
        title: 'Operation',
        dataIndex: 'op',
        render: (_, record) => (
          <Button
            onClick={(e) => deleteRow(e,record.ID)}
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
      setData(res.data.Deployments || []);
      setTotal(res.data.Total);
      setLoading(false);
    });
    };

    useEffect(() => {
      setLoading(true);
      onGetDeployments();
    }, []);

  return <div>
    <Typography.Text type='secondary' style={{marginBottom: 10}}> You have {total} deployments</Typography.Text>
    <Table columns={columns} data={data} loading={loading} rowKey='ID' onRow={(record,index) => {
      return { onClick: () => {navigate('/dashboard/deployments/detail', {state: data[index]})}}
    }} />
  </div>


};

export default App;
