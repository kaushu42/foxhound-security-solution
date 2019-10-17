import React, { Component, Fragment } from 'react';
import {Drawer, Form, Button, Card,Row,Col,Select} from 'antd';
import {Statistic, PageHeader, DatePicker, Layout} from 'antd';
import { Table, Divider, Tag } from 'antd';
import AcceptRuleDrawer from './AcceptRuleDrawer';
import EditRuleDrawer from './EditRuleDrawer';
import RejectRuleCreateTTDrawer from './RejectRuleCreateTTDrawer';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const {Option} = Select;

const currentSession = {
    username : 'KeshavChaurasia',
    fullname : 'Keshav Chaurasia',
    userid : 'keshavchaurasia'
}



class Rules extends Component {

    constructor(props){
        super(props);
        this.ruleData = [
            {
              key: '1',
              sourceaddress: '10.100.2.12',
              destinationaddress:'202.1.2.4',
              application:'google-base',
            },
            {
                key: '2',
                sourceaddress: '10.199.25.12',
                destinationaddress:'202.132.2.4',
                application:'azure-base',
              },
              {
                key: '3',
                sourceaddress: '11.121.123.123',
                destinationaddress:'223.1232.12.4',
                application:'youtube-base',
              }
        ];
        this.rulesColumns = [
            {
                title: 'Source Address',
                dataIndex: 'sourceaddress',
                key: 'sourceaddress',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Destination Address',
                dataIndex: 'destinationaddress',
                key: 'destinationaddress',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Application',
                dataIndex: 'application',
                key: 'application',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                <span>
                    <Button onClick={(e)=>{this.handleAcceptRule(record.key,e)}}>Accept</Button>
                    <Divider type="vertical" />
                    <Button onClick={(e)=>{this.handleEditRule(record.key,e)}}>Edit</Button>
                    <Divider type="vertical" />
                    <Button onClick={(e)=>{this.handleRejectRuleCreateTT(record.key,e)}}>Create TT</Button>
                </span>
                ),
            },
        ];
        this.state = {
            acceptRuleDrawerVisible : false,
            editRuleDrawerVisible : false,
            rejectRuleCreateTTDrawerVisible : false,
            currentRule : this.ruleData[0],
            currentSession: currentSession,
            application:this.props.application 
        }


    }

    handleAcceptRule = (key,event) => {
        event.preventDefault();
        console.log('key',key);
        this.setState({currentRule: this.ruleData[key]},()=>console.log('currentRule',this.state.currentRule));
        this.setState({acceptRuleDrawerVisible:true},()=>console.log('acceptRuleDrawervisible',this.state.acceptRuleDrawerVisible));
    
    }


    handleCloseAcceptRuleDrawer = () => {
        this.setState({acceptRuleDrawerVisible:false},()=>console.log('acceptRuleDrawerVisible',this.state.acceptRuleDrawerVisible));
    }


    handleEditRule = (key,event) => {
        this.setState({currentRule: this.ruleData[key]});
        this.setState({editRuleDrawerVisible:true});
        console.log("handle edit Rule");

    }

    handleRejectRuleCreateTT = (key,event) => {
        this.setState({currentRule: this.ruleData[key]});
        this.setState({rejectRuleCreateTTDrawerVisible:true})
        console.log("handle reject Rule");

    }

    render(){
        return (
            <Fragment>
                <h1>{this.state.application}</h1>
                <Table dataSource={this.ruleData} columns={this.rulesColumns} />
                <AcceptRuleDrawer visible={this.state.acceptRuleDrawerVisible} rule={this.state.currentRule} currentSession={this.state.currentSession} handleClose={this.handleCloseAcceptRuleDrawer} />
                <EditRuleDrawer visible={this.state.editRuleDrawerVisible} rule={this.state.currentRule} currentSession={this.state.currentSession} />
                <RejectRuleCreateTTDrawer visible={this.state.rejectRuleCreateTTDrawerVisible} rule={this.state.currentRule} currentSession={this.state.currentSession} />
            </Fragment>
        )
    }
}

export default Rules;
