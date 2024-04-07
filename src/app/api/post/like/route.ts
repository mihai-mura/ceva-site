import { Post } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerAuthSession } from "~/server/auth";
import PostService, { PostServiceError } from "~/server/services/PostService";

const reqBodySchema = z.object({
	postId: z.string(),
	action: z.union([z.literal("like"), z.literal("unlike")]),
});

export type RequestBody = z.infer<typeof reqBodySchema>;

export async function PUT(request: NextRequest): Promise<NextResponse> {
	const session = await getServerAuthSession();
	if (!session) return new NextResponse("Unauthorized", { status: 401 });

	let body: RequestBody;
	try {
		body = reqBodySchema.parse(await request.json());
	} catch (error) {
		return new NextResponse("Invalid request body", { status: 400 });
	}

	let postRes: Post | PostServiceError;
	if (body.action === "like") postRes = await PostService.likePost(body.postId, session.user.id);
	else postRes = await PostService.unlikePost(body.postId, session.user.id);
	if (postRes === PostServiceError.ServerError) return new NextResponse("Server error", { status: 500 });
	if (postRes === PostServiceError.PostNotFound) return new NextResponse("Post not found", { status: 404 });

	return NextResponse.json(postRes, { status: 200 });
}
