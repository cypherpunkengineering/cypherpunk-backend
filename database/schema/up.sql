CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User
CREATE TABLE users (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  email character varying(255) UNIQUE NOT NULL,
  password character varying(255),
  secret character varying(255) UNIQUE,
  -- trial, pending, invitation, expired, free, premium, elite, staff, developer
  type character varying(255) NOT NULL,
  priority integer NOT NULL, -- 1, 2, 3
  confirmed boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_login timestamp with time zone NOT NULL DEFAULT now(),
  confirmation_token character varying(255),
  recovery_token character varying(255),
  pending_email character varying(255) UNIQUE,
  pending_email_confirmation_token character varying(255),
  referral_id character varying(255),
  referral_name character varying(255)
);
CREATE INDEX ON users (type);
CREATE INDEX ON users (confirmed);
CREATE INDEX ON users (created_at);


-- user counters
CREATE TABLE user_counters (
  type character varying(255) NOT NULL, -- registered, confirmed
  count integer NOT NULL
);
INSERT INTO user_counters (type, count) VALUES ('registered', 0);
INSERT INTO user_counters (type, count) VALUES ('confirmed', 0);


-- Radius tokens
CREATE TABLE radius_tokens (
  id SERIAL NOT NULL PRIMARY KEY,
  account uuid NOT NULL REFERENCES users(id),
  username character varying(64) NOT NULL,
  attribute character varying(64) NOT NULL,
  op character(2) NOT NULL DEFAULT '==',
  value character varying(255) NOT NULL
);

-- Radius groups
CREATE TABLE radius_token_groups (
  username character varying(64) NOT NULL,
  groupname character varying(64) NOT NULL,
  priority integer NOT NULL DEFAULT 9000
);
CREATE INDEX ON radius_token_groups (username);


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
  user_id uuid REFERENCES users (id) NOT NULL,
  type character varying(255), -- monthly, semiannually, annually
  plan_id character varying(255), -- monthly899, etc
  provider character varying(255), -- stripe, amazon, paypal, bitpay, android, ios
  provider_id uuid, -- stripe id, amazon id, paypal id, bitpay id
  active boolean DEFAULT false NOT NULL,
  current boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  start_timestamp timestamp with time zone,
  purchase_timestamp timestamp with time zone,
  renewal_timestamp timestamp with time zone,
  expiration_timestamp timestamp with time zone,
  cancellation_timestamp timestamp with time zone,
  current_period_start_timestamp timestamp with time zone,
  current_period_end_timestamp timestamp with time zone
);
CREATE INDEX ON subscriptions (user_id);
CREATE INDEX ON subscriptions (current);
CREATE INDEX ON subscriptions (created_at);
CREATE INDEX ON subscriptions (start_timestamp);
CREATE INDEX ON subscriptions (renewal_timestamp);
CREATE INDEX ON subscriptions (cancellation_timestamp);
CREATE INDEX ON subscriptions (current_period_end_timestamp);


CREATE TABLE stripe (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id character varying(255) NOT NULL UNIQUE,
  stripe_data json
);


CREATE TABLE stripe_sources (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users (id) NOT NULL,
  card_id character varying(255) NOT NULL,
  last4 character varying(4) NOT NULL,
  exp_month character varying(15) NOT NULL, -- I just guessed here
  exp_year character varying(15) NOT NULL, -- I just guessed here too
  brand character varying(100) NOT NULL -- more guessing
);
CREATE INDEX ON stripe_sources (user_id);


CREATE TABLE amazon (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  billing_agreement_id character varying(255) NOT NULL,
  tries integer NOT NULL DEFAULT 0,
  amazon_data json
);


CREATE TABLE paypal (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  paypal_ident character varying(255) NOT NULL,
  paypal_data json
);


CREATE TABLE bitpay (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  bitpay_ident character varying(255) NOT NULL,
  bitpay_data json
);


-- Charge
-- id
-- created_at
-- updated_at
-- gateway (stripe, paypal, amazon, bitpay)
-- transaction_id
-- user_id
-- plan_id
-- currency
-- amount
-- refunded
-- refund_amount
-- refund_date
-- data

CREATE TABLE charges (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users (id) NOT NULL,
  subscription_id uuid REFERENCES subscriptions (id) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  gateway character varying(255) NOT NULL,
  transaction_id character varying(255) NOT NULL,
  plan_id character varying(255) NOT NULL,
  currency character varying(255) NOT NULL,
  amount money NOT NULL,
  refunded boolean DEFAULT false,
  refund_amount money,
  refund_date timestamp with time zone,
  data json NOT NULL
);

CREATE INDEX ON charges (user_id);
CREATE INDEX ON charges (subscription_id);
CREATE INDEX ON charges (transaction_id);
CREATE INDEX ON charges (created_at);
CREATE INDEX ON charges (gateway);


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
