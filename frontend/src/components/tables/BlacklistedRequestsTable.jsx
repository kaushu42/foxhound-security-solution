import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Divider, PageHeader, Row, Spin, Table, Tag } from "antd";
import reqwest from "reqwest";
import { ROOT_URL, bytesToSize } from "../../utils";


const FETCH_BLACKLIST_SOURCE_API = `${ROOT_URL}mis/blacklist/requests/`;

class BlacklistedRequestsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
            {
            title: "Source Address",
            dataIndex: "source_address",
            key: "source_address",
            render: (text, record) => (
              <a onClick={() => this.handleShowSourceIpProfile(record)}>{text}</a>
            )
          },
          {
            title: "Destination Address",
            dataIndex: "destination_address",
            key: "destination_address",
            render: (text, record) => (
              <a onClick={() => this.handleShowDestinationIpProfile(record)}>
                {text}
              </a>
            )
          },
          {
            title: "Application",
            dataIndex: "application",
            key: "application"
          },
          {
            title: "Destination Port",
            dataIndex: "destination_port",
            key: "destination_port"
          },
          {
            title: "Bytes Sent",
            dataIndex: "sum_bytes_sent",
            key: "sum_bytes_sent",
            render: (text, record) => bytesToSize(text)
          },
          {
            title: "Bytes Received",
            dataIndex: "sum_bytes_received",
            key: "sum_bytes_received",
            render: (text, record) => bytesToSize(text)
          },
          {
            title: "Logged DateTime",
            dataIndex: "logged_datetime",
            key: "logged_datetime",
            // render: text => moment(text).format("YYYY-MM-DD, HH:MM:SS")
            render: text => (new Date(text*1000+20700000).toUTCString()).replace(" GMT", "")
          }
      ],
      data: [],
      pagination: {},
      loading: true,
      user_list: [],
      error_message: ""
    };
  }

  componentDidMount() {
    this.fetchProcessedLogsFromDb();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.fetchProcessedLogsFromDb({
      // results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    });
  };

  fetchProcessedLogsFromDb = (params = {}) => {
    this.setState({ loading: true });
    reqwest({
      url: FETCH_BLACKLIST_SOURCE_API,
      method: "get",
      headers: {
        Authorization: `Token ${this.props.auth_token}`
      },
      data: {
        results: 5,
        page: params.page ? params.page : 1,
        offset: 10
      },
      type: "json"
    }).then(data => {
      const { pagination } = this.state;
      pagination.total = data.count;
      this.setState({
        loading: false,
        data: data.results,
        pagination
      });
    });
  };

  render() {
    const expandedRowRender = record => <p><b>Firewall Rule: </b>{record.firewall_rule}<br/>
                                      <b>Protocol: </b>{record.protocol}<br/>
                                      <b>Source Zone: </b>{record.source_zone}<br/>
                                      <b>Destination Zone: </b>{record.destination_zone}<br/>
                                      <b>Inbound Interface: </b>{record.inbound_interface}<br/>
                                      <b>Outbound Interface: </b>{record.outbound_interface}<br/>
                                      <b>Action: </b>{record.action}<br/>
                                      <b>Category: </b>{record.category}<br/>
                                      <b>Session End Reason: </b>{record.session_end_reason}<br/>
                                      <b>Packets Received: </b>{record.sum_packets_received}<br/>
                                      <b>Packets Sent: </b>{record.sum_packets_sent}<br/>
                                      <b>Time Elapsed: </b>{record.sum_time_elapsed}<br/>
                                      <b>Source Country: </b>{record.source_country}<br/>
                                      <b>Destination Country: </b>{record.destination_country}<br/>
                                      </p>;
    return (
      <Fragment>
        <Spin tip={"loading..."} spinning={this.state.loading}>
          <Table
            columns={this.state.columns}
            rowKey={record => record.id}
            dataSource={this.state.data}
            pagination={this.state.pagination}
            loading={this.state.loading}
            expandedRowRender={expandedRowRender}
            onChange={this.handleTableChange}
          />
        </Spin>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth_token: state.auth.auth_token
  };
};

export default connect(mapStateToProps, null)(BlacklistedRequestsTable);
