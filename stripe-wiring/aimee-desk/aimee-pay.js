/* Aimée's desk — payment-link module (staging wiring).
   The desk never touches card data and never invents a price.
   Flow: quote agreed in writing -> desk picks (or Muse creates) the Payment Link
   for that deal -> desk sends the link -> work starts ONLY when the payment is
   verified in Stripe against the payer's name/email on the deal record. */
"use strict";

const fs = require("fs");
const path = require("path");
const CONFIG = path.join(__dirname, "..", "config", "payment-links.json");

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG, "utf8"));
}

/* Fixed-price items: returns the Payment Link URL, or null while the slot is
   still AWAITING_TAP (desk then says the honest thing: "the desk opens
   December 1" — never a fake link). */
function fixedLink(section, id) {
  const cfg = loadConfig();
  const list = cfg[section];
  if (!Array.isArray(list)) return null;
  const item = list.find((p) => p.id === id);
  return item && item.url ? item.url : null;
}

/* Custom off-catalog deal: the desk does NOT build amounts in code. A human
   (Muse in the dashboard, or Vance) creates a one-off Payment Link named
   "Lux — <Client> — <Project> — <Deposit|Balance|Full>" at the agreed amount;
   the desk records it against the deal with this shape and sends it. */
function customDealLinkRecord({ clientName, project, stage, amount, currency, url }) {
  if (!clientName || !project || !stage || !amount || !url) {
    throw new Error("custom deal link record needs clientName, project, stage, amount, url");
  }
  return {
    link_name: `Lux — ${clientName} — ${project} — ${stage}`,
    amount,
    currency: currency || "CAD",
    url,
    state: "SENT",
    work_authorized: false, // flips true ONLY via verifyPayment() match below
  };
}

/* GET-PAID-FIRST gate: work starts only when a succeeded Stripe payment
   matches the deal's payer identity (name/email) and amount. */
function verifyPayment(deal, stripePayment) {
  const nameOk =
    stripePayment.billing_name &&
    deal.payer_name &&
    stripePayment.billing_name.trim().toLowerCase() === deal.payer_name.trim().toLowerCase();
  const emailOk =
    stripePayment.billing_email &&
    deal.payer_email &&
    stripePayment.billing_email.trim().toLowerCase() === deal.payer_email.trim().toLowerCase();
  const amountOk = stripePayment.amount === deal.amount && stripePayment.status === "succeeded";
  return Boolean((nameOk || emailOk) && amountOk);
}

/* ---------------- CRYPTO RAIL ----------------
   Public receive-only addresses from the same config ("crypto" section).
   An address can only receive — there is no key material anywhere in this
   system and none is ever handled here. Only ENABLED chains resolve;
   a disabled chain returns null and is never offered to a buyer (xlm —
   its Stellar account must hold a ~1 XLM reserve before it can receive,
   and it is not funded yet; xrp — no address on file yet, awaiting
   collection, its 1 XRP base reserve, and a verified test receipt). */
function cryptoChains() {
  const cfg = loadConfig();
  const chains = (cfg.crypto && cfg.crypto.chains) || [];
  return chains.filter((c) => c.enabled);
}

function cryptoAddress(chainId) {
  const c = cryptoChains().find((x) => x.id === chainId);
  return c ? c.address : null;
}

/* Custom deal, crypto stage: prices are fiat; the desk agrees the fiat
   price, then records the EXACT crypto amount due for this stage with the
   buyer in writing BEFORE they send (rate at payment time). Mirrors
   customDealLinkRecord; amounts are compared as recorded strings so no
   float rounding can fake a match. 50%-down / balance-before-release
   applies exactly as on the card rail. */
function customDealCryptoRecord({ clientName, project, stage, chain, cryptoAmount, asset, payerAddress }) {
  if (!clientName || !project || !stage || !chain || !cryptoAmount) {
    throw new Error("custom deal crypto record needs clientName, project, stage, chain, cryptoAmount");
  }
  if (!cryptoAddress(chain)) {
    throw new Error("chain not enabled for crypto payments: " + chain);
  }
  return {
    deal_name: `Lux — ${clientName} — ${project} — ${stage}`,
    chain,
    asset: asset || null,
    crypto_amount: String(cryptoAmount),
    to_address: cryptoAddress(chain),
    payer_address: payerAddress || null, // buyer's sending address, when they give it
    state: "AWAITING_PAYMENT",
    work_authorized: false, // flips true ONLY via verifyCryptoPayment() match below
  };
}

/* GET-PAID-FIRST gate, crypto edition — MANUAL / watch-based by design.
   Unlike Stripe there is no webhook: `observed` is what the desk actually
   saw on a public block explorer for the deal's receiving address:
   { chain, amount (string, as recorded), status: "confirmed", tx_hash,
     sender (optional, where the chain/explorer shows it) }.
   Match = right chain + exact recorded amount + confirmed status +
   sender match where a payer address was recorded. No match, no start —
   the mismatch is reported, not guessed past. */
function verifyCryptoPayment(deal, observed) {
  const chainOk = observed.chain === deal.chain;
  const amountOk = String(observed.amount) === deal.crypto_amount;
  const statusOk = observed.status === "confirmed" && Boolean(observed.tx_hash);
  let senderOk = true;
  if (deal.payer_address) {
    senderOk =
      Boolean(observed.sender) &&
      (observed.sender === deal.payer_address ||
        observed.sender.toLowerCase() === deal.payer_address.toLowerCase());
  }
  return Boolean(chainOk && amountOk && statusOk && senderOk);
}

module.exports = {
  fixedLink,
  customDealLinkRecord,
  verifyPayment,
  cryptoChains,
  cryptoAddress,
  customDealCryptoRecord,
  verifyCryptoPayment,
};
