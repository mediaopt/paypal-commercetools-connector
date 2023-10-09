import http from 'http';
import localVarRequest from 'request';

/* tslint:disable:no-unused-locals */
import { Capture2 } from '../model-payments-payment/capture2';
import { Refund } from '../model-payments-payment/refund';
import { RefundRequest } from '../model-payments-payment/refundRequest';

import {
  Authentication,
  Interceptor,
  OAuth,
  ObjectSerializer,
  VoidAuth,
} from '../model-payments-payment/models';

import { HttpError } from './apis';

let defaultBasePath = 'https://api-m.sandbox.paypal.com';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum CapturesApiApiKeys {}

export class CapturesApi {
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

  public setApiKey(key: CapturesApiApiKeys, value: string) {
    (this.authentications as any)[CapturesApiApiKeys[key]].apiKey = value;
  }

  set accessToken(token: string) {
    this.authentications.Oauth2.accessToken = token;
  }

  public addInterceptor(interceptor: Interceptor) {
    this.interceptors.push(interceptor);
  }

  /**
   * Shows details for a captured payment, by ID.
   * @summary Show captured payment details
   * @param captureId The PayPal-generated ID for the captured payment to refund.
   * @param contentType The media type. Required for operations with a request body. The value is &#x60;application/&lt;format&gt;&#x60;, where &#x60;format&#x60; is &#x60;json&#x60;.
   */
  public async capturesGet(
    captureId: string,
    contentType: string,
    options: { headers: { [name: string]: string } } = { headers: {} }
  ): Promise<{ response: http.IncomingMessage; body: Capture2 }> {
    const localVarPath =
      this.basePath +
      '/v2/payments/captures/{capture_id}'.replace(
        '{' + 'capture_id' + '}',
        encodeURIComponent(String(captureId))
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

    // verify required parameter 'captureId' is not null or undefined
    if (captureId === null || captureId === undefined) {
      throw new Error(
        'Required parameter captureId was null or undefined when calling capturesGet.'
      );
    }

    // verify required parameter 'contentType' is not null or undefined
    if (contentType === null || contentType === undefined) {
      throw new Error(
        'Required parameter contentType was null or undefined when calling capturesGet.'
      );
    }

    localVarHeaderParams['Content-Type'] = ObjectSerializer.serialize(
      contentType,
      'string'
    );
    (<any>Object).assign(localVarHeaderParams, options.headers);

    let localVarUseFormData = false;

    let localVarRequestOptions: localVarRequest.Options = {
      method: 'GET',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
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
      return new Promise<{ response: http.IncomingMessage; body: Capture2 }>(
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
                body = ObjectSerializer.deserialize(body, 'Capture2');
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
  /**
   * Refunds a captured payment, by ID. For a full refund, include an empty payload in the JSON request body. For a partial refund, include an <code>amount</code> object in the JSON request body.
   * @summary Refund captured payment
   * @param captureId The PayPal-generated ID for the captured payment to refund.
   * @param payPalRequestId The server stores keys for 45 days.
   * @param contentType The media type. Required for operations with a request body. The value is &#x60;application/&lt;format&gt;&#x60;, where &#x60;format&#x60; is &#x60;json&#x60;.
   * @param prefer The preferred server response upon successful completion of the request. Value is:&lt;ul&gt;&lt;li&gt;&lt;code&gt;return&#x3D;minimal&lt;/code&gt;. The server returns a minimal response to optimize communication between the API caller and the server. A minimal response includes the &lt;code&gt;id&lt;/code&gt;, &lt;code&gt;status&lt;/code&gt; and HATEOAS links.&lt;/li&gt;&lt;li&gt;&lt;code&gt;return&#x3D;representation&lt;/code&gt;. The server returns a complete resource representation, including the current state of the resource.&lt;/li&gt;&lt;/ul&gt;
   * @param payPalAuthAssertion An API-caller-provided JSON Web Token (JWT) assertion that identifies the merchant. For details, see [PayPal-Auth-Assertion](/docs/api/reference/api-requests/#paypal-auth-assertion).&lt;blockquote&gt;&lt;strong&gt;Note:&lt;/strong&gt;For three party transactions in which a partner is managing the API calls on behalf of a merchant, the partner must identify the merchant using either a PayPal-Auth-Assertion header or an access token with target_subject.&lt;/blockquote&gt;
   * @param refundRequest
   */
  public async capturesRefund(
    captureId: string,
    payPalRequestId: string,
    contentType: string,
    prefer?: string,
    payPalAuthAssertion?: string,
    refundRequest?: RefundRequest,
    options: { headers: { [name: string]: string } } = { headers: {} }
  ): Promise<{ response: http.IncomingMessage; body: Refund }> {
    const localVarPath =
      this.basePath +
      '/v2/payments/captures/{capture_id}/refund'.replace(
        '{' + 'capture_id' + '}',
        encodeURIComponent(String(captureId))
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

    // verify required parameter 'captureId' is not null or undefined
    if (captureId === null || captureId === undefined) {
      throw new Error(
        'Required parameter captureId was null or undefined when calling capturesRefund.'
      );
    }

    // verify required parameter 'payPalRequestId' is not null or undefined
    if (payPalRequestId === null || payPalRequestId === undefined) {
      throw new Error(
        'Required parameter payPalRequestId was null or undefined when calling capturesRefund.'
      );
    }

    // verify required parameter 'contentType' is not null or undefined
    if (contentType === null || contentType === undefined) {
      throw new Error(
        'Required parameter contentType was null or undefined when calling capturesRefund.'
      );
    }

    localVarHeaderParams['PayPal-Request-Id'] = ObjectSerializer.serialize(
      payPalRequestId,
      'string'
    );
    localVarHeaderParams['Prefer'] = ObjectSerializer.serialize(
      prefer,
      'string'
    );
    localVarHeaderParams['Content-Type'] = ObjectSerializer.serialize(
      contentType,
      'string'
    );
    localVarHeaderParams['PayPal-Auth-Assertion'] = ObjectSerializer.serialize(
      payPalAuthAssertion,
      'string'
    );
    (<any>Object).assign(localVarHeaderParams, options.headers);

    let localVarUseFormData = false;

    let localVarRequestOptions: localVarRequest.Options = {
      method: 'POST',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
      body: ObjectSerializer.serialize(refundRequest, 'RefundRequest'),
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
      return new Promise<{ response: http.IncomingMessage; body: Refund }>(
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
                body = ObjectSerializer.deserialize(body, 'Refund');
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
