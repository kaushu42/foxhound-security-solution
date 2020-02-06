import React, {Component, Fragment} from 'react';
<<<<<<< HEAD
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
import ApplicationLineChart from "../components/charts/ApplicationLineChart"
=======
import IpDateVsPortChart from "../components/charts/IpDateVsPortChart";
import NetworkXChart from "../components/charts/NetworkXChart";


>>>>>>> 561c86f10d9fd6d670533f48b882fb923873e26e
class Test extends Component {
    render() {
        return (
            <Fragment>
<<<<<<< HEAD
                {/* <Worldmapchart /> */}
                {/* <RequestOriginWorldChart /> */}
                {/* <AnomalyBasedTroubleTicketTable /> */}
                {/* <VerifiedRulesTable /> */}
                {/* <IpAsSourceSankeyChart /> */}
                {/* <ChangeAlias /> */}
                {/* <BlacklistAddress /> */}
                {/* <NewSourceIPChart /> */}
                {/* <NewDestinationIPChart /> */}
                {/* <BandwidthUsageChart /> */}
                <ApplicationLineChart />
=======
                <NetworkXChart />
>>>>>>> 561c86f10d9fd6d670533f48b882fb923873e26e
            </Fragment>
            )
    }

}

export default Test;