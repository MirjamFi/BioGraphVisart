 // map values to node color for GA
function mapValuestoNodeColor(merge_graph, group, pieno, mergeMin, mergeMax, val){
	if(!shapeAttributes.includes(val)){
		// if(value < 0){
		merge_graph.style()                // update the elements in the graph with the new style            
	    .selector('node')
	        .style('color', 'black').update();
		merge_graph.style()                // update the elements in the graph with the new style            
	    .selector('node['+val+' <0]')
	        .style('color', 'black').update();
	    merge_graph.style() 
	      .selector('node['+val+' <='+0.5*mergeMin+']')
	        .style('color', 'white').update();
	   	merge_graph.style().selector('node[graph="'+group+'"]['+val+' <0]')
	  		.style('background-color', 'mapData('+val+','+ mergeMin+', 0, #006cf0, white)').update();
	  	merge_graph.style().selector('node[graph="both"]['+val+'_'+group+' <0]')
	  		.style('pie-'+pieno+'-background-color', 'mapData('+val+'_'+group+','+ mergeMin+', 0, #006cf0, white)')
	  		.style('pie-'+pieno+'-background-size','50').update();
		// else if(value > 0){
	  	merge_graph.style() 
	      .selector('node['+val+' >0]') 
	        .style('color', 'black').update();
	    merge_graph.style() 
	      .selector('node['+val+' >='+0.5*mergeMax+']')
	        .style('color', 'white').update(); 
		merge_graph.style().selector('node[graph="'+group+'"]['+val+' >0]')
	  		.style('background-color', 'mapData('+val+', 0,'+ mergeMax+', white, #d50000)').update();
	  	merge_graph.style().selector('node[graph="both"]['+val+'_'+group+' >0]')
	  		.style('pie-'+pieno+'-background-color', 'mapData('+val+'_'+group+', 0,'+ mergeMax+', white, #d50000)')
	  		.style('pie-'+pieno+'-background-size','50').update();
		// else if(value == 0){
	  	merge_graph.style().selector('node[graph="'+group+'"]['+val+' =0]')
	  		.style('background-color','white').update();
	  	merge_graph.style()                // update the elements in the graph with the new style            
	    .selector('node['+val+' = 0]')
	        .style('color', 'black').update();
  	}
  	else{
  		// if(value false){
  			merge_graph.style()                // update the elements in the graph with the new style            
	    .selector('node')
	        .style('color', 'black').update();
		merge_graph.style()                // update the elements in the graph with the new style            
	    .selector('node['+val+']')
	        .style('color', 'white').update();
	  
	   	merge_graph.style().selector('node[graph="'+group+'"]['+val+' = "false"]')
	  		.style('background-color', '#006cf0').update();
	  	merge_graph.style().selector('node[graph="both"]['+val+'_'+group+' = "false"]')
	  		.style('pie-'+pieno+'-background-color', '#006cf0')
	  		.style('pie-'+pieno+'-background-size','50').update();
		// else if(value true){
		merge_graph.style().selector('node[graph="'+group+'"]['+val+' = "true"]')
	  		.style('background-color', '#d50000').update();
	  	merge_graph.style().selector('node[graph="both"]['+val+'_'+group+' = "true"]')
	  		.style('pie-'+pieno+'-background-color', '#d50000')
	  		.style('pie-'+pieno+'-background-size','50').update();
  	}
  	merge_graph.style().selector('node[graph="both"]')
  	.style('border-style','double').update();
  	merge_graph.$('node[id = "l1"]').style("border-width", 1);  

}

