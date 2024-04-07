import { useState } from "react";
import { ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Link } from "@nextui-org/react";
import { FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import { signIn } from "next-auth/react";

interface LoginModalProps {
	onOpenChange: () => void;
	setType: React.Dispatch<React.SetStateAction<"login" | "register">>;
}

export default function LoginModalContent({ onOpenChange, setType }: LoginModalProps) {
	const [isPassVisible, setIsPassVisible] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginSpinner, setLoginSpinner] = useState(false);
	const [loginError, setLoginError] = useState(false);

	const logIn = async () => {
		setLoginSpinner(true);
		const res = await signIn("credentials", { email, password, redirect: false });

		if (res?.error) {
			setLoginError(true);
			setLoginSpinner(false);
		} else {
			setLoginSpinner(false);
			onOpenChange();
		}
	};

	return (
		<ModalContent>
			<>
				<ModalHeader className="flex flex-col gap-1">Log In</ModalHeader>
				<ModalBody>
					<Input
						endContent={<FiMail className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />}
						isRequired
						label="Email"
						placeholder="Enter your email"
						variant="bordered"
						value={email}
						onValueChange={setEmail}
						onChange={(e) => setLoginError(false)}
						isInvalid={loginError}
						errorMessage={loginError ? "Invalid email or password" : ""}
					/>
					<Input
						isRequired
						label="Password"
						placeholder="Enter your password"
						variant="bordered"
						type={isPassVisible ? "text" : "password"}
						value={password}
						isInvalid={loginError}
						onValueChange={setPassword}
						onChange={(e) => setLoginError(false)}
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
						<Link onClick={() => setType("register")} className="cursor-pointer select-none text-primary">
							Don't have an account?
						</Link>
					</div>
				</ModalBody>
				<ModalFooter className="flex items-center justify-center">
					<Button className="text-medium text-black" color="primary" isLoading={loginSpinner} onClick={async () => await logIn()}>
						Log In
					</Button>
				</ModalFooter>
			</>
		</ModalContent>
	);
}
