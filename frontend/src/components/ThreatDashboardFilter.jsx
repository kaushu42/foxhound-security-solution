import React, { Component, Fragment } from "react";
import { Row, Col, Select, DatePicker, Button } from "antd";
import { connect } from "react-redux";
import {
  updateDateRangePickerFilter,
  updateFirewallRuleFilter,
  updateApplicationFilter,
  updateProtocolFilter,
  updateSourceZoneFilter,
  updateDestinationZoneFilter,
  defaultDateSet
} from "../actions/filterAction";
import {ROOT_URL} from "../utils"
import moment from "moment";
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FETCH_THREAT_LOG_LATEST_DATE = `${ROOT_URL}log/latest/threat/`;
const FETCH_FILTERS = `${ROOT_URL}dashboard/threat/filters/`;

class DashboardFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firewall_rule_select_data: [],
      application_select_data: [],
      protocol_select_data: [],
      source_zone_select_data: [],
      destination_zone_select_data: [],
      defaultDate: null,
      // ip_address_select_data: [],
      loading_firewall_rule_select: true,
      loading_application_select: true,
      loading_protocol_select: true,
      loading_source_zone_select: true,
      loading_destination_zone_select: true,
      // loading_ip_address_select: true,
      date_range_value: [],
      firewall_rule_value: [],
      application_value: [],
      protocol_value: [],
      source_zone_value: [],
      destination_zone_value: [],
      ip_value: []
    };
  }

  componentDidMount() {
    
    // filterSelectDataServiceAsync(this.props.auth_token)
    //   .then(response => {
    //     const filter_data = response[0].data;
    //     const defaultDate = response[2].data;

    //     // const ip_data = response[1].data;
    //     this.setState({
    //       defaultDate: defaultDate.date,
    //       firewall_rule_select_data: filter_data.firewall_rule,
    //       application_select_data: filter_data.application,
    //       protocol_select_data: filter_data.protocol,
    //       source_zone_select_data: filter_data.source_zone,
    //       destination_zone_select_data: filter_data.destination_zone,
    //       // ip_address_select_data: ip_data,
    //       loading_firewall_rule_select: false,
    //       loading_application_select: false,
    //       loading_protocol_select: false,
    //       loading_source_zone_select: false,
    //       loading_destination_zone_select: false,
    //       // loading_ip_address_select: false
    //     });
    //   })
    //   .catch(error => console.log(error));
    
    const token = `Token ${this.props.auth_token}`;
    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token
    };
    
    axios.post(FETCH_THREAT_LOG_LATEST_DATE,null,{headers})
    .then(res =>{
      this.setState({
        defaultDate: res.data.date
      })
    })

    axios.post(FETCH_FILTERS,null,{headers})
    .then(res =>{
      this.setState({
        firewall_rule_select_data: res.data.firewall_rule,
        application_select_data: res.data.application,
        protocol_select_data: res.data.protocol,
        source_zone_select_data: res.data.source_zone,
        destination_zone_select_data: res.data.destination_zone,
      })
    })
  }

  handleRangePickerChange = (event, value) => {
    this.setState({
      date_range_value: value
    });
  };

  handleFirewallRuleFilterChange = value => {
    this.setState({
      firewall_rule_value: value
    });
  };

  handleApplicationFilterChange = value => {
    this.setState({
      application_value: value
    });
  };

  handleProtocolFilterChange = value => {
    this.setState({
      protocol_value: value
    });
  };

  handleSourceZoneFilterChange = value => {
    this.setState({
      source_zone_value: value
    });
  };

  handleDestinationZoneFilterChange = value => {
    this.setState({
      destination_zone_value: value
    });
  };

  // handleIpAddressRuleFilterChange = value => {
  //   this.setState({
  //     ip_value: value
  //   });
  // };

  handleFilterApplyChanges = event => {
    const {
      defaultDate,
      date_range_value,
      firewall_rule_value,
      application_value,
      protocol_value,
      source_zone_value,
      destination_zone_value,
      // ip_value
    } = this.state;
    event.preventDefault();
    this.props.dispatchRangePickerUpdate(date_range_value,defaultDate);
    // this.props.dispatchIpAddressRuleFilterUpdate(ip_value);
    this.props.dispatchDestinationZoneFilterUpdate(destination_zone_value);
    this.props.dispatchSourceZoneFilterUpdate(source_zone_value);
    this.props.dispatchProtocolFilterUpdate(protocol_value);
    this.props.dispatchApplicationFilterUpdate(application_value);
    this.props.dispatchFirewallRuleFilterUpdate(firewall_rule_value);
  };

  render() {
    const applicationSelectListItem = this.state.application_select_data.map(
      data => <Option key={data[0]}>{data[0]}</Option>
    );
    const firewallRuleSelectListItem = this.state.firewall_rule_select_data.map(
      data => <Option key={data[0]}>{data[1]}</Option>
    );
    const protocolSelectListItem = this.state.protocol_select_data.map(data => (
      <Option key={data[0]}>{data[0]}</Option>
    ));
    const sourceZoneSelectListItem = this.state.source_zone_select_data.map(
      data => <Option key={data[0]}>{data[0]}</Option>
    );
    const destinationZoneSelectListItem = this.state.destination_zone_select_data.map(
      data => <Option key={data[0]}>{data[0]}</Option>
    );
    // const ipAddressSelectListItem = this.state.ip_address_select_data.map(
    //   data => <Option key={data["id"]}>{data["address"]}</Option>
    // );

    return (
      <Fragment>  
        {this.state.defaultDate ?
        (this.props.dispatchDefaultDateSet(this.state.defaultDate),
        <div
          style={{
            padding: 24,
            background: "#fbfbfb",
            border: "1px solid #d9d9d9",
            borderRadius: 6
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <RangePicker
                style={{ width: "100%" }}
                defaultValue = {[moment(this.state.defaultDate),moment(this.state.defaultDate)]}
                size={"default"}
                id="RangePicker"
                onChange={(e, v) => this.handleRangePickerChange(e, v)}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Select
                id="FirewallRule"
                mode="multiple"
                size={"default"}
                loading={this.state.loading_firewall_rule_select}
                allowClear={true}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
                placeholder="Firewall Rule"
                onChange={v => this.handleFirewallRuleFilterChange(v)}
              >
                {firewallRuleSelectListItem}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Select
                id="Application"
                mode="multiple"
                size={"default"}
                loading={this.state.loading_application_select}
                allowClear={true}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
                placeholder="Application"
                onChange={v => this.handleApplicationFilterChange(v)}
              >
                {applicationSelectListItem}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Select
                id="Protocol"
                mode="multiple"
                size={"default"}
                loading={this.state.loading_protocol_select}
                allowClear={true}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
                placeholder="Protocol"
                onChange={v => this.handleProtocolFilterChange(v)}
              >
                {protocolSelectListItem}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Select
                id="SourceZone"
                mode="multiple"
                size={"default"}
                loading={this.state.loading_source_zone_select}
                allowClear={true}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
                placeholder="Source Zone"
                onChange={v => this.handleSourceZoneFilterChange(v)}
              >
                {sourceZoneSelectListItem}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Select
                id="DestinationZone"
                mode="multiple"
                size={"default"}
                loading={this.state.loading_destination_zone_select}
                allowClear={true}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
                placeholder="Destination Zone"
                onChange={v => this.handleDestinationZoneFilterChange(v)}
              >
                {destinationZoneSelectListItem}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8} lg={5} xl={5} offset={19}>
              <Button
                type={"primary"}
                style={{ width: "100%" }}
                onClick={this.handleFilterApplyChanges}
              >
                Apply Filter
              </Button>
            </Col>
          </Row>
        </div>
        ): null}
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth_token: state.auth.auth_token,
    date_range: state.filter.date_range,
    firewall_rule: state.filter.firewall_rule,
    application: state.filter.application,
    protocol: state.filter.protocol,
    source_zone: state.filter.source_zone,
    destination_zone: state.filter.destination_zone,
    // ip_address: state.filter.ip_address
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatchDefaultDateSet:(value)=>dispatch(defaultDateSet(value)),
    dispatchRangePickerUpdate: (value, defaultDate) =>
      dispatch(updateDateRangePickerFilter(value, defaultDate)),
    dispatchFirewallRuleFilterUpdate: value =>
      dispatch(updateFirewallRuleFilter(value)),
    dispatchProtocolFilterUpdate: value =>
      dispatch(updateProtocolFilter(value)),
    dispatchApplicationFilterUpdate: value =>
      dispatch(updateApplicationFilter(value)),
    dispatchSourceZoneFilterUpdate: value =>
      dispatch(updateSourceZoneFilter(value)),
    dispatchDestinationZoneFilterUpdate: value =>
      dispatch(updateDestinationZoneFilter(value)),
    // dispatchIpAddressRuleFilterUpdate: value =>
    //   dispatch(updateIpAddressFilter(value))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardFilter);
