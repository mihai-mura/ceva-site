import { NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import UserService, { UserServiceError } from "~/server/services/UserService";

export interface RequestBody {
	IDs: string[];
}

export async function POST(request: Request): Promise<Response> {
	const session = await getServerAuthSession();
	if (!session) return new NextResponse("Unauthorized", { status: 401 });

	const body: RequestBody = await request.json();

	const res = await UserService.getUsersFromIDs(body.IDs);

	if (res === UserServiceError.ServerError) return new NextResponse("Server error", { status: 500 });
	return NextResponse.json({ users: res }, { status: 201 });
}
