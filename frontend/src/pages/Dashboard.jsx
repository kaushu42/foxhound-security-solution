// Accept Rule
// Edit Rule
// Reject Rule and Create TT


// Create TT for High Usage Detected

// Follow up Rule TT
// Follow up High usage TT




import React, { Component, Fragment } from 'react';
import {Drawer, Form, Button, Card,Row,Col,Select, Input} from 'antd';
import {Statistic, PageHeader, DatePicker, Layout} from 'antd';
import { Table, Divider, Tag } from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const {Option} = Select;
import Rules from './Dashboard/components/Rules';
  
  const dataRuleTT = [
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
    width: '25%',
    textAlign: 'center',
  };

class DashBoard extends Component{
  state = {
    acceptRuleDrawerVisibile:false,
    visible: false,
    application : 'shshsh',

  };
  
  constructor(props){
    super(props);
    this.columnsRuleTT = [
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
            <a onClick={(e)=>{this.handleShowAcceptRuleDrawer(record.key,e)}}>Accept</a>  
            <Divider type="vertical" />
            <a> Edit</a>  
            <Divider type="vertical" />
            <a>Create TT</a>
          </span>
        ),
      },
    ];
  }
  myFunc = (e)=>{
    this.setState({application:e.target.value});
    console.log(e.target.value);
  }
  handleShowAcceptRuleDrawer = (key,e) =>{
    console.log(key,e);
    this.setState({acceptRuleDrawerVisibile:true});
  }

  handleOnCloseAcceptRuleDrawer = () =>{
    this.setState({acceptRuleDrawerVisibile:false});
  }
  

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  render(){
        return(
           <Fragment>
                <PageHeader title="Dashboard" breadcrumb={{ routes }} subTitle="Network Review" />
                <Layout style={{margin:'0 24px 24px', background:'white'}}>
                    <Row>
                    <Col span={4}>
                        <RangePicker  />
                    </Col>
                    <Col span={4}>
                        <Select mode='multiple' style={{width:'100%'}} placeholder='Firewall Rule' />
                    </Col>
                    <Col span={4}>
                        <Select  mode='multiple' style={{width:'100%'}} placeholder='Application'/>
                        <Input onChange={this.myFunc} />
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
                    <Row>
                        <Col span={12}>
                            <Card title="Map View">

                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Usage Graph">
                                
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            <Card title="New Rules">
                                <Rules application={this.state.application}/>
                            </Card>
                        </Col>
                        <Col span={14}>
                            <Card title="High Usage Detection">
                                {/* <Table dataSource={dataRuleTT} columns={columnsRuleTT} />; */}
                            </Card>

                        </Col>

                    </Row>
                    <Row>
                        <Col span={12}>
                            <Card title="Rule Based Trouble Ticket">
                                {/* <Table dataSource={dataRuleTT} columns={columnsRuleTT} />; */}
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="High Usage Detection based Trouble Ticket">
                                {/* <Table dataSource={dataRuleTT} columns={columnsRuleTT} />; */}
                            </Card>

                        </Col>

                    </Row>

                </Layout>
                <Drawer  title="Accept Rule" width={500} onClose={this.handleOnCloseAcceptRuleDrawer} visible={this.state.acceptRuleDrawerVisibile} >
                </Drawer>
           </Fragment> 
        )
    }
}

export default DashBoard;