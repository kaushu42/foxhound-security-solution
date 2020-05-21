import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Table, Spin, Drawer, Card, Row, Col, Input, Select, Button} from 'antd'
import axios from 'axios'
import {ROOT_URL} from "../../utils"
import { filterSelectDataServiceAsync } from "../../services/filterSelectDataService";
import { search } from "../../actions/ipSearchAction";
import QuickIpView from '../../views/QuickIpView'
import ExportJsonExcel from 'js-export-excel';

const FETCH_LOG_API =`${ROOT_URL}dashboard/threat/log/`
const { Option } = Select;

class ThreatLogTable extends Component{
    constructor(props){
        super(props);
        this.state = {
            columns:[
                {
                    title:"Source Address",
                    dataIndex:"source_address",
                    key:"source_address",
                    render: (text, record) => (
                        <a onClick={() => this.handleShowSourceIpProfile(record)}>{text}</a>
                    )
                },
                {
                    title:"Destination Address",
                    dataIndex:"destination_address",
                    key:"destination_address",
                    render: (text, record) => (
                        <a onClick={() => this.handleShowDestinationIpProfile(record)}>{text}</a>
                    )
                },
                {
                    title:"Application",
                    dataIndex:"application",
                    key:"application"
                },
                {
                    title:"Destination Port",
                    dataIndex:"destination_port",
                    key:"destination_port"
                },
                {
                    title:"Severity",
                    dataIndex:"severity",
                    key:"severity"
                },
                {
                    title:"Threat Content Type",
                    dataIndex:"threat_content_type",
                    key:"threat_content_type"
                },
                {
                    title:"Logged Date",
                    dataIndex:"received_datetime",
                    key:"received_datetime",
                    render: text => (new Date(parseInt(text)*1000+20700000).toUTCString()).replace(" GMT", "")
                },
            ],
            data: null,
            pagination: {},
            params: {},
            loading: false,
            quickIpView: false,
            applicationData: [],
            searchSourceIP: "",
            searchDestinationIP: "",
            searchApplication: "",
            searchLogname: ""
        }
    }

    handleShowSourceIpProfile(record) {
        this.props.dispatchIpSearchValueUpdate(record.source_address);
        this.setState({ quickIpView: true });
    }

    handleShowDestinationIpProfile(record) {
        this.props.dispatchIpSearchValueUpdate(record.destination_address);
        this.setState({ quickIpView: true });
    }

    closeQuickIpView = () => {
        this.setState({ quickIpView: false });
    };

    componentDidMount = () => {
        this.fetchLogData()
        filterSelectDataServiceAsync(this.props.auth_token)
        .then(response => {
            const filter_data = response[0].data;
            this.setState({
                applicationData: filter_data.application,
            });
        })
        .catch(error => console.log(error));
    }

    componentDidUpdate = (prevProps, prevState) => {
        if(String(prevProps.selectedCountry) !== String(this.props.selectedCountry)){
            this.fetchLogData()
        }
    }

    fetchLogData = (params = {}) => {
        this.setState({
            loading:true
        })

        const token = `Token ${this.props.auth_token}`;
        let headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token
        };

        let bodyFormData = new FormData();
        bodyFormData.set("country", this.props.selectedCountry)
        bodyFormData.set("source_address", this.state.searchSourceIP);
        bodyFormData.set("destination_address", this.state.searchDestinationIP);
        bodyFormData.set("application", this.state.searchApplication);
        bodyFormData.set("log_name", this.state.searchLogname);
        
