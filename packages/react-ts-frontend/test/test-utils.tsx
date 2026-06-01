import React from "react";
import { render } from "@testing-library/react";
import {
  ChakraProvider,
  defaultSystem
} from "@chakra-ui/react";

// eslint-disable-next-line react-refresh/only-export-components
function AllProviders({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider value={defaultSystem}>
      {children}
    </ChakraProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: AllProviders });
}
