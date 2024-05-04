import * as Realm from "realm-web";
import { Character } from "types";

import appState from "utils/state";

export async function getDb(env: any) {
  try {
    const dbConnection = appState.getDbConnection();

    if (!dbConnection) {
      const app = Realm.getApp(env.APP_ID);

      const credentials = Realm.Credentials.apiKey(env.API_KEY);

      const user = await app.logIn(credentials);

      const mongo = user.mongoClient("mongodb-atlas");

      appState.setDbConnection(mongo);
      return mongo;
    }
    return dbConnection;
  } catch (error) {
    return false;
  }
}

async function getNextSequenceValue(
  db: any,
  sequenceName: string
): Promise<number> {
  const result = await db
    .collection("sequences")
    .findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { sequence_value: 1 } },
      { upsert: true, returnNewDocument: true }
    );
  return result.sequence_value;
}

// Function to insert a document with an auto-incremented ID
export async function insertDocumentWithAutoIncrement(
  db: any,
  document: Character
) {
  const id = await getNextSequenceValue(db, "characters");
  document.id = id;
  const data = await db.collection("casts").insertOne(document);
  return data;
}
