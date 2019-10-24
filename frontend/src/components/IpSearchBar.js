import React, {Fragment, Component} from 'react';
import { Input } from 'antd';
import {connect} from "react-redux";
import {search} from "../actions/ipSearchAction";

const {Search} = Input;

class IpSearchBar extends Component {

    constructor(props){
        super(props);
        this.state = {
            search : this.props.ip_search
        }
    }

    render() {
        return(
            <Fragment>
                <Search
                    placeholder="input IP address"
                    enterButton="Search"
                    size="large"
                    onSearch={value => this.props.dispatchIpSearchValueUpdate(value)}
                />
            </Fragment>

            )
    }
}


const mapStateToProps = state => {
    return {
        ip_search : state.ipSearch.ip_address,
        auth_token : state.auth.auth_token

    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchIpSearchValueUpdate : value => dispatch(search(value))
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(IpSearchBar);
