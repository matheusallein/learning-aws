import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb"
import { handler } from "../handler";

jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});
jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn().mockImplementation(() => {
        return {
          send: jest.fn().mockImplementation(() => {
            return {
              Items: [{
                id: "123",
                location: "Paris",
              }],
            };
          }),
        };
      }),
    },
    /* Return your other docClient methods here too... */
    ScanCommand: jest.fn(),
  };
});

describe("Spaces handler test suite", () => {
  test("Returns spaces from dynamoDb", async () => {
    const result = await handler(
      {
        httpMethod: "GET",
      } as any,
      {} as any
    );

    expect(result.statusCode).toBe(200);
    const expectedResult = [
      {
        id: "123",
        location: "Paris",
      },
    ];
    const parsedResultBody = JSON.parse(result.body);
    expect(parsedResultBody).toEqual(expectedResult);

    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(ScanCommand).toHaveBeenCalledTimes(1);
  });
});
