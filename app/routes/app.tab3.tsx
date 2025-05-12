import React, { useState, useCallback } from "react";
import { 
  Card, 
  Select, 
  RangeSlider, 
  DropZone,  
  Text,
  BlockStack,
  InlineStack,
  Divider,
  Box,
  TextField
} from '@shopify/polaris';
import ColorButton from './app.color'; // Import the external ColorButton component

export default function ImageSettings() {
  const [logoWidth, setLogoWidth] = useState(47);
  const [size, setSize] = useState('Standard');
  const [alignment, setAlignment] = useState('Center');
  const [cornerRadius, setCornerRadius] = useState('Standard');
  const [imagePosition, setImagePosition] = useState('None');
  const [cssCode, setCssCode] = useState('');
  
  // Color states
  const [popupBackground, setPopupBackground] = useState({
    hue: 0,
    brightness: 1,
    saturation: 0,
    alpha: 1
  });
  const [headingColor, setHeadingColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1
  });
  const [descriptionColor, setDescriptionColor] = useState({
    hue: 0,
    brightness: 0.29,
    saturation: 0,
    alpha: 1
  });
  const [inputColor, setInputColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1
  });
  const [consentColor, setConsentColor] = useState({
    hue: 0,
    brightness: 0.29,
    saturation: 0,
    alpha: 1
  });
  const [errorColor, setErrorColor] = useState({
    hue: 0,
    brightness: 1,
    saturation: 1,
    alpha: 1
  });
  const [footerTextColor, setFooterTextColor] = useState({
    hue: 0,
    brightness: 0.29,
    saturation: 0,
    alpha: 1
  });
  const [labelColor, setLabelColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1
  });
  const [primaryButtonBg, setPrimaryButtonBg] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1
  });
  const [primaryButtonText, setPrimaryButtonText] = useState({
    hue: 0,
    brightness: 1,
    saturation: 0,
    alpha: 1
  });
  const [secondaryButtonText, setSecondaryButtonText] = useState({
    hue: 240,
    brightness: 0.8,
    saturation: 1,
    alpha: 1
  });
  const [stickyDiscountBarBg, setStickyDiscountBarBg] = useState({
    hue: 0,
    brightness: 1,
    saturation: 0,
    alpha: 1
  });
  const [stickyDiscountBarText, setStickyDiscountBarText] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1
  });
  const [sidebarWidgetBg, setSidebarWidgetBg] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1
  });
  const [sidebarWidgetText, setSidebarWidgetText] = useState({
    hue: 0,
    brightness: 1,
    saturation: 0,
    alpha: 1
  });

  const handleLogoWidthChange = useCallback((value) => setLogoWidth(value), []);
  const handleSizeChange = useCallback((value) => setSize(value), []);
  const handleAlignmentChange = useCallback((value) => setAlignment(value), []);
  const handleCornerRadiusChange = useCallback((value) => setCornerRadius(value), []);
  const handleImagePositionChange = useCallback((value) => setImagePosition(value), []);
  const handleCssCodeChange = useCallback((value) => setCssCode(value), []);

  const sizeOptions = [
    {label: 'Standard', value: 'Standard'},
  ];
  
  const alignmentOptions = [
    {label: 'Center', value: 'Center'},
  ];
  
  const cornerRadiusOptions = [
    {label: 'Standard', value: 'Standard'},
  ];
  
  const imagePositionOptions = [
    {label: 'None', value: 'None'},
  ];

  return (
    <BlockStack gap="400">
      {/* Logo Section */}
      <BlockStack gap="400">
        <Text as="p" variant="headingMd">Logo</Text>
        <Text as="p" variant="bodyMd">Less than 2MB; Accepts .jpg, .png, .gif, .jpeg.</Text>
        
        <Card>
          <BlockStack gap="400">
            <DropZone 
              accept="image/*" 
              type="image" 
              outline={false}
              onDrop={() => {}}
            >
              <DropZone.FileUpload actionHint="Accepts .jpg, .png, .gif, .jpeg." />
            </DropZone>
          </BlockStack>
        </Card>
        
        <BlockStack gap="200">
          <RangeSlider
            output
            label="Logo width"
            min={0}
            max={100}
            value={logoWidth}
            onChange={handleLogoWidthChange}            
            suffix={<Text as="p">{logoWidth}%</Text>}
          />
        </BlockStack>
      </BlockStack>

      <Divider />

      {/* Display Card */}
      <BlockStack gap="400">
        <Text as="p" variant="headingMd">Display</Text>
        
        <BlockStack gap="400">
          <BlockStack gap="200">
            <Text as="p">Size</Text>
            <Select
              label=""
              options={sizeOptions}
              value={size}
              onChange={handleSizeChange}
            />
          </BlockStack>
          
          <BlockStack gap="200">
            <Text as="p">Alignment</Text>
            <Select
              label=""
              options={alignmentOptions}
              value={alignment}
              onChange={handleAlignmentChange}
            />
          </BlockStack>
          
          <BlockStack gap="200">
            <Text as="p">Corner radius</Text>
            <Select
              label=""
              options={cornerRadiusOptions}
              value={cornerRadius}
              onChange={handleCornerRadiusChange}
            />
          </BlockStack>
        </BlockStack>
      </BlockStack>

      <Divider />

      {/* Layout Card */}
      <BlockStack gap="400">
        <Text as="p" variant="headingMd">Layout</Text>
        
        <BlockStack gap="200">
          <Text as="p">Image position</Text>
          <Select
            label=""
            options={imagePositionOptions}
            value={imagePosition}
            onChange={handleImagePositionChange}
          />
        </BlockStack>
      </BlockStack>

      <Divider />

      {/* Image Card */}
      <BlockStack gap="400">
        <Text as="p" variant="headingMd">Image</Text>
        <Text as="p" variant="bodyMd">Less than 2MB; Accepts .jpg, .png, .gif, .jpeg, recommended: 600 x 400 pixels.</Text>
        
        <Card>
          <DropZone 
            accept="image/*" 
            type="image" 
            outline={false}
            onDrop={() => {}}
          >
            <DropZone.FileUpload actionHint="Accepts .jpg, .png, .gif, .jpeg." />
          </DropZone>
        </Card>
      </BlockStack>

      <Divider />

      {/* Colors Section - Using imported ColorButton component */}
      <div style={{ padding: '16px' }}>
        <Text as="h2" variant="headingMd" fontWeight="bold">Colors</Text>
        
        {/* POPUP */}
        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">POPUP</Text>
          <div style={{ display: 'flex', marginTop: '8px' }}>
            <ColorButton 
              label="Background" 
              initialColor={popupBackground} 
              onChange={setPopupBackground} 
            />
          </div>
        </div>
        
        {/* TEXT */}
        <div style={{ marginBottom: '16px' }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">TEXT</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <ColorButton label="Heading" initialColor={headingColor} onChange={setHeadingColor} />
            <ColorButton label="Description" initialColor={descriptionColor} onChange={setDescriptionColor} />
            <ColorButton label="Input" initialColor={inputColor} onChange={setInputColor} />
            <ColorButton label="Consent" initialColor={consentColor} onChange={setConsentColor} />
            <ColorButton label="Error" initialColor={errorColor} onChange={setErrorColor} />
            <ColorButton label="Footer text" initialColor={footerTextColor} onChange={setFooterTextColor} />
            <ColorButton label="Label" initialColor={labelColor} onChange={setLabelColor} />
          </div>
        </div>
        
        {/* PRIMARY BUTTON */}
        <div style={{ marginBottom: '16px' }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">PRIMARY BUTTON</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <ColorButton label="Background" initialColor={primaryButtonBg} onChange={setPrimaryButtonBg} />
            <ColorButton label="Text" initialColor={primaryButtonText} onChange={setPrimaryButtonText} />
          </div>
        </div>
        
        {/* SECONDARY BUTTON */}
        <div style={{ marginBottom: '16px' }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">SECONDARY BUTTON</Text>
          <div style={{ marginTop: '8px' }}>
            <ColorButton label="Text" initialColor={secondaryButtonText} onChange={setSecondaryButtonText} />
          </div>
        </div>
        
        {/* STICKY DISCOUNT BAR */}
        <div style={{ marginBottom: '16px' }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">STICKY DISCOUNT BAR</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <ColorButton label="Background" initialColor={stickyDiscountBarBg} onChange={setStickyDiscountBarBg} />
            <ColorButton label="Text" initialColor={stickyDiscountBarText} onChange={setStickyDiscountBarText} />
          </div>
        </div>
        
        {/* SIDEBAR WIDGET */}
        <div style={{ marginBottom: '16px' }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">SIDEBAR WIDGET</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <ColorButton label="Background" initialColor={sidebarWidgetBg} onChange={setSidebarWidgetBg} />
            <ColorButton label="Text" initialColor={sidebarWidgetText} onChange={setSidebarWidgetText} />
          </div>
        </div>
        
        <Divider />
        
        {/* CSS Section */}
        <div style={{ marginTop: '16px', }}>
          <BlockStack gap="200">
          <Text as="p" variant="bodyMd" fontWeight="bold">CSS</Text>
          <Text as="p" variant="bodySm">Add CSS codes here to do some custom change, this won't influence your store theme.</Text>
          <TextField
            label=""
            value={cssCode}
            onChange={handleCssCodeChange}
            multiline={6}
            autoComplete="off"
          />
          </BlockStack>
        </div>
      </div>
    </BlockStack>
  );
}