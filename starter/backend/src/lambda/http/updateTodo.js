import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import {createLogger} from "../../utils/logger.mjs";
import {updateTodo} from "../../businessLogic/todos.mjs";
import {getUserId} from "../utils.mjs";

const logger = createLogger('updateTodo')

export const handler = middy()
    .use(httpErrorHandler())
    .use(cors({
        credentials: true
    }))
    .handler(async (event) => {
        logger.info("Updating todo")
        const todoId = event.pathParameters.todoId
        const updatedTodoRequest = JSON.parse(event.body)
        logger.info("Request Body: ", {
            todoId,
            request: updatedTodoRequest
        })
        const userId = getUserId(event)
        const updatedTodo = await updateTodo(updatedTodoRequest, todoId, userId)
        return {
            statusCode: 201, body: JSON.stringify({
                message: "Updated todo successfully",
                todo: updatedTodo
            })
        }
    })
