import { NextResponse } from "next/server";
import UserService, { UserServiceError } from "~/server/services/UserService";

export interface RequestBody {
	name: string;
	email: string;
	password: string;
}

export async function POST(request: Request): Promise<Response> {
	const body: RequestBody = await request.json();

	const res = await UserService.createUser(body.name, body.email, body.password);

	if (res === UserServiceError.EmailAlreadyExists) return new NextResponse("Email already exists", { status: 409 });
	if (res === UserServiceError.ServerError) return new NextResponse("Server error", { status: 500 });
	return NextResponse.json(res, { status: 201 });
}
