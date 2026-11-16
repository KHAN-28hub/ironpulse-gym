import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const formatted = posts.map((p) => ({
      id: p.id,
      authorName: p.author.name,
      authorAvatar: p.author.avatar,
      authorRole: p.author.role,
      content: p.content,
      workoutDetails: p.workoutDetails,
      likesCount: p.likesCount,
      isLikedByMe: p.likes.some((l) => l.userId === user.id),
      createdAt: p.createdAt,
      comments: p.comments.map((c) => ({
        id: c.id,
        authorName: c.author.name,
        authorAvatar: c.author.avatar,
        content: c.content,
        createdAt: c.createdAt,
      })),
    }));

    return NextResponse.json({ posts: formatted });
  } catch (error: any) {
    console.error("Community fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch community feed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, postId, content, workoutDetails } = body;

    if (action === "LIKE") {
      const existing = await prisma.postLike.findUnique({
        where: { postId_userId: { postId, userId: user.id } },
      });

      if (existing) {
        await prisma.postLike.delete({ where: { id: existing.id } });
        await prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        });
        return NextResponse.json({ success: true, liked: false });
      } else {
        await prisma.postLike.create({
          data: { postId, userId: user.id },
        });
        await prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        });
        return NextResponse.json({ success: true, liked: true });
      }
    }

    if (action === "COMMENT") {
      const comment = await prisma.postComment.create({
        data: {
          postId,
          authorId: user.id,
          content: content.trim(),
        },
        include: { author: true },
      });
      return NextResponse.json({
        success: true,
        comment: {
          id: comment.id,
          authorName: comment.author.name,
          authorAvatar: comment.author.avatar,
          content: comment.content,
          createdAt: comment.createdAt,
        },
      });
    }

    // CREATE POST
    const newPost = await prisma.post.create({
      data: {
        authorId: user.id,
        content: content.trim(),
        workoutDetails: workoutDetails || null,
        likesCount: 0,
      },
      include: { author: true },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        authorName: newPost.author.name,
        authorAvatar: newPost.author.avatar,
        authorRole: newPost.author.role,
        content: newPost.content,
        workoutDetails: newPost.workoutDetails,
        likesCount: 0,
        isLikedByMe: false,
        createdAt: newPost.createdAt,
        comments: [],
      },
    });
  } catch (error: any) {
    console.error("Community post error:", error);
    return NextResponse.json({ error: "Failed to process post action" }, { status: 500 });
  }
}
