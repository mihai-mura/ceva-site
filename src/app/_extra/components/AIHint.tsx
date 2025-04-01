"use client";
import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { FaMagic } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";

interface Props {
	onAutoComplete: () => void;
	isLoading?: boolean;
	isError?: boolean;
}

const AIHint = ({ onAutoComplete, isLoading, isError }: Props) => {
	return (
		<motion.div
			initial={!isError && !isLoading ? { height: "20px" } : { height: "60px", bottom: "-40px" }}
			whileHover={{ height: "60px", bottom: "-40px" }}
			className="absolute -bottom-5 flex w-full flex-col items-center justify-end overflow-hidden">
			<div className="mb-2 h-5" />
			<Button
				className={`mb-2 ${!isError ? "bg-white" : "bg-danger"} text-black`}
				size="sm"
				variant="ghost"
				color={!isError ? "secondary" : "danger"}
				startContent={!isLoading ? !isError ? <FaMagic /> : <MdErrorOutline /> : null}
				onPress={onAutoComplete}
				isDisabled={isError}
				isLoading={isLoading}>
				{!isError ? "AI Description" : "Something went wrong"}
			</Button>
		</motion.div>
	);
};

export default AIHint;
