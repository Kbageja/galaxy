"use server";

import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000,
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // Prisma error code P1001 means can't reach database (often a cold start)
      if (
        err.code === "P1001" ||
        err.message?.includes("Can't reach database server")
      ) {
        console.log(
          `Database connection attempt ${i + 1} failed. Retrying in ${delay}ms...`,
        );
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const dbUser = await withRetry(() =>
    db.user.upsert({
      where: { clerkId: userId },
      update: {
        email: user.emailAddresses[0].emailAddress,
      },
      create: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
      },
    }),
  );

  return dbUser;
}

export async function saveWorkflow(data: {
  id?: string;
  name: string;
  nodes: any;
  edges: any;
  nodeData: any;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const dbUser = await withRetry(() =>
    db.user.findUnique({
      where: { clerkId: userId },
    }),
  );

  if (!dbUser) throw new Error("User not found in database");

  if (data.id) {
    const updated = await withRetry(() =>
      db.workflow.update({
        where: { id: data.id, userId: dbUser.id },
        data: {
          name: data.name,
          nodes: data.nodes,
          edges: data.edges,
          nodeData: data.nodeData,
        } as any,
      }),
    );
    return updated;
  } else {
    const created = await withRetry(() =>
      db.workflow.create({
        data: {
          name: data.name,
          nodes: data.nodes,
          edges: data.edges,
          nodeData: data.nodeData,
          userId: dbUser.id,
        } as any,
      }),
    );
    return created;
  }
}

export async function getLatestWorkflow() {
  const { userId } = await auth();
  if (!userId) return null;

  const dbUser = await withRetry(() =>
    db.user.findUnique({
      where: { clerkId: userId },
    }),
  );

  if (!dbUser) return null;

  const workflow = await withRetry(() =>
    db.workflow.findFirst({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: "desc" },
    }),
  );

  return workflow;
}
