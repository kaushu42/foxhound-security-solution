import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Table} from 'antd';
import {
    fetchVerifiedRulesData,
    updateVerifiedRule
} from "../../actions/verifiedRulesAction";


class VerifiedRulesTable extends Component {

    state = {
        columns: [
            {
                title: 'Id',
                dataIndex: 'table_id',
                key: 'table_id',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Created Date',
                dataIndex: 'created_date_time',
                key: 'created_date_time',
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
            }
        ],
        data: []

    }

    componentDidMount() {
        this.props.dispatchFetchVerifiedRulesData(this.props.auth_token);
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
                />
            </Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,

        verifiedRulesLoading : state.verifiedRule.verifiedRulesLoading,
        verifiedRulesData : state.verifiedRule.verifiedRulesData,
        verifiedRulesSuccess : state.verifiedRule.verifiedRulesSuccess,
        verifiedRulesError: state.verifiedRule.verifiedRulesError
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchVerifiedRulesData : (auth_token) => dispatch(fetchVerifiedRulesData(auth_token)),
        handleVerifiedRuleUpdate : (auth_token,record) => dispatch(updateVerifiedRule(auth_token,record)),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(VerifiedRulesTable)