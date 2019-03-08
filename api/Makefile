COMPOSE=docker/compose

BASE=$(COMPOSE)/base.yml
DEV=$(COMPOSE)/dev.yml
PROD=$(COMPOSE)/prod.yml

graphvis/api:
	docker-compose -f $(BASE) build graphvis-api

up:
	docker-compose -f $(BASE) -f $(DEV) up 

down:
	docker-compose -f $(BASE) -f $(DEV) down 
