import {
  OpenAPIRoute,
  OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import { UpdateCharacterType } from "types";
import { errorResponse, response } from "utils/response";
import appState from "utils/state";

export class UpdateCharacter extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Characters"],
    summary: "Update character details by id",
    requestBody: UpdateCharacterType,
    responses: {
      "200": {
        description: "Return success message if updated",
        schema: {
          success: Boolean,
          message: String,
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
    const reqData: UpdateCharacterType = data.body;
    const mongo = appState.getDbConnection();
    const collection = mongo.db("witcher").collection("casts");

    const character = await collection.updateOne(
      { id: reqData.id },
      {
        $set: reqData,
      }
    );

    if (character && character.matchedCount === 0) {
      return errorResponse(404, { error: "Character not found" });
    }

    if (character && character.modifiedCount === 1) {
      return response(200, { message: "Character updated successfully" });
    }

    return;
  }
}
