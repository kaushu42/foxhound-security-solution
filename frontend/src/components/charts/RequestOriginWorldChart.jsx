import React,{Component,Fragment} from "react";
import {connect} from "react-redux";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import mapdata from "../../charts/mapdata";
import {
    countrySelectedInMapChart,
    fetchCountryListData,
    fetchRequestOriginMapData,
    updateMapAfterExcludingCountries
} from "../../actions/requestOriginMapChartAction";
import {Drawer, Select, Spin} from "antd";

class RequestOriginWorldChart extends Component {

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
        const {excludeCountries,mapChartLoading,countrySelectListData,dispatchUpdateMapAfterCountryExcluding} = this.props;
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
                        width={400}
                        placement="bottom"
                        closable={true}
                        visible={this.props.mapChartLogDrawerVisible}
                >
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
        dispatchCountrySelectedInMapChart : (event,auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries) => dispatch(countrySelectedInMapChart(event,auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries))
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(RequestOriginWorldChart);