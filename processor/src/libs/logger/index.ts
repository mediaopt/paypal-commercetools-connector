import { createApplicationLogger, rewriteFieldsFormatter } from '@commercetools-backend/loggers';
import { getRequestContext } from '../fastify/context/context';
import { config } from '../../config/config';

type LogFormat = NonNullable<
  NonNullable<Parameters<typeof createApplicationLogger>[0]>['formatters']
>[number];

/**
 * Prefixes every line logged during a request with `METHOD /route/template: `, so lines of different
 * routes are told apart by their text. The replacers below only rewrite fields a log call already
 * passes, so they never reach a plain-string line. Uses the route template, never the request URL:
 * a path param can be a payment method token (DELETE /stored-payment-methods/:id) and the query string
 * is whatever the caller sent. Lines outside a request (startup, jobs) stay as they are.
 * A helper reached from more than one route keeps its own `functionName: ` prefix, since the route
 * alone doesn't identify it; anything else leaves the name to this prefix.
 */
export const routePrefixFormatter: LogFormat = {
  transform: (info) => {
    const { method, pathTemplate } = getRequestContext();
    if (method) {
      info.message = `${method} ${pathTemplate ?? 'unmatched route'}: ${info.message}`;
    }
    return info;
  },
};

/**
 * Custom fields formatter to replace the removed defaultFieldsFormatter from the SDK
 * Uses rewriteFieldsFormatter to add standard fields to all log messages
 */
export const log = createApplicationLogger({
  formatters: [
    rewriteFieldsFormatter({
      fields: [
        {
          from: 'projectKey',
          to: 'projectKey',
          replaceValue: () => config.projectKey,
        },
        {
          from: 'version',
          to: 'version',
          replaceValue: () => process.env.npm_package_version || 'unknown',
        },
        {
          from: 'name',
          to: 'name',
          replaceValue: () => process.env.npm_package_name || 'unknown',
        },
        {
          from: 'correlationId',
          to: 'correlationId',
          replaceValue: () => getRequestContext().correlationId,
        },
        {
          from: 'pathTemplate',
          to: 'pathTemplate',
          replaceValue: () => getRequestContext().pathTemplate,
        },
        {
          from: 'path',
          to: 'path',
          replaceValue: () => getRequestContext().path,
        },
      ],
    }),
    routePrefixFormatter,
  ],
});
