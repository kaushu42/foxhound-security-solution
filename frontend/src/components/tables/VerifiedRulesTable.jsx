import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Avatar, Button, Col, Drawer, Form, List, Row, Select, Spin, Statistic, Table} from 'antd';
import {
    fetchVerifiedRulesData, 
    handleDrawerClose,
    updateVerifiedRule
} from "../../actions/verifiedRulesAction";
import {drawerInfoStyle} from "../../utils";


class VerifiedRulesTable extends Component {

    state = {
        columns: [
            {
                title: 'Id',
                dataIndex: 'id',
                key: 'id',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Created Date',
                dataIndex: 'created_date_time',
                key: 'created_date_time',
                render: text => Date(text),
            },
            {
                title: 'Verified Date',
                dataIndex: 'verified_date_time',
                key: 'verified_date_time',
                render: text => Date(text),
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
            // {
            //     title : 'Actions',
            //     dataIndex: 'actions',
            //     render : (text,record) => {
            //         return (
            //             <Fragment>
            //                 <a onClick={() => this.props.handleVerifiedRuleUpdate(this.props.auth_token,record)}>Update </a>
            //             </Fragment>
            //         )
            //     }
            // }
        ],
        data: []

    }

    componentDidMount() {
        this.props.dispatchFetchVerifiedRulesData(this.props.auth_token);
    }

    render(){
        const expandedRowRender = record => <p><b>Verified Data: </b>{record.verifiedDate} <br/><b>Verified By: </b> {record.verifiedBy} </p>;
        const title = () => <h3>Verified Rules</h3>
        return(
            <Fragment>
                <Table
                    bordered={true}
                    rowKey={record => record.id}
                    title = {title}
                    expandedRowRender={expandedRowRender}
                    columns={this.state.columns.map(item => ({ ...item, ellipsis: 'enable' }))}
                    dataSource = {this.props.verifiedRulesData}
                />
            </Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
        // current_session_user_id : state.auth.current_session_user_id,

        verifiedRulesLoading : state.verifiedRule.verifiedRulesLoading,
        verifiedRulesData : state.verifiedRule.verifiedRulesData,
        verifiedRulesSuccess : state.verifiedRule.verifiedRulesSuccess,
        verifiedRulesError: state.verifiedRule.verifiedRulesError,

        verifiedRuleUpdateDrawerLoading: state.verifiedRule.verifiedRuleUpdateDrawerLoading,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchVerifiedRulesData : (auth_token) => dispatch(fetchVerifiedRulesData(auth_token)),
        handleVerifiedRuleUpdate : (auth_token,record) => dispatch(updateVerifiedRule(auth_token,record)),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(VerifiedRulesTable)