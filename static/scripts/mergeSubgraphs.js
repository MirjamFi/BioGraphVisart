 // map values to node color for GA
function mapValuestoNodeColor(merge_graph, group, pieno, mergeMin, mergeMax, symbols){
	 Object.entries(symbols).forEach(entry => {
		  let sym = entry[0];

		// if(value < 0){
	  	merge_graph.style().selector('node[graph="'+group+'"][symbol = "'+sym+'"][val <0]')
	  		.style('background-color', 'mapData(val,'+ mergeMin+', 0, #006cf0, white)').update();
	  	merge_graph.style().selector('node[graph="both"][symbol = "'+sym+'"][val_'+group+' <0]')
	  		.style('pie-'+pieno+'-background-color', 'mapData(val_'+group+','+ mergeMin+', 0, #006cf0, white)')
	  		.style('pie-'+pieno+'-background-size','50').update();

		merge_graph.style()                // update the elements in the graph with the new style            
	    .selector('node[val <0]')
	        .style('color', 'black').update();
	    merge_graph.style() 
	      .selector('node[val <='+0.5*mergeMin+']')
	        .style('color', 'white').update();
		// else if(value > 0){
	  	merge_graph.style().selector('node[graph="'+group+'"][symbol = "'+sym+'"][val >0]')
	  		.style('background-color', 'mapData(val, 0,'+ mergeMax+', white, #d50000)').update();
	  	merge_graph.style().selector('node[graph="both"][symbol = "'+sym+'"][val_'+group+' >0]')
	  		.style('pie-'+pieno+'-background-color', 'mapData(val_'+group+', 0,'+ mergeMax+', white, #d50000)')
	  		.style('pie-'+pieno+'-background-size','50').update();

	  	merge_graph.style() 
	      .selector('node[val >0]')
	        .style('color', 'black').update();
	    merge_graph.style() 
	      .selector('node[val >='+0.5*mergeMax+']')
	        .style('color', 'white').update(); 
		// else if(value == 0){
	  	merge_graph.style().selector('node[graph="'+group+'"][symbol = "'+sym+'"][val =0]')
	  		.style('background-color','white').update();

	  	merge_graph.style().selector('node[graph="both"]')
	  		.style('border-style','double').update();

	});
}

