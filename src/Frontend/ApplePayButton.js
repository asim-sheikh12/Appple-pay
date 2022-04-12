import React,{useEffect} from 'react'
import './ApplePayButton.css'
import axios from 'axios'
export const ApplePayButton = () => {
  const MERCHANT_ID = "merchant.test.example.com";
const BACKEND_URL_VALIDATE_SESSION = window.location.href + "validateSession";
const BACKEND_URL_PAY = window.location.href + "pay";

const appleButton = document.querySelector(".apple-pay-button");

//Checking if apple pay is available or not
  if (
    window.ApplePaySession &&
    window.ApplePaySession.canMakePayments(MERCHANT_ID)
  ) {
    appleButton.style.display = "block";


//Handling the apple pay button click

appleButton.addEventListener("click", function () {
  const applePaySession = new window.ApplePaySession(6, {
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
    const theValidationURL = event.validationURL;
    validateTheSession(theValidationURL, function (merchantSession) {
      applePaySession.completeMerchantValidation(merchantSession);
    });
  };

  //This triggers after the user has confirmed the transaction with the Touch ID or Face
  //This will contain the payment token
  applePaySession.onpaymentauthorised = function (event) {
    const applePaymentToken = event.payment.token;
    console.log("Token>>>>>",event.payment.token)
    pay(applePaymentToken, function (outcome) {
      if (outcome) {
        applePaySession.completePayment(window.ApplePaySession.STATUS.SUCCESS);
      } else {
        applePaySession.completePayment(window.ApplePaySession.STATUS.FAILURE);
      }
    });
  };
});

const validateTheSession = function (theValidationURL, callback) {
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

const pay = function (applePaymentToken, callback) {
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
}

}
  else{
    console.log('Apple Pay not supported')
  }

  return (
    <div>
      <div className='apple-pay-button'></div>
    </div>
  )
}




