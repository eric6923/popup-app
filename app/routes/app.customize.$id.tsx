import { json, redirect } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { getPopupById } from "../services/popup.server"
import PopupEditor from "./app.customise"

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

export default function CustomizePopupPage() {
  const { popup } = useLoaderData<{ popup: any }>()
  const navigate = useNavigate()

  const handleClose = () => {
    navigate("/app/popups")
  }

  return (
    <div style={{ height: "100vh" }}>
      <PopupEditor popupId={popup.id} onClose={handleClose} popupData={popup} />
    </div>
  )
}
