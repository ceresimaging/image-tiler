#include Makefile.helpers

ifneq (,$(wildcard ./.env))
	include .env
	export
	ENV_FILE_PARAM = --env-file .env
endif

DOCKER_RUN := docker-compose run --rm tiler
DOCKER_TEST := docker-compose -p test -f docker-compose.test.yml

shell:
	@$(DOCKER_RUN) bash

build:
	docker-compose build

tests:
	@echo "Runnning tests"
	@$(DOCKER_TEST) run --rm tiler || true
	@$(DOCKER_TEST) down -v

npm_install:
	@echo "Installing dependencies"
	@$(DOCKER_RUN) npm install

dump_test_db:
	@echo "Dumping DB structure and sample data to file"
	@$(DOCKER_RUN) scripts/dump_db.sh

restore_test_db:
	@$(DOCKER_RUN) scripts/restore_db.sh

dbshell:
	@$(DOCKER_RUN) psql postgresql://tiler:tiler@postgres-tiler/tiler

compile_render:
	@$(DOCKER_RUN) g++ -I /usr/local/include/mapnik/deps render/render.cpp -std=c++11 -lmapnik -o render/render
