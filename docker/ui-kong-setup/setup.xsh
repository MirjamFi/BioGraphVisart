#!/usr/bin/env xonsh

import json 

def loadsJson(f):

    def _f(*args, **kwargs):
        ret = f(*args, **kwargs)
        return json.loads(ret)

    return _f

@loadsJson
def registerDeregnetUiService():
    return $(
        curl --silent -X POST \
             --url http://kong:8001/services \
             --data 'name=vis-ui' \
             --data 'url=http://vis-ui:3000/'
    )


@loadsJson 
def registerDeregnetUiServiceRoute():
    return $(
        curl --silent -X POST \
             --url http://kong:8001/services/vis-ui/routes \
             --data 'paths[]=/vis/ui' \
             --data 'methods[]=GET' \
             --data 'methods[]=POST' \
             --data 'methods[]=DELETE'
    )

if __name__ == '__main__':
    # UI
    registerDeregnetUiService()
    registerDeregnetUiServiceRoute()
