import {
  OpenAPIRoute,
  OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import appState from "utils/state";

import jwt from "@tsndr/cloudflare-worker-jwt";

import bcrypt from "bcryptjs";
import { errorResponse, response } from "utils/response";

export class Login extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Auth"],
    summary: "Only for add and edit characters",
    requestBody: {
      username: String,
      password: String,
    },
    responses: {
      "200": {
        description: "Login to account",
        schema: {
          success: Boolean,
          message: "Login Successfully",
          user: {
            username: String,
          },
        },
        headers: {
          "Set-Cookie": String,
        },
      },
      "400": {
        description: "Login faield",
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
    const reqData: {
      username: string;
      password: string;
    } = data.body;

    const mongo = appState.getDbConnection();

    const db = mongo.db("witcher");
    const collection = db.collection("casts");

    // check if user already exits
    const user = await collection.findOne({ username: reqData.username });

    if (!user || user === null)
      return errorResponse(400, { error: "Username or password wrong" });

    // check password

    const isPasswordCurrect = await bcrypt.compare(
      reqData.password,
      user.password
    );

    if (!isPasswordCurrect)
      return errorResponse(400, { error: "Username or password wrong" });

    const token = await jwt.sign(
      { username: reqData.username, email: reqData.password },
      env.JWT_SECRET
    );

    if (!token) return errorResponse(400, { error: "Server Error" });

    return Response.json(
      {
        success: true,
        message: "Login successfull",
        user: {
          username: reqData.username,
        },
      },
      {
        headers: {
          "Set-Cookie": `acsessKey=${token}; Path=/; HttpOnly`,
        },
      }
    );
  }
}
