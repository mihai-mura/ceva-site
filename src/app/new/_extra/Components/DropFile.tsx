import { Dropzone, type DropzoneProps, type FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { Button, Image } from "@nextui-org/react";
import { useRef, useState } from "react";
import { CiFileOff, CiImageOn, CiInboxOut } from "react-icons/ci";

interface DropFileProps extends Partial<DropzoneProps> {
	postPhotos: (files: File[]) => void;
}

const DropFile = (props: DropFileProps) => {
	const [loading, setLoading] = useState(false);
	const [files, setFiles] = useState<FileWithPath[]>([]);
	const openRef = useRef<() => void>(null);

	const previews = files.map((file, index) => {
		const imageUrl = URL.createObjectURL(file);
		return <Image width={250} key={index} src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} />;
	});

	return (
		<Dropzone
			onDrop={setFiles}
			onReject={(files) => console.log("rejected files", files)}
			maxSize={10 * 1024 ** 2}
			accept={IMAGE_MIME_TYPE}
			openRef={openRef}
			onClick={() => null}
			className={`${props.className} flex items-center justify-center`}>
			<div className={`${files.length > 0 && "hidden"} flex flex-col items-center justify-center gap-9`}>
				<Dropzone.Accept>
					<CiInboxOut className="h-[70px] w-[70px] text-primary" stroke={"1.5"} />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<CiFileOff className="h-[70px] w-[70px] text-danger" stroke={"1.5"} />
				</Dropzone.Reject>
				<Dropzone.Idle>
					<CiImageOn className="h-[70px] w-[70px] text-primary" stroke={"1.5"} />
				</Dropzone.Idle>

				<div className="flex flex-col items-center justify-center gap-5">
					<p className="text-2xl">Drag photos here</p>
					<Button color="primary" variant="bordered" onPress={() => openRef.current?.()}>
						Select from computer
					</Button>
				</div>
			</div>
			<div className={`${files.length === 0 && "hidden"} flex flex-col items-center justify-center gap-10`}>
				<div className="flex h-[400px] w-max max-w-[80vw] flex-wrap gap-8 overflow-auto">{previews}</div>
				<div className="flex gap-4">
					<Button onPress={() => setFiles([])} className="text-lg" color="danger" variant="bordered">
						Cancel
					</Button>
					<Button
						isLoading={loading}
						onPress={() => {
							setLoading(true);
							props.postPhotos(files);
						}}
						className="text-lg"
						color="primary"
						variant="bordered">
						Post
					</Button>
				</div>
			</div>
		</Dropzone>
	);
};

export default DropFile;
