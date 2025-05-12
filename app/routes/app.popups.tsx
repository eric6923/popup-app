"use client"

import { useState, useEffect } from "react"
import { Page, Card, Text, Button, Icon, Modal, Badge, ButtonGroup, FullscreenBar, Banner } from "@shopify/polaris"
import { MenuHorizontalIcon } from "@shopify/polaris-icons"
import { json } from "@remix-run/node"
import { useActionData, useLoaderData, useSubmit, useNavigate } from "@remix-run/react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import modal1 from "./assets/modal1.webp"
import modal2 from "./assets/modal2.webp"
import PopupEditor from "./app.customise"
import { createPopup, getPopupsByStore, updatePopup, deletePopup } from "../services/popup.server"

// Define the type for our popups
type Popup = {
  id: string
  title: string
  type: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  views?: number
  subscribers?: number
  conversionRate?: string
  config: any
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // In a real app, you would get the storeId from the session or context
  const storeId = "cmakq28vd0000rdu9uedh8vwq" // Replace with actual store ID retrieval

  try {
    const popups = await getPopupsByStore(storeId)

    // Format the popups for the frontend
    const formattedPopups = popups.map((popup) => ({
      id: popup.id,
      title: popup.config?.rules?.popupName || `${popup.type} popup`,
      type: popup.type.toLowerCase(),
      isActive: popup.isActive,
      createdAt: new Date(popup.createdAt).toLocaleString(),
      updatedAt: new Date(popup.updatedAt).toLocaleString(),
      views: 0, // These would come from analytics in a real app
      subscribers: 0,
      conversionRate: "0%",
      config: popup.config,
    }))

    return json({ popups: formattedPopups })
  } catch (error) {
    console.error("Error loading popups:", error)
    return json({ popups: [], error: "Failed to load popups" })
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")

  // In a real app, you would get the storeId from the session or context
  const storeId = "cmakq28vd0000rdu9uedh8vwq" // Replace with actual store ID retrieval

  try {
    if (intent === "create") {
      const popupType = formData.get("type") as string
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
    } else if (intent === "toggle") {
      const id = formData.get("id") as string
      const isActive = formData.get("isActive") === "true"

      await updatePopup({
        id,
        isActive: !isActive,
      })

      return json({ success: true, message: "Popup status updated" })
    } else if (intent === "delete") {
      const id = formData.get("id") as string

      await deletePopup(id)

      return json({ success: true, message: "Popup deleted" })
    }

    return json({ success: false, message: "Unknown action" })
  } catch (error) {
    console.error("Error performing action:", error)
    return json({ success: false, message: "An error occurred" })
  }
}

export default function PopupLibraryPage() {
  const loaderData = useLoaderData<{ popups: Popup[]; error?: string }>()
  const actionData = useActionData<{ success: boolean; message: string; popup?: any; redirectTo?: string }>()
  const submit = useSubmit()
  const navigate = useNavigate()
  // const transition = useTransition()

  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [customizingPopupId, setCustomizingPopupId] = useState<string | null>(null)
  const [popups, setPopups] = useState<Popup[]>([])
  const [error, setError] = useState<string | null>(null)

  // Initialize popups from loader data
  useEffect(() => {
    if (loaderData?.popups) {
      setPopups(loaderData.popups)
    }
    if (loaderData?.error) {
      setError(loaderData.error)
    }
  }, [loaderData])

  // Handle redirect after successful popup creation
  useEffect(() => {
    if (actionData?.success && actionData?.redirectTo) {
      navigate(actionData.redirectTo)
    }
  }, [actionData, navigate])

  // Update loading state based on transition
  // useEffect(() => {
  //   setIsLoading(transition.state === "submitting")
  // }, [transition])

  const templates = [
    {
      id: "opt-in",
      name: "Opt-in popup",
      current: true,
    },
    {
      id: "spin-wheel",
      name: "Spin wheel popup",
      current: false,
    },
  ]

  const handleCustomize = (id: string) => {
    setCustomizingPopupId(id)
  }

  const handleCloseCustomize = () => {
    setCustomizingPopupId(null)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    // Default to first template
    setSelectedTemplate(templates[0].id)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleCreatePopup = () => {
    if (!selectedTemplate) return

    const formData = new FormData()
    formData.append("intent", "create")
    formData.append("type", selectedTemplate)

    submit(formData, { method: "post" })
    setIsModalOpen(false)
  }

  const handleToggleActive = (popup: Popup) => {
    const formData = new FormData()
    formData.append("intent", "toggle")
    formData.append("id", popup.id)
    formData.append("isActive", String(popup.isActive))

    submit(formData, { method: "post" })
  }

  const handleDeletePopup = (id: string) => {
    if (window.confirm("Are you sure you want to delete this popup?")) {
      const formData = new FormData()
      formData.append("intent", "delete")
      formData.append("id", id)

      submit(formData, { method: "post" })
    }
  }

  const renderSpinWheelThumbnail = () => {
    return (
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        <div
          style={{
            position: "relative",
            width: "72px",
            height: "72px",
            backgroundColor: "#f6f6f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px 0 0 4px",
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
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: "0 4px 4px 0",
            borderLeft: "1px solid #e1e3e5",
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "90%",
              height: "6px",
              backgroundColor: "#f4f6f8",
              margin: "3px 0",
              borderRadius: "2px",
            }}
          ></div>
          <div
            style={{
              width: "70%",
              height: "6px",
              backgroundColor: "#f4f6f8",
              margin: "3px 0",
              borderRadius: "2px",
            }}
          ></div>
          <div
            style={{
              width: "80%",
              height: "6px",
              backgroundColor: "#f4f6f8",
              margin: "3px 0",
              borderRadius: "2px",
            }}
          ></div>
          <div
            style={{
              width: "50%",
              height: "12px",
              backgroundColor: "#e1e3e5",
              margin: "3px 0",
              borderRadius: "2px",
            }}
          ></div>
        </div>
      </div>
    )
  }

  const renderOptInThumbnail = () => {
    return (
      <div
        style={{
          backgroundColor: "#f6f6f7",
          borderRadius: "4px",
          height: "100%",
          padding: "8px",
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
    )
  }

  // Template selection modal content
  const renderModalContent = () => {
    return (
      <div>
        <div
          style={{
            display: "flex",
            padding: "16px",
            gap: "16px",
          }}
        >
          {/* Opt-in popup template */}
          <div
            onClick={() => handleSelectTemplate("opt-in")}
            style={{
              width: "510px",
              cursor: "pointer",
              border: selectedTemplate === "opt-in" ? "2px solid #008060" : "1px solid #e1e3e5",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "400px",
                position: "relative",
              }}
            >
              {/* Using a placeholder image for the opt-in popup */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f6f6f7",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={modal1 || "/placeholder.svg"}
                  alt="Opt-in popup template"
                  style={{
                    width: "95%",
                    height: "95%",
                    objectFit: "cover",
                  }}
                />
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
                  Current template
                </span>
              )}
            </div>
          </div>

          {/* Spin wheel popup template */}
          <div
            onClick={() => handleSelectTemplate("spin-wheel")}
            style={{
              width: "510px",
              cursor: "pointer",
              border: selectedTemplate === "spin-wheel" ? "2px solid #008060" : "1px solid #e1e3e5",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "400px",
                position: "relative",
              }}
            >
              {/* Using a placeholder image for the spin wheel popup */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f6f6f7",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={modal2 || "/placeholder.svg"}
                  alt="Spin wheel popup template"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
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
                  Current template
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e1e3e5",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="primary" onClick={handleCreatePopup} loading={isLoading}>
            Create popup
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Page
      fullWidth
      title="Popups"
      primaryAction={{
        content: "Create popup",
        onAction: handleOpenModal,
      }}
    >
      {error && (
        <Banner status="critical">
          <p>{error}</p>
        </Banner>
      )}

      {actionData?.message && !actionData.redirectTo && (
        <Banner status={actionData.success ? "success" : "critical"}>
          <p>{actionData.message}</p>
        </Banner>
      )}

      <Card>
        <div style={{ padding: "0 16px" }}>
          <div style={{ padding: "16px 0" }}>
            <Text as="h2" fontWeight="semibold">
              Popup library
            </Text>
          </div>

          {popups.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <Text as="p" variant="bodyMd">
                No popups found. Create your first popup to get started.
              </Text>
            </div>
          ) : (
            popups.map((popup) => (
              <div
                key={popup.id}
                style={{
                  borderTop: "1px solid #e1e3e5",
                  padding: "16px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "130px",
                    height: "72px",
                    border: "1px solid #e1e3e5",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  {popup.type === "spin_wheel" || popup.type === "spin-wheel"
                    ? renderSpinWheelThumbnail()
                    : renderOptInThumbnail()}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    flex: "1",
                  }}
                >
                  <Text as="h3" fontWeight="medium">
                    {popup.title}
                  </Text>
                  <Text as="p" variant="bodySm">
                    Created: {popup.createdAt}
                  </Text>
                  <Text as="p" variant="bodySm">
                    Last saved: {popup.updatedAt}
                  </Text>
                </div>

                <div
                  style={{
                    width: "150px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <Text as="p" variant="bodyMd">
                    Popup views
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {popup.views || 0}
                  </Text>
                </div>

                <div
                  style={{
                    width: "150px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <Text as="p" variant="bodyMd">
                    Subscribers
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {popup.subscribers || "-"}
                  </Text>
                </div>

                <div
                  style={{
                    width: "150px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <Text as="p" variant="bodyMd">
                    Conversion rate
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {popup.conversionRate || "0%"}
                  </Text>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <label
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "36px",
                      height: "20px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={popup.isActive}
                      onChange={() => handleToggleActive(popup)}
                      style={{
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: popup.isActive ? "#3bcdac" : "#e1e3e5",
                        borderRadius: "10px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: '""',
                          height: "16px",
                          width: "16px",
                          left: popup.isActive ? "17px" : "2px",
                          bottom: "2px",
                          backgroundColor: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      ></span>
                    </span>
                  </label>

                  <Button onClick={() => handleCustomize(popup.id)} variant="primary">
                    Customize
                  </Button>

                  <button
                    onClick={() => handleDeletePopup(popup.id)}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon source={MenuHorizontalIcon} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Template Selection Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal} title="Select template" size="large">
        {renderModalContent()}
      </Modal>

      {/* Customization Modal */}
      {customizingPopupId && (
        <Modal open={true} onClose={handleCloseCustomize} title="" size="fullScreen" noScroll>
          <div style={{ height: "100vh" }}>
            <FullscreenBar onAction={handleCloseCustomize}>
              <div
                style={{
                  display: "flex",
                  flexGrow: 1,
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                }}
              >
                <Badge tone="info">Unpublished</Badge>
                <div style={{ marginLeft: "1rem", flexGrow: 1 }}>
                  <Text variant="headingLg" as="p">
                    {popups.find((p) => p.id === customizingPopupId)?.title || "Popup Editor"}
                  </Text>
                </div>
                <ButtonGroup>
                  <Button onClick={() => console.log("Need help clicked")}>Need help?</Button>
                  <Button variant="primary" onClick={() => console.log("Preview clicked")}>
                    Preview this popup
                  </Button>
                </ButtonGroup>
              </div>
            </FullscreenBar>
            <PopupEditor
              popupId={customizingPopupId}
              onClose={handleCloseCustomize}
              popupData={popups.find((p) => p.id === customizingPopupId)}
            />
          </div>
        </Modal>
      )}
    </Page>
  )
}
