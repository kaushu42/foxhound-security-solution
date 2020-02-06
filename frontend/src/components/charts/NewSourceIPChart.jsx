import React, { Component, Fragment } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { Card, Row, Spin } from "antd";
import { connect } from "react-redux";
import axios from "axios";
import { ROOT_URL } from "../../utils";
require("highcharts/modules/exporting")(Highcharts);
import "../chart.css";

class NewSourceIPChart extends Component{
    constructor(props){
        super(props);
        this.state = {
            options: {
                title: {
                  text: "Daywise New Source IPs"
                },
                chart: {
                  zoomType: "x",
                },
                xAxis: {
                  type: "datetime",
                  dateTimeLabelFormats: {
                    day: "%Y-%b-%d"
                  }
                },
                series: [
                  {
                    type: "areaspline",
                    name: "Number of New IPs",
                    data: [
                        [
                            1551744000000.0,
                            2285103
                        ],
                        [
                            1551747600000.0,
                            2281717
                        ],
                        [
                            1551751200000.0,
                            2213543
                        ],
                        [
                            1551754800000.0,
                            36930823
                        ],
                        [
                            1551758400000.0,
                            92164820
                        ],
                        [
                            1551762000000.0,
                            76748393
                        ],
                        [
                            1551765600000.0,
                            68132522
                        ],
                        [
                            1551769200000.0,
                            93632065
                        ],
                        [
                            1551772800000.0,
                            56733894
                        ],
                        [
                            1551776400000.0,
                            62297572
                        ],
                        [
                            1551780000000.0,
                            60275988
                        ],
                        [
                            1551783600000.0,
                            14249396
                        ],
                        [
                            1551787200000.0,
                            3065538
                        ],
                        [
                            1551790800000.0,
                            2559965
                        ],
                        [
                            1551794400000.0,
                            3307711
                        ],
                        [
                            1551798000000.0,
                            2650024
                        ],
                        [
                            1551801600000.0,
                            2721823
                        ],
                        [
                            1551805200000.0,
                            2144809
                        ]
                    ]
                  }
                ],
            }
        };
    }


    render(){
        return(
            <Fragment>
                <HighchartsReact
                    highcharts = {Highcharts}
                    options = {this.state.options}
                    ref = {"chart"}
                />
            </Fragment>
        );
    }
};

const mapStateToProps = state => {
    return{
        auth_token: state.auth.auth_token,
    }
};

export default connect(mapStateToProps, null)(NewSourceIPChart);