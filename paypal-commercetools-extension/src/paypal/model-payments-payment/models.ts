import localVarRequest from 'request';

export * from './activityTimestamps';
export * from './aUTHCAPTURECURRENCYMISMATCH';
export * from './aUTHCURRENCYMISMATCH';
export * from './authorization';
export * from './authorization2';
export * from './authorization2AllOf';
export * from './authorizationAllOf';
export * from './aUTHORIZATIONALREADYCAPTURED';
export * from './aUTHORIZATIONDENIED';
export * from './aUTHORIZATIONEXPIRED';
export * from './authorizationsCapture400Response';
export * from './authorizationsCapture422Response';
export * from './authorizationsGet403Response';
export * from './authorizationsGet404Response';
export * from './authorizationsReauthorize400';
export * from './authorizationsReauthorize400IssuesInner';
export * from './authorizationsReauthorize400Response';
export * from './authorizationsReauthorize422';
export * from './authorizationsReauthorize422IssuesInner';
export * from './authorizationsReauthorize422Response';
export * from './authorizationStatus';
export * from './authorizationStatusDetails';
export * from './authorizationsVoid401Response';
export * from './authorizationsVoid409Response';
export * from './authorizationsVoid422';
export * from './authorizationsVoid422IssuesInner';
export * from './authorizationsVoid422Response';
export * from './aUTHORIZATIONVOIDED';
export * from './cANNOTBENEGATIVE';
export * from './cANNOTBEVOIDED';
export * from './cANNOTBEZEROORNEGATIVE';
export * from './cANNOTBEZEROORNEGATIVE1';
export * from './capture';
export * from './capture2';
export * from './captureAllOf';
export * from './cAPTUREFULLYREFUNDED';
export * from './captureRequest';
export * from './captureRequestAllOf';
export * from './capturesRefund400';
export * from './capturesRefund400IssuesInner';
export * from './capturesRefund400Response';
export * from './capturesRefund422';
export * from './capturesRefund422IssuesInner';
export * from './capturesRefund422Response';
export * from './captureStatus';
export * from './captureStatusDetails';
export * from './cardBrand';
export * from './cURRENCYMISMATCH';
export * from './dECIMALPRECISION';
export * from './dECIMALPRECISION1';
export * from './dECIMALSNOTSUPPORTED';
export * from './dECIMALSNOTSUPPORTED1';
export * from './disbursementMode';
export * from './dUPLICATEINVOICEID';
export * from './dUPLICATEINVOICEID1';
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
export * from './exchangeRate';
export * from './iNVALIDACCOUNTSTATUS';
export * from './iNVALIDCURRENCYCODE';
export * from './iNVALIDCURRENCYCODE1';
export * from './iNVALIDPARAMETERSYNTAX';
export * from './iNVALIDPARAMETERSYNTAX1';
export * from './iNVALIDPARAMETERVALUE';
export * from './iNVALIDRESOURCEID';
export * from './iNVALIDSTRINGLENGTH';
export * from './iNVALIDSTRINGLENGTH1';
export * from './iNVALIDSTRINGMAXLENGTH';
export * from './linkDescription';
export * from './mAXCAPTUREAMOUNTEXCEEDED';
export * from './mAXCAPTURECOUNTEXCEEDED';
export * from './mAXNUMBEROFREFUNDSEXCEEDED';
export * from './merchantPayableBreakdown';
export * from './mISSINGREQUIREDPARAMETER';
export * from './mISSINGREQUIREDPARAMETER1';
export * from './model400';
export * from './model400IssuesInner';
export * from './model401';
export * from './model401IssuesInner';
export * from './model403';
export * from './model403IssuesInner';
export * from './model404';
export * from './model404IssuesInner';
export * from './model409';
export * from './model409IssuesInner';
export * from './model422';
export * from './model422IssuesInner';
export * from './money';
export * from './netAmountBreakdownItem';
export * from './networkTransactionReference';
export * from './pARTIALREFUNDNOTALLOWED';
export * from './pAYEEACCOUNTLOCKEDORCLOSED';
export * from './pAYEEACCOUNTRESTRICTED';
export * from './payeeBase';
export * from './pAYERACCOUNTLOCKEDORCLOSED';
export * from './pAYERCANNOTPAY';
export * from './paymentInstruction';
export * from './paymentInstruction2';
export * from './pENDINGCAPTURE';
export * from './pERMISSIONDENIED';
export * from './platformFee';
export * from './pLATFORMFEEEXCEEDED';
export * from './pLATFORMFEENOTENABLED';
export * from './pREVIOUSLYCAPTURED';
export * from './pREVIOUSLYVOIDED';
export * from './pREVIOUSREQUESTINPROGRESS';
export * from './processorResponse';
export * from './rEAUTHORIZATIONNOTSUPPORTED';
export * from './reauthorizeRequest';
export * from './refund';
export * from './refundAllOf';
export * from './rEFUNDAMOUNTEXCEEDED';
export * from './rEFUNDAMOUNTTOOLOW';
export * from './rEFUNDCAPTURECURRENCYMISMATCH';
export * from './rEFUNDFAILEDINSUFFICIENTFUNDS';
export * from './rEFUNDISRESTRICTED';
export * from './rEFUNDNOTALLOWED';
export * from './rEFUNDNOTPERMITTEDDUETOCHARGEBACK';
export * from './refundRequest';
export * from './refundStatus';
export * from './refundStatusDetails';
export * from './rEFUNDTIMELIMITEXCEEDED';
export * from './relatedIds';
export * from './sellerProtection';
export * from './sellerReceivableBreakdown';
export * from './supplementaryData';
export * from './supplementaryPurchaseData';
export * from './tRANSACTIONDISPUTED';
export * from './tRANSACTIONREFUSED';

