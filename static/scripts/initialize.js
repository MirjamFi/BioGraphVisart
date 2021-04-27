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
var collapsed = false;
var selectedLayout;

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
  var resetbutn = document.getElementById("resetLayout")
  if(resetbutn){
      resetbutn.parentNode.removeChild(resetbutn); }
  if(document.getElementById('mergeEdges'))
    document.getElementById('mergeEdges').checked = true;
  noOptn = true;
  noDrpShapes = true;
  nodeVal = undefined;
  collapsed = false;
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
  var drp = document.createElement("ul");
  drp.classList.add("Menu")
  drp.classList.add("-horizontal")
  drp.id = "values";
  drp.style.visibility = "visible";
  document.getElementById("configPart").appendChild(drp);

  var labelDrp = document.createElement("li")
  labelDrp.classList.add("-hasSubmenu")
  labelDrp.innerHTML = "<a href='#'>Color attribute</a>"
  drp.appendChild(labelDrp)
  var ulDrp = document.createElement("ul")
  labelDrp.appendChild(ulDrp)

  // layout dropdown
  var drpLayout = document.createElement("ul");
   drpLayout.classList.add("Menu")
  drpLayout.classList.add("-horizontal")
  drpLayout.id = "selectlayout";
  document.getElementById("configPart").appendChild(drpLayout);
  var labelLayout = document.createElement("li")
  labelLayout.classList.add("-hasSubmenu")
  labelLayout.innerHTML = "<a href='#'>Layout</a>"
  drpLayout.appendChild(labelLayout)
  var ulLayout = document.createElement("ul")
  labelLayout.appendChild(ulLayout)

  layoutArray.forEach(function(s){
    var optnLayout = addLayoutOptions(s, "layoutOpt");
    optnLayout.onclick = function(){
      selectedLayout = s; 
      changeLayout(cy, s);
      document.querySelectorAll('.fa-check').forEach(function(e){
        if(e.classList.contains('layoutOpt')){
        e.remove()}});
      optnLayout.innerHTML = "<a href='#'><i class='fas fa-check layoutOpt' style='margin-right:5px'></i>"+s+"</a>"
    };
    ulLayout.appendChild(optnLayout);
  });

// dropdown for shape selection
 var drpShapes = document.createElement("ul")
 drpShapes.classList.add("Menu")
 drpShapes.classList.add("-horizontal")
 drpShapes.id="nodeShapesAttr"
 document.getElementById("configPart").appendChild(drpShapes);
 var labelShape = document.createElement("li")
  labelShape.classList.add("-hasSubmenu")
  labelShape.innerHTML = "<a href='#'>Node shape</a>"
  drpShapes.appendChild(labelShape)
  var ulShapes = document.createElement("ul")
  labelShape.appendChild(ulShapes)

  const shapesArray = ["rectangle", "octagon", "rhomboid", "pentagon", "tag"];

// search gene
  var searchgene = document.createElement("input");
  searchgene.id = "searchgene";
  searchgene.value = "Node label"
  document.getElementById("configPart").appendChild(searchgene);
  searchgene.setAttribute("type", "text");
  searchgene.setAttribute("width", 30);
  var searchbutn = document.createElement("button");
  searchbutn.id = "searchbutn";
  searchbutn.innerHTML = "Search";
  document.getElementById("configPart").appendChild(searchbutn);
  document.getElementById("searchbutn").className = 'butn';  
  searchbutn.onclick = function(){highlightSearchedGene(cy)};

