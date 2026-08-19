import React from "react";
import { App, ZMPRouter, SnackbarProvider } from "zmp-ui";
import Layout from "./Layout";

const MyApp: React.FC = () => (
  <App>
    <SnackbarProvider>
      <ZMPRouter>
        <Layout />
      </ZMPRouter>
    </SnackbarProvider>
  </App>
);

export default MyApp;
