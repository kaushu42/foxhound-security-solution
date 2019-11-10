// import React, {Component,Fragment} from 'react';
// import {Card, Spin, Statistic} from "antd";
// import {connect} from 'react-redux';
// import axios from "axios";
// import {ROOT_URL} from "../../utils";
//
// const gridStyle = {
//     width: "25%",
//     textAlign: "center",
//     backgroundColor : "#f94f4f"
// };
//
// const FETCH_API = `${ROOT_URL}dashboard/stats/`;
//
// class DashboardThreatStats extends Component {
//
//     constructor(props){
//         super(props);
//         this.state = {
//             loading : true,
//             total_threat_events : 0,
//         }
//     }
//
//     componentDidMount() {
//         this.setState({loading:true});
//         this.fetchDashboardStats();
//
//     }
//
//     componentDidUpdate(prevProps, prevState, snapshot) {
//         if (
//             (String(prevProps.date_range[0]) !== String(this.props.date_range[0])) ||
//             (String(prevProps.date_range[1]) !== String(this.props.date_range[1])) ||
//             (String(prevProps.firewall_rule) !== String(this.props.firewall_rule)) ||
//             (String(prevProps.application) !== String(this.props.application)) ||
//             (String(prevProps.protocol) !== String(this.props.protocol)) ||
//             (String(prevProps.source_zone) !== String(this.props.source_zone)) ||
//             (String(prevProps.destination_zone) !== String(this.props.destination_zone))
//         ){
//             this.setState({loading:true});
//             this.fetchDashboardStats();
//
//         }
//     }
//
//     fetchDashboardStats = () => {
//         const headers = {
//             'Content-Type': 'application/json',
//             'Authorization': `Token ${this.props.auth_token}`
//         }
//         var bodyFormData = new FormData();
//         bodyFormData.set('start_date', this.props.date_range[0]);
//         bodyFormData.set('end_date', this.props.date_range[1]);
//         bodyFormData.set('firewall_rule', this.props.firewall_rule);
//         bodyFormData.set('application', this.props.application);
//         bodyFormData.set('protocol', this.props.protocol);
//         bodyFormData.set('source_zone', this.props.source_zone);
//         bodyFormData.set('destination_zone', this.props.destination_zone);
//
//         axios.post(FETCH_API,bodyFormData,{
//             headers: headers
//         })
//             .then((response) => {
//                 const data = response.data;
//                 this.setState({
//                     uplink :  parseInt((data.uplink /(1024*1024))),
//                     downlink : parseInt(data.downlink /(1024*1024)),
//                     opened_tt : data.opened_tt
//                 });
//                 this.setState({loading:false});
//             })
//             .catch((error) => console.log(error))
//     }
//
//     render() {
//         const uplink = `${this.state.uplink} MB`;
//         const downlink = `${this.state.downlink} MB`;
//
//         return(
//             <Fragment>
//                 <Spin tip={"loading..."} spinning={this.state.loading}>
//                     <Card.Grid style={gridStyle} >
//                         <Statistic title="Total Threat Count Event" value={"24"} />
//                     </Card.Grid>
//                     <Card.Grid style={gridStyle}>
//                         <Statistic title="Total Threat Originating IP Count" value={<Fragment><p>192.168.10</p><p></p>} />
//                     </Card.Grid>
//                     <Card.Grid style={gridStyle}>
//                         <Statistic title="total Top Threat Categories Count" value={this.state.opened_tt} />
//                     </Card.Grid>
//                     <Card.Grid style={gridStyle}>
//                         <Statistic title="Top Threat Originating Country" value={this.state.new_rules} />
//                     </Card.Grid>
//                 </Spin>
//             </Fragment>
//         )
//     }
// }
//
// const mapStateToProps = (state) => {
//
//     return {
//         auth_token : state.auth.auth_token,
//         date_range : state.filter.date_range,
//         firewall_rule : state.filter.firewall_rule,
//         application : state.filter.application,
//         protocol : state.filter.protocol,
//         source_zone : state.filter.source_zone,
//         destination_zone : state.filter.destination_zone
//     }
// }
// export default connect(mapStateToProps,null)(DashboardThreatStats);
//
