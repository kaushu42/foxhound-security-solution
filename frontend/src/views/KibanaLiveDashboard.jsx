import React, { Component, Fragment } from 'react'
import {PageHeader,Row} from 'antd';
import Iframe from 'react-iframe';
import ReactDOM from 'react-dom';
import {contentLayout} from "../utils";
import MasterLayout from './layout/MasterLayout';

const frameStyle = {
    position: 'absolute',
    left: '0',
    top:'65px',
    width: '100%',
    overflow: 'hidden',
}

export default class KibanaLiveDashboard extends Component {

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
                    title={"Live Traffic Dashboard"}
                    onBack={() => window.history.back()} />
                
                <Iframe url="http://202.51.3.202/s/nmb-bank/app/kibana#/dashboard/Traffic-Dashboard?embed=true&_g=(refreshInterval:(pause:!f,value:60000),time:(from:now-24h,to:now))&_a=(description:'',filters:!(),fullScreenMode:!f,options:(darkTheme:!t,useMargins:!f),panels:!((embeddableConfig:(title:'Source%20User%20%26%20IP%20by%20Traffic'),gridData:(h:24,i:'5',w:24,x:24,y:24),id:'Top-10-Source-Users-slash-IP!'s-ampersand-Applications-(Sum-of-Bytes-Transferred)',panelIndex:'5',title:'Source%20User%20%26%20IP%20by%20Traffic',type:visualization,version:'7.6.2'),(embeddableConfig:(title:'Network%20Traffic'),gridData:(h:12,i:'9',w:16,x:0,y:0),id:f420b810-fd77-11e7-be83-eddfa25a06ba,panelIndex:'9',title:'Network%20Traffic',type:visualization,version:'7.6.2'),(embeddableConfig:(title:'Network%20Traffic%20by%20Zone'),gridData:(h:12,i:'13',w:32,x:16,y:0),id:'2e8b7470-fda2-11e7-be83-eddfa25a06ba',panelIndex:'13',title:'Network%20Traffic%20by%20Zone',type:visualization,version:'7.6.2'),(embeddableConfig:(title:'URL%20Categories%20by%20Traffic'),gridData:(h:24,i:'14',w:24,x:0,y:24),id:'6e78d6e0-fd7a-11e7-be83-eddfa25a06ba',panelIndex:'14',title:'URL%20Categories%20by%20Traffic',type:visualization,version:'7.6.2'),(embeddableConfig:(title:'URL%20Categories%20by%20Traffic'),gridData:(h:12,i:'15',w:12,x:12,y:12),id:c3f37800-fd7a-11e7-be83-eddfa25a06ba,panelIndex:'15',title:'URL%20Categories%20by%20Traffic',type:visualization,version:'7.6.2'),(embeddableConfig:(title:'Applications%20by%20Traffic'),gridData:(h:12,i:'16',w:12,x:0,y:12),id:'0adfdc50-fd7a-11e7-be83-eddfa25a06ba',panelIndex:'16',title:'Applications%20by%20Traffic',type:visualization,version:'7.6.2'),(embeddableConfig:(title:'Traffic%20Desintation%20IP'),gridData:(h:12,i:'17',w:12,x:36,y:12),id:'448816c0-fdca-11e7-be83-eddfa25a06ba',panelIndex:'17',title:'Traffic%20Desintation%20IP',type:visualization,version:'7.6.2'),(embeddableConfig:(title:'Traffic%20Source%20IP'),gridData:(h:12,i:'18',w:12,x:24,y:12),id:'34e58e50-fdca-11e7-be83-eddfa25a06ba',panelIndex:'18',title:'Traffic%20Source%20IP',type:visualization,version:'7.6.2')),query:(language:lucene,query:(query_string:(analyze_wildcard:!t,default_field:'*',query:'*',time_zone:Asia%2FKatmandu))),timeRestore:!f,title:'Traffic%20Dashboard',viewMode:view)"
                    width="100%"
                    allow="fullscreen"
                    height={this.state.iFrameHeight}
                    id="iframe"
                    styles={frameStyle}/>
            </div>
        );
    }
}