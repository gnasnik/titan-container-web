import React from 'react';
import { useEffect, useState } from 'react';
import { getProviders, getAreaIds } from '@/api/providers';
import { Button, Table, Select, Card, Input } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';


const InputSearch = Input.Search;
const styleYellow = { color: '#F7BA1E' };
const styleGreen = { color: '#00B42A'};

const App = () => {
    const [data, setData] = useState([]);
    const [areaIds, setAreaIds] = useState([]);
    const [currentAreaId, setCurrentAreaId] = useState(localStorage.getItem('providerAreaSelected') || 'Asia-China-Guangdong-Shenzhen');
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
      sizeCanChange: true,
      showTotal: true,
      total: 0,
      pageSize: 10,
      current: 1,
      pageSizeChangeResetCurrent: true,
    });

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
        title: 'Area',
        dataIndex: 'area_id'
      },
      {
        title: 'State',
        dataIndex: 'state',
        render: (col, record, index) => (
          <span style={ record.state == 1 ? styleGreen : styleYellow }>
            {  record.state == 1? 'Online' : 'Offline' }
          </span>
        ),
      },
      // {
      //   title: 'RemoteAddr',
      //   dataIndex: 'remote_addr'
      // },
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
            onClick={() => onDeploy(record.id, record.area_id)}
            type='primary'
            status='normal'
          >
            Deploy
          </Button>
        )
      }
    ];

    const Option = Select.Option;
    const navigate  = useNavigate();
    const onGetAreaIds = async () => {
      const res = await getAreaIds();
      setAreaIds(res.data.area_ids);
    }

    const initialProvider = async () => { 
      const { current, pageSize } = pagination;
      const res = await getProviders({area_id: currentAreaId, page: current, size: pageSize});      
      const total = res.data.total || 0;
      setPagination((pagination) => ({...pagination, total}))
      setData(res.data.providers);
      setLoading(false);
    }

    const onSearch = async (keyword) => {
      const { pageSize } = pagination;
      const current = 1;
      const res = await getProviders({area_id: currentAreaId, provider_id: keyword, page: current, size: pageSize});      
      const total = res.data.total || 0;
      setPagination((pagination) => ({...pagination, total}))
      setData(res.data.providers);
      setLoading(false);
    }

    const  onChangeTable = async (pagination) => {
      setLoading(true);
      const { current, pageSize } = pagination;
      const res = await getProviders({area_id: currentAreaId, page: current, size: pageSize}); 
      const total = res.data.total || 0;
      setPagination((pagination) => ({...pagination, current, pageSize, total}))
      setData(res.data.providers);
      setLoading(false);
    }

    const onChangeArea = async (areaId)=> {
      const { pageSize } = pagination;
      const current = 1;
      setLoading(true);
      localStorage.setItem('providerAreaSelected', areaId);
      setCurrentAreaId(areaId);
      const res = await getProviders({area_id: areaId, page: current, size: pageSize}); 
      setData(res.data.providers);
      const total = res.data.total || 0;
      setPagination((pagination) => ({...pagination, current, pageSize, total}))
      setLoading(false);
    }

    const onDeploy = (id, areaId) => {
      navigate('/dashboard/deployments/create', {state: {provider_id: id, area_id: areaId}})
    }

  
    useEffect(() => {
        setLoading(true);
        onGetAreaIds();
        initialProvider();
        }, []);

  return <div>
    <Card style={{ marginBottom: 20}}>
    <label>Area: </label>
    <Select 
      placeholder='Select' style={{ width: 300}} 
      value={currentAreaId}
      onChange = {onChangeArea}
      >
      {areaIds.map((areaId, index) => (
        <Option key={areaId} value={areaId}>
          {areaId}
        </Option>
      ))}
    </Select>
    <label style={{marginLeft: 20}}>ID: </label>
    <InputSearch allowClear placeholder='Enter ID to search' style={{ width: 350 }}  onSearch={onSearch}/>
    </Card>
    
    <Table columns={columns} data={data} loading={loading} rowKey='id'  noDataElement="No Data"
        pagination={pagination}
         style={{paddingLeft: 10, paddingRight:10}}
        onChange={onChangeTable}
        // onRow={(record,index) => {
        //     return { onClick: () => {navigate('/dashboard/deployments/create', {state: {provider_id: record.id, area_id: currentAreaId}})}}
        // }} 
        />;

  </div>
 
};

export default App;
