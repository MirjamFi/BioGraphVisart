#API

###Get png from graphml without interavtive visualization
	curl -X GET -H "Content-Type: application/xml" --data "@example.graphml" --data "valueAttr:v_deregnet_score" --data "labelAttr:v_symbol" --data "showmultiple:false" http://localhost:3000/png >test.png

Send the graphml
	
	--data "@example.graphml" 

Select name and directory for ouput 

	>test.png

Optional:
	
- Select the attribute for node coloring (default "v_deregnet_score")
	
		--data "valueAttr:v_deregnet_score"
- Select the attribute for node labeling (default "v_symbol")

		--data "labelAttr:v_symbol"
		
- Collapse multiple edges between two edges into one (default "false")

		--data "showmultiple:false"
	
###Post graphml and show it in browser
1. Enter

		curl -X POST -H "Content-Type: application/xml" --data "@example.graphml" http://localhost:3000/vis
		
2. Open/reload 
	
		http://localhost:3000/

	