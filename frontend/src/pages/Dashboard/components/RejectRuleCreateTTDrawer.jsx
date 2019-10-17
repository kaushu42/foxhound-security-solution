import React,{Component, Fragment} from 'react';
import {Drawer,Row,Col,Statistic,Button,Input,Form, Select} from 'antd';

class RejectRuleCreateTTDrawer extends Component {
    state = {
        visible: this.props.visible,
        rule: this.props.rule,
        currentSession: this.props.currentSession
    }
    
    handleCloseDrawer = () => {
        this.setState({visible:false});
    }

    handleEditRule = () => {
        console.log("rule edited");
        this.handleCloseDrawer();
    }

    render(){
        return (
            <Drawer visible={this.state.visible} width={500} title="Reject Rule and Create Trouble Ticket" onClose={this.handleCloseDrawer}>
            <Row gutter={16}>
            <Col span={12}>
                <Statistic title="Source address" value="192.168.100.122"/>
            </Col>
            <Col span={12}>
                <Statistic title="Destination address" value="202.100.40.12"/>
            </Col>
            </Row>
            <br/>
            <Row gutter={16}>
            <Col span={24}>
                <Statistic title="Application" value="microsoft-azure-base"/>
            </Col>
            </Row>
            <br />
            <Form layout="vertical" hideRequiredMark>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Rejected by">
                            <Select defaultValue='KeshavChaurasia'>
                                <option value='KeshavChaurasia'>Keshav Chaurasia</option>
                                </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Description">
                            <Input.TextArea />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            <div
                style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e9e9e9',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right',
                }}
            >
                <Button onClick={this.handleCloseDrawer} style={{ marginRight: 8 }}>
                Cancel
                </Button>
                <Button onClick={this.handleEditRule} type="primary">
                Submit
                </Button>
            </div>
        </Drawer>
        )
    }
}

export default RejectRuleCreateTTDrawer;