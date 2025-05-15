"use client"

import { json } from "@remix-run/node"
import { useActionData, useNavigate, useSubmit } from "@remix-run/react"
import type { ActionFunctionArgs } from "@remix-run/node"
import { Modal, useAppBridge } from "@shopify/app-bridge-react"
import { useEffect, useState } from "react"
import { Button, Text } from "@shopify/polaris"
import { createPopup } from "../services/popup.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData()
    const popupType = formData.get("type") as string

    // In a real app, you would get the storeId from the session or context
    const storeId = "cmagd0wb00000rdrik3j0l8bm" // Replace with actual store ID retrieval

    // Convert to the enum type expected by the backend
    const type = popupType === "opt-in" ? "OPT_IN" : "SPIN_WHEEL"

    const newPopup = await createPopup({
      storeId,
      type,
    })

    return json({
      success: true,
      message: "Popup created successfully",
      popup: newPopup,
      redirectTo: `/app/customize/${newPopup.id}`,
    })
  } catch (error) {
    console.error("Error creating popup:", error)
    return json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create popup",
      },
      { status: 500 },
    )
  }
}

export default function CreatePopupPage() {
  const navigate = useNavigate()
  const submit = useSubmit()
  const shopify = useAppBridge()
  const actionData = useActionData<{
    success: boolean
    message: string
    popup?: any
    redirectTo?: string
  }>()

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("opt-in")
  const [isLoading, setIsLoading] = useState(false)

  // Handle redirect after successful popup creation
  useEffect(() => {
    if (actionData?.success && actionData?.redirectTo) {
      navigate(actionData.redirectTo)
    }
  }, [actionData, navigate])

  // Show the modal when this route is loaded
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        shopify.modal.show("template-selection-modal")
      } catch (error) {
        console.error("Failed to show modal:", error)
      }
    }, 50)

    return () => clearTimeout(timeout)
  }, [shopify.modal])

  const handleClose = () => {
    navigate("/app/popups")
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleCreatePopup = () => {
    if (!selectedTemplate) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append("type", selectedTemplate)

    submit(formData, { method: "post" })
  }

  return (
    <Modal id="template-selection-modal" onHide={handleClose}>
      <div style={{ padding: "20px" }}>
        <h2 style={{ marginBottom: "16px" }}>Select template</h2>

        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          {/* Opt-in popup template */}
          <div
            onClick={() => handleSelectTemplate("opt-in")}
            style={{
              width: "250px",
              cursor: "pointer",
              border: selectedTemplate === "opt-in" ? "2px solid #008060" : "1px solid #e1e3e5",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "200px",
                position: "relative",
                backgroundColor: "#f6f6f7",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "85%",
                  height: "80%",
                  backgroundColor: "#ffffff",
                  borderRadius: "4px",
                  border: "1px solid #e1e3e5",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "80%",
                    height: "5px",
                    backgroundColor: "#f4f6f8",
                    margin: "2px 0",
                    borderRadius: "2px",
                  }}
                ></div>
                <div
                  style={{
                    width: "90%",
                    height: "18px",
                    backgroundColor: "#e1e3e5",
                    margin: "5px 0",
                    borderRadius: "2px",
                  }}
                ></div>
                <div
                  style={{
                    width: "70%",
                    height: "14px",
                    backgroundColor: "#3bcdac",
                    margin: "3px 0",
                    borderRadius: "2px",
                  }}
                ></div>
              </div>
            </div>
            <div
              style={{
                padding: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text variant="bodyMd">Opt-in popup</Text>
              {selectedTemplate === "opt-in" && (
                <span
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#f2f7f2",
                    color: "#008060",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  Selected
                </span>
              )}
            </div>
          </div>

          {/* Spin wheel popup template */}
          <div
            onClick={() => handleSelectTemplate("spin-wheel")}
            style={{
              width: "250px",
              cursor: "pointer",
              border: selectedTemplate === "spin-wheel" ? "2px solid #008060" : "1px solid #e1e3e5",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "200px",
                position: "relative",
                backgroundColor: "#f6f6f7",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ width: "90%", height: "90%" }}>
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <circle cx="50" cy="50" r="45" fill="#f4f6f8" stroke="#dfe3e8" strokeWidth="1" />
                  <path d="M50,5 L50,50 L80,20 Z" fill="#3bcdac" />
                  <path d="M50,5 L50,50 L20,20 Z" fill="#69cf9c" />
                  <path d="M95,50 L50,50 L80,20 Z" fill="#45d0b5" />
                  <path d="M95,50 L50,50 L80,80 Z" fill="#3bcdac" />
                  <path d="M50,95 L50,50 L80,80 Z" fill="#69cf9c" />
                  <path d="M50,95 L50,50 L20,80 Z" fill="#45d0b5" />
                  <path d="M5,50 L50,50 L20,80 Z" fill="#3bcdac" />
                  <path d="M5,50 L50,50 L20,20 Z" fill="#69cf9c" />
                  <circle cx="50" cy="50" r="8" fill="#ffffff" stroke="#dfe3e8" strokeWidth="1" />
                </svg>
              </div>
            </div>
            <div
              style={{
                padding: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text variant="bodyMd">Spin wheel popup</Text>
              {selectedTemplate === "spin-wheel" && (
                <span
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#f2f7f2",
                    color: "#008060",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  Selected
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "16px 0",
            borderTop: "1px solid #e1e3e5",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreatePopup} loading={isLoading}>
            Create popup
          </Button>
        </div>
      </div>
    </Modal>
  )
}
