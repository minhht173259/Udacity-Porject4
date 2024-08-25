import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import {createLogger} from "../../utils/logger.mjs";
import {getSignedUrl} from "../../businessLogic/images.mjs";
import {getUserId} from "../utils.mjs";

const logger = createLogger('generateUploadUrl')

export const handler = middy()
    .use(httpErrorHandler())
    .use(cors({
        credentials: true
    }))
    .handler(async (event) => {
        logger.info("Getting Singed URL")
        const todoId = event.pathParameters.todoId
        // Get userId
        const userId = getUserId(event)
        const response = await getSignedUrl(todoId, userId)
        return {
            statusCode: 201, body: JSON.stringify(response)
        }
    })
