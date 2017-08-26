CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  email character varying(255) NOT NULL,
  password character varying(255),
  type character varying(255),
  priority integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  confirmed boolean,
  confirmationToken character varying (255),
  recoveryToken character varying (255),
  pendingEmail character varying (255),
  pendingEmailConfirmationToken character varying (255),
  referralId character varying (255),
  referralName character varying (255),
  privacy_username character varying (255),
  privacy_password character varying (255)
);

CREATE UNIQUE INDEX users_email_unique_idx ON users (email);
CREATE UNIQUE INDEX users_pendingemail_unique_idx ON users (pendingEmail);
