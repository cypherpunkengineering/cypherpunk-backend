#!/usr/bin/env bash

DB=cypherpunk_dev

echo "Clearing redis cache..."
redis-cli flushall

echo "Dropping tables in $DB..."
psql -d "$DB" -f database/schema/down.sql

echo "Creating tables in $DB..."
psql -d "$DB" -f database/schema/up.sql

USERS="test@test.test kim@cypherpunk.com ed@cypherpunk.com mike@cypherpunk.com jon@cypherpunk.com tony@cypherpunk.com c@cypherpunk.com"

for USER in $USERS; do
	echo "Registering $USER..."
	curl -s -S -H "Content-Type: application/json" -X POST -d "{\"email\":\"$USER\",\"password\":\"test123\"}" 'http://localhost:11080/api/v1/account/register/signup' && echo
	psql -d "$DB" -f - <<< "UPDATE users SET type = 'developer' WHERE email = '$USER';"
done

echo "Done."