import * as fs from 'fs';

export interface RequestDetailedFile {
  value: Buffer;
  options?: {
    filename?: string;
    contentType?: string;
  };
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;

import { ActivityTimestamps } from './activityTimestamps';
import { AUTHCAPTURECURRENCYMISMATCH } from './aUTHCAPTURECURRENCYMISMATCH';
import { AUTHCURRENCYMISMATCH } from './aUTHCURRENCYMISMATCH';
import { Authorization } from './authorization';
import { Authorization2 } from './authorization2';
import { Authorization2AllOf } from './authorization2AllOf';
import { AuthorizationAllOf } from './authorizationAllOf';
import { AUTHORIZATIONALREADYCAPTURED } from './aUTHORIZATIONALREADYCAPTURED';
import { AUTHORIZATIONDENIED } from './aUTHORIZATIONDENIED';
import { AUTHORIZATIONEXPIRED } from './aUTHORIZATIONEXPIRED';
import { AuthorizationsCapture400Response } from './authorizationsCapture400Response';
import { AuthorizationsCapture422Response } from './authorizationsCapture422Response';
import { AuthorizationsGet403Response } from './authorizationsGet403Response';
import { AuthorizationsGet404Response } from './authorizationsGet404Response';
import { AuthorizationsReauthorize400 } from './authorizationsReauthorize400';
import { AuthorizationsReauthorize400IssuesInner } from './authorizationsReauthorize400IssuesInner';
import { AuthorizationsReauthorize400Response } from './authorizationsReauthorize400Response';
import { AuthorizationsReauthorize422 } from './authorizationsReauthorize422';
import { AuthorizationsReauthorize422IssuesInner } from './authorizationsReauthorize422IssuesInner';
import { AuthorizationsReauthorize422Response } from './authorizationsReauthorize422Response';
import { AuthorizationStatus } from './authorizationStatus';
import { AuthorizationStatusDetails } from './authorizationStatusDetails';
import { AuthorizationsVoid401Response } from './authorizationsVoid401Response';
import { AuthorizationsVoid409Response } from './authorizationsVoid409Response';
import { AuthorizationsVoid422 } from './authorizationsVoid422';
import { AuthorizationsVoid422IssuesInner } from './authorizationsVoid422IssuesInner';
import { AuthorizationsVoid422Response } from './authorizationsVoid422Response';
import { AUTHORIZATIONVOIDED } from './aUTHORIZATIONVOIDED';
import { CANNOTBENEGATIVE } from './cANNOTBENEGATIVE';
import { CANNOTBEVOIDED } from './cANNOTBEVOIDED';
import { CANNOTBEZEROORNEGATIVE } from './cANNOTBEZEROORNEGATIVE';
import { CANNOTBEZEROORNEGATIVE1 } from './cANNOTBEZEROORNEGATIVE1';
import { Capture } from './capture';
import { Capture2 } from './capture2';
import { CaptureAllOf } from './captureAllOf';
import { CAPTUREFULLYREFUNDED } from './cAPTUREFULLYREFUNDED';
import { CaptureRequest } from './captureRequest';
import { CaptureRequestAllOf } from './captureRequestAllOf';
import { CapturesRefund400 } from './capturesRefund400';
import { CapturesRefund400IssuesInner } from './capturesRefund400IssuesInner';
import { CapturesRefund400Response } from './capturesRefund400Response';
import { CapturesRefund422 } from './capturesRefund422';
import { CapturesRefund422IssuesInner } from './capturesRefund422IssuesInner';
import { CapturesRefund422Response } from './capturesRefund422Response';
import { CaptureStatus } from './captureStatus';
import { CaptureStatusDetails } from './captureStatusDetails';
import { CardBrand } from './cardBrand';
import { CURRENCYMISMATCH } from './cURRENCYMISMATCH';
import { DECIMALPRECISION } from './dECIMALPRECISION';
import { DECIMALPRECISION1 } from './dECIMALPRECISION1';
import { DECIMALSNOTSUPPORTED } from './dECIMALSNOTSUPPORTED';
import { DECIMALSNOTSUPPORTED1 } from './dECIMALSNOTSUPPORTED1';
import { DisbursementMode } from './disbursementMode';
import { DUPLICATEINVOICEID } from './dUPLICATEINVOICEID';
import { DUPLICATEINVOICEID1 } from './dUPLICATEINVOICEID1';
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
import { ExchangeRate } from './exchangeRate';
import { INVALIDACCOUNTSTATUS } from './iNVALIDACCOUNTSTATUS';
import { INVALIDCURRENCYCODE } from './iNVALIDCURRENCYCODE';
import { INVALIDCURRENCYCODE1 } from './iNVALIDCURRENCYCODE1';
import { INVALIDPARAMETERSYNTAX } from './iNVALIDPARAMETERSYNTAX';
import { INVALIDPARAMETERSYNTAX1 } from './iNVALIDPARAMETERSYNTAX1';
import { INVALIDPARAMETERVALUE } from './iNVALIDPARAMETERVALUE';
import { INVALIDRESOURCEID } from './iNVALIDRESOURCEID';
import { INVALIDSTRINGLENGTH } from './iNVALIDSTRINGLENGTH';
import { INVALIDSTRINGLENGTH1 } from './iNVALIDSTRINGLENGTH1';
import { INVALIDSTRINGMAXLENGTH } from './iNVALIDSTRINGMAXLENGTH';
import { LinkDescription } from './linkDescription';
import { MAXCAPTUREAMOUNTEXCEEDED } from './mAXCAPTUREAMOUNTEXCEEDED';
import { MAXCAPTURECOUNTEXCEEDED } from './mAXCAPTURECOUNTEXCEEDED';
import { MAXNUMBEROFREFUNDSEXCEEDED } from './mAXNUMBEROFREFUNDSEXCEEDED';
import { MerchantPayableBreakdown } from './merchantPayableBreakdown';
import { MISSINGREQUIREDPARAMETER } from './mISSINGREQUIREDPARAMETER';
import { MISSINGREQUIREDPARAMETER1 } from './mISSINGREQUIREDPARAMETER1';
import { Model400 } from './model400';
import { Model400IssuesInner } from './model400IssuesInner';
import { Model401 } from './model401';
import { Model401IssuesInner } from './model401IssuesInner';
import { Model403 } from './model403';
import { Model403IssuesInner } from './model403IssuesInner';
import { Model404 } from './model404';
import { Model404IssuesInner } from './model404IssuesInner';
import { Model409 } from './model409';
import { Model409IssuesInner } from './model409IssuesInner';
import { Model422 } from './model422';
import { Model422IssuesInner } from './model422IssuesInner';
import { Money } from './money';
import { NetAmountBreakdownItem } from './netAmountBreakdownItem';
import { NetworkTransactionReference } from './networkTransactionReference';
import { PARTIALREFUNDNOTALLOWED } from './pARTIALREFUNDNOTALLOWED';
import { PAYEEACCOUNTLOCKEDORCLOSED } from './pAYEEACCOUNTLOCKEDORCLOSED';
import { PAYEEACCOUNTRESTRICTED } from './pAYEEACCOUNTRESTRICTED';
import { PayeeBase } from './payeeBase';
import { PAYERACCOUNTLOCKEDORCLOSED } from './pAYERACCOUNTLOCKEDORCLOSED';
import { PAYERCANNOTPAY } from './pAYERCANNOTPAY';
import { PaymentInstruction } from './paymentInstruction';
import { PaymentInstruction2 } from './paymentInstruction2';
import { PENDINGCAPTURE } from './pENDINGCAPTURE';
import { PERMISSIONDENIED } from './pERMISSIONDENIED';
import { PlatformFee } from './platformFee';
import { PLATFORMFEEEXCEEDED } from './pLATFORMFEEEXCEEDED';
import { PLATFORMFEENOTENABLED } from './pLATFORMFEENOTENABLED';
import { PREVIOUSLYCAPTURED } from './pREVIOUSLYCAPTURED';
import { PREVIOUSLYVOIDED } from './pREVIOUSLYVOIDED';
import { PREVIOUSREQUESTINPROGRESS } from './pREVIOUSREQUESTINPROGRESS';
import { ProcessorResponse } from './processorResponse';
import { REAUTHORIZATIONNOTSUPPORTED } from './rEAUTHORIZATIONNOTSUPPORTED';
import { ReauthorizeRequest } from './reauthorizeRequest';
import { Refund } from './refund';
import { RefundAllOf } from './refundAllOf';
import { REFUNDAMOUNTEXCEEDED } from './rEFUNDAMOUNTEXCEEDED';
import { REFUNDAMOUNTTOOLOW } from './rEFUNDAMOUNTTOOLOW';
import { REFUNDCAPTURECURRENCYMISMATCH } from './rEFUNDCAPTURECURRENCYMISMATCH';
import { REFUNDFAILEDINSUFFICIENTFUNDS } from './rEFUNDFAILEDINSUFFICIENTFUNDS';
import { REFUNDISRESTRICTED } from './rEFUNDISRESTRICTED';
import { REFUNDNOTALLOWED } from './rEFUNDNOTALLOWED';
import { REFUNDNOTPERMITTEDDUETOCHARGEBACK } from './rEFUNDNOTPERMITTEDDUETOCHARGEBACK';
import { RefundRequest } from './refundRequest';
import { RefundStatus } from './refundStatus';
import { RefundStatusDetails } from './refundStatusDetails';
import { REFUNDTIMELIMITEXCEEDED } from './rEFUNDTIMELIMITEXCEEDED';
import { RelatedIds } from './relatedIds';
import { SellerProtection } from './sellerProtection';
import { SellerReceivableBreakdown } from './sellerReceivableBreakdown';
import { SupplementaryData } from './supplementaryData';
import { SupplementaryPurchaseData } from './supplementaryPurchaseData';
import { TRANSACTIONDISPUTED } from './tRANSACTIONDISPUTED';
import { TRANSACTIONREFUSED } from './tRANSACTIONREFUSED';

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
  'AUTHCAPTURECURRENCYMISMATCH.IssueEnum':
    AUTHCAPTURECURRENCYMISMATCH.IssueEnum,
  'AUTHCAPTURECURRENCYMISMATCH.DescriptionEnum':
    AUTHCAPTURECURRENCYMISMATCH.DescriptionEnum,
  'AUTHCURRENCYMISMATCH.IssueEnum': AUTHCURRENCYMISMATCH.IssueEnum,
  'AUTHCURRENCYMISMATCH.DescriptionEnum': AUTHCURRENCYMISMATCH.DescriptionEnum,
  'AUTHORIZATIONALREADYCAPTURED.IssueEnum':
    AUTHORIZATIONALREADYCAPTURED.IssueEnum,
  'AUTHORIZATIONALREADYCAPTURED.DescriptionEnum':
    AUTHORIZATIONALREADYCAPTURED.DescriptionEnum,
  'AUTHORIZATIONDENIED.IssueEnum': AUTHORIZATIONDENIED.IssueEnum,
  'AUTHORIZATIONDENIED.DescriptionEnum': AUTHORIZATIONDENIED.DescriptionEnum,
  'AUTHORIZATIONEXPIRED.IssueEnum': AUTHORIZATIONEXPIRED.IssueEnum,
  'AUTHORIZATIONEXPIRED.DescriptionEnum': AUTHORIZATIONEXPIRED.DescriptionEnum,
  'AUTHORIZATIONVOIDED.IssueEnum': AUTHORIZATIONVOIDED.IssueEnum,
  'AUTHORIZATIONVOIDED.DescriptionEnum': AUTHORIZATIONVOIDED.DescriptionEnum,
  'Authorization.StatusEnum': Authorization.StatusEnum,
  'Authorization2.StatusEnum': Authorization2.StatusEnum,
  'AuthorizationStatus.StatusEnum': AuthorizationStatus.StatusEnum,
  'AuthorizationStatusDetails.ReasonEnum':
    AuthorizationStatusDetails.ReasonEnum,
  'AuthorizationsCapture400Response.NameEnum':
    AuthorizationsCapture400Response.NameEnum,
  'AuthorizationsCapture400Response.MessageEnum':
    AuthorizationsCapture400Response.MessageEnum,
  'AuthorizationsCapture422Response.NameEnum':
    AuthorizationsCapture422Response.NameEnum,
  'AuthorizationsCapture422Response.MessageEnum':
    AuthorizationsCapture422Response.MessageEnum,
  'AuthorizationsGet403Response.NameEnum':
    AuthorizationsGet403Response.NameEnum,
  'AuthorizationsGet403Response.MessageEnum':
    AuthorizationsGet403Response.MessageEnum,
  'AuthorizationsGet404Response.NameEnum':
    AuthorizationsGet404Response.NameEnum,
  'AuthorizationsGet404Response.MessageEnum':
    AuthorizationsGet404Response.MessageEnum,
  'AuthorizationsReauthorize400IssuesInner.IssueEnum':
    AuthorizationsReauthorize400IssuesInner.IssueEnum,
  'AuthorizationsReauthorize400IssuesInner.DescriptionEnum':
    AuthorizationsReauthorize400IssuesInner.DescriptionEnum,
  'AuthorizationsReauthorize400Response.NameEnum':
    AuthorizationsReauthorize400Response.NameEnum,
  'AuthorizationsReauthorize400Response.MessageEnum':
    AuthorizationsReauthorize400Response.MessageEnum,
  'AuthorizationsReauthorize422IssuesInner.IssueEnum':
    AuthorizationsReauthorize422IssuesInner.IssueEnum,
  'AuthorizationsReauthorize422IssuesInner.DescriptionEnum':
    AuthorizationsReauthorize422IssuesInner.DescriptionEnum,
  'AuthorizationsReauthorize422Response.NameEnum':
    AuthorizationsReauthorize422Response.NameEnum,
  'AuthorizationsReauthorize422Response.MessageEnum':
    AuthorizationsReauthorize422Response.MessageEnum,
  'AuthorizationsVoid401Response.NameEnum':
    AuthorizationsVoid401Response.NameEnum,
  'AuthorizationsVoid401Response.MessageEnum':
    AuthorizationsVoid401Response.MessageEnum,
  'AuthorizationsVoid409Response.NameEnum':
    AuthorizationsVoid409Response.NameEnum,
  'AuthorizationsVoid409Response.MessageEnum':
    AuthorizationsVoid409Response.MessageEnum,
  'AuthorizationsVoid422IssuesInner.IssueEnum':
    AuthorizationsVoid422IssuesInner.IssueEnum,
  'AuthorizationsVoid422IssuesInner.DescriptionEnum':
    AuthorizationsVoid422IssuesInner.DescriptionEnum,
  'AuthorizationsVoid422Response.NameEnum':
    AuthorizationsVoid422Response.NameEnum,
  'AuthorizationsVoid422Response.MessageEnum':
    AuthorizationsVoid422Response.MessageEnum,
  'CANNOTBENEGATIVE.IssueEnum': CANNOTBENEGATIVE.IssueEnum,
  'CANNOTBEVOIDED.IssueEnum': CANNOTBEVOIDED.IssueEnum,
  'CANNOTBEVOIDED.DescriptionEnum': CANNOTBEVOIDED.DescriptionEnum,
  'CANNOTBEZEROORNEGATIVE.IssueEnum': CANNOTBEZEROORNEGATIVE.IssueEnum,
  'CANNOTBEZEROORNEGATIVE.DescriptionEnum':
    CANNOTBEZEROORNEGATIVE.DescriptionEnum,
  'CANNOTBEZEROORNEGATIVE1.IssueEnum': CANNOTBEZEROORNEGATIVE1.IssueEnum,
  'CAPTUREFULLYREFUNDED.IssueEnum': CAPTUREFULLYREFUNDED.IssueEnum,
  'CAPTUREFULLYREFUNDED.DescriptionEnum': CAPTUREFULLYREFUNDED.DescriptionEnum,
  'CURRENCYMISMATCH.IssueEnum': CURRENCYMISMATCH.IssueEnum,
  'Capture.StatusEnum': Capture.StatusEnum,
  'Capture2.StatusEnum': Capture2.StatusEnum,
  'CaptureStatus.StatusEnum': CaptureStatus.StatusEnum,
  'CaptureStatusDetails.ReasonEnum': CaptureStatusDetails.ReasonEnum,
  'CapturesRefund400IssuesInner.IssueEnum':
    CapturesRefund400IssuesInner.IssueEnum,
  'CapturesRefund400Response.NameEnum': CapturesRefund400Response.NameEnum,
  'CapturesRefund400Response.MessageEnum':
    CapturesRefund400Response.MessageEnum,
  'CapturesRefund422IssuesInner.IssueEnum':
    CapturesRefund422IssuesInner.IssueEnum,
  'CapturesRefund422IssuesInner.DescriptionEnum':
    CapturesRefund422IssuesInner.DescriptionEnum,
  'CapturesRefund422Response.NameEnum': CapturesRefund422Response.NameEnum,
  'CapturesRefund422Response.MessageEnum':
    CapturesRefund422Response.MessageEnum,
  CardBrand: CardBrand,
  'DECIMALPRECISION.IssueEnum': DECIMALPRECISION.IssueEnum,
  'DECIMALPRECISION.DescriptionEnum': DECIMALPRECISION.DescriptionEnum,
  'DECIMALPRECISION1.IssueEnum': DECIMALPRECISION1.IssueEnum,
  'DECIMALSNOTSUPPORTED.IssueEnum': DECIMALSNOTSUPPORTED.IssueEnum,
  'DECIMALSNOTSUPPORTED.DescriptionEnum': DECIMALSNOTSUPPORTED.DescriptionEnum,
  'DECIMALSNOTSUPPORTED1.IssueEnum': DECIMALSNOTSUPPORTED1.IssueEnum,
  'DUPLICATEINVOICEID.IssueEnum': DUPLICATEINVOICEID.IssueEnum,
  'DUPLICATEINVOICEID.DescriptionEnum': DUPLICATEINVOICEID.DescriptionEnum,
  'DUPLICATEINVOICEID1.IssueEnum': DUPLICATEINVOICEID1.IssueEnum,
  'DUPLICATEINVOICEID1.DescriptionEnum': DUPLICATEINVOICEID1.DescriptionEnum,
  DisbursementMode: DisbursementMode,
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
  'INVALIDACCOUNTSTATUS.IssueEnum': INVALIDACCOUNTSTATUS.IssueEnum,
  'INVALIDACCOUNTSTATUS.DescriptionEnum': INVALIDACCOUNTSTATUS.DescriptionEnum,
  'INVALIDCURRENCYCODE.IssueEnum': INVALIDCURRENCYCODE.IssueEnum,
  'INVALIDCURRENCYCODE.DescriptionEnum': INVALIDCURRENCYCODE.DescriptionEnum,
  'INVALIDCURRENCYCODE1.IssueEnum': INVALIDCURRENCYCODE1.IssueEnum,
  'INVALIDPARAMETERSYNTAX.IssueEnum': INVALIDPARAMETERSYNTAX.IssueEnum,
  'INVALIDPARAMETERSYNTAX.DescriptionEnum':
    INVALIDPARAMETERSYNTAX.DescriptionEnum,
  'INVALIDPARAMETERSYNTAX1.IssueEnum': INVALIDPARAMETERSYNTAX1.IssueEnum,
  'INVALIDPARAMETERVALUE.IssueEnum': INVALIDPARAMETERVALUE.IssueEnum,
  'INVALIDPARAMETERVALUE.DescriptionEnum':
    INVALIDPARAMETERVALUE.DescriptionEnum,
  'INVALIDRESOURCEID.IssueEnum': INVALIDRESOURCEID.IssueEnum,
  'INVALIDRESOURCEID.DescriptionEnum': INVALIDRESOURCEID.DescriptionEnum,
  'INVALIDSTRINGLENGTH.IssueEnum': INVALIDSTRINGLENGTH.IssueEnum,
  'INVALIDSTRINGLENGTH.DescriptionEnum': INVALIDSTRINGLENGTH.DescriptionEnum,
  'INVALIDSTRINGLENGTH1.IssueEnum': INVALIDSTRINGLENGTH1.IssueEnum,
  'INVALIDSTRINGMAXLENGTH.IssueEnum': INVALIDSTRINGMAXLENGTH.IssueEnum,
  'INVALIDSTRINGMAXLENGTH.DescriptionEnum':
    INVALIDSTRINGMAXLENGTH.DescriptionEnum,
  'LinkDescription.MethodEnum': LinkDescription.MethodEnum,
  'MAXCAPTUREAMOUNTEXCEEDED.IssueEnum': MAXCAPTUREAMOUNTEXCEEDED.IssueEnum,
  'MAXCAPTUREAMOUNTEXCEEDED.DescriptionEnum':
    MAXCAPTUREAMOUNTEXCEEDED.DescriptionEnum,
  'MAXCAPTURECOUNTEXCEEDED.IssueEnum': MAXCAPTURECOUNTEXCEEDED.IssueEnum,
  'MAXCAPTURECOUNTEXCEEDED.DescriptionEnum':
    MAXCAPTURECOUNTEXCEEDED.DescriptionEnum,
  'MAXNUMBEROFREFUNDSEXCEEDED.IssueEnum': MAXNUMBEROFREFUNDSEXCEEDED.IssueEnum,
  'MAXNUMBEROFREFUNDSEXCEEDED.DescriptionEnum':
    MAXNUMBEROFREFUNDSEXCEEDED.DescriptionEnum,
  'MISSINGREQUIREDPARAMETER.IssueEnum': MISSINGREQUIREDPARAMETER.IssueEnum,
  'MISSINGREQUIREDPARAMETER.DescriptionEnum':
    MISSINGREQUIREDPARAMETER.DescriptionEnum,
  'MISSINGREQUIREDPARAMETER1.IssueEnum': MISSINGREQUIREDPARAMETER1.IssueEnum,
  'Model400IssuesInner.IssueEnum': Model400IssuesInner.IssueEnum,
  'Model400IssuesInner.DescriptionEnum': Model400IssuesInner.DescriptionEnum,
  'Model401IssuesInner.IssueEnum': Model401IssuesInner.IssueEnum,
  'Model401IssuesInner.DescriptionEnum': Model401IssuesInner.DescriptionEnum,
  'Model403IssuesInner.IssueEnum': Model403IssuesInner.IssueEnum,
  'Model403IssuesInner.DescriptionEnum': Model403IssuesInner.DescriptionEnum,
  'Model404IssuesInner.IssueEnum': Model404IssuesInner.IssueEnum,
  'Model404IssuesInner.DescriptionEnum': Model404IssuesInner.DescriptionEnum,
  'Model409IssuesInner.IssueEnum': Model409IssuesInner.IssueEnum,
  'Model409IssuesInner.DescriptionEnum': Model409IssuesInner.DescriptionEnum,
  'Model422IssuesInner.IssueEnum': Model422IssuesInner.IssueEnum,
  'Model422IssuesInner.DescriptionEnum': Model422IssuesInner.DescriptionEnum,
  'PARTIALREFUNDNOTALLOWED.IssueEnum': PARTIALREFUNDNOTALLOWED.IssueEnum,
  'PARTIALREFUNDNOTALLOWED.DescriptionEnum':
    PARTIALREFUNDNOTALLOWED.DescriptionEnum,
  'PAYEEACCOUNTLOCKEDORCLOSED.IssueEnum': PAYEEACCOUNTLOCKEDORCLOSED.IssueEnum,
  'PAYEEACCOUNTLOCKEDORCLOSED.DescriptionEnum':
    PAYEEACCOUNTLOCKEDORCLOSED.DescriptionEnum,
  'PAYEEACCOUNTRESTRICTED.IssueEnum': PAYEEACCOUNTRESTRICTED.IssueEnum,
  'PAYEEACCOUNTRESTRICTED.DescriptionEnum':
    PAYEEACCOUNTRESTRICTED.DescriptionEnum,
  'PAYERACCOUNTLOCKEDORCLOSED.IssueEnum': PAYERACCOUNTLOCKEDORCLOSED.IssueEnum,
  'PAYERACCOUNTLOCKEDORCLOSED.DescriptionEnum':
    PAYERACCOUNTLOCKEDORCLOSED.DescriptionEnum,
  'PAYERCANNOTPAY.IssueEnum': PAYERCANNOTPAY.IssueEnum,
  'PAYERCANNOTPAY.DescriptionEnum': PAYERCANNOTPAY.DescriptionEnum,
  'PENDINGCAPTURE.IssueEnum': PENDINGCAPTURE.IssueEnum,
  'PENDINGCAPTURE.DescriptionEnum': PENDINGCAPTURE.DescriptionEnum,
  'PERMISSIONDENIED.IssueEnum': PERMISSIONDENIED.IssueEnum,
  'PERMISSIONDENIED.DescriptionEnum': PERMISSIONDENIED.DescriptionEnum,
  'PLATFORMFEEEXCEEDED.IssueEnum': PLATFORMFEEEXCEEDED.IssueEnum,
  'PLATFORMFEEEXCEEDED.DescriptionEnum': PLATFORMFEEEXCEEDED.DescriptionEnum,
  'PLATFORMFEENOTENABLED.IssueEnum': PLATFORMFEENOTENABLED.IssueEnum,
  'PLATFORMFEENOTENABLED.DescriptionEnum':
    PLATFORMFEENOTENABLED.DescriptionEnum,
  'PREVIOUSLYCAPTURED.IssueEnum': PREVIOUSLYCAPTURED.IssueEnum,
  'PREVIOUSLYCAPTURED.DescriptionEnum': PREVIOUSLYCAPTURED.DescriptionEnum,
  'PREVIOUSLYVOIDED.IssueEnum': PREVIOUSLYVOIDED.IssueEnum,
  'PREVIOUSLYVOIDED.DescriptionEnum': PREVIOUSLYVOIDED.DescriptionEnum,
  'PREVIOUSREQUESTINPROGRESS.IssueEnum': PREVIOUSREQUESTINPROGRESS.IssueEnum,
  'PREVIOUSREQUESTINPROGRESS.DescriptionEnum':
    PREVIOUSREQUESTINPROGRESS.DescriptionEnum,
  'ProcessorResponse.AvsCodeEnum': ProcessorResponse.AvsCodeEnum,
  'ProcessorResponse.CvvCodeEnum': ProcessorResponse.CvvCodeEnum,
  'ProcessorResponse.ResponseCodeEnum': ProcessorResponse.ResponseCodeEnum,
  'ProcessorResponse.PaymentAdviceCodeEnum':
    ProcessorResponse.PaymentAdviceCodeEnum,
  'REAUTHORIZATIONNOTSUPPORTED.IssueEnum':
    REAUTHORIZATIONNOTSUPPORTED.IssueEnum,
  'REAUTHORIZATIONNOTSUPPORTED.DescriptionEnum':
    REAUTHORIZATIONNOTSUPPORTED.DescriptionEnum,
  'REFUNDAMOUNTEXCEEDED.IssueEnum': REFUNDAMOUNTEXCEEDED.IssueEnum,
  'REFUNDAMOUNTEXCEEDED.DescriptionEnum': REFUNDAMOUNTEXCEEDED.DescriptionEnum,
  'REFUNDAMOUNTTOOLOW.IssueEnum': REFUNDAMOUNTTOOLOW.IssueEnum,
  'REFUNDAMOUNTTOOLOW.DescriptionEnum': REFUNDAMOUNTTOOLOW.DescriptionEnum,
  'REFUNDCAPTURECURRENCYMISMATCH.IssueEnum':
    REFUNDCAPTURECURRENCYMISMATCH.IssueEnum,
  'REFUNDCAPTURECURRENCYMISMATCH.DescriptionEnum':
    REFUNDCAPTURECURRENCYMISMATCH.DescriptionEnum,
  'REFUNDFAILEDINSUFFICIENTFUNDS.IssueEnum':
    REFUNDFAILEDINSUFFICIENTFUNDS.IssueEnum,
  'REFUNDFAILEDINSUFFICIENTFUNDS.DescriptionEnum':
    REFUNDFAILEDINSUFFICIENTFUNDS.DescriptionEnum,
  'REFUNDISRESTRICTED.IssueEnum': REFUNDISRESTRICTED.IssueEnum,
  'REFUNDISRESTRICTED.DescriptionEnum': REFUNDISRESTRICTED.DescriptionEnum,
  'REFUNDNOTALLOWED.IssueEnum': REFUNDNOTALLOWED.IssueEnum,
  'REFUNDNOTALLOWED.DescriptionEnum': REFUNDNOTALLOWED.DescriptionEnum,
  'REFUNDNOTPERMITTEDDUETOCHARGEBACK.IssueEnum':
    REFUNDNOTPERMITTEDDUETOCHARGEBACK.IssueEnum,
  'REFUNDNOTPERMITTEDDUETOCHARGEBACK.DescriptionEnum':
    REFUNDNOTPERMITTEDDUETOCHARGEBACK.DescriptionEnum,
  'REFUNDTIMELIMITEXCEEDED.IssueEnum': REFUNDTIMELIMITEXCEEDED.IssueEnum,
  'REFUNDTIMELIMITEXCEEDED.DescriptionEnum':
    REFUNDTIMELIMITEXCEEDED.DescriptionEnum,
  'Refund.StatusEnum': Refund.StatusEnum,
  'RefundStatus.StatusEnum': RefundStatus.StatusEnum,
  'RefundStatusDetails.ReasonEnum': RefundStatusDetails.ReasonEnum,
  'SellerProtection.StatusEnum': SellerProtection.StatusEnum,
  'SellerProtection.DisputeCategoriesEnum':
    SellerProtection.DisputeCategoriesEnum,
  'TRANSACTIONDISPUTED.IssueEnum': TRANSACTIONDISPUTED.IssueEnum,
  'TRANSACTIONDISPUTED.DescriptionEnum': TRANSACTIONDISPUTED.DescriptionEnum,
  'TRANSACTIONREFUSED.IssueEnum': TRANSACTIONREFUSED.IssueEnum,
  'TRANSACTIONREFUSED.DescriptionEnum': TRANSACTIONREFUSED.DescriptionEnum,
};

