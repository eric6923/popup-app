import { prisma } from "../app/lib/prisma.server"

// This is a script to seed a popup for testing
async function seedPopup() {
  // Replace 'your-shop-domain.myshopify.com' with your actual shop domain
  const shopDomain = "cart424.myshopify.com"

  // First, check if the store exists
  let store = await prisma.store.findUnique({
    where: { shop: shopDomain },
  })

  if (!store) {
    console.log(`Store ${shopDomain} not found. Creating it...`)
    // Create the store if it doesn't exist
    store = await prisma.store.create({
      data: {
        shop: shopDomain,
        accessToken: "shpua_72dfa433802534661ac6797c30c9adaf", // Replace with actual token in production
      },
    })
  }

  // Create a popup for the store
  const popup = await prisma.popup.create({
    data: {
      storeId: store.id,
      isActive: true,
      config: {
        title: "Special Offer",
        description: "Sign up for our newsletter and get 10% off your first order!",
        buttonText: "Get Discount",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        accentColor: "#4a154b",
        delay: 3000,
      },
    },
  })

  console.log(`Created popup with ID: ${popup.id}`)
  return popup
}

// Run the seed function
seedPopup()
  .then(() => console.log("Seeding completed successfully"))
  .catch((error) => console.error("Error seeding popup:", error))
  .finally(async () => {
    await prisma.$disconnect()
  })