// undo deletion
  var undobutn = document.createElement("button");
  undobutn.id = "undobutn";
  undobutn.innerHTML = "Undo delete";
  document.getElementById("configPart").appendChild(undobutn);
  document.getElementById("undobutn").className = 'butn';  
  undobutn.onclick = undoDeletion;

  var resetbutn = document.createElement("button");
  resetbutn.id = "resetLayout";
  resetbutn.innerHTML = "Reset layout";
  document.getElementById("configPart").appendChild(resetbutn);
  document.getElementById("resetLayout").className = 'butn';  
  undobutn.onclick = changeLayout;
  if(!isJson && ! isSIF){
    // get attributes for coloring -> double/boolean and shape -> boolean
    for (var i = 0; i <= graphString.length - 1; i++) {
      if(graphString[i].includes("for=\"node\"") && 
        ((graphString[i].includes("attr.type=\"double\"") || 
          (graphString[i].includes("attr.type=\"boolean\""))))){
        noOptn = false;
        var nodeattr = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
        if(nodeattr != "Drugtarget"){

          var optnDrp = document.createElement("li");
          optnDrp.innerHTML="<a href='#'>"+nodeattr+"</a>";
          optnDrp.id=nodeattr;
          ulDrp.appendChild(optnDrp)
          optnDrp.onclick = function(){
            document.querySelectorAll('.fa-check').forEach(function(e){
              if(e.classList.contains('optnDrp')){
                e.remove()}});
            this.innerHTML = "<a href='#'><i class='fas fa-check optnDrp' style='margin-right:5px'></i>"+this.id+"</a>"
            nodeVal = this.id;
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
              cy.style().selector('node[!'+nodeVal+']').style({
                  'background-color': 'white',
                  'color':'black'
              }).update()
              var fontSize = 10;
              calculateLabelColorLegend(nodeVal, fontSize, cy, nodesMin, nodesMax);
          };
        }

        if(graphString[i].includes("attr.type=\"boolean\"")){
          var nodeattrShape = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
          var liShape = document.createElement("li")
          liShape.classList.add("-hasSubmenu")
          if(nodeattrShape != "Drugtarget"){
            liShape.innerHTML = "<a href='#'>"+nodeattrShape+"</a>"
            liShape.id= nodeattrShape
            liShape.id="nodeShapes"
            ulShapes.appendChild(liShape)
            var ulShape = document.createElement("ul")
            ulShape.id = nodeattrShape
            liShape.appendChild(ulShape)
            shapesArray.forEach(function(s){
              var optnShape = document.createElement("li")
              optnShape.innerHTML = "<a hre='#'>"+s+"</a>"
              optnShape.id= s
              ulShape.appendChild(optnShape)
              optnShape.onclick=function(){
                document.querySelectorAll('.fa-check').forEach(function(e){
                  if(e.classList.contains('optnShape')){
                    e.remove()}});
                optnShape.innerHTML = "<a href='#'><i class='fas fa-check optnShape' style='margin-right:5px'></i>"+s+"</a>"
                // optnShape.parentElement.innerHTML = "<a href='#'><i class='fas fa-check liShape' style='margin-right:5px'></i>"+optnShape.parentElement.id+"</a>"
                changeNodeShapes(cy, 'legendNodes', optnShape.parentElement.id,s); 
                hideMenu(document.getElementById("nodeShapesAttr"))}
            })

            noDrpShapes = false;
            forEach($(".Menu li.-hasSubmenu"), function(e){
                e.showMenu = showMenu;
                e.hideMenu = hideMenu;
            });

            forEach($(".Menu > li.-hasSubmenu"), function(e){
                e.addEventListener("click", showMenu);
            });

            forEach($(".Menu > li.-hasSubmenu li"), function(e){
                e.addEventListener("mouseenter", hideAllInactiveMenus);
            });

            forEach($(".Menu > li.-hasSubmenu li.-hasSubmenu"), function(e){
                e.addEventListener("click", showMenu);
            });

            document.addEventListener("click", hideAllInactiveMenus);
          }
        }
      };
      // do not search whole file, only header
      if(graphString[i].includes("<node id=\"n0\">")){
        break;
      };
    };
    if(ulDrp.children.length>0){
      ulDrp.children[0].innerHTML = "<a href='#'><i class='fas fa-check optnDrp' style='margin-right:5px'></i>"+ulDrp.children[0].id+"</a>";
      nodeVal = ulDrp.children[0].id;
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
    defaultVal = false;
    // if(!isJson){
        visualize(graphString, noOptn);
      // }
  }   
  else if(noDrpShapes){
    drpShapes.parentNode.removeChild(drpShapes);
  }
  loadGraphCount ++; 
};

/* undo deletion of nodes */
function undoDeletion(){
  entry = removedNodes.pop()
  if(entry != undefined){
    entry.restore();
  }
}

