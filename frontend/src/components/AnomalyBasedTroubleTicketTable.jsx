import React, {Component} from 'react';
import {Table} from 'antd';

// log Data | Session Duration | Source IP | Destination IP | Source Port | Destination Port | Application | Assigned To User | Comments

class AnomalyBasedTroubleTicketTable extends Component {


    constructor(props){
        super(props);
        this.state = {
            columns : [
                {
                    title: 'Log Date',
                    dataIndex: 'logDate',
                    key: 'logDate',
                },
                {
                    title: 'Session Duration',
                    dataIndex: 'sessionDuration',
                    key: 'sessionDuration',
                },
                {
                    title: 'Source Address',
                    dataIndex: 'sourceAddress',
                    key: 'sourceAddress',
                },
                {
                    title: 'Destination Address',
                    dataIndex : 'destinationAddress',
                    key : 'destinationAddress'

                },
                {
                    title: 'Source Port',
                    dataIndex : 'sourcePort',
                    key : 'sourcePort'

                },
                {
                    title: 'Destination Port',
                    dataIndex : 'destinationPort',
                    key : 'destinationPort'

                },
                {
                    title: 'Application',
                    dataIndex : 'application',
                    key : 'application'

                },
                {
                    title: 'Assigned To ',
                    dataIndex : 'assignedTo',
                    key : 'assignedTo'

                },
                {
                    title: 'Assigned By',
                    dataIndex : 'assignedBy',
                    key : 'assignedBy'

                },
                {
                    title: 'Comment',
                    dataIndex : 'comment',
                    key : 'comment'
                },
                {

                }

            ],
            data : [
                {
                    key: 1,
                    logDate : '10/10/2019',
                    sessionDuration : '234 sec',
                    sourceAddress : '10.19.18.19',
                    destinationAddress : '192.168.10.10',
                    sourcePort : 223,
                    destinationPort : 80,
                    application : 'oracle-db',
                    assignedTo : 'Keshav Chaurasia',
                    assignedBy : 'Network Admin',
                    comment : 'Automated Ticket'
                }
            ]
        }


    }


    render() {
        return (
            <Table columns={this.state.columns} dataSource={this.state.data}  pagination/>
        )
    }
}

export default AnomalyBasedTroubleTicketTable;