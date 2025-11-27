import prisma from "@/DAL/prismaClient";

export async function getTopRankingUsers(limit: number) {
  const users = await prisma.users.findMany({
    orderBy: { score: "desc" },
    take: limit,
    select: {
      username: true,
      score: true
    }
  });

  // Rank + rename username -> name (pour Kotlin)
  return users.map((u, index) => ({
    rank: index + 1,
    name: u.username,
    score: u.score
  }));
}

export async function getTopRankingTeams(limit: number) {
  const users = await prisma.guilds.findMany({
    orderBy: { score: "desc" },
    take: limit,
    select: {
      name: true,
      score: true
    }
  });

  // Rank + rename username -> name (pour Kotlin)
  return users.map((u, index) => ({
    rank: index + 1,
    name: u.name,
    score: u.score
  }));
}