/**
 * Orders
 * An order represents a payment between two or more parties. Use the Orders API to create, update, retrieve, authorize, and capture orders.
 *
 * The version of the OpenAPI document: 2.13
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import http from 'http';
import localVarRequest from 'request';

/* tslint:disable:no-unused-locals */
import { Patch } from '../model-checkout-orders/patch';

import {
  Authentication,
  Interceptor,
  OAuth,
  ObjectSerializer,
  VoidAuth,
} from '../model-checkout-orders/models';

import { HttpError } from './apis';

let defaultBasePath = 'https://api-m.sandbox.paypal.com';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum TrackersApiApiKeys {}

export class TrackersApi {
  protected _basePath = defaultBasePath;
  protected _defaultHeaders: any = {};
  protected _useQuerystring: boolean = false;

  protected authentications = {
    default: <Authentication>new VoidAuth(),
    Oauth2: new OAuth(),
  };

  protected interceptors: Interceptor[] = [];

  constructor(basePath?: string);
  constructor(
    basePathOrUsername: string,
    password?: string,
    basePath?: string
  ) {
    if (password) {
      if (basePath) {
        this.basePath = basePath;
      }
    } else {
      if (basePathOrUsername) {
        this.basePath = basePathOrUsername;
      }
    }
  }

  set useQuerystring(value: boolean) {
    this._useQuerystring = value;
  }

  set basePath(basePath: string) {
    this._basePath = basePath;
  }

  set defaultHeaders(defaultHeaders: any) {
    this._defaultHeaders = defaultHeaders;
  }

  get defaultHeaders() {
    return this._defaultHeaders;
  }

  get basePath() {
    return this._basePath;
  }

  public setDefaultAuthentication(auth: Authentication) {
    this.authentications.default = auth;
  }

  public setApiKey(key: TrackersApiApiKeys, value: string) {
    (this.authentications as any)[TrackersApiApiKeys[key]].apiKey = value;
  }

  set accessToken(token: string) {
    this.authentications.Oauth2.accessToken = token;
  }

  public addInterceptor(interceptor: Interceptor) {
    this.interceptors.push(interceptor);
  }

  /**
   * Updates or cancels the tracking information for a PayPal order, by ID. Updatable attributes or objects:<br/><br/><table><thead><th>Attribute</th><th>Op</th><th>Notes</th></thead><tbody></tr><tr><td><code>items</code></td><td>replace</td><td>Using replace op for <code>items</code> will replace the entire <code>items</code> object with the value sent in request.</td></tr><tr><td><code>notify_payer</code></td><td>replace, add</td><td></td></tr></tbody></table>
   * @summary Update or cancel tracking information for a PayPal order
   * @param id The ID of the order for which to update payment details.
   * @param trackerId The order tracking ID.
   * @param contentType The media type. Required for operations with a request body. The value is &#x60;application/&lt;format&gt;&#x60;, where &#x60;format&#x60; is &#x60;json&#x60;.
   * @param patch
   */
  public async ordersTrackersPatch(
    id: string,
    trackerId: string,
    contentType: string,
    patch?: Array<Patch>,
    options: { headers: { [name: string]: string } } = { headers: {} }
  ): Promise<{ response: http.IncomingMessage; body?: any }> {
    const localVarPath =
      this.basePath +
      '/v2/checkout/orders/{id}/trackers/{tracker_id}'
        .replace('{' + 'id' + '}', encodeURIComponent(String(id)))
        .replace(
          '{' + 'tracker_id' + '}',
          encodeURIComponent(String(trackerId))
        );
    let localVarQueryParameters: any = {};
    let localVarHeaderParams: any = (<any>Object).assign(
      {},
      this._defaultHeaders
    );
    const produces = ['application/json'];
    // give precedence to 'application/json'
    if (produces.indexOf('application/json') >= 0) {
      localVarHeaderParams.Accept = 'application/json';
    } else {
      localVarHeaderParams.Accept = produces.join(',');
    }
    let localVarFormParams: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error(
        'Required parameter id was null or undefined when calling ordersTrackersPatch.'
      );
    }

    // verify required parameter 'trackerId' is not null or undefined
    if (trackerId === null || trackerId === undefined) {
      throw new Error(
        'Required parameter trackerId was null or undefined when calling ordersTrackersPatch.'
      );
    }

    // verify required parameter 'contentType' is not null or undefined
    if (contentType === null || contentType === undefined) {
      throw new Error(
        'Required parameter contentType was null or undefined when calling ordersTrackersPatch.'
      );
    }

    localVarHeaderParams['Content-Type'] = ObjectSerializer.serialize(
      contentType,
      'string'
    );
    (<any>Object).assign(localVarHeaderParams, options.headers);

    let localVarUseFormData = false;

    let localVarRequestOptions: localVarRequest.Options = {
      method: 'PATCH',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
      body: ObjectSerializer.serialize(patch, 'Array<Patch>'),
    };

    let authenticationPromise = Promise.resolve();
    if (this.authentications.Oauth2.accessToken) {
      authenticationPromise = authenticationPromise.then(() =>
        this.authentications.Oauth2.applyToRequest(localVarRequestOptions)
      );
    }
    authenticationPromise = authenticationPromise.then(() =>
      this.authentications.default.applyToRequest(localVarRequestOptions)
    );

    let interceptorPromise = authenticationPromise;
    for (const interceptor of this.interceptors) {
      interceptorPromise = interceptorPromise.then(() =>
        interceptor(localVarRequestOptions)
      );
    }

    return interceptorPromise.then(() => {
      if (Object.keys(localVarFormParams).length) {
        if (localVarUseFormData) {
          (<any>localVarRequestOptions).formData = localVarFormParams;
        } else {
          localVarRequestOptions.form = localVarFormParams;
        }
      }
      return new Promise<{ response: http.IncomingMessage; body?: any }>(
        (resolve, reject) => {
          localVarRequest(localVarRequestOptions, (error, response, body) => {
            if (error) {
              reject(error);
            } else {
              if (
                response.statusCode &&
                response.statusCode >= 200 &&
                response.statusCode <= 299
              ) {
                resolve({ response: response, body: body });
              } else {
                reject(new HttpError(response, body, response.statusCode));
              }
            }
          });
        }
      );
    });
  }
}
