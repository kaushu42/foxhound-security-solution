import React, { Component, Fragment } from 'react';
import {Card,Row,Col,Select} from 'antd';
import {Statistic, PageHeader, DatePicker, Layout} from 'antd';
import { Table, Divider, Tag } from 'antd';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const {Option} = Select;
const columns = [
    {
      title: 'Source Address',
      dataIndex: 'sourceaddress',
      key: 'sourceaddress',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Destination Address',
      dataIndex: 'destinationaddress',
      key: 'destinationaddress',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Application',
      dataIndex: 'application',
      key: 'application',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <a>Accept</a>  
          <Divider type="vertical" />
          <a>Edit</a>  
          <Divider type="vertical" />
          <a>Create TT</a>
        </span>
      ),
    },
  ];
  
  const data = [
    {
      key: '1',
      sourceaddress: '10.100.2.12',
      destinationaddress:'202.1.2.4',
      application:'google-base',
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

class IPProfile extends Component{
    render(){
        return(
           <Fragment>
                <PageHeader title="IP Profile" breadcrumb={{ routes }} subTitle="IP address history review" />
                <br />
                <Layout style={{margin:'0 24px 24px', background:'white'}}>
                    <Row>
                    <Col span={4}>
                        <RangePicker  />
                    </Col>
                    <Col span={4}>
                        <Select mode='multiple' style={{width:'100%'}} placeholder='Firewall Rule' />
                    </Col>
                    <Col span={4}>
                        <Select mode='multiple' style={{width:'100%'}} placeholder='Application' />
                    </Col>
                    <Col span={4}>
                        <Select mode='multiple' style={{width:'100%'}} placeholder='Protocol' />
                    </Col>
                    <Col span={4}>
                        <Select mode='multiple' style={{width:'100%'}} placeholder='Source Zone' />
                    </Col>
                    <Col span={4}>
                        <Select mode='multiple' style={{width:'100%'}} placeholder='Destination Zone' />
                    </Col>
                </Row>
                    <br />
                    <Card>
                      <Card.Grid style={gridStyle}>
                        <Statistic title="IP address" value={'202.17.63.45/db-server'}/>
                    </Card.Grid>
                      <Card.Grid style={gridStyle}>
                          <Statistic title="Uplink" value={'300 MB'}/>
                      </Card.Grid>
                      <Card.Grid style={gridStyle}>
                          <Statistic title="Downlink" value={'1 GB'}/>
                      </Card.Grid>
                      <Card.Grid style={gridStyle}>
                          <Statistic title="Opened TT" value={'45 TT'}/>
                      </Card.Grid>
                      <Card.Grid style={gridStyle}>
                          <Statistic title="New Rules" value={'14 Rules'}/>
                      </Card.Grid>
                    </Card>
                    <br />
                    <Row>
                        <Col span={24}>
                            <Card title="Activity Chart">

                            </Card>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col span={12}>
                            <Card title="As Source">
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="As Destination">
                            </Card>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col span={24}>
                            <Card title="Usage Graph">
                            </Card>
                        </Col>
                    </Row>
                </Layout>
           </Fragment> 
        )
    }
}

export default IPProfile;