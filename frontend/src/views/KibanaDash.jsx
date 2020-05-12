import React, { Component, PropTypes } from 'react'
import Iframe from 'react-iframe';
import ReactDOM from 'react-dom'

const s = {
    height: '100%',
    position: 'absolute',
    left: '0',
    width: '100%',
    overflow: 'hidden'
}

export default class KibanaDash extends Component {

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
            <Iframe url="http://202.51.3.202/s/nmb-bank/app/kibana"
                    width="100%"
                    height={this.state.iFrameHeight}
                    id="iframe"
                    styles={s}/>

        );
    }
}