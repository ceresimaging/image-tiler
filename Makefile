#include Makefile.helpers
shell:
	docker-compose run --rm tiler bash

build:
	docker-compose build

tests:
	@echo "Runnning tests"
	docker-compose run --rm tiler npm run test
