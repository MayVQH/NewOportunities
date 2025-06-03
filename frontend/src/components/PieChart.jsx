import React from 'react';
import PieChart, { Series, Label, Connector, Size } from 'devextreme-react/pie-chart';

const MiniPieChart = ({ data }) => (
  <PieChart
    dataSource={data}
    palette={["#007BFF", "#FFA500"]}
    size={{ width: 200, height: 150 }}
  >
    <Series argumentField="valor" valueField="area">
      <Label visible={false}>
        <Connector visible={false} />
      </Label>
    </Series>
    <Size width={200} height={150} />
  </PieChart>
);

export default MiniPieChart;
