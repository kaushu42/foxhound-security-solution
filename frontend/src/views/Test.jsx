import React, {Component, Fragment} from 'react';
import ChangePassword from "./ChangePasswordForm";
import RequestOriginWorldChart from "../components/charts/RequestOriginWorldChart";
import VerifiedRulesTable from "../components/tables/VerifiedRulesTable";
import ApplicationChart from "../components/charts/ApplicationChart";
import UnverifiedRulesTable from "../components/tables/UnverifiedRulesTable";
import AnomalousRulesTable from "../components/tables/AnomalousRulesTable";
import ApplicationLineChart from "../components/charts/ApplicationLineChart";
import AnomalyBasedTroubleTicketTable from "../components/tables/AnomalyBasedTroubleTicketTable"
import BandwidthUsageChart from "../charts/BandwidthUsageChart";
import ClosedTroubleTickets from "../components/tables/ClosedTroubleTickets";


class Test extends Component {
    render() {
        return (
            <Fragment>
                {/* <ApplicationLineChart/> */}
                {/* <UnverifiedRulesTable/> */}
                {/* <VerifiedRulesTable/> */}
                {/* <AnomalousRulesTable/> */}
                {/* <AnomalyBasedTroubleTicketTable/> */}
                <ClosedTroubleTickets />
                {/* <BandwidthUsageChart/> */}
            </Fragment>
            )
    }

}

export default Test;