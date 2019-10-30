// import React, {Component,Fragment} from 'react';
// import {connect} from 'react-redux';
// import {Card, Col, Row, Skeleton} from 'antd';
// import {
//     IpConnectionWiseUsageSankeyChartServiceAsync,
// } from "../services/IpConnectionWiseUsageSankeyChartService";
// import sankey from "../charts/sankey";
// import Calendar from "../charts/Calendar";
//
//
// class IpConnectionWiseUsagesankeyChart extends Component {
//
//     constructor(props){
//         super(props);
//         this.state = {
//             loadingSankeyAsSource : true,
//             loadingSankeyAsDestination : true,
//             ip_as_source_data : [],
//             ip_as_destination_data : []
//         }
//     }
//
//     componentDidMount() {
//         IpConnectionWiseUsageSankeyChartServiceAsync(this.props.ip_address,this.props.auth_token)
//             .then(res => {
//                 const data = res.data;
//                 this.setState({
//                     ip_as_source_data:data.source_data,
//                     ip_as_destination_data : data.destination_data,
//                 });
//                 if(this.state.ip_as_source_data.length != 0){
//                     this.setState({loadingSankeyAsSource : false});
//                 }
//                 if(this.state.ip_as_destination_data.length != 0){
//                     this.setState({loadingSankeyAsDestination : false});
//                 }
//
//             });
//     }
//
//     componentDidUpdate(prevProps, prevState, snapshot) {
//         if(prevProps.ip_address != this.props.ip_address){
//             this.setState({
//                 loadingSankeyAsSource : true,
//                 loadingSankeyAsDestination : true,
//             });
//             IpConnectionWiseUsageSankeyChartServiceAsync(this.props.ip_address,this.props.auth_token)
//                 .then(res => {
//                     const data = res.data;
//                     this.setState({
//                         ip_as_source_data:data.source_data,
//                         ip_as_destination_data : data.destination_data,
//                     });
//                     if(this.state.ip_as_source_data.length != 0){
//                         this.setState({loadingSankeyAsSource : false});
//                     }
//                     if(this.state.ip_as_destination_data.length != 0){
//                         this.setState({loadingSankeyAsDestination : false});
//                     }
//                 });
//         }
//     }
//
//
//     render() {
//         const {loadingSankeyAsSource,loadingSankeyAsDestination,ip_as_source_data,ip_as_destination_data} = this.state;
//         return (
//             <Fragment>
//                 <Row>
//                     <Col span={12}>
//                         <Card title="IP CONNECTION AS SOURCE">
//                             <Skeleton loading={loadingSankeyAsSource}></Skeleton>
//                             <div style={{height:'500px'}}>
//                                 {!loadingSankeyAsSource?<sankey data={ip_as_source_data} />:null}
//                             </div>
//                         </Card>
//                     </Col>
//                     <Col span={12}>
//                         <Card title="IP CONNECTION AS DESTINATION">
//                             <Skeleton loading={loadingSankeyAsDestination}></Skeleton>
//                             <div style={{height:'500px'}}>
//                                 {!loadingSankeyAsDestination?<sankey data={ip_as_destination_data} />:null}
//                             </div>
//                         </Card>
//                     </Col>
//                 </Row>
//             </Fragment>
//         )
//     }
// }
//
// const mapStateToProps = state => {
//     return {
//         auth_token : state.auth.auth_token,
//         ip_address : state.ipSearchBar.ip_address_value
//
//     }
// }
//
// const mapDispatchToProps = dispatch => {
//     return {
//
//     }
// }
//
//
// export default connect(mapStateToProps,mapDispatchToProps)(IpConnectionWiseUsagesankeyChart);
