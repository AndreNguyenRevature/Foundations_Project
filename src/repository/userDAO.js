import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import tryCatch from "../util/tryCatch.js";

const client = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "Users_Table";

async function createUser(user) {
  const command = new PutCommand({
    TableName,
    Item: {
      username: user.username,
      password: user.password,
      role: user.role
    },
  });

  const {data, err} = await tryCatch(documentClient.send(command));
  if(err) throw err;

  //returns the metadata of the request NOT the user data.
  return data;
}

async function getUser(username) {
  const command = new GetCommand({
    TableName,
    Key: { username },
  });

  const {data, err} = await tryCatch(documentClient.send(command));
  if(err) throw err;

  return data.Item;
}
/*
async function deleteUser(username) {
  const command = new DeleteCommand({
    TableName,
    Key: { username },
  });

  try {
    await documentClient.send(command);
    console.log(username);
  } catch (err) {
    console.log(err);
  }
}
*/

export default {
  createUser,
  getUser,
};
