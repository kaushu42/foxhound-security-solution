import React, {Component, Fragment} from 'react';
import {Row,Col,Select,DatePicker} from 'antd';
import {connect} from 'react-redux';
import {APPLICATION_FILTER_UPDATED} from "../actionTypes/filterActionTypes";
import {updateApplicationFilter} from "../actions/filterAction";


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
            destination_zone_select_data : []
        }
        this.handleFetchFirewallRuleSelectData();

    }

    componentDidUpdate() {
    }

    handleFetchFirewallRuleSelectData(){
        let headers = new Headers({
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Token ab89a41b0bd3948c5a2bafbae569ab698d22f347"
        });

        fetch("http://127.0.0.1:8000/api/v1/dashboard/filters/", {
            method: "POST",
            headers: headers
        })
            .then(res => res.json())
            .then(data => console.log(data));
    }


    handleFilterChange = (id,value) => {
        // console.log(id,value);
        // this.props.dispatchApplicationFilterUpdate(value);
    }

    render(){

        return(
            <Fragment>
                <div>{this.props.application}</div>
                <Row>
                    <Col span={4}>
                        <RangePicker />
                    </Col>
                    <Col span={4}>
                        <Select mode="multiple" style={{ width: "100%" }} placeholder="Firewall Rule" />
                    </Col>
                    <Col span={4}>
                        <Select mode="multiple" style={{ width: "100%" }} id="Application" placeholder="Application" onChange={(id,value)=>{console.log(id,value);this.handleFilterChange(id,value)}} >
                            <Option value="google-base">google-base</Option>
                            <Option value="microsoft-azure-base">microsoft-azure-base</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select mode="multiple" style={{ width: "100%" }} placeholder="Protocol" />
                    </Col>
                    <Col span={4}>
                        <Select mode="multiple" style={{ width: "100%" }} placeholder="Source Zone" />
                    </Col>
                    <Col span={4}>
                        <Select mode="multiple" style={{ width: "100%" }} placeholder="Destination Zone" />
                    </Col>
                </Row>
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
        dispatchApplicationFilterUpdate : value => dispatch(updateApplicationFilter(value))
    };
}

export  default  connect(mapStateToProps,mapDispatchToProps)(Filter);