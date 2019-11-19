import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {axiosHeader, ROOT_URL} from "../utils";
import axios from "axios";
import {Card, List} from "antd";

const FETCH_API = `${ROOT_URL}dashboard/blacklist/`;


class BlacklistAddress extends Component {

    state = {
        data : null
    }

    componentDidMount() {
        let auth_token = this.props.auth_token;
        let headers = axiosHeader(auth_token);
        axios.post(FETCH_API,null,{headers})
            .then(res => {
                const response = res.data;
                this.setState({data:response});
            }).catch(error => console.log(error));
    }

    render() {
        return (
            <Fragment>
                <Card title={"Request From Blacklisted Address"}>
                    {this.state.data ? (
                        <Fragment>
                            <List
                                style={{height:"150px", overflow:"scroll"}}
                                dataSource={this.state.data.request_from_blacklisted_ip}
                                renderItem={item => <List.Item>{item[0]}-{item[1]}</List.Item>}
                            />
                        </Fragment>
                    ) : null}
                </Card>
                <Card title={"Request To Blacklisted Address"}>
                    {this.state.data ? (
                        <Fragment>
                            <List
                                style={{height:"150px", overflow:"scroll"}}
                                dataSource={this.state.data.request_to_blacklisted_ip}
                                renderItem={item => <List.Item>{item[0]}-{item[1]}</List.Item>}
                            />
                        </Fragment>
                    ) : null}
                </Card>

            </Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token
    }
}

export default connect(mapStateToProps,null)(BlacklistAddress)