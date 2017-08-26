CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  email character varying(255) UNIQUE NOT NULL,
  password character varying(255),
  type character varying(255), -- invitation, free, premium, developer, staff, administrator?
  priority integer, -- 1, 2, 3
  confirmed boolean,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  confirmationToken character varying (255),
  recoveryToken character varying (255),
  pendingEmail character varying (255) UNIQUE,
  pendingEmailConfirmationToken character varying (255),
  referralId character varying (255),
  referralName character varying (255),
  privacy_username character varying (255),
  privacy_password character varying (255)
);

CREATE TABLE subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId uuid REFERENCES users (id) UNIQUE NOT NULL,
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
