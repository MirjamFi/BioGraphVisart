/*
  create a graph with Cytoscape
*/
var graphLeft;
var graphRight;
var path;
var nodes;
var colorschemePathsLeft = [];
var colorschemePathsRight = [];
var colorschemePathsMerge = [];
var leftEdges = [];
var rightEdges = [];
/*
visualize a graph from .graphml-file
*/
function visualize() { 
  $(window).scroll(function() {
    if($(window).scrollTop() <= 700){
      $("#legend_heatmap").css({
        "top": 760 +"px",
        "left": ($(window).scrollLeft()) + "px"
      });
    }
    else if($(window).scrollTop() > 710 ){ //&& $(window).scrollTop() < document.body.offsetHeight
      $("#legend_heatmap").css({
        "top": 200+($(window).scrollTop()) + "px",
        "left": ($(window).scrollLeft()) + "px"
      });
    }
    else if (window.scrollY + window.innerHeight == document.body.scrollHeight) {
        $("#legend_heatmap").css({
          "top": 500+($(window).scrollTop()) + "px",
          "left": ($(window).scrollLeft()) + "px"
      });
    }
  });

  path = document.getElementById('directory').value;
  nodeVal = document.getElementById('values').value;

  if(!!right){
    var cys = ['cyLeft', 'cyRight'];
  }
  else{
    var cys = ['cyLeft'];
    // document.getElementById("legendGraphsRight").innerHTML="";
    document.getElementById('downloadPartRight').style.visibility = "hidden";
    document.getElementById('resetRight').style.visibility = "hidden";
    document.getElementById('right').style.visibility = "hidden";
    document.getElementById('keggpathwaysRight').style.visibility = "hidden";
  }
  cys.forEach(function(cyO){
    // get nodes and edges 
    if(cyO == 'cyLeft'){
      graphLeft= createCyObject(cyO, -1, 1);
      leftGraph = true;
      graphString = graphStringLeft;
      leftNodeValuesNum =  getNodesAndEdges(graphLeft, graphString);
      leftNodeValuesNum = transform01toTF(leftNodeValuesNum);
      // set min and max for legend  and add nodes and edges to graph
      var leftRange = legendsRange(leftNodesMin, leftNodesMax, leftOldMin, leftOldMax, leftFirstTime, leftNodeValuesNum);
      leftNodesMin = leftRange[0];
      leftNodesMax = leftRange[1];
      leftOldMin = leftRange[2];
      leftOldMax = leftRange[3];
      addNodesAndEdges(graphLeft,leftFirstTime, leftNodesMin, leftNodesMax);
      var leftLayout = calculateLayout(graphLeft, leftOldMin, leftOldMax, leftNodesMin, leftNodesMax, leftFirstTime);
      leftOldMin = leftLayout[0];
      leftOldMax = leftLayout[1];
      leftFirstTime = leftLayout[2];
      //document.getElementById("merged_graph_legend").setAttribute('style','visibility:hidden');
      document.getElementById('downloadPDF').style.visibility = "visible";
      document.getElementById('outputName').style.visibility = "visible";
      document.getElementById('downloadPDF').disabled = false;
      document.getElementById('resetLeft').style.visibility = "visible";
      document.getElementById('downloadPartLeft').style.visibility = "visible";
      document.getElementById('downloadLeftSVG').disabled = false;
      document.getElementById('downloadLeftPNG').disabled = false;
      document.getElementById('keggpathwaysLeft').style.visibility = "visible";
      document.getElementById('KEGGpathsButtonLeft').style.visibility ="visible";
      showMetaInfo(graphLeft);
      // set background layer to hoghlight pathways
      layerLeft = graphLeft.cyCanvas({
              zIndex: -1,
            });
      canvasLeft = layerLeft.getCanvas();
      ctxLeft = canvasLeft.getContext('2d');
      var bLeft = $.extend( [], document.getElementById('keggpathwaysLeft').firstChild.data ).join("");
      if(bLeft == "Hide KEGG Pathways" && allPathsLeft){
        highlightKEGGpaths(ctxLeft, canvasLeft, graphLeft, layerLeft, "Left", allPathsLeft, colorschemePathsLeft);
      }
      else if(bLeft == "Show KEGG Pathways" && allPathsLeft){
        document.getElementById('KEGGpathsLeft').style.visibility ="hidden";
      }
    }
    else if(cyO = 'cyRight'){
      graphRight= createCyObject(cyO, -1, 1);
      leftGraph = false;
      graphString = graphStringRight;
      rightNodeValuesNum = getNodesAndEdges(graphRight, graphString);
      rightNodeValuesNum = transform01toTF(rightNodeValuesNum);
      // set min and max for legend  and add nodes and edges to graph
      var rightRange = legendsRange(rightNodesMin, rightNodesMax, rightOldMin, rightOldMax, rightFirstTime, rightNodeValuesNum);
      rightNodesMin = rightRange[0];
      rightNodesMax = rightRange[1];
      rightOldMin = rightRange[2];
      rightOldMax = rightRange[3];
      addNodesAndEdges(graphRight,rightFirstTime, rightNodesMin, rightNodesMax);
      var rightLayout = calculateLayout(graphRight, rightOldMin, rightOldMax, rightNodesMin, rightNodesMax, rightFirstTime);
      rightOldMin = rightLayout[0];
      rightOldMax = rightLayout[1];
      rightFirstTime = rightLayout[2];
      // showLegend(rightNodesMin, rightNodesMax, graphRight);
      document.getElementById('cyRight').style.visibility = "visible";
      document.getElementById('downloadPartRight').style.visibility = "visible";
      document.getElementById('resetRight').style.visibility = "visible";
      document.getElementById('downloadRightSVG').disabled = false;
      document.getElementById('downloadRightPNG').disabled = false;
      document.getElementById('keggpathwaysRight').style.visibility = "visible";
      document.getElementById('KEGGpathsButtonRight').style.visibility ="visible";
      document.getElementById('right').style.visibility = "visibile";
      document.getElementById('rightID').style.visibility = "visible";
      showMetaInfo(graphRight);
      // set background layer to hoghlight pathways
      layerRight = graphRight.cyCanvas({
              zIndex: -1,
            });
      canvasRight = layerRight.getCanvas();
      ctxRight = canvasRight.getContext('2d');
      var bRight = $.extend( [], document.getElementById('keggpathwaysRight').firstChild.data ).join("");
      if(bRight == "Hide KEGG Pathways" && allPathsRight){
        highlightKEGGpaths(ctxRight, canvasRight, graphRight,layerRight, "Right", allPathsRight, colorschemePathsRight);
      }
      else if(bRight == "Show KEGG Pathways" && allPathsRight){
        document.getElementById('KEGGpathsRight').style.visibility ="hidden";
      }
    }
  });
  document.getElementById('legend_heatmap').setAttribute('style','visibility:visible');
  //document.getElementById("merged_graph").innerHTML = "";
  if(!!right){
      merge();
  }
  //activateNodeShapeChange();
}

