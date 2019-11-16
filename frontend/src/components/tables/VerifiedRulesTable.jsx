import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Table} from 'antd';

class VerifiedRulesTable extends Component {


    state = {
        columns: [
            {
                title: 'Source Address',
                dataIndex: 'sourceAddress',
                key: 'sourceAddress',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Destination Address',
                dataIndex: 'destinationAddress',
                key: 'destinationAddress',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Application',
                dataIndex: 'application',
                key: 'application',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Destination Port',
                dataIndex: 'destinationPort',
                key: 'destinationPort',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Rule Name',
                dataIndex: 'ruleName',
                key: 'ruleName',
                render: text => <a>{text}</a>,
            }
        ],
        data: [
            {
                key : 1,
                sourceAddress : '192.168.101.10',
                destinationAddress : '202.53.6.79',
                application : 'mssql',
                destinationPort : '137',
                ruleName : 'app-server to core-db-server',
                verifiedDate : String(new Date(2019,10,12)),
                verifiedBy : 'KeshavChaurasia'
            }
        ]

    }


    render(){
        const expandedRowRender = record => <p><b>Verified Data: </b>{record.verifiedDate} <br/><b>Verified By: </b> {record.verifiedBy} </p>;
        const title = () => <h3>Verified Rules</h3>
        return(
            <Fragment>
                <Table
                    bordered={true}
                    title = {title}
                    expandedRowRender={expandedRowRender}
                    columns={this.state.columns.map(item => ({ ...item, ellipsis: 'enable' }))}
                    dataSource = {this.state.data}
                />
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

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(VerifiedRulesTable)