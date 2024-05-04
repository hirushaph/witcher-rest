import { errorResponse } from "utils/response";
import { parse } from "cookie";

import jwt from "@tsndr/cloudflare-worker-jwt";

export async function authorization(request: Request, env: any, context: any) {
  try {
    // get auth key from headers
    const cookie = request.headers.get("cookie");
    if (!cookie || cookie === null)
      return errorResponse(401, {
        error: "You need login to access this route",
      });

    const { accessKey } = parse(cookie);

    if (!accessKey)
      return errorResponse(401, {
        error: "You need login to access this route",
      });

    const isValid = await jwt.verify(accessKey, env.JWT_SECRET);

    if (!isValid) return errorResponse(401, { error: "Auth Failed" });

    // Decode token get user details
    const { payload } = jwt.decode(accessKey);

    context.user = payload;
    return;
  } catch (error) {
    return errorResponse(401, { error: "Auth failed" });
  }
}
