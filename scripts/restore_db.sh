#!/bin/bash

RETRIES=10

until psql "postgres://$TEST_DB_USER:$TEST_DB_PASS@$TEST_DB_HOST/postgres" -c "select 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
  sleep 1
done

echo "Restoring DB structure and sample data from dump..."

psql "postgres://$TEST_DB_USER:$TEST_DB_PASS@$TEST_DB_HOST/postgres" -c "DROP DATABASE $TEST_DB_NAME;" > /dev/null 
psql "postgres://$TEST_DB_USER:$TEST_DB_PASS@$TEST_DB_HOST/postgres" -c "CREATE DATABASE $TEST_DB_NAME;" > /dev/null 
psql "postgres://$TEST_DB_USER:$TEST_DB_PASS@$TEST_DB_HOST/$TEST_DB_NAME" -c "CREATE EXTENSION postgis;" > /dev/null 
psql "postgres://$TEST_DB_USER:$TEST_DB_PASS@$TEST_DB_HOST/$TEST_DB_NAME" -f test/fixtures/dump.sql > /dev/null 