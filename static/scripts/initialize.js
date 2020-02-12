var path, tracer, nodeVal, outputName, nodeAttributes, 
 graphString, nodeShapeAttr, shapeNode, ycoord;
 // no attributes for node coloring/shape
var noDrpShapes = true;
var firstTime = true;
var loadGraphCount = 0;
var legendDrawn = false;
var svg;
var cy;
var firstShape = true;
var usedShapeAttributes = [];
var getDrpDwnFiles = true;
var isJson = false;
var collapsed = false;
var expandGraphs = [];
var clicked = false;
var clickedNode;
var clickedNodesPosition;
var defaultVal = false;

function isJsonFile(){
  document.getElementById('loader1').style.visibility = "visible";
  var file = document.getElementById('fileName').files[0];
  if(file == undefined){
    alert("No file given.")
    document.getElementById('loader1').style.visibility = "hidden";
    return;
  }
  var file = document.getElementById('fileName').files[0];
  if(file["name"].endsWith("json")){
    readJson(file);
    document.getElementById('loader1').style.visibility = "hidden";
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
function cleanSelections(layer = undefined){
    // if it is not the first graph read, delete all selectable options
  usedShapeAttributes = [];
  var myNode = document.getElementById("configPart");
  document.getElementById("arrows").innerHTML = "";
  document.getElementById('KEGGpaths').innerHTML = "";
  if(!isJson){
    document.getElementById('keggpathways').firstChild.data = "Show KEGG Pathways";
  }
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
  var searchgene = document.getElementById("searchgene")
  if(searchgene){
    searchgene.parentNode.removeChild(searchgene);}
  var searchbutn = document.getElementById("searchbutn")
  if(searchbutn){
    searchbutn.parentNode.removeChild(searchbutn); }
  var undobutn = document.getElementById("undobutn")
  if(undobutn){
      undobutn.parentNode.removeChild(undobutn); }
  if(document.getElementById('mergeEdges'))
    document.getElementById('mergeEdges').checked = true;
  var noOptn = true;
  noDrpShapes = true;
  nodeVal = undefined;
}
/* 
read from json - file and initialize cy-object
*/
function readJson(file, layer = undefined) {
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

      // create interaction legend
      var interactionTypes = new Set();
      for(var i = 0; i < jsonString.elements.edges.length; i++){
        Object.keys(jsonString.elements.edges[i].data).forEach(function(key) { 
          if(key == "interaction"){
            let keyVal = jsonString.elements.edges[i].data[key];
            if(Array.isArray(keyVal)){
              for(let v of keyVal){
                interactionTypes.add(v);
              }
            }
            else{
              interactionTypes.add(keyVal);
            }
          }
        });
      }
      showLegend(interactionTypes)

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
      cy.style().selector('node').style('color', 'black')
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
        var nodeVals = jsonString.elements.nodes.map(function(el){return el.data[val]}).filter(Number);
        if(nodeVals.length > 0){
          // legend node
          var legendPosition = cy.nodes('node[id = "l1"]').position();
          cy.remove('node[id = "l1"]');

          cy.add({
            group: 'nodes',
            data: { id: "l1", symbol: "legend" },
            position: legendPosition
          });
          addcolorlegend(cy);


        // get min and max for legend node
          nodesMin = Math.min(...nodeVals).toFixed(2);
          if(nodesMin > 0){
            nodesMin = -1;
          }
          nodesMax = Math.max(...nodeVals).toFixed(2);
          if(nodesMax < 0){
            nodesMax = 1;
          }

  
        }
      }
      loadFile();
      showMetaInfo()
      document.getElementById('KEGGpaths').style.visibility = "hidden";
      document.getElementById('keggpathways').style.visibility = "hidden";
      document.getElementById('selectlayout').style.visibility = "visible";

        removedNodes = [];
      let defaults = {
        menuRadius: 100, // the radius of the circular menu in pixels
        selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
        commands: [ // an array of commands to list in the menu or a function that returns the array
          
          { // example command
            fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
            content: 'delete node', // html/text content to be displayed in the menu
            contentStyle: {}, // css key:value pairs to set the command's css in js if you want
            select: function(ele){ // a function to execute when the command is selected
              let selectedNode = cy.elements('node[id="'+ele.id()+'"]')
              removedNodes.push(selectedNode.union(selectedNode.connectedEdges()));
              cy.remove(selectedNode) // `ele` holds the reference to the active element
            },
            enabled: true // whether the command is selectable
          }
          
        ], // function( ele ){ return [ /*...*/ ] }, // a function that returns commands or a promise of commands
        fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
        activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
        activePadding: 20, // additional size in pixels for the active command
        indicatorSize: 24, // the size in pixels of the pointer to the active command
        separatorWidth: 3, // the empty spacing in pixels between successive commands
        spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
        minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
        maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
        openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
        itemColor: 'white', // the colour of text in the command's content
        itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
        zIndex: 9999, // the z-index of the ui div
        atMouse: false // draw menu at mouse position
      };
      let menu = cy.cxtmenu( defaults );
    }
  };
  reader.readAsText(file);
}

