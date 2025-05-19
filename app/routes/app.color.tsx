import { useState } from "react";
import { Form, useActionData } from "@remix-run/react";

export async function action({ request }: any) {
  const formData = await request.formData();
  const storeDomain = formData.get("store");

  const adminToken = "shpua_72dfa433802534661ac6797c30c9adaf"; // keep it in .env
  const apiVersion = "2023-07";

  try {
    const response = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/locations.json`, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": adminToken!,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }

    const data = await response.json();
    return { locations: data.locations };
  } catch (err: any) {
    return { error: err.message };
  }
}

export default function LocationCheck() {
  const actionData = useActionData<typeof action>();
  const [storeInput, setStoreInput] = useState("");

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-xl rounded-lg mt-10">
      <h2 className="text-xl font-bold mb-4">Shopify Store Location Checker</h2>
      <Form method="post" className="space-y-4">
        <input
          type="text"
          name="store"
          value={storeInput}
          onChange={(e) => setStoreInput(e.target.value)}
          placeholder="Enter store domain (e.g. mystore.myshopify.com)"
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Fetch Locations
        </button>
      </Form>

      {actionData?.error && (
        <p className="text-red-600 mt-4">{actionData.error}</p>
      )}

      {actionData?.locations && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Locations:</h3>
          <ul className="mt-2 space-y-2">
            {actionData.locations.map((loc: any) => (
              <li key={loc.id} className="border p-2 rounded">
                <strong>{loc.name}</strong><br />
                {loc.address1}, {loc.city}, {loc.country}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
