import {
  ChakraProvider,
  defaultSystem
} from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="281592417489-i52eibaccs1oltpc0s1bor81mq133qh5.apps.googleusercontent.com">
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);