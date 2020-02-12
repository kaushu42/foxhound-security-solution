import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Table, Spin, Drawer, Card, Row, Col, Input, Select, Button} from 'antd'
import axios from 'axios'
import {ROOT_URL} from "../../utils"
import { filterSelectDataServiceAsync } from "../../services/filterSelectDataService";
import { search } from "../../actions/ipSearchAction";
import QuickIpView from '../../views/QuickIpView'

const FETCH_LOG_API =`${ROOT_URL}tt/open/`
const { Option } = Select;

class ThreatLogTable extends Component{
    constructor(props){
        super(props);
        this.state = {
            columns:[
                {
                    title: 'Id',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title:"Logged Date",
                    dataIndex:"date",
                    key:"date",
                    render: text => (new Date(parseInt(1580001000)*1000).toUTCString()).replace(" GMT", "")
                },
                {
                    title:"Source Address",
                    dataIndex:"source_ip",
                    key:"source_ip",
                    render: (text, record) => (
                        <a onClick={() => this.handleShowSourceIpProfile(record)}>{text}</a>
                    )
                },
                {
                    title:"Destination Address",
                    dataIndex:"destination_ip",
                    key:"destination_ip",
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
                    title:"Log Name",
                    dataIndex:"log.log_name",
                    key:"log.log_name"
                }
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
        this.props.dispatchIpSearchValueUpdate(record.source_ip);
        this.setState({ quickIpView: true });
    }

    handleShowDestinationIpProfile(record) {
        this.props.dispatchIpSearchValueUpdate(record.destination_ip);
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
        bodyFormData.set("source_ip", this.state.searchSourceIP);
        bodyFormData.set("destination_ip", this.state.searchDestinationIP);
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
        console.log("pagination", pagination);
        console.log("filter", filters);
        console.log("sorter", sorter);
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

    render(){
        const applicationSelectListItem = this.state.applicationData.map(
            data => <Option key={data[1]}>{data[1]}</Option>
        );
        return(
            <Fragment>
                <Card title={
                    <Fragment>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                            <Input 
                                value={this.state.searchSourceIP}
                                placeholder="Search Source IP"
                                onChange={(e)=>this.setState({searchSourceIP : e.target.value})}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                            <Input 
                                value={this.state.searchDestinationIP}
                                placeholder="Search Destination IP"
                                onChange={(e)=>this.setState({searchDestinationIP : e.target.value})}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={5} xl={5}>
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
                        <Col xs={24} sm={24} md={24} lg={5} xl={5}>
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