// mousover shows value of node
function mergeMousover(merge_graph, GA, nodeVal, filenameSplit){
	merge_graph.elements('node[graph="'+GA+'"]').qtip({       // show node attibute value by mouseover
	    show: {   
	      event: 'mouseover', 
	      solo: true,
	    },
	    content: {text : function(){
	      if(!isNaN(parseFloat(this.data(nodeVal)))){
	        return '<b>'+nodeVal +' ' +filenameSplit +'</b>: ' + parseFloat(this.data(nodeVal)).toFixed(2) ; } //numbers
	       else{
	        return '<b>'+nodeVal +'</b>: '+ this.data(nodeVal) ;          //bools
	      }
		    }},
		    position: {
		      my: 'top center',
		      at: 'bottom center'
		    },
		    style: {
		      classes: 'qtip-bootstrap',
		      tip: {
		        width: 8,
		        height: 8
		      }
		    }
	   	});
	 merge_graph.elements('edge').qtip({       // show node attibute value by mouseover
        show: {   
          event: 'mouseover', 
          solo: true,
        },
        content: {text : function(){
            return '<b>'+this.data()['interaction'] +'</b> ' 
        }},
        position: {
          my: 'top center',
          at: 'bottom center'
        },
        style: {
          classes: 'qtip-bootstrap',
          tip: {
            width: 8,
            height: 8
          }
        },
        });

}

/*
  Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 */
function getNodeValueRange(nodes, val){
  const nodesFilteredNaN = nodes.filter(node => node.data[val]);
  const nodesFilteredNaNg1 = nodes.filter(node => node.data[val+'_g1']);
  const nodesFilteredNaNg2 = nodes.filter(node => node.data[val+'_g2']);
  var valArray = [];
  for(var n of nodesFilteredNaN){
  	valArray.push(parseFloat(n.data[val]))
  }
  for(var n of nodesFilteredNaNg1){
  	valArray.push(parseFloat(n.data[val+'_g1']))
  }
   for(var n of nodesFilteredNaNg2){
  	valArray.push(parseFloat(n.data[val+'_g2']))
  }
  const nodesMin = parseFloat(Math.min(...valArray)).toFixed(2);
  const nodesMax = parseFloat(Math.max(...valArray)).toFixed(2);
  return [nodesMin, nodesMax];
}

