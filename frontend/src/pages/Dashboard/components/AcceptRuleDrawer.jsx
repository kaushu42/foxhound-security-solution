import React, { Component } from 'react';
import { PageHeader, Drawer, Form, Button, Col, Row, Input, Select, DatePicker, Icon, Statistic } from 'antd';
const {Option} = Select;

const DescriptionItem = ({ title, content }) => (
  <div
    style={{
      fontSize: 14,
      lineHeight: '22px',
      marginBottom: 7,
      color: 'rgba(0,0,0,0.65)',
    }}
  >
    <p
      style={{
        marginRight: 8,
        display: 'inline-block',
        color: 'rgba(0,0,0,0.85)',
      }}
    >
      {title}:
    </p>
    {content}
  </div>
);

class AcceptRuleDrawer extends Component {

  state = {
    visible: this.props.visible,
    rule: this.props.rule,
    currentSession: this.props.currentSession
  }

  constructor(props){
    super(props);
    console.log(props);
  }

  componentDidMount(){
    this.setState({visible:this.props.visible});
  }

  handleShowDrawer = () => {
    this.setState({ visible: true });
  }

  handleCloseDrawer = () => {
    this.props.handleClose();

    this.setState({ visible: false });
  }

  handleAcceptRule = () => {
    console.log("rule accepted");
    this.handleCloseDrawer();

  }

  render() {
    return (
      <Drawer visible={this.props.visible} width={500} title="Accept this rule" onClose={this.handleCloseDrawer}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Source address" value={this.state.rule.sourceaddress}/>
          </Col>
          <Col span={12}>
            <Statistic title="Destination address" value={this.state.rule.destinationaddress}/>
          </Col>
        </Row>
        <br/>
        <Row gutter={16}>
          <Col span={24}>
            <Statistic title="Application" value={this.state.rule.application}/>
          </Col>
        </Row>
        <br />
        <Form layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Approved By">
                  <Select defaultValue={this.state.currentSession.userid}>
                    <Option value={this.state.currentSession.userid}>{this.state.currentSession.fullname}</Option>
                  </Select>
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
            <Button onClick={this.handleAcceptRule} type="primary">
              Submit
            </Button>
          </div>
      </Drawer>
    )
  }

}


export default AcceptRuleDrawer;
