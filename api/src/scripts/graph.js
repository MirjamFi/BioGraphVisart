/*
  create a graph with Cytoscape
*/

/*
visualize a graph from .graphml-file
*/
var nodeValRaw;

function visualize() {
  // $('#graphName').attr("disabled", true);
  // $('#loadGraphml').attr("disabled", true);
  if(!noAttr){
    nodeValRaw = document.getElementById('values').value;
    let nodeValSplit = nodeValRaw.split("(");
    let nodeValJoin = nodeValSplit.join("_");
    nodeValSplit = nodeValJoin.split(")");
    nodeValJoin = nodeValSplit.join("");
    nodeValSplit = nodeValJoin.split("-");
    nodeVal = nodeValSplit.join("_");
  }
  // $('#gfiles').attr("disabled", true);
  // get nodes and edges
  nodeValuesNum = getNodesAndEdges();

  nodeValuesNum = transform01toTF(nodeValuesNum);

  if(!noAttr){
    // set min and max for legend
    legendsRange(nodeValuesNum);
  };
  // add nodes and edges to graph
  addNodesAndEdges();
  calculateLayout();

  showLegend();

  $('#downloadPNG').removeAttr('disabled');
  $('#downloadSVG').removeAttr('disabled');
  $('#downloadJSON').removeAttr('disabled');

  document.getElementById('downloadPart').style.visibility = "visible";

  showMetaInfo();
  if(! noAttr){
    activateNodeShapeChange();
  }
}

