import {
	Avatar,
	Modal,
	ModalContent,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { api } from "~/trpc/react";

interface Props {
	userIDs: string[];
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

const LikedByModal = ({ userIDs, isOpen, onOpenChange }: Props) => {
	// queries and mutations
	const { data: users, isLoading } = api.user.getByIDs.useQuery(
		{ userIDs },
		{
			enabled: isOpen && userIDs.length > 0,
		},
	);

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent>
				{(onClose) => (
					<>
						<Table>
							<TableHeader>
								<TableColumn className="text-lg">Likes</TableColumn>
							</TableHeader>
							{isLoading ? (
								<TableBody>
									<TableRow>
										<TableCell className="flex items-center justify-center gap-4">
											<Spinner />
										</TableCell>
									</TableRow>
								</TableBody>
							) : (
								<TableBody emptyContent={!users || users.length === 0 ? "No likes" : undefined}>
									{users ? (
										users.map((user) => (
											<TableRow>
												<TableCell className="flex items-center gap-4">
													<Avatar size="lg" src={user.image ?? ""} name={user.username ?? ""} showFallback />
													<p className="text-lg">@{user.username}</p>
												</TableCell>
											</TableRow>
										))
									) : (
										<></>
									)}
								</TableBody>
							)}
						</Table>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default LikedByModal;
