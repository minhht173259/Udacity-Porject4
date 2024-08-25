import * as uuid from 'uuid'
import {TodoAccess} from "../dataLayer/todosAccess.mjs";
import createError from 'http-errors'
import {createLogger} from "../utils/logger.mjs";
import {validateDueDate} from "../lambda/utils.mjs";

const logger = createLogger('todo-business')
const todoAccess = new TodoAccess();

const bucketName = process.env.IMAGES_S3_BUCKET

export async function createTodo(createTodoRequest, userId) {
    logger.info("Creating a new todo item...")

    if (validateDueDate(createTodoRequest.dueDate)) {
        throw createError(400, JSON.stringify({error: "DueDate is in the past"}))
    }

    const todoId = uuid.v4();
    return await todoAccess.createTodo({
        todoId: todoId,
        userId: userId,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        done: false
    })
}

export async function getTodosByUserId(userId) {
    return await todoAccess.getPaginationTodosByUserIdAndDescDueDate(userId);
}

export async function updateTodo(updateTodoRequest, todoId, userId) {
    logger.info(`Business Processing. Updating Todo`)
    if (validateDueDate(updateTodoRequest.dueDate)) {
        throw createError(400, JSON.stringify({error: "DueDate is in the past"}))
    }
    const currentTodo = await todoAccess.getTodo(todoId, userId)
    logger.info("Current Todo", {
        currentTodo
    })
    if (!currentTodo) {
        logger.info(" Failed.....!!")
        throw createError(
            404,
            JSON.stringify({
                error: 'Todo does not exist'
            })
        )
    }
    const updatedTodo = await todoAccess.updateTodo(updateTodoRequest, todoId, userId)
    return true;
}

export async function deleteTodo(todoId, userId) {
    const currentTodo = await todoAccess.getTodo(todoId, userId)
    logger.info("Current Todo", {
        currentTodo
    })
    if (!currentTodo) {
        logger.info(" Failed.....!!")
        throw createError(
            404,
            JSON.stringify({
                error: 'Todo does not exist'
            })
        )
    }
    const deletedTodo = await todoAccess.deleteTodo(todoId, userId)
    if (!deletedTodo) {
        logger.info(" Failed.....!!")
        throw createError(
            404,
            JSON.stringify({
                error: 'Todo does not exist'
            })
        )
    }
    return deletedTodo
}