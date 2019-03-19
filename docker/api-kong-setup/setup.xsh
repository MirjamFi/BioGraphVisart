#!/usr/bin/env xonsh

import json 

def loadsJson(f):

    def _f(*args, **kwargs):
        ret = f(*args, **kwargs)
        return json.loads(ret)

    return _f

@loadsJson
def registerVisApiService():
    return $(
        curl --silent -X POST \
             --url http://kong:8001/services \
             --data 'name=vis-api' \
             --data 'url=http://vis-api:3001/'
    )


@loadsJson 
def registerVisApiServiceRoute():
    return $(
        curl --silent -X POST \
             --url http://kong:8001/services/vis-api/routes \
             --data 'paths[]=/vis/api' \
             --data 'methods[]=GET' \
             --data 'methods[]=POST' \
             --data 'methods[]=PUT' \
             --data 'methods[]=DELETE'
    )

@loadsJson 
def enableJwtForVisApiService():
    return $(
        curl --silent -X POST \
             --url http://kong:8001/services/vis-api/plugins \
             --data "name=jwt"
    )

@loadsJson 
def registerVisApiDocumentation():
    return $(
        curl --silent -X POST \
             --url http://kong:8001/services \
             --data 'name=vis-api-docs' \
             --data 'url=http://vis-api-docs:5000/'
    )

@loadsJson 
def registerVisApiDocumentationRoute():
    return $(
        curl --silent -X POST \
             --url http://kong:8001/services/vis-api-docs/routes \
             --data 'paths[]=/docs/vis-api' \
             --data 'methods[]=GET'
    )

if __name__ == '__main__':
    # service
    registerVisApiService()
    registerVisApiServiceRoute()
    # enableJwtForVisApiService()
    # documentation
    # registerVisApiDocumentation()
    # registerVisApiDocumentationRoute()
