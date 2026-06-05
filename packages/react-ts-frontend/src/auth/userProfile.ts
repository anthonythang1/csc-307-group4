import { apiFetch } from "../lib/api";

export type RegistryRole = "CITY_OFFICIAL" | "LANDLORD";

export type UserProfile = {
	registryRole: RegistryRole | string;
	userId: string;
};

const cityDashboardPath = "/dashboard";
const landlordPropertiesPath = "/landlord/properties";

export async function fetchUserProfile() {
	const response = await apiFetch("/api/me");

	if (!response.ok) {
		throw new Error("Could not load user profile.");
	}

	return (await response.json()) as UserProfile;
}

export function getDefaultPathForProfile(profile: UserProfile | null) {
	if (profile?.registryRole === "CITY_OFFICIAL") {
		return cityDashboardPath;
	}

	if (profile?.registryRole === "LANDLORD") {
		return landlordPropertiesPath;
	}

	return "/";
}

export function profileHasAllowedRole(
	profile: UserProfile | null,
	allowedRoles: readonly RegistryRole[]
) {
	return allowedRoles.some((role) => role === profile?.registryRole);
}

export function getLoginRedirectPath(
	profile: UserProfile,
	requestedPath?: string
) {
	if (
		requestedPath === cityDashboardPath &&
		profile.registryRole === "CITY_OFFICIAL"
	) {
		return requestedPath;
	}

	if (
		(requestedPath === landlordPropertiesPath || requestedPath === "/propertyreg") &&
		profile.registryRole === "LANDLORD"
	) {
		return requestedPath;
	}

	return getDefaultPathForProfile(profile);
}
