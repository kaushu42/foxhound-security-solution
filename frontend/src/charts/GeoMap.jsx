import React from "react";
import { ResponsiveGeoMap } from "@nivo/geo";
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const GeoMap = (
  {
    features=[],
    margin={ top: 0, right: 0, bottom: 0, left: 0 },
    projectionTranslation=[0.5, 0.5],
    projectionRotation=[0, 0, 0],
    fillColor="#eeeeee",
    borderWidth=0.5,
    borderColor="#333333",
    enableGraticule=true,
    graticuleLineColor="#666666"
  }
) => (
  <ResponsiveGeoMap
    features={features}
    margin={margin}
    projectionTranslation={projectionTranslation}
    projectionRotation={projectionRotation}
    fillColor={fillColor}
    borderWidth={borderWidth}
    borderColor={borderColor}
    enableGraticule={enableGraticule}
    graticuleLineColor={graticuleLineColor}
  />
);
export default GeoMap;