let typeMap: { [index: string]: any } = {
  AUTHCAPTURECURRENCYMISMATCH: AUTHCAPTURECURRENCYMISMATCH,
  AUTHCURRENCYMISMATCH: AUTHCURRENCYMISMATCH,
  AUTHORIZATIONALREADYCAPTURED: AUTHORIZATIONALREADYCAPTURED,
  AUTHORIZATIONDENIED: AUTHORIZATIONDENIED,
  AUTHORIZATIONEXPIRED: AUTHORIZATIONEXPIRED,
  AUTHORIZATIONVOIDED: AUTHORIZATIONVOIDED,
  ActivityTimestamps: ActivityTimestamps,
  Authorization: Authorization,
  Authorization2: Authorization2,
  Authorization2AllOf: Authorization2AllOf,
  AuthorizationAllOf: AuthorizationAllOf,
  AuthorizationStatus: AuthorizationStatus,
  AuthorizationStatusDetails: AuthorizationStatusDetails,
  AuthorizationsCapture400Response: AuthorizationsCapture400Response,
  AuthorizationsCapture422Response: AuthorizationsCapture422Response,
  AuthorizationsGet403Response: AuthorizationsGet403Response,
  AuthorizationsGet404Response: AuthorizationsGet404Response,
  AuthorizationsReauthorize400: AuthorizationsReauthorize400,
  AuthorizationsReauthorize400IssuesInner:
    AuthorizationsReauthorize400IssuesInner,
  AuthorizationsReauthorize400Response: AuthorizationsReauthorize400Response,
  AuthorizationsReauthorize422: AuthorizationsReauthorize422,
  AuthorizationsReauthorize422IssuesInner:
    AuthorizationsReauthorize422IssuesInner,
  AuthorizationsReauthorize422Response: AuthorizationsReauthorize422Response,
  AuthorizationsVoid401Response: AuthorizationsVoid401Response,
  AuthorizationsVoid409Response: AuthorizationsVoid409Response,
  AuthorizationsVoid422: AuthorizationsVoid422,
  AuthorizationsVoid422IssuesInner: AuthorizationsVoid422IssuesInner,
  AuthorizationsVoid422Response: AuthorizationsVoid422Response,
  CANNOTBENEGATIVE: CANNOTBENEGATIVE,
  CANNOTBEVOIDED: CANNOTBEVOIDED,
  CANNOTBEZEROORNEGATIVE: CANNOTBEZEROORNEGATIVE,
  CANNOTBEZEROORNEGATIVE1: CANNOTBEZEROORNEGATIVE1,
  CAPTUREFULLYREFUNDED: CAPTUREFULLYREFUNDED,
  CURRENCYMISMATCH: CURRENCYMISMATCH,
  Capture: Capture,
  Capture2: Capture2,
  CaptureAllOf: CaptureAllOf,
  CaptureRequest: CaptureRequest,
  CaptureRequestAllOf: CaptureRequestAllOf,
  CaptureStatus: CaptureStatus,
  CaptureStatusDetails: CaptureStatusDetails,
  CapturesRefund400: CapturesRefund400,
  CapturesRefund400IssuesInner: CapturesRefund400IssuesInner,
  CapturesRefund400Response: CapturesRefund400Response,
  CapturesRefund422: CapturesRefund422,
  CapturesRefund422IssuesInner: CapturesRefund422IssuesInner,
  CapturesRefund422Response: CapturesRefund422Response,
  DECIMALPRECISION: DECIMALPRECISION,
  DECIMALPRECISION1: DECIMALPRECISION1,
  DECIMALSNOTSUPPORTED: DECIMALSNOTSUPPORTED,
  DECIMALSNOTSUPPORTED1: DECIMALSNOTSUPPORTED1,
  DUPLICATEINVOICEID: DUPLICATEINVOICEID,
  DUPLICATEINVOICEID1: DUPLICATEINVOICEID1,
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
  ExchangeRate: ExchangeRate,
  INVALIDACCOUNTSTATUS: INVALIDACCOUNTSTATUS,
  INVALIDCURRENCYCODE: INVALIDCURRENCYCODE,
  INVALIDCURRENCYCODE1: INVALIDCURRENCYCODE1,
  INVALIDPARAMETERSYNTAX: INVALIDPARAMETERSYNTAX,
  INVALIDPARAMETERSYNTAX1: INVALIDPARAMETERSYNTAX1,
  INVALIDPARAMETERVALUE: INVALIDPARAMETERVALUE,
  INVALIDRESOURCEID: INVALIDRESOURCEID,
  INVALIDSTRINGLENGTH: INVALIDSTRINGLENGTH,
  INVALIDSTRINGLENGTH1: INVALIDSTRINGLENGTH1,
  INVALIDSTRINGMAXLENGTH: INVALIDSTRINGMAXLENGTH,
  LinkDescription: LinkDescription,
  MAXCAPTUREAMOUNTEXCEEDED: MAXCAPTUREAMOUNTEXCEEDED,
  MAXCAPTURECOUNTEXCEEDED: MAXCAPTURECOUNTEXCEEDED,
  MAXNUMBEROFREFUNDSEXCEEDED: MAXNUMBEROFREFUNDSEXCEEDED,
  MISSINGREQUIREDPARAMETER: MISSINGREQUIREDPARAMETER,
  MISSINGREQUIREDPARAMETER1: MISSINGREQUIREDPARAMETER1,
  MerchantPayableBreakdown: MerchantPayableBreakdown,
  Model400: Model400,
  Model400IssuesInner: Model400IssuesInner,
  Model401: Model401,
  Model401IssuesInner: Model401IssuesInner,
  Model403: Model403,
  Model403IssuesInner: Model403IssuesInner,
  Model404: Model404,
  Model404IssuesInner: Model404IssuesInner,
  Model409: Model409,
  Model409IssuesInner: Model409IssuesInner,
  Model422: Model422,
  Model422IssuesInner: Model422IssuesInner,
  Money: Money,
  NetAmountBreakdownItem: NetAmountBreakdownItem,
  NetworkTransactionReference: NetworkTransactionReference,
  PARTIALREFUNDNOTALLOWED: PARTIALREFUNDNOTALLOWED,
  PAYEEACCOUNTLOCKEDORCLOSED: PAYEEACCOUNTLOCKEDORCLOSED,
  PAYEEACCOUNTRESTRICTED: PAYEEACCOUNTRESTRICTED,
  PAYERACCOUNTLOCKEDORCLOSED: PAYERACCOUNTLOCKEDORCLOSED,
  PAYERCANNOTPAY: PAYERCANNOTPAY,
  PENDINGCAPTURE: PENDINGCAPTURE,
  PERMISSIONDENIED: PERMISSIONDENIED,
  PLATFORMFEEEXCEEDED: PLATFORMFEEEXCEEDED,
  PLATFORMFEENOTENABLED: PLATFORMFEENOTENABLED,
  PREVIOUSLYCAPTURED: PREVIOUSLYCAPTURED,
  PREVIOUSLYVOIDED: PREVIOUSLYVOIDED,
  PREVIOUSREQUESTINPROGRESS: PREVIOUSREQUESTINPROGRESS,
  PayeeBase: PayeeBase,
  PaymentInstruction: PaymentInstruction,
  PaymentInstruction2: PaymentInstruction2,
  PlatformFee: PlatformFee,
  ProcessorResponse: ProcessorResponse,
  REAUTHORIZATIONNOTSUPPORTED: REAUTHORIZATIONNOTSUPPORTED,
  REFUNDAMOUNTEXCEEDED: REFUNDAMOUNTEXCEEDED,
  REFUNDAMOUNTTOOLOW: REFUNDAMOUNTTOOLOW,
  REFUNDCAPTURECURRENCYMISMATCH: REFUNDCAPTURECURRENCYMISMATCH,
  REFUNDFAILEDINSUFFICIENTFUNDS: REFUNDFAILEDINSUFFICIENTFUNDS,
  REFUNDISRESTRICTED: REFUNDISRESTRICTED,
  REFUNDNOTALLOWED: REFUNDNOTALLOWED,
  REFUNDNOTPERMITTEDDUETOCHARGEBACK: REFUNDNOTPERMITTEDDUETOCHARGEBACK,
  REFUNDTIMELIMITEXCEEDED: REFUNDTIMELIMITEXCEEDED,
  ReauthorizeRequest: ReauthorizeRequest,
  Refund: Refund,
  RefundAllOf: RefundAllOf,
  RefundRequest: RefundRequest,
  RefundStatus: RefundStatus,
  RefundStatusDetails: RefundStatusDetails,
  RelatedIds: RelatedIds,
  SellerProtection: SellerProtection,
  SellerReceivableBreakdown: SellerReceivableBreakdown,
  SupplementaryData: SupplementaryData,
  SupplementaryPurchaseData: SupplementaryPurchaseData,
  TRANSACTIONDISPUTED: TRANSACTIONDISPUTED,
  TRANSACTIONREFUSED: TRANSACTIONREFUSED,
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
