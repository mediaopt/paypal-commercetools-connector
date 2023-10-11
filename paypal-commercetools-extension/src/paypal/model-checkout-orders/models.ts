import localVarRequest from 'request';

export * from './aCTIONDOESNOTMATCHINTENT';
export * from './activityTimestamps';
export * from './addressDetails';
export * from './addressDetails1';
export * from './addressPortable';
export * from './addressPortable2';
export * from './aGREEMENTALREADYCANCELLED';
export * from './amountBreakdown';
export * from './aMOUNTCANNOTBESPECIFIED';
export * from './aMOUNTCHANGENOTALLOWED';
export * from './aMOUNTMISMATCH';
export * from './aMOUNTNOTPATCHABLE';
export * from './amountWithBreakdown';
export * from './amountWithBreakdownAllOf';
export * from './aPPLEPAYAMOUNTMISMATCH';
export * from './applePayDecryptedTokenData';
export * from './applePayPaymentData';
export * from './applePayRequest';
export * from './aUTHCAPTURENOTENABLED';
export * from './authenticationResponse';
export * from './authorization';
export * from './authorizationAllOf';
export * from './aUTHORIZATIONAMOUNTEXCEEDED';
export * from './aUTHORIZATIONCURRENCYMISMATCH';
export * from './authorizationStatus';
export * from './authorizationStatusDetails';
export * from './authorizationWithAdditionalData';
export * from './authorizationWithAdditionalDataAllOf';
export * from './bancontact';
export * from './bancontactRequest';
export * from './bANKNOTSUPPORTEDFORVERIFICATION';
export * from './bILLINGADDRESSINVALID';
export * from './bILLINGAGREEMENTIDMISMATCH';
export * from './bILLINGAGREEMENTNOTFOUND';
export * from './binDetails';
export * from './blik';
export * from './blikRequest';
export * from './cANCELURLREQUIRED';
export * from './cANNOTBENEGATIVE';
export * from './cANNOTBEZEROORNEGATIVE';
export * from './capture';
export * from './captureAllOf';
export * from './cAPTUREIDNOTFOUND';
export * from './captureStatus';
export * from './captureStatusDetails';
export * from './cAPTURESTATUSNOTVALID';
export * from './card';
export * from './cardAttributes';
export * from './cardAttributesResponse';
export * from './cardBrand';
export * from './cARDBRANDNOTSUPPORTED';
export * from './cARDEXPIRED';
export * from './cARDEXPIRYREQUIRED';
export * from './cardFromRequest';
export * from './cARDNUMBERREQUIRED';
export * from './cardRequest';
export * from './cardRequestAllOf';
export * from './cardResponse';
export * from './cardStoredCredential';
export * from './cardSupplementaryData';
export * from './cardType';
export * from './cARDTYPENOTSUPPORTED';
export * from './checkoutPaymentIntent';
export * from './cITYREQUIRED';
export * from './cobrandedCard';
export * from './cOMPLIANCEVIOLATION';
export * from './confirmOrderRequest';
export * from './cONSENTNEEDED';
export * from './cOUNTRYNOTSUPPORTEDBYPAYMENTSOURCE';
export * from './cRYPTOGRAMREQUIRED';
export * from './cURRENCYNOTSUPPORTEDFORBANK';
export * from './cURRENCYNOTSUPPORTEDFORCARDTYPE';
export * from './cURRENCYNOTSUPPORTEDFORCOUNTRY';
export * from './customer';
export * from './dECIMALPRECISION';
export * from './dECLINEDDUETORELATEDTXN';
export * from './dEVICEDATANOTAVAILABLE';
export * from './disbursementMode';
export * from './dOMESTICTRANSACTIONREQUIRED';
export * from './dONATIONITEMSNOTSUPPORTED';
export * from './dUPLICATEINVOICEID';
export * from './dUPLICATEREFERENCEID';
export * from './eMVDATAREQUIRED';
export * from './enrolled';
export * from './eps';
export * from './epsRequest';
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
export * from './experienceContextBase';
export * from './fIELDNOTPATCHABLE';
export * from './giropay';
export * from './giropayRequest';
export * from './gOOGLEPAYGATEWAYMERCHANTIDMISMATCH';
export * from './iBANCOUNTRYNOTSUPPORTED';
export * from './ideal';
export * from './idealRequest';
export * from './iDENTIFIERNOTFOUND';
export * from './iNCOMPATIBLEPARAMETERVALUE';
export * from './iNSTRUMENTDECLINED';
export * from './iNVALIDACCOUNTSTATUS';
export * from './iNVALIDARRAYMAXITEMS';
export * from './iNVALIDARRAYMINITEMS';
export * from './iNVALIDCOUNTRYCODE';
export * from './iNVALIDCURRENCYCODE';
export * from './iNVALIDEXPIRYDATE';
export * from './iNVALIDFXRATEID';
export * from './iNVALIDGOOGLEPAYTOKEN';
export * from './iNVALIDIBAN';
export * from './iNVALIDJSONPOINTERFORMAT';
export * from './iNVALIDJSONPOINTERFORMAT1';
export * from './iNVALIDPARAMETER';
export * from './iNVALIDPARAMETERSYNTAX';
export * from './iNVALIDPARAMETERSYNTAX1';
export * from './iNVALIDPARAMETERVALUE';
export * from './iNVALIDPARAMETERVALUE1';
export * from './iNVALIDPATCHOPERATION';
export * from './iNVALIDPAYEEPRICINGTIERID';
export * from './iNVALIDPAYERID';
export * from './iNVALIDPICKUPADDRESS';
export * from './iNVALIDPLATFORMFEESACCOUNT';
export * from './iNVALIDPLATFORMFEESAMOUNT';
export * from './iNVALIDPREVIOUSTRANSACTIONREFERENCE';
export * from './iNVALIDRESOURCEID';
export * from './iNVALIDSECURITYCODELENGTH';
export * from './iNVALIDSTRINGLENGTH';
export * from './iNVALIDSTRINGLENGTH1';
export * from './iNVALIDSTRINGMAXLENGTH';
export * from './item';
export * from './iTEMCATEGORYNOTSUPPORTEDBYPAYMENTSOURCE';
export * from './iTEMSKUMISMATCH';
export * from './iTEMTOTALMISMATCH';
export * from './iTEMTOTALREQUIRED';
export * from './level2CardProcessingData';
export * from './level3CardProcessingData';
export * from './liabilityShift';
export * from './lineItem';
export * from './lineItemAllOf';
export * from './linkDescription';
export * from './mALFORMEDREQUESTJSON';
export * from './mAXAUTHORIZATIONCOUNTEXCEEDED';
export * from './mAXNUMBEROFPAYMENTATTEMPTSEXCEEDED';
export * from './mAXVALUEEXCEEDED';
export * from './mERCHANTINITIATEDWITHAUTHENTICATIONRESULTS';
export * from './mERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS';
export * from './mERCHANTINITIATEDWITHSECURITYCODE';
export * from './merchantPayableBreakdown';
export * from './mISMATCHEDVAULTIDTOPAYMENTSOURCE';
export * from './mISSINGCRYPTOGRAM';
export * from './mISSINGPICKUPADDRESS';
export * from './mISSINGPREVIOUSREFERENCE';
export * from './mISSINGREQUIREDPARAMETER';
export * from './mISSINGREQUIREDPARAMETER1';
export * from './mISSINGREQUIREDPARAMETER2';
export * from './mISSINGREQUIREDPARAMETER3';
export * from './model400';
export * from './model400IssuesInner';
export * from './model401';
export * from './model401IssuesInner';
export * from './model403';
export * from './model403IssuesInner';
export * from './model404';
export * from './model404IssuesInner';
export * from './model422';
export * from './model422IssuesInner';
export * from './money';
export * from './money2';
export * from './mSPNOTSUPPORTED';
export * from './mULTICURRENCYORDER';
export * from './mULTIPLEITEMCATEGORIES';
export * from './mULTIPLESHIPPINGADDRESSNOTSUPPORTED';
export * from './mULTIPLESHIPPINGOPTIONSELECTED';
export * from './mULTIPLESHIPPINGTYPENOTSUPPORTED';
export * from './mybank';
export * from './mybankRequest';
export * from './name';
export * from './name2';
export * from './netAmountBreakdownItem';
export * from './networkTransactionReference';
export * from './nOPAYMENTSOURCEPROVIDED';
export * from './nOTELIGIBLEFORPAYPALTRANSACTIONIDPROCESSING';
export * from './nOTELIGIBLEFORPNREFPROCESSING';
export * from './nOTELIGIBLEFORTOKENPROCESSING';
export * from './nOTENABLEDFORAPPLEPAY';
export * from './nOTENABLEDFORBANKPROCESSING';
export * from './nOTENABLEDFORCARDPROCESSING';
export * from './nOTENABLEDFORCARDPROCESSING1';
export * from './nOTENABLEDFORGOOGLEPAY';
export * from './nOTENABLEDTOVAULTPAYMENTSOURCE';
export * from './nOTPATCHABLE';
export * from './nOTSUPPORTED';
export * from './oNEOFPARAMETERSREQUIRED';
export * from './oNEOFTHEPARAMETERSREQUIRED';
export * from './oNLYONEBANKSOURCEALLOWED';
export * from './oNLYONEPAYMENTSOURCEALLOWED';
export * from './order';
export * from './orderAllOf';
export * from './oRDERALREADYAUTHORIZED';
export * from './oRDERALREADYAUTHORIZED1';
export * from './oRDERALREADYCAPTURED';
export * from './oRDERALREADYCAPTURED1';
export * from './oRDERALREADYCOMPLETED';
export * from './orderApplicationContext';
export * from './orderAuthorizeRequest';
export * from './orderAuthorizeResponse';
export * from './oRDERCANNOTBECONFIRMED';
export * from './oRDERCANNOTBESAVED';
export * from './orderCaptureRequest';
export * from './oRDERCOMPLETEDORVOIDED';
export * from './oRDERCOMPLETEONPAYMENTAPPROVAL';
export * from './oRDERCOMPLETEONPAYMENTAPPROVAL1';
export * from './oRDERCOMPLETIONINPROGRESS';
export * from './orderConfirmApplicationContext';
export * from './oRDEREXPIRED';
export * from './oRDERISPENDINGAPPROVAL';
export * from './oRDERNOTAPPROVED';
export * from './oRDERNOTAPPROVED1';
export * from './orderRequest';
export * from './ordersAuthorize400';
export * from './ordersAuthorize400IssuesInner';
export * from './ordersAuthorize400Response';
export * from './ordersAuthorize403';
export * from './ordersAuthorize403IssuesInner';
export * from './ordersAuthorize403Response';
export * from './ordersAuthorize422';
export * from './ordersAuthorize422IssuesInner';
export * from './ordersAuthorize422Response';
export * from './ordersCapture400';
export * from './ordersCapture400IssuesInner';
export * from './ordersCapture400Response';
export * from './ordersCapture403';
export * from './ordersCapture403IssuesInner';
export * from './ordersCapture403Response';
export * from './ordersCapture422';
export * from './ordersCapture422IssuesInner';
export * from './ordersCapture422Response';
export * from './ordersConfirm400';
export * from './ordersConfirm400IssuesInner';
export * from './ordersConfirm400Response';
export * from './ordersConfirm403Response';
export * from './ordersConfirm422';
export * from './ordersConfirm422IssuesInner';
export * from './ordersConfirm422Response';
export * from './ordersCreate400Response';
export * from './ordersCreate401Response';
export * from './ordersCreate422Response';
export * from './ordersGet404Response';
export * from './ordersPatch400';
export * from './ordersPatch400IssuesInner';
export * from './ordersPatch400Response';
export * from './ordersPatch422';
export * from './ordersPatch422IssuesInner';
export * from './ordersPatch422Response';
export * from './orderStatus';
export * from './ordersTrackCreate400';
export * from './ordersTrackCreate400IssuesInner';
export * from './ordersTrackCreate400Response';
export * from './ordersTrackCreate403';
export * from './ordersTrackCreate403IssuesInner';
export * from './ordersTrackCreate403Response';
export * from './ordersTrackCreate422';
export * from './ordersTrackCreate422IssuesInner';
export * from './ordersTrackCreate422Response';
export * from './ordersTrackersPatch400';
export * from './ordersTrackersPatch400IssuesInner';
export * from './ordersTrackersPatch400Response';
export * from './ordersTrackersPatch403';
export * from './ordersTrackersPatch403Response';
export * from './ordersTrackersPatch404';
export * from './ordersTrackersPatch404IssuesInner';
export * from './ordersTrackersPatch404Response';
export * from './ordersTrackersPatch422';
export * from './ordersTrackersPatch422IssuesInner';
export * from './ordersTrackersPatch422Response';
export * from './orderTrackerRequest';
export * from './orderTrackerRequestAllOf';
export * from './p24';
export * from './p24Request';
export * from './paresStatus';
export * from './patch';
export * from './pATCHPATHREQUIRED';
export * from './pATCHPATHREQUIRED1';
export * from './pATCHVALUEREQUIRED';
export * from './pATCHVALUEREQUIRED1';
export * from './payee';
export * from './pAYEEACCOUNTINVALID';
export * from './pAYEEACCOUNTLOCKEDORCLOSED';
export * from './pAYEEACCOUNTNOTVERIFIED';
export * from './pAYEEACCOUNTRESTRICTED';
export * from './payeeBase';
export * from './pAYEEBLOCKEDTRANSACTION';
export * from './pAYEECOUNTRYNOTSUPPORTEDFORPAYMENTSOURCE';
export * from './pAYEEFXRATEIDCURRENCYMISMATCH';
export * from './pAYEEFXRATEIDEXPIRED';
export * from './pAYEENOTENABLEDFORBANKPROCESSING';
export * from './pAYEENOTENABLEDFORCARDPROCESSING';
export * from './payeePaymentMethodPreference';
export * from './pAYEEPRICINGTIERIDNOTENABLED';
export * from './payer';
export * from './pAYERACCOUNTLOCKEDORCLOSED';
export * from './pAYERACCOUNTRESTRICTED';
export * from './pAYERACTIONREQUIRED';
export * from './payerAllOf';
export * from './payerBase';
export * from './pAYERCANNOTPAY';
export * from './pAYERCANNOTPAY1';
export * from './pAYMENTALREADYAPPROVED';
export * from './paymentCollection';
export * from './paymentInitiator';
export * from './paymentInstruction';
export * from './paymentMethod';
export * from './paymentSource';
export * from './pAYMENTSOURCECANNOTBEUSED';
export * from './pAYMENTSOURCEDECLINEDBYPROCESSOR';
export * from './pAYMENTSOURCEINFOCANNOTBEVERIFIED';
export * from './pAYMENTSOURCEMISMATCH';
export * from './pAYMENTSOURCENOTSUPPORTED';
export * from './paymentSourceResponse';
export * from './pAYMENTTYPENOTSUPPORTEDFORINTENT';
export * from './pAYPALREQUESTIDREQUIRED';
export * from './pAYPALTRANSACTIONIDEXPIRED';
export * from './pAYPALTRANSACTIONIDNOTFOUND';
export * from './paypalWallet';
export * from './paypalWalletAttributes';
export * from './paypalWalletAttributesResponse';
export * from './paypalWalletExperienceContext';
export * from './paypalWalletResponse';
export * from './pERMISSIONDENIED';
export * from './pERMISSIONDENIEDFORDONATIONITEMS';
export * from './phone';
export * from './phone2';
export * from './phoneType';
export * from './phoneType2';
export * from './phoneWithType';
export * from './platformFee';
export * from './pLATFORMFEEPAYEECANNOTBESAMEASPAYER';
export * from './pLATFORMFEESNOTSUPPORTED';
export * from './pNREFEXPIRED';
export * from './pNREFNOTFOUND';
export * from './pOSTALCODEREQUIRED';
export * from './pREFERREDPAYMENTSOURCEMISMATCH';
export * from './pREFERREDSHIPPINGOPTIONAMOUNTMISMATCH';
export * from './pREVIOUSTRANSACTIONREFERENCEHASCHARGEBACK';
export * from './pREVIOUSTRANSACTIONREFERENCEVOIDED';
export * from './processingInstruction';
export * from './processorResponse';
export * from './purchaseUnit';
export * from './purchaseUnitRequest';
export * from './rEDIRECTPAYERFORALTERNATEFUNDING';
export * from './rEFERENCEDCARDEXPIRED';
export * from './rEFERENCEIDNOTFOUND';
export * from './rEFERENCEIDREQUIRED';
export * from './refund';
export * from './refundAllOf';
export * from './refundStatus';
export * from './refundStatusDetails';
export * from './rEQUIREDPARAMETERFORCUSTOMERINITIATEDPAYMENT';
export * from './rEQUIREDPARAMETERFORPAYMENTSOURCE';
export * from './rETURNURLREQUIRED';
export * from './sAVEORDERNOTSUPPORTED';
export * from './sellerProtection';
export * from './sellerReceivableBreakdown';
export * from './sETUPERRORFORBANK';
export * from './shipmentCarrier';
export * from './shipmentTracker';
export * from './shipmentTrackingNumberType';
export * from './shipmentTrackingStatus';
export * from './sHIPPINGADDRESSINVALID';
export * from './shippingDetail';
export * from './sHIPPINGOPTIONNOTSELECTED';
export * from './sHIPPINGOPTIONSNOTSUPPORTED';
export * from './sHIPPINGOPTIONSNOTSUPPORTED1';
export * from './sHIPPINGTYPENOTSUPPORTEDFORCLIENT';
export * from './shippingWithTrackingDetails';
export * from './shippingWithTrackingDetailsAllOf';
export * from './sofort';
export * from './sofortRequest';
export * from './storedPaymentSource';
export * from './storedPaymentSourcePaymentType';
export * from './storedPaymentSourceUsageType';
export * from './storeInVaultInstruction';
export * from './supplementaryData';
export * from './taxInfo';
export * from './tAXTOTALMISMATCH';
export * from './tAXTOTALREQUIRED';
export * from './threeDSecureAuthenticationResponse';
export * from './token';
export * from './tOKENEXPIRED';
export * from './tOKENIDNOTFOUND';
export * from './tracker';
export * from './trackerAllOf';
export * from './tRACKERIDNOTFOUND';
export * from './trackerItem';
export * from './tRANSACTIONBLOCKEDBYPAYEE';
export * from './tRANSACTIONLIMITEXCEEDED';
export * from './tRANSACTIONRECEIVINGLIMITEXCEEDED';
export * from './tRANSACTIONREFUSED';
export * from './trustly';
export * from './trustlyRequest';
export * from './uNSUPPORTEDINTENT';
export * from './uNSUPPORTEDINTENTFORPAYMENTSOURCE';
export * from './uNSUPPORTEDPATCHPARAMETERVALUE';
export * from './uNSUPPORTEDPAYMENTINSTRUCTION';
export * from './uNSUPPORTEDPROCESSINGINSTRUCTION';
export * from './uNSUPPORTEDSHIPPINGTYPE';
export * from './v3VaultInstructionBase';
export * from './vaultInstructionBase';
export * from './vAULTINSTRUCTIONDUPLICATED';
export * from './vAULTINSTRUCTIONREQUIRED';
export * from './vaultPaypalWalletBase';
export * from './vaultPaypalWalletBaseAllOf';
export * from './vaultResponse';
export * from './vaultVenmoWalletBase';
export * from './vaultVenmoWalletBaseAllOf';
export * from './venmoWalletAttributes';
export * from './venmoWalletAttributesResponse';
export * from './venmoWalletExperienceContext';
export * from './venmoWalletRequest';
export * from './venmoWalletResponse';

import * as fs from 'fs';

