import {
  OpenAPIRoute,
  OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import appState from "utils/state";

import jwt from "@tsndr/cloudflare-worker-jwt";

import bcrypt from "bcryptjs";
import { errorResponse, response } from "utils/response";

export class Register extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Auth"],
    summary: "Create new account",
    requestBody: {
      username: String,
      password: String,
    },
    responses: {
      "200": {
        description: "Create new account",
        schema: {
          success: Boolean,
          message: "Account successfully created",
          user: {
            username: String,
          },
        },
        headers: {
          "Set-Cookie": String,
        },
      },
      "400": {
        description: "Account created failed",
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

    try {
      const mongo = appState.getDbConnection();

      const db = mongo.db("witcher");

      const collection = db.collection("users");

      // check if user already exits
      const isUserExits = await collection.findOne({
        username: reqData.username,
      });

      console.log(isUserExits);

      if (!isUserExits || isUserExits === null)
        return errorResponse(400, {
          error: "User name unavaliable, please use another username",
        });

      // check password

      // Hash password
      const salt = bcrypt.genSaltSync(10);

      const hash = await bcrypt.hash(reqData.password, salt);

      if (!hash) return errorResponse(500, { error: "Server Error" });

      // Generate JWT Token

      const token = await jwt.sign(
        { username: reqData.username, email: reqData.password },
        env.JWT_SECRET
      );
      if (!token) return errorResponse(500, { error: "Server Error" });

      // save user to db

      const user = await collection.insertOne({
        username: reqData.username,
        password: hash,
      });

      if (!user) return errorResponse(500, { error: "Server Error" });

      return Response.json(
        {
          success: true,
          message: "Account successfully created",
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
    } catch (error) {
      return errorResponse(error.statusCode, { error: error.statusText });
    }
  }
}
