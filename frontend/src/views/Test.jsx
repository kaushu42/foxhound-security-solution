import React, {Component, Fragment} from 'react';
import IpDateVsPortChart from "../components/charts/IpDateVsPortChart";
import NetworkXChart from "../components/charts/NetworkXChart";
import IncidentThreatOrigin from "../components/charts/IncidentThreatOrigin";
import BandwidthUsageChart from "../charts/BandwidthUsageChart"


class Test extends Component {
    render() {
        return (
            <Fragment>
                {/* <IncidentThreatOrigin /> */}
                <BandwidthUsageChart />
            </Fragment>
            )
    }

}

export default Test;