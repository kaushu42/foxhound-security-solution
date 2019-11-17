import React, {Component, Fragment} from 'react';
import ChangePassword from "./auth/ChangePassword";
import RequestOriginWorldChart from "../components/charts/RequestOriginWorldChart";
import VerifiedRulesTable from "../components/tables/VerifiedRulesTable";
import ApplicationChart from "../components/charts/ApplicationChart";
import UnverifiedRulesTable from "../components/tables/UnverifiedRulesTable";



class Test extends Component {
    render() {
        return (
            <UnverifiedRulesTable/>
            )
    }

}

export default Test;