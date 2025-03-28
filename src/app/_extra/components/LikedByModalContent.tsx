import { Avatar, Modal, ModalContent, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { type User } from "@prisma/client";
import { useEffect, useState } from "react";
import { api } from "~/trpc/client";

interface Props {
	userIDs: string[];
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

const LikedByModal = ({ userIDs, isOpen, onOpenChange }: Props) => {
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState<Omit<User, "password">[]>([]);

	useEffect(() => {
		(async () => {
			if (!isOpen) return;
			const users = await api.user.getByIDs.query({
				userIDs: userIDs,
			});
			if (users) setUsers(users);

			setLoading(false);
		})();
	}, [userIDs, isOpen]);

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent>
				{(onClose) => (
					<>
						<Table>
							<TableHeader>
								<TableColumn className="text-lg">Likes</TableColumn>
							</TableHeader>
							<TableBody emptyContent={users.length === 0 ? "No likes" : undefined}>
								{users.map((user) => (
									<TableRow>
										<TableCell className="flex items-center gap-4">
											<Avatar size="lg" src={user.image ?? ""} name={user.username ?? ""} showFallback />
											<p className="text-lg">@{user.username}</p>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default LikedByModal;
