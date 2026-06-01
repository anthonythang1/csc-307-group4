import { Button } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BackButton() {
	const location = useLocation();
	const navigate = useNavigate();

	if (location.pathname === "/" || location.pathname === "/landlord/properties") {
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
			aria-label="Go back"
			title="Go back"
			type="button"
			position="fixed"
			top="4"
			left="4"
			zIndex="1000"
			variant="outline"
			colorPalette="blue"
			minW="10"
			onClick={handleBack}>
			&larr;
		</Button>
	);
}
