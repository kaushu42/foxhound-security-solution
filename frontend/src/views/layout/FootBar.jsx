import React, {Component} from 'react';
import {Layout} from 'antd';
const {Footer} = Layout;
class FootBar extends Component {
    render() {
        return (
            <Footer style={{ height:64, textAlign: 'center' }}>
                <a>Foxhound Security Solutions </a> ©2019 Created by Ai Coders Nepal
            </Footer>
        )
    }
}

export default FootBar;