import React, {Component} from 'react';
import { Table, Divider, Tag } from 'antd';

class ProcessedLogsTable extends Component{

    constructor(props){
        super(props);
        this.state = {
            columns : [
                {
                    title: 'Log Date',
                    dataIndex: 'logDate',
                    key: 'logData',
                },
                {
                    title: 'Log Name',
                    dataIndex: 'logName',
                    key: 'logName',
                },
                {
                    title: 'Log Processed Date',
                    dataIndex: 'logProcessedDate',
                    key: 'logProcessedDate',
                },
                {
                    title: 'Log Row Count',
                    dataIndex : 'logRowCount',
                    key : 'logRowCount'

                },
                {
                    title: 'Log Size',
                    dataIndex : 'logSize',
                    key : 'logSize'

                },
                {
                    title: 'Log Type',
                    dataIndex : 'logType',
                    key : 'logType'

                },
                {
                    title: 'Log Device',
                    dataIndex : 'logDevice',
                    key : 'logDevice'

                }
            ],
            tableData : [
                {
                    key : 1,
                    logDate : '10/10/2010',
                    logName : "Silverlining-PAVM-Primary-traffic.csv",
                    logProcessedDate : '10/10/2010',
                    logRowCount : 150000,
                    logSize : '54 MB',
                    logType : 'TRAFFIC LOG',
                    logDevice : 'PALO ALTO NEXT-GEN FIREWALL'
                }
            ]
        }

    }


    componentDidMount() {
    }

    render(){
        return(
            <div>
                <Table columns={this.state.columns} dataSource={this.state.tableData}/>
            </div>
        )
    }
}

export default ProcessedLogsTable;
