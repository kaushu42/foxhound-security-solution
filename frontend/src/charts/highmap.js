import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import mapdata from "./mapdata";

// Load Highcharts modules
require("highcharts/modules/map")(Highcharts);

class HighMap extends React.Component {
render() {
const data = this.props.data;

const mapOptions = {
  title: {
    text: ""
  },
  colorAxis: {
    min: 0,
    stops: [[0.1, "#cccccc"],[1, "#000000"]] // change color according to value
    
  },

  series: [
    {
      mapData: mapdata,
      name: "World",
      data: data
    }
  ]
};

// Render app with demo chart

  
    return (
      <div>
        <HighchartsReact
          options={mapOptions}
          constructorType={"mapChart"}
          highcharts={Highcharts}
        />
      </div>
    );
  }
}

export default HighMap;