export interface RequestDetailedFile {
  value: Buffer;
  options?: {
    filename?: string;
    contentType?: string;
  };
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;

import { ACTIONDOESNOTMATCHINTENT } from './aCTIONDOESNOTMATCHINTENT';
import { ActivityTimestamps } from './activityTimestamps';
import { AddressDetails } from './addressDetails';
import { AddressDetails1 } from './addressDetails1';
import { AddressPortable } from './addressPortable';
import { AddressPortable2 } from './addressPortable2';
import { AGREEMENTALREADYCANCELLED } from './aGREEMENTALREADYCANCELLED';
import { AmountBreakdown } from './amountBreakdown';
import { AMOUNTCANNOTBESPECIFIED } from './aMOUNTCANNOTBESPECIFIED';
import { AMOUNTCHANGENOTALLOWED } from './aMOUNTCHANGENOTALLOWED';
import { AMOUNTMISMATCH } from './aMOUNTMISMATCH';
import { AMOUNTNOTPATCHABLE } from './aMOUNTNOTPATCHABLE';
import { AmountWithBreakdown } from './amountWithBreakdown';
import { AmountWithBreakdownAllOf } from './amountWithBreakdownAllOf';
import { APPLEPAYAMOUNTMISMATCH } from './aPPLEPAYAMOUNTMISMATCH';
import { ApplePayDecryptedTokenData } from './applePayDecryptedTokenData';
import { ApplePayPaymentData } from './applePayPaymentData';
import { ApplePayRequest } from './applePayRequest';
import { AUTHCAPTURENOTENABLED } from './aUTHCAPTURENOTENABLED';
import { AuthenticationResponse } from './authenticationResponse';
import { Authorization } from './authorization';
import { AuthorizationAllOf } from './authorizationAllOf';
import { AUTHORIZATIONAMOUNTEXCEEDED } from './aUTHORIZATIONAMOUNTEXCEEDED';
import { AUTHORIZATIONCURRENCYMISMATCH } from './aUTHORIZATIONCURRENCYMISMATCH';
import { AuthorizationStatus } from './authorizationStatus';
import { AuthorizationStatusDetails } from './authorizationStatusDetails';
import { AuthorizationWithAdditionalData } from './authorizationWithAdditionalData';
import { AuthorizationWithAdditionalDataAllOf } from './authorizationWithAdditionalDataAllOf';
import { Bancontact } from './bancontact';
import { BancontactRequest } from './bancontactRequest';
import { BANKNOTSUPPORTEDFORVERIFICATION } from './bANKNOTSUPPORTEDFORVERIFICATION';
import { BILLINGADDRESSINVALID } from './bILLINGADDRESSINVALID';
import { BILLINGAGREEMENTIDMISMATCH } from './bILLINGAGREEMENTIDMISMATCH';
import { BILLINGAGREEMENTNOTFOUND } from './bILLINGAGREEMENTNOTFOUND';
import { BinDetails } from './binDetails';
import { Blik } from './blik';
import { BlikRequest } from './blikRequest';
import { CANCELURLREQUIRED } from './cANCELURLREQUIRED';
import { CANNOTBENEGATIVE } from './cANNOTBENEGATIVE';
import { CANNOTBEZEROORNEGATIVE } from './cANNOTBEZEROORNEGATIVE';
import { Capture } from './capture';
import { CaptureAllOf } from './captureAllOf';
import { CAPTUREIDNOTFOUND } from './cAPTUREIDNOTFOUND';
import { CaptureStatus } from './captureStatus';
import { CaptureStatusDetails } from './captureStatusDetails';
import { CAPTURESTATUSNOTVALID } from './cAPTURESTATUSNOTVALID';
import { Card } from './card';
import { CardAttributes } from './cardAttributes';
import { CardAttributesResponse } from './cardAttributesResponse';
import { CardBrand } from './cardBrand';
import { CARDBRANDNOTSUPPORTED } from './cARDBRANDNOTSUPPORTED';
import { CARDEXPIRED } from './cARDEXPIRED';
import { CARDEXPIRYREQUIRED } from './cARDEXPIRYREQUIRED';
import { CardFromRequest } from './cardFromRequest';
import { CARDNUMBERREQUIRED } from './cARDNUMBERREQUIRED';
import { CardRequest } from './cardRequest';
import { CardRequestAllOf } from './cardRequestAllOf';
import { CardResponse } from './cardResponse';
import { CardStoredCredential } from './cardStoredCredential';
import { CardSupplementaryData } from './cardSupplementaryData';
import { CardType } from './cardType';
import { CARDTYPENOTSUPPORTED } from './cARDTYPENOTSUPPORTED';
import { CheckoutPaymentIntent } from './checkoutPaymentIntent';
import { CITYREQUIRED } from './cITYREQUIRED';
import { CobrandedCard } from './cobrandedCard';
import { COMPLIANCEVIOLATION } from './cOMPLIANCEVIOLATION';
import { ConfirmOrderRequest } from './confirmOrderRequest';
import { CONSENTNEEDED } from './cONSENTNEEDED';
import { COUNTRYNOTSUPPORTEDBYPAYMENTSOURCE } from './cOUNTRYNOTSUPPORTEDBYPAYMENTSOURCE';
import { CRYPTOGRAMREQUIRED } from './cRYPTOGRAMREQUIRED';
import { CURRENCYNOTSUPPORTEDFORBANK } from './cURRENCYNOTSUPPORTEDFORBANK';
import { CURRENCYNOTSUPPORTEDFORCARDTYPE } from './cURRENCYNOTSUPPORTEDFORCARDTYPE';
import { CURRENCYNOTSUPPORTEDFORCOUNTRY } from './cURRENCYNOTSUPPORTEDFORCOUNTRY';
import { Customer } from './customer';
import { DECIMALPRECISION } from './dECIMALPRECISION';
import { DECLINEDDUETORELATEDTXN } from './dECLINEDDUETORELATEDTXN';
import { DEVICEDATANOTAVAILABLE } from './dEVICEDATANOTAVAILABLE';
import { DisbursementMode } from './disbursementMode';
import { DOMESTICTRANSACTIONREQUIRED } from './dOMESTICTRANSACTIONREQUIRED';
import { DONATIONITEMSNOTSUPPORTED } from './dONATIONITEMSNOTSUPPORTED';
import { DUPLICATEINVOICEID } from './dUPLICATEINVOICEID';
import { DUPLICATEREFERENCEID } from './dUPLICATEREFERENCEID';
import { EMVDATAREQUIRED } from './eMVDATAREQUIRED';
import { Enrolled } from './enrolled';
import { Eps } from './eps';
import { EpsRequest } from './epsRequest';
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
import { ExperienceContextBase } from './experienceContextBase';
import { FIELDNOTPATCHABLE } from './fIELDNOTPATCHABLE';
import { Giropay } from './giropay';
import { GiropayRequest } from './giropayRequest';
import { GOOGLEPAYGATEWAYMERCHANTIDMISMATCH } from './gOOGLEPAYGATEWAYMERCHANTIDMISMATCH';
import { IBANCOUNTRYNOTSUPPORTED } from './iBANCOUNTRYNOTSUPPORTED';
import { Ideal } from './ideal';
import { IdealRequest } from './idealRequest';
import { IDENTIFIERNOTFOUND } from './iDENTIFIERNOTFOUND';
import { INCOMPATIBLEPARAMETERVALUE } from './iNCOMPATIBLEPARAMETERVALUE';
import { INSTRUMENTDECLINED } from './iNSTRUMENTDECLINED';
import { INVALIDACCOUNTSTATUS } from './iNVALIDACCOUNTSTATUS';
import { INVALIDARRAYMAXITEMS } from './iNVALIDARRAYMAXITEMS';
import { INVALIDARRAYMINITEMS } from './iNVALIDARRAYMINITEMS';
import { INVALIDCOUNTRYCODE } from './iNVALIDCOUNTRYCODE';
import { INVALIDCURRENCYCODE } from './iNVALIDCURRENCYCODE';
import { INVALIDEXPIRYDATE } from './iNVALIDEXPIRYDATE';
import { INVALIDFXRATEID } from './iNVALIDFXRATEID';
import { INVALIDGOOGLEPAYTOKEN } from './iNVALIDGOOGLEPAYTOKEN';
import { INVALIDIBAN } from './iNVALIDIBAN';
import { INVALIDJSONPOINTERFORMAT } from './iNVALIDJSONPOINTERFORMAT';
import { INVALIDJSONPOINTERFORMAT1 } from './iNVALIDJSONPOINTERFORMAT1';
import { INVALIDPARAMETER } from './iNVALIDPARAMETER';
import { INVALIDPARAMETERSYNTAX } from './iNVALIDPARAMETERSYNTAX';
import { INVALIDPARAMETERSYNTAX1 } from './iNVALIDPARAMETERSYNTAX1';
import { INVALIDPARAMETERVALUE } from './iNVALIDPARAMETERVALUE';
import { INVALIDPARAMETERVALUE1 } from './iNVALIDPARAMETERVALUE1';
import { INVALIDPATCHOPERATION } from './iNVALIDPATCHOPERATION';
import { INVALIDPAYEEPRICINGTIERID } from './iNVALIDPAYEEPRICINGTIERID';
import { INVALIDPAYERID } from './iNVALIDPAYERID';
import { INVALIDPICKUPADDRESS } from './iNVALIDPICKUPADDRESS';
import { INVALIDPLATFORMFEESACCOUNT } from './iNVALIDPLATFORMFEESACCOUNT';
import { INVALIDPLATFORMFEESAMOUNT } from './iNVALIDPLATFORMFEESAMOUNT';
import { INVALIDPREVIOUSTRANSACTIONREFERENCE } from './iNVALIDPREVIOUSTRANSACTIONREFERENCE';
import { INVALIDRESOURCEID } from './iNVALIDRESOURCEID';
import { INVALIDSECURITYCODELENGTH } from './iNVALIDSECURITYCODELENGTH';
import { INVALIDSTRINGLENGTH } from './iNVALIDSTRINGLENGTH';
import { INVALIDSTRINGLENGTH1 } from './iNVALIDSTRINGLENGTH1';
import { INVALIDSTRINGMAXLENGTH } from './iNVALIDSTRINGMAXLENGTH';
import { Item } from './item';
import { ITEMCATEGORYNOTSUPPORTEDBYPAYMENTSOURCE } from './iTEMCATEGORYNOTSUPPORTEDBYPAYMENTSOURCE';
import { ITEMSKUMISMATCH } from './iTEMSKUMISMATCH';
import { ITEMTOTALMISMATCH } from './iTEMTOTALMISMATCH';
import { ITEMTOTALREQUIRED } from './iTEMTOTALREQUIRED';
import { Level2CardProcessingData } from './level2CardProcessingData';
import { Level3CardProcessingData } from './level3CardProcessingData';
import { LiabilityShift } from './liabilityShift';
import { LineItem } from './lineItem';
import { LineItemAllOf } from './lineItemAllOf';
import { LinkDescription } from './linkDescription';
import { MALFORMEDREQUESTJSON } from './mALFORMEDREQUESTJSON';
import { MAXAUTHORIZATIONCOUNTEXCEEDED } from './mAXAUTHORIZATIONCOUNTEXCEEDED';
import { MAXNUMBEROFPAYMENTATTEMPTSEXCEEDED } from './mAXNUMBEROFPAYMENTATTEMPTSEXCEEDED';
import { MAXVALUEEXCEEDED } from './mAXVALUEEXCEEDED';
import { MERCHANTINITIATEDWITHAUTHENTICATIONRESULTS } from './mERCHANTINITIATEDWITHAUTHENTICATIONRESULTS';
import { MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS } from './mERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS';
import { MERCHANTINITIATEDWITHSECURITYCODE } from './mERCHANTINITIATEDWITHSECURITYCODE';
import { MerchantPayableBreakdown } from './merchantPayableBreakdown';
import { MISMATCHEDVAULTIDTOPAYMENTSOURCE } from './mISMATCHEDVAULTIDTOPAYMENTSOURCE';
import { MISSINGCRYPTOGRAM } from './mISSINGCRYPTOGRAM';
import { MISSINGPICKUPADDRESS } from './mISSINGPICKUPADDRESS';
import { MISSINGPREVIOUSREFERENCE } from './mISSINGPREVIOUSREFERENCE';
import { MISSINGREQUIREDPARAMETER } from './mISSINGREQUIREDPARAMETER';
import { MISSINGREQUIREDPARAMETER1 } from './mISSINGREQUIREDPARAMETER1';
import { MISSINGREQUIREDPARAMETER2 } from './mISSINGREQUIREDPARAMETER2';
import { MISSINGREQUIREDPARAMETER3 } from './mISSINGREQUIREDPARAMETER3';
import { Model400 } from './model400';
import { Model400IssuesInner } from './model400IssuesInner';
import { Model401 } from './model401';
import { Model401IssuesInner } from './model401IssuesInner';
import { Model403 } from './model403';
import { Model403IssuesInner } from './model403IssuesInner';
import { Model404 } from './model404';
import { Model404IssuesInner } from './model404IssuesInner';
import { Model422 } from './model422';
import { Model422IssuesInner } from './model422IssuesInner';
import { Money } from './money';
import { Money2 } from './money2';
import { MSPNOTSUPPORTED } from './mSPNOTSUPPORTED';
import { MULTICURRENCYORDER } from './mULTICURRENCYORDER';
import { MULTIPLEITEMCATEGORIES } from './mULTIPLEITEMCATEGORIES';
import { MULTIPLESHIPPINGADDRESSNOTSUPPORTED } from './mULTIPLESHIPPINGADDRESSNOTSUPPORTED';
import { MULTIPLESHIPPINGOPTIONSELECTED } from './mULTIPLESHIPPINGOPTIONSELECTED';
import { MULTIPLESHIPPINGTYPENOTSUPPORTED } from './mULTIPLESHIPPINGTYPENOTSUPPORTED';
import { Mybank } from './mybank';
import { MybankRequest } from './mybankRequest';
import { Name } from './name';
import { Name2 } from './name2';
import { NetAmountBreakdownItem } from './netAmountBreakdownItem';
import { NetworkTransactionReference } from './networkTransactionReference';
import { NOPAYMENTSOURCEPROVIDED } from './nOPAYMENTSOURCEPROVIDED';
import { NOTELIGIBLEFORPAYPALTRANSACTIONIDPROCESSING } from './nOTELIGIBLEFORPAYPALTRANSACTIONIDPROCESSING';
import { NOTELIGIBLEFORPNREFPROCESSING } from './nOTELIGIBLEFORPNREFPROCESSING';
import { NOTELIGIBLEFORTOKENPROCESSING } from './nOTELIGIBLEFORTOKENPROCESSING';
import { NOTENABLEDFORAPPLEPAY } from './nOTENABLEDFORAPPLEPAY';
import { NOTENABLEDFORBANKPROCESSING } from './nOTENABLEDFORBANKPROCESSING';
import { NOTENABLEDFORCARDPROCESSING } from './nOTENABLEDFORCARDPROCESSING';
import { NOTENABLEDFORCARDPROCESSING1 } from './nOTENABLEDFORCARDPROCESSING1';
import { NOTENABLEDFORGOOGLEPAY } from './nOTENABLEDFORGOOGLEPAY';
import { NOTENABLEDTOVAULTPAYMENTSOURCE } from './nOTENABLEDTOVAULTPAYMENTSOURCE';
import { NOTPATCHABLE } from './nOTPATCHABLE';
import { NOTSUPPORTED } from './nOTSUPPORTED';
import { ONEOFPARAMETERSREQUIRED } from './oNEOFPARAMETERSREQUIRED';
import { ONEOFTHEPARAMETERSREQUIRED } from './oNEOFTHEPARAMETERSREQUIRED';
import { ONLYONEBANKSOURCEALLOWED } from './oNLYONEBANKSOURCEALLOWED';
import { ONLYONEPAYMENTSOURCEALLOWED } from './oNLYONEPAYMENTSOURCEALLOWED';
import { Order } from './order';
import { OrderAllOf } from './orderAllOf';
import { ORDERALREADYAUTHORIZED } from './oRDERALREADYAUTHORIZED';
import { ORDERALREADYAUTHORIZED1 } from './oRDERALREADYAUTHORIZED1';
import { ORDERALREADYCAPTURED } from './oRDERALREADYCAPTURED';
import { ORDERALREADYCAPTURED1 } from './oRDERALREADYCAPTURED1';
import { ORDERALREADYCOMPLETED } from './oRDERALREADYCOMPLETED';
import { OrderApplicationContext } from './orderApplicationContext';
import { OrderAuthorizeRequest } from './orderAuthorizeRequest';
import { OrderAuthorizeResponse } from './orderAuthorizeResponse';
import { ORDERCANNOTBECONFIRMED } from './oRDERCANNOTBECONFIRMED';
import { ORDERCANNOTBESAVED } from './oRDERCANNOTBESAVED';
import { OrderCaptureRequest } from './orderCaptureRequest';
import { ORDERCOMPLETEDORVOIDED } from './oRDERCOMPLETEDORVOIDED';
import { ORDERCOMPLETEONPAYMENTAPPROVAL } from './oRDERCOMPLETEONPAYMENTAPPROVAL';
import { ORDERCOMPLETEONPAYMENTAPPROVAL1 } from './oRDERCOMPLETEONPAYMENTAPPROVAL1';
import { ORDERCOMPLETIONINPROGRESS } from './oRDERCOMPLETIONINPROGRESS';
import { OrderConfirmApplicationContext } from './orderConfirmApplicationContext';
import { ORDEREXPIRED } from './oRDEREXPIRED';
import { ORDERISPENDINGAPPROVAL } from './oRDERISPENDINGAPPROVAL';
import { ORDERNOTAPPROVED } from './oRDERNOTAPPROVED';
import { ORDERNOTAPPROVED1 } from './oRDERNOTAPPROVED1';
import { OrderRequest } from './orderRequest';
import { OrdersAuthorize400 } from './ordersAuthorize400';
import { OrdersAuthorize400IssuesInner } from './ordersAuthorize400IssuesInner';
import { OrdersAuthorize400Response } from './ordersAuthorize400Response';
import { OrdersAuthorize403 } from './ordersAuthorize403';
import { OrdersAuthorize403IssuesInner } from './ordersAuthorize403IssuesInner';
import { OrdersAuthorize403Response } from './ordersAuthorize403Response';
import { OrdersAuthorize422 } from './ordersAuthorize422';
import { OrdersAuthorize422IssuesInner } from './ordersAuthorize422IssuesInner';
import { OrdersAuthorize422Response } from './ordersAuthorize422Response';
import { OrdersCapture400 } from './ordersCapture400';
import { OrdersCapture400IssuesInner } from './ordersCapture400IssuesInner';
import { OrdersCapture400Response } from './ordersCapture400Response';
import { OrdersCapture403 } from './ordersCapture403';
import { OrdersCapture403IssuesInner } from './ordersCapture403IssuesInner';
import { OrdersCapture403Response } from './ordersCapture403Response';
import { OrdersCapture422 } from './ordersCapture422';
import { OrdersCapture422IssuesInner } from './ordersCapture422IssuesInner';
import { OrdersCapture422Response } from './ordersCapture422Response';
import { OrdersConfirm400 } from './ordersConfirm400';
import { OrdersConfirm400IssuesInner } from './ordersConfirm400IssuesInner';
import { OrdersConfirm400Response } from './ordersConfirm400Response';
import { OrdersConfirm403Response } from './ordersConfirm403Response';
import { OrdersConfirm422 } from './ordersConfirm422';
import { OrdersConfirm422IssuesInner } from './ordersConfirm422IssuesInner';
import { OrdersConfirm422Response } from './ordersConfirm422Response';
import { OrdersCreate400Response } from './ordersCreate400Response';
import { OrdersCreate401Response } from './ordersCreate401Response';
import { OrdersCreate422Response } from './ordersCreate422Response';
import { OrdersGet404Response } from './ordersGet404Response';
import { OrdersPatch400 } from './ordersPatch400';
import { OrdersPatch400IssuesInner } from './ordersPatch400IssuesInner';
import { OrdersPatch400Response } from './ordersPatch400Response';
import { OrdersPatch422 } from './ordersPatch422';
import { OrdersPatch422IssuesInner } from './ordersPatch422IssuesInner';
import { OrdersPatch422Response } from './ordersPatch422Response';
import { OrderStatus } from './orderStatus';
import { OrdersTrackCreate400 } from './ordersTrackCreate400';
import { OrdersTrackCreate400IssuesInner } from './ordersTrackCreate400IssuesInner';
import { OrdersTrackCreate400Response } from './ordersTrackCreate400Response';
import { OrdersTrackCreate403 } from './ordersTrackCreate403';
import { OrdersTrackCreate403IssuesInner } from './ordersTrackCreate403IssuesInner';
import { OrdersTrackCreate403Response } from './ordersTrackCreate403Response';
import { OrdersTrackCreate422 } from './ordersTrackCreate422';
import { OrdersTrackCreate422IssuesInner } from './ordersTrackCreate422IssuesInner';
import { OrdersTrackCreate422Response } from './ordersTrackCreate422Response';
import { OrdersTrackersPatch400 } from './ordersTrackersPatch400';
import { OrdersTrackersPatch400IssuesInner } from './ordersTrackersPatch400IssuesInner';
import { OrdersTrackersPatch400Response } from './ordersTrackersPatch400Response';
import { OrdersTrackersPatch403 } from './ordersTrackersPatch403';
import { OrdersTrackersPatch403Response } from './ordersTrackersPatch403Response';
import { OrdersTrackersPatch404 } from './ordersTrackersPatch404';
import { OrdersTrackersPatch404IssuesInner } from './ordersTrackersPatch404IssuesInner';
import { OrdersTrackersPatch404Response } from './ordersTrackersPatch404Response';
import { OrdersTrackersPatch422 } from './ordersTrackersPatch422';
import { OrdersTrackersPatch422IssuesInner } from './ordersTrackersPatch422IssuesInner';
import { OrdersTrackersPatch422Response } from './ordersTrackersPatch422Response';
import { OrderTrackerRequest } from './orderTrackerRequest';
import { OrderTrackerRequestAllOf } from './orderTrackerRequestAllOf';
import { P24 } from './p24';
import { P24Request } from './p24Request';
import { ParesStatus } from './paresStatus';
import { Patch } from './patch';
import { PATCHPATHREQUIRED } from './pATCHPATHREQUIRED';
import { PATCHPATHREQUIRED1 } from './pATCHPATHREQUIRED1';
import { PATCHVALUEREQUIRED } from './pATCHVALUEREQUIRED';
import { PATCHVALUEREQUIRED1 } from './pATCHVALUEREQUIRED1';
import { Payee } from './payee';
import { PAYEEACCOUNTINVALID } from './pAYEEACCOUNTINVALID';
import { PAYEEACCOUNTLOCKEDORCLOSED } from './pAYEEACCOUNTLOCKEDORCLOSED';
import { PAYEEACCOUNTNOTVERIFIED } from './pAYEEACCOUNTNOTVERIFIED';
import { PAYEEACCOUNTRESTRICTED } from './pAYEEACCOUNTRESTRICTED';
import { PayeeBase } from './payeeBase';
import { PAYEEBLOCKEDTRANSACTION } from './pAYEEBLOCKEDTRANSACTION';
import { PAYEECOUNTRYNOTSUPPORTEDFORPAYMENTSOURCE } from './pAYEECOUNTRYNOTSUPPORTEDFORPAYMENTSOURCE';
import { PAYEEFXRATEIDCURRENCYMISMATCH } from './pAYEEFXRATEIDCURRENCYMISMATCH';
import { PAYEEFXRATEIDEXPIRED } from './pAYEEFXRATEIDEXPIRED';
import { PAYEENOTENABLEDFORBANKPROCESSING } from './pAYEENOTENABLEDFORBANKPROCESSING';
import { PAYEENOTENABLEDFORCARDPROCESSING } from './pAYEENOTENABLEDFORCARDPROCESSING';
import { PayeePaymentMethodPreference } from './payeePaymentMethodPreference';
import { PAYEEPRICINGTIERIDNOTENABLED } from './pAYEEPRICINGTIERIDNOTENABLED';
import { Payer } from './payer';
import { PAYERACCOUNTLOCKEDORCLOSED } from './pAYERACCOUNTLOCKEDORCLOSED';
import { PAYERACCOUNTRESTRICTED } from './pAYERACCOUNTRESTRICTED';
import { PAYERACTIONREQUIRED } from './pAYERACTIONREQUIRED';
import { PayerAllOf } from './payerAllOf';
import { PayerBase } from './payerBase';
import { PAYERCANNOTPAY } from './pAYERCANNOTPAY';
import { PAYERCANNOTPAY1 } from './pAYERCANNOTPAY1';
import { PAYMENTALREADYAPPROVED } from './pAYMENTALREADYAPPROVED';
import { PaymentCollection } from './paymentCollection';
import { PaymentInitiator } from './paymentInitiator';
import { PaymentInstruction } from './paymentInstruction';
import { PaymentMethod } from './paymentMethod';
import { PaymentSource } from './paymentSource';
import { PAYMENTSOURCECANNOTBEUSED } from './pAYMENTSOURCECANNOTBEUSED';
import { PAYMENTSOURCEDECLINEDBYPROCESSOR } from './pAYMENTSOURCEDECLINEDBYPROCESSOR';
import { PAYMENTSOURCEINFOCANNOTBEVERIFIED } from './pAYMENTSOURCEINFOCANNOTBEVERIFIED';
import { PAYMENTSOURCEMISMATCH } from './pAYMENTSOURCEMISMATCH';
import { PAYMENTSOURCENOTSUPPORTED } from './pAYMENTSOURCENOTSUPPORTED';
import { PaymentSourceResponse } from './paymentSourceResponse';
import { PAYMENTTYPENOTSUPPORTEDFORINTENT } from './pAYMENTTYPENOTSUPPORTEDFORINTENT';
import { PAYPALREQUESTIDREQUIRED } from './pAYPALREQUESTIDREQUIRED';
import { PAYPALTRANSACTIONIDEXPIRED } from './pAYPALTRANSACTIONIDEXPIRED';
import { PAYPALTRANSACTIONIDNOTFOUND } from './pAYPALTRANSACTIONIDNOTFOUND';
import { PaypalWallet } from './paypalWallet';
import { PaypalWalletAttributes } from './paypalWalletAttributes';
import { PaypalWalletAttributesResponse } from './paypalWalletAttributesResponse';
import { PaypalWalletExperienceContext } from './paypalWalletExperienceContext';
import { PaypalWalletResponse } from './paypalWalletResponse';
import { PERMISSIONDENIED } from './pERMISSIONDENIED';
import { PERMISSIONDENIEDFORDONATIONITEMS } from './pERMISSIONDENIEDFORDONATIONITEMS';
import { Phone } from './phone';
import { Phone2 } from './phone2';
import { PhoneType } from './phoneType';
import { PhoneType2 } from './phoneType2';
import { PhoneWithType } from './phoneWithType';
import { PlatformFee } from './platformFee';
import { PLATFORMFEEPAYEECANNOTBESAMEASPAYER } from './pLATFORMFEEPAYEECANNOTBESAMEASPAYER';
import { PLATFORMFEESNOTSUPPORTED } from './pLATFORMFEESNOTSUPPORTED';
import { PNREFEXPIRED } from './pNREFEXPIRED';
import { PNREFNOTFOUND } from './pNREFNOTFOUND';
import { POSTALCODEREQUIRED } from './pOSTALCODEREQUIRED';
import { PREFERREDPAYMENTSOURCEMISMATCH } from './pREFERREDPAYMENTSOURCEMISMATCH';
import { PREFERREDSHIPPINGOPTIONAMOUNTMISMATCH } from './pREFERREDSHIPPINGOPTIONAMOUNTMISMATCH';
import { PREVIOUSTRANSACTIONREFERENCEHASCHARGEBACK } from './pREVIOUSTRANSACTIONREFERENCEHASCHARGEBACK';
import { PREVIOUSTRANSACTIONREFERENCEVOIDED } from './pREVIOUSTRANSACTIONREFERENCEVOIDED';
import { ProcessingInstruction } from './processingInstruction';
import { ProcessorResponse } from './processorResponse';
import { PurchaseUnit } from './purchaseUnit';
import { PurchaseUnitRequest } from './purchaseUnitRequest';
import { REDIRECTPAYERFORALTERNATEFUNDING } from './rEDIRECTPAYERFORALTERNATEFUNDING';
import { REFERENCEDCARDEXPIRED } from './rEFERENCEDCARDEXPIRED';
import { REFERENCEIDNOTFOUND } from './rEFERENCEIDNOTFOUND';
import { REFERENCEIDREQUIRED } from './rEFERENCEIDREQUIRED';
import { Refund } from './refund';
import { RefundAllOf } from './refundAllOf';
import { RefundStatus } from './refundStatus';
import { RefundStatusDetails } from './refundStatusDetails';
import { REQUIREDPARAMETERFORCUSTOMERINITIATEDPAYMENT } from './rEQUIREDPARAMETERFORCUSTOMERINITIATEDPAYMENT';
import { REQUIREDPARAMETERFORPAYMENTSOURCE } from './rEQUIREDPARAMETERFORPAYMENTSOURCE';
import { RETURNURLREQUIRED } from './rETURNURLREQUIRED';
import { SAVEORDERNOTSUPPORTED } from './sAVEORDERNOTSUPPORTED';
import { SellerProtection } from './sellerProtection';
import { SellerReceivableBreakdown } from './sellerReceivableBreakdown';
import { SETUPERRORFORBANK } from './sETUPERRORFORBANK';
import { ShipmentCarrier } from './shipmentCarrier';
import { ShipmentTracker } from './shipmentTracker';
import { ShipmentTrackingNumberType } from './shipmentTrackingNumberType';
import { ShipmentTrackingStatus } from './shipmentTrackingStatus';
import { SHIPPINGADDRESSINVALID } from './sHIPPINGADDRESSINVALID';
import { ShippingDetail } from './shippingDetail';
import { SHIPPINGOPTIONNOTSELECTED } from './sHIPPINGOPTIONNOTSELECTED';
import { SHIPPINGOPTIONSNOTSUPPORTED } from './sHIPPINGOPTIONSNOTSUPPORTED';
import { SHIPPINGOPTIONSNOTSUPPORTED1 } from './sHIPPINGOPTIONSNOTSUPPORTED1';
import { SHIPPINGTYPENOTSUPPORTEDFORCLIENT } from './sHIPPINGTYPENOTSUPPORTEDFORCLIENT';
import { ShippingWithTrackingDetails } from './shippingWithTrackingDetails';
import { ShippingWithTrackingDetailsAllOf } from './shippingWithTrackingDetailsAllOf';
import { Sofort } from './sofort';
import { SofortRequest } from './sofortRequest';
import { StoredPaymentSource } from './storedPaymentSource';
import { StoredPaymentSourcePaymentType } from './storedPaymentSourcePaymentType';
import { StoredPaymentSourceUsageType } from './storedPaymentSourceUsageType';
import { StoreInVaultInstruction } from './storeInVaultInstruction';
import { SupplementaryData } from './supplementaryData';
import { TaxInfo } from './taxInfo';
import { TAXTOTALMISMATCH } from './tAXTOTALMISMATCH';
import { TAXTOTALREQUIRED } from './tAXTOTALREQUIRED';
import { ThreeDSecureAuthenticationResponse } from './threeDSecureAuthenticationResponse';
import { Token } from './token';
import { TOKENEXPIRED } from './tOKENEXPIRED';
import { TOKENIDNOTFOUND } from './tOKENIDNOTFOUND';
import { Tracker } from './tracker';
import { TrackerAllOf } from './trackerAllOf';
import { TRACKERIDNOTFOUND } from './tRACKERIDNOTFOUND';
import { TrackerItem } from './trackerItem';
import { TRANSACTIONBLOCKEDBYPAYEE } from './tRANSACTIONBLOCKEDBYPAYEE';
import { TRANSACTIONLIMITEXCEEDED } from './tRANSACTIONLIMITEXCEEDED';
import { TRANSACTIONRECEIVINGLIMITEXCEEDED } from './tRANSACTIONRECEIVINGLIMITEXCEEDED';
import { TRANSACTIONREFUSED } from './tRANSACTIONREFUSED';
import { Trustly } from './trustly';
import { TrustlyRequest } from './trustlyRequest';
import { UNSUPPORTEDINTENT } from './uNSUPPORTEDINTENT';
import { UNSUPPORTEDINTENTFORPAYMENTSOURCE } from './uNSUPPORTEDINTENTFORPAYMENTSOURCE';
import { UNSUPPORTEDPATCHPARAMETERVALUE } from './uNSUPPORTEDPATCHPARAMETERVALUE';
import { UNSUPPORTEDPAYMENTINSTRUCTION } from './uNSUPPORTEDPAYMENTINSTRUCTION';
import { UNSUPPORTEDPROCESSINGINSTRUCTION } from './uNSUPPORTEDPROCESSINGINSTRUCTION';
import { UNSUPPORTEDSHIPPINGTYPE } from './uNSUPPORTEDSHIPPINGTYPE';
import { V3VaultInstructionBase } from './v3VaultInstructionBase';
import { VaultInstructionBase } from './vaultInstructionBase';
import { VAULTINSTRUCTIONDUPLICATED } from './vAULTINSTRUCTIONDUPLICATED';
import { VAULTINSTRUCTIONREQUIRED } from './vAULTINSTRUCTIONREQUIRED';
import { VaultPaypalWalletBase } from './vaultPaypalWalletBase';
import { VaultPaypalWalletBaseAllOf } from './vaultPaypalWalletBaseAllOf';
import { VaultResponse } from './vaultResponse';
import { VaultVenmoWalletBase } from './vaultVenmoWalletBase';
import { VaultVenmoWalletBaseAllOf } from './vaultVenmoWalletBaseAllOf';
import { VenmoWalletAttributes } from './venmoWalletAttributes';
import { VenmoWalletAttributesResponse } from './venmoWalletAttributesResponse';
import { VenmoWalletExperienceContext } from './venmoWalletExperienceContext';
import { VenmoWalletRequest } from './venmoWalletRequest';
import { VenmoWalletResponse } from './venmoWalletResponse';

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
  'ACTIONDOESNOTMATCHINTENT.IssueEnum': ACTIONDOESNOTMATCHINTENT.IssueEnum,
  'ACTIONDOESNOTMATCHINTENT.DescriptionEnum':
    ACTIONDOESNOTMATCHINTENT.DescriptionEnum,
  'AGREEMENTALREADYCANCELLED.IssueEnum': AGREEMENTALREADYCANCELLED.IssueEnum,
  'AGREEMENTALREADYCANCELLED.DescriptionEnum':
    AGREEMENTALREADYCANCELLED.DescriptionEnum,
  'AMOUNTCANNOTBESPECIFIED.IssueEnum': AMOUNTCANNOTBESPECIFIED.IssueEnum,
  'AMOUNTCANNOTBESPECIFIED.DescriptionEnum':
    AMOUNTCANNOTBESPECIFIED.DescriptionEnum,
  'AMOUNTCHANGENOTALLOWED.IssueEnum': AMOUNTCHANGENOTALLOWED.IssueEnum,
  'AMOUNTCHANGENOTALLOWED.DescriptionEnum':
    AMOUNTCHANGENOTALLOWED.DescriptionEnum,
  'AMOUNTMISMATCH.IssueEnum': AMOUNTMISMATCH.IssueEnum,
  'AMOUNTMISMATCH.DescriptionEnum': AMOUNTMISMATCH.DescriptionEnum,
  'AMOUNTNOTPATCHABLE.IssueEnum': AMOUNTNOTPATCHABLE.IssueEnum,
  'AMOUNTNOTPATCHABLE.DescriptionEnum': AMOUNTNOTPATCHABLE.DescriptionEnum,
  'APPLEPAYAMOUNTMISMATCH.IssueEnum': APPLEPAYAMOUNTMISMATCH.IssueEnum,
  'APPLEPAYAMOUNTMISMATCH.DescriptionEnum':
    APPLEPAYAMOUNTMISMATCH.DescriptionEnum,
  'AUTHCAPTURENOTENABLED.IssueEnum': AUTHCAPTURENOTENABLED.IssueEnum,
  'AUTHCAPTURENOTENABLED.DescriptionEnum':
    AUTHCAPTURENOTENABLED.DescriptionEnum,
  'AUTHORIZATIONAMOUNTEXCEEDED.IssueEnum':
    AUTHORIZATIONAMOUNTEXCEEDED.IssueEnum,
  'AUTHORIZATIONAMOUNTEXCEEDED.DescriptionEnum':
    AUTHORIZATIONAMOUNTEXCEEDED.DescriptionEnum,
  'AUTHORIZATIONCURRENCYMISMATCH.IssueEnum':
    AUTHORIZATIONCURRENCYMISMATCH.IssueEnum,
  'AUTHORIZATIONCURRENCYMISMATCH.DescriptionEnum':
    AUTHORIZATIONCURRENCYMISMATCH.DescriptionEnum,
  'ApplePayDecryptedTokenData.PaymentDataTypeEnum':
    ApplePayDecryptedTokenData.PaymentDataTypeEnum,
  'Authorization.StatusEnum': Authorization.StatusEnum,
  'AuthorizationStatus.StatusEnum': AuthorizationStatus.StatusEnum,
  'AuthorizationStatusDetails.ReasonEnum':
    AuthorizationStatusDetails.ReasonEnum,
  'AuthorizationWithAdditionalData.StatusEnum':
    AuthorizationWithAdditionalData.StatusEnum,
  'BANKNOTSUPPORTEDFORVERIFICATION.IssueEnum':
    BANKNOTSUPPORTEDFORVERIFICATION.IssueEnum,
  'BANKNOTSUPPORTEDFORVERIFICATION.DescriptionEnum':
    BANKNOTSUPPORTEDFORVERIFICATION.DescriptionEnum,
  'BILLINGADDRESSINVALID.IssueEnum': BILLINGADDRESSINVALID.IssueEnum,
  'BILLINGADDRESSINVALID.DescriptionEnum':
    BILLINGADDRESSINVALID.DescriptionEnum,
  'BILLINGAGREEMENTIDMISMATCH.IssueEnum': BILLINGAGREEMENTIDMISMATCH.IssueEnum,
  'BILLINGAGREEMENTIDMISMATCH.DescriptionEnum':
    BILLINGAGREEMENTIDMISMATCH.DescriptionEnum,
  'BILLINGAGREEMENTNOTFOUND.IssueEnum': BILLINGAGREEMENTNOTFOUND.IssueEnum,
  'BILLINGAGREEMENTNOTFOUND.DescriptionEnum':
    BILLINGAGREEMENTNOTFOUND.DescriptionEnum,
  'CANCELURLREQUIRED.IssueEnum': CANCELURLREQUIRED.IssueEnum,
  'CANCELURLREQUIRED.DescriptionEnum': CANCELURLREQUIRED.DescriptionEnum,
  'CANNOTBENEGATIVE.IssueEnum': CANNOTBENEGATIVE.IssueEnum,
  'CANNOTBENEGATIVE.DescriptionEnum': CANNOTBENEGATIVE.DescriptionEnum,
  'CANNOTBEZEROORNEGATIVE.IssueEnum': CANNOTBEZEROORNEGATIVE.IssueEnum,
  'CANNOTBEZEROORNEGATIVE.DescriptionEnum':
    CANNOTBEZEROORNEGATIVE.DescriptionEnum,
  'CAPTUREIDNOTFOUND.IssueEnum': CAPTUREIDNOTFOUND.IssueEnum,
  'CAPTUREIDNOTFOUND.DescriptionEnum': CAPTUREIDNOTFOUND.DescriptionEnum,
  'CAPTURESTATUSNOTVALID.IssueEnum': CAPTURESTATUSNOTVALID.IssueEnum,
  'CAPTURESTATUSNOTVALID.DescriptionEnum':
    CAPTURESTATUSNOTVALID.DescriptionEnum,
  'CARDBRANDNOTSUPPORTED.IssueEnum': CARDBRANDNOTSUPPORTED.IssueEnum,
  'CARDBRANDNOTSUPPORTED.DescriptionEnum':
    CARDBRANDNOTSUPPORTED.DescriptionEnum,
  'CARDEXPIRED.IssueEnum': CARDEXPIRED.IssueEnum,
  'CARDEXPIRED.DescriptionEnum': CARDEXPIRED.DescriptionEnum,
  'CARDEXPIRYREQUIRED.IssueEnum': CARDEXPIRYREQUIRED.IssueEnum,
  'CARDEXPIRYREQUIRED.DescriptionEnum': CARDEXPIRYREQUIRED.DescriptionEnum,
  'CARDNUMBERREQUIRED.IssueEnum': CARDNUMBERREQUIRED.IssueEnum,
  'CARDNUMBERREQUIRED.DescriptionEnum': CARDNUMBERREQUIRED.DescriptionEnum,
  'CARDTYPENOTSUPPORTED.IssueEnum': CARDTYPENOTSUPPORTED.IssueEnum,
  'CARDTYPENOTSUPPORTED.DescriptionEnum': CARDTYPENOTSUPPORTED.DescriptionEnum,
  'CITYREQUIRED.IssueEnum': CITYREQUIRED.IssueEnum,
  'CITYREQUIRED.DescriptionEnum': CITYREQUIRED.DescriptionEnum,
  'COMPLIANCEVIOLATION.IssueEnum': COMPLIANCEVIOLATION.IssueEnum,
  'COMPLIANCEVIOLATION.DescriptionEnum': COMPLIANCEVIOLATION.DescriptionEnum,
  'CONSENTNEEDED.IssueEnum': CONSENTNEEDED.IssueEnum,
  'CONSENTNEEDED.DescriptionEnum': CONSENTNEEDED.DescriptionEnum,
  'COUNTRYNOTSUPPORTEDBYPAYMENTSOURCE.IssueEnum':
    COUNTRYNOTSUPPORTEDBYPAYMENTSOURCE.IssueEnum,
  'COUNTRYNOTSUPPORTEDBYPAYMENTSOURCE.DescriptionEnum':
    COUNTRYNOTSUPPORTEDBYPAYMENTSOURCE.DescriptionEnum,
  'CRYPTOGRAMREQUIRED.IssueEnum': CRYPTOGRAMREQUIRED.IssueEnum,
  'CRYPTOGRAMREQUIRED.DescriptionEnum': CRYPTOGRAMREQUIRED.DescriptionEnum,
  'CURRENCYNOTSUPPORTEDFORBANK.IssueEnum':
    CURRENCYNOTSUPPORTEDFORBANK.IssueEnum,
  'CURRENCYNOTSUPPORTEDFORBANK.DescriptionEnum':
    CURRENCYNOTSUPPORTEDFORBANK.DescriptionEnum,
  'CURRENCYNOTSUPPORTEDFORCARDTYPE.IssueEnum':
    CURRENCYNOTSUPPORTEDFORCARDTYPE.IssueEnum,
  'CURRENCYNOTSUPPORTEDFORCARDTYPE.DescriptionEnum':
    CURRENCYNOTSUPPORTEDFORCARDTYPE.DescriptionEnum,
  'CURRENCYNOTSUPPORTEDFORCOUNTRY.IssueEnum':
    CURRENCYNOTSUPPORTEDFORCOUNTRY.IssueEnum,
  'CURRENCYNOTSUPPORTEDFORCOUNTRY.DescriptionEnum':
    CURRENCYNOTSUPPORTEDFORCOUNTRY.DescriptionEnum,
  'Capture.StatusEnum': Capture.StatusEnum,
  'CaptureStatus.StatusEnum': CaptureStatus.StatusEnum,
  'CaptureStatusDetails.ReasonEnum': CaptureStatusDetails.ReasonEnum,
  CardBrand: CardBrand,
  'CardResponse.TypeEnum': CardResponse.TypeEnum,
  CardType: CardType,
  CheckoutPaymentIntent: CheckoutPaymentIntent,
  'DECIMALPRECISION.IssueEnum': DECIMALPRECISION.IssueEnum,
  'DECIMALPRECISION.DescriptionEnum': DECIMALPRECISION.DescriptionEnum,
  'DECLINEDDUETORELATEDTXN.IssueEnum': DECLINEDDUETORELATEDTXN.IssueEnum,
  'DECLINEDDUETORELATEDTXN.DescriptionEnum':
    DECLINEDDUETORELATEDTXN.DescriptionEnum,
  'DEVICEDATANOTAVAILABLE.IssueEnum': DEVICEDATANOTAVAILABLE.IssueEnum,
  'DEVICEDATANOTAVAILABLE.DescriptionEnum':
    DEVICEDATANOTAVAILABLE.DescriptionEnum,
  'DOMESTICTRANSACTIONREQUIRED.IssueEnum':
    DOMESTICTRANSACTIONREQUIRED.IssueEnum,
  'DOMESTICTRANSACTIONREQUIRED.DescriptionEnum':
    DOMESTICTRANSACTIONREQUIRED.DescriptionEnum,
  'DONATIONITEMSNOTSUPPORTED.IssueEnum': DONATIONITEMSNOTSUPPORTED.IssueEnum,
  'DONATIONITEMSNOTSUPPORTED.DescriptionEnum':
    DONATIONITEMSNOTSUPPORTED.DescriptionEnum,
  'DUPLICATEINVOICEID.IssueEnum': DUPLICATEINVOICEID.IssueEnum,
  'DUPLICATEINVOICEID.DescriptionEnum': DUPLICATEINVOICEID.DescriptionEnum,
  'DUPLICATEREFERENCEID.IssueEnum': DUPLICATEREFERENCEID.IssueEnum,
  'DUPLICATEREFERENCEID.DescriptionEnum': DUPLICATEREFERENCEID.DescriptionEnum,
  DisbursementMode: DisbursementMode,
  'EMVDATAREQUIRED.IssueEnum': EMVDATAREQUIRED.IssueEnum,
  'EMVDATAREQUIRED.DescriptionEnum': EMVDATAREQUIRED.DescriptionEnum,
  Enrolled: Enrolled,
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
  'ExperienceContextBase.ShippingPreferenceEnum':
    ExperienceContextBase.ShippingPreferenceEnum,
  'FIELDNOTPATCHABLE.IssueEnum': FIELDNOTPATCHABLE.IssueEnum,
  'FIELDNOTPATCHABLE.DescriptionEnum': FIELDNOTPATCHABLE.DescriptionEnum,
  'GOOGLEPAYGATEWAYMERCHANTIDMISMATCH.IssueEnum':
    GOOGLEPAYGATEWAYMERCHANTIDMISMATCH.IssueEnum,
  'GOOGLEPAYGATEWAYMERCHANTIDMISMATCH.DescriptionEnum':
    GOOGLEPAYGATEWAYMERCHANTIDMISMATCH.DescriptionEnum,
  'IBANCOUNTRYNOTSUPPORTED.IssueEnum': IBANCOUNTRYNOTSUPPORTED.IssueEnum,
  'IBANCOUNTRYNOTSUPPORTED.DescriptionEnum':
    IBANCOUNTRYNOTSUPPORTED.DescriptionEnum,
  'IDENTIFIERNOTFOUND.IssueEnum': IDENTIFIERNOTFOUND.IssueEnum,
  'IDENTIFIERNOTFOUND.DescriptionEnum': IDENTIFIERNOTFOUND.DescriptionEnum,
  'INCOMPATIBLEPARAMETERVALUE.IssueEnum': INCOMPATIBLEPARAMETERVALUE.IssueEnum,
  'INCOMPATIBLEPARAMETERVALUE.DescriptionEnum':
    INCOMPATIBLEPARAMETERVALUE.DescriptionEnum,
  'INSTRUMENTDECLINED.IssueEnum': INSTRUMENTDECLINED.IssueEnum,
  'INSTRUMENTDECLINED.DescriptionEnum': INSTRUMENTDECLINED.DescriptionEnum,
  'INVALIDACCOUNTSTATUS.IssueEnum': INVALIDACCOUNTSTATUS.IssueEnum,
  'INVALIDACCOUNTSTATUS.DescriptionEnum': INVALIDACCOUNTSTATUS.DescriptionEnum,
  'INVALIDARRAYMAXITEMS.IssueEnum': INVALIDARRAYMAXITEMS.IssueEnum,
  'INVALIDARRAYMAXITEMS.DescriptionEnum': INVALIDARRAYMAXITEMS.DescriptionEnum,
  'INVALIDARRAYMINITEMS.IssueEnum': INVALIDARRAYMINITEMS.IssueEnum,
  'INVALIDARRAYMINITEMS.DescriptionEnum': INVALIDARRAYMINITEMS.DescriptionEnum,
  'INVALIDCOUNTRYCODE.IssueEnum': INVALIDCOUNTRYCODE.IssueEnum,
  'INVALIDCOUNTRYCODE.DescriptionEnum': INVALIDCOUNTRYCODE.DescriptionEnum,
  'INVALIDCURRENCYCODE.IssueEnum': INVALIDCURRENCYCODE.IssueEnum,
  'INVALIDCURRENCYCODE.DescriptionEnum': INVALIDCURRENCYCODE.DescriptionEnum,
  'INVALIDEXPIRYDATE.IssueEnum': INVALIDEXPIRYDATE.IssueEnum,
  'INVALIDEXPIRYDATE.DescriptionEnum': INVALIDEXPIRYDATE.DescriptionEnum,
  'INVALIDFXRATEID.IssueEnum': INVALIDFXRATEID.IssueEnum,
  'INVALIDFXRATEID.DescriptionEnum': INVALIDFXRATEID.DescriptionEnum,
  'INVALIDGOOGLEPAYTOKEN.IssueEnum': INVALIDGOOGLEPAYTOKEN.IssueEnum,
  'INVALIDGOOGLEPAYTOKEN.DescriptionEnum':
    INVALIDGOOGLEPAYTOKEN.DescriptionEnum,
  'INVALIDIBAN.IssueEnum': INVALIDIBAN.IssueEnum,
  'INVALIDIBAN.DescriptionEnum': INVALIDIBAN.DescriptionEnum,
  'INVALIDJSONPOINTERFORMAT.IssueEnum': INVALIDJSONPOINTERFORMAT.IssueEnum,
  'INVALIDJSONPOINTERFORMAT.DescriptionEnum':
    INVALIDJSONPOINTERFORMAT.DescriptionEnum,
  'INVALIDJSONPOINTERFORMAT1.IssueEnum': INVALIDJSONPOINTERFORMAT1.IssueEnum,
  'INVALIDJSONPOINTERFORMAT1.DescriptionEnum':
    INVALIDJSONPOINTERFORMAT1.DescriptionEnum,
  'INVALIDPARAMETER.IssueEnum': INVALIDPARAMETER.IssueEnum,
  'INVALIDPARAMETER.DescriptionEnum': INVALIDPARAMETER.DescriptionEnum,
  'INVALIDPARAMETERSYNTAX.IssueEnum': INVALIDPARAMETERSYNTAX.IssueEnum,
  'INVALIDPARAMETERSYNTAX.DescriptionEnum':
    INVALIDPARAMETERSYNTAX.DescriptionEnum,
  'INVALIDPARAMETERSYNTAX1.IssueEnum': INVALIDPARAMETERSYNTAX1.IssueEnum,
  'INVALIDPARAMETERSYNTAX1.DescriptionEnum':
    INVALIDPARAMETERSYNTAX1.DescriptionEnum,
  'INVALIDPARAMETERVALUE.IssueEnum': INVALIDPARAMETERVALUE.IssueEnum,
  'INVALIDPARAMETERVALUE.DescriptionEnum':
    INVALIDPARAMETERVALUE.DescriptionEnum,
  'INVALIDPARAMETERVALUE1.IssueEnum': INVALIDPARAMETERVALUE1.IssueEnum,
  'INVALIDPARAMETERVALUE1.DescriptionEnum':
    INVALIDPARAMETERVALUE1.DescriptionEnum,
  'INVALIDPATCHOPERATION.IssueEnum': INVALIDPATCHOPERATION.IssueEnum,
  'INVALIDPATCHOPERATION.DescriptionEnum':
    INVALIDPATCHOPERATION.DescriptionEnum,
  'INVALIDPAYEEPRICINGTIERID.IssueEnum': INVALIDPAYEEPRICINGTIERID.IssueEnum,
  'INVALIDPAYEEPRICINGTIERID.DescriptionEnum':
    INVALIDPAYEEPRICINGTIERID.DescriptionEnum,
  'INVALIDPAYERID.IssueEnum': INVALIDPAYERID.IssueEnum,
  'INVALIDPAYERID.DescriptionEnum': INVALIDPAYERID.DescriptionEnum,
  'INVALIDPICKUPADDRESS.IssueEnum': INVALIDPICKUPADDRESS.IssueEnum,
  'INVALIDPICKUPADDRESS.DescriptionEnum': INVALIDPICKUPADDRESS.DescriptionEnum,
  'INVALIDPLATFORMFEESACCOUNT.IssueEnum': INVALIDPLATFORMFEESACCOUNT.IssueEnum,
  'INVALIDPLATFORMFEESACCOUNT.DescriptionEnum':
    INVALIDPLATFORMFEESACCOUNT.DescriptionEnum,
  'INVALIDPLATFORMFEESAMOUNT.IssueEnum': INVALIDPLATFORMFEESAMOUNT.IssueEnum,
  'INVALIDPLATFORMFEESAMOUNT.DescriptionEnum':
    INVALIDPLATFORMFEESAMOUNT.DescriptionEnum,
  'INVALIDPREVIOUSTRANSACTIONREFERENCE.IssueEnum':
    INVALIDPREVIOUSTRANSACTIONREFERENCE.IssueEnum,
  'INVALIDPREVIOUSTRANSACTIONREFERENCE.DescriptionEnum':
    INVALIDPREVIOUSTRANSACTIONREFERENCE.DescriptionEnum,
  'INVALIDRESOURCEID.IssueEnum': INVALIDRESOURCEID.IssueEnum,
  'INVALIDRESOURCEID.DescriptionEnum': INVALIDRESOURCEID.DescriptionEnum,
  'INVALIDSECURITYCODELENGTH.IssueEnum': INVALIDSECURITYCODELENGTH.IssueEnum,
  'INVALIDSECURITYCODELENGTH.DescriptionEnum':
    INVALIDSECURITYCODELENGTH.DescriptionEnum,
  'INVALIDSTRINGLENGTH.IssueEnum': INVALIDSTRINGLENGTH.IssueEnum,
  'INVALIDSTRINGLENGTH.DescriptionEnum': INVALIDSTRINGLENGTH.DescriptionEnum,
  'INVALIDSTRINGLENGTH1.IssueEnum': INVALIDSTRINGLENGTH1.IssueEnum,
  'INVALIDSTRINGLENGTH1.DescriptionEnum': INVALIDSTRINGLENGTH1.DescriptionEnum,
  'INVALIDSTRINGMAXLENGTH.IssueEnum': INVALIDSTRINGMAXLENGTH.IssueEnum,
  'INVALIDSTRINGMAXLENGTH.DescriptionEnum':
    INVALIDSTRINGMAXLENGTH.DescriptionEnum,
  'ITEMCATEGORYNOTSUPPORTEDBYPAYMENTSOURCE.IssueEnum':
    ITEMCATEGORYNOTSUPPORTEDBYPAYMENTSOURCE.IssueEnum,
  'ITEMCATEGORYNOTSUPPORTEDBYPAYMENTSOURCE.DescriptionEnum':
    ITEMCATEGORYNOTSUPPORTEDBYPAYMENTSOURCE.DescriptionEnum,
  'ITEMSKUMISMATCH.IssueEnum': ITEMSKUMISMATCH.IssueEnum,
  'ITEMSKUMISMATCH.DescriptionEnum': ITEMSKUMISMATCH.DescriptionEnum,
  'ITEMTOTALMISMATCH.IssueEnum': ITEMTOTALMISMATCH.IssueEnum,
  'ITEMTOTALMISMATCH.DescriptionEnum': ITEMTOTALMISMATCH.DescriptionEnum,
  'ITEMTOTALREQUIRED.IssueEnum': ITEMTOTALREQUIRED.IssueEnum,
  'ITEMTOTALREQUIRED.DescriptionEnum': ITEMTOTALREQUIRED.DescriptionEnum,
  'Item.CategoryEnum': Item.CategoryEnum,
  LiabilityShift: LiabilityShift,
  'LineItem.CategoryEnum': LineItem.CategoryEnum,
  'LinkDescription.MethodEnum': LinkDescription.MethodEnum,
  'MALFORMEDREQUESTJSON.IssueEnum': MALFORMEDREQUESTJSON.IssueEnum,
  'MALFORMEDREQUESTJSON.DescriptionEnum': MALFORMEDREQUESTJSON.DescriptionEnum,
  'MAXAUTHORIZATIONCOUNTEXCEEDED.IssueEnum':
    MAXAUTHORIZATIONCOUNTEXCEEDED.IssueEnum,
  'MAXAUTHORIZATIONCOUNTEXCEEDED.DescriptionEnum':
    MAXAUTHORIZATIONCOUNTEXCEEDED.DescriptionEnum,
  'MAXNUMBEROFPAYMENTATTEMPTSEXCEEDED.IssueEnum':
    MAXNUMBEROFPAYMENTATTEMPTSEXCEEDED.IssueEnum,
  'MAXNUMBEROFPAYMENTATTEMPTSEXCEEDED.DescriptionEnum':
    MAXNUMBEROFPAYMENTATTEMPTSEXCEEDED.DescriptionEnum,
  'MAXVALUEEXCEEDED.IssueEnum': MAXVALUEEXCEEDED.IssueEnum,
  'MAXVALUEEXCEEDED.DescriptionEnum': MAXVALUEEXCEEDED.DescriptionEnum,
  'MERCHANTINITIATEDWITHAUTHENTICATIONRESULTS.IssueEnum':
    MERCHANTINITIATEDWITHAUTHENTICATIONRESULTS.IssueEnum,
  'MERCHANTINITIATEDWITHAUTHENTICATIONRESULTS.DescriptionEnum':
    MERCHANTINITIATEDWITHAUTHENTICATIONRESULTS.DescriptionEnum,
  'MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS.IssueEnum':
    MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS.IssueEnum,
  'MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS.DescriptionEnum':
    MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS.DescriptionEnum,
  'MERCHANTINITIATEDWITHSECURITYCODE.IssueEnum':
    MERCHANTINITIATEDWITHSECURITYCODE.IssueEnum,
  'MERCHANTINITIATEDWITHSECURITYCODE.DescriptionEnum':
    MERCHANTINITIATEDWITHSECURITYCODE.DescriptionEnum,
  'MISMATCHEDVAULTIDTOPAYMENTSOURCE.IssueEnum':
    MISMATCHEDVAULTIDTOPAYMENTSOURCE.IssueEnum,
  'MISMATCHEDVAULTIDTOPAYMENTSOURCE.DescriptionEnum':
    MISMATCHEDVAULTIDTOPAYMENTSOURCE.DescriptionEnum,
  'MISSINGCRYPTOGRAM.IssueEnum': MISSINGCRYPTOGRAM.IssueEnum,
  'MISSINGCRYPTOGRAM.DescriptionEnum': MISSINGCRYPTOGRAM.DescriptionEnum,
  'MISSINGPICKUPADDRESS.IssueEnum': MISSINGPICKUPADDRESS.IssueEnum,
  'MISSINGPICKUPADDRESS.DescriptionEnum': MISSINGPICKUPADDRESS.DescriptionEnum,
  'MISSINGPREVIOUSREFERENCE.IssueEnum': MISSINGPREVIOUSREFERENCE.IssueEnum,
  'MISSINGPREVIOUSREFERENCE.DescriptionEnum':
    MISSINGPREVIOUSREFERENCE.DescriptionEnum,
  'MISSINGREQUIREDPARAMETER.IssueEnum': MISSINGREQUIREDPARAMETER.IssueEnum,
  'MISSINGREQUIREDPARAMETER.DescriptionEnum':
    MISSINGREQUIREDPARAMETER.DescriptionEnum,
  'MISSINGREQUIREDPARAMETER1.IssueEnum': MISSINGREQUIREDPARAMETER1.IssueEnum,
  'MISSINGREQUIREDPARAMETER1.DescriptionEnum':
    MISSINGREQUIREDPARAMETER1.DescriptionEnum,
  'MISSINGREQUIREDPARAMETER2.IssueEnum': MISSINGREQUIREDPARAMETER2.IssueEnum,
  'MISSINGREQUIREDPARAMETER2.DescriptionEnum':
    MISSINGREQUIREDPARAMETER2.DescriptionEnum,
  'MISSINGREQUIREDPARAMETER3.IssueEnum': MISSINGREQUIREDPARAMETER3.IssueEnum,
  'MISSINGREQUIREDPARAMETER3.DescriptionEnum':
    MISSINGREQUIREDPARAMETER3.DescriptionEnum,
  'MSPNOTSUPPORTED.IssueEnum': MSPNOTSUPPORTED.IssueEnum,
  'MSPNOTSUPPORTED.DescriptionEnum': MSPNOTSUPPORTED.DescriptionEnum,
  'MULTICURRENCYORDER.IssueEnum': MULTICURRENCYORDER.IssueEnum,
  'MULTICURRENCYORDER.DescriptionEnum': MULTICURRENCYORDER.DescriptionEnum,
  'MULTIPLEITEMCATEGORIES.IssueEnum': MULTIPLEITEMCATEGORIES.IssueEnum,
  'MULTIPLEITEMCATEGORIES.DescriptionEnum':
    MULTIPLEITEMCATEGORIES.DescriptionEnum,
  'MULTIPLESHIPPINGADDRESSNOTSUPPORTED.IssueEnum':
    MULTIPLESHIPPINGADDRESSNOTSUPPORTED.IssueEnum,
  'MULTIPLESHIPPINGADDRESSNOTSUPPORTED.DescriptionEnum':
    MULTIPLESHIPPINGADDRESSNOTSUPPORTED.DescriptionEnum,
  'MULTIPLESHIPPINGOPTIONSELECTED.IssueEnum':
    MULTIPLESHIPPINGOPTIONSELECTED.IssueEnum,
  'MULTIPLESHIPPINGOPTIONSELECTED.DescriptionEnum':
    MULTIPLESHIPPINGOPTIONSELECTED.DescriptionEnum,
  'MULTIPLESHIPPINGTYPENOTSUPPORTED.IssueEnum':
    MULTIPLESHIPPINGTYPENOTSUPPORTED.IssueEnum,
  'MULTIPLESHIPPINGTYPENOTSUPPORTED.DescriptionEnum':
    MULTIPLESHIPPINGTYPENOTSUPPORTED.DescriptionEnum,
  'Model400IssuesInner.IssueEnum': Model400IssuesInner.IssueEnum,
  'Model400IssuesInner.DescriptionEnum': Model400IssuesInner.DescriptionEnum,
  'Model401IssuesInner.IssueEnum': Model401IssuesInner.IssueEnum,
  'Model401IssuesInner.DescriptionEnum': Model401IssuesInner.DescriptionEnum,
  'Model403IssuesInner.IssueEnum': Model403IssuesInner.IssueEnum,
  'Model403IssuesInner.DescriptionEnum': Model403IssuesInner.DescriptionEnum,
  'Model404IssuesInner.IssueEnum': Model404IssuesInner.IssueEnum,
  'Model404IssuesInner.DescriptionEnum': Model404IssuesInner.DescriptionEnum,
  'Model422IssuesInner.IssueEnum': Model422IssuesInner.IssueEnum,
  'Model422IssuesInner.DescriptionEnum': Model422IssuesInner.DescriptionEnum,
  'NOPAYMENTSOURCEPROVIDED.IssueEnum': NOPAYMENTSOURCEPROVIDED.IssueEnum,
  'NOPAYMENTSOURCEPROVIDED.DescriptionEnum':
    NOPAYMENTSOURCEPROVIDED.DescriptionEnum,
  'NOTELIGIBLEFORPAYPALTRANSACTIONIDPROCESSING.IssueEnum':
    NOTELIGIBLEFORPAYPALTRANSACTIONIDPROCESSING.IssueEnum,
  'NOTELIGIBLEFORPAYPALTRANSACTIONIDPROCESSING.DescriptionEnum':
    NOTELIGIBLEFORPAYPALTRANSACTIONIDPROCESSING.DescriptionEnum,
  'NOTELIGIBLEFORPNREFPROCESSING.IssueEnum':
    NOTELIGIBLEFORPNREFPROCESSING.IssueEnum,
  'NOTELIGIBLEFORPNREFPROCESSING.DescriptionEnum':
    NOTELIGIBLEFORPNREFPROCESSING.DescriptionEnum,
  'NOTELIGIBLEFORTOKENPROCESSING.IssueEnum':
    NOTELIGIBLEFORTOKENPROCESSING.IssueEnum,
  'NOTELIGIBLEFORTOKENPROCESSING.DescriptionEnum':
    NOTELIGIBLEFORTOKENPROCESSING.DescriptionEnum,
  'NOTENABLEDFORAPPLEPAY.IssueEnum': NOTENABLEDFORAPPLEPAY.IssueEnum,
  'NOTENABLEDFORAPPLEPAY.DescriptionEnum':
    NOTENABLEDFORAPPLEPAY.DescriptionEnum,
  'NOTENABLEDFORBANKPROCESSING.IssueEnum':
    NOTENABLEDFORBANKPROCESSING.IssueEnum,
  'NOTENABLEDFORBANKPROCESSING.DescriptionEnum':
    NOTENABLEDFORBANKPROCESSING.DescriptionEnum,
  'NOTENABLEDFORCARDPROCESSING.IssueEnum':
    NOTENABLEDFORCARDPROCESSING.IssueEnum,
  'NOTENABLEDFORCARDPROCESSING.DescriptionEnum':
    NOTENABLEDFORCARDPROCESSING.DescriptionEnum,
  'NOTENABLEDFORCARDPROCESSING1.IssueEnum':
    NOTENABLEDFORCARDPROCESSING1.IssueEnum,
  'NOTENABLEDFORCARDPROCESSING1.DescriptionEnum':
    NOTENABLEDFORCARDPROCESSING1.DescriptionEnum,
  'NOTENABLEDFORGOOGLEPAY.IssueEnum': NOTENABLEDFORGOOGLEPAY.IssueEnum,
  'NOTENABLEDFORGOOGLEPAY.DescriptionEnum':
    NOTENABLEDFORGOOGLEPAY.DescriptionEnum,
  'NOTENABLEDTOVAULTPAYMENTSOURCE.IssueEnum':
    NOTENABLEDTOVAULTPAYMENTSOURCE.IssueEnum,
  'NOTENABLEDTOVAULTPAYMENTSOURCE.DescriptionEnum':
    NOTENABLEDTOVAULTPAYMENTSOURCE.DescriptionEnum,
  'NOTPATCHABLE.IssueEnum': NOTPATCHABLE.IssueEnum,
  'NOTPATCHABLE.DescriptionEnum': NOTPATCHABLE.DescriptionEnum,
  'NOTSUPPORTED.IssueEnum': NOTSUPPORTED.IssueEnum,
  'NOTSUPPORTED.DescriptionEnum': NOTSUPPORTED.DescriptionEnum,
  'ONEOFPARAMETERSREQUIRED.IssueEnum': ONEOFPARAMETERSREQUIRED.IssueEnum,
  'ONEOFPARAMETERSREQUIRED.DescriptionEnum':
    ONEOFPARAMETERSREQUIRED.DescriptionEnum,
  'ONEOFTHEPARAMETERSREQUIRED.IssueEnum': ONEOFTHEPARAMETERSREQUIRED.IssueEnum,
  'ONEOFTHEPARAMETERSREQUIRED.DescriptionEnum':
    ONEOFTHEPARAMETERSREQUIRED.DescriptionEnum,
  'ONLYONEBANKSOURCEALLOWED.IssueEnum': ONLYONEBANKSOURCEALLOWED.IssueEnum,
  'ONLYONEBANKSOURCEALLOWED.DescriptionEnum':
    ONLYONEBANKSOURCEALLOWED.DescriptionEnum,
  'ONLYONEPAYMENTSOURCEALLOWED.IssueEnum':
    ONLYONEPAYMENTSOURCEALLOWED.IssueEnum,
  'ONLYONEPAYMENTSOURCEALLOWED.DescriptionEnum':
    ONLYONEPAYMENTSOURCEALLOWED.DescriptionEnum,
  'ORDERALREADYAUTHORIZED.IssueEnum': ORDERALREADYAUTHORIZED.IssueEnum,
  'ORDERALREADYAUTHORIZED.DescriptionEnum':
    ORDERALREADYAUTHORIZED.DescriptionEnum,
  'ORDERALREADYAUTHORIZED1.IssueEnum': ORDERALREADYAUTHORIZED1.IssueEnum,
  'ORDERALREADYAUTHORIZED1.DescriptionEnum':
    ORDERALREADYAUTHORIZED1.DescriptionEnum,
  'ORDERALREADYCAPTURED.IssueEnum': ORDERALREADYCAPTURED.IssueEnum,
  'ORDERALREADYCAPTURED.DescriptionEnum': ORDERALREADYCAPTURED.DescriptionEnum,
  'ORDERALREADYCAPTURED1.IssueEnum': ORDERALREADYCAPTURED1.IssueEnum,
  'ORDERALREADYCAPTURED1.DescriptionEnum':
    ORDERALREADYCAPTURED1.DescriptionEnum,
  'ORDERALREADYCOMPLETED.IssueEnum': ORDERALREADYCOMPLETED.IssueEnum,
  'ORDERALREADYCOMPLETED.DescriptionEnum':
    ORDERALREADYCOMPLETED.DescriptionEnum,
  'ORDERCANNOTBECONFIRMED.IssueEnum': ORDERCANNOTBECONFIRMED.IssueEnum,
  'ORDERCANNOTBECONFIRMED.DescriptionEnum':
    ORDERCANNOTBECONFIRMED.DescriptionEnum,
  'ORDERCANNOTBESAVED.IssueEnum': ORDERCANNOTBESAVED.IssueEnum,
  'ORDERCANNOTBESAVED.DescriptionEnum': ORDERCANNOTBESAVED.DescriptionEnum,
  'ORDERCOMPLETEDORVOIDED.IssueEnum': ORDERCOMPLETEDORVOIDED.IssueEnum,
  'ORDERCOMPLETEDORVOIDED.DescriptionEnum':
    ORDERCOMPLETEDORVOIDED.DescriptionEnum,
  'ORDERCOMPLETEONPAYMENTAPPROVAL.IssueEnum':
    ORDERCOMPLETEONPAYMENTAPPROVAL.IssueEnum,
  'ORDERCOMPLETEONPAYMENTAPPROVAL.DescriptionEnum':
    ORDERCOMPLETEONPAYMENTAPPROVAL.DescriptionEnum,
  'ORDERCOMPLETEONPAYMENTAPPROVAL1.IssueEnum':
    ORDERCOMPLETEONPAYMENTAPPROVAL1.IssueEnum,
  'ORDERCOMPLETEONPAYMENTAPPROVAL1.DescriptionEnum':
    ORDERCOMPLETEONPAYMENTAPPROVAL1.DescriptionEnum,
  'ORDERCOMPLETIONINPROGRESS.IssueEnum': ORDERCOMPLETIONINPROGRESS.IssueEnum,
  'ORDERCOMPLETIONINPROGRESS.DescriptionEnum':
    ORDERCOMPLETIONINPROGRESS.DescriptionEnum,
  'ORDEREXPIRED.IssueEnum': ORDEREXPIRED.IssueEnum,
  'ORDEREXPIRED.DescriptionEnum': ORDEREXPIRED.DescriptionEnum,
  'ORDERISPENDINGAPPROVAL.IssueEnum': ORDERISPENDINGAPPROVAL.IssueEnum,
  'ORDERISPENDINGAPPROVAL.DescriptionEnum':
    ORDERISPENDINGAPPROVAL.DescriptionEnum,
  'ORDERNOTAPPROVED.IssueEnum': ORDERNOTAPPROVED.IssueEnum,
  'ORDERNOTAPPROVED.DescriptionEnum': ORDERNOTAPPROVED.DescriptionEnum,
  'ORDERNOTAPPROVED1.IssueEnum': ORDERNOTAPPROVED1.IssueEnum,
  'ORDERNOTAPPROVED1.DescriptionEnum': ORDERNOTAPPROVED1.DescriptionEnum,
  'OrderApplicationContext.LandingPageEnum':
    OrderApplicationContext.LandingPageEnum,
  'OrderApplicationContext.ShippingPreferenceEnum':
    OrderApplicationContext.ShippingPreferenceEnum,
  'OrderApplicationContext.UserActionEnum':
    OrderApplicationContext.UserActionEnum,
  OrderStatus: OrderStatus,
  'OrderTrackerRequest.ShipmentDirectionEnum':
    OrderTrackerRequest.ShipmentDirectionEnum,
  'OrderTrackerRequest.ShipmentUploaderEnum':
    OrderTrackerRequest.ShipmentUploaderEnum,
  'OrdersAuthorize400IssuesInner.IssueEnum':
    OrdersAuthorize400IssuesInner.IssueEnum,
  'OrdersAuthorize400IssuesInner.DescriptionEnum':
    OrdersAuthorize400IssuesInner.DescriptionEnum,
  'OrdersAuthorize400Response.NameEnum': OrdersAuthorize400Response.NameEnum,
  'OrdersAuthorize400Response.MessageEnum':
    OrdersAuthorize400Response.MessageEnum,
  'OrdersAuthorize403IssuesInner.IssueEnum':
    OrdersAuthorize403IssuesInner.IssueEnum,
  'OrdersAuthorize403IssuesInner.DescriptionEnum':
    OrdersAuthorize403IssuesInner.DescriptionEnum,
  'OrdersAuthorize403Response.NameEnum': OrdersAuthorize403Response.NameEnum,
  'OrdersAuthorize403Response.MessageEnum':
    OrdersAuthorize403Response.MessageEnum,
  'OrdersAuthorize422IssuesInner.IssueEnum':
    OrdersAuthorize422IssuesInner.IssueEnum,
  'OrdersAuthorize422IssuesInner.DescriptionEnum':
    OrdersAuthorize422IssuesInner.DescriptionEnum,
  'OrdersAuthorize422Response.NameEnum': OrdersAuthorize422Response.NameEnum,
  'OrdersAuthorize422Response.MessageEnum':
    OrdersAuthorize422Response.MessageEnum,
  'OrdersCapture400IssuesInner.IssueEnum':
    OrdersCapture400IssuesInner.IssueEnum,
  'OrdersCapture400IssuesInner.DescriptionEnum':
    OrdersCapture400IssuesInner.DescriptionEnum,
  'OrdersCapture400Response.NameEnum': OrdersCapture400Response.NameEnum,
  'OrdersCapture400Response.MessageEnum': OrdersCapture400Response.MessageEnum,
  'OrdersCapture403IssuesInner.IssueEnum':
    OrdersCapture403IssuesInner.IssueEnum,
  'OrdersCapture403IssuesInner.DescriptionEnum':
    OrdersCapture403IssuesInner.DescriptionEnum,
  'OrdersCapture403Response.NameEnum': OrdersCapture403Response.NameEnum,
  'OrdersCapture403Response.MessageEnum': OrdersCapture403Response.MessageEnum,
  'OrdersCapture422IssuesInner.IssueEnum':
    OrdersCapture422IssuesInner.IssueEnum,
  'OrdersCapture422IssuesInner.DescriptionEnum':
    OrdersCapture422IssuesInner.DescriptionEnum,
  'OrdersCapture422Response.NameEnum': OrdersCapture422Response.NameEnum,
  'OrdersCapture422Response.MessageEnum': OrdersCapture422Response.MessageEnum,
  'OrdersConfirm400IssuesInner.IssueEnum':
    OrdersConfirm400IssuesInner.IssueEnum,
  'OrdersConfirm400IssuesInner.DescriptionEnum':
    OrdersConfirm400IssuesInner.DescriptionEnum,
  'OrdersConfirm400Response.NameEnum': OrdersConfirm400Response.NameEnum,
  'OrdersConfirm400Response.MessageEnum': OrdersConfirm400Response.MessageEnum,
  'OrdersConfirm403Response.NameEnum': OrdersConfirm403Response.NameEnum,
  'OrdersConfirm403Response.MessageEnum': OrdersConfirm403Response.MessageEnum,
  'OrdersConfirm422IssuesInner.IssueEnum':
    OrdersConfirm422IssuesInner.IssueEnum,
  'OrdersConfirm422IssuesInner.DescriptionEnum':
    OrdersConfirm422IssuesInner.DescriptionEnum,
  'OrdersConfirm422Response.NameEnum': OrdersConfirm422Response.NameEnum,
  'OrdersConfirm422Response.MessageEnum': OrdersConfirm422Response.MessageEnum,
  'OrdersCreate400Response.NameEnum': OrdersCreate400Response.NameEnum,
  'OrdersCreate400Response.MessageEnum': OrdersCreate400Response.MessageEnum,
  'OrdersCreate401Response.NameEnum': OrdersCreate401Response.NameEnum,
  'OrdersCreate401Response.MessageEnum': OrdersCreate401Response.MessageEnum,
  'OrdersCreate422Response.NameEnum': OrdersCreate422Response.NameEnum,
  'OrdersCreate422Response.MessageEnum': OrdersCreate422Response.MessageEnum,
  'OrdersGet404Response.NameEnum': OrdersGet404Response.NameEnum,
  'OrdersGet404Response.MessageEnum': OrdersGet404Response.MessageEnum,
  'OrdersPatch400IssuesInner.IssueEnum': OrdersPatch400IssuesInner.IssueEnum,
  'OrdersPatch400IssuesInner.DescriptionEnum':
    OrdersPatch400IssuesInner.DescriptionEnum,
  'OrdersPatch400Response.NameEnum': OrdersPatch400Response.NameEnum,
  'OrdersPatch400Response.MessageEnum': OrdersPatch400Response.MessageEnum,
  'OrdersPatch422IssuesInner.IssueEnum': OrdersPatch422IssuesInner.IssueEnum,
  'OrdersPatch422IssuesInner.DescriptionEnum':
    OrdersPatch422IssuesInner.DescriptionEnum,
  'OrdersPatch422Response.NameEnum': OrdersPatch422Response.NameEnum,
  'OrdersPatch422Response.MessageEnum': OrdersPatch422Response.MessageEnum,
  'OrdersTrackCreate400IssuesInner.IssueEnum':
    OrdersTrackCreate400IssuesInner.IssueEnum,
  'OrdersTrackCreate400IssuesInner.DescriptionEnum':
    OrdersTrackCreate400IssuesInner.DescriptionEnum,
  'OrdersTrackCreate400Response.NameEnum':
    OrdersTrackCreate400Response.NameEnum,
  'OrdersTrackCreate400Response.MessageEnum':
    OrdersTrackCreate400Response.MessageEnum,
  'OrdersTrackCreate403IssuesInner.IssueEnum':
    OrdersTrackCreate403IssuesInner.IssueEnum,
  'OrdersTrackCreate403IssuesInner.DescriptionEnum':
    OrdersTrackCreate403IssuesInner.DescriptionEnum,
  'OrdersTrackCreate403Response.NameEnum':
    OrdersTrackCreate403Response.NameEnum,
  'OrdersTrackCreate403Response.MessageEnum':
    OrdersTrackCreate403Response.MessageEnum,
  'OrdersTrackCreate422IssuesInner.IssueEnum':
    OrdersTrackCreate422IssuesInner.IssueEnum,
  'OrdersTrackCreate422IssuesInner.DescriptionEnum':
    OrdersTrackCreate422IssuesInner.DescriptionEnum,
  'OrdersTrackCreate422Response.NameEnum':
    OrdersTrackCreate422Response.NameEnum,
  'OrdersTrackCreate422Response.MessageEnum':
    OrdersTrackCreate422Response.MessageEnum,
  'OrdersTrackersPatch400IssuesInner.IssueEnum':
    OrdersTrackersPatch400IssuesInner.IssueEnum,
  'OrdersTrackersPatch400IssuesInner.DescriptionEnum':
    OrdersTrackersPatch400IssuesInner.DescriptionEnum,
  'OrdersTrackersPatch400Response.NameEnum':
    OrdersTrackersPatch400Response.NameEnum,
  'OrdersTrackersPatch400Response.MessageEnum':
    OrdersTrackersPatch400Response.MessageEnum,
  'OrdersTrackersPatch403Response.NameEnum':
    OrdersTrackersPatch403Response.NameEnum,
  'OrdersTrackersPatch403Response.MessageEnum':
    OrdersTrackersPatch403Response.MessageEnum,
  'OrdersTrackersPatch404IssuesInner.IssueEnum':
    OrdersTrackersPatch404IssuesInner.IssueEnum,
  'OrdersTrackersPatch404IssuesInner.DescriptionEnum':
    OrdersTrackersPatch404IssuesInner.DescriptionEnum,
  'OrdersTrackersPatch404Response.NameEnum':
    OrdersTrackersPatch404Response.NameEnum,
  'OrdersTrackersPatch404Response.MessageEnum':
    OrdersTrackersPatch404Response.MessageEnum,
  'OrdersTrackersPatch422IssuesInner.IssueEnum':
    OrdersTrackersPatch422IssuesInner.IssueEnum,
  'OrdersTrackersPatch422IssuesInner.DescriptionEnum':
    OrdersTrackersPatch422IssuesInner.DescriptionEnum,
  'OrdersTrackersPatch422Response.NameEnum':
    OrdersTrackersPatch422Response.NameEnum,
  'OrdersTrackersPatch422Response.MessageEnum':
    OrdersTrackersPatch422Response.MessageEnum,
  'PATCHPATHREQUIRED.IssueEnum': PATCHPATHREQUIRED.IssueEnum,
  'PATCHPATHREQUIRED.DescriptionEnum': PATCHPATHREQUIRED.DescriptionEnum,
  'PATCHPATHREQUIRED1.IssueEnum': PATCHPATHREQUIRED1.IssueEnum,
  'PATCHPATHREQUIRED1.DescriptionEnum': PATCHPATHREQUIRED1.DescriptionEnum,
  'PATCHVALUEREQUIRED.IssueEnum': PATCHVALUEREQUIRED.IssueEnum,
  'PATCHVALUEREQUIRED.DescriptionEnum': PATCHVALUEREQUIRED.DescriptionEnum,
  'PATCHVALUEREQUIRED1.IssueEnum': PATCHVALUEREQUIRED1.IssueEnum,
  'PATCHVALUEREQUIRED1.DescriptionEnum': PATCHVALUEREQUIRED1.DescriptionEnum,
  'PAYEEACCOUNTINVALID.IssueEnum': PAYEEACCOUNTINVALID.IssueEnum,
  'PAYEEACCOUNTINVALID.DescriptionEnum': PAYEEACCOUNTINVALID.DescriptionEnum,
  'PAYEEACCOUNTLOCKEDORCLOSED.IssueEnum': PAYEEACCOUNTLOCKEDORCLOSED.IssueEnum,
  'PAYEEACCOUNTLOCKEDORCLOSED.DescriptionEnum':
    PAYEEACCOUNTLOCKEDORCLOSED.DescriptionEnum,
  'PAYEEACCOUNTNOTVERIFIED.IssueEnum': PAYEEACCOUNTNOTVERIFIED.IssueEnum,
  'PAYEEACCOUNTNOTVERIFIED.DescriptionEnum':
    PAYEEACCOUNTNOTVERIFIED.DescriptionEnum,
  'PAYEEACCOUNTRESTRICTED.IssueEnum': PAYEEACCOUNTRESTRICTED.IssueEnum,
  'PAYEEACCOUNTRESTRICTED.DescriptionEnum':
    PAYEEACCOUNTRESTRICTED.DescriptionEnum,
  'PAYEEBLOCKEDTRANSACTION.IssueEnum': PAYEEBLOCKEDTRANSACTION.IssueEnum,
  'PAYEEBLOCKEDTRANSACTION.DescriptionEnum':
    PAYEEBLOCKEDTRANSACTION.DescriptionEnum,
  'PAYEECOUNTRYNOTSUPPORTEDFORPAYMENTSOURCE.IssueEnum':
    PAYEECOUNTRYNOTSUPPORTEDFORPAYMENTSOURCE.IssueEnum,
  'PAYEECOUNTRYNOTSUPPORTEDFORPAYMENTSOURCE.DescriptionEnum':
    PAYEECOUNTRYNOTSUPPORTEDFORPAYMENTSOURCE.DescriptionEnum,
  'PAYEEFXRATEIDCURRENCYMISMATCH.IssueEnum':
    PAYEEFXRATEIDCURRENCYMISMATCH.IssueEnum,
  'PAYEEFXRATEIDCURRENCYMISMATCH.DescriptionEnum':
    PAYEEFXRATEIDCURRENCYMISMATCH.DescriptionEnum,
  'PAYEEFXRATEIDEXPIRED.IssueEnum': PAYEEFXRATEIDEXPIRED.IssueEnum,
  'PAYEEFXRATEIDEXPIRED.DescriptionEnum': PAYEEFXRATEIDEXPIRED.DescriptionEnum,
  'PAYEENOTENABLEDFORBANKPROCESSING.IssueEnum':
    PAYEENOTENABLEDFORBANKPROCESSING.IssueEnum,
  'PAYEENOTENABLEDFORBANKPROCESSING.DescriptionEnum':
    PAYEENOTENABLEDFORBANKPROCESSING.DescriptionEnum,
  'PAYEENOTENABLEDFORCARDPROCESSING.IssueEnum':
    PAYEENOTENABLEDFORCARDPROCESSING.IssueEnum,
  'PAYEENOTENABLEDFORCARDPROCESSING.DescriptionEnum':
    PAYEENOTENABLEDFORCARDPROCESSING.DescriptionEnum,
  'PAYEEPRICINGTIERIDNOTENABLED.IssueEnum':
    PAYEEPRICINGTIERIDNOTENABLED.IssueEnum,
  'PAYEEPRICINGTIERIDNOTENABLED.DescriptionEnum':
    PAYEEPRICINGTIERIDNOTENABLED.DescriptionEnum,
  'PAYERACCOUNTLOCKEDORCLOSED.IssueEnum': PAYERACCOUNTLOCKEDORCLOSED.IssueEnum,
  'PAYERACCOUNTLOCKEDORCLOSED.DescriptionEnum':
    PAYERACCOUNTLOCKEDORCLOSED.DescriptionEnum,
  'PAYERACCOUNTRESTRICTED.IssueEnum': PAYERACCOUNTRESTRICTED.IssueEnum,
  'PAYERACCOUNTRESTRICTED.DescriptionEnum':
    PAYERACCOUNTRESTRICTED.DescriptionEnum,
  'PAYERACTIONREQUIRED.IssueEnum': PAYERACTIONREQUIRED.IssueEnum,
  'PAYERACTIONREQUIRED.DescriptionEnum': PAYERACTIONREQUIRED.DescriptionEnum,
  'PAYERCANNOTPAY.IssueEnum': PAYERCANNOTPAY.IssueEnum,
  'PAYERCANNOTPAY.DescriptionEnum': PAYERCANNOTPAY.DescriptionEnum,
  'PAYERCANNOTPAY1.IssueEnum': PAYERCANNOTPAY1.IssueEnum,
  'PAYERCANNOTPAY1.DescriptionEnum': PAYERCANNOTPAY1.DescriptionEnum,
  'PAYMENTALREADYAPPROVED.IssueEnum': PAYMENTALREADYAPPROVED.IssueEnum,
  'PAYMENTALREADYAPPROVED.DescriptionEnum':
    PAYMENTALREADYAPPROVED.DescriptionEnum,
  'PAYMENTSOURCECANNOTBEUSED.IssueEnum': PAYMENTSOURCECANNOTBEUSED.IssueEnum,
  'PAYMENTSOURCECANNOTBEUSED.DescriptionEnum':
    PAYMENTSOURCECANNOTBEUSED.DescriptionEnum,
  'PAYMENTSOURCEDECLINEDBYPROCESSOR.IssueEnum':
    PAYMENTSOURCEDECLINEDBYPROCESSOR.IssueEnum,
  'PAYMENTSOURCEDECLINEDBYPROCESSOR.DescriptionEnum':
    PAYMENTSOURCEDECLINEDBYPROCESSOR.DescriptionEnum,
  'PAYMENTSOURCEINFOCANNOTBEVERIFIED.IssueEnum':
    PAYMENTSOURCEINFOCANNOTBEVERIFIED.IssueEnum,
  'PAYMENTSOURCEINFOCANNOTBEVERIFIED.DescriptionEnum':
    PAYMENTSOURCEINFOCANNOTBEVERIFIED.DescriptionEnum,
  'PAYMENTSOURCEMISMATCH.IssueEnum': PAYMENTSOURCEMISMATCH.IssueEnum,
  'PAYMENTSOURCEMISMATCH.DescriptionEnum':
    PAYMENTSOURCEMISMATCH.DescriptionEnum,
  'PAYMENTSOURCENOTSUPPORTED.IssueEnum': PAYMENTSOURCENOTSUPPORTED.IssueEnum,
  'PAYMENTSOURCENOTSUPPORTED.DescriptionEnum':
    PAYMENTSOURCENOTSUPPORTED.DescriptionEnum,
  'PAYMENTTYPENOTSUPPORTEDFORINTENT.IssueEnum':
    PAYMENTTYPENOTSUPPORTEDFORINTENT.IssueEnum,
  'PAYMENTTYPENOTSUPPORTEDFORINTENT.DescriptionEnum':
    PAYMENTTYPENOTSUPPORTEDFORINTENT.DescriptionEnum,
  'PAYPALREQUESTIDREQUIRED.IssueEnum': PAYPALREQUESTIDREQUIRED.IssueEnum,
  'PAYPALREQUESTIDREQUIRED.DescriptionEnum':
    PAYPALREQUESTIDREQUIRED.DescriptionEnum,
  'PAYPALTRANSACTIONIDEXPIRED.IssueEnum': PAYPALTRANSACTIONIDEXPIRED.IssueEnum,
  'PAYPALTRANSACTIONIDEXPIRED.DescriptionEnum':
    PAYPALTRANSACTIONIDEXPIRED.DescriptionEnum,
  'PAYPALTRANSACTIONIDNOTFOUND.IssueEnum':
    PAYPALTRANSACTIONIDNOTFOUND.IssueEnum,
  'PAYPALTRANSACTIONIDNOTFOUND.DescriptionEnum':
    PAYPALTRANSACTIONIDNOTFOUND.DescriptionEnum,
  'PERMISSIONDENIED.IssueEnum': PERMISSIONDENIED.IssueEnum,
  'PERMISSIONDENIED.DescriptionEnum': PERMISSIONDENIED.DescriptionEnum,
  'PERMISSIONDENIEDFORDONATIONITEMS.IssueEnum':
    PERMISSIONDENIEDFORDONATIONITEMS.IssueEnum,
  'PERMISSIONDENIEDFORDONATIONITEMS.DescriptionEnum':
    PERMISSIONDENIEDFORDONATIONITEMS.DescriptionEnum,
  'PLATFORMFEEPAYEECANNOTBESAMEASPAYER.IssueEnum':
    PLATFORMFEEPAYEECANNOTBESAMEASPAYER.IssueEnum,
  'PLATFORMFEEPAYEECANNOTBESAMEASPAYER.DescriptionEnum':
    PLATFORMFEEPAYEECANNOTBESAMEASPAYER.DescriptionEnum,
  'PLATFORMFEESNOTSUPPORTED.IssueEnum': PLATFORMFEESNOTSUPPORTED.IssueEnum,
  'PLATFORMFEESNOTSUPPORTED.DescriptionEnum':
    PLATFORMFEESNOTSUPPORTED.DescriptionEnum,
  'PNREFEXPIRED.IssueEnum': PNREFEXPIRED.IssueEnum,
  'PNREFEXPIRED.DescriptionEnum': PNREFEXPIRED.DescriptionEnum,
  'PNREFNOTFOUND.IssueEnum': PNREFNOTFOUND.IssueEnum,
  'PNREFNOTFOUND.DescriptionEnum': PNREFNOTFOUND.DescriptionEnum,
  'POSTALCODEREQUIRED.IssueEnum': POSTALCODEREQUIRED.IssueEnum,
  'POSTALCODEREQUIRED.DescriptionEnum': POSTALCODEREQUIRED.DescriptionEnum,
  'PREFERREDPAYMENTSOURCEMISMATCH.IssueEnum':
    PREFERREDPAYMENTSOURCEMISMATCH.IssueEnum,
  'PREFERREDPAYMENTSOURCEMISMATCH.DescriptionEnum':
    PREFERREDPAYMENTSOURCEMISMATCH.DescriptionEnum,
  'PREFERREDSHIPPINGOPTIONAMOUNTMISMATCH.IssueEnum':
    PREFERREDSHIPPINGOPTIONAMOUNTMISMATCH.IssueEnum,
  'PREFERREDSHIPPINGOPTIONAMOUNTMISMATCH.DescriptionEnum':
    PREFERREDSHIPPINGOPTIONAMOUNTMISMATCH.DescriptionEnum,
  'PREVIOUSTRANSACTIONREFERENCEHASCHARGEBACK.IssueEnum':
    PREVIOUSTRANSACTIONREFERENCEHASCHARGEBACK.IssueEnum,
  'PREVIOUSTRANSACTIONREFERENCEHASCHARGEBACK.DescriptionEnum':
    PREVIOUSTRANSACTIONREFERENCEHASCHARGEBACK.DescriptionEnum,
  'PREVIOUSTRANSACTIONREFERENCEVOIDED.IssueEnum':
    PREVIOUSTRANSACTIONREFERENCEVOIDED.IssueEnum,
  'PREVIOUSTRANSACTIONREFERENCEVOIDED.DescriptionEnum':
    PREVIOUSTRANSACTIONREFERENCEVOIDED.DescriptionEnum,
  ParesStatus: ParesStatus,
  'Patch.OpEnum': Patch.OpEnum,
  PayeePaymentMethodPreference: PayeePaymentMethodPreference,
  PaymentInitiator: PaymentInitiator,
  'PaymentMethod.StandardEntryClassCodeEnum':
    PaymentMethod.StandardEntryClassCodeEnum,
  'PaypalWalletExperienceContext.ShippingPreferenceEnum':
    PaypalWalletExperienceContext.ShippingPreferenceEnum,
  'PaypalWalletExperienceContext.LandingPageEnum':
    PaypalWalletExperienceContext.LandingPageEnum,
  'PaypalWalletExperienceContext.UserActionEnum':
    PaypalWalletExperienceContext.UserActionEnum,
  'PaypalWalletExperienceContext.PaymentMethodPreferenceEnum':
    PaypalWalletExperienceContext.PaymentMethodPreferenceEnum,
  PhoneType: PhoneType,
  PhoneType2: PhoneType2,
  ProcessingInstruction: ProcessingInstruction,
  'ProcessorResponse.AvsCodeEnum': ProcessorResponse.AvsCodeEnum,
  'ProcessorResponse.CvvCodeEnum': ProcessorResponse.CvvCodeEnum,
  'ProcessorResponse.ResponseCodeEnum': ProcessorResponse.ResponseCodeEnum,
  'ProcessorResponse.PaymentAdviceCodeEnum':
    ProcessorResponse.PaymentAdviceCodeEnum,
  'REDIRECTPAYERFORALTERNATEFUNDING.IssueEnum':
    REDIRECTPAYERFORALTERNATEFUNDING.IssueEnum,
  'REDIRECTPAYERFORALTERNATEFUNDING.DescriptionEnum':
    REDIRECTPAYERFORALTERNATEFUNDING.DescriptionEnum,
  'REFERENCEDCARDEXPIRED.IssueEnum': REFERENCEDCARDEXPIRED.IssueEnum,
  'REFERENCEDCARDEXPIRED.DescriptionEnum':
    REFERENCEDCARDEXPIRED.DescriptionEnum,
  'REFERENCEIDNOTFOUND.IssueEnum': REFERENCEIDNOTFOUND.IssueEnum,
  'REFERENCEIDNOTFOUND.DescriptionEnum': REFERENCEIDNOTFOUND.DescriptionEnum,
  'REFERENCEIDREQUIRED.IssueEnum': REFERENCEIDREQUIRED.IssueEnum,
  'REFERENCEIDREQUIRED.DescriptionEnum': REFERENCEIDREQUIRED.DescriptionEnum,
  'REQUIREDPARAMETERFORCUSTOMERINITIATEDPAYMENT.IssueEnum':
    REQUIREDPARAMETERFORCUSTOMERINITIATEDPAYMENT.IssueEnum,
  'REQUIREDPARAMETERFORCUSTOMERINITIATEDPAYMENT.DescriptionEnum':
    REQUIREDPARAMETERFORCUSTOMERINITIATEDPAYMENT.DescriptionEnum,
  'REQUIREDPARAMETERFORPAYMENTSOURCE.IssueEnum':
    REQUIREDPARAMETERFORPAYMENTSOURCE.IssueEnum,
  'REQUIREDPARAMETERFORPAYMENTSOURCE.DescriptionEnum':
    REQUIREDPARAMETERFORPAYMENTSOURCE.DescriptionEnum,
  'RETURNURLREQUIRED.IssueEnum': RETURNURLREQUIRED.IssueEnum,
  'RETURNURLREQUIRED.DescriptionEnum': RETURNURLREQUIRED.DescriptionEnum,
  'Refund.StatusEnum': Refund.StatusEnum,
  'RefundStatus.StatusEnum': RefundStatus.StatusEnum,
  'RefundStatusDetails.ReasonEnum': RefundStatusDetails.ReasonEnum,
  'SAVEORDERNOTSUPPORTED.IssueEnum': SAVEORDERNOTSUPPORTED.IssueEnum,
  'SAVEORDERNOTSUPPORTED.DescriptionEnum':
    SAVEORDERNOTSUPPORTED.DescriptionEnum,
  'SETUPERRORFORBANK.IssueEnum': SETUPERRORFORBANK.IssueEnum,
  'SETUPERRORFORBANK.DescriptionEnum': SETUPERRORFORBANK.DescriptionEnum,
  'SHIPPINGADDRESSINVALID.IssueEnum': SHIPPINGADDRESSINVALID.IssueEnum,
  'SHIPPINGADDRESSINVALID.DescriptionEnum':
    SHIPPINGADDRESSINVALID.DescriptionEnum,
  'SHIPPINGOPTIONNOTSELECTED.IssueEnum': SHIPPINGOPTIONNOTSELECTED.IssueEnum,
  'SHIPPINGOPTIONNOTSELECTED.DescriptionEnum':
    SHIPPINGOPTIONNOTSELECTED.DescriptionEnum,
  'SHIPPINGOPTIONSNOTSUPPORTED.IssueEnum':
    SHIPPINGOPTIONSNOTSUPPORTED.IssueEnum,
  'SHIPPINGOPTIONSNOTSUPPORTED.DescriptionEnum':
    SHIPPINGOPTIONSNOTSUPPORTED.DescriptionEnum,
  'SHIPPINGOPTIONSNOTSUPPORTED1.IssueEnum':
    SHIPPINGOPTIONSNOTSUPPORTED1.IssueEnum,
  'SHIPPINGOPTIONSNOTSUPPORTED1.DescriptionEnum':
    SHIPPINGOPTIONSNOTSUPPORTED1.DescriptionEnum,
  'SHIPPINGTYPENOTSUPPORTEDFORCLIENT.IssueEnum':
    SHIPPINGTYPENOTSUPPORTEDFORCLIENT.IssueEnum,
  'SHIPPINGTYPENOTSUPPORTEDFORCLIENT.DescriptionEnum':
    SHIPPINGTYPENOTSUPPORTEDFORCLIENT.DescriptionEnum,
  'SellerProtection.StatusEnum': SellerProtection.StatusEnum,
  'SellerProtection.DisputeCategoriesEnum':
    SellerProtection.DisputeCategoriesEnum,
  ShipmentCarrier: ShipmentCarrier,
  'ShipmentTracker.ShipmentDirectionEnum':
    ShipmentTracker.ShipmentDirectionEnum,
  'ShipmentTracker.ShipmentUploaderEnum': ShipmentTracker.ShipmentUploaderEnum,
  ShipmentTrackingNumberType: ShipmentTrackingNumberType,
  ShipmentTrackingStatus: ShipmentTrackingStatus,
  'ShippingDetail.TypeEnum': ShippingDetail.TypeEnum,
  'ShippingWithTrackingDetails.TypeEnum': ShippingWithTrackingDetails.TypeEnum,
  StoreInVaultInstruction: StoreInVaultInstruction,
  StoredPaymentSourcePaymentType: StoredPaymentSourcePaymentType,
  StoredPaymentSourceUsageType: StoredPaymentSourceUsageType,
  'TAXTOTALMISMATCH.IssueEnum': TAXTOTALMISMATCH.IssueEnum,
  'TAXTOTALMISMATCH.DescriptionEnum': TAXTOTALMISMATCH.DescriptionEnum,
  'TAXTOTALREQUIRED.IssueEnum': TAXTOTALREQUIRED.IssueEnum,
  'TAXTOTALREQUIRED.DescriptionEnum': TAXTOTALREQUIRED.DescriptionEnum,
  'TOKENEXPIRED.IssueEnum': TOKENEXPIRED.IssueEnum,
  'TOKENEXPIRED.DescriptionEnum': TOKENEXPIRED.DescriptionEnum,
  'TOKENIDNOTFOUND.IssueEnum': TOKENIDNOTFOUND.IssueEnum,
  'TOKENIDNOTFOUND.DescriptionEnum': TOKENIDNOTFOUND.DescriptionEnum,
  'TRACKERIDNOTFOUND.IssueEnum': TRACKERIDNOTFOUND.IssueEnum,
  'TRACKERIDNOTFOUND.DescriptionEnum': TRACKERIDNOTFOUND.DescriptionEnum,
  'TRANSACTIONBLOCKEDBYPAYEE.IssueEnum': TRANSACTIONBLOCKEDBYPAYEE.IssueEnum,
  'TRANSACTIONBLOCKEDBYPAYEE.DescriptionEnum':
    TRANSACTIONBLOCKEDBYPAYEE.DescriptionEnum,
  'TRANSACTIONLIMITEXCEEDED.IssueEnum': TRANSACTIONLIMITEXCEEDED.IssueEnum,
  'TRANSACTIONLIMITEXCEEDED.DescriptionEnum':
    TRANSACTIONLIMITEXCEEDED.DescriptionEnum,
  'TRANSACTIONRECEIVINGLIMITEXCEEDED.IssueEnum':
    TRANSACTIONRECEIVINGLIMITEXCEEDED.IssueEnum,
  'TRANSACTIONRECEIVINGLIMITEXCEEDED.DescriptionEnum':
    TRANSACTIONRECEIVINGLIMITEXCEEDED.DescriptionEnum,
  'TRANSACTIONREFUSED.IssueEnum': TRANSACTIONREFUSED.IssueEnum,
  'TRANSACTIONREFUSED.DescriptionEnum': TRANSACTIONREFUSED.DescriptionEnum,
  'TaxInfo.TaxIdTypeEnum': TaxInfo.TaxIdTypeEnum,
  'Token.TypeEnum': Token.TypeEnum,
  'UNSUPPORTEDINTENT.IssueEnum': UNSUPPORTEDINTENT.IssueEnum,
  'UNSUPPORTEDINTENT.DescriptionEnum': UNSUPPORTEDINTENT.DescriptionEnum,
  'UNSUPPORTEDINTENTFORPAYMENTSOURCE.IssueEnum':
    UNSUPPORTEDINTENTFORPAYMENTSOURCE.IssueEnum,
  'UNSUPPORTEDINTENTFORPAYMENTSOURCE.DescriptionEnum':
    UNSUPPORTEDINTENTFORPAYMENTSOURCE.DescriptionEnum,
  'UNSUPPORTEDPATCHPARAMETERVALUE.IssueEnum':
    UNSUPPORTEDPATCHPARAMETERVALUE.IssueEnum,
  'UNSUPPORTEDPATCHPARAMETERVALUE.DescriptionEnum':
    UNSUPPORTEDPATCHPARAMETERVALUE.DescriptionEnum,
  'UNSUPPORTEDPAYMENTINSTRUCTION.IssueEnum':
    UNSUPPORTEDPAYMENTINSTRUCTION.IssueEnum,
  'UNSUPPORTEDPAYMENTINSTRUCTION.DescriptionEnum':
    UNSUPPORTEDPAYMENTINSTRUCTION.DescriptionEnum,
  'UNSUPPORTEDPROCESSINGINSTRUCTION.IssueEnum':
    UNSUPPORTEDPROCESSINGINSTRUCTION.IssueEnum,
  'UNSUPPORTEDPROCESSINGINSTRUCTION.DescriptionEnum':
    UNSUPPORTEDPROCESSINGINSTRUCTION.DescriptionEnum,
  'UNSUPPORTEDSHIPPINGTYPE.IssueEnum': UNSUPPORTEDSHIPPINGTYPE.IssueEnum,
  'UNSUPPORTEDSHIPPINGTYPE.DescriptionEnum':
    UNSUPPORTEDSHIPPINGTYPE.DescriptionEnum,
  'VAULTINSTRUCTIONDUPLICATED.IssueEnum': VAULTINSTRUCTIONDUPLICATED.IssueEnum,
  'VAULTINSTRUCTIONDUPLICATED.DescriptionEnum':
    VAULTINSTRUCTIONDUPLICATED.DescriptionEnum,
  'VAULTINSTRUCTIONREQUIRED.IssueEnum': VAULTINSTRUCTIONREQUIRED.IssueEnum,
  'VAULTINSTRUCTIONREQUIRED.DescriptionEnum':
    VAULTINSTRUCTIONREQUIRED.DescriptionEnum,
  'VaultPaypalWalletBase.UsagePatternEnum':
    VaultPaypalWalletBase.UsagePatternEnum,
  'VaultPaypalWalletBase.UsageTypeEnum': VaultPaypalWalletBase.UsageTypeEnum,
  'VaultPaypalWalletBase.CustomerTypeEnum':
    VaultPaypalWalletBase.CustomerTypeEnum,
  'VaultPaypalWalletBaseAllOf.UsagePatternEnum':
    VaultPaypalWalletBaseAllOf.UsagePatternEnum,
  'VaultPaypalWalletBaseAllOf.UsageTypeEnum':
    VaultPaypalWalletBaseAllOf.UsageTypeEnum,
  'VaultPaypalWalletBaseAllOf.CustomerTypeEnum':
    VaultPaypalWalletBaseAllOf.CustomerTypeEnum,
  'VaultResponse.StatusEnum': VaultResponse.StatusEnum,
  'VaultVenmoWalletBase.UsagePatternEnum':
    VaultVenmoWalletBase.UsagePatternEnum,
  'VaultVenmoWalletBase.UsageTypeEnum': VaultVenmoWalletBase.UsageTypeEnum,
  'VaultVenmoWalletBase.CustomerTypeEnum':
    VaultVenmoWalletBase.CustomerTypeEnum,
  'VaultVenmoWalletBaseAllOf.UsagePatternEnum':
    VaultVenmoWalletBaseAllOf.UsagePatternEnum,
  'VaultVenmoWalletBaseAllOf.UsageTypeEnum':
    VaultVenmoWalletBaseAllOf.UsageTypeEnum,
  'VaultVenmoWalletBaseAllOf.CustomerTypeEnum':
    VaultVenmoWalletBaseAllOf.CustomerTypeEnum,
  'VenmoWalletExperienceContext.ShippingPreferenceEnum':
    VenmoWalletExperienceContext.ShippingPreferenceEnum,
};

