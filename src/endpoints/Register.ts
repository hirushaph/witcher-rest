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

      if (isUserExits || !isUserExits === null)
        return errorResponse(400, {
          error: "User name unavaliable, please use another username",
        });

      // Hash password
      const salt = bcrypt.genSaltSync(10);

      const hash = await bcrypt.hash(reqData.password, salt);

      if (!hash) return errorResponse(500, { error: "Server Error" });

      // User object
      const createUser = {
        username: reqData.username,
        password: hash,
        role: "user",
        contributions: [],
      };

      // Generate JWT Token

      const token = await jwt.sign(
        { username: createUser.username, role: createUser.role },
        env.JWT_SECRET
      );
      if (!token) return errorResponse(500, { error: "Server Error" });

      // save user to db

      const user = await collection.insertOne(createUser);

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
            "Set-Cookie": `accessKey=${token}; Path=/; HttpOnly`,
          },
        }
      );
    } catch (error) {
      return errorResponse(400, { error: error.statusText });
    }
  }
}