var leftNodes, rightNodes, leftEdges, rightEdges;
//get information of nodes ande edges
function getNodesAndEdges(cyObject, graphString){
  nodes = [];
  edges = [];
  nodeValuesNum = [];
  attributesTypes = {};
  if(leftGraph){
      leftNodes = [];
  }
  else{
      rightNodes = [];
  }

  var prevId = "";
  var pos = 0;

  var regExp = /\>([^)]+)\</; // get symbol name between > <

  for (var i = 0; i <= graphString.length - 1; i++) {
    if(graphString[i].includes("attr.type=")){
      attributesTypes[graphString[i].split("\"")[1]] = graphString[i].split("\"")[7];
    }

    if(graphString[i].includes("node id")){   // get node id
      var curNode = {};
      curNode.id = graphString[i].split("\"")[1]  ;
      if(leftGraph){
        curNode.graph = "g1";
        leftNodes.push({data: curNode});
      }
      else{
        curNode.graph = "g2";
        rightNodes.push({data: curNode});
      }
      nodes.push({data: curNode});
    }
    if(!isEmpty(curNode)){
      if(graphString[i].includes("symbol\"\>")){  // get symbol of node
        var symbol = regExp.exec(graphString[i])[1];
        curNode.symbol = symbol;
      }
      if(graphString[i].includes("\"v_"+nodeVal+"\"\>")){
        var val = regExp.exec(graphString[i])[1]; // if availabe get node value
        if(!isNaN(parseFloat(val))){
          attrID = graphString[i].split(" ")[7].split("\"")[1];
          currVal = {};
          currVal.val = parseFloat(val);
          currVal.attr = attributesTypes[attrID];;
          nodeValuesNum.push(currVal);
        }
        else if(val === "false" || val === "true"){
          currVal = {};
          currVal.val = val;
          currVal.attr = "boolean";
          nodeValuesNum.push(currVal);
        }
        curNode.val = currVal.val;
      }
      /*if(isEmpty(curNode.val)){
        curNode.val = 0;
      }*/
      if(graphString[i].includes("v_gene_name")){       // get gene names
        var genename = graphString[i].split("\>")[1].split("\<")[0];
        curNode.genename = genename;
      }
      if(graphString[i].includes("v_entrez")){
        var entrezID = graphString[i].split("\>")[1].split("\<")[0];
        curNode.entrezID = entrezID;
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
            if(leftGraph){
              leftEdges.splice(pos-1,1)
            }
            else{
              rightEdges.splice(pos-1,1)
            }
            edges.splice(pos-1,1)
            pos = pos -1
          }
          else{
            edges[pos-1].data.interaction.push(interact)
            if(leftGraph){
              if(!Array.isArray(leftEdges[pos-1].data.interaction)){
                leftEdges[pos-1].data.interaction = [leftEdges[pos-1].data.interaction]
              }
              leftEdges[pos-1].data.interaction.push(interact);
            }
            else if(rightEdges){
              if(!Array.isArray(rightEdges[pos-1].data.interaction)){
                rightEdges[pos-1].data.interaction = [rightEdges[pos-1].data.interaction]
              }
              rightEdges[pos-1].data.interaction.push(interact)
            }
            continue;
          }
        }
      else{
        curEdge.interaction = interact;
      }
      if(leftGraph){
        curEdge.graph = "g1";
        leftEdges.push({data: curEdge});
      }
      else{
        curEdge.graph = "g2";
        rightEdges.push({data: curEdge});
      }
      edges.push({data: curEdge} );

      prevId = curEdge.id;
      pos = pos +1;
      }
    }
  }
  var legendNode = {};
    legendNode.id = "l1";
    legendNode.symbol = "legend";
    nodes.push({data:legendNode});
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
      // boolean attributes and boolean atribtes tored as 0 or 1
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
        //nodeEntry.data.val = Object.entries(nodeValuesNumT[i])[0][1];
        nodeValues.push(Object.entries(nodeValuesNumT[i])[0][1])
      }
    }
  }
  if(lenNodeValues == 0){
    return ["empty"];
  } 
  
  return nodeValues;
  
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
function addNodesAndEdges(cyObject, firstTime, nodesMin, nodesMax){

  if(loadGraphCount > 1){
    cyObject.elements().remove();
    if(cyObject === 'cyLeft'){
      leftFirstTime = false;
    }
    else if(cyObject === 'cyRight'){
      rightFirstTime = false;
    }
    loadGraphCount = 0;
  }
  cyObject.add(nodes);
  cyObject.add(edges);
  cyObject.nodes().noOverlap({ padding: 5 });
  // calculate label position for legend and style legend
  var fontSize = 10;
  var labelVal = nodeVal;
  var whitespace = getTextWidth(' ', fontSize +" arial");
  var minspace = getTextWidth(nodesMin, fontSize +" arial");
  var valspace = getTextWidth(labelVal, fontSize +" arial");
  var maxspace = getTextWidth(nodesMax, fontSize +" arial");
  var neededWhitespace = ((170-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
  if(neededWhitespace <= 0){

    while(neededWhitespace <= 0){
      labelVal = labelVal.slice(0, -1);
      valspace = getTextWidth(labelVal+'...', fontSize +" arial");

      neededWhitespace = ((170-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
    }
    labelVal = labelVal+'...';
  }

  if(!isNaN(nodesMin)){
    cyObject.$('node[id = "l1"]')
      .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnOTExIgogICB3aWR0aD0iNTIuOTE2NjY4bW0iCiAgIGhlaWdodD0iMTMuMjI5MTY3bW0iCiAgIHZpZXdCb3g9IjAgMCAyMDAuMDAwMDEgNTAuMDAwMDAzIgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmQyLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTkxNyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGRlZnMKICAgICBpZD0iZGVmczkxNSI+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ4MTEiPgogICAgICA8c3RvcAogICAgICAgICBpZD0ic3RvcDQ4MDkiCiAgICAgICAgIG9mZnNldD0iMCIKICAgICAgICAgc3R5bGU9InN0b3AtY29sb3I6I2Q1MDAwMDtzdG9wLW9wYWNpdHk6MDsiIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIGlkPSJzdG9wNDgwNyIKICAgICAgICAgb2Zmc2V0PSIxIgogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojZDUwMDAwO3N0b3Atb3BhY2l0eToxOyIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ3MzEiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDQ3MjciIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDZjZjA7c3RvcC1vcGFjaXR5OjA7IgogICAgICAgICBvZmZzZXQ9IjEiCiAgICAgICAgIGlkPSJzdG9wNDcyOSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ3MzEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0NzMzIgogICAgICAgeDE9Ii0wLjE3MjUzNzg5IgogICAgICAgeTE9IjI1LjA0MjMwNyIKICAgICAgIHgyPSIxMDAuMDA3MzEiCiAgICAgICB5Mj0iMjUuMjIyMTYyIgogICAgICAgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiCiAgICAgICBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMTcyNTI4MTMsLTUwLjA0MjMwNSkiIC8+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ4MTEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0ODEzIgogICAgICAgeDE9IjEwMC43MTk0MiIKICAgICAgIHkxPSI3OC41OTI4ODgiCiAgICAgICB4Mj0iMTk5LjgyMDE0IgogICAgICAgeTI9Ijc4LjA1MzMyMiIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIgogICAgICAgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwLjE3OTg0ODEzLC01My4wNTMzMjIpIiAvPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE2NTYiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTE0OCIKICAgICBpZD0ibmFtZWR2aWV3OTEzIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICB1bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6c25hcC1nbG9iYWw9InRydWUiCiAgICAgaW5rc2NhcGU6bG9ja2d1aWRlcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ub2Rlcz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW90aGVycz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW9iamVjdC1taWRwb2ludHM9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtY2VudGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTpzbmFwLXRleHQtYmFzZWxpbmU9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtcGFnZT0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ncmlkcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC10by1ndWlkZXM9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjUuNTYiCiAgICAgaW5rc2NhcGU6Y3g9Ijk5LjgyMDEzNyIKICAgICBpbmtzY2FwZTpjeT0iMjQuMTAwNzA2IgogICAgIGlua3NjYXBlOndpbmRvdy14PSI0OTgiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjEzNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzkxMSIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI0NCIKICAgICB3aWR0aD0iNTY2IgogICAgIGhlaWdodD0iNjAiCiAgICAgeD0iLTEuMjAxMjQ4MiIKICAgICB5PSI3MjUuNDE1NzEiIC8+CiAgPHJlY3QKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icmVjdDMyNDYiCiAgICAgd2lkdGg9IjkuNjE2NTA0NyIKICAgICBoZWlnaHQ9IjE1My44NjQwNyIKICAgICB4PSIzNjIuODUyMTciCiAgICAgeT0iNTg2LjIxNjY3IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjQ4IgogICAgIHdpZHRoPSI0NTMuMzQ5NTIiCiAgICAgaGVpZ2h0PSIxNTcuOTg1NDQiCiAgICAgeD0iMi45MjAxMDUiCiAgICAgeT0iNDU3LjA4MDc1IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjUwIgogICAgIHdpZHRoPSI2OTUuMTM1OTMiCiAgICAgaGVpZ2h0PSIyMDguODE1NTQiCiAgICAgeD0iLTEwOC4zNTY2IgogICAgIHk9IjQzMC45Nzg4MiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI1MiIKICAgICB3aWR0aD0iNTcxLjQ5NTEyIgogICAgIGhlaWdodD0iMjc3LjUwNDg1IgogICAgIHg9Ii04LjA3MDE5MDQiCiAgICAgeT0iMTAwNi41OTUzIiAvPgogIDxlbGxpcHNlCiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InBhdGgzMjU0IgogICAgIGN4PSIxNjAuOTA1NTMiCiAgICAgY3k9IjM4OC4zOTE0OCIKICAgICByeD0iOTcuNTM4ODM0IgogICAgIHJ5PSIxMjUuMDE0NTYiIC8+CiAgPGVsbGlwc2UKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icGF0aDMyNTYiCiAgICAgY3g9IjEwMi41MTk2MSIKICAgICBjeT0iNDMwLjI5MTkzIgogICAgIHJ4PSIyMzYuOTc4MTUiCiAgICAgcnk9IjE3Ni41MzE1NiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDp1cmwoI2xpbmVhckdyYWRpZW50NDczMyk7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm8iCiAgICAgaWQ9InJlY3Q0NzE3IgogICAgIHdpZHRoPSIyMDAiCiAgICAgaGVpZ2h0PSI1MCIKICAgICB4PSIwIgogICAgIHk9Ii01MCIKICAgICB0cmFuc2Zvcm09InNjYWxlKDEsLTEpIiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOnVybCgjbGluZWFyR3JhZGllbnQ0ODEzKTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgIGlkPSJyZWN0NDgwNSIKICAgICB3aWR0aD0iMjAwIgogICAgIGhlaWdodD0iNTAiCiAgICAgeD0iMCIKICAgICB5PSIwIiAvPgo8L3N2Zz4K')
  }
  if(isNaN(nodesMin)){
    cyObject.$('node[id = "l1"]')
      .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpvc2I9Imh0dHA6Ly93d3cub3BlbnN3YXRjaGJvb2sub3JnL3VyaS8yMDA5L29zYiIKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjE5OS45OTk5OG1tIgogICBoZWlnaHQ9IjUwbW0iCiAgIHZpZXdCb3g9IjAgMCAxOTkuOTk5OTggNTAiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiA1YzNlODBkLCAyMDE3LTA4LTA2IgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmRfYm9vbC5zdmciPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyIj4KICAgIDxsaW5lYXJHcmFkaWVudAogICAgICAgaWQ9ImxpbmVhckdyYWRpZW50MjI3NSIKICAgICAgIG9zYjpwYWludD0ic29saWQiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDIyNzMiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMS4xODQ1NDk5IgogICAgIGlua3NjYXBlOmN4PSIzNzguMjAyNzQiCiAgICAgaW5rc2NhcGU6Y3k9Ijk0LjQ4ODE4OSIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE0NDAiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iODU1IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIxIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iRWJlbmUgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUuMjkxNjY2NSwtOC4yMjYxOTI1KSI+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiMwMDZjZjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMTg3MDg4NjU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0ODE1IgogICAgICAgd2lkdGg9IjEwMCIKICAgICAgIGhlaWdodD0iNTAiCiAgICAgICB4PSI1LjI5MTY2NjUiCiAgICAgICB5PSI4LjIyNjE5MjUiIC8+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0MjMwNyIKICAgICAgIHdpZHRoPSIxMDAiCiAgICAgICBoZWlnaHQ9IjUwIgogICAgICAgeD0iMTA1LjI5MTY2IgogICAgICAgeT0iOC4yMjYxOTI1IiAvPgogIDwvZz4KPC9zdmc+Cg==')
  }
  cyObject.$('node[id = "l1"]').style('color', 'black')
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

  // update node values if tracer or values change
  if(!firstTime){
    for(n=0; n < nodes.length; n++){
      cyObject.batch(function(){
      cyObject.$('node[id =\''  + nodes[n].data.id + '\']')
        .data('val', nodes[n].data.val)
      });
    }
  }

}

//calculate graph layout (only once)
function calculateLayout(cyObject, oldMin, oldMax, nodesMin, nodesMax, firstTime){
  // calculate layout and legend only once
  if(firstTime){
    
      FirstTime = false;

    cyObject.layout({
    name: 'dagre',
      }).run();
    
    oldMin = nodesMin;
    oldMax = nodesMax;

    return [oldMin, oldMax, firstTime];
      
  }
}

//show meta-information of nodes by mouseover
function showMetaInfo(cyObject){
  cyObject.elements('node').qtip({       // show node attibute value by mouseover
    show: {   
      event: 'mouseover', 
      solo: true,
    },
    content: {text : function(){
      if(!isNaN(parseFloat(this.data('val')))){
        return '<b>'+nodeVal +'</b>: ' + parseFloat(this.data('val')).toFixed(2) +
        '<br>' + '<b>gene name</b>: ' + this.data('genename'); } //numbers
      else{
        return '<b>'+nodeVal +'</b>: '+ this.data('val') +
        '<br>' + '<b>gene name</b>: ' + this.data('genename');          //bools
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
  cyObject.elements('edge').qtip({       // show node attibute value by mouseover
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
function changeNodeShapes(cyObject, graphString){
  var shapeAttribute = document.getElementById('nodeShapesAttr').value;
  var shape = document.getElementById('nodeShapes').value;

  if(shapeAttribute == "" || shape == ""){
    return;
  }
  var i = 0;
  var id = "";
  while(i < graphString.length){

    if(graphString[i].includes("node id")){   // get node id
      id = graphString[i].split("\"")[1];
    } 
    else if(id != "" && graphString[i].includes('\"v_'+shapeAttribute+'\">true<')){

      cyObject.style()
        .selector('node[id ="'+id+'"]')        
        .style('shape', shape)
        .update();

    }
    i++;
  }

  if(isEmpty(usedShapeAttributes)){// 
    usedShapeAttributes[shapeAttribute] = {"usedShape":shape};
     shapeNode = cytoscape({
        container: document.getElementById('legend_heatmap'),
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
              'font-size': 12
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
                x: 94,
                y: 50
              }
            });
   ycoord = 50;
  } 
  
  // update shape of a attribute already used
  else if (usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    shapeNode.style()
      .selector('node[id ="'+shapeAttribute+'"]')        
      .style('shape', shape)
      .update();
  }

  else if(!isEmpty(usedShapeAttributes) && !usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    ycoord = ycoord + 35;
    usedShapeAttributes[shapeAttribute] = {"usedShape":shape};
    shapeNode.add( { group: "nodes", data: { id: shapeAttribute}, position:{'x':94, 'y':ycoord}});
    shapeNode.style()
        .selector('node[id ="'+shapeAttribute+'"]')        
        .style('shape', shape)
        .update();
  }
}

/*
  generate a checkbox menu for the 10 most common pathways of all genes in the graph
*/
function listKEGGPathways(pos, nodesList){
  //swap button "Hide"/"show"
  if(document.getElementById('keggpathways'+pos).firstChild.data == "Show KEGG Pathways"){
    document.getElementById('keggpathways'+pos).firstChild.data  = "Hide KEGG Pathways";
    if(document.getElementById('KEGGpaths'+pos).style.visibility == "hidden"){
      document.getElementById('KEGGpaths'+pos).style.visibility="visible";
    }
    //get pathways from KEGG, show loader while doing so
    else{
      document.getElementById('KEGGpaths'+pos).style.visibility="visible";
      document.getElementById('loader'+pos).style.visibility = "visible";
      setTimeout(function(){
        var pathsCount = [];
        var allPaths = {};
        for(var n in nodesList){
          if(nodesList[n]["data"] && nodesList[n]["data"]["symbol"]!="legend" && nodesList[n]["data"]["symbol"]!=leftID
            && nodesList[n]["data"]["symbol"]!=rightID){
            if(nodesList[n]["data"]["entrezID"]){
              var entrezID = nodesList[n]["data"]["entrezID"].toString();
            }
            else if(nodesList[n]["data"]["entrez"]){
              var entrezID = nodesList[n]["data"]["entrez"].toString();
            }
            var keggpaths = getPathwaysFromKEGG(entrezID).split('\n');
            var i = 0;
            var searchPattern = new RegExp(/^\s* hsa/);

            while(i <= keggpaths.length - 1){
              if(keggpaths[i].startsWith("PATHWAY")){
                let p = keggpaths[i].split("PATHWAY")[1].trim()
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
              else if(searchPattern.test(keggpaths[i])){
                let p = keggpaths[i].trim();
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
              else if(keggpaths[i].startsWith("MODULE")){
                break;
              }
              i++;
              }
          }
        }
        if(pos == "Left"){
          allPathsLeft = Object.assign({},allPaths);
        }
        else if(pos == "Right"){
          allPathsRight = Object.assign({},allPaths);          
        }
        else if(pos == "Merge"){
          allPathsMerge = Object.assign({}, allPaths);
        }
        // only get top 5 of pathways (most genes in)
        var props = Object.keys(pathsCount).map(function(key) {
          return { key: key, value: this[key] };}, pathsCount);
        props = props.sort(function(p1, p2) { return p2.value - p1.value; });
        var topFive = props.slice(0, 5);
        //show table of pathways
        var tbody = document.getElementById("KEGGpaths"+pos);
        var htmlString ="<form id='form"+pos+"'> <h3>KEGG Pathways:</h3><br>";
        var colors = ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"]
        for (var i = 0; i < topFive.length; i++) {
          if(pos == "Left"){
            colorschemePathsLeft[topFive[i].key] = colors[i];
          }
          if(pos == "Right"){
            colorschemePathsRight[topFive[i].key] = colors[i];
          }
          if(pos == "Merge"){
            colorschemePathsMerge[topFive[i].key] = colors[i];
          }
          var tr = "<b id = 'highlight"+pos+i+"' style='color:"+colors[i]+"'><label><input type='checkbox' value='"+topFive[i].key+"'>";
          tr += topFive[i].key + " </label></b><br><br>";
          htmlString += tr;
        }
        htmlString +="</form>"
        tbody.innerHTML = htmlString;
        document.getElementById('keggpathways'+pos).firstChild.data = "Hide KEGG Pathways";
        document.getElementById('KEGGpaths'+pos).style.visibility = "visible";
        document.getElementById('loader'+pos).style.visibility = "hidden";
        for(var i = 0; i < 5; i++){
          if(pos == 'Left'){
            document.getElementById('highlight'+pos+i).addEventListener('click', function(){highlightKEGGpaths(ctxLeft, canvasLeft, graphLeft, layerLeft, pos, allPathsLeft, colorschemePathsLeft);});
          }
          else if(pos == "Right"){
            document.getElementById('highlight'+pos+i).addEventListener('click', function(){highlightKEGGpaths(ctxRight, canvasRight, graphRight,layerRight, pos, allPathsRight, colorschemePathsRight);});
          }
          else if(pos == "Merge"){
            document.getElementById('highlight'+pos+i).addEventListener('click', function(){highlightKEGGpaths(ctxMerge, canvasMerge, merge_graph,layerMerge, pos, allPathsMerge, colorschemePathsMerge);});
          }
        }
        },10);
    }
  }
  //Hide table, switch button to show
  else{
    document.getElementById('keggpathways'+pos).firstChild.data  = "Show KEGG Pathways";
    document.getElementById('KEGGpaths'+pos).style.visibility = "hidden";
    document.getElementById('loader'+pos).style.visibility = "hidden";
    $('#form'+pos+' input:checkbox').prop('checked', false);
    if(pos == "Left"){
      layerLeft.resetTransform(ctxLeft);
      ctxLeft.clearRect(0,0,canvasLeft.width, canvasLeft.height);          
      layerLeft.setTransform(ctxLeft);
      ctxLeft.save();
    }
    else if(pos == "Right"){
      layerRight.resetTransform(ctxRight);
      ctxRight.clearRect(0,0,canvasRight.width, canvasRight.height);          
      layerRight.setTransform(ctxRight);
      ctxRight.save();      
    }
    else if(pos == "Merge"){
      layerMerge.resetTransform(ctxMerge);
      ctxMerge.clearRect(0,0,canvasMerge.width, canvasMerge.height);          
      layerMerge.setTransform(ctxMerge);
      ctxMerge.save();      
    }

  }
}

// get pathways of selected gene from kegg using entrez id
function getPathwaysFromKEGG(name){ 
  var responsetxt;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "http://rest.kegg.jp/get/hsa:" + name, false);
  
  xhr.onload = function () {
    paths = xhr.responseText;
   }

  xhr.send(document);
  return paths;
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
    var position = 0;
    if(renderedPos_i_id){
      position = renderedPos_i_id;
    }
    else if(renderedPos_i){
      position = renderedPos_i;
    }
    else{
      continue;
    }
    for(var j = 1; j < cp.length; j++){
      let renderedPos_j_id = cy.$("node[entrezID ='"+cp[j]+"']").renderedPosition();
      let renderedPos_j = cy.$("node[entrez ='"+cp[j]+"']").renderedPosition();
      var pos_m = 0;
      if(renderedPos_j_id){
        pos_m = renderedPos_j_id;
      }
      else if(renderedPos_j){
        pos_m = renderedPos_j;
      }
      else{
        continue;
      }
      let dist = Math.getDistance(position['x'], position['y'], pos_m['x'], pos_m['y']);
      if(dist < (0.15*cy.width()) && dist > 0){
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
     if (checkboxes[i].checked) {
        checkboxesChecked.push(checkboxes[i].value);
     }
  }
  // Return the array if it is non-empty, or null
  return checkboxesChecked.length > 0 ? checkboxesChecked : null;
}

// draw a rectangle at given position with given sidelengths and colored by pathway
function drawRect(pos, position, nodeWidth, side_x, side_y, path, ctx, colorschemePaths){
    ctx.beginPath();
    ctx.rect(position['x']-(0.5*nodeWidth), position['y']-(0.5*nodeWidth), side_x, side_y);
    ctx.fillStyle =colorschemePaths[path];
    ctx.fill();
    ctx.closePath();
}

// draw rectangles highlighting the selected pathways
function drawPathwayRectangles(ctx, cy, pos, allPaths, colorschemePaths){
  var allCheckedPaths = getCheckedBoxes($('#form'+pos+' input:checkbox'));
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
          var max_dist_x = 0;
          var max_dist_y = 0;
          var most_x=100000;
          var most_y=100000;
          // multiple nodes in one rectangle
          if(grouped_nodes.size > 1){
            for(let n of grouped_nodes){
              if(cy.$("node[entrezID ='"+n+"']").position()){
                var position = cy.$("node[entrezID ='"+n+"']").position();
              }
              else if(cy.$("node[entrez ='"+n+"']").position()){
                var position = cy.$("node[entrez ='"+n+"']").position();
              }
              for(let m of grouped_nodes){
                var pos_m;
                if(cy.$("node[entrezID ='"+m+"']").position()){
                  pos_m = cy.$("node[entrezID ='"+m+"']").position()
                }
                else if(cy.$("node[entrez ='"+m+"']").position()){
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
            if(cy.$("node[entrezID ='"+[...grouped_nodes][0]+"']").length > 0){
              var renderedWidth = cy.$("node[entrezID ='"+[...grouped_nodes][0]+"']").width();
            }
            else if(cy.$("node[entrez ='"+[...grouped_nodes][0]+"']").length > 0){
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
            centroid = {"x": most_x, "y":most_y}
            drawRect(pos, centroid, renderedWidth, max_dist_x, max_dist_y, path, ctx, colorschemePaths)           
          }

          // single node in square
          else if(grouped_nodes.size == 1){
            var k = [...grouped_nodes][0];
            let renderedPos_id = cy.$("node[entrezID ='"+k+"']").position();
            let renderedPos = cy.$("node[entrez ='"+k+"']").position();
            if(renderedPos_id){
              var position = renderedPos_id;
              var side = (cy.$("node[entrezID ='"+k+"']").width()/Math.sqrt(2))*1.7;
              drawRect(pos, position, side, side, side, path, ctx, colorschemePaths);
            }
            else if(renderedPos){
              var position = renderedPos;
              var side = (cy.$("node[entrez ='"+k+"']").width()/Math.sqrt(2))*1.7;
              drawRect(pos, position, side, side, side, path, ctx, colorschemePaths);
            }
          }
        }
      }
    }
}

/*
  to highlight a selected KEGG pathway, draw a rectangle around nodes contained in the pathway. Nodes that are close to each other on screen are in the same rectangle.
*/
function highlightKEGGpaths(ctx, canvas, cy, layer, pos, allPaths, colorschemePaths){
  ctx.clearRect(0,0,canvas.width, canvas.height);
  cy.on("render cyCanvas.resize", evt => {
    layer.resetTransform(ctx);
    ctx.clearRect(0,0,canvas.width, canvas.height);          
    layer.setTransform(ctx);
    ctx.save();
    drawPathwayRectangles(ctx, cy, pos, allPaths, colorschemePaths);
    ctx.restore();
  });
  cy.zoom(cy.zoom()*1.000000000000001);
}

// optional merging of multiple edges between two nodes
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
              cy.edges('edge[id = "'+e.id+'_'+interact.trim()+'"]').style('display', 'element').update;
              continue loopInteraction;
            }
          }
          // add single edge to graph
          cy.add({
            group: 'edges',
            data: { id:e.id+'_'+interact.trim(), source:e.source, target:e.target, interaction:interact.trim()},
          });
        }
      }
      else if(e.interaction.includes(",")){
        cy.edges()[i].data().interaction = e.interaction.split(",");
        cy.edges()[i].style('target-arrow-shape', 'vee').style('line-style','solid').update;
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
        edge.style('display', 'element').style('target-arrow-shape', 'vee').style('line-style','solid');
      }
      // hide single edges
      else if(edge.data().id.includes(edge.data().interaction) || edge.data().id.includes(',')){
          edge.style('display', 'none');
        }
      }
    
  }
  if(cy2 != undefined){
    mergeEdges(cy2);
  }
}
/* 
  download png of graph
*/


function downloadPNGLeft(){

  var png64 = graphLeft.png();
  $('#downloadPNGLeft').attr('href', png64);
  var download = document.createElement('a');
  download.href = 'data:image/png;base64;'+png64;

  var outputName = document.getElementById('outputNameLeft').value;
  if(outputName != "File name"){
    download.download = outputName + '.png';
  }
  else{
    let filenameSplitLeft = left.split("/")
    filenameSplitLeft = filenameSplitLeft[filenameSplitLeft.length-1].split('.')[0];
     fileName = path+ '_' + filenameSplitLeft;
     download.download = fileName + '_' + nodeVal + '.png';
  }
  download.click();
}

function downloadSVGLeft(){
  outputName = document.getElementById('outputNameLeft').value;
  var svgContent = graphLeft.svg({scale: 1, full: true});
  if(outputName != "File name"){
    
    saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), outputName +".svg");
  }
  else{
    let filenameSplitLeft = left.split("/")
    filenameSplitLeft = filenameSplitLeft[filenameSplitLeft.length-1].split('.')[0];
     fileName = path+ '_' + filenameSplitLeft;
     saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), fileName + '_' + nodeVal + ".svg");
  }
}

function downloadPNGRight(){

  var png64 = graphRight.png();
  $('#downloadPNGRight').attr('href', png64);
  var download = document.createElement('a');
  download.href = 'data:image/png;base64;'+png64;

  var outputName = document.getElementById('outputNameRight').value;
  if(outputName != "File name"){
    download.download = outputName + '.png';
  }
  else{
    let filenameSplitRight = right.split("/")
    filenameSplitRight = filenameSplitRight[filenameSplitRight.length-1].split('.')[0];
     fileName = path+ '_' + filenameSplitRight;
     download.download = fileName + '_' + nodeVal + '.png';
  }
  download.click();
}

function downloadSVGRight(){
  outputName = document.getElementById('outputNameRight').value;
  var svgContent = graphRight.svg({scale: 1, full: true});
  if(outputName != "File name"){
    
    saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), outputName +".svg");
  }
  else{
    let filenameSplitRight = left.split("/")
    filenameSplitRight = filenameSplitRight[filenameSplitRight.length-1].split('.')[0];
     fileName = path+ '_' + filenameSplitRight;
     saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), fileName + '_' + nodeVal + ".svg");
  }
}

