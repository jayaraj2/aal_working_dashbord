import React from 'react';
import { HorizontalBar } from 'react-chartjs-2';

const HorizontalFunnelChart = ({ data }) => {
  return (
    <div>
      <HorizontalBar
        data={data}
        options={{
          maintainAspectRatio: false,
          scales: {
            xAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        }}
      />
    </div>
  );
};

export default HorizontalFunnelChart;
