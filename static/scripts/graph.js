/*
  create a graph with Cytoscape
*/

/*
visualize a graph from .graphml-file
*/

function visualize(graphString) {
   //create cytoscape object; not necessary for json
  if(!isJson){
    if(!noOptn && !collapsed && !defaultVal){
      nodeVal = document.getElementById('values').value;
    }

    // get nodes and edges
    var nodesAndEdges = getNodesAndEdges(graphString);
    nodes = nodesAndEdges[0];
    edges = nodesAndEdges[1]; 
    nodeValuesNum = nodesAndEdges[2];
    attributesTypes = nodesAndEdges[3];

    nodeValuesNum = transform01toTF(nodeValuesNum);

    if(!noOptn){
      // set min and max for legend
      legendsRange(nodeValuesNum);
    };
    // add nodes and edges to graph
    addNodesAndEdges();

  }
  if(!collapsed){
    document.getElementById('reverse').setAttribute('style','visibility:hidden');
    document.getElementById('KEGGpathsButton').style.visibility ="visible";
    document.getElementById('KEGGpaths').style.visibility ="visible";
    if(document.getElementById('values')){
      document.getElementById('values').disabled = false;
    }
    if(document.getElementById('nodeShapesAttr')){
      document.getElementById('nodeShapesAttr').disabled = false;
    }
    if(document.getElementById('nodeShapes')){
      document.getElementById('nodeShapes').disabled = false;
    }
  }
   if(collapsed){
    document.getElementById('reverse').setAttribute('style','visibility:visible');
    document.getElementById('KEGGpathsButton').style.visibility ="hidden";
    document.getElementById('KEGGpaths').style.visibility ="hidden";
    collapsed = false;
   }
  if(!collapsed){
    $('#downloadPDF').removeAttr('disabled');
    $('#downloadPNG').removeAttr('disabled');
    $('#downloadSVG').removeAttr('disabled');
    $('#downloadJSON').removeAttr('disabled');

    oldMin = nodesMin;
    oldMax = nodesMax;

    showLegend();

    document.getElementById('downloadPart').style.visibility = "visible";
  }
  showMetaInfo();
  document.getElementById('selectlayout').setAttribute('style','visibility:visible');

  if(! noDrpShapes && !isJson){
    activateNodeShapeChange();
  }

    // set background layer to hoghlight pathways
  layer = cy.cyCanvas({
          zIndex: -1,
        });
  canvas = layer.getCanvas();
  ctx = canvas.getContext('2d');
  var b = $.extend( [], document.getElementById('keggpathways').firstChild.data ).join("");
  if(b == "Hide KEGG Pathways" && allPaths){
    highlightKEGGpaths();
  }
  else if(b == "Show KEGG Pathways" && allPaths){
    document.getElementById('KEGGpaths').style.visibility ="hidden";
  }
  defaultVal = false;
  document.getElementById('loader1').style.visibility = "hidden";
}

//get information of nodes ande edges
function getNodesAndEdges(graphString){
  var nodes = [];
  var edges = [];
  var nodeValuesNum = [];
  var attributesTypes = {};

  var prevId = "";
  var pos = 0;

  var regExp = /\>(.*)\</; // get symbol name between > <

  for (var i = 0; i <= graphString.length - 1; i++) {
    if(graphString[i].includes("attr.type=")){
        if(graphString[i].split("attr.type=")[1].split("\"")[1] != "null"){
          attributesTypes[graphString[i].split("id=")[1].split("\"")[1]] = graphString[i].split("attr.type=")[1].split("\"")[1];
        }
    }
    if(graphString[i].includes("node id")){   // get node id
      var curNode = {};
      curNode.id = graphString[i].split("\"")[1]  ;
      nodes.push({data: curNode});
    }
    if(!isEmpty(curNode)){
      if(graphString[i].includes("\"v_"+nodeVal+"\"\>")){
        var val = regExp.exec(graphString[i])[1]; // if availabe get node value
        if(!isNaN(parseFloat(val))){
          attrID = graphString[i].split("\"")[1];
          currVal = {};
          currVal[nodeVal] = parseFloat(val);
          currVal.attr = attributesTypes[attrID];
          nodeValuesNum.push(currVal);
        }
        else if(val === "false" || val === "true"){
          currVal = {};
          currVal[nodeVal] = val;
          currVal.attr = "boolean";
          nodeValuesNum.push(currVal);
        }
        curNode[nodeVal] = currVal[nodeVal];
      }
      else if(graphString[i].includes("v_") && !graphString[i].includes("v_id")){
        var attrVal = graphString[i].split("\>")[1].split("\<")[0];
        var attrName = graphString[i].split("v_")[1].split("\"\>")[0];
        curNode[attrName] = attrVal;
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

        if(prevId == curEdge.id){                       // multiple edges between two nodes
          if(!Array.isArray(edges[pos-1].data.interaction)){
            curEdge.interaction=[edges[pos-1].data.interaction, interact]
            edges.splice(pos-1,1)
            pos = pos -1
          }
          else{
            edges[pos-1].data.interaction.push(interact)
            continue;
          }
        }
      else{
        curEdge.interaction = interact;
      }
      edges.push({data: curEdge} );

      prevId = curEdge.id;
      pos = pos +1;
      }
    }
  }
  if(!noOptn || (!collapsed && document.getElementById("values"))){
    noOptn = false;
    var legendNode = {};
    legendNode.id = "l1";
    legendNode.symbol = "legend";
    nodes.push({data:legendNode});
  }
  return [nodes, edges, nodeValuesNum, attributesTypes];
}

//transform 0 and 1 as atttributes to true and false
function transform01toTF(nodeValuesNumT){
  // if attributes values are only 0 or 1 make them boolean
  nodeValues = [];
  lenNodeValues = nodeValuesNumT.length;
  // attribute not available 
  if(isEmpty(nodeValuesNumT)){
      return [];
  }
  else if(!isEmpty(nodeValuesNumT)){
    for(var i=0; i < nodeValuesNumT.length; i++){
      attrType = Object.entries(nodeValuesNumT[i])[1][1];
      // boolean attributes and boolean atribtes stored as 0 or 1
      if(attrType == "boolean" ){
          if(Object.entries(nodeValuesNumT[i])[0][1] == 0){
            nodeValues.push("false");
          }
          if(Object.entries(nodeValuesNumT[i])[0][1] == 1){
            nodeValues.push("true"); 
          } 
       // }
        delete nodeValuesNumT[i];  
        lenNodeValues -=1;
      }
      
      // double attributes
      if(attrType === "double"){
        nodeValues.push(Object.entries(nodeValuesNumT[i])[0][1])
      }
    }
  }
  if(lenNodeValues == 0){
    return ["empty"];
  } 
  
  return nodeValues;
  
}

