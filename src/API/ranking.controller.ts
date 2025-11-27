import type { Request, Response, RequestHandler } from "express";
import { getTopRankingUsers, getTopRankingTeams } from "@/BL/rank.service";

export const getRankingUsersHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {limit = 20 } = req.query;
    const ranking = await getTopRankingUsers(Number(limit));
    res.status(200).json(ranking);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRankingTeamsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {limit = 20 } = req.query;
    const ranking = await getTopRankingTeams(Number(limit));
    res.status(200).json(ranking);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};