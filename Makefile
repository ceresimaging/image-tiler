#include Makefile.helpers
shell:
	docker-compose run --rm tiler bash

build:
	docker-compose build

tests:
	@echo "Runnning tests"
	docker-compose run --rm tiler npm run test

compile_render:
	docker-compose run --rm tiler g++ -I /usr/local/include/mapnik/deps render/render.cpp -std=c++11 -lmapnik -o render/render