var unionNodes;
function getmergedGraph(nodesL, nodesR, edgesL, edgesR, interactionTypes, edgesToMerge, nodeVal){
	var nodes1 = nodesL;
	var nodes2 = nodesR;
	var edges1 = edgesL;
	var edges2 = edgesR;
	// add length of nodes1 to node ids of nodes2 and according edges to make them unique
	for(var i = 0; i < nodes2.length; i++){
    	var n = nodes2[i].data;
    	if(n.graph == "g2"){
	        if(n.id != undefined){
	        	var old_id = n.id
	        	nodes2[i].data.id = "n"+ (Number(n.id.replace( /^\D+/g, ''))+nodes1.length);
	        	for(var j=0; j < edges2.length; j++){
	          		if(edges2[j].data.source == old_id){
		            	edges2[j].data.source = nodes2[i].data.id;
		            	edges2[j].data.id = edges2[j].data.source+edges2[j].data.target;

		          	}
		       	 	if(edges2[j].data.target == old_id){
			            edges2[j].data.target = nodes2[i].data.id;
			            edges2[j].data.id = edges2[j].data.source+edges2[j].data.target;
			        }
	        	}
	      	}
	    }
	}

	var mergedNodes = [];
	for(var i = 0; i < nodes1.length; i++){
	  	var n1 = nodes1[i];
	  	for(var j = 0; j < nodes2.length; j++){
	  		var n2 = nodes2[j];
	  		if(n1.data.symbol == n2.data.symbol || n1.data.name == n2.data.name){
	  			mergedNodes[i] = n1;
	  			mergedNodes[i].data.graph = "both";
	  			for(let d in n1.data){
	  				if(!isNaN(n1.data[d]) || !isNaN(n2.data[d]) || n1.data[d] === "true" || n2.data[d] === "true" || n1.data[d] === "false" || n2.data[d] === "false"){
	  					if(d != "val"){
				        	mergedNodes[i].data[d+"_g1"] = n1.data[d];
				        	mergedNodes[i].data[d+"_g2"] = n2.data[d];
				        }
	  				}
	  			}
		        for(var k=0; k < edges2.length; k++){
		          if(edges2[k].data.source == n2.data.id){
		            edges2[k].data.source = n1.data.id;
		            edges2[k].data.id = edges2[k].data.source+edges2[k].data.target;

		          }
		          if(edges2[k].data.target == n2.data.id){
		            edges2[k].data.target = n1.data.id;
		            edges2[k].data.id = edges2[k].data.source+edges2[k].data.target;
		          }
		        }
		        nodes2.splice(j,1);
		        break;
	  		}
	  	}
	  	if(mergedNodes[i] == undefined|| mergedNodes[i].data.id != n1.data.id){
			mergedNodes.push(n1);
		}
	}
	for(var l = 0; l < nodes2.length; l++){
		mergedNodes.push(nodes2[l])
	}
	var legendNode = {};
	legendNode.data = {};
	legendNode.data.id = "l1";
	legendNode.data.symbol = "legend";
	mergedNodes.push(legendNode);

	var g1Legend = {};
	g1Legend.data={};
	g1Legend.data.id = "g1";
	g1Legend.data.graph = "g1";
	g1Legend.data.symbol = leftID;
	mergedNodes.push(g1Legend);
	var g2Legend = {};
	g2Legend.data={};
	g2Legend.data.id = "g2";
	g2Legend.data.graph = "g2";
	g2Legend.data.symbol = rightID;
	mergedNodes.push(g2Legend);

  	// mergedArray have duplicates, lets remove the duplicates using Set
  	let set = new Set();
  	unionNodes = Array.from(mergedNodes.filter(item => {
  		if(item.data.symbol){
		    if (!set.has(item.data.symbol)) {
		      set.add(item.data.symbol);
		      return true;
		    }
		    return false;
		}
		else{
			if (!set.has(item.data.name)) {
		      set.add(item.data.name);
		      return true;
		    }
		    return false;
		}
	}, set));
	const mergedEdges = [...edges1, ...edges2];
	for(var i = 0; i<mergedEdges.length; i++){
	    var n1 = mergedEdges[i];
	    for(var j =1; j < mergedEdges.length; j++){
	      	var n2 = mergedEdges[j];
	      	if(n1.data.id == n2.data.id && n1.data.graph != n2.data.graph){
	        	mergedEdges[i].data.graph = "both"
	        	mergedEdges.splice(j, 1);
	        	j--;
	      	}
	    }
	}
	// mergedArray have duplicates, lets remove the duplicates using Set
	set = new Set();
	let unionEdges = Array.from(mergedEdges.filter(item => {
	    if (!set.has(item.data.id)) {
		    set.add(item.data.id);
	      	return true;
	    }
	    return false;
	}, set));
	var minMax = getNodeValueRange(unionNodes, nodeVal);
	mergeMin = minMax[0];
	mergeMax = minMax[1];
	createInteractionLegend(interactionTypes, merge_graph, edgesToMerge);
	if(!document.getElementById('heatmap_shapes')){
		var shapelegend = document.createElement("div")
	    shapelegend.id = "heatmap_shapes";
	    shapelegend.visibility = "visible";
	    document.getElementById("legend_merge").appendChild(shapelegend);
	    document.getElementById("heatmap_shapes")
	   }
	return [unionNodes, unionEdges];
};

var merge_graph;

function merge(){
	document.getElementById('arrows').innerHTML = "";
	document.getElementById('searchgene').style.visibility = "visible";
	document.getElementById('searchbutton').style.visibility = "visible";
}

async function clickMerge(files,val, example){
	var leftID = document.getElementById('leftID').innerHTML;
    var rightID = document.getElementById('rightID').innerHTML;
	if(example){
		var objectURL1 =files[0]["name"];
		var objectURL2 = files[1]["name"];
	}
	else{
		var objectURL1 = URL.createObjectURL(files[0]);
		var objectURL2 = URL.createObjectURL(files[1]);
	}
	
    window.open('/BioGraphVisart/merge?leftID='+leftID+'&rightID='+rightID +'&file1='+objectURL1+'&file2='+objectURL2+'&nodeVal='+val+'&example='+example);
}

