import React, {Component, Fragment} from 'react';
import {Button, Col, Form, Input, PageHeader, Row} from "antd";
import MasterLayout from "../layout/MasterLayout";
import {connect} from "react-redux";
import {handlePasswordChange} from "../../actions/accountAction";
import {contentLayout} from "../../utils";



const formLayout = {
    padding:24,
    backgroundColor : '#fbfbfb',
    border: '1px solid #d9d9d9',
    borderRadius : 6,
    width:'100%',
}

class ChangePassword extends Component{

    state = {
        confirmDirty : false
    }

    handleConfirmBlur = e => {
        const { value } = e.target;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('new_password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };


    validateToNextPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm_new_password'], { force: true });
        }
        callback();
    };

    handleSubmit = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const { auth_token, form } = this.props;
                const old_password = form.getFieldValue('old_password');
                const new_password = form.getFieldValue('new_password');
                this.props.dispatchChangePassword(auth_token,old_password,new_password);
            }
        });
    };

    render(){
        const { getFieldDecorator} = this.props.form;
        const { passwordChangeSuccess,passwordChangeError,passwordChangeLoading,dispatchChangePassword } = this.props;
        return(
            <MasterLayout>
                <PageHeader
                    title={"Change Password"}
                    style={{background: '#fff'}}
                    onBack={() => window.history.back()}
                />
                <Row style={contentLayout}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <div style={formLayout}>
                            <Form style={{alignContent:'center'}} labelCol={{ span: 10 }} wrapperCol={{ span: 5 }} onSubmit={this.handleSubmit}>
                                <Form.Item wrapperCol={{ span: 12, offset: 10 }} >
                                    <p style={{color: 'red'}}>{passwordChangeError ? "Error changing password" : null}</p>
                                    <p style={{color: 'green'}}>{passwordChangeSuccess ? "Password change successful" : null}</p>

                                </Form.Item>
                                <Form.Item label={"Old Password"} style={{display:'flex'}}>
                                    {getFieldDecorator('old_password',{
                                        rules:[
                                            {
                                                required: true,
                                                message:'Please input your current password'
                                            }
                                        ]})(<Input.Password/>)}
                                </Form.Item>
                                <Form.Item label={"New Password"} style={{display:'flex'}}>
                                    {getFieldDecorator('new_password',{
                                        rules:[
                                            {
                                                required: true,
                                                message:'Please input your new password'
                                            },
                                            {
                                                validator: this.validateToNextPassword,
                                            }
                                        ]})(<Input.Password/>)}
                                </Form.Item>
                                <Form.Item label={"Confirm New Password"} hasFeedback style={{display:'flex'}}>
                                    {getFieldDecorator('confirm_new_password',{
                                        rules:[
                                            {
                                                required: true,
                                                message:'Please confirm your new password'
                                            },
                                            {
                                                validator: this.compareToFirstPassword,
                                            }
                                        ]})(<Input.Password onBlur={this.handleConfirmBlur}/>)}
                                </Form.Item>
                                <Form.Item wrapperCol={{ span: 12, offset: 10 }} style={{display:'flex'}}>
                                    {getFieldDecorator('submit',{

                                    })
                                    (<Button type={"primary"} loading={passwordChangeLoading} htmlType={"submit"}>Change Password</Button>)}
                                </Form.Item>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </MasterLayout>
        )
    }

}
const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
        passwordChangeError: state.account.passwordChangeError,
        passwordChangeLoading: state.account.passwordChangeLoading,
        passwordChangeSuccess: state.account.passwordChangeSuccess,

    }
}
const mapDispatchToProps = dispatch => {
    return {
        dispatchChangePassword : (auth_token,old_password,new_password) => dispatch(handlePasswordChange(auth_token,old_password,new_password))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Form.create({ name: 'changePassword' })(ChangePassword));