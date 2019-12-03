import React,{Component,Fragment} from "react";
import {connect} from "react-redux";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import mapdata from "../../charts/mapdata";
import moment from "moment";
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
import QuickIpView from "../../views/QuickIpView"
import {search} from "../../actions/ipSearchAction";

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
                render: (text,record) => <a onClick={()=> this.handleShowSourceIpProfile(record)}>{text}</a>,
            },
            {
                title: 'Destination Address',
                dataIndex: 'destination_ip.address',
                key: 'destination_ip.address',
                render: (text,record) => <a onClick={()=> this.handleShowDestinationIpProfile(record)}>{text}</a>,
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
                render: text => moment(text).format("YYYY-MM-DD, HH:MM:SS"),
            },
          ],
          quickIpView: false
    }

    handleShowSourceIpProfile(record){
        this.props.dispatchIpSearchValueUpdate(record.source_ip.address);
        this.setState({quickIpView : true})
    }

    handleShowDestinationIpProfile(record){
        this.props.dispatchIpSearchValueUpdate(record.destination_ip.address);
        this.setState({quickIpView : true})
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
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
            colorAxis: {
                min: 0,
                stops: [
                    [0.1, '#0575E6'],
                    [0.2, '#0525E6'],
                    [0.4, '#0475E6'],
                    [0.3, '#0425E6'],
                    [0.5, '#0375E6'],
                    [0.6, '#0325E6'],
                    [0.7, '#0275E6'],
                    [0.8, '#0225E6'],
                    [0.9, '#0175E6'],
                    [1, '#012B79']
                ]
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
        const {excludeCountries,mapChartLoading,countrySelectListData,dispatchUpdateMapAfterCountryExcluding,mapSelectedCountryLogData,mapSelectedCountryTotalBytesReceived,mapSelectedCountryTotalBytesSent,mapSelectedCountryTotalBytesEvents,mapSelectedCountryTotalBytesSentUnit,mapSelectedCountryTotalBytesReceivedUnit} = this.props;
        return (
            <Fragment>
                <Spin spinning={mapChartLoading}>
                    <Card title={
                            <Fragment>
                                { countrySelectListData ? (
                                    <Select
                                        id="country"
                                        mode="multiple"
                                        searching = {true}
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
                                            value={mapSelectedCountryTotalBytesEvents}
                                            precision={0}
                                            valueStyle={{ color: '#cf1322' }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title={<b>Total Bytes Sent</b>}
                                            value={mapSelectedCountryTotalBytesSent}
                                            precision={2}
                                            valueStyle={{ color: '#cf1322' }}
                                            suffix={mapSelectedCountryTotalBytesSentUnit}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title={<b>Total Bytes Received</b>}
                                            value={mapSelectedCountryTotalBytesReceived}
                                            precision={2}
                                            valueStyle={{ color: '#cf1322' }}
                                            suffix={mapSelectedCountryTotalBytesReceivedUnit}
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
                <Drawer
                    closable={true}
                    width={800}
                    placement={"right"}
                    onClose={this.closeQuickIpView}
                    visible={this.state.quickIpView}>
                    <QuickIpView/>
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
        ip_address : state.filter.ip_address,

        mapSelectedCountryTotalBytesReceived: state.requestOriginChart.mapSelectedCountryTotalBytesReceived,
        mapSelectedCountryTotalBytesSent: state.requestOriginChart.mapSelectedCountryTotalBytesSent,
        mapSelectedCountryTotalBytesEvents: state.requestOriginChart.mapSelectedCountryTotalBytesEvents,

        mapSelectedCountryTotalBytesSentUnit: state.requestOriginChart.mapSelectedCountryTotalBytesSentUnit,
        mapSelectedCountryTotalBytesReceivedUnit: state.requestOriginChart.mapSelectedCountryTotalBytesReceivedUnit,
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
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager)),
        dispatchIpSearchValueUpdate : value => dispatch(search(value))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(RequestOriginWorldChart);