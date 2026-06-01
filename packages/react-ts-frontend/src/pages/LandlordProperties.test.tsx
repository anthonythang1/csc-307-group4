import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../test/test-utils';
import LandlordProperties from './LandlordProperties';

const { mockAuthState, mockSignOut } = vi.hoisted(() => ({
  mockAuthState: {
    user: { id: 'landlord-user-0' },
  },
  mockSignOut: vi.fn(),
}));

vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
    user: mockAuthState.user,
  }),
}));

const sampleProperty = {
  propertyId: 42,
  propAddress: '123 Main St',
  propCity: 'San Luis Obispo',
  propZipcode: '93401',
  propZoning: 'Residential',
  propNumBeds: 3,
  propNumBaths: 2,
  propSqft: 1200,
  propYearBuilt: '1990',
  propOwnerEmail: 'owner@example.com',
  propOwnerPhone: '555-1234',
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    json: async () => body,
    ok: status >= 200 && status < 300,
    status,
  } as Response);
}

function renderPage() {
  renderWithProviders(
    <MemoryRouter initialEntries={['/landlord/properties']}>
      <Routes>
        <Route path="/" element={<p>Home page</p>} />
        <Route path="/landlord/properties" element={<LandlordProperties />} />
      </Routes>
    </MemoryRouter>
  );
}

function propertyCacheKey() {
  return `landlord-properties:${mockAuthState.user.id}`;
}

describe('LandlordProperties page', () => {
  let userSequence = 0;

  beforeEach(() => {
    mockAuthState.user = { id: `landlord-user-${userSequence}` };
    mockSignOut.mockReset();
    userSequence += 1;
    window.sessionStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => jsonResponse([sampleProperty]))
    );
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  test('renders landlord properties from the API', async () => {
    renderPage();

    expect(await screen.findByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('San Luis Obispo, 93401')).toBeInTheDocument();
    expect(screen.getByText('3 beds')).toBeInTheDocument();
    expect(screen.getByText('2 baths')).toBeInTheDocument();
  });

  test('signs out from the properties page', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(await screen.findByText('Home page')).toBeInTheDocument();
  });

  test('renders cached properties while refreshing in the background', async () => {
    window.sessionStorage.setItem(
      propertyCacheKey(),
      JSON.stringify([
        {
          ...sampleProperty,
          propAddress: 'Cached Main St',
        },
      ])
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        jsonResponse([
          {
            ...sampleProperty,
            propAddress: 'Fresh Main St',
          },
        ])
      )
    );

    renderPage();

    expect(screen.getByText('Cached Main St')).toBeInTheDocument();
    expect(screen.queryByText('Loading properties...')).not.toBeInTheDocument();
    expect(await screen.findByText('Fresh Main St')).toBeInTheDocument();
  });

  test('saves edited property fields', async () => {
    const mockFetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        return jsonResponse({
          ...sampleProperty,
          propAddress: '456 Marsh St',
        });
      }

      return jsonResponse([sampleProperty]);
    });
    vi.stubGlobal('fetch', mockFetch);

    renderPage();

    await screen.findByText('123 Main St');
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.clear(screen.getByLabelText(/Address\*/i));
    await userEvent.type(screen.getByLabelText(/Address\*/i), '456 Marsh St');
    await userEvent.click(
      screen.getByRole('button', { name: /save changes/i })
    );

    await waitFor(() => {
      expect(screen.getByText('456 Marsh St')).toBeInTheDocument();
    });

    const putCall = mockFetch.mock.calls.find(
      ([, options]) => (options as RequestInit | undefined)?.method === 'PUT'
    );
    expect(putCall?.[0]).toBe('/api/properties/42');

    const body = JSON.parse(String((putCall?.[1] as RequestInit).body));
    expect(body).toEqual(
      expect.objectContaining({
        propAddress: '456 Marsh St',
        propCity: 'San Luis Obispo',
        propZipcode: '93401',
      })
    );
  });

  test('requires delete confirmation before calling the delete endpoint', async () => {
    const mockFetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'DELETE') {
        return jsonResponse(null, 204);
      }

      return jsonResponse([sampleProperty]);
    });
    vi.stubGlobal('fetch', mockFetch);

    renderPage();

    expect(await screen.findByText('123 Main St')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(
      mockFetch.mock.calls.some(
        ([, options]) => (options as RequestInit | undefined)?.method === 'DELETE'
      )
    ).toBe(false);

    await userEvent.click(
      screen.getByRole('button', { name: /confirm delete/i })
    );

    await waitFor(() => {
      expect(
        mockFetch.mock.calls.some(
          ([input, options]) =>
            input === '/api/properties/42' &&
            (options as RequestInit | undefined)?.method === 'DELETE'
        )
      ).toBe(true);
    });

    await waitFor(() => {
      expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
    });
  });
});
