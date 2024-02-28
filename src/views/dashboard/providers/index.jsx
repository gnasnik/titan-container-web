import React from 'react';
import { useEffect, useState } from 'react';
import { getProviders } from '@/api/providers';
import { Button, Table } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
const columns = [
  {
    title: 'ID',
    dataIndex: 'id'
  },
  {
    title: 'IP',
    dataIndex: 'ip'
  },
  {
    title: 'Region',
    dataIndex: 'region'
  },
  {
    title: 'State',
    dataIndex: 'state'
  },
  {
    title: 'Host',
    dataIndex: 'host'
  },
  {
    title: 'CPU',
    dataIndex: 'cpu'
  },
  {
    title: 'Memory',
    dataIndex: 'memory'
  },
  {
    title: 'Storage',
    dataIndex: 'storage'
  },
  {
    title: 'Operation',
    dataIndex: 'op',
    render: (_, record) => (
      <Button
        onClick={() => deploy(record.id)}
        type='primary'
        status='normal'
      >
        Deploy
      </Button>
    )
  }
];

const deploy = id => {
    
}

const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate  = useNavigate();
    const onGetProviders = () => {
        getProviders().then((res) => {
            setData(res.data.providers);
            setLoading(false);
        });
      };
    useEffect(() => {
        setLoading(true);
        onGetProviders();
        }, []);

  return <Table columns={columns} data={data} loading={loading} rowKey='id' onRow={(record,index) => {
        return { onClick: () => {navigate('/dashboard/deployments/create', {state: record.id})}}
    }} 
    />;
};

export default App;
