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
        this.handleFetchFirewallRuleSelectData();
    }

    handleFetchFirewallRuleSelectData(){
        // let url = 'http://192.168.100.10:8000/api/v1/dashboard/filters/';
        // let options = {
        //     method: 'POST',
        //     url: url,
        //     headers: {
        //         'Authorization': 'Token 67e9965410297c949312bbcf17447a94cb19e242',
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json;charset=UTF-8'
        //     },
        //     data: {
        //     }
        // };
        // const response = await axios(options);
        // let responseOK = response && response.status === 200 && response.statusText === 'OK';
        // if (responseOK) {
        //
        // }
        //

        fetch('http://192.168.100.10:8000/api/v1/users/login/',{
            method : 'POST',
            headers:{
                'Content-Type' : 'multipart/form-data'
            },
            formData : {
                "username": "kaush",
                "password": "Admin123#"
            }

        }).then(res => console.log(res));

        // fetch('http://192.168.100.10:8000/api/v1/dashboard/filters/', {
        //     method: 'POST',
        //     mode: 'no-cors',
        //     headers: {
        //         // 'Access-Control-Allow-Credentials':true,
        //         'Access-Control-Allow-Origin':'*',
        //         'Authorization': 'Token 67e9965410297c949312bbcf17447a94cb19e242',
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json'
        //     },
        // })
        //     .then(res => console.log(res));
    }


    handleOnChangeApplicationFilter = (value) => {
        this.props.dispatchApplicationFilterUpdate(value);
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
                        <Select mode="multiple" style={{ width: "100%" }} placeholder="Application" onChange={(value)=>{this.handleOnChangeApplicationFilter(value)}} >
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