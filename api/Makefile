COMPOSE=docker/compose

BASE=$(COMPOSE)/base.yml
DEV=$(COMPOSE)/dev.yml
PROD=$(COMPOSE)/prod.yml

vis-api:
	docker-compose -f $(BASE) build $@

up:
	docker-compose -f $(BASE) -f $(DEV) up 

down:
	docker-compose -f $(BASE) -f $(DEV) down 
