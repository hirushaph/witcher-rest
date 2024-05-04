import { getDb } from "db/mongodb";
import { errorResponse } from "utils/response";

export async function checkDbConnection(
  request: Request,
  env: any,
  context: any
) {
  try {
    const dbConnection = await getDb(env);
    if (!dbConnection) {
      return errorResponse(500, { error: "Database Error!" });
    }
  } catch (error) {
    return errorResponse(500, { error: "Server Error!" });
  }
}
