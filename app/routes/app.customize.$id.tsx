
import { json, redirect } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { Modal, useAppBridge } from "@shopify/app-bridge-react"
import { getPopupById, updatePopup } from "../services/popup.server"
import PopupEditor from "./app.customise"
import { useEffect } from "react"

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params

  if (!id) {
    return redirect("/app/popups")
  }

  try {
    const popup = await getPopupById(id)

    if (!popup) {
      throw new Error("Popup not found")
    }

    // Format the popup for the frontend
    const formattedPopup = {
      id: popup.id,
      title: popup.config?.rules?.popupName || `${popup.type} popup`,
      type: popup.type.toLowerCase(),
      isActive: popup.isActive,
      createdAt: new Date(popup.createdAt).toLocaleString(),
      updatedAt: new Date(popup.updatedAt).toLocaleString(),
      config: popup.config,
    }

    return json({ popup: formattedPopup })
  } catch (error) {
    console.error("Error loading popup:", error)
    return redirect("/app/popups")
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { id } = params

  if (!id) {
    return json({ success: false, message: "Popup ID is required" }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const configStr = formData.get("config") as string
    const isActiveStr = formData.get("isActive") as string | null

    if (!configStr) {
      return json({ success: false, message: "Config data is required" }, { status: 400 })
    }

    // Parse the config JSON
    const config = JSON.parse(configStr)

    // Convert isActive string to boolean if provided
    const isActive = isActiveStr ? isActiveStr === "true" : undefined

    // Log the data being sent to the database for debugging
    console.log("Updating popup with ID:", id)
    console.log("Config:", JSON.stringify(config, null, 2))
    console.log("isActive:", isActive)

    // Update the popup using the service function
    await updatePopup({
      id,
      config,
      isActive,
    })

    return json({ success: true, message: "Popup updated successfully" })
  } catch (error) {
    console.error("Error updating popup:", error)
    return json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update popup",
      },
      { status: 500 },
    )
  }
}

export default function CustomizePopupPage() {
  const { popup } = useLoaderData<{ popup: any }>()
  const navigate = useNavigate()
  const shopify = useAppBridge()

  // When this route is loaded directly, we'll show the modal
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        shopify.modal.show("customization-modal")
      } catch (error) {
        console.error("Failed to show modal:", error)
      }
    }, 50)

    return () => clearTimeout(timeout)
  }, [shopify.modal])

  const handleClose = () => {
    navigate("/app/popups")
  }

  return (
    <Modal id="customization-modal" variant="max" onHide={handleClose}>
      <PopupEditor popupId={popup.id} popupData={popup} onClose={handleClose} />
    </Modal>
  )
}
