import { Button } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BackButton() {
	const location = useLocation();
	const navigate = useNavigate();

	if (
		location.pathname === "/" ||
		location.pathname === "/dashboard" ||
		location.pathname === "/landlord/properties"
	) {
		return null;
	}

	const handleBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
			return;
		}

		navigate("/");
	};

	return (
		<Button
			textStyle="3xl"
			aria-label="Go back"
			title="Go back"
			type="button"
			position="fixed"
			top="4"
			left="4"
			zIndex="1000"
			bg="blue"
			minW="10"
			onClick={handleBack}>
			&larr;
		</Button>
	);
}
