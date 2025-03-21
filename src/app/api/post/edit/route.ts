import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import PostService, { PostServiceError } from "~/server/services/PostService";

export interface RequestBody {
	postId: string;
	description: string;
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
	const session = await getServerAuthSession();
	if (!session) return new NextResponse("Unauthorized", { status: 401 });

	const body: RequestBody = await request.json();

	const postRes = await PostService.updateDescription(body.postId, session.user.id, body.description);

	if (postRes === PostServiceError.ServerError) return new NextResponse("Server error", { status: 500 });
	if (postRes === PostServiceError.PostNotFound) return new NextResponse("Post not found", { status: 404 });
	if (postRes === PostServiceError.AccessDenied) return new NextResponse("Access denied", { status: 403 });

	return NextResponse.json(postRes, { status: 200 });
}
