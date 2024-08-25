import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import {createLogger} from "../../utils/logger.mjs";
import {deleteTodo} from "../../businessLogic/todos.mjs";
import {getUserId} from "../utils.mjs";

const logger = createLogger('deleteTodo')

export const handler = middy()
    .use(httpErrorHandler())
    .use(cors({
        credentials: true
    }))
    .handler(async (event) => {
        logger.info("Deleting todo")
        const todoId = event.pathParameters.todoId
        const userId = getUserId(event)
        await deleteTodo(todoId, userId)
        return {
            statusCode: 201, body: "Deleted todo"
        }
    })
