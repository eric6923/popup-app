import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { AppBridgeProvider } from "./routes/AppBridgeProvider"; // Import the AppBridgeProvider

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Wrap the Outlet with AppBridgeProvider */}
        <AppBridgeProvider>
          <Outlet />
        </AppBridgeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
