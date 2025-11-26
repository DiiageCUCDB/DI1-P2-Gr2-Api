import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { createResponseSchema } from './server.schema';
extendZodWithOpenApi(z);

export const RankSchema = z.object({
  rank: z.number().int().openapi({
    description: "Rank based on score",
    example: 1
  }),
  name: z.string().openapi({
    description: "Username or Guild",
    example: "john_doe"
  }),
  score: z.number().int().openapi({
    description: "Score",
    example: 120
  })
}).openapi("Rank");


export const RankListSchema = z.array(RankSchema).openapi("RankList");

export type RankType = z.infer<typeof RankSchema>;

export const GetRankingResponseResultServer = createResponseSchema(RankSchema);