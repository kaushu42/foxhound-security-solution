import React, { Component } from 'react';
import MasterLayout from "./views/layout/MasterLayout";
import '@patternfly/patternfly/patternfly.min.css';
import './App.css'
import'./fonts.css'
class App extends Component {
  render() {
    return (
        <MasterLayout />
    );
  }
}

export default App;
