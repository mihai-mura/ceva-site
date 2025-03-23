import { Spinner } from "@nextui-org/react";

const EmilLoader = () => {
	return (
		<div className="page flex flex-col items-center justify-center pt-[350px]">
			<Spinner size="lg" color="primary" />
		</div>
	);
};

export default EmilLoader;
