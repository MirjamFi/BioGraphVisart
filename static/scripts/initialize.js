var nodes, edges, path, tracer, nodeVal, outputName, nodeAttributes, 
 graphString, oldMin, oldMax, nodeShapeAttr, shapeNode, ycoord;
 // no attributes for node coloring/shape
var noOptn = true;
var noDrpShapes = true;
var firstTime = true;
var loadGraphCount = 0;
var legendDrawn = false;
var svg;
var nodesMin = -1;
var nodesMax = 1;
var cy;
var firstShape = true;
var usedShapeAttributes = [];
var getDrpDwnFiles = true;
var isJson = false;
var collapsed = false;
var expandGraphs = [];
var clickedNode;
var clickedNodesPosition;
var colorschemePaths;
var allPaths;
var layer;
var canvas;
var ctx;
var defaultVal = false;

function isJsonFile(){
  document.getElementById('loader1').style.visibility = "visible";
  var file = document.getElementById('fileName').files[0];
  if(file == undefined){
    alert("No file given.")
    document.getElementById('loader1').style.visibility = "hidden";
    return;
  }
  if(file["name"].endsWith("json")){
    readJson(file);
  }
  else if(file["name"].endsWith("graphml")){
    readFile(file);
  }
  else{
    alert('Please select a .graphml or .json-file.');
      return;
  }
}

