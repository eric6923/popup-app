import { JsonObject, JsonArray } from "@prisma/client/runtime/library"
import { authenticate } from "../shopify.server"

export class MetaobjectService {
  async createMetaObjectDefinition(request: Request) {
    const { admin } = await authenticate.admin(request)

    console.log("Creating metaobject definition")

    try {
      // The key fix is in this GraphQL query - we need to properly handle the 'type' field
      const response = await admin.graphql(`
        mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
          metaobjectDefinitionCreate(definition: $definition) {
            metaobjectDefinition {
              id
              name
              type
              fieldDefinitions {
                name
                key
                type {
                  name
                }
              }
            }
            userErrors {
              field
              message
              code
            }
          }
        }`,
        {
          variables: {
            definition: {
              name: "Discount Popup",
              type: "popup_new_1",
              fieldDefinitions: [
                {
                  name: "Popup Settings",
                  key: "settings",
                  type: "json",
                },
                {
                  name: "Is Active",
                  key: "is_active",
                  type: "boolean",
                },
              ],
            },
          },
        }
      )

      const responseJson = await response.json()
      
      if (responseJson?.data?.metaobjectDefinitionCreate?.userErrors?.length) {
        console.error("User Errors from createMetaDefinition:", responseJson.data.metaobjectDefinitionCreate.userErrors)
        throw new Error(responseJson.data.metaobjectDefinitionCreate.userErrors[0].message)
      }

      console.log("Metaobject Definition created:", responseJson.data.metaobjectDefinitionCreate.metaobjectDefinition)
      return responseJson.data.metaobjectDefinitionCreate.metaobjectDefinition
    } catch (error) {
      console.error("Error creating metaobject definition:", error)
      throw error
    }
  }

  async savePopupToMetaobject(request: Request, popupId: string, popupData: string | number | boolean | JsonObject | JsonArray, isActive = false) {
    const { admin } = await authenticate.admin(request)
    if (!admin) {
      throw new Error("Admin session not found. Are you logged in?")
    }

    try {
      // First, ensure the metaobject definition exists
      try {
        await this.createMetaObjectDefinition(request)
      } catch (error) {
        // If it's already created, this might error but we can continue
        console.log("Note: Metaobject definition may already exist:", error.message)
      }

      // Now check if the metaobject already exists
      const metaobjectResponse = await admin.graphql(`
        query GetPopupMetaobject($type: String!) {
          metaobjects(type: $type, first: 10) {
            edges {
              node {
                id
                handle
                fields {
                  key
                  value
                }
              }
            }
          }
        }`,
        {
          variables: {
            type: "popup_new_1",
          },
        }
      )

      const metaobjectData = await metaobjectResponse.json()
      
      // Filter the results in JavaScript to find the matching popup
      const existingMetaobject = metaobjectData.data?.metaobjects?.edges?.find(
        (edge: { node: { handle: string } }) => edge.node.handle === `popup-${popupId}`
      )

      if (existingMetaobject) {
        // Update existing metaobject
        const updateResponse = await admin.graphql(`
          mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
            metaobjectUpdate(id: $id, metaobject: $metaobject) {
              metaobject {
                id
                handle
                fields {
                  key
                  value
                }
              }
              userErrors {
                field
                message
                code
              }
            }
          }`,
          {
            variables: {
              id: existingMetaobject.node.id,
              metaobject: {
                fields: [
                  {
                    key: "settings",
                    value: JSON.stringify(popupData),
                  },
                  {
                    key: "is_active",
                    value: isActive ? "true" : "false",
                  },
                ],
              },
            },
          }
        )

        const updateData = await updateResponse.json()

        if (updateData?.data?.metaobjectUpdate?.userErrors?.length) {
          console.error("User Errors from updateMetaobject:", updateData.data.metaobjectUpdate.userErrors)
          throw new Error(updateData.data.metaobjectUpdate.userErrors[0].message)
        }

        console.log("Metaobject updated:", updateData.data.metaobjectUpdate.metaobject)
        return updateData.data.metaobjectUpdate.metaobject
      } else {
        // Create new metaobject
        const createResponse = await admin.graphql(`
          mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
            metaobjectCreate(metaobject: $metaobject) {
              metaobject {
                id
                handle
                fields {
                  key
                  value
                }
              }
              userErrors {
                field
                message
                code
              }
            }
          }`,
          {
            variables: {
              metaobject: {
                type: "popup_new_1",
                handle: `popup-${popupId}`,
                fields: [
                  {
                    key: "settings",
                    value: JSON.stringify(popupData),
                  },
                  {
                    key: "is_active",
                    value: isActive ? "true" : "false",
                  },
                ],
              },
            },
          }
        )

        const createData = await createResponse.json()

        if (createData?.data?.metaobjectCreate?.userErrors?.length) {
          console.error("User Errors from createMetaobject:", createData.data.metaobjectCreate.userErrors)
          throw new Error(createData.data.metaobjectCreate.userErrors[0].message)
        }

        console.log("Metaobject created:", createData.data.metaobjectCreate.metaobject)
        return createData.data.metaobjectCreate.metaobject
      }
    } catch (error) {
      console.error("Error saving popup to metaobject:", error)
      throw error
    }
  }
}