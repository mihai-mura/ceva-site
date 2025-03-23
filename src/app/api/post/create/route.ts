import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth/config";
import PostService, { PostServiceError } from "~/server/services/PostService";

export interface RequestBody {
	url: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	const session = await getServerAuthSession();
	if (!session) return new NextResponse("Unauthorized", { status: 401 });

	const body: RequestBody = await request.json();

	const postRes = await PostService.createPost(body.url, session.user.id);
	if (postRes === PostServiceError.ServerError) return new NextResponse("Server error", { status: 500 });
	return NextResponse.json(postRes, { status: 201 });
}
