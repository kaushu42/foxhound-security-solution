import React, {Component, Fragment} from 'react';
import Worldmapchart from "../demo/worldmapchart";
import RequestOriginWorldChart from "../components/charts/RequestOriginWorldChart"
import AnomalyBasedTroubleTicketTable from "../components/tables/AnomalyBasedTroubleTicketTable"
import VerifiedRulesTable from "../components/tables/VerifiedRulesTable"
import IpAsSourceSankeyChart from "../components/charts/IpAsSourceSankeyChart";
import ChangeAlias from "./ChangeAlias"
import BlacklistAddress from "../components/BlacklistAddress"
import NewSourceIPChart from "../components/charts/NewSourceIPChart"
import NewDestinationIPChart from "../components/charts/NewDestinationIPChart"
import BandwidthUsageChart from "../charts/BandwidthUsageChart"
import ApplicationLineChart from "../components/charts/ApplicationChart"
class Test extends Component {
    render() {
        return (
            <Fragment>
                {/* <Worldmapchart /> */}
                {/* <RequestOriginWorldChart /> */}
                <AnomalyBasedTroubleTicketTable />
                {/* <VerifiedRulesTable /> */}
                {/* <IpAsSourceSankeyChart /> */}
                {/* <ChangeAlias /> */}
                {/* <BlacklistAddress /> */}
                {/* <NewSourceIPChart /> */}
                {/* <NewDestinationIPChart /> */}
                {/* <BandwidthUsageChart /> */}
                {/* <ApplicationLineChart /> */}
            </Fragment>
            )
    }

}

export default Test;