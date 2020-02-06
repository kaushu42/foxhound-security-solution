import React, {Component, Fragment} from "react";
import Highcharts from "highcharts";
require('highcharts/modules/networkgraph')(Highcharts);
require("highcharts/modules/exporting")(Highcharts);
import {connect} from "react-redux";
import HighchartsReact from "highcharts-react-official";
import {Card, DatePicker, Select, Spin} from "antd";


class NetworkXChart extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:false,
            options : {
                chart: {
                    type: 'networkgraph',
                    height: '100%'
                },
                title: {
                    text: 'The Indo-European Language Tree'
                },
                subtitle: {
                    text: 'A Force-Directed Network Graph in Highcharts'
                },
                plotOptions: {
                    networkgraph: {
                        keys: ['from', 'to'],
                        layoutAlgorithm: {
                            enableSimulation: true,
                            friction: -0.9
                        }
                    }
                },
                series: [{
                    dataLabels: {
                        enabled: true,
                        linkFormat: ''
                    },
                    id: 'lang-tree',
                    data: [
                        ['Proto Indo-European', 'Balto-Slavic'],
                        ['Proto Indo-European', 'Germanic'],
                        ['Proto Indo-European', 'Celtic'],
                        ['Proto Indo-European', 'Italic'],
                        ['Proto Indo-European', 'Hellenic'],
                        ['Proto Indo-European', 'Anatolian'],
                        ['Proto Indo-European', 'Indo-Iranian'],
                        ['Proto Indo-European', 'Tocharian'],
                        ['Indo-Iranian', 'Dardic'],
                        ['Indo-Iranian', 'Indic'],
                        ['Indo-Iranian', 'Iranian'],
                        ['Iranian', 'Old Persian'],
                        ['Old Persian', 'Middle Persian'],
                        ['Indic', 'Sanskrit'],
                        ['Italic', 'Osco-Umbrian'],
                        ['Italic', 'Latino-Faliscan'],
                        ['Latino-Faliscan', 'Latin'],
                        ['Celtic', 'Brythonic'],
                        ['Celtic', 'Goidelic'],
                        ['Germanic', 'North Germanic'],
                        ['Germanic', 'West Germanic'],
                        ['Germanic', 'East Germanic'],
                        ['North Germanic', 'Old Norse'],
                        ['North Germanic', 'Old Swedish'],
                        ['North Germanic', 'Old Danish'],
                        ['West Germanic', 'Old English'],
                        ['West Germanic', 'Old Frisian'],
                        ['West Germanic', 'Old Dutch'],
                        ['West Germanic', 'Old Low German'],
                        ['West Germanic', 'Old High German'],
                        ['Old Norse', 'Old Icelandic'],
                        ['Old Norse', 'Old Norwegian'],
                        ['Old Norwegian', 'Middle Norwegian'],
                        ['Old Swedish', 'Middle Swedish'],
                        ['Old Danish', 'Middle Danish'],
                        ['Old English', 'Middle English'],
                        ['Old Dutch', 'Middle Dutch'],
                        ['Old Low German', 'Middle Low German'],
                        ['Old High German', 'Middle High German'],
                        ['Balto-Slavic', 'Baltic'],
                        ['Balto-Slavic', 'Slavic'],
                        ['Slavic', 'East Slavic'],
                        ['Slavic', 'West Slavic'],
                        ['Slavic', 'South Slavic'],
                        // Leaves:
                        ['Proto Indo-European', 'Phrygian'],
                        ['Proto Indo-European', 'Armenian'],
                        ['Proto Indo-European', 'Albanian'],
                        ['Proto Indo-European', 'Thracian'],
                        ['Tocharian', 'Tocharian A'],
                        ['Tocharian', 'Tocharian B'],
                        ['Anatolian', 'Hittite'],
                        ['Anatolian', 'Palaic'],
                        ['Anatolian', 'Luwic'],
                        ['Anatolian', 'Lydian'],
                        ['Iranian', 'Balochi'],
                        ['Iranian', 'Kurdish'],
                        ['Iranian', 'Pashto'],
                        ['Iranian', 'Sogdian'],
                        ['Old Persian', 'Pahlavi'],
                        ['Middle Persian', 'Persian'],
                        ['Hellenic', 'Greek'],
                        ['Dardic', 'Dard'],
                        ['Sanskrit', 'Sindhi'],
                        ['Sanskrit', 'Romani'],
                        ['Sanskrit', 'Urdu'],
                        ['Sanskrit', 'Hindi'],
                        ['Sanskrit', 'Bihari'],
                        ['Sanskrit', 'Assamese'],
                        ['Sanskrit', 'Bengali'],
                        ['Sanskrit', 'Marathi'],
                        ['Sanskrit', 'Gujarati'],
                        ['Sanskrit', 'Punjabi'],
                        ['Sanskrit', 'Sinhalese'],
                        ['Osco-Umbrian', 'Umbrian'],
                        ['Osco-Umbrian', 'Oscan'],
                        ['Latino-Faliscan', 'Faliscan'],
                        ['Latin', 'Portugese'],
                        ['Latin', 'Spanish'],
                        ['Latin', 'French'],
                        ['Latin', 'Romanian'],
                        ['Latin', 'Italian'],
                        ['Latin', 'Catalan'],
                        ['Latin', 'Franco-Provençal'],
                        ['Latin', 'Rhaeto-Romance'],
                        ['Brythonic', 'Welsh'],
                        ['Brythonic', 'Breton'],
                        ['Brythonic', 'Cornish'],
                        ['Brythonic', 'Cuymbric'],
                        ['Goidelic', 'Modern Irish'],
                        ['Goidelic', 'Scottish Gaelic'],
                        ['Goidelic', 'Manx'],
                        ['East Germanic', 'Gothic'],
                        ['Middle Low German', 'Low German'],
                        ['Middle High German', '(High) German'],
                        ['Middle High German', 'Yiddish'],
                        ['Middle English', 'English'],
                        ['Middle Dutch', 'Hollandic'],
                        ['Middle Dutch', 'Flemish'],
                        ['Middle Dutch', 'Dutch'],
                        ['Middle Dutch', 'Limburgish'],
                        ['Middle Dutch', 'Brabantian'],
                        ['Middle Dutch', 'Rhinelandic'],
                        ['Old Frisian', 'Frisian'],
                        ['Middle Danish', 'Danish'],
                        ['Middle Swedish', 'Swedish'],
                        ['Middle Norwegian', 'Norwegian'],
                        ['Old Norse', 'Faroese'],
                        ['Old Icelandic', 'Icelandic'],
                        ['Baltic', 'Old Prussian'],
                        ['Baltic', 'Lithuanian'],
                        ['Baltic', 'Latvian'],
                        ['West Slavic', 'Polish'],
                        ['West Slavic', 'Slovak'],
                        ['West Slavic', 'Czech'],
                        ['West Slavic', 'Wendish'],
                        ['East Slavic', 'Bulgarian'],
                        ['East Slavic', 'Old Church Slavonic'],
                        ['East Slavic', 'Macedonian'],
                        ['East Slavic', 'Serbo-Croatian'],
                        ['East Slavic', 'Slovene'],
                        ['South Slavic', 'Russian'],
                        ['South Slavic', 'Ukrainian'],
                        ['South Slavic', 'Belarusian'],
                        ['South Slavic', 'Rusyn']
                    ]
                }]
            }
        }
    }
  render() {
        return (
            <Fragment>
                <Card
                    title = {
                            <Fragment>
                                <div>
                                {`Port Usage Chart`}
                                <Select
                                    onChange={value => this.setState({ basis: value })}
                                    size={"default"}
                                    style={{ width: "35%", float:"right", paddingRight: 5, paddingLeft: 5 }}
                                    defaultValue={"bytes"}
                                >
                                    <Select.Option key={"bytes"}>Bytes</Select.Option>
                                    <Select.Option key={"packets"}>Packets</Select.Option>
                                    <Select.Option key={"count"}>Count</Select.Option>
                                </Select>
                                </div>
                              </Fragment>
                    }>
                    <Spin tip="Loading..." spinning={this.state.loading}>
                            <HighchartsReact
                                allowChartUpdate={false}
                                highcharts={Highcharts}
                                ref = {'chart'}
                                options = {this.state.options}
                            />
                    </Spin>
                </Card>
            </Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
        ip_address : state.ipSearchBar.ip_address,
        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone
    }
}

export default connect(mapStateToProps,null)(NetworkXChart);


