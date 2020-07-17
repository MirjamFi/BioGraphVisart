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
var isSIF = false;
var allPaths;

function isFile(){
  document.getElementById('loader1').style.visibility = "visible";
  var file = document.getElementById('fileName').files[0];
  if(file == undefined){
    alert("No file given.")
    document.getElementById('loader1').style.visibility = "hidden";
    return;
  }
  var file = document.getElementById('fileName').files[0];
  if(file["name"].endsWith("json")){
    isJson = true;
    readFile(file);
    document.getElementById('loader1').style.visibility = "hidden";
  }
  else if(file["name"].endsWith("graphml") || file["name"].endsWith("sif")){
    isJson = false;
    readFile(file);
  }
  else{
    alert('Please select a .graphml or .sif-file.');
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
  noOptn = true;
  noDrpShapes = true;
  nodeVal = undefined;
}

/* load example graphml file*/
function readExample(isjson, layer = undefined){
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
  cleanSelections();

  if(shapeNode){
    shapeNode.elements().remove();
  }

  // // IS file a graphml?
  if(file["name"].endsWith("sif")){
    isSIF = true;
  }

  // read file
  path = file.name;
  var reader = new FileReader();
  reader.onloadend = function(evt) {
    if (evt.target.readyState == FileReader.DONE) { // DONE == 2
      var arrayBuffer = evt.target.result;
      if(isJson){
        graphString = JSON.parse(arrayBuffer)
      }
      else{
        graphString = arrayBuffer.split('\n');
      }
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
  drp.onchange = function(){
    nodeVal = document.getElementById('values').value;
    var newValues = []
    for(var i = 0; i < cy.filter('node').size(); i++){
      if(cy.nodes()[i].data()[nodeVal]){
        newValues.push(cy.nodes()[i].data()[nodeVal])
      }
    }
    var range = legendsRange(newValues);
    var nodesMin = range[0];
    var nodesMax = range[1];
    cy.style().selector('node[!'+nodeVal+']').style({
          'background-color': 'white',
          'color':'black'
      }).update()
      // attributes with numbers
    cy.style().selector('node['+nodeVal+' < "0"]').style({
          'background-color': 'mapData('+nodeVal+','+ nodesMin+', 0, #006cf0, white)',
          'color': 'black'
      }).update()
     cy.style().selector('node['+nodeVal+' <='+0.5*nodesMin+']').style({
          'color': 'white'
      }).update()
     cy.style().selector('node['+nodeVal+' > "0"]').style({
          'background-color': 'mapData('+nodeVal+', 0,'+ nodesMax+', white, #d50000)',
          'color': 'black'
      }).update()
      cy.style().selector('node['+nodeVal+' >='+0.5*nodesMax+']').style({
          'color': 'white'
      }).update()
      cy.style().selector('node['+nodeVal+' = "0"]').style({
          'background-color': 'white',
          'color':'black'
      }).update()

      // attributes with boolean
      cy.style().selector('node['+nodeVal+' = "false"]').style({
          'background-color': '#006cf0',
          'color':'white'
      }).update()
      cy.style().selector('node['+nodeVal+' = "true"]').style({
          'background-color': '#d50000',
          'color':'white'
      }).update()
      var fontSize = 10;
      calculateLabelColorLegend(nodeVal, fontSize, cy, nodesMin, nodesMax);
  };


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

  if(!isJson && ! isSIF){
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
      noOptn = false;
        visualize(graphString, noOptn);
    }
  }
  else if(isJson){
    var nodeattr = graphString.elements.nodes[0].data
    for(let d in nodeattr){
      if(nodeattr[d] == "true" || nodeattr[d] == "false"){
        var nodeattrShape = d
        var optnShape = document.createElement("OPTION");
        optnShape.text=nodeattrShape;
        optnShape.value=nodeattrShape;
        drpShapes.add(optnShape);
        noDrpShapes = false;
        noOptn = false

        var optn = document.createElement("OPTION");
        optn.text=d;
        optn.value=d;
        drp.add(optn);
      }

      else if(!isNaN(parseFloat(nodeattr[d])) && d != "name" && d!="entrezID" && d != "entrez"){
        var optn = document.createElement("OPTION");
        optn.text=d;
        optn.value=d;
        drp.add(optn);
        noOptn = false;
      }

    }
    if(drp.options[1]){
      nodeVal = drp.options[1].value;
      document.getElementById('values').value = nodeVal;
      defaultVal = true;
      noOptn = false;
      visualize(graphString, noOptn);
    }
  }
  // if no attributes found for coloring/shape, remove dropdown menus and visualize
  if(noOptn && noDrpShapes){
    drp.parentNode.removeChild(drp);
    drpShapes.parentNode.removeChild(drpShapes);
    drpShape.parentNode.removeChild(drpShape);
    defaultVal = false;
    // if(!isJson){
        visualize(graphString, noOptn);
      // }
  }   
  else if(noDrpShapes){
    drpShapes.parentNode.removeChild(drpShapes);
    drpShape.parentNode.removeChild(drpShape);
  }
  loadGraphCount ++; 
};