/*
remove old buttons
*/
function cleanSelections(){
    // if it is not the first graph read, delete all selectable options
  usedShapeAttributes = [];
  document.getElementById('KEGGpaths').innerHTML = "";
  document.getElementById('keggpathways').firstChild.data = "Show KEGG Pathways";
  document.getElementById('KEGGpaths').style.visibility = "hidden";
  allPaths = null;
  if(layer){
    layer.resetTransform(ctx);
    ctx.clearRect(0,0,canvas.width, canvas.height);          
    layer.setTransform(ctx);
    ctx.save();
  }
  var domValues = document.getElementById("values");
  if(domValues){  
    domValues.parentNode.removeChild(domValues);}
    var domNodeShapesAttr = document.getElementById("nodeShapesAttr");
    var domLayout = document.getElementById("selectlayout");
  if(domNodeShapesAttr){
    domNodeShapesAttr.parentNode.removeChild(domNodeShapesAttr);}
    var domNodeShapes = document.getElementById("nodeShapes");
  if(domNodeShapes)
    {domNodeShapes.parentNode.removeChild(domNodeShapes);}
  if(domLayout)
    {domLayout.parentNode.removeChild(domLayout);}
  noOptn = true;
  noDrpShapes = true;
  collapsed = false;
  nodeVal = undefined;
}
/* 
read from json - file and initialize cy-object
*/
function readJson(file) {
  isJson = true;

  cleanSelections();

  if(shapeNode){
    shapeNode.elements().remove();
  }

  // IS file a json?
  if(!file["name"].endsWith("json")){
    alert('Please select a .json-file.');
    return;
  }

  // read file
  path = file.name;
  var reader = new FileReader();
  reader.onloadend = function(evt) {
    if (evt.target.readyState == FileReader.DONE) { // DONE == 2
      var arrayBuffer = evt.target.result;
      jsonString = JSON.parse(arrayBuffer);
      cy = cytoscape({
        container: document.getElementById('cy'),
        ready: function(){
        },
      });
      for(var i = 0; i < jsonString.style.length; i++){
        selector = jsonString.style[i].selector;
        if(selector.includes("activation")){
          jsonString.style[i].selector = 'edge[interaction = "activation"]';
        }
        else if(selector.includes("expression")){
          jsonString.style[i].selector = 'edge[interaction = "expression"]';
        }
        else if(selector.includes("inhibition")){
          jsonString.style[i].selector = 'edge[interaction = "inhibition"]';
        }
        else if(selector.includes("repression")){
          jsonString.style[i].selector = 'edge[interaction = "repression"]';
        }
        else if(selector.includes("compound")){
          jsonString.style[i].selector = 'edge[interaction = "compound"]';
        }
        else if(selector.includes("indirect effect")){
          jsonString.style[i].selector = 'edge[interaction = "indirect effect"]';
        }
        else if(selector.includes("state change")){
          jsonString.style[i].selector = 'edge[interaction = "state change"]';
        }
        else if(selector.includes("missing interaction")){
          jsonString.style[i].selector = 'edge[interaction = "missing interaction"]';
        }
        else if(selector.includes("phosphorylation")){
          jsonString.style[i].selector = 'edge[interaction = "phosphorylation"]';
        }
        else if(selector.includes("dephosphorylation")){
          jsonString.style[i].selector = 'edge[interaction = "dephosphorylation"]';
        }
        else if(selector.includes("glycosylation")){
          jsonString.style[i].selector = 'edge[interaction = "glycosylation"]';
        }
        else if(selector.includes("methylation")){
          jsonString.style[i].selector = 'edge[interaction = "methylation"]';
        }
        else if(selector.includes("ubiquitination")){
          jsonString.style[i].selector = 'edge[interaction = "ubiquitination"]';
        }
        else if(selector.includes("binding")){
          jsonString.style[i].selector = 'edge[interaction = \"binding/association\"]';
        }
        else if(selector.includes("dissociation")){
          jsonString.style[i].selector = 'edge[interaction = "dissociation"]';
        }    
        else if(selector.includes("true")){
          jsonString.style[i].selector = 'node['+nodeVal+' = \"true\"]';
        }
        else if(selector.includes("false")){
          jsonString.style[i].selector = 'node['+nodeVal+' = \"false\"]';
        }
      }
      cy.json(jsonString);

      var val;
      // get color attributes name; if none, no need for legend node; for some reason the legend node's background is not stored in the json file, so new generation
      for(var i = 0; i < jsonString.elements.nodes.length; i++){
        Object.keys(jsonString.elements.nodes[i].data).forEach(function(key) {
          let keyVal = jsonString.elements.nodes[i].data[key]//.filter(attr => attr == "true" || typeof(attr) =="numeric")//.filter(attr => attr != "symbol").filter(attr => attr != "genename");
          if(keyVal == "true" || keyVal=="false" || !isNaN(parseFloat(keyVal))){
            val = key;
            nodeVal = val;
          }
        });
      }    

      cy.$('node['+nodeVal+'="false"]').style('background-color', '#006cf0').style('color','white');
      cy.$('node['+nodeVal+' = "true"]').style('background-color', '#d50000').style('color','white');
      if(cy.nodes().every(function(x){return(x["_private"].data["symbol"])})){
        for(n=0; n < cy.nodes().length; n++){
          cy.batch(function(){
          cy.$('node[id =\''  + cy.nodes()[n]["_private"].data.id + '\']').style("label",cy.nodes()[n]["_private"].data.symbol);
          });
        }
      }
      else{
        for(n=0; n < cy.nodes().length; n++){
          cy.batch(function(){
          cy.$('node[id =\''  + cy.nodes()[n]["_private"].data.id + '\']').style("label",cy.nodes()[n]["_private"].data.name);
          });
        }
      }
      if(val.length>0){
        // legend node
        var legendPosition = cy.nodes('node[id = "l1"]').position();
        cy.remove('node[id = "l1"]');

        cy.add({
          group: 'nodes',
          data: { id: "l1", symbol: "legend" },
          position: legendPosition
        });
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


        // get min and max for legend node
        var nodeVals = jsonString.elements.nodes.map(function(el){return el.data[val]}).filter(Number);
        nodesMin = Math.min(...nodeVals).toFixed(2);
        if(nodesMin > 0){
          nodesMin = -1;
        }
        nodesMax = Math.max(...nodeVals).toFixed(2);
        if(nodesMax < 0){
          nodesMax = 1;
        }
        if(!isNaN(nodesMin)){
          cy.$('node[id = "l1"]')
          .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnOTExIgogICB3aWR0aD0iNTIuOTE2NjY4bW0iCiAgIGhlaWdodD0iMTMuMjI5MTY3bW0iCiAgIHZpZXdCb3g9IjAgMCAyMDAuMDAwMDEgNTAuMDAwMDAzIgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmQyLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTkxNyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGRlZnMKICAgICBpZD0iZGVmczkxNSI+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ4MTEiPgogICAgICA8c3RvcAogICAgICAgICBpZD0ic3RvcDQ4MDkiCiAgICAgICAgIG9mZnNldD0iMCIKICAgICAgICAgc3R5bGU9InN0b3AtY29sb3I6I2Q1MDAwMDtzdG9wLW9wYWNpdHk6MDsiIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIGlkPSJzdG9wNDgwNyIKICAgICAgICAgb2Zmc2V0PSIxIgogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojZDUwMDAwO3N0b3Atb3BhY2l0eToxOyIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDQ3MzEiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDQ3MjciIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDZjZjA7c3RvcC1vcGFjaXR5OjA7IgogICAgICAgICBvZmZzZXQ9IjEiCiAgICAgICAgIGlkPSJzdG9wNDcyOSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ3MzEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0NzMzIgogICAgICAgeDE9Ii0wLjE3MjUzNzg5IgogICAgICAgeTE9IjI1LjA0MjMwNyIKICAgICAgIHgyPSIxMDAuMDA3MzEiCiAgICAgICB5Mj0iMjUuMjIyMTYyIgogICAgICAgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiCiAgICAgICBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMTcyNTI4MTMsLTUwLjA0MjMwNSkiIC8+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHhsaW5rOmhyZWY9IiNsaW5lYXJHcmFkaWVudDQ4MTEiCiAgICAgICBpZD0ibGluZWFyR3JhZGllbnQ0ODEzIgogICAgICAgeDE9IjEwMC43MTk0MiIKICAgICAgIHkxPSI3OC41OTI4ODgiCiAgICAgICB4Mj0iMTk5LjgyMDE0IgogICAgICAgeTI9Ijc4LjA1MzMyMiIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIgogICAgICAgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwLjE3OTg0ODEzLC01My4wNTMzMjIpIiAvPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE2NTYiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTE0OCIKICAgICBpZD0ibmFtZWR2aWV3OTEzIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICB1bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6c25hcC1nbG9iYWw9InRydWUiCiAgICAgaW5rc2NhcGU6bG9ja2d1aWRlcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ub2Rlcz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW90aGVycz0idHJ1ZSIKICAgICBpbmtzY2FwZTpzbmFwLW9iamVjdC1taWRwb2ludHM9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtY2VudGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTpzbmFwLXRleHQtYmFzZWxpbmU9ImZhbHNlIgogICAgIGlua3NjYXBlOnNuYXAtcGFnZT0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC1ncmlkcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC10by1ndWlkZXM9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjUuNTYiCiAgICAgaW5rc2NhcGU6Y3g9Ijk5LjgyMDEzNyIKICAgICBpbmtzY2FwZTpjeT0iMjQuMTAwNzA2IgogICAgIGlua3NjYXBlOndpbmRvdy14PSI0OTgiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjEzNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzkxMSIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI0NCIKICAgICB3aWR0aD0iNTY2IgogICAgIGhlaWdodD0iNjAiCiAgICAgeD0iLTEuMjAxMjQ4MiIKICAgICB5PSI3MjUuNDE1NzEiIC8+CiAgPHJlY3QKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icmVjdDMyNDYiCiAgICAgd2lkdGg9IjkuNjE2NTA0NyIKICAgICBoZWlnaHQ9IjE1My44NjQwNyIKICAgICB4PSIzNjIuODUyMTciCiAgICAgeT0iNTg2LjIxNjY3IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjQ4IgogICAgIHdpZHRoPSI0NTMuMzQ5NTIiCiAgICAgaGVpZ2h0PSIxNTcuOTg1NDQiCiAgICAgeD0iMi45MjAxMDUiCiAgICAgeT0iNDU3LjA4MDc1IiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InJlY3QzMjUwIgogICAgIHdpZHRoPSI2OTUuMTM1OTMiCiAgICAgaGVpZ2h0PSIyMDguODE1NTQiCiAgICAgeD0iLTEwOC4zNTY2IgogICAgIHk9IjQzMC45Nzg4MiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjA7ZmlsbDojZmYwMDAwO2ZpbGwtb3BhY2l0eToxIgogICAgIGlkPSJyZWN0MzI1MiIKICAgICB3aWR0aD0iNTcxLjQ5NTEyIgogICAgIGhlaWdodD0iMjc3LjUwNDg1IgogICAgIHg9Ii04LjA3MDE5MDQiCiAgICAgeT0iMTAwNi41OTUzIiAvPgogIDxlbGxpcHNlCiAgICAgc3R5bGU9Im9wYWNpdHk6MDtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjEiCiAgICAgaWQ9InBhdGgzMjU0IgogICAgIGN4PSIxNjAuOTA1NTMiCiAgICAgY3k9IjM4OC4zOTE0OCIKICAgICByeD0iOTcuNTM4ODM0IgogICAgIHJ5PSIxMjUuMDE0NTYiIC8+CiAgPGVsbGlwc2UKICAgICBzdHlsZT0ib3BhY2l0eTowO2ZpbGw6I2ZmMDAwMDtmaWxsLW9wYWNpdHk6MSIKICAgICBpZD0icGF0aDMyNTYiCiAgICAgY3g9IjEwMi41MTk2MSIKICAgICBjeT0iNDMwLjI5MTkzIgogICAgIHJ4PSIyMzYuOTc4MTUiCiAgICAgcnk9IjE3Ni41MzE1NiIgLz4KICA8cmVjdAogICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDp1cmwoI2xpbmVhckdyYWRpZW50NDczMyk7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm8iCiAgICAgaWQ9InJlY3Q0NzE3IgogICAgIHdpZHRoPSIyMDAiCiAgICAgaGVpZ2h0PSI1MCIKICAgICB4PSIwIgogICAgIHk9Ii01MCIKICAgICB0cmFuc2Zvcm09InNjYWxlKDEsLTEpIiAvPgogIDxyZWN0CiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOnVybCgjbGluZWFyR3JhZGllbnQ0ODEzKTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgIGlkPSJyZWN0NDgwNSIKICAgICB3aWR0aD0iMjAwIgogICAgIGhlaWdodD0iNTAiCiAgICAgeD0iMCIKICAgICB5PSIwIiAvPgo8L3N2Zz4K')
          .style("background-image-opacity", '1');
        }
        if(isNaN(nodesMin)){
          cy.$('node[id = "l1"]')
            .style('background-image','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpvc2I9Imh0dHA6Ly93d3cub3BlbnN3YXRjaGJvb2sub3JnL3VyaS8yMDA5L29zYiIKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjE5OS45OTk5OG1tIgogICBoZWlnaHQ9IjUwbW0iCiAgIHZpZXdCb3g9IjAgMCAxOTkuOTk5OTggNTAiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiA1YzNlODBkLCAyMDE3LTA4LTA2IgogICBzb2RpcG9kaTpkb2NuYW1lPSJsZWdlbmRfYm9vbC5zdmciPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyIj4KICAgIDxsaW5lYXJHcmFkaWVudAogICAgICAgaWQ9ImxpbmVhckdyYWRpZW50MjI3NSIKICAgICAgIG9zYjpwYWludD0ic29saWQiPgogICAgICA8c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojMDA2Y2YwO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDIyNzMiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMS4xODQ1NDk5IgogICAgIGlua3NjYXBlOmN4PSIzNzguMjAyNzQiCiAgICAgaW5rc2NhcGU6Y3k9Ijk0LjQ4ODE4OSIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWJvdHRvbT0iMCIKICAgICBzaG93Ym9yZGVyPSJmYWxzZSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE0NDAiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iODU1IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIxIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iRWJlbmUgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUuMjkxNjY2NSwtOC4yMjYxOTI1KSI+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiMwMDZjZjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMTg3MDg4NjU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0ODE1IgogICAgICAgd2lkdGg9IjEwMCIKICAgICAgIGhlaWdodD0iNTAiCiAgICAgICB4PSI1LjI5MTY2NjUiCiAgICAgICB5PSI4LjIyNjE5MjUiIC8+CiAgICA8cmVjdAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiNmZjAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlkPSJyZWN0MjMwNyIKICAgICAgIHdpZHRoPSIxMDAiCiAgICAgICBoZWlnaHQ9IjUwIgogICAgICAgeD0iMTA1LjI5MTY2IgogICAgICAgeT0iOC4yMjYxOTI1IiAvPgogIDwvZz4KPC9zdmc+Cg==')
        }
        var fontSize = 10;
        var labelVal = val;
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
        cy.$('node[id = "l1"]')
          .style('label', nodesMin+' '+' '.repeat(neededWhitespace)+ labelVal +' '+' '.repeat(neededWhitespace) + nodesMax)
      }
      loadFile();
    }
  };
  reader.readAsText(file);
}

