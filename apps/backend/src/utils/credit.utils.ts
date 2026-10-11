import prisma from "../db/prisma";

/**
 * Credit costs for different operations
 */
export const CREDIT_COSTS = {
  TEXT_GENERATION: 1,        // 1 credit per text generation request
  AUTOCOMPLETION: 0.1,       // 0.1 credits per autocompletion request
  HUMANIZATION: 2,           // 2 credits per humanization request
} as const;

/**
 * Check if user has sufficient credits
 */
export async function checkUserCredits(userId: number, requiredCredits: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { availableCredits: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return Number(user.availableCredits) >= requiredCredits;
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(userId: number, credits: number): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      availableCredits: {
        decrement: credits
      }
    },
    select: { availableCredits: true }
  });

  return Number(user.availableCredits);
}

/**
 * Get user's available credits
 */
export async function getUserCredits(userId: number): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { availableCredits: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return Number(user.availableCredits);
}

/**
 * Add credits to user account (for admin operations)
 */
export async function addCredits(userId: number, credits: number): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      availableCredits: {
        increment: credits
      }
    },
    select: { availableCredits: true }
  });

  return Number(user.availableCredits);
}

/**
 * Handle credit transaction with rollback on error
 */
export async function withCreditTransaction<T>(
  userId: number,
  creditCost: number,
  operation: () => Promise<T>
): Promise<{ result: T; remainingCredits: number }> {
  if (!Number.isFinite(creditCost) || creditCost <= 0) throw new Error("Invalid credit cost");
  const reserved = await prisma.user.updateMany({
    where: { id: userId, availableCredits: { gte: creditCost } },
    data: { availableCredits: { decrement: creditCost } },
  });
  if (reserved.count !== 1) throw new Error("Insufficient credits");
  const remainingCredits = await getUserCredits(userId);

  try {
    // Perform the operation
    const result = await operation();
    return { result, remainingCredits };
  } catch (error) {
    // Rollback credits on error
    await addCredits(userId, creditCost);
    throw error;
  }
}
