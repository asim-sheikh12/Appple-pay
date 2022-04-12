const axios = require("axios");
const https = require("https");
const Checkout = require("checkout-sdk-node");
const fs = require("fs");
var express = require("express");
var path = require("path");
var router = express.Router();
var cko = new Checkout("sk_test_3e1ad21b-ac23-4eb3-ad1f-375e9fb56481", {
  pk: "pk_test_ac89202e-4531-43b3-a830-9e4f0151cd49",
});

//Display the HTML page by Deafault

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../src/index,js"));
});
router.post("/validateSession", async (req, res) => {
  //get the url from front end
  const { appleUrl } = req.body;
  try {
    //use the apple pay certificates
    let httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: awaitfs.readFileSync(path.join(__dirname, "/certificate")),
      key: fs.readFileSync(path.join(__dirname, "certificate key")),
    });
    let response = await axios.post(
      appleUrl,
      {
        merchantIdentifier: "merchant.test.example.com",
        domainName: "domain name",
        displayName: "WinnerX",
      },
      {
        httpsAgent,
      }
    );
    res.send(response.data);
  } catch (error) {
    res.send(error);
  }
});
//Tokenise the Apple Pay payload and perform payment

router.post("/pay", async (req, res) => {
  const { version, data, signature, header } = req.body.token.paymentData;
  let checkoutToken = await cko.tokens.request({
    type: "applepay",
    token_data: {
      version: version,
      data: data,
      signature: signature,
      header: {
        ephemeralPublicKey: header.ephemeralPublicKey,
        publicKeyHash: header.publicKeyHash,
        transactionId: header.transactionId,
      },
    },
  });
  const payment = cko.payments.request({
      source: {
          token: checkoutToken.token
      },
      amount: 1000,
      currency: "USD"
  });
  res.send(payment)
});

module.exports = router