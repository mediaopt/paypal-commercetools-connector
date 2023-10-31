import { NextFunction, Request, Response } from 'express';
import { apiSuccess } from '../api/success.api';
import CustomError from '../errors/custom.error';
import { customerController } from './customers.controller';
import { paymentController } from './payments.controller';

/**
 * Exposed service endpoint.
 * - Receives a POST request, parses the action and the controller
 * and returns it to the correct controller. We should be use 3. `Cart`, `Order` and `Payments`
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @param {NextFunction} next
 * @returns
 */
export const post = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // Deserialize the action and resource from the body
  const { action, resource } = request.body;

  try {
    if (!action || !resource) {
      throw new CustomError(400, 'Bad request - Missing body parameters.');
    }
    switch (resource.typeId) {
      case 'cart':
        break;
      case 'payment':
        try {
          const data = await paymentController(action, resource);

          if (data && data.statusCode === 200) {
            apiSuccess(200, data.actions, response);
            return;
          }

          throw new CustomError(
            data ? data.statusCode : 400,
            JSON.stringify(data)
          );
        } catch (error) {
          if (error instanceof Error) {
            throw new CustomError(500, error.message);
          }
        }
        break;
      case 'customer':
        try {
          const data = await customerController(action, resource);

          if (data && data.statusCode === 200) {
            apiSuccess(200, data.actions, response);
            return;
          }
          throw new CustomError(
            data ? data.statusCode : 400,
            JSON.stringify(data)
          );
        } catch (error) {
          if (error instanceof Error) {
            throw new CustomError(500, error.message);
          }
        }
        break;

      case 'order':
        break;

      default:
        throw new CustomError(
          500,
          `Internal Server Error - Resource not recognized. Allowed values are 'cart', 'payments' or 'orders'.`
        );
    }
  } catch (error) {
    if (error instanceof Error) {
      next(new CustomError(500, error.message));
    } else {
      next(error);
    }
  }
};
