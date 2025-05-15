
import { json } from '@remix-run/node';
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { 
  Page, 
  Card, 
  Layout, 
  Button, 
  Text,
  BlockStack
} from '@shopify/polaris';

// This loader function is required for Remix to handle GET requests to this route
export async function loader() {
  return json({
    message: "Modal page loaded successfully"
  });
}

export default function ModalPage() {
  const shopify = useAppBridge();

  return (
    <Page title="Modal Example">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="4">
              <Text variant="bodyLg">
                Click the button below to open a modal
              </Text>
              <Button primary onClick={() => shopify.modal.show('my-modal')}>
                Open Modal
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* The Modal component from App Bridge - exactly matching the docs example */}
      <Modal id="my-modal" variant="max">
        <div>
          <BlockStack gap="4">
            <Text variant="headingLg">Modal Content</Text>
            <Text variant="bodyLg">
              This is your modal max content. You can put any components or content here.
            </Text>
            <BlockStack gap="3">
              <Button primary onClick={() => {
                console.log('Primary action clicked');
                // Handle primary action logic here
                shopify.modal.close('my-modal');
              }}>
                Primary Action
              </Button>
              <Button onClick={() => {
                console.log('Secondary action clicked');
                // Handle secondary action logic here
                shopify.modal.close('my-modal');
              }}>
                Secondary Action
              </Button>
            </BlockStack>
          </BlockStack>
        </div>
        <TitleBar title="Modal Title">
          <Button primary onClick={() => {
            console.log('Primary action from title bar clicked');
            shopify.modal.close('my-modal');
          }}>
            Primary action
          </Button>
          <Button onClick={() => {
            console.log('Secondary action from title bar clicked');
            shopify.modal.close('my-modal');
          }}>
            Secondary action
          </Button>
        </TitleBar>
      </Modal>
    </Page>
  );
}