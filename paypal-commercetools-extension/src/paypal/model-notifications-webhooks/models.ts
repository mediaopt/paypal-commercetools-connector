import localVarRequest from 'request';

export * from './error400';
export * from './error401';
export * from './error403';
export * from './error404';
export * from './error409';
export * from './error415';
export * from './error422';
export * from './error500';
export * from './error503';
export * from './errorDefault';
export * from './errorDetails';
export * from './event';
export * from './eventList';
export * from './eventResend';
export * from './eventType';
export * from './eventTypeList';
export * from './linkDescription';
export * from './patch';
export * from './simulateEvent';
export * from './verifyWebhookSignature';
export * from './verifyWebhookSignatureResponse';
export * from './webhook';
export * from './webhookList';
export * from './webhookLookupList';
export * from './webhooksLookup';

import * as fs from 'fs';

export interface RequestDetailedFile {
  value: Buffer;
  options?: {
    filename?: string;
    contentType?: string;
  };
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;

import { Error400 } from './error400';
import { Error401 } from './error401';
import { Error403 } from './error403';
import { Error404 } from './error404';
import { Error409 } from './error409';
import { Error415 } from './error415';
import { Error422 } from './error422';
import { Error500 } from './error500';
import { Error503 } from './error503';
import { ErrorDefault } from './errorDefault';
import { ErrorDetails } from './errorDetails';
import { Event } from './event';
import { EventList } from './eventList';
import { EventResend } from './eventResend';
import { EventType } from './eventType';
import { EventTypeList } from './eventTypeList';
import { LinkDescription } from './linkDescription';
import { Patch } from './patch';
import { SimulateEvent } from './simulateEvent';
import { VerifyWebhookSignature } from './verifyWebhookSignature';
import { VerifyWebhookSignatureResponse } from './verifyWebhookSignatureResponse';
import { Webhook } from './webhook';
import { WebhookList } from './webhookList';
import { WebhookLookupList } from './webhookLookupList';
import { WebhooksLookup } from './webhooksLookup';

/* tslint:disable:no-unused-variable */
let primitives = [
  'string',
  'boolean',
  'double',
  'integer',
  'long',
  'float',
  'number',
  'any',
];

let enumsMap: { [index: string]: any } = {
  'Error400.NameEnum': Error400.NameEnum,
  'Error400.MessageEnum': Error400.MessageEnum,
  'Error401.NameEnum': Error401.NameEnum,
  'Error401.MessageEnum': Error401.MessageEnum,
  'Error403.NameEnum': Error403.NameEnum,
  'Error403.MessageEnum': Error403.MessageEnum,
  'Error404.NameEnum': Error404.NameEnum,
  'Error404.MessageEnum': Error404.MessageEnum,
  'Error409.NameEnum': Error409.NameEnum,
  'Error409.MessageEnum': Error409.MessageEnum,
  'Error415.NameEnum': Error415.NameEnum,
  'Error415.MessageEnum': Error415.MessageEnum,
  'Error422.NameEnum': Error422.NameEnum,
  'Error422.MessageEnum': Error422.MessageEnum,
  'Error500.NameEnum': Error500.NameEnum,
  'Error500.MessageEnum': Error500.MessageEnum,
  'Error500.InformationLinkEnum': Error500.InformationLinkEnum,
  'Error503.NameEnum': Error503.NameEnum,
  'Error503.MessageEnum': Error503.MessageEnum,
  'ErrorDefault.NameEnum': ErrorDefault.NameEnum,
  'ErrorDefault.MessageEnum': ErrorDefault.MessageEnum,
  'LinkDescription.MethodEnum': LinkDescription.MethodEnum,
  'Patch.OpEnum': Patch.OpEnum,
  'VerifyWebhookSignatureResponse.VerificationStatusEnum':
    VerifyWebhookSignatureResponse.VerificationStatusEnum,
};

let typeMap: { [index: string]: any } = {
  Error400: Error400,
  Error401: Error401,
  Error403: Error403,
  Error404: Error404,
  Error409: Error409,
  Error415: Error415,
  Error422: Error422,
  Error500: Error500,
  Error503: Error503,
  ErrorDefault: ErrorDefault,
  ErrorDetails: ErrorDetails,
  Event: Event,
  EventList: EventList,
  EventResend: EventResend,
  EventType: EventType,
  EventTypeList: EventTypeList,
  LinkDescription: LinkDescription,
  Patch: Patch,
  SimulateEvent: SimulateEvent,
  VerifyWebhookSignature: VerifyWebhookSignature,
  VerifyWebhookSignatureResponse: VerifyWebhookSignatureResponse,
  Webhook: Webhook,
  WebhookList: WebhookList,
  WebhookLookupList: WebhookLookupList,
  WebhooksLookup: WebhooksLookup,
};

export class ObjectSerializer {
  public static findCorrectType(data: any, expectedType: string) {
    if (data == undefined) {
      return expectedType;
    } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
      return expectedType;
    } else if (expectedType === 'Date') {
      return expectedType;
    } else {
      if (enumsMap[expectedType]) {
        return expectedType;
      }

      if (!typeMap[expectedType]) {
        return expectedType; // w/e we don't know the type
      }

      // Check the discriminator
      let discriminatorProperty = typeMap[expectedType].discriminator;
      if (discriminatorProperty == null) {
        return expectedType; // the type does not have a discriminator. use it.
      } else {
        if (data[discriminatorProperty]) {
          var discriminatorType = data[discriminatorProperty];
          if (typeMap[discriminatorType]) {
            return discriminatorType; // use the type given in the discriminator
          } else {
            return expectedType; // discriminator did not map to a type
          }
        } else {
          return expectedType; // discriminator was not present (or an empty string)
        }
      }
    }
  }

