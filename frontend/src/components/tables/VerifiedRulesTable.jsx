import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Spin, Table} from 'antd';
import {
    fetchVerifiedRulesData,
    updatePagination
} from "../../actions/verifiedRulesAction";
import moment from "moment";

class VerifiedRulesTable extends Component {

    state = {
        params : {},
        columns: [
            {
                title: 'Created Date',
                dataIndex: 'created_date_time',
                key: 'created_date_time',
                render: text => moment(text).format("YYYY-MM-DD, HH:MM:SS"),
            },
            {
                title: 'Source IP',
                dataIndex: 'source_ip',
                key: 'source_ip',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Destination IP',
                dataIndex: 'destination_ip',
                key: 'destination_ip',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Application',
                dataIndex: 'application',
                key: 'application',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Rule Name',
                dataIndex: 'name',
                key: 'name',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                render: text => <a>{text}</a>,
            }
        ],
        data: []
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.props.verifiedRulePagination };
        pager.current = pagination.current;
        this.props.dispatchPaginationUpdate(pager);
        this.handleFetchVerifiedRulesData({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    handleFetchVerifiedRulesData = (params={}) => {
        const {auth_token,verifiedRulePagination} = this.props;
        this.props.dispatchFetchVerifiedRulesData(auth_token,params,verifiedRulePagination);
    }

    componentDidMount() {
        // this.props.dispatchFetchVerifiedRulesData(this.props.auth_token);
        this.handleFetchVerifiedRulesData(this.state.params)
    }

    render(){
        const expandedRowRender = record => <p><b>Verified Date: </b>{moment(record.verified_date_time).format("YYYY-MM-DD, HH:MM:SS")} <br/><b>Verified By: </b> {record.verified_by_user.username} </p>;
        const title = () => <h3>Verified Rules</h3>
        return(
            <Fragment>
                <div style={{marginBottom:24,padding:24,background:'#fbfbfb',border: '1px solid #d9d9d9',borderRadius: 6}}>
                    <Table
                        rowKey={record => record.id}
                        expandedRowRender={expandedRowRender}
                        columns={this.state.columns}
                        dataSource = {this.props.verifiedRulesData}
                        pagination={this.props.verifiedRulePagination}
                        onChange={this.handleTableChange}
                    />
                </div>
            </Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
        current_session_user_id : state.auth.current_session_user_id,

        verifiedRulesLoading : state.verifiedRule.verifiedRulesLoading,
        verifiedRulesData : state.verifiedRule.verifiedRulesData,
        verifiedRulesSuccess : state.verifiedRule.verifiedRulesSuccess,
        verifiedRulesError: state.verifiedRule.verifiedRulesError,

        verifiedRulePagination : state.verifiedRule.verifiedRulePagination
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchVerifiedRulesData : (auth_token, params, pagination) => dispatch(fetchVerifiedRulesData(auth_token, params, pagination)),
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(VerifiedRulesTable)