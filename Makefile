

shell dev:
	@echo Starting development shell
	@-docker-compose -f docker-compose.yml -f dev.yml run --rm --service-ports web bash


rcli:
	@echo Starting redis-cli
	@-docker-compose run --rm redis redis-cli -h redis

build:
	@echo Rebuilding docker images...
	@docker-compose build
