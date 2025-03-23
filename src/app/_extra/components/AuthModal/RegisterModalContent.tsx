import { Button, Input, Link, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import React, { useState } from "react";
import { FiEye, FiEyeOff, FiMail, FiUser } from "react-icons/fi";
import { z } from "zod";
import { RequestBody } from "~/app/api/register/route";

interface RegisterModalProps {
	onOpenChange: () => void;
	setType: React.Dispatch<React.SetStateAction<"login" | "register">>;
}

export default function RegisterModalContent({ onOpenChange, setType }: RegisterModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState("");
	const [isNameInvalid, setIsNameInvalid] = useState(false);
	const [email, setEmail] = useState("");
	const [isEmailInvalid, setIsEmailInvalid] = useState(false);
	const [emailExists, setEmailExists] = useState(false);
	const [password, setPassword] = useState("");
	const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
	const [isPassVisible, setIsPassVisible] = useState(false);

	const validateForm = () => {
		let isValid = true;
		try {
			z.string().min(3).max(50).parse(name);
		} catch (error) {
			setIsNameInvalid(true);
			isValid = false;
		}
		try {
			z.string().email().parse(email);
		} catch (error) {
			setIsEmailInvalid(true);
			isValid = false;
		}
		try {
			z.string().min(8).max(50).parse(password);
		} catch (error) {
			setIsPasswordInvalid(true);
			isValid = false;
		}
		return isValid;
	};

	const registerUser = async () => {
		if (!validateForm()) return;
		setIsLoading(true);

		const res = await fetch("/api/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, email, password } as RequestBody),
		});

		setIsLoading(false);
		if (res.ok) {
			setType("login");
		} else if (res.status === 409) {
			setIsLoading(false);
			setEmailExists(true);
		}
	};

	return (
		<ModalContent>
			<>
				<ModalHeader className="flex flex-col gap-1">Sign Up</ModalHeader>
				<ModalBody>
					<Input
						name="username"
						endContent={<FiUser className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />}
						autoFocus
						isRequired
						label="Username"
						placeholder="username"
						variant="bordered"
						value={name}
						onValueChange={setName}
						onChange={() => setIsNameInvalid(false)}
						isInvalid={isNameInvalid}
						errorMessage={
							isNameInvalid ? "Username must be between 3 and 50 characters" : emailExists && "Username or email already in use"
						}
					/>
					<Input
						name="email"
						endContent={<FiMail className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />}
						isRequired
						label="Email"
						placeholder="Enter your email"
						variant="bordered"
						value={email}
						onValueChange={setEmail}
						onChange={() => {
							setIsEmailInvalid(false);
							setEmailExists(false);
						}}
						isInvalid={isEmailInvalid || emailExists}
						errorMessage={isEmailInvalid ? "Invalid email" : emailExists && "Username or email already in use"}
					/>
					<Input
						name="password"
						isRequired
						label="Password"
						placeholder="Enter your password"
						variant="bordered"
						type={isPassVisible ? "text" : "password"}
						value={password}
						onValueChange={setPassword}
						onChange={() => setIsPasswordInvalid(false)}
						isInvalid={isPasswordInvalid}
						errorMessage={isPasswordInvalid && "Password must be between 8 and 50 characters"}
						endContent={
							<button className="focus:outline-none" type="button" onClick={() => setIsPassVisible((prev) => !prev)}>
								{isPassVisible ? (
									<FiEyeOff className="pointer-events-none text-2xl text-default-400" />
								) : (
									<FiEye className="pointer-events-none text-2xl text-default-400" />
								)}
							</button>
						}
					/>
					<div className="flex justify-start px-1 py-2">
						<Link onPress={() => setType("login")} className="cursor-pointer select-none text-primary">
							Already have an account?
						</Link>
					</div>
				</ModalBody>
				<ModalFooter className="flex items-center justify-center">
					<Button
						className="text-medium text-black"
						color="primary"
						type="submit"
						isLoading={isLoading}
						onPress={() => registerUser()}>
						Sign Up
					</Button>
				</ModalFooter>
			</>
		</ModalContent>
	);
}
