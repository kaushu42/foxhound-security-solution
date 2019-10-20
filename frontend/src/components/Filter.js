import React, {Component, Fragment} from 'react';
import {Row,Col,Select,DatePicker} from 'antd';
import {connect} from 'react-redux';
import axios from 'axios';

import {
    updateDateRangePickerFilter,
    updateFirewallRuleFilter,
    updateApplicationFilter,
    updateProtocolFilter,
    updateSourceZoneFilter,
    updateDestinationZoneFilter

} from "../actions/filterAction";


const {RangePicker} = DatePicker;
const { Option } = Select;
const FILTER_DATA_API = "http://127.0.0.1:8000/api/v1/dashboard/filters/";
const STATS_DATA_API = "http://127.0.0.1:8000/api/v1/dashboard/stats/";

class Filter extends Component{

    constructor(props){
        super(props);
        this.state = {
            firewall_rule_select_data : [],
            application_select_data : [],
            protocol_select_data: [],
            source_zone_select_data: [],
            destination_zone_select_data : [],
            loading_firewall_rule_select: true,
            loading_application_select: true,
            loading_protocol_select : true,
            loading_source_zone_select: true,
            loading_destination_zone_select: true
        }
        this.handleFetchFilterSelectData();
    }

    // componentDidUpdate() {
    //     const headers = {
    //         'Content-Type': 'application/json',
    //         'Authorization': 'Token ab89a41b0bd3948c5a2bafbae569ab698d22f347'
    //     }
    //     var bodyFormData = new FormData();
    //     bodyFormData.set('start_date', this.props.date_range[0]);
    //     bodyFormData.set('end_date', this.props.date_range[1]);
    //     bodyFormData.set('firewall_rule', this.props.firewall_rule[0]);
    //     bodyFormData.set('application', this.props.application[0]);
    //     bodyFormData.set('protocol', this.props.protocol[0]);
    //     bodyFormData.set('source_zone', this.props.source_zone[0]);
    //     bodyFormData.set('destination_zone', this.props.destination_zone[0]);
    //
    //
    //     axios.post(STATS_DATA_API,bodyFormData,{
    //         headers: headers
    //     })
    //         .then((response) => response)
    //         .catch((error) => console.log(error))
    //
    // }

    handleFetchFilterSelectData = () => {
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Token ab89a41b0bd3948c5a2bafbae569ab698d22f347"
        };

        axios.post(FILTER_DATA_API, {},{
            headers: headers
        })
            .then(response => {
                const data = response.data;
                this.setState({
                    firewall_rule_select_data : data.firewall_rule,
                    application_select_data : data.application,
                    protocol_select_data : data.protocol,
                    source_zone_select_data : data.source_zone,
                    destination_zone_select_data : data.destination_zone,
                    loading_firewall_rule_select : false,
                    loading_application_select : false,
                    loading_protocol_select : false,
                    loading_source_zone_select : false,
                    loading_destination_zone_select : false,
                });

            })
            .catch((error) => console.log(error));
    }

    handleRangePickerChange = (event,value) => {
        this.props.dispatchRangePickerUpdate(value);
    }

    handleFirewallRuleFilterChange = (value) => {
        this.props.dispatchFirewallRuleFilterUpdate(value);
    }

    handleApplicationFilterChange = (value) => {
        this.props.dispatchApplicationFilterUpdate(value);
    }

    handleProtocolFilterChange = (value) => {
        this.props.dispatchProtocolFilterUpdate(value);
    }

    handleSourceZoneFilterChange = (value) => {
        this.props.dispatchSourceZoneFilterUpdate(value);

    }

    handleDestinationZoneFilterChange = (value)  => {
        this.props.dispatchDestinationZoneFilterUpdate(value);
    }

    render(){
        const applicationSelectListItem = this.state.application_select_data.map(data => <Option key={data}>{data}</Option>);
        const firewallRuleSelectListItem = this.state.firewall_rule_select_data.map(data => <Option key={data}>{data}</Option>);
        const protocolSelectListItem = this.state.protocol_select_data.map(data => <Option key={data}>{data}</Option>);
        const sourceZoneSelectListItem = this.state.source_zone_select_data.map(data => <Option key={data}>{data}</Option>);
        const destinationZoneSelectListItem = this.state.destination_zone_select_data.map(data => <Option key={data}>{data}</Option>);

        return(
            <Fragment>
                <Row>
                    <Col span={4}>
                        <RangePicker id="RangePicker" onChange={(e,v)=>this.handleRangePickerChange(e,v)}/>
                    </Col>
                    <Col span={4}>
                        <Select
                                id = "FirewallRule"
                                mode="multiple"
                                loading={this.state.loading_firewall_rule_select}
                                allowClear={true}
                                style={{ width: "100%" }}
                                placeholder="Firewall Rule"
                                onChange={(v)=> this.handleFirewallRuleFilterChange(v)}>
                            {
                                firewallRuleSelectListItem
                            }
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                                id="Application"
                                mode="multiple"
                                loading={this.state.loading_application_select}
                                allowClear={true}
                                style={{ width: "100%" }}
                                placeholder="Application"
                                onChange={(v)=>this.handleApplicationFilterChange(v)} >
                            {
                                applicationSelectListItem
                            }
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            id="Protocol"
                            mode="multiple"
                            loading={this.state.loading_protocol_select}
                            allowClear={true}
                            style={{ width: "100%" }}
                            placeholder="Protocol"
                            onChange={(v)=>this.handleProtocolFilterChange(v)}>
                            {
                                protocolSelectListItem
                            }
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select id="SourceZone"
                                mode="multiple"
                                loading={this.state.loading_source_zone_select}
                                allowClear={true}
                                style={{ width: "100%" }}
                                placeholder="Source Zone"
                                onChange={(v)=>this.handleSourceZoneFilterChange(v)}>
                        {
                                sourceZoneSelectListItem
                            }
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select id="DestinationZone"
                                mode="multiple"
                                loading={this.state.loading_destination_zone_select}
                                allowClear={true}
                                style={{ width: "100%" }}
                                placeholder="Destination Zone"
                                onChange={(v)=>this.handleDestinationZoneFilterChange(v)}>
                        {
                                destinationZoneSelectListItem
                            }
                        </Select>
                    </Col>
                </Row>
                {this.props.date_range}
                {this.props.firewall_rule}
                {this.props.application}
                {this.props.protocol}
                {this.props.source_zone}
                {this.props.destination_zone}

            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone: state.filter.destination_zone
    }
}


const mapDispatchToProps = dispatch => {
    return {
        dispatchRangePickerUpdate: value => dispatch(updateDateRangePickerFilter(value)),
        dispatchFirewallRuleFilterUpdate:value => dispatch(updateFirewallRuleFilter(value)),
        dispatchProtocolFilterUpdate:value => dispatch(updateProtocolFilter(value)),
        dispatchApplicationFilterUpdate : value => dispatch(updateApplicationFilter(value)),
        dispatchSourceZoneFilterUpdate:value => dispatch(updateSourceZoneFilter(value)),
        dispatchDestinationZoneFilterUpdate :value => dispatch(updateDestinationZoneFilter(value)),
    };
}

export  default  connect(mapStateToProps,mapDispatchToProps)(Filter);