//get information of nodes ande edges
function getNodesAndEdges(){
  nodes = [];
  edges = [];
  nodeValuesNum = [];
  nodeValuesNum = [];
  attributesTypes = {};


  var regExp = /\">(.*?)\</; // get symbol name between > <

  for (var i = 0; i <= graphString.length - 1; i++) {
    if(graphString[i].includes("attr.type=")){
      attributesTypes[graphString[i].split(" ")[3].split("\"")[1]] = graphString[i].split(" ")[6].split("\"")[1];
    }
    if(graphString[i].includes("node id")){   // get node id
      var curNode = {};
      if(graphString[i].includes("graph id")){
        curNode.id = graphString[i].split("\"")[5];
      }
      else{
        curNode.id = graphString[i].split("\"")[1]  ;
      }
      nodes.push({data: curNode});
    }
    if(!isEmpty(curNode)){
      if(graphString[i].includes("symbol\"\>")){  // get symbol of node
        var symbol = regExp.exec(graphString[i])[1];
        curNode.symbol = symbol;
      }
      if(graphString[i].includes("\"v_"+nodeValRaw+"\"\>")){
        var val = regExp.exec(graphString[i])[1]; // if availabe get node value
        if(!isNaN(parseFloat(val))){
          attrID = graphString[i].split(" ")[7].split("\"")[1];
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
      if(graphString[i].includes("v_gene_name")){       // get gene names
        var genename = graphString[i].split("\>")[1].split("\<")[0];
        curNode.genename = genename;
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
        var interact = graphString[i].split("\">")[2].split("<")[0]; 
        curEdge.interaction = interact;
      }
      curEdge.id = curEdge.id +'_'+ curEdge.interaction;
      edges.push({data: curEdge} );
    }
  }
  if(! noAttr){
    var legendNode = {};
    legendNode.id = "l1";
    legendNode.symbol = "legend";
    nodes.push({data:legendNode});
  }
  return nodeValuesNum;
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
      nodesMax = nodeValuesNum.reduce(function(a, b) {
            return parseFloat(Math.max(a, b).toFixed(2));
          });
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
    layout: {
    name: 'dagre'
  },
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
          'label': 'data(symbol)',
          "text-valign" : "center",
          "text-halign" : "center",
          "font-size" : 10,
          "color":"black"
      }},

      // attributes with boolean
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

      // style edges
      {selector: 'edge',
        style: {
          // 'target-arrow-shape': 'triangle',
          'arrow-scale' : 2,
          'curve-style' : 'bezier',
          // 'label':'data(interactionShort)',
          'font-size':16,
          'text-rotation':'autorotate',
          'font-weight':800
          
        }},
        {selector: 'edge[interaction = \'activaion\']',
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
            // 'target-arrow-shape': '',
        }},
        {selector: 'edge[interaction = \'dissociation\']',
          style: {
            // 'target-arrow-shape': '',
        }},
      {selector: 'edge[interaction = \'compound\']',
        style: {
          'target-arrow-shape': 'diamond',
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
          'target-arrow-shape': 'triangle-backcurve',
          'target-label':'+p',
          'target-text-offset':20
        }},
      {selector: 'edge[interaction = \'dephosphorylation\']',
          style: {
            'target-arrow-shape': 'triangle-backcurve',
            'target-label':'-p',
          'target-text-offset':20
        }},
      {selector: 'edge[interaction = \'glycosylation\']',
          style: {
           'target-arrow-shape': 'triangle-backcurve',
           'target-label':'+g',
          'target-text-offset':20
        }},      
      {selector: 'edge[interaction = \'ubiquitination\']',
          style: {
            'target-arrow-shape': 'triangle-backcurve',
            'target-label':'+u',
          'target-text-offset':20
        }},
      {selector: 'edge[interaction = \'methylation\']',
          style: {
            'target-arrow-shape': 'triangle-backcurve',
            'target-label':'+m',
          'target-text-offset':20
        }}
      ]
  });
  cy.nodes().noOverlap({ padding: 5 })
  if(! noAttr){
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
      .style('color', 'black')
      .style('background-height',50)
      .style('background-width',200)
      .style('background-position-y','100%')
      .style('shape', 'rectangle')
      .style('width',200)
      .style('height',50)
      .style('border-width',1)
      .style('label', nodesMin+' '+' '.repeat(neededWhitespace)+ labelVal +' '+' '.repeat(neededWhitespace) + nodesMax)
      .style('text-valign' , 'bottom')
      .style('text-max-width', 200)
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

//calculate graph layout (only once)
function calculateLayout(){

      cy.layout({
      name: 'dagre',
        // Whether to fit the network view after when done
      fit: true,

      // Padding on fit
      padding: 30
        }).run();
      $('#download').removeAttr('disabled');

      oldMin = nodesMin;
      oldMax = nodesMax;
}

//show legend
function showLegend(){
  // show legend and update if necessary
  document.getElementById('legend').setAttribute('style','visibility:visible');
}

//show meta-information of nodes by mouseover
function showMetaInfo(){
  if(! noAttr){
  cy.elements('node').qtip({       // show node attibute value by mouseover
      show: {   
        event: 'mouseover', 
        solo: true,
      },
      content: {text : function(){
        var nodeValMeta = nodeVal.split("\\").join("");
        if(!isNaN(parseFloat(this.data()[nodeValMeta]))&&this.data('genename')){
          return '<b>'+nodeValMeta +'</b>: ' + parseFloat(this.data()[nodeValMeta]).toFixed(2) +
          '<br>' + '<b>gene name</b>: ' + this.data('genename'); } //numbers
        else if(!isNaN(parseFloat(this.data()[nodeValMeta]))&& !this.data('genename')){
          return '<b>'+nodeValMeta +'</b>: ' + parseFloat(this.data()[nodeValMeta]).toFixed(2);
        }
        else if(this.data('genename')){
          return '<b>'+nodeValMeta +'</b>: '+ this.data()[nodeValMeta] +
          '<br>' + '<b>gene name</b>: ' + this.data('genename');          //bools
        }
        else{
          return '<b>'+nodeValMeta +'</b>: '+ this.data()[nodeValMeta];
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
  document.getElementById('nodeShapes').setAttribute('style','visibility:visible');
}

/*
  change node shape of nodes with given attribute
*/
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

/* 
  download png of graph
*/
function downloadPNG(){
  outputName = document.getElementById('outputName').value;
  var png64 = cy.png({"maxWidth": 7000,"maxHeight": 7000});
  $('#downloadPNG').attr('href', png64);
  var download = document.createElement('a');
  download.href = 'data:image/png;base64;'+png64;
  if(outputName != "File name"){
    download.download = outputName + '.png';
  }
  else{
    alert("Download: Please give a file name.")
  }
  download.click();
}


function downloadSVG(){
  outputName = document.getElementById('outputName').value;
  var svgContent = cy.svg({scale: 1, full: true});
  if(outputName != "File name"){
    saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), outputName +".svg");
  }
  else{
     alert("Download: Please give a file name.")
  }  
}

function downloadJSON(){
  outputName = document.getElementById('outputName').value;
  var json = JSON.stringify(cy.json());
  $('#downloadJSON').attr('href', json);
  var download = document.createElement('a');
  download.href = 'data:text/json;charset=utf-8,'+encodeURIComponent(json);
  if(outputName != "File name"){
    download.download = outputName + '.json';
  }
  else{
    alert("Download: Please give a file name.")
  }
  download.click();
}


/*
reset view (zoom, position)
*/
function resetLayout(){
  cy.layout({
      name: 'dagre',
    }).run();
};
