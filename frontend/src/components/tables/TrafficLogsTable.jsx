import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Divider, PageHeader, Row, Spin, Table, Tag } from "antd";
import reqwest from "reqwest";
import { ROOT_URL } from "../../utils";

class TrafficLogsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: "Processed Date",
          dataIndex: "processed_date",
          key: "processed_date"
        },
        {
          title: "Log Date",
          dataIndex: "log_date",
          key: "log_date"
        },
        {
          title: "Log Name",
          dataIndex: "log_name",
          key: "log_name"
        },
        // {
        //     title: 'Log Type',
        //     dataIndex: 'log_type',
        //     key: 'log_type',
        // },
        // {
        //     title: 'Log Device',
        //     dataIndex: 'log_device',
        //     key: 'log_device',
        // },
        {
          title: "Rows Count",
          dataIndex: "rows",
          key: "rows"
        },
        {
          title: "Log Size",
          dataIndex: "size",
          key: "size"
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
    this.fetch({
      // results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    });
  };

  fetchProcessedLogsFromDb = (params = {}) => {
    console.log("data loading");
    this.setState({ loading: true });
    reqwest({
      url: `${ROOT_URL}log/`,
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
      console.log("data fetched", this.data);
      const { pagination } = this.state;
      pagination.total = data.count;
      let size = ''
      if (data.results[0].size > 1000000000)
        {
          size = (data.results[0].size/(1024*1024*1024)).toFixed(2),
          data.results[0].size = `${size} GB`
        }
      else if (data.results[0].size < 1000000000 && data.results[0].size > 1000000)
        {
          size = (data.results[0].size/(1024*1024)).toFixed(2),
          data.results[0].size = `${size} MB`
        }
      else if (data.results[0].size < 1000000 && data.results[0].size > 1000)
        {
          size = (data.results[0].size/(1024)).toFixed(2),
          data.results[0].size = `${size} KB`
        }
      else
        {
          size = data.results[0].size,
          data.results[0].size = `${size} Bytes`
        }
      this.setState({
        loading: false,
        data: data.results,
        pagination
      });
    });
  };

  render() {
    return (
      <Fragment>
        <Spin tip={"loading..."} spinning={this.state.loading}>
          <Table
            columns={this.state.columns}
            rowKey={record => record.id}
            dataSource={this.state.data}
            pagination={this.state.pagination}
            loading={this.state.loading}
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

export default connect(mapStateToProps, null)(TrafficLogsTable);
