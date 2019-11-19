import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Table} from 'antd';
import {
    fetchVerifiedRulesData,
    updatePagination
} from "../../actions/verifiedRulesAction";


class VerifiedRulesTable extends Component {

    state = {
        params : {},
        columns: [
            {
                title: 'Created Date',
                dataIndex: 'created_date_time',
                key: 'created_date_time',
                render: text => text,
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
        const expandedRowRender = record => <p><b>Verified Date: </b>{Date(record.verified_date_time)} <br/><b>Verified By: </b> {record.verified_by_user} </p>;
        const title = () => <h3>Verified Rules</h3>
        return(
            <Fragment>
                <Table
                    bordered={true}
                    rowKey={record => record.id}
                    title = {title}
                    expandedRowRender={expandedRowRender}
                    columns={this.state.columns}
                    dataSource = {this.props.verifiedRulesData}
                    pagination={this.props.verifiedRulePagination}
                    onChange={this.handleTableChange}
                />
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