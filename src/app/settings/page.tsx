"use client";
import {
	Avatar,
	Button,
	Chip,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
} from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { uploadProfileImage } from "~/lib/storage";
import { tryCatch } from "~/lib/try-catch";
import { api, isTRPCClientError } from "~/trpc/client";
import EmilLoader from "../_extra/components/EmilLoader";

const Settings = () => {
	const { data: session, status } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/");
		},
	});

	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [imageLoading, setImageLoading] = useState(false);
	const [name, setName] = useState(session?.user.username ?? "");
	const [nameInput, setNameInput] = useState(session?.user.username ?? "");
	const [image, setImage] = useState(session?.user.image ?? "");
	const [nameLoading, setNameLoading] = useState(false);
	const [nameError, setNameError] = useState(false);
	const [isPassVisible, setIsPassVisible] = useState(false);
	const [pass1, setPass1] = useState("");
	const [pass2, setPass2] = useState("");
	const [passLoading, setPassLoading] = useState(false);

	useEffect(() => {
		setName(session?.user.username ?? "");
		setImage(session?.user.image ?? "");
	}, [session]);

	const changeImage = async () => {
		if (typeof window !== "undefined") {
			const [fileHandle] = await window.showOpenFilePicker({
				types: [
					{
						description: "Images",
						accept: {
							"image/*": [".jpeg", ".jpg"],
						},
					},
				],
				multiple: false,
			});

			setImageLoading(true);

			const url = await uploadProfileImage(await fileHandle.getFile(), session?.user.id ?? "");

			await api.user.update.mutate({
				imageUrl: url,
			});
			setImageLoading(false);
			setImage(url);
		}
	};

	const changeName = async (newName: string) => {
		setNameLoading(true);

		const { data, error } = await tryCatch(
			api.user.update.mutate({
				name: newName,
			}),
		);

		if (error) {
			if (isTRPCClientError(error)) {
				switch (error.data?.code) {
					case "CONFLICT":
						setNameError(true);
						setNameLoading(false);
						break;
				}
			}
		} else {
			setNameLoading(false);
			setName(newName);
			onOpenChange();
		}
	};

	const changePassword = async (pass: string, confirmPass: string) => {
		if (pass !== confirmPass) {
			//TODO: Handle error
		}

		setPassLoading(true);

		api.user.update.mutate({
			password: pass,
		});
		setPassLoading(false);
		setPass1("");
		setPass2("");
	};

	if (status === "loading") return <EmilLoader />;

	return (
		<div className="page flex flex-col gap-10 px-[28vw] pt-32">
			<div className="flex items-center gap-7">
				<Avatar
					isBordered
					onClick={() => changeImage()}
					className="h-20 w-20 cursor-pointer text-large text-black transition-all active:scale-90"
					name={session?.user.username || ""}
					showFallback
					src={image}
					color="primary"
				/>
				<Chip variant="light" as={Button} isLoading={imageLoading} onClick={onOpen} className="h-[38px] text-2xl">
					@{name}
				</Chip>
			</div>
			<div className="flex w-[50%] flex-col gap-5">
				<Input
					labelPlacement="outside"
					placeholder="********"
					label="New Password"
					type={isPassVisible ? "text" : "password"}
					value={pass1}
					onValueChange={setPass1}
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
				<Input
					labelPlacement="outside"
					placeholder="********"
					label="Confirm Password"
					type={isPassVisible ? "text" : "password"}
					value={pass2}
					onValueChange={setPass2}
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
				<Button
					onPress={() => changePassword(pass1, pass2)}
					isLoading={passLoading}
					color="success"
					variant="faded"
					className="text-md self-end">
					Save
				</Button>
			</div>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader>Change Username</ModalHeader>
							<ModalBody>
								<Input
									autoFocus
									label="New Username"
									placeholder="Enter username"
									variant="bordered"
									value={nameInput}
									onValueChange={setNameInput}
									isInvalid={nameError}
									errorMessage={nameError ? "Username already exists" : ""}
								/>
							</ModalBody>
							<ModalFooter>
								<Button color="danger" variant="flat" onPress={onClose}>
									Close
								</Button>
								<Button color="success" isLoading={nameLoading} onPress={() => changeName(nameInput)}>
									Save
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
};

export default Settings;
