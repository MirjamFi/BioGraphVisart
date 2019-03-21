COMPOSE=docker/compose
API_COMPOSE=api/docker/compose
UI_COMPOSE=ui/docker/compose

KONG_BASE=-f $(COMPOSE)/kong.base.yml
KONG_DEV=$(KONG_BASE) -f $(COMPOSE)/kong.dev.yml
POSTGRES_BASE=-f $(COMPOSE)/postgres.base.yml 
POSTGRES_DEV=$(POSTGRES_BASE) -f $(COMPOSE)/postgres.dev.yml

MONGODB_BASE=-f $(API_COMPOSE)/mongodb.base.yml 
MONGODB_DEV=$(MONGODB_BASE) -f $(API_COMPOSE)/mongodb.dev.yml
API_BASE=-f $(API_COMPOSE)/base.yml
API_DEV=$(API_BASE) -f $(API_COMPOSE)/dev.yml -f $(COMPOSE)/api.dev-volumes.yml
API_KONG_SETUP=-f $(COMPOSE)/api.kong-setup.yml

UI_BASE=-f $(UI_COMPOSE)/base.yml
UI_DEV=$(UI_BASE) -f $(UI_COMPOSE)/dev.yml -f $(COMPOSE)/ui.kong-dev-settings.yml
UI_KONG_SETUP=-f $(COMPOSE)/ui.kong-setup.yml

DEVELOPMENT=$(POSTGRES_DEV) $(KONG_DEV) $(MONGODB_DEV) $(API_DEV) $(API_KONG_SETUP) $(UI_DEV) $(UI_KONG_SETUP)

vis-api:
	docker-compose $(API_BASE) build $@

vis-api-kong-setup:
	docker-compose $(API_KONG_SETUP) build $@

vis-ui:
	docker-compose $(UI_DEV) build $@

vis-ui-kong-setup:
	docker-compose $(UI_KONG_SETUP) build $@

up:
	docker-compose $(DEVELOPMENT) up 

down:
	docker-compose $(DEVELOPMENT) down
	docker volume prune -f

hookup:
	docker-compose $(HOOKUP_DEVELOPMENT) up

unplug:
	docker-compose $(KONG_TEARDOWN_DEVELOPMENT) up
	docker-compose $(KONG_TEARDOWN_DEVELOPMENT) down 
	docker-compose $(HOOKUP_DEVELOPMENT) down
