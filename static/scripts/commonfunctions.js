// create dropdown for node attributes
function createSele(){
	var sele = document.createElement("OPTION");    
	sele.text = "Choose node's attribute";
	sele.value = "";

	return sele;
}

//create dropdown for layout
function createLayoutSele(){
	var seleLayout =document.createElement("OPTION");
	seleLayout.text = "Select Layout";
	return seleLayout;
}

// add layout options
function addLayoutOptions(s){
    var graphLayout = s;
    var optnLayout = document.createElement("OPTION");
    optnLayout.text=graphLayout;
    optnLayout.value=graphLayout;
    return optnLayout;
}

// add legend for node color
function addcolorlegend(cy){
	cy.$('node[id = "l1"]')
          .style('color', 'black')
          .style('background-height',50)
          .style('background-width',200)
          .style('background-position-y','100%')
          .style('shape','rectangle')
          .style('width',200)
          .style('height',50)
          .style('border-width',1)
          .style('text-valign' , 'bottom')
          .style('text-max-width', 200)
}

// create label for color legend
function calculateLabelColorLegend(labelVal, fontSize, cy, nodesMin, nodesMax){
	var whitespace = getTextWidth(' ', fontSize +" arial");
	var minspace = getTextWidth(nodesMin, fontSize +" arial");
	var valspace = getTextWidth(labelVal, fontSize +" arial");
	var maxspace = getTextWidth(nodesMax, fontSize +" arial");
	var neededWhitespace = 
		((200-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
	if(neededWhitespace <= 0){
	    while(neededWhitespace <= 0){
	    	labelVal = labelVal.slice(0, -1);
	    	valspace = getTextWidth(labelVal+'...', fontSize +" arial");
	    	neededWhitespace = 
	    		((200-(minspace+whitespace+valspace+whitespace+maxspace))/
	    			whitespace)/2;
	    }
	    labelVal = labelVal+'...';
	}
	if(!isNaN(nodesMin)){
      cy.$('node[id = "l1"]')
        .style('background-image',backgroundimg_num)
    }
    else{
      cy.$('node[id = "l1"]')
        .style('background-image',backgroundimg_bool)
    }
     cy.$('node[id = "l1"]')
      .style('label', nodesMin+' '+' '.repeat(neededWhitespace)+ labelVal +' '
      	+' '.repeat(neededWhitespace) + nodesMax)

}

// create legend for edges
function createInteractionLegend(interactionTypes, graphLeft, graphRight=null) {
	if(interactionTypes.has("activation") && 
		interactionTypes.has("expression")){
	  interactionTypes.delete("expression")
	}
	if(interactionTypes.has("inhibition") && 
		interactionTypes.has("repression")){
	  interactionTypes.delete("repression")
	}
	if(interactionTypes.has("binding/association") && 
		interactionTypes.has("dissociation")){
	  interactionTypes.delete("dissociation")
	}
	// show legend and update if necessary
	var table = document.getElementById('arrows');
	if(table.rows.length == 0){
		var i = 0;
		var otherisset = false;
		for(var interact of interactionTypes){
			// Insert a row in the table at the last row
			var newRow   = table.insertRow();
			// Insert a cells
			var newInteraction  = newRow.insertCell(0);
			var newArrow  = newRow.insertCell(1);

		    var img = document.createElement('img');
		    img.width =40;
		    img.height =30;

		    if(["activation", "expression"].includes(interact)){
		      var newText  = document.createTextNode("Activation, Expression");
		      img.src = activation_expression;
		    }
		    else if(["inhibition", "repression"].includes(interact)){
		      var newText  = document.createTextNode("Inhibition, Repression");
		      img.src = inhibition_repression;
		    }
		    else if(["compound"].includes(interact)){
		      var newText  = document.createTextNode('Compound');
		      img.src = compound;
		    }
		    else if(["indirect effect"].includes(interact)){
		      var newText  = document.createTextNode('Indirect effect');
		      img.src = indirecteffect;
		    }
		    else if(["state change"].includes(interact)){
		      var newText  = document.createTextNode('State change');
		      img.src = statechange;
		    }
		    else if(["missing interaction"].includes(interact)){
		      var newText  = document.createTextNode('Missing interaction');
		      img.src = missinginteraction;
		    }
		    else if(["phosphorylation"].includes(interact)){
		      var newText  = document.createTextNode('Phosphorylation');
		      img.src = phosphorylation;
		    }
		    else if(["dephosphorylation"].includes(interact)){
		      var newText  = document.createTextNode('Dephosphorylation');
		      img.src = dephosphorylation;
		    }
		    else if(["glycosylation"].includes(interact)){
		      var newText  = document.createTextNode('Glycosylation');
		      img.src = glycosylation;
		    }
		    else if(["methylation"].includes(interact)){
		      var newText  = document.createTextNode('Methylation');
		      img.src = methylation;
		    }
		    else if(["ubiquitination"].includes(interact)){
		      var newText  = document.createTextNode('Ubiquitination');
		      img.src = ubiquitination;
		    }
		    else if(["binding/association", "dissociation"].includes(interact)){
		      var newText  = 
		      	document.createTextNode('Binding/association, dissociation');
		      img.src = bindingassociation_dissociation;
		    }
		    else{
		      if(!otherisset){
		        var newText  = document.createTextNode('Other');
		        img.src = other;
		        otherisset = true;
		      }
		      else{
		        i++;
		        continue;
		      }
		    }
		    newInteraction.appendChild(newText);
		    newArrow.appendChild(img);
		    i++;
		}
		if(i == interactionTypes.size){
		    var newRow = table.insertRow();
		    var multipleInteractions = table.insertRow();
		    var checkMultiple = newRow.insertCell(0);
		    var newArrow = newRow.insertCell(1);

		    var newCheckMultiple = document.createElement('input');
		    newCheckMultiple.type = "checkbox";
		    newCheckMultiple.id = "mergeEdges";
		    newCheckMultiple.checked = true;
		    newCheckMultiple.addEventListener('click', function(){
		      mergeEdges(graphLeft, graphRight);
		    });

		    var label = document.createElement('label')
		    label.htmlFor = "mergeEdges";
		    label.appendChild(document.createTextNode('Multiple interactions'));

		    checkMultiple.appendChild(newCheckMultiple);
		    checkMultiple.appendChild(label)


		    var img = document.createElement('img');
		    img.width =40;
		    img.height =30;
		    img.src = multipleinteractions;
		    newArrow.appendChild(img);
			
		}
	}
}

// merging of multiple edges between two nodes
function mergeEdges(cy, cy2=undefined){
  // do not merge edges
  if(!document.getElementById("mergeEdges").checked) {
    loopEdges:
    for(var i = 0; i<cy.edges().length;i++){
      var e = cy.edges()[i].data();
      // find multiple edges
      if(typeof e.interaction != "string"){
        // hide merged edge
        cy.edges('edge[id = "'+e.id+'"]').style('display', 'none');
        loopInteraction:
        for(var interact of e.interaction){
          loopId:
          for(var j = i; j < cy.edges().length; j++){
            // single edge is already contained
            if(cy.edges()[j].data().id == e.id+'_'+interact.trim()){
              //show single edge
              cy.edges('edge[id = "'+e.id+'_'+interact.trim()+'"]')
              	.style('display', 'element').update;
              continue loopInteraction;
            }
          }
          // add single edge to graph
          cy.add({
            group: 'edges',
            data: { id:e.id+'_'+interact.trim(), source:e.source, 
            	target:e.target, interaction:interact.trim()},
          });
        }
      }
      else if(e.interaction.includes(",")){
        cy.edges()[i].data().interaction = e.interaction.split(",");
        cy.edges()[i].style('target-arrow-shape', 'vee')
        	.style('line-style','solid').update;
        i--;
      }
    }
    showMetaInfo(cy);
  }
  // merge edge
  else if(document.getElementById("mergeEdges").checked){
    for(var i = 0; i < cy.edges().length; i++){
      var edge = cy.edges()[i]
      // show merged edges
      if(edge.hidden()){
        edge.style('display', 'element').style('target-arrow-shape', 'vee')
        	.style('line-style','solid');
      }
      // hide single edges
      else if(edge.data().id.includes(edge.data().interaction) || 
      	edge.data().id.includes(',')){
          edge.style('display', 'none');
        }
      }
    
  }
  if(cy2 != undefined){
    mergeEdges(cy2);
  }
}

// get nodes and edges grom graphml string
function getNodesAndEdges(graphString, graphpos = undefined, noOptn = false){
  	var nodes = [];
  	var edges = [];
  	var nodeValuesNum = [];
  	var interactionTypes = new Set();
  	if(graphpos == "left"){
      	var leftNodes = [];
  	}
  	else if(graphpos == "right"){
      	var rightNodes = [];
  	}

  	var prevId = "";
  	var pos = 0;

  	var regExp = /\>([^)]+)\</; // get symbol name between > <

  	for (var i = 0; i <= graphString.length - 1; i++) {
    	if(graphString[i].includes("node id")){   // get node id
      		var curNode = {};
      		curNode.id = graphString[i].split("\"")[1]  ;
      		if(graphpos == "left"){
        		curNode.graph = "g1";
        		leftNodes.push({data: curNode});
      		}
      		else if(graphpos == "right"){
        		curNode.graph = "g2";
        		rightNodes.push({data: curNode});
      		}
      		nodes.push({data: curNode});
    	}
    	if(!isEmpty(curNode)){
      		if(graphString[i].includes("key=\"v_") && 
      			!graphString[i].includes("v_id")){
        		var attrname = graphString[i].split("v_")[1].split("\">")[0]
        		var val = graphString[i].split(/\>/)[1].split(/\</)[0]
	        	if(!isNaN(parseFloat(val))){
	          		curNode[attrname] = parseFloat(val);
	        	}
	        	else{
	          		curNode[attrname] = val;
	        	}
	      	}
	      	if(graphString[i].includes("\"v_"+nodeVal+"\"\>")){
	        	var val = regExp.exec(graphString[i])[1]; // if availabe get node value
	        	if(!isNaN(parseFloat(val))){
		         	attrID = graphString[i].split(" ")[7].split("\"")[1];
		          	currVal = {};
		          	currVal.val = parseFloat(val);
		          	nodeValuesNum.push(currVal.val);
		          	curNode.val = parseFloat(val);
	        	}
	        	else if(val === "false" || val === "true"){
	         	 	currVal = {};
	          		currVal[val] = val;
	          		currVal.attr = "boolean";
	          		nodeValuesNum.push(currVal);
	          		curNode.val = val;
	        	}
	      	}
    	}   
    	if(graphString[i].includes("edge source")){     // get edges
      		var curEdge = {};
      		s = graphString[i].split("\"")[1];
      		t = graphString[i].split("\"")[3];
      		curEdge.id = s.concat(t);
      		curEdge.source = s;
      		curEdge.target = t;
    	}
    	if(!isEmpty(curEdge)){
      		if(graphString[i].includes("e_interaction")){     // get edges interaction type
        		var interact = regExp.exec(graphString[i])[1]; 
        		if(interact.includes(",")){
          			var interactarray = interact.split(",")
          			for(let inter of interactarray){
            			interactionTypes.add(inter);
          			}
        		}
        		else{ 
          			interactionTypes.add(interact);
        		}

	        	if(prevId == curEdge.id){                       // multiple edges between two nodes
	          		if(!Array.isArray(edges[pos-1].data.interaction)){
	            		curEdge.interaction=
	            			[edges[pos-1].data.interaction, interact]
	            		if(graphpos == "left"){
	              			leftEdges.splice(pos-1,1)
	            		}
	            		else if(graphpos == "right"){
	              			rightEdges.splice(pos-1,1)
	            		}
	            		edges.splice(pos-1,1)
	            		pos = pos -1
	          		}
	          		else{
	            		edges[pos-1].data.interaction.push(interact)
	            		if(graphpos == "left"){
	              			if(!Array.isArray(leftEdges[pos-1].data.interaction)){
	                			leftEdges[pos-1].data.interaction = 
	                				[leftEdges[pos-1].data.interaction]
	              			}
	              			leftEdges[pos-1].data.interaction.push(interact);
	            		}
	            		else if(graphpos == "right"){
	              			if(!Array.isArray(rightEdges[pos-1].data.interaction)){
	                			rightEdges[pos-1].data.interaction = 
	                				[rightEdges[pos-1].data.interaction]
	              			}
	              			rightEdges[pos-1].data.interaction.push(interact)
	            		}
	            		continue;
	          		}
	        	}
	      		else{
	        		curEdge.interaction = interact;
	      		}
	      		if(graphpos == "left"){
	        		curEdge.graph = "g1";
	        		leftEdges.push({data: curEdge});
	      		}
	      		else if(graphpos == "right"){
	        		curEdge.graph = "g2";
	        		rightEdges.push({data: curEdge});
	      		}
	      		edges.push({data: curEdge} );

	      		prevId = curEdge.id;
	      		pos = pos +1;
	      	}
    	}
  	}
  	if(!noOptn){
		var legendNode = {};
		    legendNode.id = "l1";
		    legendNode.symbol = "legend";
		    nodes.push({data:legendNode});
	}
  return [nodes, edges, nodeValuesNum, interactionTypes];
}

//set legends range by min and max of nodes' attributes
function legendsRange(nodeValuesNum){
  if(!isEmpty(nodeValuesNum)){
    if(!nodeValuesNum.includes("empty")){
      var nodesMin = nodeValuesNum.reduce(function(a, b) {
        return parseFloat(Math.min(a, b).toFixed(2));
      });
      if(nodesMin > 0){
        nodesMin = -1;
      }
      else if(nodesMin >= 0){
        nodesMin = -1.0;
      }
      var nodesMax = nodeValuesNum.reduce(function(a, b) {
            return parseFloat(Math.max(a, b).toFixed(2));
          });
      if(nodesMax < 0){
        nodesMax = 1;
      }

      if(nodesMax <= 0){
        nodesMax = 1.0;
      }
      else if(isNaN(nodesMin) && isNaN(nodesMax)){
        nodesMin = "false";
        nodesMax = "true";
      }
    }
  }
  else if(isEmpty(nodeValuesNum)){
    var nodesMin = "false";
    var nodesMax = "true";
  }
  return [nodesMin, nodesMax]
}

/* helper functions */
// test if object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//remove all options of dropdown
function removeOptions(selectbox){
    var i;
    for(i = selectbox.options.length - 1 ; i >= 0 ; i--)
    {
        selectbox.remove(i);
    }
}


// show drop downs for nodes' shapes attribute and shape itself
function activateNodeShapeChange(){
  document.getElementById('nodeShapesAttr')
  	.setAttribute('style','visibility:visible');
}

function activateShapes(){
  document.getElementById('nodeShapes')
  	.setAttribute('style','visibility:visible');
}

// change node shape of nodes with given attribute
function changeNodeShapes(cy, container){
  	var shapeAttribute = document.getElementById('nodeShapesAttr').value;
  	var shape = document.getElementById('nodeShapes').value;

  	// select nodes with given attribute
  	if(cy.nodes().filter('node['+shapeAttribute+' ="true"]').length > 0){
		cy.style()
	      .selector('node['+shapeAttribute+' ="true"]')        
	      .style('shape', shape)
	      .update();
	}

	// list all shapes already used
	usedShapes = []
	for (var key in usedShapeAttributes) {
		if (Object.prototype.hasOwnProperty.call(usedShapeAttributes, key)) {
	        var val = usedShapeAttributes[key];
	        usedShapes[val] = key;
	    }
	}

  // no shapes have been used so far
  if(isEmpty(usedShapeAttributes)){
    usedShapeAttributes[shapeAttribute] = shape;
     shapeNode = cytoscape({
        container: document.getElementById(container),
        autolock: true,
        layout: {
          name: 'preset'
        },
        style: [
            {selector: 'node',
              style: {
              width: 18,
              height: 18,
              shape: shape,
              'background-color': '#666666',
              label: 'data(id)',
              'font-size': 10,
              'overlay-opacity': 0,
            }
          }
        ],
      });

    shapeNode.userZoomingEnabled( false );
   shapeNode.add({ // node n1
              group: 'nodes', 

              data: { 
                id: shapeAttribute, 
              },
              position: { // the model position of the node (optional on init, mandatory after)
                x: 80,
                y: 50
              },
               locked: true,
            });
   ycoord = 50;
   shapeNode.nodes().ungrabify();

  } 
  // test if shape has been used for another attribute
  else if(Object.keys(usedShapes).includes(shape)){
    if(usedShapes[shape] == shapeAttribute) return;
    var replace = 
    	confirm("Shape is already used. Do you want to replace "+
    		usedShapes[shape]+" by "+ shapeAttribute+"?")

    // is shape has been used change previous attributes shape back to ellipse
    if(replace){
      delete(usedShapeAttributes[usedShapes[shape]]);
      ycoord = shapeNode.$('node[id ="'+usedShapes[shape]+'"]')
      	.position()['y']-35;
      shapeNode.remove('node[id ="'+usedShapes[shape]+'"]');
    }
    else return;

  }
  
  // update shape of a attribute already used
  if (usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    if(shape == "ellipse"){
        shapeNode.remove('node[id ="'+shapeAttribute+'"]')
        if(shapeNode.nodes().length == 0){
          usedShapeAttributes = [];
        }
      }
    else{
      usedShapeAttributes[shapeAttribute] = shape;
      usedShapes[shape] = shapeAttribute
      shapeNode.style()
        .selector('node[id ="'+shapeAttribute+'"]')        
        .style('shape', shape)
        .update();
    }
  }

  // add new shape and attribute
  else if(!isEmpty(usedShapeAttributes) && 
  		!usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    ycoord = ycoord + 35;
    usedShapeAttributes[shapeAttribute] = shape;
    shapeNode.add( { group: "nodes", data: { id: shapeAttribute}, 
    	position:{'x':80, 'y':ycoord}});
    shapeNode.style()
        .selector('node[id ="'+shapeAttribute+'"]')        
        .style('shape', shape)
        .update();
    shapeNode.nodes().ungrabify().update();

  }
}

/*
  Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 */
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = 
    	document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
} 

