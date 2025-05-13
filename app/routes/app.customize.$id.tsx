import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
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

  return <PopupEditor popupId={popup.id} popupData={popup} />
}
