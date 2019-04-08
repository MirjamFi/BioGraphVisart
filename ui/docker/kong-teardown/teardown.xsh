#!/usr/bin/env xonsh

def deleteRoute(name):
    return $(
        curl --silent -X DELETE \
             --url http://kong:8001/routes/@(name)
    )

def deleteService(name):
    return $(
        curl --silent -X DELETE \
             --url http://kong:8001/services/@(name)
    )

if __name__ == '__main__':
	deleteRoute('biograph-explorer-ui')
	deleteService('biograph-explorer-ui')
