import React, { Component, Fragment } from "react";
import { Card, Spin, Statistic, Drawer } from "antd";
import { connect } from "react-redux";
import axios from "axios";
import { ROOT_URL } from "../../utils";
const gridStyle = {
  width: "20%",
  textAlign: "center"
};

const FETCH_API = `${ROOT_URL}dashboard/stats/`;

class DashboardStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      uplink: 0,
      downlink: 0,
      opened_tt: 0,
      new_rules: 0,
      unit: "",
      new_source_ip: 0,
      new_destination_ip: 0,
      new_source_ip_drawer_visible:false,
      new_destination_ip_drawer_visible:false
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.fetchDashboardStats();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      String(prevProps.ip_address) !== String(this.props.ip_address) ||
      String(prevProps.date_range[0]) !== String(this.props.date_range[0]) ||
      String(prevProps.date_range[1]) !== String(this.props.date_range[1]) ||
      String(prevProps.firewall_rule) !== String(this.props.firewall_rule) ||
      String(prevProps.application) !== String(this.props.application) ||
      String(prevProps.protocol) !== String(this.props.protocol) ||
      String(prevProps.source_zone) !== String(this.props.source_zone) ||
      String(prevProps.destination_zone) !== String(this.props.destination_zone)
    ) {
      this.setState({ loading: true });
      this.fetchDashboardStats();
    }
  }

  fetchDashboardStats = () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${this.props.auth_token}`
    };
    var bodyFormData = new FormData();
    bodyFormData.set("ip_address", this.props.ip_address);
    bodyFormData.set("start_date", this.props.date_range[0]);
    bodyFormData.set("end_date", this.props.date_range[1]);
    bodyFormData.set("firewall_rule", this.props.firewall_rule);
    bodyFormData.set("application", this.props.application);
    bodyFormData.set("protocol", this.props.protocol);
    bodyFormData.set("source_zone", this.props.source_zone);
    bodyFormData.set("destination_zone", this.props.destination_zone);

    axios
      .post(FETCH_API, bodyFormData, {
        headers: headers
      })
      .then(response => {
        const data = response.data;
        data.bytes_sent > 1000000000 || data.bytes_received > 1000000000
          ? this.setState({
              uplink: parseFloat(data.bytes_sent / (1024 * 1024 * 1024)).toFixed(2),
              downlink: parseFloat(data.bytes_received / (1024 * 1024 * 1024)).toFixed(2),
              unit: "GB",
              opened_tt: data.opened_tt,
              new_rules: data.new_rules,
              new_source_ip: data.new_source_ip,
              new_destination_ip: data.new_destination_ip
            })
          : this.setState({
              uplink: parseFloat(data.bytes_sent / (1024 * 1024)).toFixed(2),
              downlink: parseFloat(data.bytes_received / (1024 * 1024)).toFixed(2),
              unit: "MB",
              opened_tt: data.opened_tt,
              new_rules: data.new_rules,
              new_source_ip: data.new_source_ip,
              new_destination_ip: data.new_destination_ip
            });
        this.setState({ loading: false });
      })
      .catch(error => console.log(error));
  };

  showNewDestinationIPDrawer = () => {
    this.setState({
      new_destination_ip_drawer_visible:true,
    });
  }

  toggleNewDestinationIPDrawer = () => {
    this.setState({
      new_destination_ip_drawer_visible: !this.state.new_destination_ip_drawer_visible
    });
  }

  showNewSourceIPDrawer = () => {
    this.setState({
      new_source_ip_drawer_visible:true,
    });
  }

  toggleNewSourceIPDrawer = () => {
    this.setState({
      new_source_ip_drawer_visible: !this.state.new_source_ip_drawer_visible
    });
  }

  render() {
    const uplink = `${this.state.uplink} ${this.state.unit}`;
    const downlink = `${this.state.downlink} ${this.state.unit}`;

    return (
      <Fragment>
        <Spin tip={"loading..."} spinning={this.state.loading}>
          <Card.Grid style={gridStyle}>
            <Statistic title="Uplink" value={uplink} />
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Statistic title="Downlink" value={downlink} />
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Statistic title="New Rules" value={this.state.new_rules} />
          </Card.Grid>
          <Card.Grid style={gridStyle} onClick={this.showNewSourceIPDrawer}>
            <Statistic title="New Source IP" value={this.state.new_source_ip} />
          </Card.Grid>
          <Card.Grid style={gridStyle} onClick={this.showNewDestinationIPDrawer}>
            <Statistic title="New Destination IP" value={this.state.new_destination_ip} />
          </Card.Grid>
        </Spin>
      <Drawer 
        title={"New Destination Address"} 
        visible={this.state.new_destination_ip_drawer_visible} 
        width={600}
        closable={true}
        placement={"right"}
        onClose={this.toggleNewDestinationIPDrawer}>
      </Drawer>
      <Drawer 
        title={"New Source Address"} 
        visible={this.state.new_source_ip_drawer_visible} 
        width={600}
        closable={true}
        placement={"right"}
        onClose={this.toggleNewSourceIPDrawer}>
      </Drawer>
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
    ip_address: state.filter.ip_address
  };
};
export default connect(mapStateToProps, null)(DashboardStats);
