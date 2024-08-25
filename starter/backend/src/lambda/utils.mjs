import { parseUserId } from '../auth/utils.mjs'
import {createLogger} from "../utils/logger.mjs";

const logger = createLogger('util-functions')
export function getUserId(event) {
  const authorization = event.headers.Authorization
  logger.info("Authentication", {
    authorization: event.headers.Authorization
  })
  const split = authorization.split(' ')
  const jwtToken = split[1]

  logger.info("jwtToken: ", {
    jwtToken: jwtToken
  })

  return parseUserId(jwtToken)
}

export function validateDueDate(dueDateString) {
  const dueDate = new Date(dueDateString);
  return dueDate < new Date()
}