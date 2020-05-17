import React, { Component, Fragment } from 'react'
import {PageHeader,Row} from 'antd';
import Iframe from 'react-iframe';
import ReactDOM from 'react-dom';

const frameStyle = {
    position: 'absolute',
    left: '0',
    top:'65px',
    width: '100%',
    overflow: 'hidden',
}

export default class KibanaDashboard extends Component {

    constructor() {
        super();
        this.state = {
            iFrameHeight: '300px'
        }
    }

    componentDidMount = () => {
        const obj = ReactDOM.findDOMNode(this);

        this.setState({
            "iFrameHeight":  window.innerHeight-65 + 'px'
        });
}

    render() {
        return (
            <div style={{height:'100%', overflow:'hidden'}}>
                <PageHeader
                    style={{background: '#fff'}}
                    title={"Kibana Dashboard"}
                    onBack={() => window.history.back()} />
                
                <Iframe url="http://202.51.3.202/s/nmb-bank/app/kibana#/dashboard/"
                    width="100%"
                    allow="fullscreen"
                    height={this.state.iFrameHeight}
                    id="iframe"
                    styles={frameStyle}/>
            </div>
        );
    }
}