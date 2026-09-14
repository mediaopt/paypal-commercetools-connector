import { v4 as uuidv4 } from "uuid";
import loadScript from "../../app/loadScript";
import { FraudnetPage } from "../../types";

const fraudNetFncls = "fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99";
const fraudNetUrl = "https://c.paypal.com/da/r/fb.js";
const noscriptFraudNetUrl = "https://c.paypal.com/v1/r/d/b/ns?";

const fraudnetParams = (
  fraudnetSessionId: string,
  merchantId: string,
  pageId: FraudnetPage,
) => {
  return {
    f: fraudnetSessionId.substring(0, 32),
    s: `${merchantId} ${pageId}`.substring(0, 32),
    sandbox: true,
  };
};

const noscriptSRC = (
  fraudnetSessionId: string,
  merchantId: string,
  pageId: FraudnetPage,
) =>
  `${noscriptFraudNetUrl}f=${fraudnetSessionId}&s=${merchantId}_${pageId}&js=0&r=1`;

export const embeddFraudNet = async (
  merchantId: string,
  pageId: FraudnetPage,
  setFraudnetSessionId: (value: string | undefined) => void,
) => {
  const sessionId = uuidv4().substring(0, 32);
  const fnclsNetText = JSON.stringify(
    fraudnetParams(sessionId, merchantId, pageId),
  );
  const noscriptImgSRC = noscriptSRC(sessionId, merchantId, pageId);

  const fnclsScript = document.querySelector(
    `script[fncls="${fraudNetFncls}"]`,
  );
  if (Boolean(fnclsScript))
    (fnclsScript as HTMLScriptElement).text = fnclsNetText;
  else {
    const fraudNetConfigScipt = document.createElement("script");
    fraudNetConfigScipt.setAttribute("fncls", fraudNetFncls);
    fraudNetConfigScipt.type = "application/json";
    fraudNetConfigScipt.text = fnclsNetText;
    document.body.appendChild(fraudNetConfigScipt);
  }

  const noscriptImg = document.createElement("img");
  noscriptImg.src = noscriptImgSRC;

  const oldfraudNetNoscript = document.getElementById("fraudNetNoscript");
  if (oldfraudNetNoscript) {
    const oldImg = oldfraudNetNoscript.firstElementChild;
    oldImg?.replaceWith(noscriptImg);
  } else {
    const fraudNetNoscript = document.createElement("noscript");
    fraudNetNoscript.id = "fraudNetNoscript";

    fraudNetNoscript.appendChild(noscriptImg);
    document.body.appendChild(fraudNetNoscript);
  }

  const fraudnetScript = document.querySelector(`script[src="${fraudNetUrl}"]`);

  if (fraudnetScript) fraudnetScript.remove();
  const fraudnetLoad = await loadScript(fraudNetUrl);
  fraudnetLoad ? setFraudnetSessionId(sessionId) : setFraudnetSessionId("");
};
