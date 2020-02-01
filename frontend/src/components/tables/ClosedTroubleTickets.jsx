import React, {Component, Fragment} from 'react';
import {Col, Row, Table, Drawer} from 'antd';
import axios from "axios";
import {connect} from "react-redux";
import {ROOT_URL} from "../../utils";
import QuickIpView from "../../views/QuickIpView"
import {search} from "../../actions/ipSearchAction";

const FETCH_API = `${ROOT_URL}tt/closed/`;

class ClosedTroubleTickets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            params : {},
            pagination : {},
            loading : true,
            data : [],
            columns : [
                {
                    title: 'Id',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title: 'Source Address',
                    dataIndex: 'source_ip',
                    key: 'source_ip',
                    render: (text,record) => <a onClick={()=> this.handleShowSourceIpProfile(record)}>{text}</a>,
                },
                {
                    title: 'Destination Address',
                    dataIndex: 'destination_ip',
                    key: 'destination_ip',
                    render: (text,record) => <a onClick={()=> this.handleShowDestinationIpProfile(record)}>{text}</a>,
                },
                {
                    title: 'Application',
                    dataIndex: 'application',
                    key: 'application',
                },
                {
                    title: 'Destination Port',
                    dataIndex: 'destination_port',
                    key: 'destination_port',
                },
                {
                    title: 'Log Name',
                    dataIndex: 'log.log_name',
                    key: 'log_name',
                },
                {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                },
            ],
            quickIpView:false
         };
    }

    handleShowSourceIpProfile(record){
        this.props.dispatchIpSearchValueUpdate(record.source_ip);
        this.setState({quickIpView : true})
    }

    handleShowDestinationIpProfile(record){
        this.props.dispatchIpSearchValueUpdate(record.destination_ip);
        this.setState({quickIpView : true})
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
    }

    componentDidMount() {
        this.handleFetchData();
    }

    handleFetchData = (params = {}) => {
        this.setState({
            loading : true
        });

        const token = `Token ${this.props.auth_token}`;
        
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization" : token
        };

        axios.post(FETCH_API,null,{headers, params})
            .then(res => {
                const page = this.state.pagination;
                page.total  = res.data.count;
                this.setState({
                    data:res.data.results,
                    loading:false,
                    pagination: page
                })
            });
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.state.pagination};
        pager.current = pagination.current;
        this.state.pagination = pager,
        this.handleFetchData({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    render() {
        const title = () => <h3>Closed Trouble Tickets</h3>
        const expandedRowRender = (record) => <p>
            <b>Verified Date: </b>{(new Date((parseInt(record.verified_datetime)+20700)*1000).toUTCString()).replace(" GMT", "")}
            <br/><b>Verified By: </b> {record.verified_by}
        </p>
        return (
            <Fragment>
                <Table
                    columns={this.state.columns}
                    title={title}
                    expandedRowRender={expandedRowRender}
                    rowKey={record => record.id}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                />
                <Drawer
                    closable={true}
                    width={800}
                    placement={"right"}
                    onClose={this.closeQuickIpView}
                    visible={this.state.quickIpView}>
                    <QuickIpView/>
                </Drawer>
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

export default connect(mapStateToProps,mapDispatchToProps)(ClosedTroubleTickets);