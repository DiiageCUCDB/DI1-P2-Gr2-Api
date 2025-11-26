import express from "express";
import registry from "@/lib/docs/openAPIRegistry";
import { GetRankingResponseResultServer } from "@/DTO/rank.schema";
import { ResponseError } from "@/DTO/server.schema";
import { getRankingUsersHandler , getRankingTeamsHandler} from "../ranking.controller";

const router = express.Router();

registry.registerPath({
  method: "get",
  path: "/api/ranking/users",
  summary: "Get top X players by score",
  tags: ["Ranking"],
  parameters:[
    {
      name: 'limit',
      in: 'query',
      required: false,
      schema: {
        type: 'integer',
        description: 'Number of players/teams',
        example: 20,
      },
    }
  ],
  responses: {
    200: {
      description: "Top players",
      content: {
        "application/json": {
          schema: GetRankingResponseResultServer
        }
      }
    },
    500: {
     description: "Internal server error",
      content: {
        "application/json": {
          schema: ResponseError
        }
      }
    }
  }
});

router.get("/users", getRankingUsersHandler);

registry.registerPath({
  method: "get",
  path: "/api/ranking/teams",
  summary: "Get top X teams by score",
  tags: ["Ranking"],
  parameters:[
    {
      name: 'limit',
      in: 'query',
      required: false,
      schema: {
        type: 'integer',
        description: 'Number of teams',
        example: 20,
      },
    }
  ],
  responses: {
    200: {
      description: "Top teams",
      content: {
        "application/json": {
          schema: GetRankingResponseResultServer
        }
      }
    },
    500: {
     description: "Internal server error",
      content: {
        "application/json": {
          schema: ResponseError
        }
      }
    }
  }
});

router.get("/teams", getRankingTeamsHandler);

export default router;