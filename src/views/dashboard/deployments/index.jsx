import React from 'react';
import { useEffect, useState } from 'react';
import { getDeployments, deleteDeployment } from '@/api/deployment';
import { getAreaIds } from '@/api/providers';
import { Button, Table, Typography, Message, Modal, Card, Select} from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';

const styleYellow = { color: '#F7BA1E' };
const styleGreen = { color: '#00B42A'};

const App = () => {
    const [data, setData] = useState([]);
    const [areaIds, setAreaIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toDeleteID, setToDeleteID] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [pagination, setPagination] = useState({
      sizeCanChange: true,
      showTotal: true,
      total: 0,
      pageSize: 10,
      current: 1,
      pageSizeChangeResetCurrent: true,
    });
    const navigate = useNavigate();
    const Option = Select.Option;

    const [selectedValue, setSelectedValue] = useState(localStorage.getItem('deployAreaSelected') || 'Asia-China-Guangdong-Shenzhen');

    function onChangeTable(pagination) {
      const { current, pageSize } = pagination;
      setLoading(true);
      getDeployments({page: current, size: pageSize}).then((res) => {
        if (res.code == 0) {
          setData(res.data.Deployments || []);
          const total = res.data.Total;
          setPagination((pagination) => ({ ...pagination, current, pageSize, total }));
        }
     
        setLoading(false);
      });
    }

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
        title: 'ProviderID',
        dataIndex: 'ProviderID'
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
        title: 'ErrorMessage',
        render: (col, record, index) => (
          <span>
            { record.Services[0]? record.Services[0].ErrorMessage : ''}
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

      setShowModal(true)
      setToDeleteID(id)
    }

    const comfirmDelete = () => {
      deleteDeployment({ area_id: selectedValue, id: toDeleteID}).then( (res) => {
        if (res.code == 0) {
          Message.success('Success');
          initialDeployments();
        }else {
          Message.error('Error');
        }

        setShowModal(false)
      
    }).catch(error => {
        Message.info(error);
    })
    }

    const onGetDeployments = (params) => {
      // const { current, pageSize } = pagination;
      getDeployments(params).then((res) => {
      if (res.code == 0) {
        setData(res.data.Deployments || []);
        const total = res.data.Total;
        setPagination((pagination) => ({ ...pagination, total }));
        setLoading(false);
      }
    });
    };

    const initialDeployments = () => {
      const { current, pageSize } = pagination;
      onGetDeployments({area_id: selectedValue, page: current, size: pageSize})
    }

    const onGetAreaIds = () => {
      getAreaIds().then((res) => {
          if (res.code == 0) {
            setAreaIds(res.data.area_ids);
          }
      });
    }

    const onChangeArea = (areaId) => {
      setSelectedValue(areaId);
      localStorage.setItem('deployAreaSelected', areaId);

      const { current, pageSize } = pagination;
      setLoading(true);
      onGetDeployments({area_id: areaId, page: current, size: pageSize});
    }

    useEffect(() => {
      setLoading(true);
      onGetAreaIds();
      initialDeployments();
    }, []);

  return <div>
    <Card style={{ marginBottom: 20}}>
    <label>Area: </label>
    <Select 
      placeholder='Select' style={{ width: 300}} 
      value={selectedValue}
      onChange = {onChangeArea}
      >
      {areaIds.map((areaId, index) => (
        <Option key={areaId}  value={areaId}>
          {areaId}
        </Option>
      ))}
    </Select>
    </Card>
    {/* <Typography.Text type='secondary' style={{marginBottom: 10}}> You have {pagination.total} deployments</Typography.Text> */}
    <Table columns={columns} data={data} loading={loading} rowKey='ID' noDataElement="No Data"
    pagination={pagination}
    onChange={onChangeTable}
    style={{paddingLeft: 10, paddingRight:10}}
    onRow={(record,index) => {
      return { onClick: () => {
        let passData = data[index]
        passData.AreaId = selectedValue
        navigate('/dashboard/deployments/detail', {state: passData})
      }}
    }} />
    <div>
      <Modal
        title='Are you sure?'
        visible={showModal}
        onOk={() => comfirmDelete()}
        onCancel={() => setShowModal(false)}
        autoFocus={false}
        focusLock={true}
      >
        <p> Are you sure to DElETE the deployment ?</p>
      </Modal>
    </div>
  </div>


};

export default App;
