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
    fetchSelectedCountryLog
} from "../../actions/requestOriginMapChartAction";
import {Drawer, Select, Spin,Table} from "antd";

class RequestOriginWorldChart extends Component {

    state = {
        pagination:{},
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
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        });
        this.handlefetchSelectedCountryLog({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };
  
    handlefetchSelectedCountryLog = (params) => {
        const {auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,dispatchFetchSelectedCountryLog} = this.props;        
        dispatchFetchSelectedCountryLog(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,params);
    }

    componentDidMount = async () => {
        this.chart = this.refs.chart.chart;
        this.chart.component = this;
        const {auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,dispatchFetchRequestOriginMapData,excludeCountries,dispatchFetchCountryListData} = this.props;
        dispatchFetchRequestOriginMapData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries);
        dispatchFetchCountryListData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,dispatchFetchRequestOriginMapData,excludeCountries} = this.props;
        if(prevProps.excludeCountries!=this.props.excludeCountries){
            dispatchFetchRequestOriginMapData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries);

        }
    }

    handleMapChartLogView(event){
        const {auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries} = this.props;
        this.props.dispatchCountrySelectedInMapChart(event,auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries);
    }

    render() {
        const {mapChartData} = this.props;
        const options = {
            chart : {

            },
            title: {
                text: "Request Origin"
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
                    {
                        countrySelectListData ? (
                            <Select
                                id="country"
                                size={"large"}
                                mode="multiple"
                                allowClear={true}
                                style={{ width: "100%" }}
                                onChange={(exclude_countries)=> dispatchUpdateMapAfterCountryExcluding(exclude_countries)}
                                placeholder="Exclude countries....">
                                {
                                    countrySelectListData.map(data => <Select.Option key={data['id']}>{data['name']}</Select.Option>)
                                }
                            </Select>
                        ) : null
                    }
                    <HighchartsReact
                        constructorType={"mapChart"}
                        allowChartUpdate={true}
                        highcharts={Highcharts}
                        ref = {'chart'}
                        options = {options}
                />
                </Spin>
                <Drawer title={`Logs With Request originating from ${this.props.mapChartSelectedCountryName}`}
                        width={1100}
                        placement="right"
                        closable={true}
                        onClose={this.props.dispatchCloseMapChartLogDrawer}
                        visible={this.props.mapChartLogDrawerVisible}
                >
                    {
                        mapSelectedCountryLogData ? (
                            <Table
                              columns={this.state.columns}
                              rowKey={record => record.id}
                              dataSource={mapSelectedCountryLogData}
                              pagination={this.state.pagination}
                              onChange={this.handleTableChange}
                          />
                        ):null
                    }
                    
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

        mapChartSelectedCountryCode : state.requestOriginChart.mapChartSelectedCountryCode,
        mapChartSelectedCountryName :state.requestOriginChart.mapChartSelectedCountryName,
        mapSelectedCountryLogData : state.requestOriginChart.mapSelectedCountryLogData,
        mapChartLogDrawerVisible: state.requestOriginChart.mapChartLogDrawerVisible,


        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone,
    }
}
const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchRequestOriginMapData : (auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries) => dispatch(fetchRequestOriginMapData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries)),
        dispatchFetchCountryListData : (auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries) => dispatch(fetchCountryListData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries)),
        dispatchUpdateMapAfterCountryExcluding : (exclude_countries) => dispatch(updateMapAfterExcludingCountries(exclude_countries)),
        dispatchCountrySelectedInMapChart : (event,auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries) => dispatch(countrySelectedInMapChart(event,auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries)),
        dispatchCloseMapChartLogDrawer : () => dispatch(closeMapChartLogDrawer()),
        dispatchFetchSelectedCountryLog : (auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,params) => fetchSelectedCountryLog(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,params)
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(RequestOriginWorldChart);