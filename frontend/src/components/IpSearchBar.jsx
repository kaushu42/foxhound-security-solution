import React, {Fragment, Component} from 'react';
import {Input} from 'antd';
import {connect} from "react-redux";
import {search} from "../actions/ipSearchAction";

const {Search} = Input;

class IpSearchBar extends Component {

    constructor(props){
        super(props);
    }

    render() {
        return (
            <Fragment>
                {this.props.ip_address ? "" : <p style={{color:'red'}}> Please select or enter an IP address</p>}
                <Search
                    placeholder="input IP address"
                    enterButton="Search"
                    size='default'
                    onSearch={value => this.props.dispatchIpSearchValueUpdate(value)}
                />
            </Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        ip_address : state.ipSearchBar.ip_address,
        auth_token : state.auth.auth_token

    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchIpSearchValueUpdate : value => dispatch(search(value))
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(IpSearchBar);
