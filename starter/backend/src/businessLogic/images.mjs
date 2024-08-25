import * as uuid from 'uuid'
import {TodoAccess} from "../dataLayer/todosAccess.mjs";
import createError from 'http-errors'
import {createLogger} from "../utils/logger.mjs";
import {ImageAccess} from "../dataLayer/imageAccess.mjs";

const logger = createLogger('image-business')
const todoAccess = new TodoAccess();
const imageAccess = new ImageAccess();

export async function getSignedUrl(todoId, userId) {
    logger.info("Images Business. Getting Signed Url")
    const currentTodo = await todoAccess.getTodo(todoId, userId);
    if (!currentTodo) {
        throw createError(
            404,
            JSON.stringify({
                error: 'Todo does not exist'
            })
        )
    }
    logger.info("Current Todo: ", {
        todo: currentTodo
    })
    logger.info("Getting Signed URL")
    const url = await imageAccess.getSignedUrl(todoId)
    return {
        todo: currentTodo,
        uploadUrl: url
    }

}