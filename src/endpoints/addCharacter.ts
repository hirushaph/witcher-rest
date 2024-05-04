import {
  OpenAPIRoute,
  OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import { insertDocumentWithAutoIncrement } from "db/mongodb";

import { Character } from "types";
import { errorResponse, response } from "utils/response";
import appState from "utils/state";

export class AddCharacter extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Characters"],
    summary: "Add new character",
    requestBody: Character,
    responses: {
      "201": {
        description: "Return success message if created",
        schema: {
          success: Boolean,
          message: String,
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
    const reqData: Character = data.body;
    const mongo = appState.getDbConnection();

    const db = mongo.db("witcher");
    const collection = db.collection("casts");

    const isCharacterExits = await collection.findOne({ name: reqData.name });

    if (isCharacterExits)
      return errorResponse(400, { error: "character already exits" });

    const dbData = await insertDocumentWithAutoIncrement(db, reqData);

    if (!dbData || dbData === null)
      return errorResponse(400, { error: "Cannot add new character" });

    return response(201, { message: "Successfully added new character" });
  }
}
