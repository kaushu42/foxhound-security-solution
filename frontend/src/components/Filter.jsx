import React, {Component, Fragment} from 'react';
import {Row,Col,Select,DatePicker} from 'antd';
import {connect} from 'react-redux';
import {
    updateDateRangePickerFilter,
    updateFirewallRuleFilter,
    updateApplicationFilter,
    updateProtocolFilter,
    updateSourceZoneFilter,
    updateDestinationZoneFilter
} from "../actions/filterAction";
import {filterSelectDataServiceAsync} from "../services/filterSelectDataService";

const {RangePicker} = DatePicker;
const { Option } = Select;
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
            loading_destination_zone_select: true,
            date_range_value : null,
            firewall_rule_value : null,
            application_value :null,
            protocol_value:null,
            source_zone_value : null,
            destination_zone_value : null
        }
   }

    componentDidMount() {
        filterSelectDataServiceAsync(this.props.auth_token)
            .then(response => {
                const data = response[0].data;
                console.log(data);
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
        const applicationSelectListItem = this.state.application_select_data.map(data => <Option key={data[0]}>{data[1]}</Option>);
        const firewallRuleSelectListItem = this.state.firewall_rule_select_data.map(data => <Option key={data[0]}>{data[1]}</Option>);
        const protocolSelectListItem = this.state.protocol_select_data.map(data => <Option key={data[0]}>{data[1]}</Option>);
        const sourceZoneSelectListItem = this.state.source_zone_select_data.map(data => <Option key={data[0]}>{data[1]}</Option>);
        const destinationZoneSelectListItem = this.state.destination_zone_select_data.map(data => <Option key={data[0]}>{data[1]}</Option>);

        return(
            <Fragment>
                <div style={{padding:24,background:'#fbfbfb',border: '1px solid #d9d9d9',borderRadius: 6}}>
                    <Row>
                        <Col xs={24} sm={24} md={8} lg={4} xl={4}>
                            <RangePicker id="RangePicker" onChange={(e,v)=>this.handleRangePickerChange(e,v)}/>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={4} xl={4}>
                            <Select
                                id="FirewallRule"
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
                        <Col xs={24} sm={24} md={8} lg={4} xl={4}>
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
                        <Col xs={24} sm={24} md={8} lg={4} xl={4}>
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
                        <Col xs={24} sm={24} md={8} lg={4} xl={4}>
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
                        <Col xs={24} sm={24} md={8} lg={4} xl={4}>
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
                </div>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone
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