import React, {Component, Fragment} from 'react';
import {Row,Col,Select,DatePicker} from 'antd';
import {connect} from 'react-redux';
import {updateApplicationFilter} from "../actions/filterAction";


const {RangePicker} = DatePicker;
const { Option } = Select;

class Filter extends Component{

    handleOnChangeApplicationFilter = (event) => {
        console.log('application',event.target.value);
        this.props.dispatchApplicationFilterUpdate(event.target.value);
    }

    render(){
        return(
            <Fragment>
                <Row>
                    <Col span={4}>
                        <RangePicker />
                    </Col>
                    <Col span={4}>
                        <Select mode="multiple" style={{ width: "100%" }} placeholder="Firewall Rule" />
                    </Col>
                    <Col span={4}>
                        <Select mode="multiple" style={{ width: "100%" }} placeholder="Application" onChange={(e)=>{this.handleOnChangeApplicationFilter(e)}} >
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
        date_range : state.date_range,
        firewall_rule : state.firewall_rule,
        application : state.application,
        protocol : state.protocol,
        source_zone : state.source_zone,
        destination_zone: state.destination_zone
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchApplicationFilterUpdate : (application) => dispatch(updateApplicationFilter(application))
    };
}

export  default  connect(mapStateToProps,mapDispatchToProps)(Filter);