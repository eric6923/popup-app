import React, { useState, useCallback } from "react";
import {
  Text,
  BlockStack,
  Popover,
  ColorPicker,
  Box,
  TextField
} from '@shopify/polaris';

export default function ColorButton({ label, initialColor, onChange }) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [color, setColor] = useState(initialColor || {
    hue: 120,
    saturation: 1,
    brightness: 1,
  });

  const togglePopover = () => setPopoverActive((prev) => !prev);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (onChange) {
      onChange(newColor);
    }
  };

  const hsbToHex = useCallback(({ hue, saturation, brightness }) => {
    const chroma = brightness * saturation;
    const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = brightness - chroma;
    let [r, g, b] = [0, 0, 0];

    if (hue < 60) [r, g, b] = [chroma, x, 0];
    else if (hue < 120) [r, g, b] = [x, chroma, 0];
    else if (hue < 180) [r, g, b] = [0, chroma, x];
    else if (hue < 240) [r, g, b] = [0, x, chroma];
    else if (hue < 300) [r, g, b] = [x, 0, chroma];
    else [r, g, b] = [chroma, 0, x];

    const toHex = (v) =>
      Math.round((v + m) * 255)
        .toString(16)
        .padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  const hexColor = hsbToHex(color);

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          onClick={togglePopover}
          style={{
            width: "34px",
            height: "24px",
            backgroundColor: hexColor,
            border: "1px solid #ccc",
            borderRadius: "5px",
            marginRight: "10px",
            cursor: "pointer"
          }}
        />
        <Text as="span">{label}</Text>
      </div>
      <Popover
        active={popoverActive}
        activator={<div />} // Empty activator since we're controlling it manually
        onClose={togglePopover}
        preferredPosition="below"
      >
        <Box padding="400">
          <BlockStack gap="300">
            <ColorPicker onChange={handleColorChange} color={color} />
            <Box padding="200" borderColor="border" borderWidth="025" background="bg-surface">
              <TextField
                label=""
                value={hexColor.substring(1)}
                prefix="#"
                monospaced
                autoComplete="off"
              />
            </Box>
          </BlockStack>
        </Box>
      </Popover>
    </div>
  );
}