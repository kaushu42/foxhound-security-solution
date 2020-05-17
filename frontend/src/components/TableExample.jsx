import React from "react";
import { Table } from "antd";
import reqwest from "reqwest";

const columns = [
  {
    title: "ID",
    dataIndex: "id"
  },
  {
    title: "Source Port",
    dataIndex: "source_port",
    width: "20%"
  },
  {
    title: "Log Date",
    dataIndex: "logged_datetime",
    width: "20%"
  },
  {
    title : "log Data"
  }

];

class TableExample extends React.Component {
  state = {
    data: [],
    pagination: {},
    loading: false
  };

  componentDidMount() {
    this.fetch();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.fetch({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    });
  };

  fetch = (params = {}) => {
    this.setState({ loading: true });
    reqwest({
      url: "http://127.0.0.1:8000/api/v1/log/1",
      method: "get",
      headers: {
        Authorization: "Token 1bfd02409cba9fa503381e545812be536b874a14"
      },
      data: {
        results: 5,
        page: 1,
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
    return (
      <Table
        columns={columns}
        rowKey={record => record.id}
        dataSource={this.state.data}
        pagination={this.state.pagination}
        loading={this.state.loading}
        onChange={this.handleTableChange}
      />
    );
  }
}

export default TableExample;