/* 
read from grphml - file and initialize cy-object
*/
function readFile(file) {
  isJson = false;
  cleanSelections();

  if(shapeNode){
    shapeNode.elements().remove();
  }

  // IS file a graphml?
  if(!file["name"].endsWith("graphml")){
    alert('Please select a .graphml-file.');
    return;
  }

  // read file
  path = file.name;
  var reader = new FileReader();
  reader.onloadend = function(evt) {
    if (evt.target.readyState == FileReader.DONE) { // DONE == 2
      var arrayBuffer = evt.target.result;
      graphString = arrayBuffer.split('\n');
      loadFile();
    }
  };
  reader.readAsText(file);
}



function loadFile() {
  // put node atttributes into dropdown select object
  var drp = document.createElement("select");
  drp.id = "values";
  drp.name = "values";
  drp.style.visibility = "visible";
  document.getElementById("configPart").appendChild(drp);
  // node attributes
  var sele = document.createElement("OPTION");
  sele.text = "Select Coloring Attribute";
  drp.add(sele);
  drp.onchange = function(){visualize(graphString)};


  // layout dropdown
  var drpLayout = document.createElement("select");
  drpLayout.id = "selectlayout";
  drpLayout.name = "selectlayout";
  document.getElementById("configPart").appendChild(drpLayout);
  drpLayout.style.visibility = "hidden";
  drpLayout.onchange = changeLayout;

  var seleLayout = document.createElement("OPTION");
  seleLayout.text = "Select Layout";
  drpLayout.add(seleLayout);

  const layoutArray = ["dagre (default)", "klay", "breadthfirst", "cose-bilkent", "grid"];

  layoutArray.forEach(function(s){
    var graphLayout = s;
    var optnLayout = document.createElement("OPTION");
    optnLayout.text=graphLayout;
    optnLayout.value=graphLayout;
    drpLayout.add(optnLayout);
  });

  // attributes for changing node shape in dropdown
  var drpShapes = document.createElement("select");
  drpShapes.id = "nodeShapesAttr";
  drpShapes.name = "nodeShapesAttr";
  document.getElementById("configPart").appendChild(drpShapes);
  drpShapes.style.visibility = "hidden";
  drpShapes.onchange=activateShapes;

  var seleShapeAttr = document.createElement("OPTION");    
  seleShapeAttr.text = "Select Shape Attribute";
  seleShapeAttr.value = "";
  drpShapes.add(seleShapeAttr);

 // shapes dropdown
  var drpShape = document.createElement("select");
  drpShape.id = "nodeShapes";
  drpShape.name = "nodeShapes";
  document.getElementById("configPart").appendChild(drpShape);
  drpShape.style.visibility = "hidden";
  drpShape.onchange = changeNodeShapes;

  var seleShape = document.createElement("OPTION");
  seleShape.text = "Select Shape";
  seleShape.value = "";
  drpShape.add(seleShape);

  const shapesArray = ["rectangle", "octagon", "rhomboid", "pentagon", "tag"];

  shapesArray.forEach(function(s){
    var nodeShape = s;
    var optnShape = document.createElement("OPTION");
    optnShape.text=nodeShape;
    optnShape.value=nodeShape;
    drpShape.add(optnShape);
  });

  if(!isJson){
    // get attributes for coloring -> double/boolean and shape -> boolean
    for (var i = 0; i <= graphString.length - 1; i++) {
      if(graphString[i].includes("for=\"node\"") && 
        (graphString[i].includes("attr.type=\"double\"") || 
          (graphString[i].includes("attr.type=\"boolean\"")))){
        noOptn = false;
        var nodeattr = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
        var optn = document.createElement("OPTION");
        optn.text=nodeattr;
        optn.value=nodeattr;
        drp.add(optn);

        if(graphString[i].includes("attr.type=\"boolean\"")){
          var nodeattrShape = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
          var optnShape = document.createElement("OPTION");
          optnShape.text=nodeattrShape;
          optnShape.value=nodeattrShape;
          drpShapes.add(optnShape);
          noDrpShapes = false;
        }
      };
      // do not search whole file, only header
      if(graphString[i].includes("<node id=\"n0\">")){
        break;
      };
    };
    if(drp.options[1]){
      nodeVal = drp.options[1].value;
      document.getElementById('values').value = nodeVal;
      defaultVal = true;
        visualize(graphString)
    }
  } 
  if(noOptn && noDrpShapes){
    drp.parentNode.removeChild(drp);
    drpShapes.parentNode.removeChild(drpShapes);
    drpShape.parentNode.removeChild(drpShape);
    defaultVal = false;
    visualize(graphString);
  }   
  else if(noDrpShapes){
    drpShapes.parentNode.removeChild(drpShapes);
    drpShape.parentNode.removeChild(drpShape);
  }
  loadGraphCount ++; 
};