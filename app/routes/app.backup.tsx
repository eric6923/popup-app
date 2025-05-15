"use client";

import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import {
  Button,
  Checkbox,
  TextField,
  Tabs,
  Text,
  RadioButton,
  InlineStack,
  BlockStack,
  Icon,
  Link,
  Badge,
  ButtonGroup,
  Divider,
  Select,
  Frame,
  Combobox,
  Popover,
  Tag,
  Listbox,
  AutoSelection,
} from "@shopify/polaris";
import {
  QuestionCircleIcon,
  ViewIcon,
  ExitIcon,
  DeleteIcon,
  ClockIcon,
  CalendarIcon,
} from "@shopify/polaris-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import Tab2 from "./app.tab2";
import Tab3 from "./app.tab3";

interface PopupData {
  id: string;
  title: string;
  isPublished: boolean;
}

export async function loader({ params }) {
  // Would fetch popup data from API
  const popupData = {
    id: params.id,
    title: "Opt-in popup",
    isPublished: false,
  };

  return json({ popupData });
}

// Mock data for popup editor
// const mockPopupData = {
//   id: "mock-id",
//   title: "Opt-in popup",
//   isPublished: false,
// }

export default function PopupEditor({ popupId, onClose }:any = {}) {
  // Get data from loader if available, otherwise use mock data
  const loaderData = useLoaderData();
  const params = useParams();
  const navigate = useNavigate();

  // Create mock data for when component is used in a modal
  const mockPopupData = {
    id: popupId || "default-id",
    title: "Opt-in popup",
    isPublished: false,
  };

  // Use loader data if available, otherwise use mock data
  const { popupData = mockPopupData } = loaderData || {};

  // State for modal
  const [isOpen, setIsOpen] = useState(true);

  // State for tabs
  const [selectedTab, setSelectedTab] = useState(0);

  // State for form fields
  const [popupName, setPopupName] = useState(popupData.title);
  const [discountOption, setDiscountOption] = useState("no-discount");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [setExpiration, setSetExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState("30");
  const [manualDiscountCode, setManualDiscountCode] = useState("");
  const [manualDiscountError, setManualDiscountError] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isPublished, setIsPublished] = useState(popupData.isPublished);

  // State for device preview
  const [selectedDevice, setSelectedDevice] = useState("desktop");

  // Trigger options states
  const [triggerOption, setTriggerOption] = useState("timer");
  const [delayTime, setDelayTime] = useState("Immediately");
  const [scrollPercentage, setScrollPercentage] = useState("50");

  // Frequency options states
  const [frequencyOption, setFrequencyOption] = useState("limit");
  const [frequencyLimit, setFrequencyLimit] = useState("2");
  const [frequencyPeriod, setFrequencyPeriod] = useState("Day");

  // Page rules states
  const [pageRuleOption, setPageRuleOption] = useState("specific");
  const [matchOption, setMatchOption] = useState("any");
  const [pageCondition, setPageCondition] = useState("Equals");
  const [pagePath, setPagePath] = useState("");

  // Delay options
  const delayOptions = [
    { label: "Immediately", value: "Immediately" },
    { label: "5 seconds", value: "5 seconds" },
    { label: "10 seconds", value: "10 seconds" },
    { label: "15 seconds", value: "15 seconds" },
    { label: "30 seconds", value: "30 seconds" },
  ];

  // Period options
  const periodOptions = [
    { label: "Day", value: "Day" },
    { label: "Week", value: "Week" },
    { label: "Month", value: "Month" },
  ];

  // Page condition options
  const pageConditionOptions = [
    { label: "Equals", value: "Equals" },
    { label: "Contains", value: "Contains" },
    { label: "Starts with", value: "Starts with" },
    { label: "Ends with", value: "Ends with" },
  ];

  // Handle popup name change
  const handlePopupNameChange = useCallback(
    (newValue) => setPopupName(newValue),
    [],
  );

  // Handle tab change
  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  // Handle manual discount code change
  const handleManualDiscountChange = useCallback((value) => {
    setManualDiscountCode(value);
    setManualDiscountError(value.trim() === "");
  }, []);

  // Handle expiration days change
  const handleExpirationDaysChange = useCallback((value) => {
    setExpirationDays(value);
  }, []);

  // Set manual discount error when switching to manual mode
  useEffect(() => {
    if (discountOption === "manual-discount") {
      setManualDiscountError(manualDiscountCode.trim() === "");
    }
  }, [discountOption, manualDiscountCode]);

  // Handle back button click (close modal)
  const handleBackClick = useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      // If onClose prop is provided, use it (when in modal)
      onClose();
    } else {
      // Otherwise navigate back (when used as a route)
      setTimeout(() => navigate("/popups"), 500);
    }
  }, [navigate, onClose]);

  // Configuration tabs
  const tabs = [
    {
      id: "rules",
      content: "Rules",
    },
    {
      id: "content",
      content: "Content",
    },
    {
      id: "style",
      content: "Style",
    },
  ];

  const discountTypes = [
    { label: "Percentage off", value: "percentage" },
    { label: "Fixed amount off", value: "fixed-amount" },
    { label: "Free shipping", value: "free-shipping" },
  ];

  const previewTabs = [
    { id: "start", content: "Start status" },
    { id: "success", content: "Success status" },
    { id: "sticky", content: "Sticky discount bar" },
    { id: "sidebar", content: "Sidebar widget" },
  ];

  const [scheduleOption, setScheduleOption] = useState("all-time");
  const [startDate, setStartDate] = useState("2025-05-11");
  const [endDate, setEndDate] = useState("2025-05-11");
  const [startTime, setStartTime] = useState("20:44");
  const [endTime, setEndTime] = useState("20:44");
  const [hasEndDate, setHasEndDate] = useState(true); // Changed the variable name

  // Add these handlers
  const handleStartDateChange = useCallback((value) => setStartDate(value), []);
  const handleEndDateChange = useCallback((value) => setEndDate(value), []);
  const handleStartTimeChange = useCallback((value) => setStartTime(value), []);
  const handleEndTimeChange = useCallback((value) => setEndTime(value), []);

  // Country selection data
  const [locationRuleOption, setLocationRuleOption] = useState("any");

  // State for country selection
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [excludedCountries, setExcludedCountries] = useState([]);
  const [countryInputValue, setCountryInputValue] = useState("");
  const [countryPopoverActive, setCountryPopoverActive] = useState(false);

  // Sample country options - replace with your full list
  const allCountries = useMemo(
    () => [
      { value: "US", label: "United States" },
      { value: "CA", label: "Canada" },
      { value: "MX", label: "Mexico" },
      { value: "UK", label: "United Kingdom" },
      { value: "FR", label: "France" },
      { value: "DE", label: "Germany" },
      { value: "JP", label: "Japan" },
      { value: "AU", label: "Australia" },
      { value: "BR", label: "Brazil" },
      { value: "IN", label: "India" },
      // Add more countries as needed
    ],
    [],
  );

  // Filter countries based on input
  const countryOptions = useMemo(() => {
    return allCountries.filter((country) =>
      country.label.toLowerCase().includes(countryInputValue.toLowerCase()),
    );
  }, [allCountries, countryInputValue]);

  // Toggle popover
  const toggleCountryPopover = useCallback(() => {
    setCountryPopoverActive((active) => !active);
  }, []);

  // Handle input change
  const handleCountryInputChange = useCallback((value) => {
    setCountryInputValue(value);
  }, []);

  // Handle country selection
  const handleCountryChange = useCallback(
    (selected) => {
      const isExcludeMode = locationRuleOption === "exclude";
      if (isExcludeMode) {
        setExcludedCountries(selected);
      } else {
        setSelectedCountries(selected);
      }
      // Don't close popover to allow multiple selections
    },
    [locationRuleOption],
  );

  // Handle country removal
  const handleCountryRemove = useCallback(
    (countryToRemove) => {
      const isExcludeMode = locationRuleOption === "exclude";
      if (isExcludeMode) {
        setExcludedCountries((prev) =>
          prev.filter((country) => country !== countryToRemove),
        );
      } else {
        setSelectedCountries((prev) =>
          prev.filter((country) => country !== countryToRemove),
        );
      }
    },
    [locationRuleOption],
  );

  // Clear input when changing location rule option
  const handleLocationRuleChange = useCallback((value) => {
    setLocationRuleOption(value);
    setCountryInputValue("");
    setCountryPopoverActive(false);
  }, []);

  // Get the current active countries based on mode
  const activeCountries =
    locationRuleOption === "exclude" ? excludedCountries : selectedCountries;

  // Add these handlers for date and time

  const formatDateForDisplay = (dateObj: {
    year: any;
    month: any;
    day: any;
  }) => {
    return `${dateObj.year}-${String(dateObj.month).padStart(2, "0")}-${String(dateObj.day).padStart(2, "0")}`;
  };

  return (
    <Frame>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#f6f6f7",
          zIndex: 512,
          display: isOpen ? "flex" : "none",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #dde0e4",
            backgroundColor: "white",
          }}
        >
          <InlineStack align="start" gap="200">
            <Button
              icon={ExitIcon}
              onClick={handleBackClick}
              variant="plain"
              accessibilityLabel="Back"
            >
              Back
            </Button>

            <div
              style={{
                borderLeft: "1px solid #dde0e4",
                height: "24px",
                margin: "0 8px",
              }}
            ></div>

            <Text as="h2" variant="headingMd">
              {popupData.title}
            </Text>
            <Badge tone="info">Unpublished</Badge>
          </InlineStack>

          <InlineStack gap="200">
            <Button icon={QuestionCircleIcon} variant="plain">
              Need help?
            </Button>
            <Button variant="secondary" icon={ViewIcon}>
              Preview this popup
            </Button>
          </InlineStack>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Panel - Rules */}
          <div
            style={{
              width: "360px",
              borderRight: "1px solid #dde0e4",
              backgroundColor: "#f6f6f7",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Tabs with white background */}
            <div style={{ backgroundColor: "white" }}>
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={handleTabChange}
              />
            </div>

            <div
              style={{
                backgroundColor: "white",
                marginTop: "0",
                marginRight: "0",
                marginBottom: "16px",
                marginLeft: "0",
                borderRadius: "0",
                borderWidth: "0",
                borderBottomWidth: "1px",
                borderStyle: "solid",
                borderColor: "#dde0e4",
                width: "100%",
              }}
            >
              {selectedTab === 0 && (
                <BlockStack gap="0">
                  {/* Popup Title Section */}
                  <div
                    style={{
                      padding: "20px",
                    }}
                  >
                    <Text as="h2" variant="headingMd">
                      Opt-in Popup
                    </Text>

                    <div style={{ margin: "16px 0" }}>
                      <InlineStack align="space-between">
                        <Text as="p" variant="headingSm">
                          Publish your popup
                        </Text>

                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                          }}
                        >
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={isPublished}
                              onChange={() => setIsPublished(!isPublished)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </InlineStack>
                    </div>
                    <Divider />

                    <div style={{ marginTop: "16px" }}>
                      <TextField
                        label="Popup Name"
                        autoComplete="off"
                        helpText="Only visible to you, not shown to customers."
                        showCharacterCount
                        value={popupName}
                        onChange={handlePopupNameChange}
                        maxLength={50}
                      />
                    </div>
                  </div>
                </BlockStack>
              )}

              {selectedTab === 1 && (
                <div style={{ padding: "20px" }}>
                  <Tab2 />
                </div>
              )}

              {selectedTab === 2 && (
                <div style={{ padding: "20px" }}>
                  <Tab3 />
                </div>
              )}
            </div>

            {/* Additional cards for Rules tab */}
            {selectedTab === 0 && (
              <>
                {/* Discount Coupon Section */}
                <div
                  style={{
                    backgroundColor: "white",
                    margin: "0 0px 16px 0px",
                    padding: "20px",

                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#dde0e4",
                  }}
                >
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Discount coupon
                    </Text>
                    <Text as="p" variant="bodySm">
                      Attract customers to subscribe with a discount code.
                    </Text>

                    <BlockStack gap="100">
                      <RadioButton
                        label="No discount"
                        checked={discountOption === "no-discount"}
                        id="no-discount"
                        name="discount"
                        onChange={() => setDiscountOption("no-discount")}
                      />

                      <RadioButton
                        label="Discount code"
                        checked={discountOption === "discount-code"}
                        id="discount-code"
                        name="discount"
                        onChange={() => setDiscountOption("discount-code")}
                      />

                      {discountOption === "discount-code" && (
                        <div style={{ paddingLeft: "26px" }}>
                          <BlockStack gap="300">
                            <Text variant="bodySm">
                              Auto-generate a unique and non-reusable code for
                              each subscription.
                            </Text>

                            <div>
                              <Text variant="bodySm" as="p">
                                Select type
                              </Text>
                              <Select
                                label=""
                                labelHidden
                                options={discountTypes}
                                value={discountType}
                                onChange={setDiscountType}
                              />
                            </div>

                            <div>
                              <Text variant="bodySm" as="p">
                                Value
                              </Text>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <TextField
                                  type="text"
                                  value={discountValue}
                                  onChange={setDiscountValue}
                                  autoComplete="off"
                                />
                                <span style={{ marginLeft: "8px" }}>%</span>
                              </div>
                            </div>

                            <Checkbox
                              label="Set expiration on discount"
                              checked={setExpiration}
                              onChange={setSetExpiration}
                            />

                            {setExpiration && (
                              <div style={{ marginTop: "8px" }}>
                                <Text variant="bodySm" as="p">
                                  Expiration days
                                </Text>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <TextField
                                    type="number"
                                    value={expirationDays}
                                    onChange={handleExpirationDaysChange}
                                    autoComplete="off"
                                  />
                                  <span style={{ marginLeft: "8px" }}>
                                    days
                                  </span>
                                </div>
                              </div>
                            )}
                          </BlockStack>
                        </div>
                      )}

                      <RadioButton
                        label="Enter Shopify discount manually"
                        checked={discountOption === "manual-discount"}
                        id="manual-discount"
                        name="discount"
                        onChange={() => setDiscountOption("manual-discount")}
                      />

                      {discountOption === "manual-discount" && (
                        <div style={{ paddingLeft: "26px" }}>
                          <div style={{ position: "relative" }}>
                            <div
                              style={{
                                backgroundColor: manualDiscountError
                                  ? "#FFF4F4"
                                  : "white",
                                padding: "1px",
                              }}
                            >
                              <TextField
                                value={manualDiscountCode}
                                onChange={handleManualDiscountChange}
                                autoComplete="off"
                                error={manualDiscountError}
                              />
                            </div>
                            {manualDiscountError && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: "4px",
                                  color: "#bf0711",
                                }}
                              >
                                <Text as="span" variant="bodySm">
                                  This field can't be blank
                                </Text>
                              </div>
                            )}
                          </div>
                          <Text
                            as="p"
                            variant="bodySm"
                            style={{ marginTop: "8px" }}
                          >
                            <Link url="#">Create a discount</Link> in your
                            Shopify admin, and enter it above.
                          </Text>
                        </div>
                      )}
                    </BlockStack>
                  </BlockStack>
                </div>

                {/* Sticky Discount Bar Section */}
                <div
                  style={{
                    backgroundColor: "white",
                    margin: "0 0px 16px 0px",
                    padding: "20px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#dde0e4",
                  }}
                >
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">
                      Sticky discount bar
                    </Text>
                    <Text as="p" variant="bodySm">
                      Display a sticky discount bar at the top of your website
                      after a successful subscription.
                    </Text>

                    <div style={{ marginTop: "8px" }}>
                      <BlockStack gap="100">
                        <RadioButton
                          label="Show"
                          checked={showStickyBar}
                          id="show-sticky"
                          name="sticky-bar"
                          onChange={() => setShowStickyBar(true)}
                        />

                        <RadioButton
                          label="Don't show"
                          checked={!showStickyBar}
                          id="dont-show-sticky"
                          name="sticky-bar"
                          onChange={() => setShowStickyBar(false)}
                        />
                      </BlockStack>
                    </div>
                  </BlockStack>
                </div>

                {/* Sidebar Widget Section */}
                <div
                  style={{
                    backgroundColor: "white",
                    margin: "0 0px 16px 0px",
                    padding: "20px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#dde0e4",
                  }}
                >
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">
                      Sidebar widget
                    </Text>
                    <Text as="p" variant="bodySm">
                      Display a sidebar widget if the customer declines the
                      popup without subscribing.
                    </Text>

                    <div style={{ marginTop: "8px" }}>
                      <BlockStack gap="100">
                        <RadioButton
                          label="Show"
                          checked={showStickyBar}
                          id="show-sidebar"
                          name="sidebar-widget"
                          onChange={() => setShowStickyBar(true)}
                        />

                        <RadioButton
                          label="Don't show"
                          checked={!showStickyBar}
                          id="dont-show-sidebar"
                          name="sidebar-widget"
                          onChange={() => setShowStickyBar(false)}
                        />
                      </BlockStack>
                    </div>
                  </BlockStack>
                </div>

                {/* Trigger Section */}
                <div
                  style={{
                    backgroundColor: "white",
                    margin: "0 0px 16px 0px",
                    padding: "20px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#dde0e4",
                  }}
                >
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">
                      Trigger
                    </Text>

                    <div style={{ marginTop: "8px" }}>
                      <BlockStack gap="100">
                        <RadioButton
                          label="Show on a timer"
                          checked={triggerOption === "timer"}
                          id="show-timer"
                          name="trigger"
                          onChange={() => setTriggerOption("timer")}
                        />

                        {triggerOption === "timer" && (
                          <div
                            style={{ paddingLeft: "26px", marginTop: "-8px" }}
                          >
                            <Select
                              label=""
                              labelInline
                              options={delayOptions}
                              value={delayTime}
                              onChange={setDelayTime}
                              helpText="Set delay on showing popup after the page load."
                            />
                          </div>
                        )}

                        <RadioButton
                          label="Show after scrolling"
                          checked={triggerOption === "scroll"}
                          id="show-scroll"
                          name="trigger"
                          onChange={() => setTriggerOption("scroll")}
                        />

                        {triggerOption === "scroll" && (
                          <div style={{ marginTop: "4px" }}>
                            <InlineStack gap="100">
                              <div style={{ width: "320px" }}>
                                <TextField
                                  label=""
                                  labelHidden
                                  type="text"
                                  value={scrollPercentage}
                                  onChange={setScrollPercentage}
                                  autoComplete="off"
                                />
                              </div>
                              <Text as="span" variant="bodySm">
                                % of page
                              </Text>
                            </InlineStack>
                          </div>
                        )}

                        <RadioButton
                          label="Exiting the page"
                          checked={triggerOption === "exit"}
                          id="show-exit"
                          name="trigger"
                          onChange={() => setTriggerOption("exit")}
                          helpText="Only available for desktop browsing."
                        />
                      </BlockStack>
                    </div>
                  </BlockStack>
                </div>

                {/* Frequency Section */}
                <div
                  style={{
                    backgroundColor: "white",
                    margin: "0 0px 16px 0px",
                    padding: "20px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#dde0e4",
                  }}
                >
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">
                      FREQUENCY
                    </Text>
                    <Text as="p" variant="bodySm">
                      Number of times the popup will show on browser for
                      non-subscribed customers based on selected time.
                    </Text>

                    <BlockStack gap="100">
                      <RadioButton
                        label="Every time anyone visits"
                        checked={frequencyOption === "every"}
                        id="freq-every"
                        name="frequency"
                        onChange={() => setFrequencyOption("every")}
                      />

                      <RadioButton
                        label="Limit frequency"
                        checked={frequencyOption === "limit"}
                        id="freq-limit"
                        name="frequency"
                        onChange={() => setFrequencyOption("limit")}
                      />

                      {frequencyOption === "limit" && (
                        <InlineStack gap="200" align="center" wrap={false}>
                          <Text as="span" variant="bodyMd">
                            Limit:
                          </Text>
                          <div style={{ width: "80px" }}>
                            <TextField
                              label=""
                              labelHidden
                              type="text"
                              value={frequencyLimit}
                              onChange={setFrequencyLimit}
                              autoComplete="off"
                            />
                          </div>
                          {/* <Text as="span" variant="bodySm">times</Text> */}
                          <Text as="span" variant="bodyMd">
                            Per:
                          </Text>
                          <div style={{ width: "120px" }}>
                            <Select
                              label=""
                              labelHidden
                              options={periodOptions}
                              value={frequencyPeriod}
                              onChange={setFrequencyPeriod}
                            />
                          </div>
                        </InlineStack>
                      )}
                    </BlockStack>
                  </BlockStack>
                </div>

                {/* Page Rules Section */}
                <div
                  style={{
                    backgroundColor: "white",
                    margin: "0 0px 16px 0px",
                    padding: "20px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#dde0e4",
                  }}
                >
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">
                      PAGE RULES
                    </Text>
                    <Text as="p" variant="bodySm">
                      Display the popup based on your set rules.{" "}
                      <Link url="#">Learn more</Link>.
                    </Text>

                    <BlockStack gap="100">
                      <RadioButton
                        label="Show on any page"
                        checked={pageRuleOption === "any"}
                        id="page-any"
                        name="page-rule"
                        onChange={() => setPageRuleOption("any")}
                      />

                      <RadioButton
                        label="Show on specific page"
                        checked={pageRuleOption === "specific"}
                        id="page-specific"
                        name="page-rule"
                        onChange={() => setPageRuleOption("specific")}
                      />

                      {pageRuleOption === "specific" && (
                        <BlockStack gap="400">
                          <InlineStack gap="200">
                            <Button
                              variant={
                                matchOption === "any" ? "primary" : "secondary"
                              }
                              onClick={() => setMatchOption("any")}
                              size="slim"
                            >
                              Match any
                            </Button>
                            <Button
                              variant={
                                matchOption === "all" ? "primary" : "secondary"
                              }
                              onClick={() => setMatchOption("all")}
                              size="slim"
                            >
                              Match all
                            </Button>
                          </InlineStack>

                          <div>
                            <Text as="p" variant="bodySm">
                              Page path:
                            </Text>
                            <InlineStack gap="100" align="center">
                              <div style={{ width: "120px" }}>
                                <Select
                                  label=""
                                  labelHidden
                                  options={pageConditionOptions}
                                  value={pageCondition}
                                  onChange={setPageCondition}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <TextField
                                  label=""
                                  labelHidden
                                  type="text"
                                  value={pagePath}
                                  onChange={setPagePath}
                                  placeholder="e.g. /collections/summer"
                                  autoComplete="off"
                                />
                              </div>
                              <Button
                                icon={DeleteIcon}
                                variant="plain"
                                accessibilityLabel="Delete"
                                onClick={() => setPagePath("")}
                              />
                            </InlineStack>
                          </div>

                          <div>
                            <Button size="slim">Add rules</Button>
                          </div>
                        </BlockStack>
                      )}
                    </BlockStack>
                  </BlockStack>
                </div>

                {/* Location Rules Section */}
                <div
                  style={{
                    backgroundColor: "white",
                    margin: "0 0px 16px 0px",
                    padding: "20px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#dde0e4",
                  }}
                >
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">
                      LOCATION RULES
                    </Text>
                    <Text as="p" variant="bodySm">
                      Display the popup based on your set rules.{" "}
                      <Link url="#">Learn more</Link>.
                    </Text>

                    <BlockStack gap="300">
                      <RadioButton
                        label="Show in any country"
                        checked={locationRuleOption === "any"}
                        id="loc-any"
                        name="location-rule"
                        onChange={() => handleLocationRuleChange("any")}
                      />

                      <RadioButton
                        label="Show in certain countries"
                        checked={locationRuleOption === "specific"}
                        id="loc-specific"
                        name="location-rule"
                        onChange={() => handleLocationRuleChange("specific")}
                      />

                      {locationRuleOption === "specific" && (
                        <div style={{ paddingLeft: "26px" }}>
                          <BlockStack gap="200">
                            <Popover
                              active={countryPopoverActive}
                              activator={
                                <div style={{ cursor: "pointer" }}>
                                  <TextField
                                    label=""
                                    value={countryInputValue}
                                    onChange={handleCountryInputChange}
                                    placeholder="Search countries"
                                    autoComplete="off"
                                    onFocus={() =>
                                      setCountryPopoverActive(true)
                                    }
                                  />
                                </div>
                              }
                              onClose={() => setCountryPopoverActive(false)}
                            >
                              <Combobox
                                allowMultiple
                                activator={<span></span>}
                                onSelect={handleCountryChange}
                                options={[]}
                                selected={selectedCountries}
                              >
                                <Listbox autoSelection={AutoSelection.None}>
                                  {countryOptions.map((option) => (
                                    <Listbox.Option
                                      key={option.value}
                                      value={option.value}
                                      selected={selectedCountries.includes(
                                        option.value,
                                      )}
                                    >
                                      {option.label}
                                    </Listbox.Option>
                                  ))}
                                </Listbox>
                              </Combobox>
                            </Popover>

                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                                marginTop: "8px",
                              }}
                            >
                              {selectedCountries.map((country) => {
                                const countryLabel =
                                  allCountries.find(
                                    (option) => option.value === country,
                                  )?.label || country;
                                return (
                                  <Tag
                                    key={country}
                                    onRemove={() =>
                                      handleCountryRemove(country)
                                    }
                                  >
                                    {countryLabel}
                                  </Tag>
                                );
                              })}
                            </div>
                          </BlockStack>
                        </div>
                      )}

                      <RadioButton
                        label="Don't show in certain countries"
                        checked={locationRuleOption === "exclude"}
                        id="loc-exclude"
                        name="location-rule"
                        onChange={() => handleLocationRuleChange("exclude")}
                      />

                      {locationRuleOption === "exclude" && (
                        <div style={{ paddingLeft: "26px" }}>
                          <BlockStack gap="200">
                            <Popover
                              active={countryPopoverActive}
                              activator={
                                <div style={{ cursor: "pointer" }}>
                                  <TextField
                                    label=""
                                    value={countryInputValue}
                                    onChange={handleCountryInputChange}
                                    placeholder="Search countries"
                                    autoComplete="off"
                                    onFocus={() =>
                                      setCountryPopoverActive(true)
                                    }
                                  />
                                </div>
                              }
                              onClose={() => setCountryPopoverActive(false)}
                            >
                              <Combobox
                                allowMultiple
                                activator={<span></span>}
                                onSelect={handleCountryChange}
                                options={[]}
                                selected={excludedCountries}
                              >
                                <Listbox autoSelection={AutoSelection.None}>
                                  {countryOptions.map((option) => (
                                    <Listbox.Option
                                      key={option.value}
                                      value={option.value}
                                      selected={excludedCountries.includes(
                                        option.value,
                                      )}
                                    >
                                      {option.label}
                                    </Listbox.Option>
                                  ))}
                                </Listbox>
                              </Combobox>
                            </Popover>

                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                                marginTop: "8px",
                              }}
                            >
                              {excludedCountries.map((country) => {
                                const countryLabel =
                                  allCountries.find(
                                    (option) => option.value === country,
                                  )?.label || country;
                                return (
                                  <Tag
                                    key={country}
                                    onRemove={() =>
                                      handleCountryRemove(country)
                                    }
                                  >
                                    {countryLabel}
                                  </Tag>
                                );
                              })}
                            </div>
                          </BlockStack>
                        </div>
                      )}
                    </BlockStack>
                  </BlockStack>
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    margin: "0 0px 16px 0px",
                    padding: "20px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#dde0e4",
                  }}
                >
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">
                      SCHEDULE RULES
                    </Text>

                    <BlockStack gap="200">
                      <RadioButton
                        label="Show for all time"
                        checked={scheduleOption === "all-time"}
                        id="schedule-all-time"
                        name="schedule-option"
                        onChange={() => setScheduleOption("all-time")}
                      />

                      <RadioButton
                        label="Show between a time period"
                        checked={scheduleOption === "time-period"}
                        id="schedule-time-period"
                        name="schedule-option"
                        onChange={() => setScheduleOption("time-period")}
                      />

                      {scheduleOption === "time-period" && (
                        <div style={{ paddingLeft: "26px", marginTop: "8px" }}>
                          <BlockStack gap="400">
                            {/* Start date and time */}
                            <BlockStack gap="300">
                              <Text variant="bodySm" as="p">
                                Start date
                              </Text>
                              <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                  <TextField
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    autoComplete="off"
                                    prefix={<Icon source={CalendarIcon} />}
                                    type="date"
                                  />
                                </div>

                                <div style={{ flex: 1 }}>
                                  <Text variant="bodySm" as="p">
                                    Start time (EDT)
                                  </Text>
                                  <TextField
                                    value={startTime}
                                    onChange={handleStartTimeChange}
                                    autoComplete="off"
                                    prefix={<Icon source={ClockIcon} />}
                                    type="time"
                                  />
                                </div>
                              </div>
                            </BlockStack>

                            {/* Set end date checkbox */}
                            <div>
                              <Checkbox
                                label="Set end date"
                                checked={hasEndDate} // Changed variable name
                                onChange={() => setHasEndDate(!hasEndDate)} // Changed variable name
                              />
                            </div>

                            {/* End date and time */}
                            {hasEndDate && ( // Changed variable name
                              <BlockStack gap="300">
                                <Text variant="bodySm" as="p">
                                  End date
                                </Text>
                                <div style={{ display: "flex", gap: "16px" }}>
                                  <div style={{ flex: 1 }}>
                                    <TextField
                                      value={endDate}
                                      onChange={handleEndDateChange}
                                      autoComplete="off"
                                      prefix={<Icon source={CalendarIcon} />}
                                      type="date"
                                    />
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <Text variant="bodySm" as="p">
                                      End time (EDT)
                                    </Text>
                                    <TextField
                                      value={endTime}
                                      onChange={handleEndTimeChange}
                                      autoComplete="off"
                                      prefix={<Icon source={ClockIcon} />}
                                      type="time"
                                    />
                                  </div>
                                </div>
                              </BlockStack>
                            )}
                          </BlockStack>
                        </div>
                      )}
                    </BlockStack>
                  </BlockStack>
                </div>
              </>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#f6f6f7",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Device toggle */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <ButtonGroup segmented>
                <Button
                  pressed={selectedDevice === "desktop"}
                  onClick={() => setSelectedDevice("desktop")}
                >
                  Desktop
                </Button>
                <Button
                  pressed={selectedDevice === "mobile"}
                  onClick={() => setSelectedDevice("mobile")}
                >
                  Mobile
                </Button>
              </ButtonGroup>
            </div>

            {/* Preview tabs */}
            <div style={{ marginBottom: "16px" }}>
              <Tabs tabs={previewTabs} selected={0} onSelect={() => {}} />
            </div>

            {/* Preview Area */}
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  width: selectedDevice === "desktop" ? "400px" : "320px",
                  padding: "24px",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "12px",
                  }}
                >
                  {/* Change to normal button */}
                  <Button variant="plain">✕</Button>
                </div>

                <BlockStack gap="500">
                  <Text variant="heading2xl" as="h2" alignment="center">
                    Get 10% OFF your order
                  </Text>
                  <Text variant="bodyLg" as="p" alignment="center">
                    Sign up and unlock your instant discount.
                  </Text>

                  <div
                    style={{
                      border: "1px solid #c9cccf",
                      padding: "12px",
                      borderRadius: "4px",
                    }}
                  >
                    <Text as="p" variant="bodyMd">
                      Email address
                    </Text>
                  </div>

                  <button
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      padding: "12px",
                    }}
                  >
                    Claim discount
                  </button>
                  <Button variant="plain" fullWidth>
                    No, thanks
                  </Button>

                  <Text variant="bodySm" as="p" alignment="center">
                    You are signing up to receive communication via email and
                    can unsubscribe at any time.
                  </Text>
                </BlockStack>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}
