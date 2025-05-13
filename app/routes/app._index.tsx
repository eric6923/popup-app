import React, { useState } from 'react';
import {
  Card,
  Select,
  InlineStack,
  Text,
  Box,
  BlockStack,
  Button,
  Icon
} from '@shopify/polaris';
import { ChevronRightIcon, CalendarIcon } from '@shopify/polaris-icons';

const PopupStatsDashboard = () => {
  const [selectedRange, setSelectedRange] = useState('last_30_days');
  const [selectedPopup, setSelectedPopup] = useState('popup');
  
  // Mock data for the chart
  const chartData = [
    { date: 'Apr 14', views: 0, subscribers: 0 },
    { date: 'Apr 16', views: 0, subscribers: 0 },
    { date: 'Apr 18', views: 0, subscribers: 0 },
    { date: 'Apr 20', views: 0, subscribers: 0 },
    { date: 'Apr 22', views: 0, subscribers: 0 },
    { date: 'Apr 24', views: 0, subscribers: 0 },
    { date: 'Apr 26', views: 0, subscribers: 0 },
    { date: 'Apr 28', views: 0, subscribers: 0 },
    { date: 'Apr 30', views: 0, subscribers: 0 },
    { date: 'May 2', views: 0, subscribers: 0 },
    { date: 'May 4', views: 0, subscribers: 0 },
    { date: 'May 6', views: 0, subscribers: 0 },
    { date: 'May 8', views: 8, subscribers: 2 },
    { date: 'May 10', views: 0, subscribers: 0 },
    { date: 'May 12', views: 0, subscribers: 0 },
  ];
  
  const rangeOptions = [
    { label: 'Last 30 days', value: 'last_30_days' },
  ];
  
  // const popupOptions = [
  //   { label: 'Popup', value: 'popup' },
  // ];

  // Get the chart dimensions
  const chartWidth = 100;
  const chartHeight = 250;
  const maxViews = Math.max(...chartData.map(d => d.views));
  
  // Generate SVG points for the views line
  const viewsPoints = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - (point.views / maxViews) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  // Generate SVG points for the subscribers line
  const subscribersPoints = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - (point.subscribers / maxViews) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="popup-stats-container" style={{ fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <Box padding="400">
        <BlockStack gap="300">
          <InlineStack align="space-between">
            <Button icon={CalendarIcon}>
              Last 30 days
            </Button>
            {/* <Select
              label=""
              labelHidden
              options={popupOptions}
              value={selectedPopup}
              onChange={setSelectedPopup}
            /> */}
          </InlineStack>
          
          <div style={{ display: 'flex', gap: '16px', maxWidth:"900px" }}>
            {/* Popup Views Card */}

            <div style={{width:"300px"}}>
            <Card padding="400" background="bg-surface">
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd" tone="subdued">POPUP VIEWS</Text>
                <Text as="h2" variant="headingLg">8</Text>
              </BlockStack>
            </Card>
            </div>
            {/* Subscribers Card */}
            <div style={{width:"300px"}}>
            <Card padding="400" background="bg-surface">
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd" tone="subdued">SUBSCRIBERS</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text as="h2" variant="headingLg">2</Text>
                </div>
              </BlockStack>
            </Card>
            </div>
            <div style={{width:"300px"}}>
            {/* Conversion Rate Card */}
            <Card padding="400" background="bg-surface">
              <BlockStack gap="300">
                <Text as="p" variant="headingMd" tone="subdued">CONVERSION RATE</Text>
                <Text as="h2" variant="headingLg">25.00%</Text>
              </BlockStack>
            </Card>
            </div>
          </div>
          
          {/* Chart Card */}
          <Card padding="400" background="bg-surface">
            <BlockStack gap="400">
            
                <Text as="h3" variant="headingMd">Views / Subscribers</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text as="p" variant="headingLg">8 / 2</Text>
                  <Text as="p" variant="bodyMd" tone="subdued">25.00%</Text>
                </div>
      
              
              <div style={{ position: 'relative', height: '300px' }}>
                {/* Chart Grid Lines */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
                  {[0, 2, 4, 6, 8].map((value, index) => (
                    <div key={index} style={{ 
                      position: 'absolute', 
                      left: 0, 
                      right: 0, 
                      top: `${100 - (value / 8) * 100}%`, 
                      borderBottom: '1px solid #e0e0e0', 
                      height: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '8px',
                    }}>
                      <span style={{ position: 'absolute', left: 0, fontSize: '12px', color: '#6b7177' }}>{value}</span>
                    </div>
                  ))}
                </div>
                
                {/* Chart Lines */}
                <svg width="100%" height="250" style={{ position: 'absolute', top: '24px' }}>
                  {/* Views Line */}
                  <polyline
                    points={viewsPoints}
                    fill="none"
                    stroke="#0091ff"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* Subscribers Line */}
                  <polyline
                    points={subscribersPoints}
                    fill="none"
                    stroke="#7253ed"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                
                {/* X Axis Labels */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  paddingTop: '8px',
                  fontSize: '12px',
                  color: '#6b7177'
                }}>
                  {chartData.map((point, index) => (
                    <div key={index} style={{ textAlign: 'center', flexBasis: `${100 / chartData.length}%` }}>
                      {index % 2 === 0 ? point.date : ''}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'end', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '22px', 
                    height: '14px', 
                    backgroundColor: '#0091ff', 
                    borderRadius: '3px'
                  }}></div>
                  <Text as='p' variant="bodyMd">Views</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '22px', 
                    height: '14px', 
                    backgroundColor: '#7253ed', 
                    borderRadius: '3px'
                  }}></div>
                  <Text as='p' variant="bodyMd">Subscribers</Text>
                </div>
              </div>
            </BlockStack>
          </Card>
        </BlockStack>
      </Box>
    </div>
  );
};

export default PopupStatsDashboard;