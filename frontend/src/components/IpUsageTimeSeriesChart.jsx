import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import '../charts/chart.css';
import {Spin} from "antd";
import {ipUsageDataService} from "../services/ipUsageService";
import moment from "moment";

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
    let data = this.state.data.bytes_received;
    console.log(new Date(data[0][0]));
    data = data.map(e => [new Date(e[0]),e[1]/1024/1024]);
    data.sort(function(a, b) {
      return a[0] > b[0] ? 1 : -1;
    });
    console.log('final data for ip time series',data);
    this.chart.update({
      xAxis : {
        type:'datetime',
        categories : data.map(e => moment(new Date(e[0])).format("MM/DD/YYYY hh:mm"))

      },
      series: [
        {
          id: 'bytes',
          type: 'spline',
          name : 'Bytes Received(MB)',
          data: data.map(e => e[1])
        }
      ]
    });
    this.setState({
      loading : false
    });

    }

  render() {
    console.log("loading",this.state.loading);
    return (
        <Fragment>
          <Spin tip="Loading..." spinning={this.state.loading}>
            <div id={"container"}>
              <HighchartsReact
                  highcharts={Highcharts}
                  options={this.state.options}
                  ref={'chart'}
              />
            </div>
          </Spin>
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