// mousover shows value of node
function mergeMousover(merge_graph, GA, nodeVal, filenameSplit){
	merge_graph.elements('node[graph="'+GA+'"]').qtip({       // show node attibute value by mouseover
	    show: {   
	      event: 'mouseover', 
	      solo: true,
	    },
	    content: {text : function(){
	      if(!isNaN(parseFloat(this.data('val')))){
	        return '<b>'+nodeVal +' ' +filenameSplit +'</b>: ' + parseFloat(this.data('val')).toFixed(2) ; } //numbers
	       else{
	        return '<b>'+nodeVal +'</b>: '+ this.data('val') ;          //bools
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
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
} 


const getNodeValueRange = (nodes) => {
  const nodesFilteredNaN = nodes.filter(node => node.data.val);
  const nodesMin = parseFloat(Math.min(...(nodesFilteredNaN.map(node => node.data.val)))).toFixed(2);
  const nodesMax = parseFloat(Math.max(...(nodesFilteredNaN.map(node => node.data.val)))).toFixed(2);
  return [nodesMin, nodesMax];
};

function getmergedGraph(nodesL, nodesR, edgesL, edgesR){
	var nodes1 = JSON.parse(JSON.stringify(nodesL));
	var nodes2 = JSON.parse(JSON.stringify(nodesR));
	var edges1 = JSON.parse(JSON.stringify(edgesL));
	var edges2 = JSON.parse(JSON.stringify(edgesR));
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
		            	edges2[j].data.id = edges2[j].data.source+edges2[j].data.target+'_'+edges2[j].data.interaction;

		          	}
		       	 	if(edges2[j].data.target == old_id){
			            edges2[j].data.target = nodes2[i].data.id;
			            edges2[j].data.id = edges2[j].data.source+edges2[j].data.target+'_'+edges2[j].data.interaction;
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
	  		if(n1.data.symbol == n2.data.symbol){
	  			mergedNodes[i] = n1;
	  			mergedNodes[i].data.graph = "both";
		        mergedNodes[i].data.val_g1 = n1.data.val;
		        mergedNodes[i].data.val_g2 = n2.data.val;
		        for(var j=0; j < edges2.length; j++){
		          if(edges2[j].data.source == n2.data.id){
		            edges2[j].data.source = n1.data.id;
		            edges2[j].data.id = edges2[j].data.source+edges2[j].data.target+'_'+edges2[j].data.interaction;

		          }
		          if(edges2[j].data.target == n2.data.id){
		            edges2[j].data.target = n1.data.id;
		            edges2[j].data.id = edges2[j].data.source+edges2[j].data.target+'_'+edges2[j].data.interaction;
		          }
		        }
		        nodes2.splice(j,1);
	  		}
	  		if(mergedNodes[i] == undefined|| mergedNodes[i].data.id != n1.data.id){
		  		mergedNodes.push(n1);
		  	}
	  	}
	}
	for(var k = 0; k < nodes2.length; k++){
		mergedNodes.push(nodes2[k])
	}
	var legendNode = [];
	legendNode.data = {};
	legendNode.data.id = "l1";
	legendNode.data.symbol = "legend";
	mergedNodes.push(legendNode);

	var g1Legend = [];
	g1Legend.data={};
	g1Legend.data.id = "g1";
	g1Legend.data.graph = "g1";
	g1Legend.data.symbol = document.getElementById("leftID").innerHTML;
	mergedNodes.push(g1Legend);
	var g2Legend = [];
	g2Legend.data={};
	g2Legend.data.id = "g2";
	g2Legend.data.graph = "g2";
	g2Legend.data.symbol = document.getElementById("rightID").innerHTML;
	mergedNodes.push(g2Legend);

  	// mergedArray have duplicates, lets remove the duplicates using Set
  	let set = new Set();
  	let unionNodes = Array.from(mergedNodes.filter(item => {
	    if (!set.has(item.data.symbol)) {
	      set.add(item.data.symbol);
	      return true;
	    }
	    return false;
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
	const [nodesMin, nodesMax] = getNodeValueRange(unionNodes);
	var minMax = getNodeValueRange(unionNodes);
	mergeMin = minMax[0];
	mergeMax = minMax[1];
	return [unionNodes, unionEdges];
};

var merge_graph;

function merge(){
	// create buttons once

	if(!!document.getElementById("resetMerge")){
		document.getElementById("resetMerge").remove();
	}
	if(!!document.getElementById("outputNameMerge")){
		document.getElementById("outputNameMerge").remove();
	}
	if(!!document.getElementById("downloadMergePNG")){
		document.getElementById("downloadMergePNG").remove();
	}
	if(!!document.getElementById("downloadMergeSVG")){
		document.getElementById("downloadMergeSVG").remove();
	}

	// cystyle
	var cystyle =  [
        {selector: 'node',
	        style: {
	          width: 50,
	          height: 50,
	          shape: 'ellipse',
	          'background-color': 'white',
	          'border-color' : 'black',
	          'border-style' : 'solid',
	          'border-width' : '2',
	          label: 'data(symbol)',
	          "text-valign" : "center",
	          "text-halign" : "center",
	          "font-size" : 12,
	          "color":"black"
	      }},
      // style edges
	   // style edges
// style edges
      {selector: 'edge',
        style: {
          'arrow-scale' : 2,
          'curve-style' : 'bezier',
          'font-size':16,
          'text-rotation':'autorotate',
          'font-weight':800,
          'target-arrow-shape' : 'vee'
          
        }},
        {selector: 'edge[interaction = \'activation\']',
          style: {
            'target-arrow-shape': 'triangle',
        }},
        {selector: 'edge[interaction = \'expression\']',
          style: {
            'target-arrow-shape': 'triangle',
        }},
        {selector: 'edge[interaction = \'inhibition\']',
          style: {
            'target-arrow-shape': 'tee',
        }},
        {selector: 'edge[interaction = \'repression\']',
          style: {
            'target-arrow-shape': 'tee',
        }},
        {selector: 'edge[interaction = \'binding/association\']',
          style: {
            'target-arrow-shape': 'triangle-cross',
        }},
        {selector: 'edge[interaction = \'dissociation\']',
          style: {
            'target-arrow-shape': 'triangle-cross',
        }},
      	{selector: 'edge[interaction = \'compound\']',
	        style: {
	          'target-arrow-shape': 'circle',
        }},
      {selector: 'edge[interaction = \'indirect effect\']',
        style: {
          'line-style': 'dotted',
          'target-arrow-shape': 'triangle'
        }},
      {selector: 'edge[interaction = \'missing interaction\']',
        style: {
          'line-style': 'dashed',
          'target-arrow-shape': 'triangle'
        }},
        {selector: 'edge[interaction = \'state change\']',
          style: {
            'target-arrow-shape': 'square',
        }},

      {selector: 'edge[interaction = \'phosphorylation\']',
        style: {
          'target-arrow-shape': 'diamond',
          'target-label':'+p',
          'target-text-offset':20
        }},
      {selector: 'edge[interaction = \'dephosphorylation\']',
          style: {
            'target-arrow-shape': 'diamond',
            'target-label':'-p',
          'target-text-offset':20
        }},
      {selector: 'edge[interaction = \'glycosylation\']',
          style: {
           'target-arrow-shape': 'diamond',
           'target-label':'+g',
          'target-text-offset':20
        }},      
      {selector: 'edge[interaction = \'ubiquitination\']',
          style: {
            'target-arrow-shape': 'diamond',
            'target-label':'+u',
          'target-text-offset':20
        }},
      {selector: 'edge[interaction = \'methylation\']',
          style: {
            'target-arrow-shape': 'diamond',
            'target-label':'+m',
          'target-text-offset':20
        }},
          {
          selector: 'node:selected',
          css: {
            'border-width': 10,
            'width':70,
            'height':70
          }
      }
	];


  	d3.select('#merged_graph')
	  .append('button')
	  .attr('type', 'button')
	  .attr('id','mergeButton')
	  .text('MERGE')
	  .on('click', function() {
		document.getElementById('mergeButton').style.visibility="hidden";
		merge_graph = createCyObject('merged_graph', -1,1)

		const nodesEdges = getmergedGraph(leftNodes, rightNodes, leftEdges, rightEdges);
		var mergedNodes = nodesEdges[0];
		var mergedEdges = nodesEdges[1];
		//buttons: reset, merge, download
		d3.select('#merged_graph_buttons')  
		  .append('button')
		  .attr('type', 'button')
		  .attr('id','resetMerge')
		  .text('Reset layout')
		  .on('click', function() {
		      	merge_graph.layout({
		    	name: 'dagre',
		    }).run();
		  });

		 d3.select('#merged_graph_buttons')  
		  .append('p')

		  d3.select('#merged_graph_buttons')  
		  .append('input')
		  .attr('name', 'outputFileMerge')
		  .attr('type', 'text')
		  .attr('maxlength', '512')
		  .attr('id', 'outputNameMerge')
		  .attr('value', 'File name')

		  d3.select('#merged_graph_buttons')  
		  .append('button')
		  .attr('type', 'button')
		  .attr('id','downloadMergePNG')
		  .text('Download png')
		  .on('click', function(){
		  	let filenameSplitLeft = left.split("/")
			filenameSplitLeft = filenameSplitLeft[filenameSplitLeft.length-1].split('.')[0];

		    let filenameSplitRight = right.split("/")
		    filenameSplitRight = filenameSplitRight[filenameSplitRight.length-1].split('.')[0];
			  outputName = document.getElementById('outputNameMerge').value;
		  	  var png64 = merge_graph.png();
			  $('#downloadPNGMerge').attr('href', png64);
			  var download = document.createElement('a');
			  download.href = 'data:image/png;base64;'+png64;
			  if(outputName != "File name"){
			    download.download = outputName + '.png';
			  }
			  else{
			     fileName = path + '_'+ filenameSplitLeft +'_'+filenameSplitRight;
			     download.download = fileName + '_' + nodeVal + '.png';
			  }
			  download.click();
		  });

		d3.select('#merged_graph_buttons')  
		  .append('button')
		  .attr('type', 'button')
		  .attr('id','downloadMergeSVG')
		  .text('Download svg')
		  .on('click', function(){
		  	outputName = document.getElementById('outputNameMerge').value;
		  	
		    var svgContent = merge_graph.svg({scale: 1, full: true});
			  if(outputName != "File name"){
			    saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), outputName +".svg");
			  }
			  else{
			    var filenameSplitLeft = left.split("/")
			    filenameSplitLeft = filenameSplitLeft[filenameSplitLeft.length-1].split('.')[0];
			    var filenameSplitRight = right.split("/")
			    filenameSplitRight = filenameSplitRight[filenameSplitRight.length-1].split('.')[0];
			    var fileName = path+ '_' + filenameSplitLeft + '_' + filenameSplitRight;
			    saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), fileName + '_' + nodeVal + ".svg");
			  }
		  });

	      merge_graph.add(mergedNodes)
	      merge_graph.add(mergedEdges)
	      merge_graph.nodes().noOverlap({ padding: 5 });

	      // calculate label position for legend and style legend
		  var fontSize = 10;
		  var labelVal = nodeVal;
		  var whitespace = getTextWidth(' ', fontSize +" arial");
		  var minspace = getTextWidth(mergeMin, fontSize +" arial");
		  var valspace = getTextWidth(labelVal, fontSize +" arial");
		  var maxspace = getTextWidth(mergeMax, fontSize +" arial");
		  var neededWhitespace = ((130-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
		  if(neededWhitespace <= 0){

		    while(neededWhitespace <= 0){
		      labelVal = labelVal.slice(0, -1);
		      valspace = getTextWidth(labelVal+'...', fontSize +" arial");

		      neededWhitespace = ((130-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
		    }
		    labelVal = labelVal+'...';
		  }


	      merge_graph.style(cystyle);
	      
	      merge_graph.on('tap', 'node',function(evt){
		    highlightedNode.getsymbol;
		    highlightedNode.setsymbol = this.data("symbol");
		  })

	      // get symbols and values for GA
	      symbolsLeft = {};
	      graphLeft.nodes().forEach(function( ele ){
			  symbolsLeft[ele.data('symbol')]=ele.data('val');
			});


	  	var arrLeft = Object.values(symbolsLeft);
	  	var filteredLeft = arrLeft.filter(function (el) {
		  return el != null;
		});

	    // get symbols and values for GA
	    symbolsRight = {};
	    graphRight.nodes().forEach(function( ele ){
			 symbolsRight[ele.data('symbol')]=ele.data('val');
		});

	  	var arrRight = Object.values(symbolsRight);
		var filteredRight = arrRight.filter(function (el) {
		  return el != null;
		});

		// legend node
		if(!isNaN(mergeMin)){
		    merge_graph.$('node[symbol = "legend"]')
		      .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnOTExIgogICB3aWR0aD0iNTIuOTE2NjY4bW0iCiAgIGhlaWdodD0iMTMuMjI5MTY3bW0iCiAgIHZpZXdCb3g9IjAgMCAyMDAuMDAwMDEgNTAuMDAwMDAzIgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmQyLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTkxNyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGRlZnMKICAgICBpZD0iZGVmczkxNSI+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ4MTEiPgogICAgICA8c3RvcAogICAgICAgICBpZD0ic3RvcDQ4MDkiCiAgICAgICAgIG9mZnNldD0iMCIKICAgICAgICAgc3R5bGU9InN0b3AtY29sb3I6I2Q1MDAwMDtzdG9wLW9wYWNpdHk6MDsiIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIGlkPSJzdG9wNDgwNyIKICAgICAgICAgb2Zmc2V0PSIxIgogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojZDUwMDAwO3N0b3Atb3BhY2l0eToxOyIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ3MzEiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDQ3MjciIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDZjZjA7c3RvcC1vcGFjaXR5OjA7IgogICAgICAgICBvZmZzZXQ9IjEiCiAgICAgICAgIGlkPSJzdG9wNDcyOSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ3MzEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0NzMzIgogICAgICAgeDE9Ii0wLjE3MjUzNzg5IgogICAgICAgeTE9IjI1LjA0MjMwNyIKICAgICAgIHgyPSIxMDAuMDA3MzEiCiAgICAgICB5Mj0iMjUuMjIyMTYyIgogICAgICAgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiCiAgICAgICBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMTcyNTI4MTMsLTUwLjA0MjMwNSkiIC8+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ4MTEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0ODEzIgogICAgICAgeDE9IjEwMC43MTk0MiIKICAgICAgIHkxPSI3OC41OTI4ODgiCiAgICAgICB4Mj0iMTk5LjgyMDE0IgogICAgICAgeTI9Ijc4LjA1MzMyMiIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIgogICAgICAgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwLjE3OTg0ODEzLC01My4wNTMzMjIpIiAvPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE2NTYiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTE0OCIKICAgICBpZD0ibmFtZWR2aWV3OTEzIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICB1bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6c25hcC1nbG9iYWw9InRydWUiCiAgICAgaW5rc2NhcGU6bG9ja2d1aWRlcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ub2Rlcz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW90aGVycz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW9iamVjdC1taWRwb2ludHM9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtY2VudGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTpzbmFwLXRleHQtYmFzZWxpbmU9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtcGFnZT0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ncmlkcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC10by1ndWlkZXM9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjUuNTYiCiAgICAgaW5rc2NhcGU6Y3g9Ijk5LjgyMDEzNyIKICAgICBpbmtzY2FwZTpjeT0iMjQuMTAwNzA2IgogICAgIGlua3NjYXBlOndpbmRvdy14PSI0OTgiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjEzNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzkxMSIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI0NCIKICAgICB3aWR0aD0iNTY2IgogICAgIGhlaWdodD0iNjAiCiAgICAgeD0iLTEuMjAxMjQ4MiIKICAgICB5PSI3MjUuNDE1NzEiIC8+CiAgPHJlY3QKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icmVjdDMyNDYiCiAgICAgd2lkdGg9IjkuNjE2NTA0NyIKICAgICBoZWlnaHQ9IjE1My44NjQwNyIKICAgICB4PSIzNjIuODUyMTciCiAgICAgeT0iNTg2LjIxNjY3IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjQ4IgogICAgIHdpZHRoPSI0NTMuMzQ5NTIiCiAgICAgaGVpZ2h0PSIxNTcuOTg1NDQiCiAgICAgeD0iMi45MjAxMDUiCiAgICAgeT0iNDU3LjA4MDc1IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjUwIgogICAgIHdpZHRoPSI2OTUuMTM1OTMiCiAgICAgaGVpZ2h0PSIyMDguODE1NTQiCiAgICAgeD0iLTEwOC4zNTY2IgogICAgIHk9IjQzMC45Nzg4MiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI1MiIKICAgICB3aWR0aD0iNTcxLjQ5NTEyIgogICAgIGhlaWdodD0iMjc3LjUwNDg1IgogICAgIHg9Ii04LjA3MDE5MDQiCiAgICAgeT0iMTAwNi41OTUzIiAvPgogIDxlbGxpcHNlCiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InBhdGgzMjU0IgogICAgIGN4PSIxNjAuOTA1NTMiCiAgICAgY3k9IjM4OC4zOTE0OCIKICAgICByeD0iOTcuNTM4ODM0IgogICAgIHJ5PSIxMjUuMDE0NTYiIC8+CiAgPGVsbGlwc2UKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icGF0aDMyNTYiCiAgICAgY3g9IjEwMi41MTk2MSIKICAgICBjeT0iNDMwLjI5MTkzIgogICAgIHJ4PSIyMzYuOTc4MTUiCiAgICAgcnk9IjE3Ni41MzE1NiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDp1cmwoI2xpbmVhckdyYWRpZW50NDczMyk7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm8iCiAgICAgaWQ9InJlY3Q0NzE3IgogICAgIHdpZHRoPSIyMDAiCiAgICAgaGVpZ2h0PSI1MCIKICAgICB4PSIwIgogICAgIHk9Ii01MCIKICAgICB0cmFuc2Zvcm09InNjYWxlKDEsLTEpIiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOnVybCgjbGluZWFyR3JhZGllbnQ0ODEzKTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgIGlkPSJyZWN0NDgwNSIKICAgICB3aWR0aD0iMjAwIgogICAgIGhlaWdodD0iNTAiCiAgICAgeD0iMCIKICAgICB5PSIwIiAvPgo8L3N2Zz4K')
		}
		if(isNaN(mergeMin)){
			merge_graph.$('node[symbol = "legend"]')
		      .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpvc2I9Imh0dHA6Ly93d3cub3BlbnN3YXRjaGJvb2sub3JnL3VyaS8yMDA5L29zYiIKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjE5OS45OTk5OG1tIgogICBoZWlnaHQ9IjUwbW0iCiAgIHZpZXdCb3g9IjAgMCAxOTkuOTk5OTggNTAiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiA1YzNlODBkLCAyMDE3LTA4LTA2IgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmRfYm9vbC5zdmciPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyIj4KICAgIDxsaW5lYXJHcmFkaWVudAogICAgICAgaWQ9ImxpbmVhckdyYWRpZW50MjI3NSIKICAgICAgIG9zYjpwYWludD0ic29saWQiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDIyNzMiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMS4xODQ1NDk5IgogICAgIGlua3NjYXBlOmN4PSIzNzguMjAyNzQiCiAgICAgaW5rc2NhcGU6Y3k9Ijk0LjQ4ODE4OSIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE0NDAiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iODU1IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIxIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iRWJlbmUgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUuMjkxNjY2NSwtOC4yMjYxOTI1KSI+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiMwMDZjZjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMTg3MDg4NjU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0ODE1IgogICAgICAgd2lkdGg9IjEwMCIKICAgICAgIGhlaWdodD0iNTAiCiAgICAgICB4PSI1LjI5MTY2NjUiCiAgICAgICB5PSI4LjIyNjE5MjUiIC8+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0MjMwNyIKICAgICAgIHdpZHRoPSIxMDAiCiAgICAgICBoZWlnaHQ9IjUwIgogICAgICAgeD0iMTA1LjI5MTY2IgogICAgICAgeT0iOC4yMjYxOTI1IiAvPgogIDwvZz4KPC9zdmc+Cg==')
		}
	  	merge_graph.$('node[symbol = "legend"]').style('color', 'black')
			.style('color', 'black')
			.style('background-height',50)
			.style('background-width',200)
			.style('background-position-y','100%')
			.style('shape', 'rectangle')
			.style('width',200)
			.style('height',50)
			.style('border-width',1)
			.style('label', mergeMin+' '+' '.repeat(neededWhitespace)+ labelVal +' '+' '.repeat(neededWhitespace) + mergeMax)
			.style('text-valign' , 'bottom')
			.style('text-max-width', 200)

	    // circle nodes only in GA orange
	    merge_graph.nodes('[graph="g1"]').style('border-width', 5).style('border-color', '#fdae61');
	    merge_graph.nodes('[symbol = "'+document.getElementById("leftID").innerHTML+'"]').style('border-width', 13).style('width', 50)
	    .style('height', 50).style('font-weight', 'bold').style('font-size',16);
	    // circle nodes only in GB light blue
	    merge_graph.nodes('[graph="g2"]').style('border-width', 5).style('border-color', '#abd9e9');
	    merge_graph.nodes('[symbol = "'+document.getElementById("rightID").innerHTML+'"]').style('border-width', 13)
	    .style('width', 50).style('height', 50).style('font-weight', 'bold').style('font-size',16);
	    // circle nodes common in both graphs black double line
	    merge_graph.nodes('[graph="both"]').style('border-width', 5).style('border-color', 'black');


	    // map values to node color for GA
	    mapValuestoNodeColor(merge_graph, 'g1', '1', mergeMin, mergeMax, symbolsLeft);

	    // map values to node color for GB
	    mapValuestoNodeColor(merge_graph, 'g2', '2', mergeMin, mergeMax, symbolsRight);

	    // on mpuse-over show value of selected attribute

	   	let filenameSplitLeft = left.split("/")
		filenameSplitLeft = filenameSplitLeft[filenameSplitLeft.length-1].split('.')[0];

	    let filenameSplitRight = right.split("/")
	    filenameSplitRight = filenameSplitRight[filenameSplitRight.length-1].split('.')[0];
			 
		mergeMousover(merge_graph,'g1', nodeVal, filenameSplitLeft);
		mergeMousover(merge_graph,'g2', nodeVal, filenameSplitRight);

		// createLegendMerge(mergeMin, mergeMax);
        merge_graph.nodes('[graph = "both"]').qtip({       // show node attibute value by mouseover
		    show: {   
		      event: 'mouseover', 
		      solo: true,
		    },
		    content: {text : function(){
		      if(!isNaN(parseFloat(this.data('val_g2'))) && !isNaN(parseFloat(this.data('val_g1')))){
		        return '<b>'+nodeVal +' ' +filenameSplitLeft +'</b>: ' + parseFloat(this.data('val_g1')).toFixed(2) +
		        '<br><b>'+nodeVal +' ' +filenameSplitRight +'</b>: ' + parseFloat(this.data('val_g2')).toFixed(2)} //numbers
		      else if(isNaN(parseFloat(this.data('val_g2'))) && !isNaN(parseFloat(this.data('val_g1')))){
		        return '<b>'+nodeVal +' ' +filenameSplitLeft +'</b>: ' + parseFloat(this.data('val_g1')).toFixed(2) +
		        '<br><b>'+nodeVal +' ' +filenameSplitRight +'</b>: ' + this.data('val_g2')} //numbers
		      else if(!isNaN(parseFloat(this.data('val_g2'))) && isNaN(parseFloat(this.data('val_g1')))){
		        return '<b>'+nodeVal +' ' +filenameSplitLeft +'</b>: ' + this.data('val_g1') +
		        '<br><b>'+nodeVal +' ' +filenameSplitRight +'</b>: ' + parseFloat(this.data('val_g2')).toFixed(2)} //numbers         //bools
		      else{
		      	return '<b>'+nodeVal +' </b>: ' + this.data('val_g1');
		    }}},
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
		merge_graph.layout({name: 'dagre'}).run();   
		document.getElementById('KEGGpathsButtonMerge').style.visibility ="visible";
		// set background layer to hoghlight pathways
	      layerMerge = merge_graph.cyCanvas({
	              zIndex: -1,
	            });
	      canvasMerge = layerMerge.getCanvas();
	      ctxMerge = canvasMerge.getContext('2d');
	      var bMerge = $.extend( [], document.getElementById('keggpathwaysMerge').firstChild.data ).join("");
	      if(bMerge == "Hide KEGG Pathways" && allPathsMerge){
	        highlightKEGGpaths(ctxMerge, canvasMerge, graphLeft, layerMerge, "Merge", allPathsMerge, colorschemePathsMerge);
	      }
	      else if(bMerge == "Show KEGG Pathways" && allPathsMerge){
	        document.getElementById('KEGGpathsMerge').style.visibility ="hidden";
	      }

 		document.getElementById("keggpathwaysMerge").addEventListener('click', function(){listKEGGPathways('Merge', mergedNodes);});
 		document.getElementById("keggpathwaysMerge").style.visibility = "visible";
 		document.getElementById('KEGGpathsMerge').style.visibility = "visible";
	  });
}


