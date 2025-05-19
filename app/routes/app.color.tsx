"use client"

import { useState, useRef, useEffect } from "react"
import { Button, ColorPicker, TextField } from "@shopify/polaris"

export default function ColorButton({ label, initialColor, onChange }) {
  const [popoverActive, setPopoverActive] = useState(false)
  const [color, setColor] = useState(initialColor || { hue: 0, brightness: 1, saturation: 1, alpha: 1 })
  const buttonRef = useRef(null)
  const popoverRef = useRef(null)

  // Proper HSBA to RGBA conversion
  const hsbaToRgba = (hsba) => {
    let { hue, saturation, brightness, alpha } = hsba
    
    // Ensure values are in correct ranges
    hue = hue % 360
    saturation = Math.min(1, Math.max(0, saturation))
    brightness = Math.min(1, Math.max(0, brightness))
    alpha = Math.min(1, Math.max(0, alpha))

    let r, g, b
    const i = Math.floor(hue / 60)
    const f = hue / 60 - i
    const p = brightness * (1 - saturation)
    const q = brightness * (1 - f * saturation)
    const t = brightness * (1 - (1 - f) * saturation)

    switch (i % 6) {
      case 0: r = brightness; g = t; b = p; break
      case 1: r = q; g = brightness; b = p; break
      case 2: r = p; g = brightness; b = t; break
      case 3: r = p; g = q; b = brightness; break
      case 4: r = t; g = p; b = brightness; break
      case 5: r = brightness; g = p; b = q; break
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: alpha
    }
  }

  // Convert RGBA object to CSS string
  const rgbaToCss = (rgba) => {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
  }

  // Convert RGBA to Hex
  const rgbaToHex = (rgba) => {
    const toHex = (value) => {
      const hex = Math.round(value).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`
  }

  const handleColorChange = (hsba) => {
    setColor(hsba)
    if (onChange) onChange(hsba)
  }

  const togglePopover = () => {
    setPopoverActive(!popoverActive)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverActive &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setPopoverActive(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [popoverActive])

  const rgbaColor = hsbaToRgba(color)
  const cssColor = rgbaToCss(rgbaColor)
  const hexColor = rgbaToHex(rgbaColor)

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
        <div
          ref={buttonRef}
          onClick={togglePopover}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "4px",
            padding: "8px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "24px",
              backgroundColor: cssColor,
              borderRadius: "4px",
              border: "1px solid #dde0e4",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px" }}>{label}</div>
            {/* <div style={{ fontSize: "12px", color: "#637381" }}>{hexColor}</div> */}
          </div>
        </div>
      </div>

      {popoverActive && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            zIndex: 1000,
            top: "100%",
            left: 0,
            marginTop: "8px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(63, 63, 68, 0.15)",
            padding: "16px",
            width: "240px",
          }}
        >
          <ColorPicker onChange={handleColorChange} color={color} />
          <div style={{ marginTop: "16px" }}>
            <TextField label="Hex color" value={hexColor} onChange={() => {}} autoComplete="off" />
          </div>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={togglePopover}>Done</Button>
          </div>
        </div>
      )}
    </div>
  )
}