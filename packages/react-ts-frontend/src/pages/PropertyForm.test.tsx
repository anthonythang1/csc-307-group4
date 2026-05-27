import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { describe, test, vi, expect, beforeEach, afterEach } from "vitest";
import { renderWithProviders } from "../../test/test-utils";
import PropertyRegisterLL from "./Form_PropRegLandlord";

const fillBasicValid = async () => {
	await userEvent.type(screen.getByLabelText(/Address\*/i), "123 Main St");
	await userEvent.type(screen.getByLabelText(/City\*/i), "Townsville");
	await userEvent.type(screen.getByLabelText(/Zipcode\*/i), "12345");
	await userEvent.clear(screen.getByLabelText(/Beds\*/i));
	await userEvent.type(screen.getByLabelText(/Beds\*/i), "3");
	await userEvent.clear(screen.getByLabelText(/Baths\*/i));
	await userEvent.type(screen.getByLabelText(/Baths\*/i), "2");
};

describe("PropertyRegisterLL form", () => {

 	beforeEach(() => {
    	// default global fetch stub is a no-op; tests will override when needed
    	vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, json: async () => ({}) })));
  	});

 	afterEach(() => {
    	vi.restoreAllMocks();
	});

	/* ~~~~ find form label and return input'd element ~~~~ */
	test("renders all required fields and submit button", () => {
    	renderWithProviders(<PropertyRegisterLL />);
    	expect(screen.getByLabelText(/Address\*/i)).toBeInTheDocument();
    	expect(screen.getByLabelText(/City\*/i)).toBeInTheDocument();
    	expect(screen.getByLabelText(/Zipcode\*/i)).toBeInTheDocument();
    	expect(screen.getByLabelText(/Beds\*/i)).toBeInTheDocument();
    	expect(screen.getByLabelText(/Baths\*/i)).toBeInTheDocument();
    	expect(screen.getByRole("button", { name: /save property/i })).toBeInTheDocument();
  	});

	test("shows validation errors when required fields are empty", async () => {
    	renderWithProviders(<PropertyRegisterLL />);
    	await userEvent.click(screen.getByRole("button", { name: /save property/i }));

    	expect(await screen.findByText(/Address is required/i)).toBeInTheDocument();
    	expect(await screen.findByText(/City is required/i)).toBeInTheDocument();
    	expect(await screen.findByText(/Zipcode is required/i)).toBeInTheDocument();
    // number-field validation: empty defaults to 0 (valid) so no beds/baths errors here
  });

	test("submits payload when form is valid", async () => {
    	const mockFetch = vi.fn(() =>
      		Promise.resolve({ ok: true, json: async () => ({ success: true }) })
    	);
    	vi.stubGlobal("fetch", mockFetch);

    	renderWithProviders(<PropertyRegisterLL />);

    	await fillBasicValid();
    	await userEvent.type(screen.getByLabelText(/Sqft/i), "1200");
    	await userEvent.type(screen.getByLabelText(/Year Built/i), "1990");
    	await userEvent.type(screen.getByLabelText(/Zoning/i), "Residential");
    	await userEvent.type(screen.getByLabelText(/Owner's Email/i), "owner@example.com");
    	await userEvent.type(screen.getByLabelText(/Owner's Phone/i), "555-1234");

    	await userEvent.click(screen.getByRole("button", { name: /save property/i }));

    // ensure fetch called with correct endpoint and payload shape
    	await expect(mockFetch).toHaveBeenCalledOnce();
    	const [url, options] = mockFetch.mock.calls[0] as unknown as [
			RequestInfo | URL,
			RequestInit
		];
		expect(url).toMatch(/\/api\/properties$/);
    	const body = JSON.parse(String(options.body));
    	expect(body).toEqual(expect.objectContaining({
      		propAddress: "123 Main St",
      		propCity: "Townsville",
      		propZipcode: "12345",
      		propNumBeds: 3,
      		propNumBaths: 2,
      		propSqft: 1200,
      		propYearBuilt: "1990",
      		propZoning: "Residential",
      		propOwnerEmail: "owner@example.com",
      		propOwnerPhone: "555-1234"
    	}));
  	});

	test("shows zod validation errors and does not submit invalid property data", async () => {
		const mockFetch = vi.fn(() =>
			Promise.resolve({ ok: true, json: async () => ({ success: true }) })
		);
		vi.stubGlobal("fetch", mockFetch);

		renderWithProviders(<PropertyRegisterLL />);

		await fillBasicValid();
		await userEvent.clear(screen.getByLabelText(/Zipcode\*/i));
		await userEvent.type(screen.getByLabelText(/Zipcode\*/i), "abc");
		await userEvent.type(screen.getByLabelText(/Owner's Email/i), "not-an-email");

		await userEvent.click(screen.getByRole("button", { name: /save property/i }));

		expect(await screen.findByText(/Enter a valid zipcode/i)).toBeInTheDocument();
		expect(await screen.findByText(/Enter a valid owner email/i)).toBeInTheDocument();
		expect(mockFetch).not.toHaveBeenCalled();
	});

	test("shows duplicate property error on conflict response", async () => {
		const mockFetch = vi.fn(() => Promise.resolve({ ok: false, status: 409 }));
		vi.stubGlobal("fetch", mockFetch);

		renderWithProviders(<PropertyRegisterLL />);

		await fillBasicValid();
		await userEvent.click(screen.getByRole("button", { name: /save property/i }));

		expect(
			await screen.findByText(/This property is already registered/i)
		).toBeInTheDocument();
	});

  test("displays server error alert on non-ok response", async () => {
    const mockFetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 }));
    vi.stubGlobal("fetch", mockFetch);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderWithProviders(<PropertyRegisterLL />);
    await fillBasicValid();
    await userEvent.click(screen.getByRole("button", { name: /save property/i }));

    //expect(await screen.findByText(/Submission failed/i)).not.toBeNull().catch(() => {});
    expect(alertSpy).toHaveBeenCalledWith("Submission failed");

    alertSpy.mockRestore();
  });
});
