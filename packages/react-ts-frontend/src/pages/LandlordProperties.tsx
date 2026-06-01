import {
  Badge,
  Box,
  Button,
  Card,
  Field,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { apiFetch } from '../lib/api';
import {
  propertyRegistrationSchema,
  zodErrorMap,
} from '../lib/formValidation';

type NumericFormValue = number | '';

type PropertyFormState = {
  propAddress: string;
  propCity: string;
  propZipcode: string;
  propNumBeds: NumericFormValue;
  propNumBaths: NumericFormValue;
  propSqft: NumericFormValue;
  propYearBuilt: string;
  propZoning: string;
  propOwnerEmail: string;
  propOwnerPhone: string;
};

type LandlordProperty = {
  propertyId: number;
  propAddress: string | null;
  propCity: string | null;
  propZipcode: string | null;
  propZoning: string | null;
  propNumBeds: number | null;
  propNumBaths: number | null;
  propSqft: number | null;
  propYearBuilt: string | null;
  propOwnerEmail: string | null;
  propOwnerPhone: string | null;
};

type FormErrors = Partial<Record<keyof PropertyFormState, string>>;

const propertyCache = new Map<string, LandlordProperty[]>();
const propertyCachePrefix = 'landlord-properties:';

type FormFieldProps = {
  error?: string;
  label: string;
  min?: number;
  name: keyof PropertyFormState;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  step?: number;
  type?: 'email' | 'number' | 'tel' | 'text';
  value: NumericFormValue | string;
};

function coerceNumber(value: number | null) {
  return value ?? 0;
}

function coerceText(value: string | null) {
  return value ?? '';
}

function toFormState(property: LandlordProperty): PropertyFormState {
  return {
    propAddress: coerceText(property.propAddress),
    propCity: coerceText(property.propCity),
    propZipcode: coerceText(property.propZipcode),
    propNumBeds: coerceNumber(property.propNumBeds),
    propNumBaths: coerceNumber(property.propNumBaths),
    propSqft: coerceNumber(property.propSqft),
    propYearBuilt: coerceText(property.propYearBuilt),
    propZoning: coerceText(property.propZoning),
    propOwnerEmail: coerceText(property.propOwnerEmail),
    propOwnerPhone: coerceText(property.propOwnerPhone),
  };
}

function propertyTitle(property: LandlordProperty) {
  return property.propAddress?.trim() || 'Untitled property';
}

function propertyLocation(property: LandlordProperty) {
  return [property.propCity, property.propZipcode]
    .filter((value) => value && value.trim())
    .join(', ');
}

function displayText(value: string | null, fallback = 'Not provided') {
  return value?.trim() || fallback;
}

function readCachedProperties(cacheKey: string) {
  const memoryProperties = propertyCache.get(cacheKey);

  if (memoryProperties) {
    return memoryProperties;
  }

  try {
    const storedProperties = window.sessionStorage.getItem(cacheKey);

    if (!storedProperties) {
      return null;
    }

    const parsedProperties = JSON.parse(storedProperties) as unknown;

    if (!Array.isArray(parsedProperties)) {
      return null;
    }

    const properties = parsedProperties as LandlordProperty[];
    propertyCache.set(cacheKey, properties);
    return properties;
  } catch (error) {
    console.warn('Unable to read cached landlord properties.', error);
    return null;
  }
}

function writeCachedProperties(
  cacheKey: string,
  properties: LandlordProperty[]
) {
  propertyCache.set(cacheKey, properties);

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(properties));
  } catch (error) {
    console.warn('Unable to cache landlord properties.', error);
  }
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as {
      error?: string;
      message?: string;
    };

    return body.message || body.error || fallback;
  } catch {
    return fallback;
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

async function fetchLandlordProperties() {
  const response = await apiFetch('/api/properties');

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not load properties.')
    );
  }

  return (await response.json()) as LandlordProperty[];
}

function FormField({
  error,
  label,
  min,
  name,
  onChange,
  placeholder,
  required = false,
  step,
  type = 'text',
  value,
}: FormFieldProps) {
  const inputId = `edit-${name}`;

  return (
    <Field.Root invalid={Boolean(error)} required={required}>
      <Field.Label htmlFor={inputId}>
        {label}
      </Field.Label>
      <Input
        aria-invalid={error ? 'true' : 'false'}
        id={inputId}
        min={min}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step}
        type={type}
        value={value}
      />
      <Field.ErrorText>{error}</Field.ErrorText>
    </Field.Root>
  );
}

