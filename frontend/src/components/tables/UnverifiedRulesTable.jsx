import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Spin, Table} from 'antd';
import {fetchUnverifiedRulesData} from "../../actions/unverifiedRulesAction";

class UnverifiedRulesTable extends Component {

    state = {
        columns: [
            {
                title: 'Created Date',
                dataIndex: 'created_date_time',
                key: 'created_date_time',
                render: text => <a>{text}</a>,
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
                title: 'Rule Name',
                dataIndex: 'ruleName',
                key: 'ruleName',
                render: text => <a>{text}</a>,
            }
        ],
        data: []

    }

    componentDidMount() {
        this.props.dispatchFetchUnverifiedRulesData(this.props.auth_token);
    }


    render(){
        const expandedRowRender = record => <p><b>Verified Data: </b>{record.verifiedDate} <br/><b>Verified By: </b> {record.verifiedBy} </p>;
        const title = () => <h3>Verified Rules</h3>
        return(
            <Fragment>
                <Spin spinning={this.props.unverifiedRulesLoading}>
                    <Table
                        bordered={true}
                        title = {title}
                        expandedRowRender={expandedRowRender}
                        columns={this.state.columns.map(item => ({ ...item, ellipsis: 'enable' }))}
                        dataSource = {this.props.unverifiedRulesData}
                    />
                </Spin>
            </Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,

        unverifiedRulesLoading : state.unverifiedRule.unverifiedRulesLoading,
        unverifiedRulesData : state.unverifiedRule.unverifiedRulesData,
        unverifiedRulesSuccess : state.unverifiedRule.unverifiedRulesSuccess,
        unverifiedRulesError: state.unverifiedRule.unverifiedRulesError,

    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchUnverifiedRulesData : (auth_token) => dispatch(fetchUnverifiedRulesData(auth_token))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(UnverifiedRulesTable)