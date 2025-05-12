
import { useState, useEffect } from "react"
import { Page, Tabs, Card, Text, Button, FormLayout, TextField, Select, Checkbox } from "@shopify/polaris"
import { useSubmit } from "@remix-run/react"
import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { updatePopup } from "../services/popup.server"

// Define the type for our popup data
type PopupData = {
  id: string
  title: string
  type: string
  isActive: boolean
  config: any
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const id = formData.get("id") as string
  const configStr = formData.get("config") as string

  try {
    const config = JSON.parse(configStr)

    await updatePopup({
      id,
      config,
    })

    return json({ success: true, message: "Popup updated successfully" })
  } catch (error) {
    console.error("Error updating popup:", error)
    return json({ success: false, message: "Failed to update popup" })
  }
}

export default function PopupEditor({
  popupId,
  onClose,
  popupData,
}: {
  popupId: string
  onClose: () => void
  popupData?: PopupData
}) {
  const submit = useSubmit()
  const [selectedTab, setSelectedTab] = useState(0)
  const [config, setConfig] = useState<any>(null)
  const [popupName, setPopupName] = useState("")
  const [triggerType, setTriggerType] = useState("")
  const [delayType, setDelayType] = useState("")
  const [delaySeconds, setDelaySeconds] = useState("")
  const [exitEnabled, setExitEnabled] = useState(false)
  const [frequencyType, setFrequencyType] = useState("")

  // Initialize form values from popup data
  useEffect(() => {
    if (popupData?.config) {
      setConfig(popupData.config)

      // Set form values from config
      const rules = popupData.config.rules
      setPopupName(rules.popupName || "")
      setTriggerType(rules.trigger?.type || "TIMER")
      setDelayType(rules.trigger?.timerOption?.delayType || "AFTER_DELAY")
      setDelaySeconds(String(rules.trigger?.timerOption?.delaySeconds || 3))
      setExitEnabled(rules.trigger?.exitOption?.enabled || false)
      setFrequencyType(rules.frequency?.type || "ALWAYS")
    }
  }, [popupData])

  const handleSave = () => {
    if (!config) return

    // Update config with current form values
    const updatedConfig = {
      ...config,
      rules: {
        ...config.rules,
        popupName,
        trigger: {
          ...config.rules.trigger,
          type: triggerType,
          timerOption: {
            ...config.rules.trigger.timerOption,
            delayType,
            delaySeconds: Number(delaySeconds),
          },
          exitOption: {
            ...config.rules.trigger.exitOption,
            enabled: exitEnabled,
          },
        },
        frequency: {
          ...config.rules.frequency,
          type: frequencyType,
        },
      },
    }

    const formData = new FormData()
    formData.append("id", popupId)
    formData.append("config", JSON.stringify(updatedConfig))

    submit(formData, { method: "post" })
  }

  const tabs = [
    {
      id: "rules",
      content: "Rules",
      accessibilityLabel: "Rules",
      panelID: "rules-panel",
    },
    {
      id: "content",
      content: "Content",
      accessibilityLabel: "Content",
      panelID: "content-panel",
    },
    {
      id: "style",
      content: "Style",
      accessibilityLabel: "Style",
      panelID: "style-panel",
    },
  ]

  const handleTabChange = (selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex)
  }

  // Render loading state if config is not yet loaded
  if (!config) {
    return (
      <Page>
        <Card>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <Text as="p">Loading popup configuration...</Text>
          </div>
        </Card>
      </Page>
    )
  }

  return (
    <Page fullWidth>
      <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />

      <div style={{ padding: "1rem" }}>
        {selectedTab === 0 && (
          <Card>
            <div style={{ padding: "1rem" }}>
              <FormLayout>
                <TextField label="Popup Name" value={popupName} onChange={setPopupName} autoComplete="off" />

                <Select
                  label="Trigger Type"
                  options={[
                    { label: "Timer", value: "TIMER" },
                    { label: "Scroll", value: "SCROLL" },
                    { label: "Exit Intent", value: "EXIT_INTENT" },
                  ]}
                  value={triggerType}
                  onChange={setTriggerType}
                />

                {triggerType === "TIMER" && (
                  <>
                    <Select
                      label="Delay Type"
                      options={[
                        { label: "After Delay", value: "AFTER_DELAY" },
                        { label: "Immediately", value: "IMMEDIATELY" },
                      ]}
                      value={delayType}
                      onChange={setDelayType}
                    />

                    {delayType === "AFTER_DELAY" && (
                      <TextField
                        label="Delay (seconds)"
                        type="number"
                        value={delaySeconds}
                        onChange={setDelaySeconds}
                        autoComplete="off"
                      />
                    )}
                  </>
                )}

                <Checkbox label="Enable Exit Intent" checked={exitEnabled} onChange={setExitEnabled} />

                <Select
                  label="Frequency"
                  options={[
                    { label: "Always", value: "ALWAYS" },
                    { label: "Once per session", value: "ONCE_PER_SESSION" },
                    { label: "Once per visitor", value: "ONCE_PER_VISITOR" },
                  ]}
                  value={frequencyType}
                  onChange={setFrequencyType}
                />

                <div style={{ marginTop: "1rem" }}>
                  <Button variant="primary" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </FormLayout>
            </div>
          </Card>
        )}

        {selectedTab === 1 && (
          <Card>
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <Text as="p">Content configuration will be implemented here.</Text>
              <Text as="p" variant="bodySm">
                This tab will contain fields for customizing the popup content based on the popup type.
              </Text>
            </div>
          </Card>
        )}

        {selectedTab === 2 && (
          <Card>
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <Text as="p">Style configuration will be implemented here.</Text>
              <Text as="p" variant="bodySm">
                This tab will contain fields for customizing the popup appearance.
              </Text>
            </div>
          </Card>
        )}
      </div>
    </Page>
  )
}
