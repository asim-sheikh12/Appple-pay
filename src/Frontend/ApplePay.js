var MERCHANT_ID = "merchant.test.example.com";
var BACKEND_URL_VALIDATE_SESSION = window.location.href + "validateSession";
var BACKEND_URL_PAY = window.location.href + "pay";

var appleButton = document.querySelector(".apple-paybutton");

//Checking if apple pay is available or not

if (
  window.ApplePaySession &&
  window.ApplePaySession.canMakePayments(MERCHANT_ID)
) {
  appleButton.style.display = "block";
}

//Handling the apple pay button click

appleButton.addEventListener("click", function () {
  var applePaySession = new window.ApplePaySession(6, {
    countryCode: "US",
    currencyCode: "USD",
    supportedNetworks: ["visa", "masterCard", "amex", "discover"],
    merchantCapabilities: ["supports3DS"],
    total: { label: "WinnerX", amount: "10.00" },
  });
  applePaySession.begin();

  //This is the first event that Apple triggers.Here you need to validate the
  //Apple pay session from your backend
  applePaySession.onvalidatemerchant = function (event) {
    var theValidationURL = event.validationURL;
    validateTheSession(theValidationURL, function (merchantSession) {
      applePaySession.completeMerchantValidation(merchantSession);
    });
  };

  //This triggers after the user has confirmed the transaction with the Touch ID or Face
  //This will contain the payment token
  applePaySession.onpaymentauthorised = function (event) {
    var applePaymentToken = event.payment.token;
    pay(applePaymentToken, function (outcome) {
      if (outcome) {
        applePaySession.completePayment(ApplePaySession.STATUS.SUCCESS);
      } else {
        applePaySession.completePayment(ApplePaySession.STATUS.FAILURE);
      }
    });
  };
});

var validateTheSession = function (theValidationURL, callback) {
  axios
    .post(
      BACKEND_URL_VALIDATE_SESSION,
      {
        appleUrl: theValidationURL,
      },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    )
    .then(function (response) {
      callback(response.data);
    });
};

var pay = function (applePaymentToken, callback) {
  //We send the validation url to our backend

  axios
    .post(
      BACKEND_URL_PAY,
      {
        token: applePaymentToken,
      },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    )
    .then(function (response) {
      callback(response.data);
    });
};