let typeMap: { [index: string]: any } = {
  ACTIONDOESNOTMATCHINTENT: ACTIONDOESNOTMATCHINTENT,
  AGREEMENTALREADYCANCELLED: AGREEMENTALREADYCANCELLED,
  AMOUNTCANNOTBESPECIFIED: AMOUNTCANNOTBESPECIFIED,
  AMOUNTCHANGENOTALLOWED: AMOUNTCHANGENOTALLOWED,
  AMOUNTMISMATCH: AMOUNTMISMATCH,
  AMOUNTNOTPATCHABLE: AMOUNTNOTPATCHABLE,
  APPLEPAYAMOUNTMISMATCH: APPLEPAYAMOUNTMISMATCH,
  AUTHCAPTURENOTENABLED: AUTHCAPTURENOTENABLED,
  AUTHORIZATIONAMOUNTEXCEEDED: AUTHORIZATIONAMOUNTEXCEEDED,
  AUTHORIZATIONCURRENCYMISMATCH: AUTHORIZATIONCURRENCYMISMATCH,
  ActivityTimestamps: ActivityTimestamps,
  AddressDetails: AddressDetails,
  AddressDetails1: AddressDetails1,
  AddressPortable: AddressPortable,
  AddressPortable2: AddressPortable2,
  AmountBreakdown: AmountBreakdown,
  AmountWithBreakdown: AmountWithBreakdown,
  AmountWithBreakdownAllOf: AmountWithBreakdownAllOf,
  ApplePayDecryptedTokenData: ApplePayDecryptedTokenData,
  ApplePayPaymentData: ApplePayPaymentData,
  ApplePayRequest: ApplePayRequest,
  AuthenticationResponse: AuthenticationResponse,
  Authorization: Authorization,
  AuthorizationAllOf: AuthorizationAllOf,
  AuthorizationStatus: AuthorizationStatus,
  AuthorizationStatusDetails: AuthorizationStatusDetails,
  AuthorizationWithAdditionalData: AuthorizationWithAdditionalData,
  AuthorizationWithAdditionalDataAllOf: AuthorizationWithAdditionalDataAllOf,
  BANKNOTSUPPORTEDFORVERIFICATION: BANKNOTSUPPORTEDFORVERIFICATION,
  BILLINGADDRESSINVALID: BILLINGADDRESSINVALID,
  BILLINGAGREEMENTIDMISMATCH: BILLINGAGREEMENTIDMISMATCH,
  BILLINGAGREEMENTNOTFOUND: BILLINGAGREEMENTNOTFOUND,
  Bancontact: Bancontact,
  BancontactRequest: BancontactRequest,
  BinDetails: BinDetails,
  Blik: Blik,
  BlikRequest: BlikRequest,
  CANCELURLREQUIRED: CANCELURLREQUIRED,
  CANNOTBENEGATIVE: CANNOTBENEGATIVE,
  CANNOTBEZEROORNEGATIVE: CANNOTBEZEROORNEGATIVE,
  CAPTUREIDNOTFOUND: CAPTUREIDNOTFOUND,
  CAPTURESTATUSNOTVALID: CAPTURESTATUSNOTVALID,
  CARDBRANDNOTSUPPORTED: CARDBRANDNOTSUPPORTED,
  CARDEXPIRED: CARDEXPIRED,
  CARDEXPIRYREQUIRED: CARDEXPIRYREQUIRED,
  CARDNUMBERREQUIRED: CARDNUMBERREQUIRED,
  CARDTYPENOTSUPPORTED: CARDTYPENOTSUPPORTED,
  CITYREQUIRED: CITYREQUIRED,
  COMPLIANCEVIOLATION: COMPLIANCEVIOLATION,
  CONSENTNEEDED: CONSENTNEEDED,
  COUNTRYNOTSUPPORTEDBYPAYMENTSOURCE: COUNTRYNOTSUPPORTEDBYPAYMENTSOURCE,
  CRYPTOGRAMREQUIRED: CRYPTOGRAMREQUIRED,
  CURRENCYNOTSUPPORTEDFORBANK: CURRENCYNOTSUPPORTEDFORBANK,
  CURRENCYNOTSUPPORTEDFORCARDTYPE: CURRENCYNOTSUPPORTEDFORCARDTYPE,
  CURRENCYNOTSUPPORTEDFORCOUNTRY: CURRENCYNOTSUPPORTEDFORCOUNTRY,
  Capture: Capture,
  CaptureAllOf: CaptureAllOf,
  CaptureStatus: CaptureStatus,
  CaptureStatusDetails: CaptureStatusDetails,
  Card: Card,
  CardAttributes: CardAttributes,
  CardAttributesResponse: CardAttributesResponse,
  CardFromRequest: CardFromRequest,
  CardRequest: CardRequest,
  CardRequestAllOf: CardRequestAllOf,
  CardResponse: CardResponse,
  CardStoredCredential: CardStoredCredential,
  CardSupplementaryData: CardSupplementaryData,
  CobrandedCard: CobrandedCard,
  ConfirmOrderRequest: ConfirmOrderRequest,
  Customer: Customer,
  DECIMALPRECISION: DECIMALPRECISION,
  DECLINEDDUETORELATEDTXN: DECLINEDDUETORELATEDTXN,
  DEVICEDATANOTAVAILABLE: DEVICEDATANOTAVAILABLE,
  DOMESTICTRANSACTIONREQUIRED: DOMESTICTRANSACTIONREQUIRED,
  DONATIONITEMSNOTSUPPORTED: DONATIONITEMSNOTSUPPORTED,
  DUPLICATEINVOICEID: DUPLICATEINVOICEID,
  DUPLICATEREFERENCEID: DUPLICATEREFERENCEID,
  EMVDATAREQUIRED: EMVDATAREQUIRED,
  Eps: Eps,
  EpsRequest: EpsRequest,
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
  ExperienceContextBase: ExperienceContextBase,
  FIELDNOTPATCHABLE: FIELDNOTPATCHABLE,
  GOOGLEPAYGATEWAYMERCHANTIDMISMATCH: GOOGLEPAYGATEWAYMERCHANTIDMISMATCH,
  Giropay: Giropay,
  GiropayRequest: GiropayRequest,
  IBANCOUNTRYNOTSUPPORTED: IBANCOUNTRYNOTSUPPORTED,
  IDENTIFIERNOTFOUND: IDENTIFIERNOTFOUND,
  INCOMPATIBLEPARAMETERVALUE: INCOMPATIBLEPARAMETERVALUE,
  INSTRUMENTDECLINED: INSTRUMENTDECLINED,
  INVALIDACCOUNTSTATUS: INVALIDACCOUNTSTATUS,
  INVALIDARRAYMAXITEMS: INVALIDARRAYMAXITEMS,
  INVALIDARRAYMINITEMS: INVALIDARRAYMINITEMS,
  INVALIDCOUNTRYCODE: INVALIDCOUNTRYCODE,
  INVALIDCURRENCYCODE: INVALIDCURRENCYCODE,
  INVALIDEXPIRYDATE: INVALIDEXPIRYDATE,
  INVALIDFXRATEID: INVALIDFXRATEID,
  INVALIDGOOGLEPAYTOKEN: INVALIDGOOGLEPAYTOKEN,
  INVALIDIBAN: INVALIDIBAN,
  INVALIDJSONPOINTERFORMAT: INVALIDJSONPOINTERFORMAT,
  INVALIDJSONPOINTERFORMAT1: INVALIDJSONPOINTERFORMAT1,
  INVALIDPARAMETER: INVALIDPARAMETER,
  INVALIDPARAMETERSYNTAX: INVALIDPARAMETERSYNTAX,
  INVALIDPARAMETERSYNTAX1: INVALIDPARAMETERSYNTAX1,
  INVALIDPARAMETERVALUE: INVALIDPARAMETERVALUE,
  INVALIDPARAMETERVALUE1: INVALIDPARAMETERVALUE1,
  INVALIDPATCHOPERATION: INVALIDPATCHOPERATION,
  INVALIDPAYEEPRICINGTIERID: INVALIDPAYEEPRICINGTIERID,
  INVALIDPAYERID: INVALIDPAYERID,
  INVALIDPICKUPADDRESS: INVALIDPICKUPADDRESS,
  INVALIDPLATFORMFEESACCOUNT: INVALIDPLATFORMFEESACCOUNT,
  INVALIDPLATFORMFEESAMOUNT: INVALIDPLATFORMFEESAMOUNT,
  INVALIDPREVIOUSTRANSACTIONREFERENCE: INVALIDPREVIOUSTRANSACTIONREFERENCE,
  INVALIDRESOURCEID: INVALIDRESOURCEID,
  INVALIDSECURITYCODELENGTH: INVALIDSECURITYCODELENGTH,
  INVALIDSTRINGLENGTH: INVALIDSTRINGLENGTH,
  INVALIDSTRINGLENGTH1: INVALIDSTRINGLENGTH1,
  INVALIDSTRINGMAXLENGTH: INVALIDSTRINGMAXLENGTH,
  ITEMCATEGORYNOTSUPPORTEDBYPAYMENTSOURCE:
    ITEMCATEGORYNOTSUPPORTEDBYPAYMENTSOURCE,
  ITEMSKUMISMATCH: ITEMSKUMISMATCH,
  ITEMTOTALMISMATCH: ITEMTOTALMISMATCH,
  ITEMTOTALREQUIRED: ITEMTOTALREQUIRED,
  Ideal: Ideal,
  IdealRequest: IdealRequest,
  Item: Item,
  Level2CardProcessingData: Level2CardProcessingData,
  Level3CardProcessingData: Level3CardProcessingData,
  LineItem: LineItem,
  LineItemAllOf: LineItemAllOf,
  LinkDescription: LinkDescription,
  MALFORMEDREQUESTJSON: MALFORMEDREQUESTJSON,
  MAXAUTHORIZATIONCOUNTEXCEEDED: MAXAUTHORIZATIONCOUNTEXCEEDED,
  MAXNUMBEROFPAYMENTATTEMPTSEXCEEDED: MAXNUMBEROFPAYMENTATTEMPTSEXCEEDED,
  MAXVALUEEXCEEDED: MAXVALUEEXCEEDED,
  MERCHANTINITIATEDWITHAUTHENTICATIONRESULTS:
    MERCHANTINITIATEDWITHAUTHENTICATIONRESULTS,
  MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS:
    MERCHANTINITIATEDWITHMULTIPLEPURCHASEUNITS,
  MERCHANTINITIATEDWITHSECURITYCODE: MERCHANTINITIATEDWITHSECURITYCODE,
  MISMATCHEDVAULTIDTOPAYMENTSOURCE: MISMATCHEDVAULTIDTOPAYMENTSOURCE,
  MISSINGCRYPTOGRAM: MISSINGCRYPTOGRAM,
  MISSINGPICKUPADDRESS: MISSINGPICKUPADDRESS,
  MISSINGPREVIOUSREFERENCE: MISSINGPREVIOUSREFERENCE,
  MISSINGREQUIREDPARAMETER: MISSINGREQUIREDPARAMETER,
  MISSINGREQUIREDPARAMETER1: MISSINGREQUIREDPARAMETER1,
  MISSINGREQUIREDPARAMETER2: MISSINGREQUIREDPARAMETER2,
  MISSINGREQUIREDPARAMETER3: MISSINGREQUIREDPARAMETER3,
  MSPNOTSUPPORTED: MSPNOTSUPPORTED,
  MULTICURRENCYORDER: MULTICURRENCYORDER,
  MULTIPLEITEMCATEGORIES: MULTIPLEITEMCATEGORIES,
  MULTIPLESHIPPINGADDRESSNOTSUPPORTED: MULTIPLESHIPPINGADDRESSNOTSUPPORTED,
  MULTIPLESHIPPINGOPTIONSELECTED: MULTIPLESHIPPINGOPTIONSELECTED,
  MULTIPLESHIPPINGTYPENOTSUPPORTED: MULTIPLESHIPPINGTYPENOTSUPPORTED,
  MerchantPayableBreakdown: MerchantPayableBreakdown,
  Model400: Model400,
  Model400IssuesInner: Model400IssuesInner,
  Model401: Model401,
  Model401IssuesInner: Model401IssuesInner,
  Model403: Model403,
  Model403IssuesInner: Model403IssuesInner,
  Model404: Model404,
  Model404IssuesInner: Model404IssuesInner,
  Model422: Model422,
  Model422IssuesInner: Model422IssuesInner,
  Money: Money,
  Money2: Money2,
  Mybank: Mybank,
  MybankRequest: MybankRequest,
  NOPAYMENTSOURCEPROVIDED: NOPAYMENTSOURCEPROVIDED,
  NOTELIGIBLEFORPAYPALTRANSACTIONIDPROCESSING:
    NOTELIGIBLEFORPAYPALTRANSACTIONIDPROCESSING,
  NOTELIGIBLEFORPNREFPROCESSING: NOTELIGIBLEFORPNREFPROCESSING,
  NOTELIGIBLEFORTOKENPROCESSING: NOTELIGIBLEFORTOKENPROCESSING,
  NOTENABLEDFORAPPLEPAY: NOTENABLEDFORAPPLEPAY,
  NOTENABLEDFORBANKPROCESSING: NOTENABLEDFORBANKPROCESSING,
  NOTENABLEDFORCARDPROCESSING: NOTENABLEDFORCARDPROCESSING,
  NOTENABLEDFORCARDPROCESSING1: NOTENABLEDFORCARDPROCESSING1,
  NOTENABLEDFORGOOGLEPAY: NOTENABLEDFORGOOGLEPAY,
  NOTENABLEDTOVAULTPAYMENTSOURCE: NOTENABLEDTOVAULTPAYMENTSOURCE,
  NOTPATCHABLE: NOTPATCHABLE,
  NOTSUPPORTED: NOTSUPPORTED,
  Name: Name,
  Name2: Name2,
  NetAmountBreakdownItem: NetAmountBreakdownItem,
  NetworkTransactionReference: NetworkTransactionReference,
  ONEOFPARAMETERSREQUIRED: ONEOFPARAMETERSREQUIRED,
  ONEOFTHEPARAMETERSREQUIRED: ONEOFTHEPARAMETERSREQUIRED,
  ONLYONEBANKSOURCEALLOWED: ONLYONEBANKSOURCEALLOWED,
  ONLYONEPAYMENTSOURCEALLOWED: ONLYONEPAYMENTSOURCEALLOWED,
  ORDERALREADYAUTHORIZED: ORDERALREADYAUTHORIZED,
  ORDERALREADYAUTHORIZED1: ORDERALREADYAUTHORIZED1,
  ORDERALREADYCAPTURED: ORDERALREADYCAPTURED,
  ORDERALREADYCAPTURED1: ORDERALREADYCAPTURED1,
  ORDERALREADYCOMPLETED: ORDERALREADYCOMPLETED,
  ORDERCANNOTBECONFIRMED: ORDERCANNOTBECONFIRMED,
  ORDERCANNOTBESAVED: ORDERCANNOTBESAVED,
  ORDERCOMPLETEDORVOIDED: ORDERCOMPLETEDORVOIDED,
  ORDERCOMPLETEONPAYMENTAPPROVAL: ORDERCOMPLETEONPAYMENTAPPROVAL,
  ORDERCOMPLETEONPAYMENTAPPROVAL1: ORDERCOMPLETEONPAYMENTAPPROVAL1,
  ORDERCOMPLETIONINPROGRESS: ORDERCOMPLETIONINPROGRESS,
  ORDEREXPIRED: ORDEREXPIRED,
  ORDERISPENDINGAPPROVAL: ORDERISPENDINGAPPROVAL,
  ORDERNOTAPPROVED: ORDERNOTAPPROVED,
  ORDERNOTAPPROVED1: ORDERNOTAPPROVED1,
  Order: Order,
  OrderAllOf: OrderAllOf,
  OrderApplicationContext: OrderApplicationContext,
  OrderAuthorizeRequest: OrderAuthorizeRequest,
  OrderAuthorizeResponse: OrderAuthorizeResponse,
  OrderCaptureRequest: OrderCaptureRequest,
  OrderConfirmApplicationContext: OrderConfirmApplicationContext,
  OrderRequest: OrderRequest,
  OrderTrackerRequest: OrderTrackerRequest,
  OrderTrackerRequestAllOf: OrderTrackerRequestAllOf,
  OrdersAuthorize400: OrdersAuthorize400,
  OrdersAuthorize400IssuesInner: OrdersAuthorize400IssuesInner,
  OrdersAuthorize400Response: OrdersAuthorize400Response,
  OrdersAuthorize403: OrdersAuthorize403,
  OrdersAuthorize403IssuesInner: OrdersAuthorize403IssuesInner,
  OrdersAuthorize403Response: OrdersAuthorize403Response,
  OrdersAuthorize422: OrdersAuthorize422,
  OrdersAuthorize422IssuesInner: OrdersAuthorize422IssuesInner,
  OrdersAuthorize422Response: OrdersAuthorize422Response,
  OrdersCapture400: OrdersCapture400,
  OrdersCapture400IssuesInner: OrdersCapture400IssuesInner,
  OrdersCapture400Response: OrdersCapture400Response,
  OrdersCapture403: OrdersCapture403,
  OrdersCapture403IssuesInner: OrdersCapture403IssuesInner,
  OrdersCapture403Response: OrdersCapture403Response,
  OrdersCapture422: OrdersCapture422,
  OrdersCapture422IssuesInner: OrdersCapture422IssuesInner,
  OrdersCapture422Response: OrdersCapture422Response,
  OrdersConfirm400: OrdersConfirm400,
  OrdersConfirm400IssuesInner: OrdersConfirm400IssuesInner,
  OrdersConfirm400Response: OrdersConfirm400Response,
  OrdersConfirm403Response: OrdersConfirm403Response,
  OrdersConfirm422: OrdersConfirm422,
  OrdersConfirm422IssuesInner: OrdersConfirm422IssuesInner,
  OrdersConfirm422Response: OrdersConfirm422Response,
  OrdersCreate400Response: OrdersCreate400Response,
  OrdersCreate401Response: OrdersCreate401Response,
  OrdersCreate422Response: OrdersCreate422Response,
  OrdersGet404Response: OrdersGet404Response,
  OrdersPatch400: OrdersPatch400,
  OrdersPatch400IssuesInner: OrdersPatch400IssuesInner,
  OrdersPatch400Response: OrdersPatch400Response,
  OrdersPatch422: OrdersPatch422,
  OrdersPatch422IssuesInner: OrdersPatch422IssuesInner,
  OrdersPatch422Response: OrdersPatch422Response,
  OrdersTrackCreate400: OrdersTrackCreate400,
  OrdersTrackCreate400IssuesInner: OrdersTrackCreate400IssuesInner,
  OrdersTrackCreate400Response: OrdersTrackCreate400Response,
  OrdersTrackCreate403: OrdersTrackCreate403,
  OrdersTrackCreate403IssuesInner: OrdersTrackCreate403IssuesInner,
  OrdersTrackCreate403Response: OrdersTrackCreate403Response,
  OrdersTrackCreate422: OrdersTrackCreate422,
  OrdersTrackCreate422IssuesInner: OrdersTrackCreate422IssuesInner,
  OrdersTrackCreate422Response: OrdersTrackCreate422Response,
  OrdersTrackersPatch400: OrdersTrackersPatch400,
  OrdersTrackersPatch400IssuesInner: OrdersTrackersPatch400IssuesInner,
  OrdersTrackersPatch400Response: OrdersTrackersPatch400Response,
  OrdersTrackersPatch403: OrdersTrackersPatch403,
  OrdersTrackersPatch403Response: OrdersTrackersPatch403Response,
  OrdersTrackersPatch404: OrdersTrackersPatch404,
  OrdersTrackersPatch404IssuesInner: OrdersTrackersPatch404IssuesInner,
  OrdersTrackersPatch404Response: OrdersTrackersPatch404Response,
  OrdersTrackersPatch422: OrdersTrackersPatch422,
  OrdersTrackersPatch422IssuesInner: OrdersTrackersPatch422IssuesInner,
  OrdersTrackersPatch422Response: OrdersTrackersPatch422Response,
  P24: P24,
  P24Request: P24Request,
  PATCHPATHREQUIRED: PATCHPATHREQUIRED,
  PATCHPATHREQUIRED1: PATCHPATHREQUIRED1,
  PATCHVALUEREQUIRED: PATCHVALUEREQUIRED,
  PATCHVALUEREQUIRED1: PATCHVALUEREQUIRED1,
  PAYEEACCOUNTINVALID: PAYEEACCOUNTINVALID,
  PAYEEACCOUNTLOCKEDORCLOSED: PAYEEACCOUNTLOCKEDORCLOSED,
  PAYEEACCOUNTNOTVERIFIED: PAYEEACCOUNTNOTVERIFIED,
  PAYEEACCOUNTRESTRICTED: PAYEEACCOUNTRESTRICTED,
  PAYEEBLOCKEDTRANSACTION: PAYEEBLOCKEDTRANSACTION,
  PAYEECOUNTRYNOTSUPPORTEDFORPAYMENTSOURCE:
    PAYEECOUNTRYNOTSUPPORTEDFORPAYMENTSOURCE,
  PAYEEFXRATEIDCURRENCYMISMATCH: PAYEEFXRATEIDCURRENCYMISMATCH,
  PAYEEFXRATEIDEXPIRED: PAYEEFXRATEIDEXPIRED,
  PAYEENOTENABLEDFORBANKPROCESSING: PAYEENOTENABLEDFORBANKPROCESSING,
  PAYEENOTENABLEDFORCARDPROCESSING: PAYEENOTENABLEDFORCARDPROCESSING,
  PAYEEPRICINGTIERIDNOTENABLED: PAYEEPRICINGTIERIDNOTENABLED,
  PAYERACCOUNTLOCKEDORCLOSED: PAYERACCOUNTLOCKEDORCLOSED,
  PAYERACCOUNTRESTRICTED: PAYERACCOUNTRESTRICTED,
  PAYERACTIONREQUIRED: PAYERACTIONREQUIRED,
  PAYERCANNOTPAY: PAYERCANNOTPAY,
  PAYERCANNOTPAY1: PAYERCANNOTPAY1,
  PAYMENTALREADYAPPROVED: PAYMENTALREADYAPPROVED,
  PAYMENTSOURCECANNOTBEUSED: PAYMENTSOURCECANNOTBEUSED,
  PAYMENTSOURCEDECLINEDBYPROCESSOR: PAYMENTSOURCEDECLINEDBYPROCESSOR,
  PAYMENTSOURCEINFOCANNOTBEVERIFIED: PAYMENTSOURCEINFOCANNOTBEVERIFIED,
  PAYMENTSOURCEMISMATCH: PAYMENTSOURCEMISMATCH,
  PAYMENTSOURCENOTSUPPORTED: PAYMENTSOURCENOTSUPPORTED,
  PAYMENTTYPENOTSUPPORTEDFORINTENT: PAYMENTTYPENOTSUPPORTEDFORINTENT,
  PAYPALREQUESTIDREQUIRED: PAYPALREQUESTIDREQUIRED,
  PAYPALTRANSACTIONIDEXPIRED: PAYPALTRANSACTIONIDEXPIRED,
  PAYPALTRANSACTIONIDNOTFOUND: PAYPALTRANSACTIONIDNOTFOUND,
  PERMISSIONDENIED: PERMISSIONDENIED,
  PERMISSIONDENIEDFORDONATIONITEMS: PERMISSIONDENIEDFORDONATIONITEMS,
  PLATFORMFEEPAYEECANNOTBESAMEASPAYER: PLATFORMFEEPAYEECANNOTBESAMEASPAYER,
  PLATFORMFEESNOTSUPPORTED: PLATFORMFEESNOTSUPPORTED,
  PNREFEXPIRED: PNREFEXPIRED,
  PNREFNOTFOUND: PNREFNOTFOUND,
  POSTALCODEREQUIRED: POSTALCODEREQUIRED,
  PREFERREDPAYMENTSOURCEMISMATCH: PREFERREDPAYMENTSOURCEMISMATCH,
  PREFERREDSHIPPINGOPTIONAMOUNTMISMATCH: PREFERREDSHIPPINGOPTIONAMOUNTMISMATCH,
  PREVIOUSTRANSACTIONREFERENCEHASCHARGEBACK:
    PREVIOUSTRANSACTIONREFERENCEHASCHARGEBACK,
  PREVIOUSTRANSACTIONREFERENCEVOIDED: PREVIOUSTRANSACTIONREFERENCEVOIDED,
  Patch: Patch,
  Payee: Payee,
  PayeeBase: PayeeBase,
  Payer: Payer,
  PayerAllOf: PayerAllOf,
  PayerBase: PayerBase,
  PaymentCollection: PaymentCollection,
  PaymentInstruction: PaymentInstruction,
  PaymentMethod: PaymentMethod,
  PaymentSource: PaymentSource,
  PaymentSourceResponse: PaymentSourceResponse,
  PaypalWallet: PaypalWallet,
  PaypalWalletAttributes: PaypalWalletAttributes,
  PaypalWalletAttributesResponse: PaypalWalletAttributesResponse,
  PaypalWalletExperienceContext: PaypalWalletExperienceContext,
  PaypalWalletResponse: PaypalWalletResponse,
  Phone: Phone,
  Phone2: Phone2,
  PhoneWithType: PhoneWithType,
  PlatformFee: PlatformFee,
  ProcessorResponse: ProcessorResponse,
  PurchaseUnit: PurchaseUnit,
  PurchaseUnitRequest: PurchaseUnitRequest,
  REDIRECTPAYERFORALTERNATEFUNDING: REDIRECTPAYERFORALTERNATEFUNDING,
  REFERENCEDCARDEXPIRED: REFERENCEDCARDEXPIRED,
  REFERENCEIDNOTFOUND: REFERENCEIDNOTFOUND,
  REFERENCEIDREQUIRED: REFERENCEIDREQUIRED,
  REQUIREDPARAMETERFORCUSTOMERINITIATEDPAYMENT:
    REQUIREDPARAMETERFORCUSTOMERINITIATEDPAYMENT,
  REQUIREDPARAMETERFORPAYMENTSOURCE: REQUIREDPARAMETERFORPAYMENTSOURCE,
  RETURNURLREQUIRED: RETURNURLREQUIRED,
  Refund: Refund,
  RefundAllOf: RefundAllOf,
  RefundStatus: RefundStatus,
  RefundStatusDetails: RefundStatusDetails,
  SAVEORDERNOTSUPPORTED: SAVEORDERNOTSUPPORTED,
  SETUPERRORFORBANK: SETUPERRORFORBANK,
  SHIPPINGADDRESSINVALID: SHIPPINGADDRESSINVALID,
  SHIPPINGOPTIONNOTSELECTED: SHIPPINGOPTIONNOTSELECTED,
  SHIPPINGOPTIONSNOTSUPPORTED: SHIPPINGOPTIONSNOTSUPPORTED,
  SHIPPINGOPTIONSNOTSUPPORTED1: SHIPPINGOPTIONSNOTSUPPORTED1,
  SHIPPINGTYPENOTSUPPORTEDFORCLIENT: SHIPPINGTYPENOTSUPPORTEDFORCLIENT,
  SellerProtection: SellerProtection,
  SellerReceivableBreakdown: SellerReceivableBreakdown,
  ShipmentTracker: ShipmentTracker,
  ShippingDetail: ShippingDetail,
  ShippingWithTrackingDetails: ShippingWithTrackingDetails,
  ShippingWithTrackingDetailsAllOf: ShippingWithTrackingDetailsAllOf,
  Sofort: Sofort,
  SofortRequest: SofortRequest,
  StoredPaymentSource: StoredPaymentSource,
  SupplementaryData: SupplementaryData,
  TAXTOTALMISMATCH: TAXTOTALMISMATCH,
  TAXTOTALREQUIRED: TAXTOTALREQUIRED,
  TOKENEXPIRED: TOKENEXPIRED,
  TOKENIDNOTFOUND: TOKENIDNOTFOUND,
  TRACKERIDNOTFOUND: TRACKERIDNOTFOUND,
  TRANSACTIONBLOCKEDBYPAYEE: TRANSACTIONBLOCKEDBYPAYEE,
  TRANSACTIONLIMITEXCEEDED: TRANSACTIONLIMITEXCEEDED,
  TRANSACTIONRECEIVINGLIMITEXCEEDED: TRANSACTIONRECEIVINGLIMITEXCEEDED,
  TRANSACTIONREFUSED: TRANSACTIONREFUSED,
  TaxInfo: TaxInfo,
  ThreeDSecureAuthenticationResponse: ThreeDSecureAuthenticationResponse,
  Token: Token,
  Tracker: Tracker,
  TrackerAllOf: TrackerAllOf,
  TrackerItem: TrackerItem,
  Trustly: Trustly,
  TrustlyRequest: TrustlyRequest,
  UNSUPPORTEDINTENT: UNSUPPORTEDINTENT,
  UNSUPPORTEDINTENTFORPAYMENTSOURCE: UNSUPPORTEDINTENTFORPAYMENTSOURCE,
  UNSUPPORTEDPATCHPARAMETERVALUE: UNSUPPORTEDPATCHPARAMETERVALUE,
  UNSUPPORTEDPAYMENTINSTRUCTION: UNSUPPORTEDPAYMENTINSTRUCTION,
  UNSUPPORTEDPROCESSINGINSTRUCTION: UNSUPPORTEDPROCESSINGINSTRUCTION,
  UNSUPPORTEDSHIPPINGTYPE: UNSUPPORTEDSHIPPINGTYPE,
  V3VaultInstructionBase: V3VaultInstructionBase,
  VAULTINSTRUCTIONDUPLICATED: VAULTINSTRUCTIONDUPLICATED,
  VAULTINSTRUCTIONREQUIRED: VAULTINSTRUCTIONREQUIRED,
  VaultInstructionBase: VaultInstructionBase,
  VaultPaypalWalletBase: VaultPaypalWalletBase,
  VaultPaypalWalletBaseAllOf: VaultPaypalWalletBaseAllOf,
  VaultResponse: VaultResponse,
  VaultVenmoWalletBase: VaultVenmoWalletBase,
  VaultVenmoWalletBaseAllOf: VaultVenmoWalletBaseAllOf,
  VenmoWalletAttributes: VenmoWalletAttributes,
  VenmoWalletAttributesResponse: VenmoWalletAttributesResponse,
  VenmoWalletExperienceContext: VenmoWalletExperienceContext,
  VenmoWalletRequest: VenmoWalletRequest,
  VenmoWalletResponse: VenmoWalletResponse,
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
