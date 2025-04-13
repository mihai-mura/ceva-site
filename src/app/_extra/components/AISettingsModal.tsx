import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useState } from "react";
import { CiLink } from "react-icons/ci";
import { PiCellSignalXFill, PiCheckCircleFill, PiTestTube } from "react-icons/pi";
import { testImageCaptioningAPI } from "~/lib/imageCaptioning";
import { getAIURL, saveAIURL } from "~/lib/localStorage";

interface Props {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

const AISettingsModal = ({ isOpen, onOpenChange }: Props) => {
	const [url, setUrl] = useState("");
	const [apiTestSuccess, setApiTestSuccess] = useState(false);
	const [isTestLoading, setIsTestLoading] = useState(false);
	const [hasTestStarted, setHasTestStarted] = useState(false);

	// Reset states when modal closes
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setApiTestSuccess(false);
			setIsTestLoading(false);
			setHasTestStarted(false);
		}
		const url = getAIURL();
		if (url) setUrl(url);
		onOpenChange(open);
	};

	const handleSubmit = (url: string) => {
		// validations
		if (url.endsWith("/")) url = url.slice(0, -1);

		saveAIURL(url);
		handleOpenChange(false);
	};

	const testAPI = async (url: string) => {
		setIsTestLoading(true);
		if (await testImageCaptioningAPI(url)) setApiTestSuccess(true);
		else setApiTestSuccess(false);
		setIsTestLoading(false);
		setHasTestStarted(true);
	};

	return (
		<Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">AI Autocomplete URL</ModalHeader>
				<ModalBody>
					<Input
						endContent={<CiLink className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />}
						isRequired
						label="URL"
						placeholder="https://..."
						variant="bordered"
						value={url}
						onValueChange={setUrl}
					/>
				</ModalBody>
				<ModalFooter className="flex items-center justify-center">
					<Button
						className="text-medium"
						color={!hasTestStarted ? "default" : apiTestSuccess ? "success" : "danger"}
						startContent={
							!isTestLoading &&
							(hasTestStarted ? (
								apiTestSuccess ? (
									<PiCheckCircleFill className="text-2xl" />
								) : (
									<PiCellSignalXFill className="text-2xl" />
								)
							) : (
								<PiTestTube className="text-2xl" />
							))
						}
						isLoading={isTestLoading}
						onPress={() => testAPI(url)}>
						{!hasTestStarted ? "Test API" : apiTestSuccess ? "Success" : "Failed"}
					</Button>
					<Button className="text-medium text-black" color="primary" onPress={async () => handleSubmit(url)}>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AISettingsModal;
