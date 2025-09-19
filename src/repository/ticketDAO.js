import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import tryCatch from "../util/tryCatch.js";

const client = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "Tickets_Table";

async function createTicket(ticket) {
  const command = new PutCommand({
    TableName,
    Item: {
      ticket_id: ticket.ticket_id,
      employee_name: ticket.employee_name,
      amount: ticket.amount,
      description: ticket.description,
      status: "pending",
    },
  });

  const { data, err } = await tryCatch(documentClient.send(command));
  if (err) throw err;

  return data;
}

async function getTicketById(ticket_id) {
  const command = new GetCommand({
    TableName,
    Key: {
      ticket_id,
    },
  });

  const { data, err } = await tryCatch(documentClient.send(command));
  if (err) throw err;

  return data.Item;
}

async function getAllTicketsByEmployee(username) {
  const command = new QueryCommand({
    TableName,
    IndexName: "employee_name-index",
    KeyConditionExpression: "employee_name = :e",
    ExpressionAttributeValues: {
      ":e": username,
    },
  });

  const { data, err } = await tryCatch(documentClient.send(command));
  if (err) throw err;
  return data.Items;
}

async function updateTicketStatus(ticket_id, status) {
  const command = new UpdateCommand({
    TableName,
    Key: { ticket_id },
    UpdateExpression: "SET #st = :s",
    ExpressionAttributeNames: {
      "#st": "status",
    },
    ExpressionAttributeValues: {
      ":s": status,
    },
    ReturnValues: "UPDATED_NEW",
  });

  const { data, err } = await tryCatch(documentClient.send(command));
  if (err) throw err;
  return data.Attributes;
}

async function getTicketsofStatus(status) {
  const command = new ScanCommand({
    TableName,
    FilterExpression: `#s = :${status}`,
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { [`:${status}`]: status },
  });

  const { data, err } = await tryCatch(documentClient.send(command));
  if (err) throw err;
  return data.Items;
}

async function getAllTickets() {
  const command = new ScanCommand({
    TableName,
  });

  const { data, err } = await tryCatch(documentClient.send(command));
  if (err) throw err;
  return data.Items;
}

async function getTicketsByEmployeeAndStatus(username, status) {
  const command = new QueryCommand({
    TableName,
    IndexName: "employee_name-index",
    KeyConditionExpression: "employee_name = :e",
    FilterExpression: "#st = :s",
    ExpressionAttributeNames: {
      "#st": "status",
    },
    ExpressionAttributeValues: {
      ":e": username,
      ":s": status,
    },
  });

  const { data, err } = await tryCatch(documentClient.send(command));
  if (err) throw err;
  return data.Items;
}



export default {
  createTicket,
  getTicketById,
  updateTicketStatus,
  getAllTicketsByEmployee,
  getTicketsofStatus,
  getAllTickets,
  getTicketsByEmployeeAndStatus
};
