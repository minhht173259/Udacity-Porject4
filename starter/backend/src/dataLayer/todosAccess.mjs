import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import {createLogger} from "../utils/logger.mjs";

const logger = createLogger('todo-access')


export class TodoAccess {
    constructor(
        documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
        todosTable = process.env.TODOS_TABLE,
        dueDateIndex = process.env.TODO_DATE_INDEX
    ) {
        this.documentClient = documentClient
        this.todosTable = todosTable
        this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
        this.dueDateIndex = dueDateIndex
    }

    async getAllTodos(userId) {
        logger.info("DynamoDB is getting all todos")

        const result = await this.dynamoDbClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        })
        return result.Items
    }

        async getPaginationTodosByUserIdAndDescDueDate(userId) {
        logger.info("DynamoDB is getting all todos")

        const result = await this.dynamoDbClient.query({
            TableName: this.todosTable,
            IndexName: this.dueDateIndex,
            Limit: 10,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        })
        return result.Items
    }

    async createTodo(todo) {
        logger.info(`Dynamo DB is creating a todo with id`, {
            todo
        })

        await this.dynamoDbClient.put({
            TableName: this.todosTable,
            Item: todo
        })

        return todo
    }

    async updateTodo(todo, todoId, userId) {
        logger.info(`DynamoDB is updating a todo with id`, {
            todo
        })
        const updatedTodo = await this.dynamoDbClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":name": todo.name,
                ":dueDate": todo.dueDate,
                ":done": todo.done
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ReturnValues: "UPDATED_NEW"
        }, (err, data) => {
            if (data) {
                logger.info("Data: ", {
                    response: data
                })
            }
            logger.info("Failed to update a todo", {
                err
            })
        })
        // Rollback
        logger.info("Updated Todo: ", {
            updatedTodo: JSON.stringify(updatedTodo)
        })
    }

    async getTodo(todoId, userId) {
        logger.info("DynamoDB is getting a todo by ID:", {
            todoId
        })
        const config = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            }
        }
        logger.info("Configuration......", {
            config
        })
        const todo = await this.dynamoDbClient.get(config)

        logger.info("Data Todo: ", {
            "todo": JSON.stringify(todo)
        })
        return todo.Item
    }

    async deleteTodo(todoId, userId) {
        logger.info("DynamoDB is deleting a todo by ID: ", todoId)
        const config = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            ReturnValues: "ALL_OLD"
        }
        logger.info("Deleting Configuration", {
            config: config
        })
        const response = await this.dynamoDbClient.delete(config)
        logger.info("Deleted todo: ", {
            todo: response
        })
        return !!response.Attributes;
    }
}
