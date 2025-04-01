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
			initial={{ height: "20px" }}
			whileHover={{ height: "60px", bottom: "-40px" }}
			className="absolute -bottom-5 flex w-full flex-col items-center justify-end overflow-hidden">
			<div className="mb-2 h-5" />
			<Button
				className="mb-2 bg-primary text-black hover:bg-primary/5"
				size="sm"
				color={!isError ? "primary" : "danger"}
				variant="ghost"
				startContent={!isLoading ? !isError ? <FaMagic /> : <MdErrorOutline /> : null}
				onPress={onAutoComplete}
				isLoading={isLoading}>
				{!isError ? "AI Description" : "Something went wrong"}
			</Button>
		</motion.div>
	);
};

export default AIHint;
