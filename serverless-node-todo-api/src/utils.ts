import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
  DeleteCommand,
  DeleteCommandInput,
  UpdateCommand,
  UpdateCommandInput,
  ScanCommand,
  ScanCommandInput,
  GetCommand,
  GetCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { TODO_TABLE } from "./constants";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const addTodo = async (todo: string) => {
  const timestamp = new Date().toISOString();

  const params: PutCommandInput = {
    TableName: TODO_TABLE,
    Item: {
      id: randomUUID(),
      todo: todo,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  await documentClient.send(new PutCommand(params));

  return params.Item;
};

export const deleteTodo = async (id: string) => {
  const params: DeleteCommandInput = {
    TableName: TODO_TABLE,
    Key: {
      id: id,
    },
  };

  await documentClient.send(new DeleteCommand(params));

  return params.Key;
};

export const updateTodo = async (id: string, checked: boolean) => {
  const timestamp = new Date().toISOString();

  const params: UpdateCommandInput = {
    TableName: TODO_TABLE,
    Key: {
      id: id,
    },
    UpdateExpression: "set checked = :c, updatedAt = :u",
    ExpressionAttributeValues: {
      ":c": checked,
      ":u": timestamp,
    },
    ReturnValues: "UPDATED_NEW",
  };

  await documentClient.send(new UpdateCommand(params));

  return params.Key;
};

export const listTodo = async () => {
  const params: ScanCommandInput = {
    TableName: TODO_TABLE,
  };

  const { Items } = await documentClient.send(new ScanCommand(params));

  return Items;
};

export const getTodo = async (id: string) => {
  const params: GetCommandInput = {
    TableName: TODO_TABLE,
    Key: {
      id: id,
    },
  };

  const { Item } = await documentClient.send(new GetCommand(params));

  return Item;
};
