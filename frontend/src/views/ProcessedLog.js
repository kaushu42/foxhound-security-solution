import React, {Component} from 'react';
import { Table, Divider, Tag } from 'antd';

class ProcessedLog extends Component{

    constructor(props){
        super(props);
        this.state = {
            columns : [
                {
                    title: 'userId',
                    dataIndex: 'userId',
                    key: 'userId',
                },
                {
                    title: 'id',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title: 'title',
                    dataIndex: 'title',
                    key: 'title',
                },
                {
                    title: 'body',
                    dataIndex : 'body',
                    key : 'body'

                }
            ],
            tableData : []
        }

    }


    componentDidMount() {
        fetch('https://jsonplaceholder.typicode.com/posts')
            .then(response => response.json())
            .then(json => {
                this.setState({tableData : json});


            });


    }

    render(){
        return(
            <div>
                <h1>Processed Logs</h1>
                <Table columns={this.state.columns} dataSource={this.state.tableData}/>
            </div>
        )
    }
}

export default ProcessedLog;
