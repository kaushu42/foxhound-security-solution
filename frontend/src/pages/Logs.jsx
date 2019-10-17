import React, { Component, Fragment } from 'react';
import {Card,Row,Col,Select} from 'antd';
import {Statistic, PageHeader, DatePicker, Layout} from 'antd';
import { Table, Divider, Tag } from 'antd';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const {Option} = Select;
const columns = [
    {
      title: 'Processed Date',
      dataIndex: 'processeddate',
      key: 'processeddate',
    },
    {
      title: 'Log Name',
      dataIndex: 'logname',
      key: 'logname',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Log Row Count',
      dataIndex: 'logrowcount',
      key: 'logrowcount',
    },
    {
      title: 'Log Size',
      dataIndex: 'logsize',
      key: 'logsize',
    },
    {
      title: 'Log Type',
      dataIndex: 'logtype',
      key: 'logtype',
    },
    {
      title: 'Log Device',
      dataIndex: 'logdevice',
      key: 'logdevice',
    },

    {
      title: 'Verified By',
      dataIndex: 'verifiedby',
      key: 'verifiedby',
    }
  ];
  
  const data = [
    {
      key: '1',
      processeddate:'10-10-2019',
      logname:'Silverlinling-PAVM-primary-traffic.csv',
      logrowcount:123455,
      logsize:'23 MB',
      logtype:'TRAFFIC',
      logdevice:'NEXT-GEN PALO ALTO',
      verifiedby:'Keshav Chaurasia'
    },
  ];
const routes = [
    {
      path: 'index',
      breadcrumbName: 'First-level Menu',
    },
    {
      path: 'first',
      breadcrumbName: 'Second-level Menu',
    },
    {
      path: 'second',
      breadcrumbName: 'Third-level Menu',
    },
  ];

  const gridStyle = {
    width: '20%',
    textAlign: 'center',
  };

class Logs extends Component{
    render(){
        return(
           <Fragment>
                <PageHeader title="Logs" breadcrumb={{ routes }} subTitle="traffic | threat | authentication | system" />
                <br />
                <Layout style={{margin:'0 24px 24px', background:'white'}}>
                    <Card>
                      <Card.Grid style={gridStyle}>
                        <Statistic title="Logs Processed" value={'45'}/>
                    </Card.Grid>
                      <Card.Grid style={gridStyle}>
                          <Statistic title="Log Count " value={'45 Million'}/>
                      </Card.Grid>
                      <Card.Grid style={gridStyle}>
                          <Statistic title="Volume Processed" value={'1 GB'}/>
                      </Card.Grid>
                    </Card>
                    <br />
                    <Row>
                        <Col span={24}>
                            <Card title="Logs Details">
                              <Table dataSource={data} columns={columns} />
                            </Card>
                        </Col>
                    </Row>
                </Layout>
           </Fragment> 
        )
    }
}

export default Logs;