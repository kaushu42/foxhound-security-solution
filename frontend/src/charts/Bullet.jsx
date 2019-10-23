import React from "react";
import { ResponsiveBullet } from "@nivo/bullet";

const Bullet = ({ data /* see data tab */ }) => (
  <ResponsiveBullet
    data={data}
    margin={{ top: 50, right: 90, bottom: 50, left: 90 }}
    spacing={46}
    titleAlign="start"
    titleOffsetX={-70}
    measureSize={0.2}
    animate={true}
    motionStiffness={90}
    motionDamping={12}
  />
);
export default Bullet;
