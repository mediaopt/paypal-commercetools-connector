import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { MessagePayload } from '@commercetools/platform-sdk';

function parseRequest(request: Request) {
  if (!request.body) {
    logger.error('Missing request body.');
    throw new CustomError(400, 'Bad request: No Pub/Sub message was received');
  }
  if (!request.body.message) {
    logger.error('Missing body message');
    throw new CustomError(400, 'Bad request: Wrong No Pub/Sub message format');
  }
  const pubSubMessage = request.body.message;
  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;
  if (decodedData) {
    logger.info(`Payload received: ${decodedData}`);
    return JSON.parse(decodedData) as MessagePayload;
  }
  throw new CustomError(400, 'Bad request: No payload in the Pub/Sub message');
}

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  const message = parseRequest(request);
  try {
    switch (message.type) {
      case 'ParcelAddedToDelivery':
        response.status(200).send();
        break;
      default:
        response.status(200).send();
    }
  } catch (error) {
    throw new CustomError(400, `Bad request: ${error}`);
  }

  // Return the response for the client
  response.status(204).send();
};
