import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App";
import { PAGE_CONTENT } from "./constants/homePageConstants";

const { mockAuthState } = vi.hoisted(() => ({
  mockAuthState: {
    user: null as { id: string } | null
  }
}));

vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    isConfigured: true,
    loading: false,
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    signUpWithPassword: vi.fn(),
    user: mockAuthState.user
  })
}));

function renderApp() {
  return render(
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  );
}

describe("App navigation", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    mockAuthState.user = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("does not show the back button on the home page", () => {
    renderApp();

    expect(screen.queryByRole("button", { name: "Go back" })).not.toBeInTheDocument();
  });

  test("shows a back arrow on other pages and returns to the previous page", async () => {
    window.history.pushState({}, "", "/login");
    renderApp();

    await userEvent.click(screen.getByRole("button", { name: "Go back" }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
    expect(screen.getByText(PAGE_CONTENT.heading)).toBeInTheDocument();
  });

  test("uses the property manager as the default page for landlords", async () => {
    mockAuthState.user = { id: "landlord-user-id" };
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        if (input === "/api/me") {
          return Promise.resolve({
            json: async () => ({
              registryRole: "LANDLORD",
              userId: "landlord-user-id"
            }),
            ok: true
          } as Response);
        }

        return Promise.resolve({
          json: async () => [],
          ok: true
        } as Response);
      })
    );

    renderApp();

    await waitFor(() => {
      expect(window.location.pathname).toBe("/landlord/properties");
    });
    expect(
      await screen.findByText("Manage Properties")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Go back" })).not.toBeInTheDocument();
  });
});