function downloadPDF() {
    $(window).scrollTop(0);
    const domElement = document.getElementById('body');
    var divHeight = window.innerHeight
    var divWidth = window.innerWidth
    var ratio = divHeight / divWidth;
  
    var doc = new jsPDF("l", "mm", "a4");
    var width = doc.internal.pageSize.getWidth();
    var height = (ratio * width);

    html2canvas($("body").get(0), { onclone: (document) => {
      document.getElementById('description').remove();
      document.getElementById('heatmapcontainer').remove();
      document.getElementById('selectAttribute').remove();
      document.getElementById('mergeButton').remove();
      document.getElementById('outputName').remove();
      document.getElementById('downloadPDF').remove();
      document.getElementById('resetLeft').remove();
      document.getElementById('downloadPartLeft').remove();
      document.getElementById('resetRight').remove();
      document.getElementById('downloadPartRight').remove();
      document.getElementById('loadDir').remove();
      document.getElementById("legend_heatmap").style.top = 200 +"px";
      document.getElementById('nav').style.visibility = 'hidden'
    }}).then(function(canvas){
    var imgData = canvas.toDataURL('image/png');

    doc.addImage(imgData, 'PNG', 0, 0, width, height); 
    outputName = document.getElementById('outputName').value;
    doc.save(outputName + '.pdf');
  });
}
/*
reset view (zoom, position)
*/
function resetLeft(){
  graphLeft.layout({
      name: 'dagre',
    }).run();
  highlightedNode.getsymbol;
};

function resetRight(){
  graphRight.layout({
      name: 'dagre',
    }).run();
  highlightedNode.getsymbol;
};

function resetMerge(){
  merge_graph.cy.layout({
      name: 'dagre',
    }).run();
  highlightedNode.getsymbol;
};

