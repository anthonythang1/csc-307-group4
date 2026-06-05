import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { fetchUserProfile, type UserProfile } from "./userProfile";

type ProfileLoadState = {
	error: string;
	profile: UserProfile | null;
	userId: string;
};

type UseUserProfileOptions = {
	enabled?: boolean;
};

export function useUserProfile({ enabled = true }: UseUserProfileOptions = {}) {
	const { loading: authLoading, user } = useAuth();
	const [profileState, setProfileState] = useState<ProfileLoadState | null>(
		null
	);
	const currentProfileState =
		profileState?.userId === user?.id ? profileState : null;
	const shouldLoadProfile = enabled && Boolean(user);

	useEffect(() => {
		if (!shouldLoadProfile || !user) {
			return undefined;
		}

		let ignore = false;
		const userId = user.id;

		async function loadProfile() {
			try {
				const loadedProfile = await fetchUserProfile();

				if (!ignore) {
					setProfileState({
						error: "",
						profile: loadedProfile,
						userId,
					});
				}
			} catch (error) {
				if (!ignore) {
					setProfileState({
						error:
							error instanceof Error
								? error.message
								: "Could not load user profile.",
						profile: null,
						userId,
					});
				}
			}
		}

		void loadProfile();

		return () => {
			ignore = true;
		};
	}, [shouldLoadProfile, user]);

	return {
		error: currentProfileState?.error ?? "",
		loading: authLoading || (shouldLoadProfile && !currentProfileState),
		profile: currentProfileState?.profile ?? null,
		user,
	};
}
