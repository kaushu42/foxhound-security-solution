import React, { Component} from "react";
import '@patternfly/react-core/dist/styles/base.css'
import MasterLayout from "./layout/MasterLayout";
import './App.css';

class App extends Component{
  render(){
    return(
        <MasterLayout/>
    );
  }
}


export default App;