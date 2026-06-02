import {
	Box,
	Button,
	Card,
	Center,
	Heading,
	HStack,
	Text,
	VStack,
	Icon,
	Avatar,
	Container,
	Flex
} from "@chakra-ui/react";

import {
	FEATURE_CARDS,
	USER_TYPES,
	PAGE_CONTENT } from "@/constants/homePageConstants.ts";

import { useAuth } from "@/auth/useAuth";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import bg from "../assets/slo.jpg"

type CardProps = {
	title: string;
	desc: string;
	icon: React.ElementType;
};

type StepItemProps = {
	color: string;
	desc: string;
	num: string;
};

function InfoCard({ title, desc, icon }: CardProps) {
	return (
		<Card.Root maxWidth="250px" size="lg" maxHeight="650px">
			<Card.Body gap="2">
				<Icon as={icon} color="blue" />
				<Card.Title mt="2">{title}</Card.Title>
				<Card.Description fontSize="16px">{desc}</Card.Description>
			</Card.Body>
		</Card.Root>
	);
}

function StepItem({ color, desc, num }: StepItemProps) {
	return (
		<HStack>
			<Avatar.Root
				size="sm"
				colorPalette={color}
				bg={{ base: "colorPalette.300" }}>
				<Avatar.Fallback name={num} />
			</Avatar.Root>
			<Text fontSize="md">{desc}</Text>
		</HStack>
	);
}

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Something went wrong.";
}

export default function Home() {
	const { signOut, user } = useAuth();
	const [signingOut, setSigningOut] = useState(false);
	const [signOutError, setSignOutError] = useState("");

	const handleSignOut = async () => {
		setSignOutError("");
		setSigningOut(true);

		try {
			await signOut();
		} 
		catch (error) {
			setSignOutError(getErrorMessage(error));
		} 
		finally {
			setSigningOut(false);
		}
	};

	const greetStyle: SystemStyleObject = {
		textAlign: "center",
		fontSize: "xl",
		pt: "10vh",
		width: "md"
	};

	return (
		<Box 
			minH="150vh"
			w="100vw"
			bgSize="cover"
			bgRepeat="no-repeat"
			bgPosition="center"
			bgImage={`url(${bg})`} 
		>
			<Container as="section" maxWidth="4xl" maxHeight="2xl">
				{/* ~~~~ login button and variations ~~~~ */}
				{user ? (
					<Box position="fixed" top="4" right="4" zIndex="1" textAlign="right">
						<Button
							type="button"
							variant="outline"
							onClick={handleSignOut}
							disabled={signingOut}>
							{signingOut ? "Signing out..." : "Sign Out"}
						</Button>
						{signOutError ? (
							<Text mt="2" fontSize="sm" color="red.600">
								{signOutError}
							</Text>
						) : null}
					</Box>
				) : (
					<HStack position="fixed" top="4" right="4" zIndex="1">
						<Button asChild variant="subtle">
							<Link to="/login">Log In</Link>
						</Button>
						<Button asChild colorPalette="blue">
							<Link to="/signup">Sign Up</Link>
						</Button>
					</HStack>
				)}

				{/* ~~~~ homepage greetings ~~~~ */}
				<VStack gap="8">
					<Box {...greetStyle}>
						<VStack gap="8">
							<Heading size="2xl">{PAGE_CONTENT.heading}</Heading>
							<Text fontSize="lg" letterSpacing="tight" >
								{PAGE_CONTENT.body}
							</Text>
						</VStack>
					</Box>

					{/* ~~~~ RR highlights ~~~~ */}
					<Flex gap="4" justify="space-between">
						{FEATURE_CARDS.map((card) => (
							<InfoCard
								key={card.id}
								title={card.title}
								desc={card.desc}
								icon={card.icon}
							/>
						))}
					</Flex>

					
					<Heading size="2xl">
						{PAGE_CONTENT.secondHeading}
					</Heading>

					<Flex gap="8" justify="space-between">
						{USER_TYPES.map((type) => (
							<Card.Root
								key={type.id}
								size="lg"
								colorPalette={type.color}
								bg="colorPalette.50">

								<Card.Title>
									<Icon as={type.icon} color={type.color} />
									{type.title}
								</Card.Title>

								<Card.Description>
									<VStack align="start">
										{type.steps.map((step, index) => (
											<StepItem
												key={index}
												color={type.color}
												desc={step}
												num={(index + 1).toString()}
											/>
										))}
									</VStack>
								</Card.Description>
							</Card.Root>
						))}
					</Flex>
				</VStack>
			</Container>
		</Box>
	);
}
