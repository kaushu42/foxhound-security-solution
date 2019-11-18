import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Table} from 'antd';
import {
    fetchAnomalousRulesData,
    updateAnomalousRule
} from "../../actions/anomalousRulesAction";


class AnomalousRulesTable extends Component {

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
            },
            {
                title : 'Actions',
                dataIndex: 'actions',
                // render : (text,record) => {
                //     return (
                //         <Fragment>
                //             <a onClick={() => this.props.handleAnomalousRuleAccept(this.props.auth_token,record)}><Icon type="check-circle" theme="filled" />&nbsp;&nbsp;</a>
                //         </Fragment>
                //     )
                // }
                render: text => <a>Follow Up</a>
            }
        ],
        data: []

    }

    componentDidMount() {
        this.props.dispatchFetchAnomalousRulesData(this.props.auth_token);
    }

    render(){
        const expandedRowRender = record => <p><b>Verified Date: </b>{Date(record.verified_date_time)} <br/><b>Verified By: </b> {record.verified_by_user} </p>;
        const title = () => <h3>Anomalous Rules</h3>
        return(
            <Fragment>
                <Table
                    bordered={true}
                    rowKey={record => record.id}
                    title = {title}
                    expandedRowRender={expandedRowRender}
                    columns={this.state.columns}
                    dataSource = {this.props.anomalousRulesData}
                />
            </Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,

        anomalousRulesLoading : state.anomalousRule.anomalousRulesLoading,
        anomalousRulesData : state.anomalousRule.anomalousRulesData,
        anomalousRulesSuccess : state.anomalousRule.anomalousRulesSuccess,
        anomalousRulesError: state.anomalousRule.anomalousRulesError,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchAnomalousRulesData : (auth_token) => dispatch(fetchAnomalousRulesData(auth_token)),
        handleAnomalousRuleUpdate : (auth_token,record) => dispatch(updateAnomalousRule(auth_token,record)),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(AnomalousRulesTable)