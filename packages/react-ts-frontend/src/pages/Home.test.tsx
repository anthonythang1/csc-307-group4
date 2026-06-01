import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { beforeEach, describe, expect, vi } from "vitest";
import { renderWithProviders } from "@/../test/test-utils.tsx";
import Home from "./Home";
import {
  FEATURE_CARDS,
  USER_TYPES,
  PAGE_CONTENT
} from "@/constants/homePageConstants";

const { mockSignOut } = vi.hoisted(() => ({
  mockSignOut: vi.fn()
}));

vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    signOut: mockSignOut,
    user: { email: "landlord@example.com" }
  })
}));

describe("Home Page", () => {
  beforeEach(() => {
    mockSignOut.mockReset();
  });

  test("renders all content", () => {
    renderWithProviders(<Home />);
    expect(
      screen.getByText(PAGE_CONTENT.heading)
    ).toBeInTheDocument();
  });

  test("renders hero section content", () => {
    renderWithProviders(<Home />);

    expect(
      screen.getByText(PAGE_CONTENT.heading)
    ).toBeInTheDocument();
    expect(
      screen.getByText(PAGE_CONTENT.body)
    ).toBeInTheDocument();
  });

  test("renders all feature cards", () => {
    renderWithProviders(<Home />);

    FEATURE_CARDS.forEach((card) => {
      expect(screen.getByText(card.title)).toBeInTheDocument();
      expect(screen.getByText(card.desc)).toBeInTheDocument();
    });
  });

  test("renders all user type sections", () => {
    renderWithProviders(<Home />);

    USER_TYPES.forEach((type) => {
      expect(screen.getByText(type.title)).toBeInTheDocument();

      type.steps.forEach((step) => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });
  });

  test("signs out from the home page", async () => {
    renderWithProviders(<Home />);

    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});
