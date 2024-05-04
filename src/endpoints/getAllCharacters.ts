import {
  DataOf,
  OpenAPIRoute,
  OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import { Character } from "types";
import { response } from "utils/response";
import appState from "utils/state";

export class GetAllCharacters extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Characters"],
    summary: "Get all characters",
    responses: {
      "200": {
        description: "Return all the witcher characters",
        schema: {
          success: Boolean,
          result: {
            characters: [Character],
          },
        },
      },
      "404": {
        description: "No Characters Found",
        schema: {
          success: Boolean,
          error: String,
        },
      },
    },
  };

  // Handle request

  async handle(
    request: Request,
    env: any,
    context: any,
    data: DataOf<typeof GetAllCharacters.schema>
  ) {
    const mongo = appState.getDbConnection();

    const collection = mongo.db("witcher").collection("casts");

    const dbData = await collection.find();

    return response(200, { characters: dbData });
  }
}
