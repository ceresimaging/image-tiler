#!/bin/bash

RETRIES=10

until psql "postgres://$CORE_DB_USER:$CORE_DB_PASS@$CORE_DB_HOST/postgres" -c "select 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
  sleep 1
done

echo "Restoring DB structure and sample data from dump..."

psql "postgres://$CORE_DB_USER:$CORE_DB_PASS@$CORE_DB_HOST/$CORE_DB_NAME" -f test/fixtures/dump.sql > /dev/null 