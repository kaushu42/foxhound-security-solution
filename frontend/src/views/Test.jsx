import React, {Component, Fragment} from 'react';
import IpDateVsPortChart from "../components/charts/IpDateVsPortChart";
import NetworkXChart from "../components/charts/NetworkXChart";
import IncidentThreatOrigin from "../components/charts/IncidentThreatOrigin";


class Test extends Component {
    render() {
        return (
            <Fragment>
                <IncidentThreatOrigin />
            </Fragment>
            )
    }

}

export default Test;