/* load example graphml file*/
function readExample(layer = undefined){
  cleanSelections();
  // read text from URL location
  var request = new XMLHttpRequest();
  request.open('GET', 'https://raw.githubusercontent.com/MirjamFi/BioGraphVisart/master/example.graphml', false);
  request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
          var type = request.getResponseHeader('Content-Type');
          if (type.indexOf("text") !== 1) {
            graphString = request.responseText.split("\n")
            isJson = false;
            loadFile();
            return graphString;
          }
      }
  }
  request.send(null);
}

/* 
read from grphml - file and initialize cy-object
*/
function readFile(file, layer = undefined) {
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
  var noOptn = true;
  // put node atttributes into dropdown select object
  var drp = document.createElement("select");
  drp.id = "values";
  drp.name = "values";
  drp.style.visibility = "visible";
  document.getElementById("configPart").appendChild(drp);
  // node attributes
  var sele = createSele();
  drp.add(sele);
  drp.onchange = function(){visualize(graphString, noOptn)};


  // layout dropdown
  var drpLayout = document.createElement("select");
  drpLayout.id = "selectlayout";
  drpLayout.name = "selectlayout";
  document.getElementById("configPart").appendChild(drpLayout);
  drpLayout.style.visibility = "hidden";
  drpLayout.onchange = function(){changeLayout(cy)};

  var seleLayout = document.createElement("OPTION");
  seleLayout.text = "Select Layout";
  drpLayout.add(seleLayout);

  layoutArray.forEach(function(s){
    var optnLayout = addLayoutOptions(s);
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
  drpShape.onchange = function(){changeNodeShapes(cy, 'legendNodes')};

  var seleShape = document.createElement("OPTION");
  seleShape.text = "Select Shape";
  seleShape.value = "ellipse";
  drpShape.add(seleShape);

  const shapesArray = ["rectangle", "octagon", "rhomboid", "pentagon", "tag"];

  shapesArray.forEach(function(s){
    var nodeShape = s;
    var optnShape = document.createElement("OPTION");
    optnShape.text=nodeShape;
    optnShape.value=nodeShape;
    drpShape.add(optnShape);
  });

  var searchgene = document.createElement("input");
  searchgene.id = "searchgene";
  searchgene.value = "Search gene"
  document.getElementById("configPart").appendChild(searchgene);
  searchgene.setAttribute("type", "text");
  searchgene.setAttribute("width", 30);
  var searchbutn = document.createElement("button");
  searchbutn.id = "searchbutn";
  searchbutn.innerHTML = "Search";
  document.getElementById("configPart").appendChild(searchbutn);
  document.getElementById("searchbutn").className = 'butn';  
  searchbutn.onclick = function(){highlightSearchedGene(cy)};


  var undobutn = document.createElement("button");
  undobutn.id = "undobutn";
  undobutn.innerHTML = "Undo delete";
  document.getElementById("configPart").appendChild(undobutn);
  document.getElementById("undobutn").className = 'butn';  
  undobutn.onclick = undoDeletion;

  if(! isJson){
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
      if(!isJson){
        visualize(graphString), noOptn;
      }
    }
  }
  // if no attributes found for coloring/shape, remove dropdown menus and visualize
  if(noOptn && noDrpShapes){
    drp.parentNode.removeChild(drp);
    drpShapes.parentNode.removeChild(drpShapes);
    drpShape.parentNode.removeChild(drpShape);
    defaultVal = false;
    if(!isJson){
        visualize(graphString, noOptn);
      }
  }   
  else if(noDrpShapes){
    drpShapes.parentNode.removeChild(drpShapes);
    drpShape.parentNode.removeChild(drpShape);
  }
  loadGraphCount ++; 
};
