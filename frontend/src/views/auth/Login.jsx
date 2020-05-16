import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Form, Icon, Input, Button, Row, Col} from 'antd';
import './login.css';
import axios from "axios";
import {sessionLogIn} from "../../actions/authAction";
import {ROOT_URL} from "../../utils";
import {Redirect} from "react-router-dom";

const  LOGIN_API = `${ROOT_URL}users/login/`;


const SEND_DOMAIN_NAME_API = `${ROOT_URL}session/tenant/`;

class Login extends Component {

    constructor(props){
        super(props);
        this.state = {
            username : "",
            password : "",
            auth_response : null,
            tenant_name : "",
            error_message : "",
            domain_url: window.location.href
        }

    }


    componentDidMount = () => {
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json"
        };

        const data  =  {
            domain_url : this.state.domain_url
        }

        axios.post(SEND_DOMAIN_NAME_API,data,{headers})
            .then(res => {
                const data = res.data;
                this.setState({
                    tenant_name : data.name
                });
            });
    }


    componentDidUpdate(prevProps, prevState, snapshot) {

    }


    handleAuthentication = (e,domain_name) => {
        e.preventDefault();
        const username = this.state.username;
        const password = this.state.password;
        this.authenticateUser(username,password,domain_name);
    }

    authenticateUser(username,password,domain_url){
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json"
        };

        const data  =  {
            username : username,
            password : password,
            domain_url : domain_url
        }

        axios.post(LOGIN_API, data,{
            headers: headers,
        })
            .then(response => {
                const auth_response = response.data;
                this.setState({auth_response : auth_response});
                this.props.dispatchSessionLogin(auth_response);
                this.props.history.push("/");
                })
            .catch((error) => {
                this.setState({
                    error_message : "Invalid Credentials"
                })
            });
    }

    render(){
        return (
            <Fragment>
                {
                    this.props.auth_token ? <Redirect to={"/"} /> : null
                }
                <div className="login-page">
                    <div className="container">
                        <div className="login-container row d-flex justify-content-between">
                            <div className="col-sm-6 align-self-md-center login-content">
                                <h2 className="newlogin-logo"><span>{this.state.tenant_name}</span></h2>
                                <hr />
                                <h3>
                                    ML-Based Security Solutions presented by Silverlining Pvt Ltd and developed by NeuroLogics
                                </h3>
                            </div>
                            <div className="col-sm-6 align-self-md-center">
                                <div className="new-logincard card pmd-card">
                                    <div className="login-card">
                                        <div className="card-header">
                                            <h2 className="card-title">Welcome to <span>Foxhound Security</span></h2>
                                            <p className="card-subtitle" style={{alignContent:"center",textAlign:"center"}}>Login to service</p>
                                            <p className="card-subtitle" style={{alignContent:"center",textAlign:"center",color:'red'}}>{this.state.error_message}</p>
                                        </div>
                                        <Row gutter={16}>
                                            <Form>
                                                <Form.Item>
                                                    <Input
                                                        size="large"
                                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        placeholder="Username" onChange={(e)=>this.setState({username : e.target.value})}
                                                    />
                                                </Form.Item>
                                                <Form.Item>
                                                    <Input
                                                        size="large"
                                                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        type="password"
                                                        placeholder="Password" onChange={(e)=>this.setState({password : e.target.value})}
                                                    />,
                                                </Form.Item>
                                                <div style={{marginTop:-40,marginBottom:20}}>
                                                    <a style={{}}>Forgot Password?</a>
                                                </div>
                                                <Button size="large" type="primary" style={{width:'100%'}} htmlType="submit" className="login-form-button" onClick={e =>this.handleAuthentication(e,window.location.href)}>
                                                    Log in
                                                </Button>
                                            </Form>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth_token : state.auth.auth_token

    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchSessionLogin : response => dispatch(sessionLogIn(response))
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(Login);
