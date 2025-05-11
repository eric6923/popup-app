// app/routes/popups.$id.tsx
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  LegacyCard,
  Tabs,
  Text,
  Box,
  RadioButton,
  InlineStack,
  BlockStack,
  Icon,
  Button,
  Link,
  Badge,
  Frame,
  ButtonGroup,
  Divider
} from "@shopify/polaris";
import { ArrowLeftIcon, QuestionCircleIcon, ComposeIcon, MobileIcon, ViewIcon } from "@shopify/polaris-icons";
import { useState } from "react";

interface PopupData {
  id: string;
  title: string;
  isPublished: boolean;
}

export async function loader({ params }) {
  // Would fetch popup data from API
  const popupData: PopupData = {
    id: params.id,
    title: "Opt-in popup",
    isPublished: false
  };

  return json({ popupData });
}

export default function PopupEditor() {
  const { popupData } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  
  // State for tabs and radio selections
  const [selectedTab, setSelectedTab] = useState(0);
  const [displayRule, setDisplayRule] = useState('every-visit');
  const [pageRule, setPageRule] = useState('any-page');
  const [locationRule, setLocationRule] = useState('any-country');
  const [scheduleRule, setScheduleRule] = useState('all-time');
  
  // State for preview device
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  
  // Configuration tabs
  const tabs = [
    {
      id: 'rules',
      content: 'Rules',
    },
    {
      id: 'content',
      content: 'Content',
    },
    {
      id: 'style',
      content: 'Style',
    },
  ];
  
  // Handle tab change
  const handleTabChange = (selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
  };
  
  // Handle back button click
  const handleBackClick = () => {
    navigate('/popups');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#f6f6f7', 
        padding: '16px 20px', 
        borderBottom: '1px solid #dde0e4',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <InlineStack align="start">
          <Button 
            icon={ArrowLeftIcon} 
            onClick={handleBackClick} 
            variant="plain" 
            accessibilityLabel="Back"
          >
            Back
          </Button>
          
          <div style={{ borderLeft: '1px solid #dde0e4', height: '24px', margin: '0 8px' }}></div>
          
          <Text as="h6" variant="headingMd" fontWeight="bold">
            {popupData.title}
          </Text>
          <div className="badge">
          <Badge tone="info">Unpublished</Badge>
          </div>
        </InlineStack>
        
        <InlineStack gap="3">
          <Button icon={QuestionCircleIcon} disclosure variant="plain">Need help?</Button>
          <Button variant="primary">Preview this popup</Button>
        </InlineStack>
      </div>
      
      {/* Main Content */}
      <div style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Left Panel - Rules */}
        <div style={{ 
          width: '360px', 
          borderRight: '1px solid #dde0e4', 
          backgroundColor: '#ffffff', 
          overflowY: 'auto' 
        }}>
          <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />
          
          <div style={{ padding: '20px' }}>
            {selectedTab === 0 && (
              <BlockStack gap="8">
                <Text as="p">Tab 1</Text>
              </BlockStack>
            )}
            
            {selectedTab === 1 && (
              <BlockStack gap="4">
                <Text as="p" variant="bodyLg">Content tab content would go here.</Text>
              </BlockStack>
            )}
            
            {selectedTab === 2 && (
              <BlockStack gap="4">
                <Text as="p" variant="bodyLg">Style tab content would go here.</Text>
              </BlockStack>
            )}
          </div>
        </div>
        
        {/* Right Panel - Device Selection */}
        <div style={{ flex: 1, backgroundColor: '#f6f6f7', padding: '16px' }}>
          
          {/* Empty gray area where preview would be */}
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            height: 'calc(100vh - 220px)', 
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              width: '400px', 
              padding: '24px', 
              borderRadius: '8px',
              boxShadow: '0px 4px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <Button plain variant="monochrome">✕</Button>
              </div>
              
              <BlockStack gap="5">
                <Text variant="heading2xl" as="h2" alignment="center">Get 10% OFF your order</Text>
                <Text variant="bodyLg" as="p" alignment="center">Sign up and unlock your instant discount.</Text>
                
                <div style={{ 
                  border: '1px solid #c9cccf', 
                  padding: '12px', 
                  borderRadius: '4px',
                  marginTop: '12px'
                }}>
                  <Text variant="bodyMd" color="subdued">Email address</Text>
                </div>
                
                <Button variant="primary" fullWidth>Claim discount</Button>
                <Button variant="plain" fullWidth>No, thanks</Button>
                
                <Text variant="bodySm" as="p" color="subdued" alignment="center">
                  You are signing up to receive communication via email and can unsubscribe at any time.
                </Text>
              </BlockStack>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
