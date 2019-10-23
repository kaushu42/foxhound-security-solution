import React from "react";
import { ResponsiveBullet } from "@nivo/bullet";

const Bullet = (
  { 
    data,
    margin={ top: 50, right: 90, bottom: 50, left: 90 },
    spacing=46
  },
  titleAlign="start",
  titleOffsetX=-70,
  measureSize=0.2,
  animate=true,
  motionStiffness=90,
  motionDamping=12
) => (
  <ResponsiveBullet
    data={data}
    margin={margin}
    spacing={spacing}
    titleAlign={titleAlign}
    titleOffsetX={titleOffsetX}
    measureSize={measureSize}
    animate={animate}
    motionStiffness={motionStiffness}
    motionDamping={motionDamping}
  />
);
export default Bullet;
