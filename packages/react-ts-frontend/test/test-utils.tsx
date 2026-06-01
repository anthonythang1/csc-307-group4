import React from "react";
import { type RenderOptions, render } from "@testing-library/react";
import {
  ChakraProvider,
  defaultSystem
} from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
function AllProviders({
  children,
  withRouter = true
}: {
  children: React.ReactNode;
  withRouter?: boolean;
}) {
  const content = withRouter ? <MemoryRouter>{children}</MemoryRouter> : children;

  return (
    <ChakraProvider value={defaultSystem}>
      {content}
    </ChakraProvider>
  );
}

type ProviderRenderOptions = RenderOptions & {
  withRouter?: boolean;
};

export function renderWithProviders(
  ui: React.ReactElement,
  { withRouter = true, ...renderOptions }: ProviderRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <AllProviders withRouter={withRouter}>{children}</AllProviders>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
