import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import '../../charts/chart.css';
import {Card, Spin} from "antd";
import moment from "moment";
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import {ipUsageDataService} from "../../services/ipUsageService";
NoDataToDisplay(Highcharts);

class IpUsageTimeSeriesChart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading : true,
      data : [],
      options: {
          title: {
            text: 'Bandwidth Usage View | Bytes Received'
          },
          chart :{
            zoomType : 'x',
            events :{
              click: function(e) {
                console.log(
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', e.xAxis[0].value),
                    e.yAxis[0].value
                )
              },

            }
          },
          yAxis:{
            labels :{
              formatter: function () {
                return this.value + ' MB';
              }
            }
          },
          series: [
            {
              type: 'spline',
              name : 'Bytes Received',
              data: []
            }
          ]
      }
    }
  }


  componentDidMount() {
    this.handleFetchData();
    this.chart = this.refs.chart.chart;
    if (document.addEventListener) {
      document.addEventListener('webkitfullscreenchange', this.exitHandler, false);
      document.addEventListener('mozfullscreenchange', this.exitHandler, false);
      document.addEventListener('fullscreenchange', this.exitHandler, false);
      document.addEventListener('MSFullscreenChange', this.exitHandler, false);
    }
  }

  handleFetchData = () => {
    this.setState({
      loading : true
    });

    const {auth_token,ip_address} = this.props;
    ipUsageDataService(auth_token,ip_address,this.props).then(res => {
      console.log('fetching data for ip',ip_address)
      const data = res.data;
      this.setState({
        data : data
      });
      console.log('fetched data ',data);
    })

  }


  exitHandler = () => {
    if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
      console.log('Inside fullscreen. Doing chart stuff.');
      this.chart = this.refs.chart.chart;
      this.chart.update({
        chart:{
          height: null
        }
      })
    }

    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
      console.log('Exiting fullscreen. Doing chart stuff.');
      this.chart = this.refs.chart.chart;
      this.chart.update({
        chart:{
          height:'400px'
        }
      })
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
        (String(prevProps.ip_address)!==String(this.props.ip_address)) ||
        (String(prevProps.date_range[0])!==String(this.props.date_range[0])) ||
        (String(prevProps.date_range[1])!==String(this.props.date_range[1])) ||
        (String(prevProps.firewall_rule)!==String(this.props.firewall_rule)) ||
        (String(prevProps.application)!==String(this.props.application)) ||
        (String(prevProps.protocol)!==String(this.props.protocol)) ||
        (String(prevProps.source_zone)!==String(this.props.source_zone)) ||
        (String(prevProps.destination_zone)!==String(this.props.destination_zone))
    ){
      this.handleFetchData();
    }
    if(prevState.data!==this.state.data){
      this.updateChart();
    }
  }
  updateChart = () => {
    let bytesReceived = this.state.data.bytes_received;
    if (bytesReceived.length == 0){
      Highcharts.setOptions({
        lang: {
          noData: 'No data is available in the chart'
        }
      });
      this.chart.update({
        series: []
      });
    }
    bytesReceived.sort(function(a, b) {
      return a[0] > b[0] ? 1 : -1;
    });
    this.chart.update({
        title : {
          text : `Time Series Chart for Bytes Received of ${this.props.ip_address}`
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
              day: '%Y-%b-%d',

          },
            //categories : bytesReceived.map(d=> moment(new Date(d[0])).format("MM-DD-YYYY hh:mm:ss"))
        },
        series: [
            {
                name : 'Bytes Received',
                type : 'spline',
                data : bytesReceived.map(e => [((e[0]*1000)),e[1]/1024/1024])
            }
        ]
    })
    this.setState({
        loading : false
    });
  }

  render() {
    console.log("loading",this.state.loading);
    return (
        <Fragment>
          <Card>
            <Spin tip="Loading..." spinning={this.state.loading}>
              <HighchartsReact
                  highcharts={Highcharts}
                  options={this.state.options}
                  ref={'chart'}
              />
            </Spin>
          </Card>
        </Fragment>
    );
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

export default connect(mapStateToProps,null)(IpUsageTimeSeriesChart);