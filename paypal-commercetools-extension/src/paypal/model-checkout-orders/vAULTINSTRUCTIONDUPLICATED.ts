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

export class VAULTINSTRUCTIONDUPLICATED {
  'issue'?: VAULTINSTRUCTIONDUPLICATED.IssueEnum;
  'description'?: VAULTINSTRUCTIONDUPLICATED.DescriptionEnum;

  static discriminator: string | undefined = undefined;

  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: 'issue',
      baseName: 'issue',
      type: 'VAULTINSTRUCTIONDUPLICATED.IssueEnum',
    },
    {
      name: 'description',
      baseName: 'description',
      type: 'VAULTINSTRUCTIONDUPLICATED.DescriptionEnum',
    },
  ];

  static getAttributeTypeMap() {
    return VAULTINSTRUCTIONDUPLICATED.attributeTypeMap;
  }
}

export namespace VAULTINSTRUCTIONDUPLICATED {
  export enum IssueEnum {
    VaultInstructionDuplicated = <any>'VAULT_INSTRUCTION_DUPLICATED',
  }
  export enum DescriptionEnum {
    OnlyOneVaultInstructionIsAllowedPleaseUseVaultStoreInVaultToProvideVaultInstruction = <
      any
    >'Only one vault instruction is allowed. Please use `vault.store_in_vault` to provide vault instruction.',
  }
}