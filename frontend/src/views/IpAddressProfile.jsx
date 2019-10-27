import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import Master from "./Master";
import {PageHeader} from "antd";

const contentLayout = {
    paddingLeft:24,
    paddingRight:24,
    paddingTop:12,
}

class IpAddressProfile extends Component{
    render(){
        return(
            <Fragment>
                <Master>
                <PageHeader title={"IP Address Profile"} />
                </Master>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
    }
}
const mapDispatchToProps = dispatch => {
    return {

    }
}
export default connect(mapStateToProps,mapDispatchToProps)(IpAddressProfile);