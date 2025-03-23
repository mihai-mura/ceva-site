import { NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth/config";
import UserService, { UserServiceError } from "~/server/services/UserService";

export interface RequestBody {
	imageUrl?: string;
	password?: string;
	name?: string;
}

export async function PUT(request: Request): Promise<Response> {
	const session = await getServerAuthSession();
	if (!session) return new NextResponse("Unauthorized", { status: 401 });

	const body: RequestBody = await request.json();

	const res = await UserService.updateUser(session.user.id, { image: body.imageUrl, password: body.password, name: body.name });

	if (res === UserServiceError.UsernameAlreadyExists) return new NextResponse("Username in use", { status: 409 });
	if (res === UserServiceError.UserNotFound) return new NextResponse("User not found", { status: 404 });
	if (res === UserServiceError.ServerError) return new NextResponse("Server error", { status: 500 });
	return NextResponse.json(res, { status: 201 });
}