function changeLayout(cy, pos=""){
  var animateLayout = true;
  var selectedLayout = document.getElementById('selectlayout'+pos).value;
  if(selectedLayout == "klay"){
    var options = {
      animate: animateLayout, // Whether to transition the node positions
      klay: {
        aspectRatio: 1.49, // The aimed aspect ratio of the drawing, that is the quotient of width by height
        compactComponents: true, // Tries to further compact components (disconnected sub-graphs).
        nodeLayering:'LONGEST_PATH', // Strategy for node layering.
        /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. 
        The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
        LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
        INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
        thoroughness: 10 // How much effort should be spent to produce a nice layout..
      },
    };
    cy.layout({
      name:'klay',
      options
    }).run();
  }
  else if(selectedLayout == "breadthfirst"){
    cy.layout({
        name: "breadthfirst",
        spacingFactor: 0.5,
        animate: animateLayout
      }).run();
  }
  else if(selectedLayout == "dagre (default)"){
    cy.layout({
        name: "dagre",
        animate: animateLayout
      }).run();
  }
  else if(selectedLayout == "cose-bilkent"){
    cy.layout({
        name: "cose-bilkent",
        // Gravity range (constant)
        gravityRange: 1.3,
        animate: true
      }).run();
  }
  else if(selectedLayout == "grid"){
    cy.layout({
        name: "grid",
        animate: animateLayout,
        avoidOverlapPadding: 5
      }).run();
  }
  else{
    cy.layout({
        name: "dagre",
        animate: animateLayout
      }).run();
    document.getElementById('selectlayout'+pos).value = "dagre (default)";
  }
}

