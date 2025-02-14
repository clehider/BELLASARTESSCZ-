import React from 'react';
import { Box } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';

const ProgressChart = () => {
  const data = [
    {
      modulo: 'Módulo 1',
      completado: 85,
      pendiente: 15,
    },
    {
      modulo: 'Módulo 2',
      completado: 65,
      pendiente: 35,
    },
    {
      modulo: 'Módulo 3',
      completado: 45,
      pendiente: 55,
    },
  ];

  return (
    <Box sx={{ height: '100%' }}>
      <ResponsiveBar
        data={data}
        keys={['completado', 'pendiente']}
        indexBy="modulo"
        margin={{ top: 10, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderRadius={4}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
          }
        ]}
      />
    </Box>
  );
};

export default ProgressChart;
