import { NextRequest, NextResponse } from "next/server";
import CommentService, { CommentServiceError } from "~/server/services/CommentService";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const postId = request.nextUrl.searchParams.get("postId");
	if (!postId) return new NextResponse("Post ID is required", { status: 400 });

	const commentsRes = await CommentService.getPostComments(postId);

	if (commentsRes === CommentServiceError.ServerError) return new NextResponse("Server error", { status: 500 });
	if (commentsRes === CommentServiceError.PostNotFound) return new NextResponse("Post not found", { status: 404 });

	return NextResponse.json(commentsRes, { status: 200 });
}
