import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

import MasterLayout from "./layout/MasterLayout";
import {contentLayout, ROOT_URL} from "../utils";
import axios from 'axios';
import {Col, PageHeader, Row, Input, Button} from "antd";

const InputGroup = Input.Group;

const SET_ALIAS_API = `${ROOT_URL}profile/ip/`;

class ChangeAlias extends Component{
    constructor(props){
        super(props);
        this.state = {
            ipAddress : null,
            alias : null,
            errorMessage : null,
            successMessage : null
        }
    }

    handleAliasChange = (e) => {
        const ip = this.state.ipAddress
        const aliasName = this.state.alias
        if(ip == null  || aliasName == null){
            this.setState({
                successMessage: null,
                errorMessage:"Please Enter both IP Address and Alias Name"
            });
            return
        }
        // console.log("input address", this.state.ipAddress, "alias name", this.state.alias)
        const authorization = `Token ${this.props.auth_token}`;

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization
        };

        let bodyFormData = new FormData();
        bodyFormData.set("ip", this.state.ipAddress);
        bodyFormData.set("alias", this.state.alias);

        axios.post(SET_ALIAS_API,bodyFormData,{headers})
        .then(res=>{
            console.log('Alias Name Set Successfully', this.state.ipAddress, this.state.alias);
            this.setState({
                ipAddress : null,
                alias : null,
                errorMessage : null,
                successMessage : "IP Alias changed successfully"
            })
        })
        .catch(e => {
            console.log("error",e);
            this.setState({
                successMessage : null,
                errorMessage : "Something went wrong!! Perhaps given IP Address does not exist"
            })
        });
    }

    render(){
        return(
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader
                            style={{background: '#fff'}}
                            title={"Change IP Alias"}/>
                    <Row style = {contentLayout}>
                        <div style={{padding:24,background:'#fbfbfb',border: '1px solid #d9d9d9',borderRadius: 6}}>
                            {this.state.errorMessage ?
                            <p style={{color:'red'}}>{this.state.errorMessage}</p> : null}
                            {this.state.successMessage ?
                            <p style={{color:'green'}}>{this.state.successMessage}</p> : null}
                            <InputGroup>
                                <Row gutter={8}>
                                    <Col span={10}>
                                        <Input 
                                            placeholder = "IP Address"
                                            value = {this.state.ipAddress}
                                            onChange = {(e) => this.setState({
                                                    ipAddress : e.target.value
                                                })
                                            } 
                                        />
                                    </Col>
                                    <Col span={10}>
                                        <Input 
                                            placeholder = "Alias Name" 
                                            value = {this.state.alias}
                                            onChange = {(e) => this.setState({
                                                    alias : e.target.value
                                                })
                                            }
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Button 
                                            type={"primary"} 
                                            style={{width:'100%'}} 
                                            onClick={(e) => this.handleAliasChange(e)}
                                        >
                                            Submit
                                        </Button>
                                    </Col>
                                </Row>
                            </InputGroup>
                        </div>
                    </Row>
                </MasterLayout>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token

    }
}
const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(ChangeAlias);