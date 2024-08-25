import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import {createLogger} from "../../utils/logger.mjs";
import {getTodosByUserId} from "../../businessLogic/todos.mjs";
import {getUserId} from "../utils.mjs";

const logger = createLogger('getTodos')

export const handler = middy()
    .use(httpErrorHandler())
    .use(cors({
        credentials: true
    }))
    .handler(async (event) => {
        logger.info("Getting all todos")
        // Get userId
        const userId = getUserId(event)
        const todos = await getTodosByUserId(userId);
        return {
            statusCode: 201, body: JSON.stringify({
                items: todos
            })
        }
    })
