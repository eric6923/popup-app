"use client"

import { useNavigate, useParams, useSubmit } from "@remix-run/react"
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
  Tag,
  ContextualSaveBar,
  LegacyStack,
} from "@shopify/polaris"
import { QuestionCircleIcon, ViewIcon, ExitIcon, DeleteIcon, ClockIcon, CalendarIcon } from "@shopify/polaris-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import Tab2 from "./app.tab2"
import Tab3 from "./app.tab3"

interface PopupData {
  id: string
  title: string
  type: string
  isActive: boolean
  config: any
}

export default function PopupEditor({
  popupId,
  popupData,
}: {
  popupId: string
  popupData?: PopupData
}) {
  const navigate = useNavigate()
  const submit = useSubmit()
  const params = useParams()

  // If popupId is not provided via props, get it from URL params
  const id = popupId || params.id

  // State for tabs
  const [selectedTab, setSelectedTab] = useState(0)

  // State for form fields
  const [popupName, setPopupName] = useState(popupData?.title || "")
  const [discountOption, setDiscountOption] = useState("no-discount")
  const [discountType, setDiscountType] = useState("percentage")
  const [discountValue, setDiscountValue] = useState("10")
  const [setExpiration, setSetExpiration] = useState(false)
  const [expirationDays, setExpirationDays] = useState("30")
  const [manualDiscountCode, setManualDiscountCode] = useState("")
  const [manualDiscountError, setManualDiscountError] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [isPublished, setIsPublished] = useState(popupData?.isActive || false)
  const [config, setConfig] = useState<any>(popupData?.config || null)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // State for device preview
  const [selectedDevice, setSelectedDevice] = useState("desktop")

  // Trigger options states
  const [triggerOption, setTriggerOption] = useState("timer")
  const [delayTime, setDelayTime] = useState("Immediately")
  const [scrollPercentage, setScrollPercentage] = useState("50")

  // Frequency options states
  const [frequencyOption, setFrequencyOption] = useState("limit")
  const [frequencyLimit, setFrequencyLimit] = useState("2")
  const [frequencyPeriod, setFrequencyPeriod] = useState("Day")

  // Page rules states
  const [pageRuleOption, setPageRuleOption] = useState("specific")
  const [matchOption, setMatchOption] = useState("any")
  const [pageCondition, setPageCondition] = useState("Equals")
  const [pagePath, setPagePath] = useState("")

  // Country selection data
  const [locationRuleOption, setLocationRuleOption] = useState("any")

  // State for country selection
  const [selectedCountries, setSelectedCountries] = useState([])
  const [excludedCountries, setExcludedCountries] = useState([])
  const [countryInputValue, setCountryInputValue] = useState("")
  const [countryPopoverActive, setCountryPopoverActive] = useState(false)
  const [selectedCountryOption, setSelectedCountryOption] = useState<string | null>(null)

  const [scheduleOption, setScheduleOption] = useState("all-time")
  const [startDate, setStartDate] = useState("2025-05-11")
  const [endDate, setEndDate] = useState("2025-05-11")
  const [startTime, setStartTime] = useState("20:44")
  const [endTime, setEndTime] = useState("20:44")
  const [hasEndDate, setHasEndDate] = useState(true)

  // Initialize form values from popup data
  useEffect(() => {
    if (popupData?.config) {
      setConfig(popupData.config)

      // Set form values from config if they exist
      const rules = popupData.config.rules || {}

      // Popup name
      if (rules.popupName) setPopupName(rules.popupName)

      // Discount settings
      if (rules.discount) {
        if (rules.discount.no_discount?.enabled) {
          setDiscountOption("no-discount")
        } else if (rules.discount.discount_code?.enabled) {
          setDiscountOption("discount-code")
          if (rules.discount.discount_code.discountType) {
            setDiscountType(rules.discount.discount_code.discountType)
          }
          if (rules.discount.discount_code.discountValue) {
            setDiscountValue(rules.discount.discount_code.discountValue.toString())
          }
          if (rules.discount.discount_code.expiration?.enabled) {
            setSetExpiration(true)
            if (rules.discount.discount_code.expiration.days) {
              setExpirationDays(rules.discount.discount_code.expiration.days.toString())
            }
          }
        } else if (rules.discount.manual_discount?.enabled) {
          setDiscountOption("manual-discount")
          if (rules.discount.manual_discount.manualDiscount) {
            setManualDiscountCode(rules.discount.manual_discount.manualDiscount)
          }
        }
      }

      // Sticky bar and sidebar widget
      if (rules.stickyDiscountBar?.enabled) {
        setShowStickyBar(true)
      }

      // Trigger settings
      if (rules.trigger?.type) {
        setTriggerOption(rules.trigger.type.toLowerCase())

        if (rules.trigger.type === "TIMER" && rules.trigger.timerOption) {
          if (rules.trigger.timerOption.delayType === "IMMEDIATELY") {
            setDelayTime("Immediately")
          } else if (rules.trigger.timerOption.delaySeconds) {
            setDelayTime(`${rules.trigger.timerOption.delaySeconds} seconds`)
          }
        } else if (rules.trigger.type === "SCROLL" && rules.trigger.scrollOption?.percentage) {
          setScrollPercentage(rules.trigger.scrollOption.percentage.toString())
        }
      }

      // Frequency settings
      if (rules.frequency?.type) {
        setFrequencyOption(rules.frequency.type === "ALWAYS" ? "every" : "limit")
        if (rules.frequency.type === "LIMIT" && rules.frequency.limit) {
          if (rules.frequency.limit.count) {
            setFrequencyLimit(rules.frequency.limit.count.toString())
          }
          if (rules.frequency.limit.per) {
            setFrequencyPeriod(rules.frequency.limit.per.toLowerCase())
          }
        }
      }

      // Page rules
      if (rules.page_rules?.type) {
        setPageRuleOption(rules.page_rules.type === "ANY" ? "any" : "specific")
        if (rules.page_rules.type === "SPECIFIC" && rules.page_rules.conditions?.length > 0) {
          const condition = rules.page_rules.conditions[0]
          if (condition.match) {
            setPageCondition(condition.match.replace("_", " ").toLowerCase())
          }
          if (condition.value) {
            setPagePath(condition.value)
          }
        }
      }

      // Location rules
      if (rules.location_rules?.type) {
        if (rules.location_rules.type === "ANY") {
          setLocationRuleOption("any")
        } else if (rules.location_rules.type === "INCLUDE") {
          setLocationRuleOption("specific")
          if (rules.location_rules.countries?.length > 0) {
            setSelectedCountries(rules.location_rules.countries)
          }
        } else if (rules.location_rules.type === "EXCLUDE") {
          setLocationRuleOption("exclude")
          if (rules.location_rules.countries?.length > 0) {
            setExcludedCountries(rules.location_rules.countries)
          }
        }
      }

      // Schedule rules
      if (rules.schedule?.type) {
        setScheduleOption(rules.schedule.type === "ALL_TIME" ? "all-time" : "time-period")
        if (rules.schedule.type === "TIME_RANGE") {
          if (rules.schedule.start) {
            const startDateTime = new Date(rules.schedule.start)
            setStartDate(startDateTime.toISOString().split("T")[0])
            setStartTime(startDateTime.toTimeString().substring(0, 5))
          }
          if (rules.schedule.end) {
            const endDateTime = new Date(rules.schedule.end)
            setEndDate(endDateTime.toISOString().split("T")[0])
            setEndTime(endDateTime.toTimeString().substring(0, 5))
            setHasEndDate(true)
          } else {
            setHasEndDate(false)
          }
        }
      }
    }
  }, [popupData])

  // Delay options
  const delayOptions = [
    { label: "Immediately", value: "Immediately" },
    { label: "5 seconds", value: "5 seconds" },
    { label: "10 seconds", value: "10 seconds" },
    { label: "15 seconds", value: "15 seconds" },
    { label: "30 seconds", value: "30 seconds" },
  ]

  // Period options
  const periodOptions = [
    { label: "Day", value: "Day" },
    { label: "Week", value: "Week" },
    { label: "Month", value: "Month" },
  ]

  // Page condition options
  const pageConditionOptions = [
    { label: "Equals", value: "Equals" },
    { label: "Contains", value: "Contains" },
    { label: "Starts with", value: "Starts with" },
    { label: "Ends with", value: "Ends with" },
  ]

  // Handle popup name change
  const handlePopupNameChange = useCallback((newValue) => {
    setPopupName(newValue)
    setHasUnsavedChanges(true)
  }, [])

  // Handle tab change
  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex)
  }, [])

  // Handle manual discount code change
  const handleManualDiscountChange = useCallback((value) => {
    setManualDiscountCode(value)
    setManualDiscountError(value.trim() === "")
    setHasUnsavedChanges(true)
  }, [])

  // Handle expiration days change
  const handleExpirationDaysChange = useCallback((value) => {
    setExpirationDays(value)
    setHasUnsavedChanges(true)
  }, [])

  // Set manual discount error when switching to manual mode
  useEffect(() => {
    if (discountOption === "manual-discount") {
      setManualDiscountError(manualDiscountCode.trim() === "")
    }
  }, [discountOption, manualDiscountCode])

  // Handle back button click
  const handleBackClick = useCallback(() => {
    navigate("/app/popups")
  }, [navigate])

  // Handle save changes
  const handleSave = useCallback(() => {
    if (!config) return

    // Update config with current form values
    const updatedConfig = {
      ...config,
      rules: {
        ...config.rules,
        popupName,
        discount: {
          no_discount: {
            enabled: discountOption === "no-discount",
          },
          discount_code: {
            enabled: discountOption === "discount-code",
            discountType: discountOption === "discount-code" ? discountType : null,
            discountValue: discountOption === "discount-code" ? discountValue : null,
            expiration: {
              enabled: discountOption === "discount-code" && setExpiration,
              days: discountOption === "discount-code" && setExpiration ? Number(expirationDays) : null,
            },
          },
          manual_discount: {
            enabled: discountOption === "manual-discount",
            manualDiscount: discountOption === "manual-discount" ? manualDiscountCode : null,
          },
        },
        stickyDiscountBar: {
          enabled: showStickyBar,
        },
        sidebarWidget: {
          enabled: config?.rules?.sidebarWidget?.enabled === true,
        },
        trigger: {
          type: triggerOption.toUpperCase(),
          timerOption: {
            delayType: delayTime === "Immediately" ? "IMMEDIATELY" : "AFTER_DELAY",
            delaySeconds: delayTime === "Immediately" ? 0 : Number.parseInt(delayTime.split(" ")[0], 10),
          },
          scrollOption: {
            percentage: Number.parseInt(scrollPercentage, 10),
          },
          exitOption: {
            enabled: triggerOption === "exit",
          },
        },
        frequency: {
          type: frequencyOption === "every" ? "ALWAYS" : "LIMIT",
          limit: {
            count: frequencyOption === "limit" ? Number.parseInt(frequencyLimit, 10) : null,
            per: frequencyOption === "limit" ? frequencyPeriod.toUpperCase() : null,
          },
        },
        page_rules: {
          type: pageRuleOption === "any" ? "ANY" : "SPECIFIC",
          conditions:
            pageRuleOption === "specific"
              ? [
                  {
                    match: pageCondition.toUpperCase().replace(" ", "_"),
                    value: pagePath,
                  },
                ]
              : config.rules?.page_rules?.conditions || [],
        },
        location_rules: {
          type: locationRuleOption === "any" ? "ANY" : locationRuleOption === "specific" ? "INCLUDE" : "EXCLUDE",
          countries:
            locationRuleOption === "any"
              ? []
              : locationRuleOption === "specific"
                ? selectedCountries
                : excludedCountries,
        },
        schedule: {
          type: scheduleOption === "all-time" ? "ALL_TIME" : "TIME_RANGE",
          start: scheduleOption === "time-period" ? `${startDate}T${startTime}:00` : null,
          end: scheduleOption === "time-period" && hasEndDate ? `${endDate}T${endTime}:00` : null,
        },
      },
    }

    const formData = new FormData()
    formData.append("id", id)
    formData.append("config", JSON.stringify(updatedConfig))
    formData.append("isActive", isPublished.toString())

    submit(formData, { method: "post" })
    setHasUnsavedChanges(false)
  }, [
    config,
    id,
    submit,
    popupName,
    discountOption,
    discountType,
    discountValue,
    setExpiration,
    expirationDays,
    manualDiscountCode,
    showStickyBar,
    triggerOption,
    delayTime,
    scrollPercentage,
    frequencyOption,
    frequencyLimit,
    frequencyPeriod,
    pageRuleOption,
    pageCondition,
    pagePath,
    matchOption,
    locationRuleOption,
    selectedCountries,
    excludedCountries,
    scheduleOption,
    startDate,
    startTime,
    endDate,
    endTime,
    hasEndDate,
    isPublished,
  ])

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
  ]

  const discountTypes = [
    { label: "Percentage off", value: "percentage" },
    { label: "Fixed amount off", value: "fixed" },
    { label: "Free shipping", value: "free-shipping" },
  ]

  const previewTabs = [
    { id: "start", content: "Start status" },
    { id: "success", content: "Success status" },
    { id: "sticky", content: "Sticky discount bar" },
    { id: "sidebar", content: "Sidebar widget" },
  ]

  // Add a new state to track the selected preview tab
  const [selectedPreviewTab, setSelectedPreviewTab] = useState(0)

  // Add a handler for preview tab changes
  const handlePreviewTabChange = useCallback((selectedTabIndex) => {
    setSelectedPreviewTab(selectedTabIndex)
  }, [])

  // Add these handlers
  const handleStartDateChange = useCallback((value) => {
    setStartDate(value)
    setHasUnsavedChanges(true)
  }, [])
  const handleEndDateChange = useCallback((value) => {
    setEndDate(value)
    setHasUnsavedChanges(true)
  }, [])
  const handleStartTimeChange = useCallback((value) => {
    setStartTime(value)
    setHasUnsavedChanges(true)
  }, [])
  const handleEndTimeChange = useCallback((value) => {
    setEndTime(value)
    setHasUnsavedChanges(true)
  }, [])

  // Filter countries based on input
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
  )

  // Filter countries based on input
  const countryOptions = useMemo(() => {
    return allCountries.filter((country) => country.label.toLowerCase().includes(countryInputValue.toLowerCase()))
  }, [allCountries, countryInputValue])

  // Toggle popover
  const toggleCountryPopover = useCallback(() => {
    setCountryPopoverActive((active) => !active)
  }, [])

  // Handle input change
  const handleCountryInputChange = useCallback((value) => {
    setCountryInputValue(value)
  }, [])

  // Handle country selection
  const handleCountrySelect = useCallback(
    (value) => {
      const isExcludeMode = locationRuleOption === "exclude"
      const targetArray = isExcludeMode ? excludedCountries : selectedCountries

      // Check if the country is already selected
      if (!targetArray.includes(value)) {
        if (isExcludeMode) {
          setExcludedCountries([...targetArray, value])
        } else {
          setSelectedCountries([...targetArray, value])
        }
      }

      // Clear the input and close the popover
      setCountryInputValue("")
      setSelectedCountryOption(null)
      setHasUnsavedChanges(true)
    },
    [locationRuleOption, excludedCountries, selectedCountries],
  )

  // Handle country removal
  const handleCountryRemove = useCallback(
    (countryToRemove) => {
      const isExcludeMode = locationRuleOption === "exclude"
      if (isExcludeMode) {
        setExcludedCountries((prev) => prev.filter((country) => country !== countryToRemove))
      } else {
        setSelectedCountries((prev) => prev.filter((country) => country !== countryToRemove))
      }
      setHasUnsavedChanges(true)
    },
    [locationRuleOption],
  )

  // Clear input when changing location rule option
  const handleLocationRuleChange = useCallback((value) => {
    setLocationRuleOption(value)
    setCountryInputValue("")
    setCountryPopoverActive(false)
    setHasUnsavedChanges(true)
  }, [])

  // Get the current active countries based on mode
  const activeCountries = locationRuleOption === "exclude" ? excludedCountries : selectedCountries

  // Add these handlers with change tracking
  const handleTriggerOptionChange = (value) => {
    setTriggerOption(value)
    setHasUnsavedChanges(true)
  }

  const handleDelayTimeChange = (value) => {
    setDelayTime(value)
    setHasUnsavedChanges(true)
  }

  const handleFrequencyOptionChange = (value) => {
    setFrequencyOption(value)
    setHasUnsavedChanges(true)
  }

  const handleFrequencyLimitChange = (value) => {
    setFrequencyLimit(value)
    setHasUnsavedChanges(true)
  }

  const handleFrequencyPeriodChange = (value) => {
    setFrequencyPeriod(value)
    setHasUnsavedChanges(true)
  }

  const handlePageRuleOptionChange = (value) => {
    setPageRuleOption(value)
    setHasUnsavedChanges(true)
  }

  const handleMatchOptionChange = (value) => {
    setMatchOption(value)
    setHasUnsavedChanges(true)
  }

  const handlePageConditionChange = (value) => {
    setPageCondition(value)
    setHasUnsavedChanges(true)
  }

  const handlePagePathChange = (value) => {
    setPagePath(value)
    setHasUnsavedChanges(true)
  }

  const handleScheduleOptionChange = (value) => {
    setScheduleOption(value)
    setHasUnsavedChanges(true)
  }

  const handleShowStickyBarChange = (value) => {
    setShowStickyBar(value)
    setHasUnsavedChanges(true)
  }

  const handlePublishChange = (value) => {
    setIsPublished(value)
    setHasUnsavedChanges(true)
  }

  const handleDiscountOptionChange = (value) => {
    setDiscountOption(value)
    setHasUnsavedChanges(true)
  }

  const handleDiscountTypeChange = (value) => {
    setDiscountType(value)
    setHasUnsavedChanges(true)
  }

  const handleDiscountValueChange = (value) => {
    setDiscountValue(value)
    setHasUnsavedChanges(true)
  }

  const handleSetExpirationChange = (value) => {
    setSetExpiration(value)
    setHasUnsavedChanges(true)
  }

  // Get country label from value
  const getCountryLabel = useCallback(
    (countryValue) => {
      const country = allCountries.find((c) => c.value === countryValue)
      return country ? country.label : countryValue
    },
    [allCountries],
  )

  // Render tags for selected countries
  const renderCountryTags = useCallback(
    (countries) => {
      return (
        <LegacyStack spacing="tight">
          {countries.map((country) => (
            <Tag key={country} onRemove={() => handleCountryRemove(country)}>
              {getCountryLabel(country)}
            </Tag>
          ))}
        </LegacyStack>
      )
    },
    [getCountryLabel, handleCountryRemove],
  )

  return (
    <Frame>
      {hasUnsavedChanges && (
        <ContextualSaveBar
          message="Unsaved changes"
          saveAction={{
            onAction: handleSave,
            loading: false,
            disabled: false,
          }}
          discardAction={{
            onAction: () => {
              // Reset form to original values
              if (popupData?.config) {
                setConfig(popupData.config)
                const rules = popupData.config.rules || {}
                if (rules.popupName) setPopupName(rules.popupName)
                if (rules.trigger?.type) setTriggerOption(rules.trigger.type.toLowerCase())
                if (rules.trigger?.timerOption?.delayType) {
                  setDelayTime(
                    rules.trigger.timerOption.delayType === "IMMEDIATELY"
                      ? "Immediately"
                      : `${rules.trigger.timerOption.delaySeconds || 5} seconds`,
                  )
                }
                if (rules.frequency?.type) {
                  setFrequencyOption(rules.frequency.type === "ALWAYS" ? "every" : "limit")
                }
              }
              setHasUnsavedChanges(false)
            },
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#f6f6f7",
          zIndex: 512,
          display: "flex",
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
            <Button icon={ExitIcon} onClick={handleBackClick} variant="plain" accessibilityLabel="Back">
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
              {popupName}
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
              <Tabs tabs={tabs} fitted selected={selectedTab} onSelect={handleTabChange} />
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
                              onChange={() => {
                                handlePublishChange(!isPublished)
                              }}
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
                  <Tab2 config={config} setConfig={setConfig} setHasUnsavedChanges={setHasUnsavedChanges} />
                </div>
              )}

              {selectedTab === 2 && (
                <div style={{ padding: "20px" }}>
                  <Tab3 config={config} setConfig={setConfig} setHasUnsavedChanges={setHasUnsavedChanges} />
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
                        onChange={() => handleDiscountOptionChange("no-discount")}
                      />

                      <RadioButton
                        label="Discount code"
                        checked={discountOption === "discount-code"}
                        id="discount-code"
                        name="discount"
                        onChange={() => handleDiscountOptionChange("discount-code")}
                      />

                      {discountOption === "discount-code" && (
                        <div style={{ paddingLeft: "26px" }}>
                          <BlockStack gap="300">
                            <Text variant="bodySm">
                              Auto-generate a unique and non-reusable code for each subscription.
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
                                onChange={(value) => {
                                  setDiscountType(value)
                                  setHasUnsavedChanges(true)
                                }}
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
                                  onChange={(value) => {
                                    setDiscountValue(value)
                                    setHasUnsavedChanges(true)
                                  }}
                                  autoComplete="off"
                                />
                                <span style={{ marginLeft: "8px" }}>%</span>
                              </div>
                            </div>

                            <Checkbox
                              label="Set expiration on discount"
                              checked={setExpiration}
                              onChange={() => {
                                setSetExpiration(!setExpiration)
                                setHasUnsavedChanges(true)
                              }}
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
                                  <span style={{ marginLeft: "8px" }}>days</span>
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
                        onChange={() => handleDiscountOptionChange("manual-discount")}
                      />

                      {discountOption === "manual-discount" && (
                        <div style={{ paddingLeft: "26px" }}>
                          <div style={{ position: "relative" }}>
                            <div
                              style={{
                                backgroundColor: manualDiscountError ? "#FFF4F4" : "white",
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
                          <Text as="p" variant="bodySm" style={{ marginTop: "8px" }}>
                            <Link url="#">Create a discount</Link> in your Shopify admin, and enter it above.
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
                      Display a sticky discount bar at the top of your website after a successful subscription.
                    </Text>

                    <div style={{ marginTop: "8px" }}>
                      <BlockStack gap="100">
                        <RadioButton
                          label="Show"
                          checked={showStickyBar}
                          id="show-sticky"
                          name="sticky-bar"
                          onChange={() => handleShowStickyBarChange(true)}
                        />

                        <RadioButton
                          label="Don't show"
                          checked={!showStickyBar}
                          id="dont-show-sticky"
                          name="sticky-bar"
                          onChange={() => handleShowStickyBarChange(false)}
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
                      Display a sidebar widget if the customer declines the popup without subscribing.
                    </Text>

                    <div style={{ marginTop: "8px" }}>
                      <BlockStack gap="100">
                        <RadioButton
                          label="Show"
                          checked={config?.rules?.sidebarWidget?.enabled === true}
                          id="show-sidebar"
                          name="sidebar-widget"
                          onChange={() => {
                            const updatedConfig = { ...config }
                            if (!updatedConfig.rules) updatedConfig.rules = {}
                            if (!updatedConfig.rules.sidebarWidget) updatedConfig.rules.sidebarWidget = {}
                            updatedConfig.rules.sidebarWidget.enabled = true
                            setConfig(updatedConfig)
                            setHasUnsavedChanges(true)
                          }}
                        />

                        <RadioButton
                          label="Don't show"
                          checked={config?.rules?.sidebarWidget?.enabled !== true}
                          id="dont-show-sidebar"
                          name="sidebar-widget"
                          onChange={() => {
                            const updatedConfig = { ...config }
                            if (!updatedConfig.rules) updatedConfig.rules = {}
                            if (!updatedConfig.rules.sidebarWidget) updatedConfig.rules.sidebarWidget = {}
                            updatedConfig.rules.sidebarWidget.enabled = false
                            setConfig(updatedConfig)
                            setHasUnsavedChanges(true)
                          }}
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
                          onChange={() => handleTriggerOptionChange("timer")}
                        />

                        {triggerOption === "timer" && (
                          <div style={{ paddingLeft: "26px", marginTop: "-8px" }}>
                            <Select
                              label=""
                              labelInline
                              options={delayOptions}
                              value={delayTime}
                              onChange={handleDelayTimeChange}
                              helpText="Set delay on showing popup after the page load."
                            />
                          </div>
                        )}

                        <RadioButton
                          label="Show after scrolling"
                          checked={triggerOption === "scroll"}
                          id="show-scroll"
                          name="trigger"
                          onChange={() => handleTriggerOptionChange("scroll")}
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
                                  onChange={(value) => {
                                    setScrollPercentage(value)
                                    setHasUnsavedChanges(true)
                                  }}
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
                          onChange={() => handleTriggerOptionChange("exit")}
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
                      Number of times the popup will show on browser for non-subscribed customers based on selected
                      time.
                    </Text>

                    <BlockStack gap="100">
                      <RadioButton
                        label="Every time anyone visits"
                        checked={frequencyOption === "every"}
                        id="freq-every"
                        name="frequency"
                        onChange={() => handleFrequencyOptionChange("every")}
                      />

                      <RadioButton
                        label="Limit frequency"
                        checked={frequencyOption === "limit"}
                        id="freq-limit"
                        name="frequency"
                        onChange={() => handleFrequencyOptionChange("limit")}
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
                              onChange={handleFrequencyLimitChange}
                              autoComplete="off"
                            />
                          </div>
                          <Text as="span" variant="bodyMd">
                            Per:
                          </Text>
                          <div style={{ width: "120px" }}>
                            <Select
                              label=""
                              labelHidden
                              options={periodOptions}
                              value={frequencyPeriod}
                              onChange={handleFrequencyPeriodChange}
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
                      Display the popup based on your set rules. <Link url="#">Learn more</Link>.
                    </Text>

                    <BlockStack gap="100">
                      <RadioButton
                        label="Show on any page"
                        checked={pageRuleOption === "any"}
                        id="page-any"
                        name="page-rule"
                        onChange={() => handlePageRuleOptionChange("any")}
                      />

                      <RadioButton
                        label="Show on specific page"
                        checked={pageRuleOption === "specific"}
                        id="page-specific"
                        name="page-rule"
                        onChange={() => handlePageRuleOptionChange("specific")}
                      />

                      {pageRuleOption === "specific" && (
                        <BlockStack gap="400">
                          <InlineStack gap="200">
                            <Button
                              variant={matchOption === "any" ? "primary" : "secondary"}
                              onClick={() => handleMatchOptionChange("any")}
                              size="slim"
                            >
                              Match any
                            </Button>
                            <Button
                              variant={matchOption === "all" ? "primary" : "secondary"}
                              onClick={() => handleMatchOptionChange("all")}
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
                                  onChange={handlePageConditionChange}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <TextField
                                  label=""
                                  labelHidden
                                  type="text"
                                  value={pagePath}
                                  onChange={handlePagePathChange}
                                  placeholder="e.g. /collections/summer"
                                  autoComplete="off"
                                />
                              </div>
                              <Button
                                icon={DeleteIcon}
                                variant="plain"
                                accessibilityLabel="Delete"
                                onClick={() => handlePagePathChange("")}
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
                      Display the popup based on your set rules. <Link url="#">Learn more</Link>.
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
                          <BlockStack gap="300">
                            <TextField
                              label=""
                              value={countryInputValue}
                              onChange={handleCountryInputChange}
                              placeholder="Search countries"
                              autoComplete="off"
                              onFocus={() => setCountryPopoverActive(true)}
                              connectedRight={
                                <Button
                                  onClick={() => {
                                    if (countryInputValue && countryOptions.length > 0) {
                                      handleCountrySelect(countryOptions[0].value)
                                    }
                                  }}
                                  disabled={!countryInputValue || countryOptions.length === 0}
                                >
                                  Add
                                </Button>
                              }
                            />

                            {countryPopoverActive && countryInputValue && (
                              <div
                                style={{
                                  border: "1px solid #c4cdd5",
                                  borderRadius: "3px",
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                  backgroundColor: "white",
                                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                                }}
                              >
                                {countryOptions.map((option) => (
                                  <div
                                    key={option.value}
                                    style={{
                                      padding: "8px 12px",
                                      cursor: "pointer",
                                      backgroundColor: selectedCountryOption === option.value ? "#f4f6f8" : "white",
                                      borderBottom: "1px solid #e4e5e7",
                                    }}
                                    onClick={() => {
                                      handleCountrySelect(option.value)
                                      setCountryPopoverActive(false)
                                    }}
                                    onMouseEnter={() => setSelectedCountryOption(option.value)}
                                  >
                                    {option.label}
                                  </div>
                                ))}
                                {countryOptions.length === 0 && (
                                  <div
                                    style={{
                                      padding: "8px 12px",
                                      color: "#637381",
                                    }}
                                  >
                                    No countries found
                                  </div>
                                )}
                              </div>
                            )}

                            {selectedCountries.length > 0 && (
                              <div style={{ marginTop: "8px" }}>{renderCountryTags(selectedCountries)}</div>
                            )}
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
                          <BlockStack gap="300">
                            <TextField
                              label=""
                              value={countryInputValue}
                              onChange={handleCountryInputChange}
                              placeholder="Search countries"
                              autoComplete="off"
                              onFocus={() => setCountryPopoverActive(true)}
                              connectedRight={
                                <Button
                                  onClick={() => {
                                    if (countryInputValue && countryOptions.length > 0) {
                                      handleCountrySelect(countryOptions[0].value)
                                    }
                                  }}
                                  disabled={!countryInputValue || countryOptions.length === 0}
                                >
                                  Add
                                </Button>
                              }
                            />

                            {countryPopoverActive && countryInputValue && (
                              <div
                                style={{
                                  border: "1px solid #c4cdd5",
                                  borderRadius: "3px",
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                  backgroundColor: "white",
                                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                                }}
                              >
                                {countryOptions.map((option) => (
                                  <div
                                    key={option.value}
                                    style={{
                                      padding: "8px 12px",
                                      cursor: "pointer",
                                      backgroundColor: selectedCountryOption === option.value ? "#f4f6f8" : "white",
                                      borderBottom: "1px solid #e4e5e7",
                                    }}
                                    onClick={() => {
                                      handleCountrySelect(option.value)
                                      setCountryPopoverActive(false)
                                    }}
                                    onMouseEnter={() => setSelectedCountryOption(option.value)}
                                  >
                                    {option.label}
                                  </div>
                                ))}
                                {countryOptions.length === 0 && (
                                  <div
                                    style={{
                                      padding: "8px 12px",
                                      color: "#637381",
                                    }}
                                  >
                                    No countries found
                                  </div>
                                )}
                              </div>
                            )}

                            {excludedCountries.length > 0 && (
                              <div style={{ marginTop: "8px" }}>{renderCountryTags(excludedCountries)}</div>
                            )}
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
                        onChange={() => handleScheduleOptionChange("all-time")}
                      />

                      <RadioButton
                        label="Show between a time period"
                        checked={scheduleOption === "time-period"}
                        id="schedule-time-period"
                        name="schedule-option"
                        onChange={() => handleScheduleOptionChange("time-period")}
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
                                checked={hasEndDate}
                                onChange={() => setHasEndDate(!hasEndDate)}
                              />
                            </div>

                            {/* End date and time */}
                            {hasEndDate && (
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
                <Button pressed={selectedDevice === "desktop"} onClick={() => setSelectedDevice("desktop")}>
                  Desktop
                </Button>
                <Button pressed={selectedDevice === "mobile"} onClick={() => setSelectedDevice("mobile")}>
                  Mobile
                </Button>
              </ButtonGroup>
            </div>

            {/* Preview tabs */}
            <div style={{ marginBottom: "16px" }}>
              <Tabs tabs={previewTabs} selected={selectedPreviewTab} onSelect={handlePreviewTabChange} />
            </div>

            {/* Preview Area */}
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                alignItems: selectedPreviewTab === 2 ? "flex-start" : "center",
                overflow: "auto",
                position: "relative",
              }}
            >
              {/* Start Status - Default Popup */}
              {selectedPreviewTab === 0 && (
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
                        width: "100%",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Claim discount
                    </button>
                    <Button variant="plain" fullWidth>
                      No, thanks
                    </Button>

                    <Text variant="bodySm" as="p" alignment="center">
                      You are signing up to receive communication via email and can unsubscribe at any time.
                    </Text>
                  </BlockStack>
                </div>
              )}

              {/* Success Status */}
              {selectedPreviewTab === 1 && (
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
                    <Button variant="plain">✕</Button>
                  </div>

                  <BlockStack gap="400">
                    <Text variant="heading2xl" as="h2" alignment="center">
                      {config?.content?.success?.heading || "Discount unlocked 🎉"}
                    </Text>
                    <Text variant="bodyLg" as="p" alignment="center">
                      {config?.content?.success?.description ||
                        "Thanks for subscribing. Copy your discount code and apply to your next order."}
                    </Text>

                    <div
                      style={{
                        border: "1px solid #c9cccf",
                        padding: "12px",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <Text as="p" variant="bodyMd" color="subdued">
                        Discount_code
                      </Text>
                      <div
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "1px",
                          }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <button
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        padding: "12px",
                        width: "100%",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginTop: "8px",
                      }}
                    >
                      {config?.content?.actions2?.primaryButtonText || "Shop now"}
                    </button>
                  </BlockStack>
                </div>
              )}

              {/* Sticky Discount Bar */}
              {selectedPreviewTab === 2 && (
                <div
                  style={{
                    backgroundColor: "white",
                    width: "100%",
                    padding: selectedDevice === "desktop" ? "12px 24px" : "12px 16px",
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    flexDirection: selectedDevice === "desktop" ? "row" : "column",
                    gap: selectedDevice === "desktop" ? "16px" : "8px",
                  }}
                >
                  <Text variant="bodyMd" as="p">
                    Don't forget to use your discount code
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: selectedDevice === "desktop" ? "0 0 300px" : "1 1 auto",
                      width: selectedDevice === "desktop" ? "auto" : "100%",
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #c9cccf",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Text as="p" variant="bodyMd" color="subdued">
                        Discount_code
                      </Text>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "1px",
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="plain"
                    icon={
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M15 5L5 15"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5 5L15 15"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    accessibilityLabel="Close"
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: selectedDevice === "desktop" ? "50%" : "8px",
                      transform: selectedDevice === "desktop" ? "translateY(-50%)" : "none",
                    }}
                  />
                </div>
              )}

              {/* Sidebar Widget */}
              {selectedPreviewTab === 3 && (
                <div
                  style={{
                    position: "absolute",
                    [selectedDevice === "desktop" ? "right" : "bottom"]: "20px",
                    [selectedDevice === "desktop" ? "bottom" : "left"]: "20px",
                    backgroundColor: "#333333",
                    color: "white",
                    width: selectedDevice === "desktop" ? "80px" : "100%",
                    borderRadius: selectedDevice === "desktop" ? "4px" : "4px 4px 0 0",
                    overflow: "hidden",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "8px",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Button
                      variant="plain"
                      monochrome
                      icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M15 5L5 15"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5 5L15 15"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                      accessibilityLabel="Close"
                    />
                  </div>
                  <div
                    style={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      textAlign: "center",
                    }}
                  >
                    <Text
                      as="p"
                      variant="bodyMd"
                      color="subdued"
                      style={{
                        color: "white",
                        writingMode: selectedDevice === "desktop" ? "vertical-rl" : "horizontal-tb",
                        transform: selectedDevice === "desktop" ? "rotate(180deg)" : "none",
                      }}
                    >
                      Get 10% OFF
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}