//set legends range by min and max of nodes' attributes
function legendsRange(nodeValuesNum){
  if(!isEmpty(nodeValuesNum)){
    if(!nodeValuesNum.includes("empty")){
      nodesMin = nodeValuesNum.reduce(function(a, b) {
                  return parseFloat(Math.min(a, b).toFixed(2));
                });
      if(nodesMin > 0){
        nodesMin = -1;
      }
      nodesMax = nodeValuesNum.reduce(function(a, b) {
            return parseFloat(Math.max(a, b).toFixed(2));
          });
      if(nodesMax < 0){
        nodesMax = 1;
      }
    if(!firstTime){
      if(nodesMin>oldMin){
        nodesMin = oldMin;
      }
      if(nodesMax<oldMax){
        nodesMax = oldMax;
      }
    }

    if(nodesMin >= 0){
      nodesMin = -1.0;
    }
    if(nodesMax <= 0){
      nodesMax = 1.0;
    }
  }
    else{
      nodesMin = "false";
      nodesMax = "true";
    }
  }
  
  else if(isEmpty(nodeValuesNum)){
    nodesMin = "false";
    nodesMax = "true";
  }

  if((!firstTime && !(nodesMax === oldMax)) || (!firstTime && !(nodesMin === oldMin))){
    oldMax = nodesMax;
    oldMin = nodesMin;
    $("#svgid").empty();
    //createLegend();
     $("#legendChanged").text("Legend\'s limits changed");
  }
  else{
    $("#legendChanged").text("");
  }
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

//add nodes and edges to cy-object (update if attribute has changed)
function addNodesAndEdges(){
  cy = cytoscape({
    container: document.getElementById('cy'),
    ready: function(){
          },
    elements: nodes.concat(edges),
    style: [
         // style nodes
      {selector: 'node',
        style: {
          width: 50,
          height: 50,
          shape: 'ellipse',
          'background-color': 'white',
          'border-color' : 'black',
          'border-style' : 'solid',
          'border-width' : '2',
          "text-valign" : "center",
          "text-halign" : "center",
          "font-size" : 10,
      }},
      {selector: 'node[!'+nodeVal+']',
        style: {
          'background-color': 'white',
          'color':'black'
      }},
      // attributes with numbers
      {selector: 'node['+nodeVal+' < "0"]',
        style: {
          'background-color': 'mapData('+nodeVal+','+ nodesMin+', 0, #006cf0, white)',
          'color': 'black'
      }},
      {selector: 'node['+nodeVal+' <='+0.5*nodesMin+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node['+nodeVal+' > "0"]',
        style: {
          'background-color': 'mapData('+nodeVal+', 0,'+ nodesMax+', white, #d50000)',
          'color': 'black'
      }},
      {selector: 'node['+nodeVal+' >='+0.5*nodesMax+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node['+nodeVal+' = "0"]',
        style: {
          'background-color': 'white',
          'color':'black'
      }},

      // attributes with boolean
      {selector: 'node['+nodeVal+' = "false"]',
        style: {
          'background-color': '#006cf0',
          'color':'white'
      }},
      {selector: 'node['+nodeVal+' = "true"]',
        style: {
          'background-color': '#d50000',
          'color':'white'
      }},

      {selector: 'node[id = "l1"]',
	      style:{
	        'color': 'black',
	        'background-height':50,
	        'background-width':200,
	        'background-position-y':'100%',
	        'shape': 'rectangle',
	        'width':200,
	        'height':50,
	        'border-width':1,
	        'text-valign' : 'bottom',
	        'text-max-width': 200
	    }},

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
        }}

      ]
  });
  changeLayout();
  if(nodes.every(function(x){return(x.data["symbol"])})){
    for(n=0; n < nodes.length; n++){
      cy.batch(function(){
        var labelText = nodes[n].data.symbol;
        var oldLabelText = nodes[n].data.symbol;
        // if(getTextWidth(labelText, fontSize +" arial") > 45){
          while(getTextWidth(labelText, fontSize +" arial") > 49){
            oldLabelText = oldLabelText.slice(0,-1);
            labelText = oldLabelText+'...';
          }
        // }
        cy.$('node[id =\''  + nodes[n].data.id + '\']').style("label", labelText);
      });
    }
  }
  else{
    for(n=0; n < nodes.length; n++){
      cy.batch(function(){
        var labelText = nodes[n].data.name;
        var oldLabelText = nodes[n].data.name;
        // if(getTextWidth(labelText, fontSize +" arial") > 45){
          while(getTextWidth(labelText, fontSize +" arial") > 49){
            oldLabelText = oldLabelText.slice(0,-1);
            labelText = oldLabelText+'...';
          }
        // }
        cy.$('node[id =\''  + nodes[n].data.id + '\']').style("label",labelText);
      });
    }
  }

	// on click collapse all other nodes and expand extra nodes for clicked node
  if(!collapsed){
  	cy.on('tap', 'node', function(evt){
  		clickedNode = evt.target;
      if(evt.target.data().symbol != undefined){
        var targetNode = evt.target.data().symbol
        var neighboringgraphml = getGraphforGene(targetNode);
      }
      else if(evt.target.data().name != undefined){
        var targetNode = evt.target.data().name
        var neighboringgraphml = getGraphforGene(targetNode);        
      }
		  clickedNodesPosition = cy.$(evt.target).position();
      if(neighboringgraphml){
        if(document.getElementById('values')){
          document.getElementById('values').disabled = true;
        }
        if(document.getElementById('nodeShapesAttr')){
          document.getElementById('nodeShapesAttr').disabled = true;
        }
        if(document.getElementById('nodeShapes')){
          document.getElementById('nodeShapes').disabled = true;
        }
        collapsed = true;
        noOptn = true;
  		  visualize(neighboringgraphml.split("\n"));
        cy.elements('node[name = "'+ targetNode+'"] ').style('border-width', 5).style('font-weight', 'bold')

        cy.elements('node[midrug_id]').style('background-image', 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjIsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSIyNDkuMjM1cHgiCiAgIGhlaWdodD0iMjQ5LjIzNnB4IgogICB2aWV3Qm94PSIwIDAgMjQ5LjIzNSAyNDkuMjM2IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNDkuMjM1IDI0OS4yMzYiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9InBpbGxfaWNvbl9yZWRfMjU2LnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPjxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTEzIj48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzMTEiIC8+PHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSI3NzgiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iNDgwIgogICAgIGlkPSJuYW1lZHZpZXc5IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIwLjk0Njg5Mzc0IgogICAgIGlua3NjYXBlOmN4PSIxMjQuNjE3NSIKICAgICBpbmtzY2FwZTpjeT0iMTI0LjYxOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMjIzIgogICAgIGlua3NjYXBlOndpbmRvdy15PSI3NCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9IkxheWVyXzEiIC8+PGcKICAgICBpZD0iZzYiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MSI+PHBhdGgKICAgICAgIGZpbGw9IiNGQkZCRkIiCiAgICAgICBkPSJNMTk1LjUxMiw1NC4yOTRjLTguMTQyLTguMTQzLTE4LjgxNS0xMi4yMjYtMjkuNDk0LTEyLjIyNmMtMTAuNjc0LDAtMjEuMzUxLDQuMDgzLTI5LjQ3LDEyLjIyNiAgIEw5NC4zOTYsOTYuNDM4bDAsMGwtNDIuMTQyLDQyLjEzNWMtMTYuMjg3LDE2LjI2Ny0xNi4yODcsNDIuNjgsMC4wMSw1OC45NjVjMTYuMjY2LDE2LjI3OCw0Mi42ODIsMTYuMjc4LDU4Ljk1NiwwbDMzLjE2My0zMy4xNSAgIGw1MS4xMTktNTEuMTE5QzIxMS43NzYsOTYuOTc0LDIxMS43NzYsNzAuNTU5LDE5NS41MTIsNTQuMjk0eiBNMTg2LjUzMiwxMDQuMjgzbC00Mi4xNDgsNDIuMTRMMTAzLjM2NSwxMDUuNGw0Mi4xNDItNDIuMTQgICBjNS40NzMtNS40NzQsMTIuNzY1LTguNTA3LDIwLjQ5Mi04LjUwN2M3Ljc1MSwwLDE1LjA0MiwzLjAzMywyMC41MTgsOC41MDdDMTk3LjgzOCw3NC41NjQsMTk3LjgzOCw5Mi45ODMsMTg2LjUzMiwxMDQuMjgzeiIKICAgICAgIGlkPSJwYXRoNCIKICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjEiIC8+PC9nPjwvc3ZnPg==')
        .style('background-width', '45%')
        .style('background-height', '45%')
        .style('background-position-y', '100%')
      }
  	}); // on tap
  }
  else if(collapsed){
    cy.on('tap', 'node', function(evt){
      var clickedNode = evt.target.data();
      if(clickedNode.midrug_id != undefined){
        var info = "<div align='left' id='information'><table><tr>"
        Object.keys(clickedNode).forEach(function(key) {
            if(key == "id"){
              return;
            }
            if(key == "drugbank_id"){
              info+= "<td><b>"+key.charAt(0).toUpperCase() + key.slice(1).split("_").join(" ")+"</b></td><td><a href='https://www.drugbank.ca/drugs/"+clickedNode[key]+"'target='_blank'>"+clickedNode[key]+"</a></td></tr>"
            }
            else{
              info += "<td><b>"+key.charAt(0).toUpperCase() + key.slice(1).split("_").join(" ")+"</b></td><td>"+clickedNode[key]+"</td></tr>"
            }
        });
        info += "</table>"
        var newWindow = window.open("");
        var doc = newWindow.document;
        doc.open("text/html", "replace");
        doc.write("<HTML><HEAD><TITLE>"+clickedNode.name+
          "</TITLE><link rel='stylesheet' type='text/css' href='http://127.0.0.1:3000/static/css/subgraphCss.css'></HEAD>"+
          "<BODY><H1>"+clickedNode.name+
          "</H1>"+info+"</BODY></HTML>");
        doc.close();
      }});
    cy.elements('node').qtip({       // show node attibute value by mouseover
        show: {   
          event: 'mouseover', 
          solo: true,
        },
        content: {text : function(){
          return this.data('name')
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
        })
  }
  cy.nodes().noOverlap({ padding: 5 });
  if(! noOptn){
  // calculate label position for legend and style legend
    var fontSize = 10;
    var labelVal = nodeVal;
    var whitespace = getTextWidth(' ', fontSize +" arial");
    var minspace = getTextWidth(nodesMin, fontSize +" arial");
    var valspace = getTextWidth(labelVal, fontSize +" arial");
    var maxspace = getTextWidth(nodesMax, fontSize +" arial");
    var neededWhitespace = ((200-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
    if(neededWhitespace <= 0){
  
      while(neededWhitespace <= 0){
        labelVal = labelVal.slice(0, -1);
        valspace = getTextWidth(labelVal+'...', fontSize +" arial");
  
        neededWhitespace = ((200-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
      }
      labelVal = labelVal+'...';
    }
    if(!isNaN(nodesMin)){
      cy.$('node[id = "l1"]')
        .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnOTExIgogICB3aWR0aD0iNTIuOTE2NjY4bW0iCiAgIGhlaWdodD0iMTMuMjI5MTY3bW0iCiAgIHZpZXdCb3g9IjAgMCAyMDAuMDAwMDEgNTAuMDAwMDAzIgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmQyLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTkxNyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGRlZnMKICAgICBpZD0iZGVmczkxNSI+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ4MTEiPgogICAgICA8c3RvcAogICAgICAgICBpZD0ic3RvcDQ4MDkiCiAgICAgICAgIG9mZnNldD0iMCIKICAgICAgICAgc3R5bGU9InN0b3AtY29sb3I6I2Q1MDAwMDtzdG9wLW9wYWNpdHk6MDsiIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIGlkPSJzdG9wNDgwNyIKICAgICAgICAgb2Zmc2V0PSIxIgogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojZDUwMDAwO3N0b3Atb3BhY2l0eToxOyIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ3MzEiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDQ3MjciIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDZjZjA7c3RvcC1vcGFjaXR5OjA7IgogICAgICAgICBvZmZzZXQ9IjEiCiAgICAgICAgIGlkPSJzdG9wNDcyOSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ3MzEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0NzMzIgogICAgICAgeDE9Ii0wLjE3MjUzNzg5IgogICAgICAgeTE9IjI1LjA0MjMwNyIKICAgICAgIHgyPSIxMDAuMDA3MzEiCiAgICAgICB5Mj0iMjUuMjIyMTYyIgogICAgICAgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiCiAgICAgICBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMTcyNTI4MTMsLTUwLjA0MjMwNSkiIC8+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ4MTEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0ODEzIgogICAgICAgeDE9IjEwMC43MTk0MiIKICAgICAgIHkxPSI3OC41OTI4ODgiCiAgICAgICB4Mj0iMTk5LjgyMDE0IgogICAgICAgeTI9Ijc4LjA1MzMyMiIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIgogICAgICAgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwLjE3OTg0ODEzLC01My4wNTMzMjIpIiAvPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE2NTYiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTE0OCIKICAgICBpZD0ibmFtZWR2aWV3OTEzIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICB1bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6c25hcC1nbG9iYWw9InRydWUiCiAgICAgaW5rc2NhcGU6bG9ja2d1aWRlcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ub2Rlcz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW90aGVycz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW9iamVjdC1taWRwb2ludHM9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtY2VudGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTpzbmFwLXRleHQtYmFzZWxpbmU9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtcGFnZT0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ncmlkcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC10by1ndWlkZXM9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjUuNTYiCiAgICAgaW5rc2NhcGU6Y3g9Ijk5LjgyMDEzNyIKICAgICBpbmtzY2FwZTpjeT0iMjQuMTAwNzA2IgogICAgIGlua3NjYXBlOndpbmRvdy14PSI0OTgiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjEzNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzkxMSIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI0NCIKICAgICB3aWR0aD0iNTY2IgogICAgIGhlaWdodD0iNjAiCiAgICAgeD0iLTEuMjAxMjQ4MiIKICAgICB5PSI3MjUuNDE1NzEiIC8+CiAgPHJlY3QKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icmVjdDMyNDYiCiAgICAgd2lkdGg9IjkuNjE2NTA0NyIKICAgICBoZWlnaHQ9IjE1My44NjQwNyIKICAgICB4PSIzNjIuODUyMTciCiAgICAgeT0iNTg2LjIxNjY3IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjQ4IgogICAgIHdpZHRoPSI0NTMuMzQ5NTIiCiAgICAgaGVpZ2h0PSIxNTcuOTg1NDQiCiAgICAgeD0iMi45MjAxMDUiCiAgICAgeT0iNDU3LjA4MDc1IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjUwIgogICAgIHdpZHRoPSI2OTUuMTM1OTMiCiAgICAgaGVpZ2h0PSIyMDguODE1NTQiCiAgICAgeD0iLTEwOC4zNTY2IgogICAgIHk9IjQzMC45Nzg4MiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI1MiIKICAgICB3aWR0aD0iNTcxLjQ5NTEyIgogICAgIGhlaWdodD0iMjc3LjUwNDg1IgogICAgIHg9Ii04LjA3MDE5MDQiCiAgICAgeT0iMTAwNi41OTUzIiAvPgogIDxlbGxpcHNlCiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InBhdGgzMjU0IgogICAgIGN4PSIxNjAuOTA1NTMiCiAgICAgY3k9IjM4OC4zOTE0OCIKICAgICByeD0iOTcuNTM4ODM0IgogICAgIHJ5PSIxMjUuMDE0NTYiIC8+CiAgPGVsbGlwc2UKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icGF0aDMyNTYiCiAgICAgY3g9IjEwMi41MTk2MSIKICAgICBjeT0iNDMwLjI5MTkzIgogICAgIHJ4PSIyMzYuOTc4MTUiCiAgICAgcnk9IjE3Ni41MzE1NiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDp1cmwoI2xpbmVhckdyYWRpZW50NDczMyk7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm8iCiAgICAgaWQ9InJlY3Q0NzE3IgogICAgIHdpZHRoPSIyMDAiCiAgICAgaGVpZ2h0PSI1MCIKICAgICB4PSIwIgogICAgIHk9Ii01MCIKICAgICB0cmFuc2Zvcm09InNjYWxlKDEsLTEpIiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOnVybCgjbGluZWFyR3JhZGllbnQ0ODEzKTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgIGlkPSJyZWN0NDgwNSIKICAgICB3aWR0aD0iMjAwIgogICAgIGhlaWdodD0iNTAiCiAgICAgeD0iMCIKICAgICB5PSIwIiAvPgo8L3N2Zz4K')
    }
    if(isNaN(nodesMin)){
      cy.$('node[id = "l1"]')
        .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpvc2I9Imh0dHA6Ly93d3cub3BlbnN3YXRjaGJvb2sub3JnL3VyaS8yMDA5L29zYiIKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjE5OS45OTk5OG1tIgogICBoZWlnaHQ9IjUwbW0iCiAgIHZpZXdCb3g9IjAgMCAxOTkuOTk5OTggNTAiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiA1YzNlODBkLCAyMDE3LTA4LTA2IgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmRfYm9vbC5zdmciPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyIj4KICAgIDxsaW5lYXJHcmFkaWVudAogICAgICAgaWQ9ImxpbmVhckdyYWRpZW50MjI3NSIKICAgICAgIG9zYjpwYWludD0ic29saWQiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDIyNzMiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMS4xODQ1NDk5IgogICAgIGlua3NjYXBlOmN4PSIzNzguMjAyNzQiCiAgICAgaW5rc2NhcGU6Y3k9Ijk0LjQ4ODE4OSIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE0NDAiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iODU1IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIxIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iRWJlbmUgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUuMjkxNjY2NSwtOC4yMjYxOTI1KSI+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiMwMDZjZjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMTg3MDg4NjU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0ODE1IgogICAgICAgd2lkdGg9IjEwMCIKICAgICAgIGhlaWdodD0iNTAiCiAgICAgICB4PSI1LjI5MTY2NjUiCiAgICAgICB5PSI4LjIyNjE5MjUiIC8+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0MjMwNyIKICAgICAgIHdpZHRoPSIxMDAiCiAgICAgICBoZWlnaHQ9IjUwIgogICAgICAgeD0iMTA1LjI5MTY2IgogICAgICAgeT0iOC4yMjYxOTI1IiAvPgogIDwvZz4KPC9zdmc+Cg==')
    }
    cy.$('node[id = "l1"]')
      .style('label', nodesMin+' '+' '.repeat(neededWhitespace)+ labelVal +' '+' '.repeat(neededWhitespace) + nodesMax)
  }

  // update node values if tracer or values change
  if(!firstTime){
    for(n=0; n < nodes.length; n++){
      cy.batch(function(){
      cy.$('node[id =\''  + nodes[n].data.id + '\']')
        .data(nodeVal, nodes[n].data[nodeVal])
      });
    }
  }
}

//show legend
function showLegend(){
  // show legend and update if necessary
  document.getElementById('legend').setAttribute('style','visibility:visible');
}

//show meta-information of nodes by mouseover
function showMetaInfo(){
  if(! noOptn || isJson){
    cy.elements('node').qtip({       // show node attibute value by mouseover
        show: {   
          event: 'mouseover', 
          solo: true,
        },
        content: {text : function(){
          if(!isNaN(parseFloat(this.data()[nodeVal]))&&this.data('genename')){
            if(this.data('symbol') != undefined){
              return '<b>'+ this.data('symbol') +'</b><br>' + 
              '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2) +
              '<br>' + '<b>gene name</b>: ' + this.data('genename')}
            else if(this.data('name') != undefined){
              return '<b>'+ this.data('name')+'</b><br>' +
              '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal] +
              '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2) +
              '<br>' + '<b>gene name</b>: ' + this.data('genename')}
            } //numbers
          else if(!isNaN(parseFloat(this.data()[nodeVal]))&& !this.data('genename')){
            if(this.data('symbol') != undefined){
              return '<b>'+ this.data('symbol') +'</b><br>' + 
              '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2);} //numbers
            else if(this.data('name') != undefined){
              return '<b>'+ this.data('name')+'</b><br>' + 
              '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2);
            }
          }
          else if(this.data('genename')){
            if(this.data('symbol') != undefined){
              return '<b>'+ this.data('symbol') +'</b><br>' + 
              '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal] +
              '<br>' + '<b>gene name</b>: ' + this.data('genename');          //bools
            }
            else if(this.data('name') != undefined){
              return '<b>'+ this.data('name')+'</b><br>' +
              '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal] +
              '<br>' + '<b>gene name</b>: ' + this.data('genename'); 
          }}
          else{
            if(this.data('symbol') != undefined){
              return '<b>'+ this.data('symbol') +'</b><br>' + 
              '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal];
            }
             else if(this.data('name') != undefined){
              return '<b>'+ this.data('name')+'</b><br>' +
              '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal];
          }
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
        },
        });
  }
  else if(!isJson && noOptn){
    cy.elements('node').qtip({       // show node attibute value by mouseover
        show: {   
          event: 'mouseover', 
          solo: true,
        },
        content: {text : function(){
          if(this.data('symbol')){
            return '<b>'+ this.data('symbol') +'</b>'; } //numbers
          else if(this.data('name')){
            return '<b>'+ this.data('name')+'</b>';
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
        },
        });
  }
      cy.elements('edge').qtip({       // show node attibute value by mouseover
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

// optional merging of multiple edges between two nodes
function mergeEdges(){
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
            if(cy.edges()[j].data().id == e.id+'_'+interact){
              //show single edge
              cy.edges('edge[id = "'+e.id+'_'+interact+'"]').style('display', 'element');
              continue loopInteraction;
            }
          }
          // add single edge to graph
          cy.add({
            group: 'edges',
            data: { id:e.id+'_'+interact, source:e.source, target:e.target, interaction:interact },
          });
        }
      }
    }
    showMetaInfo();
  }
  // merge edge
  else if(document.getElementById("mergeEdges").checked){
    for(var i = 0; i < cy.edges().length; i++){
      var edge = cy.edges()[i]
      // show merged edges
      if(edge.hidden()){
        edge.style('display', 'element');
      }
      // hide single edges
      else{
        if(edge.data().id.includes(edge.data().interaction)){
          edge.style('display', 'none');
        }
      }
    }
  }
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
  document.getElementById('nodeShapesAttr').setAttribute('style','visibility:visible');
}

function activateShapes(){
  document.getElementById('nodeShapes').setAttribute('style','visibility:visible');
}
// change node shape of nodes with given attribute
function changeNodeShapes(){
  var shapeAttribute = document.getElementById('nodeShapesAttr').value;
  var shape = document.getElementById('nodeShapes').value;

  if(shapeAttribute == "" || shape == ""){
    return;
  }

  // select nodes with given attribute
  var i = 0;
  var id = "";
  while(i < graphString.length){

    if(graphString[i].includes("node id")){   // get node id
      id = graphString[i].split("\"")[1];
    } 
    else if(id != "" && graphString[i].includes('\"v_'+shapeAttribute+'\">true<')){

      cy.style()
        .selector('node[id ="'+id+'"]')        
        .style('shape', shape)
        .update();

    }
    i++;
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
        container: document.getElementById('legendNodes'),
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
              'font-size': 10
            }
          }
        ]
      });

 
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
  } 
  // test if shape has been used for another attribute
  else if(Object.keys(usedShapes).includes(shape)){
    if(usedShapes[shape] == shapeAttribute) return;
    var replace = confirm("Shape is already used. Do you want to replace "+usedShapes[shape]+" by "+ shapeAttribute+"?")

    // is shape has been used change previous attributes shape back to ellipse
    if(replace){
      delete(usedShapeAttributes[usedShapes[shape]]);
      ycoord = shapeNode.$('node[id ="'+usedShapes[shape]+'"]').position()['y']-35;
      shapeNode.remove('node[id ="'+usedShapes[shape]+'"]');

      var i = 0;
      var id = "";
      while(i < graphString.length){

        if(graphString[i].includes("node id")){   // get node id
          id = graphString[i].split("\"")[1];
        } 
        else if(id != "" && graphString[i].includes('\"v_'+usedShapes[shape]+'\">true<')){

          cy.style()
            .selector('node[id ="'+id+'"]')        
            .style('shape', 'ellipse')
            .update();

        }
        i++;
      }
    }
    else return;

  }
  
  // update shape of a attribute already used
  if (usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    shapeNode.style()
      .selector('node[id ="'+shapeAttribute+'"]')        
      .style('shape', shape)
      .update();
    usedShapeAttributes[shapeAttribute] = shape;
    usedShapes[shape] = shapeAttribute
  }

  // add new shape and attribute
  else if(!isEmpty(usedShapeAttributes) && !usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    ycoord = ycoord + 35;
    usedShapeAttributes[shapeAttribute] = shape;
    shapeNode.add( { group: "nodes", data: { id: shapeAttribute}, position:{'x':80, 'y':ycoord}});
    shapeNode.style()
        .selector('node[id ="'+shapeAttribute+'"]')        
        .style('shape', shape)
        .update();
  }
}

var prevLayout = "";
function changeLayout(){
  var animateLayout = true;
  var selectedLayout = document.getElementById('selectlayout').value;
  if(prevLayout == selectedLayout){
    animateLayout = false;
  }
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
    document.getElementById('selectlayout').value = "dagre (default)";
  }
  prevLayout = JSON.parse(JSON.stringify(selectedLayout));
}

// get graph for gene from Thorsten's database
function getGraphforGene(name){
  var networkInventory;
  var reqNetworks = new XMLHttpRequest();
  reqNetworks.open('GET', 'http://abidocker:48080/sbml4j/networkInventory', false);
  reqNetworks.setRequestHeader('user', 'openMTB')
  reqNetworks.onload = function () {
    networkInventory = JSON.parse(reqNetworks.responseText);
  }
  reqNetworks.send(document);

  var listofGenes;
  var reqListofGenes = new XMLHttpRequest();
  reqListofGenes.open('GET', 'http://abidocker:48080/sbml4j/networkInventory/16c75fe8-7185-46e0-9a02-26dcc925488a/filterOptions', false);
  reqListofGenes.setRequestHeader('user', 'user')
  reqListofGenes.onload = function () {
    listofGenes = JSON.parse(reqListofGenes.responseText).nodeSymbols;
   }
  reqListofGenes.send(document);
  if(listofGenes.includes(name)){
    var responsetxt;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://abidocker:48080/sbml4j/context?baseNetworkUUID=16c75fe8-7185-46e0-9a02-26dcc925488a&gene='+name+'&minSize=1&maxSize=1&format=graphml', false);
    xhr.setRequestHeader('user', 'user')

    xhr.onload = function () {
      responsetxt = xhr.responseText;
     }
    xhr.send(document);
    return responsetxt;
  }

}

// get pathways of selected gene from kegg using entrez id
async function getPathwaysFromKEGG(name) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "https://www.kegg.jp/entry/hsa:" + name);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

/*
	generate a checkbox menu for the 10 most common pathways of all genes in the graph
*/
async function listKEGGPathways(){
  //swap button "Hide"/"show"
  if(document.getElementById('keggpathways').firstChild.data == "Show KEGG Pathways"){
    document.getElementById('keggpathways').firstChild.data  = "Hide KEGG Pathways";

    if(document.getElementById('KEGGpaths').style.visibility == "hidden"){
      document.getElementById('KEGGpaths').style.visibility="visible";
    }
    //get pathways from KEGG, show loader while doing so
    else{
      document.getElementById('KEGGpaths').style.visibility="visible";
      document.getElementById('loader').style.visibility = "visible";
      var pathsCount = [];
      allPaths = [];
      colorschemePaths = [];
      for(var n of nodes){
        if(n["data"]["symbol"]!="legend"){
          if(n["data"]["entrezID"] != undefined){
            var entrezID = n["data"]["entrezID"].toString();
          }
          else if(n["data"]["entrez"] != undefined){
            var entrezID = n["data"]["entrez"].toString();            
          }
          else{
            continue;
          }
          let keggpaths = await getPathwaysFromKEGG(entrezID);
          keggpaths = keggpaths.split("\n")
          var line = 0;
          while(line < keggpaths.length){
            if(keggpaths[line].includes("<nobr>Pathway</nobr>")){
              line++;
              var splitarray =keggpaths[line].split("</td>")
              for(var i = 1; i < splitarray.length-2; i=i+2){
                let hsa = "hsa"+splitarray[i-1].split(">hsa")[1].split("</a>")[0]
                let p = splitarray[i].split("<td>")[1]
                p = hsa+" "+p;
                if(p != undefined){
                  if(typeof allPaths[p] == 'undefined'){
                    allPaths[p]=[];
                  }
                  allPaths[p].push(entrezID);
                  if(isNaN(pathsCount[p])){
                    pathsCount[p]=1; 
                  }
                  else{
                    pathsCount[p]=pathsCount[p]+1;
                  }
                }
              }
              break;
            } 
            else{
              line++;
            }
          }
        }
      }
          // only get top 5 of pathways (most genes in)
      var props = Object.keys(pathsCount).map(function(key) {
        return { key: key, value: this[key] };}, pathsCount);
      props = props.sort(function(p1, p2) { return p2.value - p1.value; });
      var topFive = props.slice(0, 5);
      if(topFive.length == 0){
        alert("No entrezIDs given.")
        document.getElementById('keggpathways').style.visibility = "hidden";
        document.getElementById('loader').style.visibility = "hidden";
        return;
      }
          //show table of pathways
      var tbody = document.getElementById("KEGGpaths");
      var htmlString ="<form> <h3>KEGG Pathways:</h3><br>";
      var colors = ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"]

      for (var i = 0; i < topFive.length; i++) {
        colorschemePaths[topFive[i].key] = colors[i];
        var tr = "<b style='color:"+colors[i]+"'><label><input type='checkbox' value='"+topFive[i].key+"' onclick='highlightKEGGpaths()''>";
          tr += topFive[i].key + " </label><br><br>";
          htmlString += tr;
      }
      htmlString +="</form>"
      tbody.innerHTML = htmlString;
      document.getElementById('loader').style.visibility = "hidden";
    }
  }
  //Hide table, switch button to show
  else {
    document.getElementById('keggpathways').firstChild.data  = "Show KEGG Pathways";
    document.getElementById('KEGGpaths').style.visibility = "hidden";
    document.getElementById('loader').style.visibility = "hidden";
    $('input:checkbox').prop('checked', false);
    layer.resetTransform(ctx);
    ctx.clearRect(0,0,canvas.width, canvas.height);          
    layer.setTransform(ctx);
    ctx.save();
  }
}


//calculate distance between two nodes
Math.getDistance = function( x1, y1, x2, y2 ) {
  var   xs = x2 - x1,
    ys = y2 - y1;   
  xs *= xs;
  ys *= ys;
  return Math.sqrt( xs + ys );
};

//remove elment by value from array
function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

// get neighbored nodes in same pathway for each node
function getNeighbors(cp, cy){
  var g = 0;
  var nearest_groups = {};
  for(var i = 0; i < cp.length-1; i++){
    let renderedPos_i_id = cy.$("node[entrezID ='"+cp[i]+"']").renderedPosition();
    let renderedPos_i = cy.$("node[entrez ='"+cp[i]+"']").renderedPosition();
    if(renderedPos_i_id){
      var position = renderedPos_i_id;
    }
    else if(renderedPos_i){
      var position = renderedPos_i;
    }
    else{
      continue;
    }
    for(var j = 1; j < cp.length; j++){
      let renderedPos_j_id = cy.$("node[entrezID ='"+cp[j]+"']").renderedPosition();
      let renderedPos_j = cy.$("node[entrez ='"+cp[j]+"']").renderedPosition();
      if(renderedPos_j_id){
        var pos_m = renderedPos_j_id;
      }
      else if(renderedPos_j){
        var pos_m = renderedPos_j;
      }
      else{
        continue;
      }
      let dist = Math.getDistance(position['x'], position['y'], pos_m['x'], pos_m['y']);
      if(dist < (0.16501650165016502*cy.width()) && dist > 0){
        nearest_groups[g] = new Set()
        nearest_groups[g].add(cp[i]);
        nearest_groups[g].add(cp[j]);
      }
    }
    g += 1;
  }
  return nearest_groups;
}

// merge groups if they intersect
function mergeNodeGroups(nearest_groups, cp_copy){
  var merged_nodes={};
  var m = 0;
  var nearest_groups_values = Object.values(nearest_groups);
  for(let group1 of nearest_groups_values){
    var new_group = new Set();
    for(let group2 of nearest_groups_values){
      let intersection = new Set([...group1].filter(x => group2.has(x)));
      if(intersection.size > 0){
        let union = new Set([...group1, ...group2]);
        new_group = new Set([...new_group, ...union]);
        cp_copy = new Set([...cp_copy].filter(x => !union.has(x)));
      }
    }
    var cur_group = Array.from(new_group);
    var added = false;

    if(Object.keys(merged_nodes).length == 0){
      merged_nodes[m] = new Set();
      merged_nodes[m]= new_group;
    }
    else{
      for(let k of Object.keys(merged_nodes)){
        if(cur_group.some(x=> merged_nodes[k].has(x))){
          merged_nodes[k] = new Set([...merged_nodes[k], ...cur_group]);
          added = true;
          break;
        }
      }
      if(!added){
        m += 1;
        merged_nodes[m] = new Set([...cur_group]);
      }
    }
  }
  for(let single of cp_copy){
    m+=1;
    merged_nodes[m]=new Set([single]);
  }

  // check again if groups can be further uninionized
  var merged_nodes_new = {};
  var new_ind = 0;
  merged_nodes_new[new_ind] = new Set();
  for(let k of Object.keys(merged_nodes)){
    let intersection = new Set([...merged_nodes[k]].filter(x => merged_nodes_new[new_ind].has(x)));
    if(intersection.size > 0){
      var union = new Set([...merged_nodes[k], ...merged_nodes_new[new_ind]]);
      merged_nodes_new[new_ind] = new Set([...union]);
    }
    else{
      if(!merged_nodes_new[new_ind].size == 0){
        new_ind += 1;
        merged_nodes_new[new_ind] = merged_nodes[k];          
      }
      else{
        merged_nodes_new[new_ind] = merged_nodes[k];
      }
    }
  }
  return merged_nodes_new;
}

// Pass the checkbox name to the function
function getCheckedBoxes(chkboxName) {
  var checkboxes = chkboxName;
  var checkboxesChecked = [];
  // loop over them all
  for (var i=0; i<checkboxes.length; i++) {
     // And stick the checked ones onto an array...
     if (checkboxes[i].checked && checkboxes[i].value != "on") {
        checkboxesChecked.push(checkboxes[i].value);
     }
  }
  // Return the array if it is non-empty, or null
  return checkboxesChecked.length > 0 ? checkboxesChecked : null;
}

// draw a rectangle at given position with given sidelengths and colored by pathway
function drawRect(position, nodeWidth, side_x, side_y, path){
    ctx.beginPath();
    ctx.rect(position['x']-(0.5*nodeWidth), position['y']-(0.5*nodeWidth), side_x, side_y);
    ctx.fillStyle =colorschemePaths[path];
    ctx.fill();
    ctx.closePath();
}

// draw rectangles highlighting the selected pathways
function drawPathwayRectangles(){
  var allCheckedPaths = getCheckedBoxes($('input:checkbox'));
  if(allCheckedPaths){
    for(var path of allCheckedPaths){
        var cp = [... allPaths[path]];
        //get neighbored nodes in same pathway for each node
        var nearest_groups = getNeighbors(cp, cy);

        // merge group of neighboring nodes if they intersect
        var merged_nodes = mergeNodeGroups(nearest_groups, cp);
        //mark connected nodes in pathway
        ctx.globalAlpha = 0.6;
        for(var grouped_nodes of Object.values(merged_nodes)){
          // var centroid_x = 0;
          // var centroid_y = 0;
          var max_dist_x = 0;
          var max_dist_y = 0;
          var most_x=100000;
          var most_y=100000;
          // multiple nodes in one rectangle
          if(grouped_nodes.size > 1){
            for(let n of grouped_nodes){
              var position = cy.$("node[entrezID ='"+n+"']").position();
              if(position == undefined){
                position = cy.$("node[entrez ='"+n+"']").position();
              }
              for(let m of grouped_nodes){
                var pos_m = cy.$("node[entrezID ='"+m+"']").position()
                if(pos_m  == undefined){
                  pos_m = cy.$("node[entrez ='"+m+"']").position()                 
                }

                let dist_x = Math.abs(position['x'] -  pos_m['x']);
                if(dist_x >= max_dist_x){
                  max_dist_x = dist_x
                  if(position['x'] <= pos_m['x'] && position['x'] < most_x){
                    most_x = position['x'];
                  }
                  else if(position['x'] > pos_m['x'] && pos_m['x'] < most_x){
                    most_x = pos_m['x'];
                  }
                }
                let dist_y = Math.abs(position['y'] -  pos_m['y']);
                if(dist_y >= max_dist_y){
                  max_dist_y = dist_y
                  if(position['y'] <= pos_m['y'] && position['y'] < most_y){
                    most_y = position['y'];
                  }
                  else if(position['y'] > pos_m['y'] && pos_m['y'] < most_y){
                    most_y = pos_m['y'];
                  }
                }
              }
            }
            if(cy.$("node[entrezID ='"+[...grouped_nodes][0]+"']").length != 0){
              var renderedWidth = cy.$("node[entrezID ='"+[...grouped_nodes][0]+"']").width();              
            }
            else{
              var renderedWidth = cy.$("node[entrez ='"+[...grouped_nodes][0]+"']").width();              
            }
            max_dist_x = (max_dist_x + renderedWidth);
            max_dist_y = (max_dist_y + renderedWidth);

            // if nodes lay on one line, set sides to node width
            if(max_dist_x==0){
              max_dist_x = renderedWidth;
            }
            if(max_dist_y==0){
              max_dist_y = renderedWidth;
            }
            centroid = {"x": most_x, "y":most_y}//{"x":(centroid_x/grouped_nodes.size), "y":(centroid_y/grouped_nodes.size)};
            drawRect(centroid, renderedWidth, max_dist_x, max_dist_y, path)           
          }

          // single node in square
          else if(grouped_nodes.size == 1){
            var k = [...grouped_nodes][0];
            let renderedPos_id = cy.$("node[entrezID ='"+k+"']").position();
            let renderedPos = cy.$("node[entrez ='"+k+"']").position();
            if(renderedPos_id){
              var position = renderedPos_id;
              var side = (cy.$("node[entrezID ='"+k+"']").width()/Math.sqrt(2))*1.7;
              drawRect(position, side, side, side, path);
            }
            else if(renderedPos){
              var position = renderedPos;
              var side = (cy.$("node[entrez ='"+k+"']").width()/Math.sqrt(2))*1.7;
              drawRect(position, side, side, side, path);
            }
          }
        }
      }
    }
}

/*
  to highlight a selected KEGG pathway, draw a rectangle around nodes contained in the pathway. Nodes that are close to each other on screen are in the same rectangle.
*/
function highlightKEGGpaths(){
  ctx.clearRect(0,0,canvas.width, canvas.height);
  cy.on("render cyCanvas.resize", evt => {
          layer.resetTransform(ctx);
          ctx.clearRect(0,0,canvas.width, canvas.height);          
          layer.setTransform(ctx);
          ctx.save();
      drawPathwayRectangles();
    ctx.restore();
  });
  cy.zoom(cy.zoom()*1.000000000000001);
}

/* 
  download of graph
*/

function downloadName(ext){
  outputName = document.getElementById('outputName').value;
  if(outputName != "Download File name"){
    return outputName + ext;
  }
  else{
    return path.replace(".graphml", "_") + '_' + nodeVal + ext;
  }
}

function downloadPNG(){
  var png64 = cy.png();
  $('#downloadPNG').attr('href', png64);
  var download = document.createElement('a');
  download.href = 'data:image/png;base64;'+png64;
  document.body.appendChild(download); // required for firefox
  download.download = downloadName('.png')
  download.click();
}

function downloadSVG(){
  outputName = document.getElementById('outputName').value;
  var svgContent = cy.svg({scale: 1, full: true});
  var svgBlob = new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"});
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download =  downloadName(".svg");
  document.body.appendChild(downloadLink);
  downloadLink.click(); 
}

function downloadJSON(){
  outputName = document.getElementById('outputName').value;
  var json = JSON.stringify(cy.json());
  $('#downloadJSON').attr('href', json);
  var download = document.createElement('a');
  download.href = 'data:text/json;charset=utf-8,'+encodeURIComponent(json);
  document.body.appendChild(download); // required for firefox
  download.download = downloadName('.json');
  download.click();
}

function downloadPDF () {
    const domElement = document.getElementById('everything');
    var divHeight = $('#cy').height();
    var divWidth = $('#cy').width();
    var ratio = divHeight / divWidth;
  
    var doc = new jsPDF("l", "mm", "a4");
    var width = doc.internal.pageSize.getWidth()-20;
    var height = ratio * width;

    html2canvas($("#everything").get(0), { onclone: (document) => {
      document.getElementById('downloadPart').style.visibility = 'hidden' 
      document.getElementById('resetLayout').style.visibility = 'hidden'
      document.getElementById('description').style.visibility = 'hidden'
      document.getElementById('loadGraphml').style.visibility = 'hidden'
      document.getElementById('keggpathways').style.visibility = 'hidden'
      if(!noDrpShapes){
        document.getElementById('nodeShapesAttr').style.visibility = 'hidden'
        document.getElementById('nodeShapes').style.visibility = 'hidden'
      }
    }}).then(function(canvas){
    var imgData = canvas.toDataURL('image/png');

    doc.addImage(imgData, 'PNG', 0, 0, width, height); 
 
    doc.save(downloadName('.pdf'));
  });
}

