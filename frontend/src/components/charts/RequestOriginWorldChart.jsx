import React,{Component,Fragment} from "react";
import {connect} from "react-redux";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import mapdata from "../../charts/mapdata";
import {
    countrySelectedInMapChart,
    fetchCountryListData,
    fetchRequestOriginMapData,
    updateMapAfterExcludingCountries,
    closeMapChartLogDrawer,
    fetchSelectedCountryLog, 
    updatePagination
} from "../../actions/requestOriginMapChartAction";
import {Drawer, Select, Spin, Table, Card, Row, Col, Statistic, Icon} from "antd";
import ApplicationLineChart from "./ApplicationLineChart";

class RequestOriginWorldChart extends Component {

    state = {
        params : {},
        columns : [
            {
                title: 'Id',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: 'Source Address',
                dataIndex: 'source_ip.address',
                key: 'source_ip.address',
            },
            {
                title: 'Destination Address',
                dataIndex: 'destination_ip.address',
                key: 'destination_ip.address',
            },
            {
                title: 'Application',
                dataIndex: 'application.name',
                key: 'application.name',
            },
            {
                title: 'Source Port',
                dataIndex: 'source_port',
                key: 'source_port',
            },
            {
                title: 'Destination Port',
                dataIndex: 'destination_port',
                key: 'destination_port',
            },
            {
                title: 'Bytes Sent',
                dataIndex: 'bytes_sent',
                key: 'bytes_sent',
            },
            {
                title: 'Bytes Received',
                dataIndex: 'bytes_received',
                key: 'bytes_received',
            },
            {
                title: 'Logged DateTime',
                dataIndex: 'logged_datetime',
                key: 'logged_datetime',
            },
          ]
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.props.requestOriginMapPagination };
        pager.current = pagination.current;
        this.props.dispatchPaginationUpdate(pager);
        this.handlefetchSelectedCountryLog({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };
  
    handlefetchSelectedCountryLog = (params={}) => {
        const {auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,requestOriginMapPagination,mapChartSelectedCountryCode} = this.props;
        this.props.dispatchFetchSelectedCountryLog(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,params,requestOriginMapPagination,mapChartSelectedCountryCode);
    }

    componentDidMount = async () => {
        this.chart = this.refs.chart.chart;
        this.chart.component = this;
        const {auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,dispatchFetchRequestOriginMapData,excludeCountries,ip_address,dispatchFetchCountryListData} = this.props;
        dispatchFetchRequestOriginMapData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,ip_address);
        dispatchFetchCountryListData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,ip_address);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,dispatchFetchRequestOriginMapData,excludeCountries,ip_address} = this.props;
        if(
            prevProps.excludeCountries!=this.props.excludeCountries ||
            (String(prevProps.ip_address)!==String(this.props.ip_address)) ||
            (String(prevProps.start_date)!==String(this.props.start_date)) ||
            (String(prevProps.end_date)!==String(this.props.end_date)) ||
            (String(prevProps.firewall_rule)!==String(this.props.firewall_rule)) ||
            (String(prevProps.application)!==String(this.props.application)) ||
            (String(prevProps.protocol)!==String(this.props.protocol)) ||
            (String(prevProps.source_zone)!==String(this.props.source_zone)) ||
            (String(prevProps.destination_zone)!==String(this.props.destination_zone))
            ){
            dispatchFetchRequestOriginMapData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries, ip_address);

        }
    }

    handleMapChartLogView(e){
        const {auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,requestOriginMapPagination} = this.props;
        this.props.dispatchCountrySelectedInMapChart(e,auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,{},requestOriginMapPagination);
    }

    render() {
        const {mapChartData} = this.props;
        const options = {
            chart : {

            },
            title: {
                text: "Request Origin Map View"
            },
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'middle'
                }
            },
            series: [
                {
                    mapData: mapdata,
                    name: "Request Origin",
                    data : mapChartData,
                    events: {
                        click: function (e) {
                            const self = this.chart.component;
                            self.handleMapChartLogView(e);
                        }
                    }
                }
            ]
        };
        const {excludeCountries,mapChartLoading,countrySelectListData,dispatchUpdateMapAfterCountryExcluding,mapSelectedCountryLogData} = this.props;
        return (
            <Fragment>
                <Spin spinning={mapChartLoading}>
                    <Card title={
                            <Fragment>
                                { countrySelectListData ? (
                                    <Select
                                        id="country"
                                        mode="multiple"
                                        allowClear={true}
                                        style={{ width: "50%",float:"right" }}
                                        onChange={(exclude_countries)=> dispatchUpdateMapAfterCountryExcluding(exclude_countries)}
                                        placeholder="Exclude countries....">
                                        {
                                            countrySelectListData.map(data => <Select.Option key={data['id']}>{data['name']}</Select.Option>)
                                        }
                                    </Select>
                                ) : null}
                            </Fragment>

                    } className={{height:450}}>
                        <HighchartsReact
                            constructorType={"mapChart"}
                            allowChartUpdate={true}
                            highcharts={Highcharts}
                            ref = {'chart'}
                            options = {options}
                        />
                    </Card>
                </Spin>
                <Drawer title={`Logs With Request originating from ${this.props.mapChartSelectedCountryName}`}
                        width={1100}
                        placement="right"
                        closable={true}
                        onClose={this.props.dispatchCloseMapChartLogDrawer}
                        visible={this.props.mapChartLogDrawerVisible}
                    >
                    <Spin spinning={this.props.countryLogDataLoading}>
                         <div style={{ background: '#fbfbfb', padding: '24px', border: '1px solid #d9d9d9',borderRadius: 6 }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title={<b>Total Events</b>}
                                            value={36063}
                                            precision={0}
                                            valueStyle={{ color: '#cf1322' }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title={<b>Total Bytes Sent</b>}
                                            value={45}
                                            precision={2}
                                            valueStyle={{ color: '#cf1322' }}
                                            suffix="MB"
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title={<b>Total Bytes Received</b>}
                                            value={45}
                                            precision={2}
                                            valueStyle={{ color: '#cf1322' }}
                                            suffix="GB"
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                        <div style={{ background: '#fbfbfb', padding: '24px', border: '1px solid #d9d9d9',borderRadius: 6 }}>
                            <ApplicationLineChart selectedCountry={this.props.mapChartSelectedCountryCode}/>
                        </div>
                        <div style={{ background: '#fbfbfb', padding: '24px', border: '1px solid #d9d9d9',borderRadius: 6 }}>
                            <Table
                                columns={this.state.columns}
                                rowKey={record => record.id}
                                dataSource={mapSelectedCountryLogData}
                                loading={this.props.countryLogDataLoading}
                                pagination={this.props.requestOriginMapPagination}
                                onChange={this.handleTableChange}
                            />
                        </div>
                    </Spin>
                </Drawer>
            </Fragment>
        )
    }

}
const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,

        mapChartLoading : state.requestOriginChart.mapChartLoading,
        mapChartData : state.requestOriginChart.mapChartData,
        countrySelectListData : state.requestOriginChart.countrySelectListData,
        excludeCountries : state.requestOriginChart.excludeCountries,


        countryLogDataLoading : state.requestOriginChart.countryLogDataLoading,

        mapChartSelectedCountryCode : state.requestOriginChart.mapChartSelectedCountryCode,
        mapChartSelectedCountryName :state.requestOriginChart.mapChartSelectedCountryName,
        mapSelectedCountryLogData : state.requestOriginChart.mapSelectedCountryLogData,
        mapChartLogDrawerVisible: state.requestOriginChart.mapChartLogDrawerVisible,
        requestOriginMapPagination : state.requestOriginChart.requestOriginMapPagination,

        start_date : state.filter.date_range[0],
        end_date : state.filter.date_range[1],
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone,
        ip_address : state.filter.ip_address
    }
}
const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchRequestOriginMapData : (auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries, ip_address) => dispatch(fetchRequestOriginMapData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries, ip_address)),
        dispatchFetchCountryListData : (auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries,ip_address) => dispatch(fetchCountryListData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries,ip_address)),
        dispatchUpdateMapAfterCountryExcluding : (exclude_countries) => dispatch(updateMapAfterExcludingCountries(exclude_countries)),
        dispatchCountrySelectedInMapChart : (event,auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries,params,pagination) => dispatch(countrySelectedInMapChart(event,auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries,params,pagination)),
        dispatchCloseMapChartLogDrawer : () => dispatch(closeMapChartLogDrawer()),
        dispatchFetchSelectedCountryLog : (auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,params,pagination,mapChartSelectedCountryCode) => dispatch(fetchSelectedCountryLog(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,params,pagination,mapChartSelectedCountryCode)),
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(RequestOriginWorldChart);