import { Modal } from "@nextui-org/react";
import React from "react";
import LoginModalContent from "./LoginModalContent";
import RegisterModalContent from "./RegisterModalContent";

interface AuthModalProps {
	isOpen: boolean;
	onOpenChange: () => void;
	type: "login" | "register";
	setType: React.Dispatch<React.SetStateAction<"login" | "register">>;
}

const AuthModal = ({ isOpen, onOpenChange, type, setType }: AuthModalProps) => {
	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" placement="top-center">
			{type === "login" ? (
				<LoginModalContent onOpenChange={onOpenChange} setType={setType} />
			) : (
				<RegisterModalContent onOpenChange={onOpenChange} setType={setType} />
			)}
		</Modal>
	);
};

export default AuthModal;