// highlight gene searched by text input
function highlightSearchedGene(cy, secondcy=undefined){
  var gene = document.getElementById('searchgene').value;
  if(gene == ""){
    cy.$('node').style("border-width", 2); 
    cy.$('node[id = "l1"]').style("border-width", 1); 
    if(secondcy){
    	secondcy.$('node').style("border-width", 2); 
    	secondcy.$('node[id = "l1"]').style("border-width", 1);
    } 
    document.getElementById('searchgene').value = "Search gene"
  }
  else if(cy.$('node[symbol=\''  + gene + '\']').length>0){
    cy.$('node').style("border-width", 2);
    cy.$('node[symbol =\''  + gene + '\']').style("border-width", 10);
    cy.$('node[id = "l1"]').style("border-width", 1);
    if(secondcy && secondcy.$('node[symbol=\''  + gene + '\']').length>0){
	   	secondcy.$('node').style("border-width", 2);
	    secondcy.$('node[symbol =\''  + gene + '\']').style("border-width", 10);
	    secondcy.$('node[id = "l1"]').style("border-width", 1);
    }
  }
  else if(cy.$('node[name =\''  + gene + '\']').length>0){
    cy.$('node').style("border-width", 2);
    cy.$('node[name =\''  + gene + '\']').style("border-width", 10);
    cy.$('node[id = "l1"]').style("border-width", 1);
    if(secondcy && secondcy.$('node[name =\''  + gene + '\']').length>0){
    	secondcy.$('node').style("border-width", 2);
    	secondcy.$('node[name =\''  + gene + '\']').style("border-width", 10);
    	secondcy.$('node[id = "l1"]').style("border-width", 1);
    }
  }
  else{
    document.getElementById('searchgene').value = gene+" not found"
  }
}
