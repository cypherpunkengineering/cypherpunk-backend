CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subscription
-- - SubscriptionPlan (asciiNoSpace string id of payment gateway defined plan)
-- - SubscriptionProviderID (asciiNoSpace string id of payment gateway: stripe etc.)
-- - SubscriptionProviderSubscriptionID
-- - SubscriptionExpirationTS (isodate)
--   - If user cancels subscription, this will be set to the TS when the worker daemon will
--     downgrade the account from premium to free, otherwise this will be set to 0
-- - SubscriptionCancellationTS (isodate)
--   - If user cancels subscription, this will be set to the TS of when the subscription was
--     cancelled, otherwise this will be set to 0
-- - SubscriptionInvoiceID (array of charges that

CREATE TABLE subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  type character varying (255), -- monthly, semiannually, annually
  planId character varying (255), -- monthly899, etc
  provider character varying (255), -- stripe, amazon, paypal, bitpay, android, ios
  providerId character varying (255), -- stripe id, amazon id, paypal id, bitpay id
  active boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  startTimestamp timestamp with time zone,
  purchaseTimestamp timestamp with time zone,
  renewalTimestamp timestamp with time zone,
  expirationTimestamp timestamp with time zone,
  cancellationTimestamp timestamp with time zone,
  currentPeriodStartTimestamp timestamp with time zone,
  currentPeriodEndTimestamp timestamp with time zone
);

-- User
-- - SubscriptionCurrentID (active subscription ID)
-- - SubscriptionPreviousID (array of old subscription IDs) // to do

-- - StripeCustomerID (id of customer from stripe API)
-- - StripePaymentSources[] (array of cards to pay with) // to do

CREATE TABLE users (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  email character varying(255) UNIQUE NOT NULL,
  password character varying(255),
  type character varying(255), -- invitation, free, premium, developer, staff, administrator?
  priority integer, -- 1, 2, 3
  confirmed boolean,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_login timestamp with time zone NOT NULL DEFAULT now(),
  confirmationToken character varying (255),
  recoveryToken character varying (255),
  pendingEmail character varying (255) UNIQUE,
  pendingEmailConfirmationToken character varying (255),
  referralId character varying (255),
  referralName character varying (255),
  privacy_username character varying (255),
  privacy_password character varying (255),
  currentSubscriptionId uuid REFERENCES subscriptions (id),
  previousSubscriptionId uuid REFERENCES subscriptions (id)
);

CREATE TABLE stripe (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id character varying (255) NOT NULL,
  stripe_data json
);

CREATE TABLE stripe_sources (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users (id) NOT NULL,
  card_id character varying (255) NOT NULL,
  last4 character varying (4) NOT NULL,
  exp_month character varying (15) NOT NULL, -- I just guessed here
  exp_year character varying (15) NOT NULL, -- I just guessed here too
  brand character varying (100) NOT NULL -- more guessing
);

CREATE TABLE amazon (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  billing_agreement_id character varying (255) NOT NULL,
  amazon_data json
);

CREATE TABLE paypal (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  paypal_ident character varying (255) NOT NULL,
  paypal_data json
);

CREATE TABLE bitpay (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  bitpay_ident character varying (255) NOT NULL,
  bitpay_data json
);


-- BillingPackage
-- - PackageID
-- - PackageName
-- - PackageDuration (in days)
-- - PackagePrice (manually convert into each currency?)
-- - PackageFeature (for now only VPN)
--
-- BillingFeature
-- - FeatureID
-- - FeatureService (for now VPN only)
-- - FeatureLimitations (How many connections)
--
-- Invoice
-- ??
-- - InvoicePaid (bool)
--
-- Charge
-- - ChargeID
-- - ChargeGateway (stripe, paypal, etc.)
-- - ChargeTransactionID
-- - ChargeUserID
-- - ChargePlanID
-- - ChargeCurrency
-- - ChargeAmount
--
-- Chargeback
-- - ???
--
-- Refund
-- - RefundGateway
-- - RefundTS (when refund occured)
-- - RefundTransactionID
-- - RefundUserID
-- - RefundCurrency
-- - RefundAmount
--
-- =========== Affiliate
-- - AffiliateID
-- - AffiliateTag (cypherpunk, wiz, etc.)
-- - Affiliate...
-- - AffiliateApproved (bool)
--
-- Campaign
-- - CampaignID
-- - PackageID
-- - AffiliateID
--
-- Click
-- - ClickID
-- - AffiliateID
-- - IPv4
-- - IPv6
-- - Country
--
-- Conversion
-- - Settlement
-- - Total number of conversions in settlement period
-- - Minus total number of refunds in settlement period
-- - Minus total number of chargebacks in settlement period