export default function LandlordProperties() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const cacheKey = `${propertyCachePrefix}${user?.id ?? 'current'}`;
  const [properties, setProperties] = useState<LandlordProperty[]>(
    () => readCachedProperties(cacheKey) ?? []
  );
  const [loading, setLoading] = useState(
    () => readCachedProperties(cacheKey) === null
  );
  const [loadError, setLoadError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<PropertyFormState | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadInitialProperties() {
      try {
        const loadedProperties = await fetchLandlordProperties();

        if (!ignore) {
          writeCachedProperties(cacheKey, loadedProperties);
          setProperties(loadedProperties);
          setLoadError('');
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(
            error instanceof Error ? error.message : 'Could not load properties.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadInitialProperties();

    return () => {
      ignore = true;
    };
  }, [cacheKey]);

  const reloadProperties = async () => {
    setLoading(properties.length === 0);
    setLoadError('');

    try {
      const loadedProperties = await fetchLandlordProperties();
      writeCachedProperties(cacheKey, loadedProperties);
      setProperties(loadedProperties);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Could not load properties.'
      );
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (property: LandlordProperty) => {
    setEditingId(property.propertyId);
    setDraft(toFormState(property));
    setErrors({});
    setSaveError('');
    setDeleteError('');
    setPendingDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
    setErrors({});
    setSaveError('');
  };

  const handleDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value } = event.target;
    const key = name as keyof PropertyFormState;
    const parsed = type === 'number' && value !== '' ? Number(value) : value;

    setDraft((previous) =>
      previous
        ? {
            ...previous,
            [key]: parsed as PropertyFormState[typeof key],
          }
        : previous
    );
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setSaveError('');
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!draft || editingId === null) {
      return;
    }

    const validated = propertyRegistrationSchema.safeParse(draft);

    if (!validated.success) {
      setErrors(zodErrorMap(validated.error));
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const response = await apiFetch(`/api/properties/${editingId}`, {
        body: JSON.stringify(validated.data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
      });

      if (!response.ok) {
        if (response.status === 409) {
          setErrors((previous) => ({
            ...previous,
            propAddress: 'This property is already registered.',
          }));
          return;
        }

        setSaveError(
          await readErrorMessage(response, 'Could not save property changes.')
        );
        return;
      }

      const updated = (await response.json()) as LandlordProperty;
      setProperties((previous) => {
        const nextProperties = previous.map((property) =>
          property.propertyId === updated.propertyId ? updated : property
        );
        writeCachedProperties(cacheKey, nextProperties);
        return nextProperties;
      });
      cancelEdit();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Could not save property changes.'
      );
    } finally {
      setSaving(false);
    }
  };

  const beginDelete = (propertyId: number) => {
    if (editingId === propertyId) {
      cancelEdit();
    }

    setPendingDeleteId(propertyId);
    setDeleteError('');
  };

  const handleDelete = async (propertyId: number) => {
    setDeletingId(propertyId);
    setDeleteError('');

    try {
      const response = await apiFetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setDeleteError(
          await readErrorMessage(response, 'Could not delete property.')
        );
        return;
      }

      setProperties((previous) => {
        const nextProperties = previous.filter(
          (property) => property.propertyId !== propertyId
        );
        writeCachedProperties(cacheKey, nextProperties);
        return nextProperties;
      });
      setPendingDeleteId(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Could not delete property.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    setSignOutError('');
    setSigningOut(true);

    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      setSignOutError(getErrorMessage(error));
      setSigningOut(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      color="gray.950"
      px={{ base: '4', md: '8' }}
      py="8"
    >
      <Box as="main" maxW="6xl" mx="auto" w="full">
        <Flex
          as="header"
          align={{ base: 'stretch', sm: 'flex-end' }}
          direction={{ base: 'column', sm: 'row' }}
          gap="4"
          justify="space-between"
          mb="6"
        >
          <Box>
            <Text color="blue.700" fontSize="sm" fontWeight="medium">
              Landlord workspace
            </Text>
            <Heading size="2xl">Manage Properties</Heading>
          </Box>
          <Box textAlign={{ base: 'left', sm: 'right' }}>
            <Button
              disabled={signingOut}
              onClick={() => void handleSignOut()}
              type="button"
              variant="outline"
            >
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
            {signOutError ? (
              <Text color="red.600" fontSize="sm" mt="2">
                {signOutError}
              </Text>
            ) : null}
          </Box>
        </Flex>

        <Box
          bg="white"
          borderColor="gray.200"
          borderRadius="md"
          borderWidth="1px"
          mb="5"
          px="4"
          py="4"
        >
          <Flex
            align={{ base: 'stretch', sm: 'center' }}
            direction={{ base: 'column', sm: 'row' }}
            gap="3"
            justify="space-between"
          >
            <Box>
              <Heading size="md">Property registration</Heading>
            </Box>
            <Button asChild colorPalette="blue">
              <Link to="/propertyreg">Register Property</Link>
            </Button>
          </Flex>
        </Box>

        {loadError ? (
          <Box
            bg="red.50"
            borderColor="red.200"
            borderRadius="md"
            borderWidth="1px"
            color="red.700"
            fontSize="sm"
            mb="5"
            px="4"
            py="3"
          >
            <HStack align="center" justify="space-between">
              <Text>{loadError}</Text>
              <Button
                colorPalette="red"
                onClick={() => void reloadProperties()}
                size="sm"
                type="button"
                variant="ghost"
              >
                Retry
              </Button>
            </HStack>
          </Box>
        ) : null}

        {loading ? (
          <Card.Root borderRadius="md">
            <Card.Body>
              <Text color="gray.600" fontSize="sm">
                Loading properties...
              </Text>
            </Card.Body>
          </Card.Root>
        ) : properties.length === 0 ? (
          <Card.Root borderRadius="md">
            <Card.Body>
              <Heading size="lg">No properties yet</Heading>
              <Text color="gray.600" fontSize="sm" mt="2">
                Registered properties will appear here.
              </Text>
            </Card.Body>
          </Card.Root>
        ) : (
          <Stack as="ul" gap="4" listStyleType="none" m="0" p="0">
            {properties.map((property) => {
              const isEditing = editingId === property.propertyId;
              const isConfirmingDelete =
                pendingDeleteId === property.propertyId;

              return (
                <Card.Root
                  as="li"
                  borderRadius="md"
                  key={property.propertyId}
                >
                  <Card.Body>
                    <Flex
                      align={{ base: 'stretch', lg: 'flex-start' }}
                      direction={{ base: 'column', lg: 'row' }}
                      gap="4"
                      justify="space-between"
                    >
                      <Box minW="0">
                        <Heading size="lg">{propertyTitle(property)}</Heading>
                        <Text color="gray.600" fontSize="sm" mt="1">
                          {propertyLocation(property) || 'Location not provided'}
                        </Text>
                        <HStack flexWrap="wrap" gap="2" mt="4">
                          <Badge
                            borderRadius="md"
                            colorPalette="gray"
                            px="3"
                            py="1"
                            variant="subtle"
                          >
                            {coerceNumber(property.propNumBeds)} beds
                          </Badge>
                          <Badge
                            borderRadius="md"
                            colorPalette="gray"
                            px="3"
                            py="1"
                            variant="subtle"
                          >
                            {coerceNumber(property.propNumBaths)} baths
                          </Badge>
                          <Badge
                            borderRadius="md"
                            colorPalette="gray"
                            px="3"
                            py="1"
                            variant="subtle"
                          >
                            {coerceNumber(property.propSqft)} sqft
                          </Badge>
                          <Badge
                            borderRadius="md"
                            colorPalette="gray"
                            px="3"
                            py="1"
                            variant="subtle"
                          >
                            Built {displayText(property.propYearBuilt)}
                          </Badge>
                          <Badge
                            borderRadius="md"
                            colorPalette="gray"
                            px="3"
                            py="1"
                            variant="subtle"
                          >
                            {displayText(property.propZoning, 'Zoning not set')}
                          </Badge>
                        </HStack>
                        <Text color="gray.600" fontSize="sm" mt="4">
                          Owner contact:{' '}
                          {[
                            property.propOwnerEmail,
                            property.propOwnerPhone,
                          ]
                            .filter((value) => value && value.trim())
                            .join(' / ') || 'Not provided'}
                        </Text>
                      </Box>

                      <HStack
                        align="start"
                        flexWrap="wrap"
                        gap="2"
                        justify={{ base: 'flex-start', lg: 'flex-end' }}
                      >
                        <Button
                          disabled={saving || deletingId !== null}
                          onClick={() => startEdit(property)}
                          type="button"
                          variant="outline"
                        >
                          Edit
                        </Button>
                        {isConfirmingDelete ? (
                          <>
                            <Button
                              colorPalette="red"
                              disabled={deletingId === property.propertyId}
                              onClick={() =>
                                void handleDelete(property.propertyId)
                              }
                              type="button"
                            >
                              {deletingId === property.propertyId
                                ? 'Deleting...'
                                : 'Confirm Delete'}
                            </Button>
                            <Button
                              disabled={deletingId === property.propertyId}
                              onClick={() => setPendingDeleteId(null)}
                              type="button"
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            colorPalette="red"
                            disabled={saving || deletingId !== null}
                            onClick={() => beginDelete(property.propertyId)}
                            type="button"
                            variant="outline"
                          >
                            Delete
                          </Button>
                        )}
                      </HStack>
                    </Flex>

                    {deleteError && isConfirmingDelete ? (
                      <Box
                        bg="red.50"
                        borderColor="red.200"
                        borderRadius="md"
                        borderWidth="1px"
                        color="red.700"
                        fontSize="sm"
                        mt="4"
                        px="3"
                        py="2"
                      >
                        {deleteError}
                      </Box>
                    ) : null}

                    {isEditing && draft ? (
                      <Box
                        borderColor="gray.200"
                        borderTopWidth="1px"
                        mt="5"
                        pt="5"
                      >
                        <form noValidate onSubmit={handleSave}>
                          <Grid
                            gap="4"
                            templateColumns={{
                              base: '1fr',
                              md: 'repeat(2, minmax(0, 1fr))',
                            }}
                          >
                            <FormField
                              error={errors.propAddress}
                              label="Address*"
                              name="propAddress"
                              onChange={handleDraftChange}
                              placeholder="123 Grand Avenue"
                              required
                              value={draft.propAddress}
                            />
                            <FormField
                              error={errors.propCity}
                              label="City*"
                              name="propCity"
                              onChange={handleDraftChange}
                              placeholder="San Luis Obispo"
                              required
                              value={draft.propCity}
                            />
                            <FormField
                              error={errors.propZipcode}
                              label="Zipcode*"
                              name="propZipcode"
                              onChange={handleDraftChange}
                              placeholder="93401"
                              required
                              value={draft.propZipcode}
                            />
                            <FormField
                              error={errors.propZoning}
                              label="Zoning"
                              name="propZoning"
                              onChange={handleDraftChange}
                              placeholder="Residential"
                              value={draft.propZoning}
                            />
                            <FormField
                              error={errors.propNumBeds}
                              label="Beds*"
                              min={0}
                              name="propNumBeds"
                              onChange={handleDraftChange}
                              required
                              step={1}
                              type="number"
                              value={draft.propNumBeds}
                            />
                            <FormField
                              error={errors.propNumBaths}
                              label="Baths*"
                              min={0}
                              name="propNumBaths"
                              onChange={handleDraftChange}
                              required
                              step={1}
                              type="number"
                              value={draft.propNumBaths}
                            />
                            <FormField
                              error={errors.propSqft}
                              label="Sqft"
                              min={0}
                              name="propSqft"
                              onChange={handleDraftChange}
                              step={1}
                              type="number"
                              value={draft.propSqft}
                            />
                            <FormField
                              error={errors.propYearBuilt}
                              label="Year Built"
                              name="propYearBuilt"
                              onChange={handleDraftChange}
                              placeholder="1900"
                              value={draft.propYearBuilt}
                            />
                            <FormField
                              error={errors.propOwnerEmail}
                              label="Owner's Email"
                              name="propOwnerEmail"
                              onChange={handleDraftChange}
                              placeholder="owner@email.com"
                              type="email"
                              value={draft.propOwnerEmail}
                            />
                            <FormField
                              error={errors.propOwnerPhone}
                              label="Owner's Phone"
                              name="propOwnerPhone"
                              onChange={handleDraftChange}
                              placeholder="000-000-0000"
                              type="tel"
                              value={draft.propOwnerPhone}
                            />
                          </Grid>

                          {saveError ? (
                            <Box
                              bg="red.50"
                              borderColor="red.200"
                              borderRadius="md"
                              borderWidth="1px"
                              color="red.700"
                              fontSize="sm"
                              mt="4"
                              px="3"
                              py="2"
                            >
                              {saveError}
                            </Box>
                          ) : null}

                          <HStack flexWrap="wrap" gap="2" mt="5">
                            <Button
                              colorPalette="blue"
                              disabled={saving}
                              type="submit"
                            >
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                              disabled={saving}
                              onClick={cancelEdit}
                              type="button"
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </HStack>
                        </form>
                      </Box>
                    ) : null}
                  </Card.Body>
                </Card.Root>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
