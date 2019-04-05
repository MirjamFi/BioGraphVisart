#!/usr/bin/env xonsh

import json 

def loadsJson(f):

    def _f(*args, **kwargs):
        ret = f(*args, **kwargs)
        return json.loads(ret)

    return _f

@loadsJson
def registerBiographExplorerUiService():
    return $(
        curl --silent -X POST \
             --url http://kong:8001/services \
             --data 'name=biograph-explorer-ui' \
             --data 'url=http://biograph-explorer-ui:3000/'
    )


@loadsJson 
def registerBiographExplorerUiServiceRoute():
    return $(
        curl --silent -X POST \
             --url http://kong:8001/services/biograph-explorer-ui/routes \
			 --data 'name=biograph-explorer-ui' \
             --data 'paths[]=/vis/ui' \
             --data 'methods[]=GET' \
             --data 'methods[]=POST' \
             --data 'methods[]=DELETE'
    )

if __name__ == '__main__':
    # UI
	registerBiographExplorerUiService()
	registerBiographExplorerUiServiceRoute()
