import {
  OpenAPIRoute,
  OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import { Extra, UpdateCharacterType } from "types";
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

    const user = context.user;

    if (user.role !== "admin") {
      const isPendingData = await mongo
        .db("witcher")
        .collection("pending")
        .findOne({ "data.id": reqData.id });

      const data = await mongo.db("witcher").collection("pending").insertOne({
        type: "edit",
        data: reqData,
        by: user.username,
        requestedAt: Date.now(),
      });
      if (!data || data === null)
        return errorResponse(400, { error: "Cannot edit character" });

      return response(202, {
        status: isPendingData
          ? "There is pending edit requests for this character, you request might get rejected by already fullfiled pending request"
          : "",
        message: `You data submitted for approvel, thank you for your contribution`,
      });
    } else {
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
        // Add character id to user contribution list
        const extraDetails: Extra = reqData?.extra;
        if (extraDetails && extraDetails?.editedBy) {
          await mongo
            .db("witcher")
            .collection("users")
            .updateOne(
              { username: extraDetails.editedBy },
              {
                $push: { contributions: reqData.id },
              }
            );
        }

        return response(200, { message: "Character updated successfully" });
      }
    }

    return;
  }
}
