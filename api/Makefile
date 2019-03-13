COMPOSE=docker/compose

BASE=-f $(COMPOSE)/base.yml
DEV=$(BASE) -f $(COMPOSE)/dev.yml
PROD=$(BASE) -f $(COMPOSE)/prod.yml
MONGODB_BASE=-f $(COMPOSE)/mongodb.base.yml 
MONGODB_DEV=$(MONGODB_BASE) -f $(COMPOSE)/mongodb.dev.yml

DEVELOPMENT=$(MONGODB_DEV) $(DEV)

vis-api:
	docker-compose $(BASE) build $@

up:
	docker-compose $(DEVELOPMENT) up 

down:
	docker-compose $(DEVELOPMENT) down 
