import {
  OpenAPIRoute,
  OpenAPIRouteSchema,
  Path,
} from "@cloudflare/itty-router-openapi";
import { Character } from "../types";
import appState from "utils/state";
import { errorResponse, response } from "utils/response";

export class GetCharacter extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Character"],
    summary: "Get character details by id",
    parameters: {
      chId: Path(String, {
        description: "Character id",
      }),
    },
    responses: {
      "200": {
        description: "Return all the witcher characters",
        schema: {
          success: Boolean,
          result: {
            characters: Character,
          },
        },
      },
      "404": {
        description: "No Character Found",
        schema: {
          success: Boolean,
          error: String,
        },
      },
    },
  };

  async handle(
    request: Request,
    env: any,
    context: any,
    data: Record<string, any>
  ) {
    // Retrieve the validated slug
    const { chId } = data.params;

    const mongo = appState.getDbConnection();

    const collection = mongo.db("witcher").collection("casts");

    const dbData = await collection.findOne({ id: chId });

    if (!dbData || dbData === null)
      return errorResponse(404, { error: "No character found!" });

    return response(200, { character: dbData });
  }
}
