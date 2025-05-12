import {
    BlockStack,
    Box,
    Button,
    Checkbox,
    Divider,
    Icon,
    InlineStack,
    Text,
    TextField,
  } from "@shopify/polaris";
  import { useState } from "react";
  
  function Tab2() {
    // Checkbox states
    const [nameChecked, setNameChecked] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    const [primaryButtonChecked, setPrimaryButtonChecked] = useState(true);
    const [secondaryButtonChecked, setSecondaryButtonChecked] = useState(true);
    const [buttonChecked, setButtonChecked] = useState(true);
  
    // Text field states
    const [headingText, setHeadingText] = useState("Get 10% OFF your order");
    const [descriptionText, setDescriptionText] = useState(
      "Sign up and unlock your instant discount.",
    );
    const [footerText, setFooterText] = useState(
      "You are signing up to receive communication via email and can unsubscribe at any time.",
    );
    const [successHeading, setSuccessHeading] = useState("Discount unlocked 🎉");
    const [successDescription, setSuccessDescription] = useState(
      "Thanks for subscribing. Copy your discount code and apply to your next order.",
    );
    const [stickyDescription, setStickyDescription] = useState(
      "Don't forget to use your discount code",
    );
    const [buttonText, setButtonText] = useState("Get 10% OFF");
  
    // Edit button component
    const EditButton = () => (
      <Button
        plain
        monochrome
        textDecoration="underline"
        onClick={() => console.log("Edit clicked")}
      >
        <Text as="span" color="highlight">
          Edit
        </Text>
      </Button>
    );
  
    // Row with label and edit button
    const RowWithEdit = ({ label, checked, onChange }) => (
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        width: "100%", 
        padding: "4px 0" 
      }}>
        <Checkbox
          label={label}
          checked={checked}
          onChange={onChange}
        />
        <EditButton />
      </div>
    );
  
    return (
      <BlockStack gap="100">
        {/* Start Status */}
        <Text variant="headingMd" as="h2">
          Start status
        </Text>
  
        {/* Heading Input */}
        <div style={{ marginTop: "8px" }}   >
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Heading
          </Text>
          <div style={{ marginTop: "8px" }}>
            <TextField
              label=""
              value={headingText}
              onChange={setHeadingText}
              autoComplete="off"
            />
          </div>
        </div>
  
        {/* Description Input */}
        <div style={{ marginTop: "8px" }}>
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Description
          </Text>
          <div style={{ marginTop: "8px"}}>
            <TextField
              label=""
              value={descriptionText}
              onChange={setDescriptionText}
              multiline={3}
              autoComplete="off"
            />
          </div>
        </div>
  
        {/* Form Fields */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Form
          </Text>
          <BlockStack gap="100">
            <RowWithEdit 
              label="Name" 
              checked={nameChecked} 
              onChange={setNameChecked} 
            />
            
            <RowWithEdit 
              label="Email address" 
              checked={emailChecked} 
              onChange={setEmailChecked} 
            />
            
            <div style={{ marginTop: "16px" }}>
              <Button 
                fullWidth 
                outline 
                icon={
                  <span style={{ marginRight: "4px", fontSize: "18px" }}>+</span>
                }
              >
                Add form field
              </Button>
            </div>
          </BlockStack>
        </div>
  
        {/* Actions */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Actions
          </Text>
          <BlockStack gap="100">
            <RowWithEdit 
              label="Primary button" 
              checked={primaryButtonChecked} 
              onChange={setPrimaryButtonChecked} 
            />
  
            <RowWithEdit 
              label="Secondary button" 
              checked={secondaryButtonChecked} 
              onChange={setSecondaryButtonChecked} 
            />
          </BlockStack>
        </div>
  
        {/* Footer Text */}
        <div style={{ marginTop: "16px" }}>
          <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
            Footer text
          </Text>
          <div
            style={{
              border: "1px solid #dde0e4",
              borderRadius: "8px",
              padding: "12px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid #dde0e4",
                paddingBottom: "8px",
                marginBottom: "8px",
              }}
            >
              <InlineStack gap="3">
                <Button size="slim" monochrome>
                  B
                </Button>
                <Button size="slim" monochrome>
                  I
                </Button>
              </InlineStack>
            </div>
            <Text as="p" variant="bodyMd">
              {footerText}
            </Text>
          </div>
        </div>
  
        {/* Success status */}
        <div style={{ marginTop: "16px" }}>
          <Text variant="headingMd" as="h2">
            Success status
          </Text>
  
          {/* Success Heading */}
          <div style={{ marginTop: "16px" }}>
            <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
              Heading
            </Text>
            <div style={{ marginTop: "8px" }}>
              <TextField
                value={successHeading}
                onChange={setSuccessHeading}
                autoComplete="off"
              />
            </div>
          </div>
  
          {/* Success Description */}
          <div style={{ marginTop: "16px" }}>
            <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
              Description
            </Text>
            <div style={{ marginTop: "8px" }}>
              <TextField
                value={successDescription}
                onChange={setSuccessDescription}
                multiline={3}
                autoComplete="off"
              />
            </div>
          </div>
  
          {/* Success Actions */}
          <div style={{ marginTop: "16px" }}>
            <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
              Actions
            </Text>
            <div style={{ marginTop: "8px" }}>
              <RowWithEdit 
                label="Button" 
                checked={buttonChecked} 
                onChange={setButtonChecked} 
              />
            </div>
          </div>
        </div>
  
        {/* Sticky discount bar */}
        <div style={{ marginTop: "16px" }}>
          <Text variant="headingMd" as="h2">
            Sticky discount bar
          </Text>
  
          {/* Sticky Description */}
          <div style={{ marginTop: "16px" }}>
            <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
              Description
            </Text>
            <div style={{ marginTop: "8px" }}>
              <TextField
                value={stickyDescription}
                onChange={setStickyDescription}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
  
        {/* Sidebar widget */}
        <div style={{ marginTop: "16px" }}>
          <Text variant="headingMd" as="h2">
            Sidebar widget
          </Text>
  
          {/* Button Text */}
          <div style={{ marginTop: "16px" }}>
            <Text as="p" fontWeight="medium" color="subdued" variant="bodyMd">
              Button text
            </Text>
            <div style={{ marginTop: "8px" }}>
              <TextField
                value={buttonText}
                onChange={setButtonText}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </BlockStack>
    );
  }
  
  export default Tab2;