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
    const [pagination, setPagination] = useState({
      sizeCanChange: true,
      showTotal: true,
      total: 0,
      pageSize: 10,
      current: 1,
      pageSizeChangeResetCurrent: true,
    });
    const navigate  = useNavigate();
    const onGetProviders = () => {
      const { current, pageSize } = pagination;
        getProviders({page: current, size: pageSize}).then((res) => {
            if (res.code == 0) {
              setData(res.data.providers);
            const total = res.data.Total || 0;
            setPagination((pagination) => ({...pagination, total}))
            setLoading(false);
            }
        });
      };

      function onChangeTable(pagination) {
        const { current, pageSize } = pagination;
        setLoading(true);
        getProviders({page: current, size: pageSize}).then((res) => {
          if (res.code == 0) {
            setData(res.data.Deployments || []);
            const total = res.data.Total;
            setPagination((pagination) => ({ ...pagination, current, pageSize, total }));
          }
       
          setLoading(false);
        });
      }

    useEffect(() => {
        setLoading(true);
        onGetProviders();
        }, []);

  return <Table columns={columns} data={data} loading={loading} rowKey='id'  noDataElement="No Data"
    pagination={pagination}
    onChange={onChangeTable}
    onRow={(record,index) => {
        return { onClick: () => {navigate('/dashboard/deployments/create', {state: record.id})}}
    }} 
    />;
};

export default App;
