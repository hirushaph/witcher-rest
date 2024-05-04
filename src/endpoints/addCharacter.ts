import {
  OpenAPIRoute,
  OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import { insertDocumentWithAutoIncrement } from "db/mongodb";

import { Character, Extra, UpdateCharacterType } from "types";
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
    try {
      const reqData: UpdateCharacterType = data.body;
      const mongo = appState.getDbConnection();

      const db = mongo.db("witcher");
      const collection = db.collection("casts");

      const isCharacterExits = await collection.findOne({ name: reqData.name });

      if (isCharacterExits)
        return errorResponse(400, { error: "character already exits" });

      const user = context.user;
      console.log(user);

      if (user.role !== "admin") {
        const isExits = await db
          .collection("pending")
          .findOne({ "data.name": reqData.name });
        console.log(isExits);
        if (isExits)
          return errorResponse(409, {
            error: "This character already in pending list",
          });

        const data = await db.collection("pending").insertOne({
          type: "new",
          data: reqData,
          by: user.username,
          createdAt: Date.now(),
        });
        if (!data || data === null)
          return errorResponse(400, { error: "Cannot add new character" });

        return response(200, {
          message:
            "You data submitted for approvel, thank you for your contribution",
        });
      } else {
        const dbData = await insertDocumentWithAutoIncrement(db, reqData);
        if (!dbData || dbData === null)
          return errorResponse(400, { error: "Cannot add new character" });
      }

      // Add character id to user contribution list

      const extraDetails: Extra = reqData?.extra;
      if (extraDetails && extraDetails?.createdBy) {
        await db.collection("users").updateOne(
          { username: extraDetails.createdBy },
          {
            $push: { contributions: reqData.id },
          }
        );
      }
      return response(201, { message: "Successfully added new character" });
    } catch (error) {
      return errorResponse(500, { error: error.message });
    }
  }
}
