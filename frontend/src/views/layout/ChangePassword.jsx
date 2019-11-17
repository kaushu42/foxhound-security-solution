import React, {Component} from 'react';
import {Col, PageHeader, Row} from "antd";
import {contentLayout} from "../../utils";
import MasterLayout from "./MasterLayout";
import ChangePasswordForm from "../ChangePasswordForm";


const formLayout = {
    padding:24,
    backgroundColor : '#fbfbfb',
    border: '1px solid #d9d9d9',
    borderRadius : 6,
    width:'100%',
}

class ChangePassword extends Component {
    render(){
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
                            <ChangePasswordForm/>
                        </div>
                    </Col>
                </Row>
            </MasterLayout>
        )
    }
}

export default ChangePassword;