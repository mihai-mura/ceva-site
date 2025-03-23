import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import CommentService, { CommentServiceError } from "~/server/services/CommentService";

export interface RequestBody {
	postId: string;
	content: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	const session = await getServerAuthSession();
	if (!session) return new NextResponse("Unauthorized", { status: 401 });

	const body: RequestBody = await request.json();

	const commentRes = await CommentService.createComment(body.postId, session.user.id, body.content);

	if (commentRes === CommentServiceError.ServerError) return new NextResponse("Server error", { status: 500 });
	if (commentRes === CommentServiceError.PostNotFound) return new NextResponse("Post not found", { status: 404 });

	return NextResponse.json(commentRes, { status: 200 });
}
