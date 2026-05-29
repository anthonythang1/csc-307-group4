import React from "react";
import { render } from "@testing-library/react";
import {
  ChakraProvider,
  defaultSystem
} from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
function AllProviders({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>{children}</MemoryRouter>
    </ChakraProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: AllProviders });
}
