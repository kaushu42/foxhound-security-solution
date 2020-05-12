import React, { Component, Fragment } from 'react'
import {PageHeader,Row} from 'antd';
import Iframe from 'react-iframe';
import ReactDOM from 'react-dom';
import {contentLayout} from "../utils";
import MasterLayout from './layout/MasterLayout';

const s = {
    height: '100%',
    position: 'absolute',
    left: '0',
    width: '100%',
    overflow: 'hidden'
}

export default class KibanaDashboard extends Component {

    constructor() {
        super();
        this.state = {
            iFrameHeight: '800px'
        }
    }

    componentDidMount = () => {
        const obj = ReactDOM.findDOMNode(this);

        this.setState({
            "iFrameHeight":  window.innerHeight + 'px'
        });
}

    render() {
        return (
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader
                        style={{background: '#fff'}}
                        title={"Kibana Dashboard"}
                        onBack={() => window.history.back()} />
                    <Row style={contentLayout}>
                    <Iframe url="http://202.51.3.202/s/nmb-bank/app/kibana#/dashboard/"
                        width="100%"
                        height={this.state.iFrameHeight}
                        id="iframe"
                        styles={s}/>

                    </Row>
                </MasterLayout>
            </Fragment>
        );
    }
}