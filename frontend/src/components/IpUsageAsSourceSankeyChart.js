import React, {Component,Fragment} from 'react';
import {connect} from 'react-redux';
import {Card, Skeleton} from 'antd';

class IpUsageAsSourceSankeyChart extends Component {

    constructor(props){
        super(props);
        this.state = {
            loading : true,

        }

    }

    render() {
        const {loading} = this.state;
        return (
            <Fragment>
                <Card title="IP USAGE AS SOURCE">
                    <Skeleton loading={loading} rows={10} active ></Skeleton>
                </Card>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {

    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(IpUsageAsSourceSankeyChart);