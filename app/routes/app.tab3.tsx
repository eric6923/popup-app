"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Card,
  Select,
  RangeSlider,
  DropZone,
  Text,
  BlockStack,
  InlineStack,
  Divider,
  TextField,
  Thumbnail,
  Button,
} from "@shopify/polaris"
import ColorButton from "./app.color"

export default function Tab3({ config, setConfig, setHasUnsavedChanges }) {
  // Helper function to parse color from hex to HSB
  const parseColor = useCallback((hexColor) => {
    if (!hexColor || typeof hexColor !== "string") {
      return {
        hue: 0,
        brightness: 0,
        saturation: 0,
        alpha: 1,
      }
    }

    // Remove # if present
    hexColor = hexColor.replace("#", "")

    // Parse hex to RGB
    const r = Number.parseInt(hexColor.substring(0, 2), 16) / 255
    const g = Number.parseInt(hexColor.substring(2, 4), 16) / 255
    const b = Number.parseInt(hexColor.substring(4, 6), 16) / 255

    // Convert RGB to HSB
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min

    let h = 0
    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta) % 6
      } else if (max === g) {
        h = (b - r) / delta + 2
      } else {
        h = (r - g) / delta + 4
      }
    }

    h = Math.round(h * 60)
    if (h < 0) h += 360

    const s = max === 0 ? 0 : delta / max
    const v = max

    return {
      hue: h,
      saturation: s,
      brightness: v,
      alpha: 1,
    }
  }, [])

  // Initialize state from config if available
  const [logoUrl, setLogoUrl] = useState(config?.style?.logo?.url || "")
  const [logoWidth, setLogoWidth] = useState(config?.style?.logo?.width || 35)
  const [size, setSize] = useState(config?.style?.display?.size || "Standard")
  const [alignment, setAlignment] = useState(config?.style?.display?.alignment || "Center")
  const [cornerRadius, setCornerRadius] = useState(config?.style?.display?.cornor_Radius || "Standard")
  const [imagePosition, setImagePosition] = useState(config?.style?.layout || "None")
  const [imageUrl, setImageUrl] = useState(config?.style?.image || "")
  const [imageWidth, setImageWidth] = useState(config?.style?.imageWidth || 35) // Added for image width control
  const [cssCode, setCssCode] = useState(config?.style?.customCss || "")
  const [isUploading, setIsUploading] = useState(false)

  // Color states with defaults from config
  const [popupBackground, setPopupBackground] = useState(
    config?.style?.colors?.popup?.backgroud
      ? parseColor(config.style.colors.popup.backgroud)
      : {
          hue: 0,
          brightness: 1,
          saturation: 0,
          alpha: 1,
        },
  )

  const [headingColor, setHeadingColor] = useState(
    config?.style?.colors?.text?.heading
      ? parseColor(config.style.colors.text.heading)
      : {
          hue: 0,
          brightness: 0,
          saturation: 0,
          alpha: 1,
        },
  )

  const [descriptionColor, setDescriptionColor] = useState(
    config?.style?.colors?.text?.description
      ? parseColor(config.style.colors.text.description)
      : {
          hue: 0,
          brightness: 0.29,
          saturation: 0,
          alpha: 1,
        },
  )

  const [inputColor, setInputColor] = useState(
    config?.style?.colors?.text?.input
      ? parseColor(config.style.colors.text.input)
      : {
          hue: 0,
          brightness: 0,
          saturation: 0,
          alpha: 1,
        },
  )

  const [consentColor, setConsentColor] = useState(
    config?.style?.colors?.text?.consent
      ? parseColor(config.style.colors.text.consent)
      : {
          hue: 0,
          brightness: 0.29,
          saturation: 0,
          alpha: 1,
        },
  )

  const [errorColor, setErrorColor] = useState(
    config?.style?.colors?.text?.error
      ? parseColor(config.style.colors.text.error)
      : {
          hue: 0,
          brightness: 1,
          saturation: 1,
          alpha: 1,
        },
  )

  const [footerTextColor, setFooterTextColor] = useState(
    config?.style?.colors?.text?.footerText
      ? parseColor(config.style.colors.text.footerText)
      : {
          hue: 0,
          brightness: 0.29,
          saturation: 0,
          alpha: 1,
        },
  )

  const [labelColor, setLabelColor] = useState(
    config?.style?.colors?.text?.label
      ? parseColor(config.style.colors.text.label)
      : {
          hue: 0,
          brightness: 0,
          saturation: 0,
          alpha: 1,
        },
  )

  const [primaryButtonBg, setPrimaryButtonBg] = useState(
    config?.style?.colors?.primaryButton?.background
      ? parseColor(config.style.colors.primaryButton.background)
      : {
          hue: 0,
          brightness: 0,
          saturation: 0,
          alpha: 1,
        },
  )

  const [primaryButtonText, setPrimaryButtonText] = useState(
    config?.style?.colors?.primaryButton?.text
      ? parseColor(config.style.colors.primaryButton.text)
      : {
          hue: 0,
          brightness: 1,
          saturation: 0,
          alpha: 1,
        },
  )

  const [secondaryButtonText, setSecondaryButtonText] = useState(
    config?.style?.colors?.secondaryButton?.text
      ? parseColor(config.style.colors.secondaryButton.text)
      : {
          hue: 240,
          brightness: 0.8,
          saturation: 1,
          alpha: 1,
        },
  )

  const [stickyDiscountBarBg, setStickyDiscountBarBg] = useState(
    config?.style?.colors?.stickyDiscountBar?.background
      ? parseColor(config.style.colors.stickyDiscountBar.background)
      : {
          hue: 0,
          brightness: 1,
          saturation: 0,
          alpha: 1,
        },
  )

  const [stickyDiscountBarText, setStickyDiscountBarText] = useState(
    config?.style?.colors?.stickyDiscountBar?.text
      ? parseColor(config.style.colors.stickyDiscountBar.text)
      : {
          hue: 0,
          brightness: 0,
          saturation: 0,
          alpha: 1,
        },
  )

  const [sidebarWidgetBg, setSidebarWidgetBg] = useState(
    config?.style?.colors?.sidebarWidget?.background
      ? parseColor(config.style.colors.sidebarWidget.background)
      : {
          hue: 0,
          brightness: 0,
          saturation: 0,
          alpha: 1,
        },
  )

  const [sidebarWidgetText, setSidebarWidgetText] = useState(
    config?.style?.colors?.sidebarWidget?.text
      ? parseColor(config.style.colors.sidebarWidget.text)
      : {
          hue: 0,
          brightness: 1,
          saturation: 0,
          alpha: 1,
        },
  )

  // Helper function to convert HSB to hex
  const hsbToHex = useCallback(({ hue, saturation, brightness }) => {
    const chroma = brightness * saturation
    const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
    const m = brightness - chroma
    let [r, g, b] = [0, 0, 0]

    if (hue < 60) [r, g, b] = [chroma, x, 0]
    else if (hue < 120) [r, g, b] = [x, chroma, 0]
    else if (hue < 180) [r, g, b] = [0, chroma, x]
    else if (hue < 240) [r, g, b] = [0, x, chroma]
    else if (hue < 300) [r, g, b] = [x, 0, chroma]
    else [r, g, b] = [chroma, 0, x]

    const toHex = (v) =>
      Math.round((v + m) * 255)
        .toString(16)
        .padStart(2, "0")

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }, [])

  // Update parent config when any style setting changes
  useEffect(() => {
    if (!config || !setConfig) return

    const updatedConfig = {
      ...config,
      style: {
        logo: {
          url: logoUrl,
          width: logoWidth,
        },
        display: {
          size: size,
          alignment: alignment,
          cornor_Radius: cornerRadius,
        },
        layout: imagePosition,
        image: imageUrl,
        imageWidth: imageWidth, // Added image width to config
        colors: {
          popup: {
            backgroud: hsbToHex(popupBackground),
          },
          text: {
            heading: hsbToHex(headingColor),
            description: hsbToHex(descriptionColor),
            input: hsbToHex(inputColor),
            consent: hsbToHex(consentColor),
            error: hsbToHex(errorColor),
            footerText: hsbToHex(footerTextColor),
            label: hsbToHex(labelColor),
          },
          primaryButton: {
            background: hsbToHex(primaryButtonBg),
            text: hsbToHex(primaryButtonText),
          },
          secondaryButton: {
            text: hsbToHex(secondaryButtonText),
          },
          stickyDiscountBar: {
            background: hsbToHex(stickyDiscountBarBg),
            text: hsbToHex(stickyDiscountBarText),
          },
          sidebarWidget: {
            background: hsbToHex(sidebarWidgetBg),
            text: hsbToHex(sidebarWidgetText),
          },
        },
        customCss: cssCode,
      },
    }

    setConfig(updatedConfig)
  }, [
    logoUrl,
    logoWidth,
    size,
    alignment,
    cornerRadius,
    imagePosition,
    imageUrl,
    imageWidth, // Added to dependency array
    cssCode,
    popupBackground,
    headingColor,
    descriptionColor,
    inputColor,
    consentColor,
    errorColor,
    footerTextColor,
    labelColor,
    primaryButtonBg,
    primaryButtonText,
    secondaryButtonText,
    stickyDiscountBarBg,
    stickyDiscountBarText,
    sidebarWidgetBg,
    sidebarWidgetText,
    config,
    setConfig,
    hsbToHex,
  ])

  // Event handlers with change tracking
  const handleLogoWidthChange = useCallback(
    (value) => {
      setLogoWidth(value)
      if (setHasUnsavedChanges) setHasUnsavedChanges(true)
    },
    [setHasUnsavedChanges],
  )

  // Added handler for image width
  const handleImageWidthChange = useCallback(
    (value) => {
      setImageWidth(value)
      if (setHasUnsavedChanges) setHasUnsavedChanges(true)
    },
    [setHasUnsavedChanges],
  )

  const handleSizeChange = useCallback(
    (value) => {
      setSize(value)
      if (setHasUnsavedChanges) setHasUnsavedChanges(true)
    },
    [setHasUnsavedChanges],
  )

  const handleAlignmentChange = useCallback(
    (value) => {
      setAlignment(value)
      if (setHasUnsavedChanges) setHasUnsavedChanges(true)
    },
    [setHasUnsavedChanges],
  )

  const handleCornerRadiusChange = useCallback(
    (value) => {
      setCornerRadius(value)
      if (setHasUnsavedChanges) setHasUnsavedChanges(true)
    },
    [setHasUnsavedChanges],
  )

  const handleImagePositionChange = useCallback(
    (value) => {
      setImagePosition(value)
      if (setHasUnsavedChanges) setHasUnsavedChanges(true)
    },
    [setHasUnsavedChanges],
  )

  const handleCssCodeChange = useCallback(
    (value) => {
      setCssCode(value)
      if (setHasUnsavedChanges) setHasUnsavedChanges(true)
    },
    [setHasUnsavedChanges],
  )

  // Cloudinary upload function
  const uploadToCloudinary = useCallback(
    async (file, type = "image") => {
      setIsUploading(true)

      // Create a FormData instance
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "E-Rickshaw") // Replace with your Cloudinary upload preset

      try {
        // Upload to Cloudinary
        const response = await fetch("https://api.cloudinary.com/v1_1/dm8jxispy/image/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.secure_url) {
          if (type === "logo") {
            setLogoUrl(data.secure_url)
          } else {
            setImageUrl(data.secure_url)
          }
          if (setHasUnsavedChanges) setHasUnsavedChanges(true)
        }
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error)
      } finally {
        setIsUploading(false)
      }
    },
    [setHasUnsavedChanges],
  )

  // Handle file drops
  const handleLogoDrop = useCallback(
    ([file]) => {
      if (file) {
        uploadToCloudinary(file, "logo")
      }
    },
    [uploadToCloudinary],
  )

  const handleImageDrop = useCallback(
    ([file]) => {
      if (file) {
        uploadToCloudinary(file, "image")
      }
    },
    [uploadToCloudinary],
  )

  // Updated dropdown options
  const sizeOptions = [
    { label: "Standard", value: "Standard" },
    { label: "Small", value: "Small" },
    { label: "Large", value: "Large" },
  ]

  const alignmentOptions = [
    { label: "Left", value: "Left" },
    { label: "Center", value: "Center" },
    { label: "Right", value: "Right" },
  ]

  const cornerRadiusOptions = [
    { label: "None", value: "None" },
    { label: "Standard", value: "Standard" },
    { label: "Large", value: "Large" },
  ]

  const imagePositionOptions = [
    { label: "None", value: "None" },
    { label: "Left", value: "Left" },
    { label: "Right", value: "Right" },
    { label: "Background", value: "Background" },
  ]

  // Handle color changes with unsaved changes tracking
  const handleColorChange = useCallback(
    (setter) => (newColor) => {
      setter(newColor)
      if (setHasUnsavedChanges) setHasUnsavedChanges(true)
    },
    [setHasUnsavedChanges],
  )

  return (
    <BlockStack gap="400">
      {/* Logo Section */}
      <BlockStack gap="400">
        <Text as="p" variant="headingMd">
          Logo
        </Text>
        <Text as="p" variant="bodyMd">
          Less than 2MB; Accepts .jpg, .png, .gif, .jpeg.
        </Text>

        <Card>
          <BlockStack gap="400">
            {logoUrl ? (
              <div style={{ padding: "16px" }}>
                <InlineStack gap="400" align="center">
                  <Thumbnail source={logoUrl} alt="Logo" size="large" />
                  <Button onClick={() => setLogoUrl("")} size="slim">
                    Remove
                  </Button>
                </InlineStack>
              </div>
            ) : (
              <DropZone accept="image/*" type="image" outline={false} onDrop={handleLogoDrop} disabled={isUploading}>
                <DropZone.FileUpload actionHint="Accepts .jpg, .png, .gif, .jpeg." />
              </DropZone>
            )}
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
        <Text as="p" variant="headingMd">
          Display
        </Text>

        <BlockStack gap="400">
          <BlockStack gap="200">
            <Text as="p">Size</Text>
            <Select label="" options={sizeOptions} value={size} onChange={handleSizeChange} />
          </BlockStack>

          <BlockStack gap="200">
            <Text as="p">Alignment</Text>
            <Select label="" options={alignmentOptions} value={alignment} onChange={handleAlignmentChange} />
          </BlockStack>

          <BlockStack gap="200">
            <Text as="p">Corner radius</Text>
            <Select label="" options={cornerRadiusOptions} value={cornerRadius} onChange={handleCornerRadiusChange} />
          </BlockStack>
        </BlockStack>
      </BlockStack>

      <Divider />

      {/* Layout Card */}
      <BlockStack gap="400">
        <Text as="p" variant="headingMd">
          Layout
        </Text>

        <BlockStack gap="200">
          <Text as="p">Image position</Text>
          <Select label="" options={imagePositionOptions} value={imagePosition} onChange={handleImagePositionChange} />
        </BlockStack>
      </BlockStack>

      <Divider />

      {/* Image Card */}
      <BlockStack gap="400">
        <Text as="p" variant="headingMd">
          Image
        </Text>
        <Text as="p" variant="bodyMd">
          Less than 2MB; Accepts .jpg, .png, .gif, .jpeg, recommended: 600 x 400 pixels.
        </Text>

        <Card>
          {imageUrl ? (
            <div style={{ padding: "16px" }}>
              <InlineStack gap="400" align="center">
                <Thumbnail source={imageUrl} alt="Popup image" size="large" />
                <Button onClick={() => setImageUrl("")} size="slim">
                  Remove
                </Button>
              </InlineStack>
            </div>
          ) : (
            <DropZone accept="image/*" type="image" outline={false} onDrop={handleImageDrop} disabled={isUploading}>
              <DropZone.FileUpload actionHint="Accepts .jpg, .png, .gif, .jpeg." />
            </DropZone>
          )}
        </Card>

        {/* Added image width slider */}
        {imageUrl && (
          <BlockStack gap="200">
            <RangeSlider
              output
              label="Image width"
              min={10}
              max={100}
              value={imageWidth}
              onChange={handleImageWidthChange}
              suffix={<Text as="p">{imageWidth}%</Text>}
            />
          </BlockStack>
        )}
      </BlockStack>

      <Divider />

      {/* Colors Section - Using imported ColorButton component */}
      <div style={{ padding: "16px" }}>
        <Text as="h2" variant="headingMd" fontWeight="bold">
          Colors
        </Text>

        {/* POPUP */}
        <div style={{ marginTop: "16px", marginBottom: "16px" }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">
            POPUP
          </Text>
          <div style={{ display: "flex", marginTop: "8px" }}>
            <ColorButton
              label="Background"
              initialColor={popupBackground}
              onChange={handleColorChange(setPopupBackground)}
            />
          </div>
        </div>

        {/* TEXT */}
        <div style={{ marginBottom: "16px" }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">
            TEXT
          </Text>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
            <ColorButton label="Heading" initialColor={headingColor} onChange={handleColorChange(setHeadingColor)} />
            <ColorButton
              label="Description"
              initialColor={descriptionColor}
              onChange={handleColorChange(setDescriptionColor)}
            />
            <ColorButton label="Input" initialColor={inputColor} onChange={handleColorChange(setInputColor)} />
            <ColorButton label="Consent" initialColor={consentColor} onChange={handleColorChange(setConsentColor)} />
            <ColorButton label="Error" initialColor={errorColor} onChange={handleColorChange(setErrorColor)} />
            <ColorButton
              label="Footer text"
              initialColor={footerTextColor}
              onChange={handleColorChange(setFooterTextColor)}
            />
            <ColorButton label="Label" initialColor={labelColor} onChange={handleColorChange(setLabelColor)} />
          </div>
        </div>

        {/* PRIMARY BUTTON */}
        <div style={{ marginBottom: "16px" }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">
            PRIMARY BUTTON
          </Text>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
            <ColorButton
              label="Background"
              initialColor={primaryButtonBg}
              onChange={handleColorChange(setPrimaryButtonBg)}
            />
            <ColorButton
              label="Text"
              initialColor={primaryButtonText}
              onChange={handleColorChange(setPrimaryButtonText)}
            />
          </div>
        </div>

        {/* SECONDARY BUTTON */}
        <div style={{ marginBottom: "16px" }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">
            SECONDARY BUTTON
          </Text>
          <div style={{ marginTop: "8px" }}>
            <ColorButton
              label="Text"
              initialColor={secondaryButtonText}
              onChange={handleColorChange(setSecondaryButtonText)}
            />
          </div>
        </div>

        {/* STICKY DISCOUNT BAR */}
        <div style={{ marginBottom: "16px" }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">
            STICKY DISCOUNT BAR
          </Text>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
            <ColorButton
              label="Background"
              initialColor={stickyDiscountBarBg}
              onChange={handleColorChange(setStickyDiscountBarBg)}
            />
            <ColorButton
              label="Text"
              initialColor={stickyDiscountBarText}
              onChange={handleColorChange(setStickyDiscountBarText)}
            />
          </div>
        </div>

        {/* SIDEBAR WIDGET */}
        <div style={{ marginBottom: "16px" }}>
          <Text as="p" variant="bodyMd" fontWeight="bold">
            SIDEBAR WIDGET
          </Text>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
            <ColorButton
              label="Background"
              initialColor={sidebarWidgetBg}
              onChange={handleColorChange(setSidebarWidgetBg)}
            />
            <ColorButton
              label="Text"
              initialColor={sidebarWidgetText}
              onChange={handleColorChange(setSidebarWidgetText)}
            />
          </div>
        </div>

        <Divider />

        {/* CSS Section */}
        <div style={{ marginTop: "16px" }}>
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="bold">
              CSS
            </Text>
            <Text as="p" variant="bodySm">
              Add CSS codes here to do some custom change, this won't influence your store theme.
            </Text>
            <TextField label="" value={cssCode} onChange={handleCssCodeChange} multiline={6} autoComplete="off" />
          </BlockStack>
        </div>
      </div>
    </BlockStack>
  )
}