  public static serialize(data: any, type: string) {
    if (data == undefined) {
      return data;
    } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
      return data;
    } else if (type.lastIndexOf('Array<', 0) === 0) {
      // string.startsWith pre es6
      let subType: string = type.replace('Array<', ''); // Array<Type> => Type>
      subType = subType.substring(0, subType.length - 1); // Type> => Type
      let transformedData: any[] = [];
      for (let index = 0; index < data.length; index++) {
        let datum = data[index];
        transformedData.push(ObjectSerializer.serialize(datum, subType));
      }
      return transformedData;
    } else if (type === 'Date') {
      return data.toISOString();
    } else {
      if (enumsMap[type]) {
        return data;
      }
      if (!typeMap[type]) {
        // in case we dont know the type
        return data;
      }

      // Get the actual type of this object
      type = this.findCorrectType(data, type);

      // get the map for the correct type.
      let attributeTypes = typeMap[type].getAttributeTypeMap();
      let instance: { [index: string]: any } = {};
      for (let index = 0; index < attributeTypes.length; index++) {
        let attributeType = attributeTypes[index];
        instance[attributeType.baseName] = ObjectSerializer.serialize(
          data[attributeType.name],
          attributeType.type
        );
      }
      return instance;
    }
  }

  public static deserialize(data: any, type: string) {
    // polymorphism may change the actual type.
    type = ObjectSerializer.findCorrectType(data, type);
    if (data == undefined) {
      return data;
    } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
      return data;
    } else if (type.lastIndexOf('Array<', 0) === 0) {
      // string.startsWith pre es6
      let subType: string = type.replace('Array<', ''); // Array<Type> => Type>
      subType = subType.substring(0, subType.length - 1); // Type> => Type
      let transformedData: any[] = [];
      for (let index = 0; index < data.length; index++) {
        let datum = data[index];
        transformedData.push(ObjectSerializer.deserialize(datum, subType));
      }
      return transformedData;
    } else if (type === 'Date') {
      return new Date(data);
    } else {
      if (enumsMap[type]) {
        // is Enum
        return data;
      }

      if (!typeMap[type]) {
        // dont know the type
        return data;
      }
      let instance = new typeMap[type]();
      let attributeTypes = typeMap[type].getAttributeTypeMap();
      for (let index = 0; index < attributeTypes.length; index++) {
        let attributeType = attributeTypes[index];
        instance[attributeType.name] = ObjectSerializer.deserialize(
          data[attributeType.baseName],
          attributeType.type
        );
      }
      return instance;
    }
  }
}

export interface Authentication {
  /**
   * Apply authentication settings to header and query params.
   */
  applyToRequest(requestOptions: localVarRequest.Options): Promise<void> | void;
}

export class HttpBasicAuth implements Authentication {
  public username: string = '';
  public password: string = '';

  applyToRequest(requestOptions: localVarRequest.Options): void {
    requestOptions.auth = {
      username: this.username,
      password: this.password,
    };
  }
}

export class HttpBearerAuth implements Authentication {
  public accessToken: string | (() => string) = '';

  applyToRequest(requestOptions: localVarRequest.Options): void {
    if (requestOptions && requestOptions.headers) {
      const accessToken =
        typeof this.accessToken === 'function'
          ? this.accessToken()
          : this.accessToken;
      requestOptions.headers['Authorization'] = 'Bearer ' + accessToken;
    }
  }
}

export class ApiKeyAuth implements Authentication {
  public apiKey: string = '';

  constructor(private location: string, private paramName: string) {}

  applyToRequest(requestOptions: localVarRequest.Options): void {
    if (this.location == 'query') {
      (<any>requestOptions.qs)[this.paramName] = this.apiKey;
    } else if (
      this.location == 'header' &&
      requestOptions &&
      requestOptions.headers
    ) {
      requestOptions.headers[this.paramName] = this.apiKey;
    } else if (
      this.location == 'cookie' &&
      requestOptions &&
      requestOptions.headers
    ) {
      if (requestOptions.headers['Cookie']) {
        requestOptions.headers['Cookie'] +=
          '; ' + this.paramName + '=' + encodeURIComponent(this.apiKey);
      } else {
        requestOptions.headers['Cookie'] =
          this.paramName + '=' + encodeURIComponent(this.apiKey);
      }
    }
  }
}

export class OAuth implements Authentication {
  public accessToken: string = '';

  applyToRequest(requestOptions: localVarRequest.Options): void {
    if (requestOptions && requestOptions.headers) {
      requestOptions.headers['Authorization'] = 'Bearer ' + this.accessToken;
    }
  }
}

export class VoidAuth implements Authentication {
  public username: string = '';
  public password: string = '';

  applyToRequest(_: localVarRequest.Options): void {
    // Do nothing
  }
}

export type Interceptor = (
  requestOptions: localVarRequest.Options
) => Promise<void> | void;