        axios.post(FETCH_LOG_API, bodyFormData, { headers, params })
        .then(res => {
            const page = this.state.pagination;
            page.total = res.data.count;
            this.setState({
                data: res.data.results,
                pagination: page,
                loading: false
            });
        });
    };


    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        (this.state.pagination = pager),
        this.fetchLogData({
        // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    filterData = (v) =>{
        this.fetchLogData()
    }

    downloadExcel = () => {
        const data = this.state.data ? this.state.data : '';//tabular data
         var option={};
         let dataTable = [];
         if (data) {
           for (let i in data) {
             if(data){
               let obj = {
                            'Logged datetime': (new Date(parseInt(data[i].received_datetime)*1000+20700000).toUTCString()).replace(" GMT", ""),
                            'Source address': data[i].source_address,
                            'Destination address': data[i].destination_address,
                            'Application':data[i].application,
                            'Destination port':data[i].destination_port,
                            'Severity':data[i].severity,
                            'Threat content type':data[i].threat_content_type,
                            'Protocol':data[i].protocol,
                            'Source zone':data[i].source_zone,
                            'Destination zone':data[i].destination_zone,
                            'Inbound interface':data[i].inbound_interface,
                            'Outbound interface':data[i].outbound_interface,
                            'Action':data[i].action,
                            'Category':data[i].category,
                            'Threat content name':data[i].threat_content_name,
                            'Source country':data[i].source_country,
                            'Destination country':data[i].destination_country,
               }
               dataTable.push(obj);
             }
           }
         }
            option.fileName = 'Threat Log'
         option.datas=[
           {
             sheetData:dataTable,
             sheetName:'sheet',
                    sheetFilter:['Logged datetime','Source address','Destination address','Application','Destination port','Severity','Threat content type','Protocol','Source zone','Destination zone','Inbound interface','Outbound interface','Action','Category','Threat content name', 'Source country','Destination country'],
                    sheetHeader:['Logged datetime','Source address','Destination address','Application','Destination port','Severity','Threat content type','Protocol','Source zone','Destination zone','Inbound interface','Outbound interface','Action','Category','Threat content name', 'Source country','Destination country']
           }
         ];
        
         var toExcel = new ExportJsonExcel(option); 
         toExcel.saveExcel();        
    }

    render(){
        const applicationSelectListItem = this.state.applicationData.map(
            data => <Option key={data[1]}>{data[1]}</Option>
        );
        const expandedRowRender = record => <p>
                                      <b>Protocol: </b>{record.protocol}<br/>
                                      <b>Source Zone: </b>{record.source_zone}<br/>
                                      <b>Destination Zone: </b>{record.destination_zone}<br/>
                                      <b>Inbound Interface: </b>{record.inbound_interface}<br/>
                                      <b>Outbound Interface: </b>{record.outbound_interface}<br/>
                                      <b>Action: </b>{record.action}<br/>
                                      <b>Category: </b>{record.category}<br/>
                                      <b>Direction: </b>{record.direction}<br/>
                                      <b>Threat Content Name: </b>{record.threat_content_name}<br/>
                                      <b>Source Country: </b>{record.source_country}<br/>
                                      <b>Destination Country: </b>{record.destination_country}<br/>
                                      <b>Log Name: </b>{record.log_name}<br/>
                                      </p>;
        return(
            <Fragment>
                <Card title={
                    <Fragment>
                    <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Button type="primary" shape="round" icon="download"
                                onClick={this.downloadExcel}>Export This Page
                                </Button>
                            </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Input 
                                value={this.state.searchSourceIP}
                                placeholder="Search Source IP"
                                onChange={(e)=>this.setState({searchSourceIP : e.target.value})}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Input 
                                value={this.state.searchDestinationIP}
                                placeholder="Search Destination IP"
                                onChange={(e)=>this.setState({searchDestinationIP : e.target.value})}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Select
                                id="filterApplication"
                                mode="multiple"
                                allowClear={true}
                                optionFilterProp="children"
                                style={{width:"100%"}}
                                filterOption={(input, option) =>
                                option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                placeholder="Application"
                                onChange={value => this.setState({searchApplication:value})}
                            >
                                {applicationSelectListItem}
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Input 
                                value={this.state.searchLogname}
                                placeholder="Log Name"
                                onChange={(e)=>this.setState({searchLogname : e.target.value})}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Button 
                            type="primary"
                            style={{width:'100%'}}
                            htmlType="submit"
                            className="login-form-button"
                            loading={this.props.rejectUnverifiedRuleLoading}
                            onClick={e =>this.filterData(e)}>Search
                            </Button>
                        </Col>
                    </Row>
                    </Fragment>
                }>
                    <Spin spinning={this.state.loading}>
                        <Table 
                            rowKey={record => record.id}
                            columns={this.state.columns}
                            expandedRowRender={expandedRowRender}
                            dataSource={this.state.data}
                            pagination={this.state.pagination}
                            onChange={this.handleTableChange}
                            bordered
                        />
                    </Spin>
                </Card>
                <Drawer
                    closable={true}
                    width={800}
                    placement={"right"}
                    onClose={this.closeQuickIpView}
                    visible={this.state.quickIpView}
                >
                    <QuickIpView />
                </Drawer>
            </Fragment>
        )
    }
}

ThreatLogTable.defaultProps = {
    selectedCountry: ""
}

const mapStateToProps = state =>{
    return{
        auth_token: state.auth.auth_token,
        application: state.filter.application
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchIpSearchValueUpdate: value => dispatch(search(value))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ThreatLogTable)