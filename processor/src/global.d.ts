import '@fastify/request-context';
import { ContextData } from './libs/fastify/context/context';

declare module '@fastify/request-context' {
  interface RequestContextData {
    request: ContextData;
  }
}

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface FastifyInstance {
    vite: any;
  }

  export interface FastifyRequest {
    correlationId?: string;
  }
}
