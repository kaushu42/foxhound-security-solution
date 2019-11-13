import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Button, Form,Input} from "antd";
import {handlePasswordChange} from "../../actions/accountAction";

class ChangePassword extends Component{
    render(){
        const { getFieldDecorator} = this.props.form;
        const { passwordChangeSuccess,passwordChangeError } = this.props;
        return(
            <Fragment>
                <Form>
                    <Form.Item label={"Current Password"}>
                        {getFieldDecorator('password',{
                            rules:[
                                {
                                    required: true,
                                    message:'Please input your current password'
                                }
                            ]})(<Input.Password/>)}
                    </Form.Item>
                </Form>




                <Button
                    onClick={()=>this.props.dispatchChangePassword(this.props.auth_token,"Default123#","Admin123#","Admin123#")}>Click me</Button>
                {
                    passwordChangeError ? <p>Password Change Error</p> : ""
                }
            </Fragment>
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
        dispatchChangePassword : (auth_token,old_password,new_password,confirm_new_password) => dispatch(handlePasswordChange(auth_token,old_password,new_password,confirm_new_password))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Form.create({ name: 'changePassword' })(ChangePassword));