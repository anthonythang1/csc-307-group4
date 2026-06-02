import Shield from "@/assets/shield.svg?react";
import Verify from "@/assets/verify.svg?react";
import Housing from "@/assets/housing.svg?react";
import Landlord from "@/assets/landlord.svg?react";
import Tenants from "@/assets/tenants.svg?react";

export const PAGE_CONTENT = {
  heading: "San Luis Obispo Rental Registry",
  body: "A secure registry that aggregates landlord-provided housing data to give policymakers an accurate, up-to-date picture of the housing stock.",
  secondHeading: "How it Works"
};

export const FEATURE_CARDS = [
  {
    id: "point1",
    title: "Data Collection",
    desc:
      "Store property and lease information voluntarily provided by landlords.", 
    icon: Verify 
  },
  {
    id: "point2",
    title: "Aid Landlords",
    desc:
      "Give landlords the ability to track their properties and leases with the city." ,
    icon: Verify
  },
  {
    id: "point3",
    title: "Housing Situation",
    desc:
      "Help city policymakers understand rental trends, property distribution," +
      " and housing needs across San Luis Obispo.",
    icon: Verify 
  }
];

export const USER_TYPES = [
  {
    id: "landlord",
    title: "For Landlords",
    icon: Landlord,
    color: "blue",
    steps: [
		"Register an account in the registry",
      	"Register your properties or leases in the registry",
		"Continue to update information when changes happen"
    ]
  },
  {
    id: "cityauth",
    title: "For City Authority",
    icon: Housing,
    color: "green",
    steps: [
      "Login using City Employee Account",
      "Access summary analytics through dashboard."
    ]
  }
];
