import React, {Component, Fragment} from "react";
import {Statistic} from "antd";

class FollowUpDrawer extends Component {
    constructor(props){
        super(props);
        this.state = {
            record : props.record
        }
    }

    handleFetchData = () =>{

    }

    render (){
        return (
            <Fragment>
                <Statistic title="Source IP" value={this.state.record.source_ip} />
                <Statistic title="Destination IP" value={this.state.record.destination_ip} />
                <Statistic title="Source Port" value={this.state.record.source_port} />
                <Statistic title="Destination Port" value={this.state.record.destination_port} />
                <Statistic title="Application" value={this.state.record.application} />
                <Statistic title="Bytes Sent" value={this.state.record.bytes_sent} />
                <Statistic title="Bytes Received" value={this.state.record.bytes_received} />
                <Statistic title="Log name" value={this.state.record.log.log_name} />
            </Fragment>
        )
    }
}


export default FollowUpDrawer;
