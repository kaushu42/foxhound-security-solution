import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

import MasterLayout from "./layout/MasterLayout";
import {contentLayout, drawerInfoStyle, ROOT_URL} from "../utils";
import axios from 'axios';
import {Col, PageHeader, Row, Input, Button, Table, Drawer, Spin, Statistic, Alert, Card} from "antd";
import moment from "moment";
import QuickIpView from "../views/QuickIpView"
import {search} from "../actions/ipSearchAction";


const SET_ALIAS_API = `${ROOT_URL}alias/edit/`;
const FETCH_ALIAS_API = `${ROOT_URL}alias/`

class ChangeAlias extends Component{
    constructor(props){
        super(props);
        this.state = {
            alias: null,
            errorMessage: null,
            successMessage: null,
            params : {},
            pagination : {},
            loading: false,
            setAliasDrawerVisible: false,
            selectedRecord: null,
            data: [],
            quickIpView: false,
            searchIP:"",
            searchAlias:"",
            columns: [
                {
                    title: 'IP Address',
                    dataIndex: 'address',
                    key: 'address',
                    render: (text,record) => <a onClick={()=> this.handleShowIpProfile(record)}>{text}</a>,
                },
                {
                    title: 'Alias',
                    dataIndex: 'alias',
                    key: 'alias',
                    render: text => <a>{text}</a>,
                },
                {
                    title: 'Action',
                    dataIndex: '',
                    key: 'x',
                    render: (record) => <a onClick={()=>{this.showDrawer(record)}}>Set Alias</a>,
                },
            ],
            }
    }

    componentDidMount() {
        this.handleFetchData(this.state.params)
    }

    handleFetchData = (params = {}) => {
        this.setState({
            loading : true,
            successMessage: null
        });

        const authorization = `Token ${this.props.auth_token}`;
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization
        };

        let bodyFormData = new FormData();
        bodyFormData.set("ip", this.state.searchIP);
        bodyFormData.set("alias", this.state.searchAlias);

        axios.post(FETCH_ALIAS_API, bodyFormData,{headers, params})
        .then(res=>{
            const page = this.state.pagination;
            page.total  = res.data.count;
            this.setState({
                data: res.data.results,
                loading:false,
                pagination: page
            })
        })
        .catch(e => {
            console.log("error",e);
            this.setState({
                successMessage : null,
                errorMessage : "Something went wrong!!"
            })
        });
    }

    handleShowIpProfile(record){
        this.props.dispatchIpSearchValueUpdate(record.address);
        this.setState({quickIpView : true})
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.state.pagination};
        pager.current = pagination.current;
        this.state.pagination = pager,
        this.handleFetchData({
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    showDrawer = (record) => {
        this.setState({
            setAliasDrawerVisible: true,
            selectedRecord : record,
            alias: record.alias
        });
    };

    onClose = () => {
        this.setState({
            setAliasDrawerVisible: false,
            selectedRecord: null,
            alias: null,
        });
        setTimeout(() => {
            this.setState({
                errorMessage:null
            })
        }, 3000);
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
    }

    handleAliasChange = (e) => {
        const ip = this.state.selectedRecord.address
        const aliasName = this.state.alias
        if(aliasName == "" || aliasName == null){
            this.setState({
                successMessage: null,
                errorMessage:"Please Enter Alias Name"
            });
            this.onClose()
            return
        }

        else if(aliasName == this.state.selectedRecord.alias){
            this.onClose()
            return
        }
        // console.log("input address", ip, "alias name", aliasName)
        const authorization = `Token ${this.props.auth_token}`;

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization
        };

        let bodyFormData = new FormData();
        bodyFormData.set("ip", ip);
        bodyFormData.set("alias", aliasName);

        axios.post(SET_ALIAS_API,bodyFormData,{headers})
        .then(res=>{
            console.log('Alias Name Set Successfully', ip, aliasName);
            this.setState({
                selectedRecord : null,
                alias : null,
                errorMessage : null,
                successMessage : "IP Alias changed successfully",
                loading: true,
            })
        })
        this.onClose()
        console.log("fetching data")
        setTimeout(() => {this.handleFetchData()},3000)
    }

    render(){
        return(
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader
                            style={{background: '#fff'}}
                            title={"Change IP Alias"}/>
                    {this.state.errorMessage ?
                    <Alert message="Error" type="error" closeText="Close Now" showIcon description={this.state.errorMessage} />
                    : null }
                    {this.state.successMessage ?
                    <Alert message="Success" type="success" closeText="Close Now" showIcon description={this.state.successMessage} />
                    : null }
                    <Row style = {contentLayout}>
                    <Card title={
                        <Fragment>
                        <Row gutter={[16, 16]} >
                            <Col xs={24} sm={24} md={24} lg={6} xl={6} offset={6}>
                                <Input 
                                    value={this.state.searchIP}
                                    placeholder="Search IP"
                                    onChange={(e)=>this.setState({searchIP : e.target.value})}
                                />
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Input 
                                    value={this.state.searchAlias}
                                    placeholder="Search Alias"
                                    onChange={(e)=>this.setState({searchAlias : e.target.value})}
                                />
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Button 
                                type="primary"
                                style={{width:'100%'}}
                                htmlType="submit"
                                className="login-form-button"
                                loading={this.props.rejectUnverifiedRuleLoading}
                                onClick={e =>this.handleFetchData()}>Search
                                </Button>
                            </Col>
                        </Row>
                        </Fragment>
                    }>
                        <Table
                            rowKey={record => record.id}
                            columns={this.state.columns}
                            dataSource = {this.state.data}
                            pagination={this.state.pagination}
                            onChange={this.handleTableChange}
                            loading={this.state.loading}
                            bordered
                        />
                        </Card>
                        <Drawer
                            id={"SetAlias"}
                            visible={this.state.setAliasDrawerVisible}
                            title={"Set Alias"}
                            width={500}
                            onClose={this.onClose}
                            closable={true}
                            placement={'right'}>
                            <Spin spinning={!this.state.selectedRecord}>
                                {
                                    this.state.selectedRecord ? (
                                        <Fragment>
                                            <Row type="flex" gutter={16}>
                                                <Col xs={24} sm={24} md={24} lg={24} xl={24} style={drawerInfoStyle}>
                                                    <Statistic title="IP Address" value={this.state.selectedRecord.address} />
                                                </Col>
                                            </Row>
                                            <br />
                                            <Row type="flex" gutter={16}>
                                                <Input 
                                                    placeholder = "Alias Name" 
                                                    defaultValue = {this.state.selectedRecord.alias}
                                                    onChange = {(e) => this.setState({
                                                            alias : e.target.value
                                                        })
                                                    }
                                                />
                                            </Row>
                                            <br />
                                            <Row type="flex" gutter={16}>
                                                <Button 
                                                    type={"primary"} 
                                                    style={{width:'100%'}} 
                                                    onClick={(e) => this.handleAliasChange(e)}
                                                >
                                                    Submit
                                                </Button>
                                            </Row>
                                        </Fragment>
                                    ):null
                                }
                            </Spin>
                        </Drawer>
                        <Drawer
                            closable={true}
                            width={800}
                            placement={"right"}
                            onClose={this.closeQuickIpView}
                            visible={this.state.quickIpView}>
                            <QuickIpView/>
                        </Drawer>
                    </Row>
                </MasterLayout>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token

    }
}
const mapDispatchToProps = dispatch => {
    return {
        dispatchIpSearchValueUpdate : value => dispatch(search(value))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(ChangeAlias);