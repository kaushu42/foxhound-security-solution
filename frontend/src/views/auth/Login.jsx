import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import { Form, Icon, Input, Button} from 'antd';
import './login.css';
import axios from "axios";
import {sessionLogIn} from "../../actions/authAction";
import {ROOT_URL} from "../../utils";

const  LOGIN_API = `${ROOT_URL}users/login/`;


class Login extends Component {

    constructor(props){
        super(props);
        this.state = {
            username : "",
            password : "",
            auth_response : null
        }

    }

    handleAuthentication = (e) => {
        e.preventDefault();
        const username = this.state.username;
        const password = this.state.password;
        this.authenticateUser(username,password);
    }

    authenticateUser(username,password){
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        };

        const data  =  {
            username : username,
            password : password
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
            .catch((error) => console.log(error));
    }

    render(){
        return (
            <Fragment>
                <div className="login-container">
                    <span className="login-title">Foxhound</span>
                    <Form className="login-form">
                        <Form.Item>
                            <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Username" onChange={(e)=>this.setState({username : e.target.value})}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="Password" onChange={(e)=>this.setState({password : e.target.value})}
                            />,
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button" onClick={e =>this.handleAuthentication(e)}>
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {

    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchSessionLogin : response => dispatch(sessionLogIn(response))
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(Login);
