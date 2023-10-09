/**
 * The request-related [HATEOAS link](/api/rest/responses/#hateoas-links) information.
 */
export class LinkDescription {
  /**
   * The complete target URL. To make the related call, combine the method with this [URI Template-formatted](https://tools.ietf.org/html/rfc6570) link. For pre-processing, include the `$`, `(`, and `)` characters. The `href` is the key HATEOAS component that links a completed call with a subsequent call.
   */
  'href': string;
  /**
   * The [link relation type](https://tools.ietf.org/html/rfc5988#section-4), which serves as an ID for a link that unambiguously describes the semantics of the link. See [Link Relations](https://www.iana.org/assignments/link-relations/link-relations.xhtml).
   */
  'rel': string;
  /**
   * The HTTP method required to make the related call.
   */
  'method'?: LinkDescription.MethodEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'href',
      baseName: 'href',
      type: 'string',
    },
    {
      name: 'rel',
      baseName: 'rel',
      type: 'string',
    },
    {
      name: 'method',
      baseName: 'method',
      type: 'LinkDescription.MethodEnum',
    },
  ];

  static getAttributeTypeMap() {
    return LinkDescription.attributeTypeMap;
  }
}

export namespace LinkDescription {
  export enum MethodEnum {
    Get = <any>'GET',
    Post = <any>'POST',
    Put = <any>'PUT',
    Delete = <any>'DELETE',
    Head = <any>'HEAD',
    Connect = <any>'CONNECT',
    Options = <any>'OPTIONS',
    Patch = <any>'PATCH',
  }
}