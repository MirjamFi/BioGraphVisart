var nodes, edges, path, tracer, nodeVal, outputName, nodeAttributes, 
  graphString, oldMin, oldMax, nodeShapeAttr, shapeNode, ycoord;
var firstTime = true;
var loadGraphCount = 0;
var legendDrawn = false;
var svg;
var  nodesMin = -1;
var nodesMax = 1;
var cy;
var firstShape = true;
var usedShapeAttributes = [];

/* 
create a drop dpwn menu for graphml-files
*/
function getFilesList(){
  if(firstTime){
    var drpFiles = document.getElementById("gfiles");      
      removeOptions(drpFiles);

      var sele = document.createElement("OPTION"); 
      sele.text = "Select .graphml-file";
      sele.value = "";
      drpFiles.add(sele);

    $.get("/foundFiles", function(foundFiles) {
    // put graphml files into dropdown select object
      foundFiles.forEach( function (file){
        filename = file.replace('../data/', '')
        file = file.replace('..', 'http://127.0.0.1:3000/static')
        var gf = file;
        var gfile = document.createElement("OPTION");
        gfile.text=filename;
        gfile.value=gf;
        drpFiles.add(gfile);
      });
    });
  }
}

/* 
read from grphml - file and initialize cy-object
*/
function loadFile() {
  //path = document.getElementById('graphName').value;
  path = document.getElementById('gfiles').value;
  if(!path.endsWith('.graphml')){
    alert('Please give a .graphml-file.');
    return;
  };
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", path, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    graphString = xmlhttp.responseText.split("\n");

    // put node atttributes into dropdown select object
    var drp = document.getElementById("values");      // node attributes
    removeOptions(drp);
    var drpShapes = document.getElementById("nodeShapesAttr");
    removeOptions(drpShapes);

    var sele = document.createElement("OPTION");    
    sele.text = "Choose node's attribute";
    sele.value = "";
    drp.add(sele);
    
    var seleShapes = document.createElement("OPTION");  // shape attributes
    seleShapes.text = "Choose shape's attribute";
    seleShapes.value = "";
    drpShapes.add(seleShapes);

    var drpShape = document.getElementById("nodeShapes"); // shapes
    removeOptions(drpShape);
    var seleShape = document.createElement("OPTION");
    seleShape.text = "Choose shape";
    seleShape.value = "";
    drpShape.add(seleShape);

    const shapesArray = ["rectangle", "octagon", "rhomboid", "pentagon", "tag"];

    shapesArray.forEach(function(s){
      var nodeShape = s;
      var optnShape = document.createElement("OPTION");
      optnShape.text=nodeShape;
      optnShape.value=nodeShape;
      drpShape.add(optnShape);
    })
  
    for (var i = 0; i <= graphString.length - 1; i++) {
      if(graphString[i].includes("for=\"node\"") && 
        (graphString[i].includes("attr.type=\"double\"") || 
          (graphString[i].includes("attr.type=\"boolean\"")))){
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
        }
      };
      if(graphString[i].includes("<node id=\"n0\">")){
        break;
      };
    };
    loadGraphCount ++;
    createCyObject();
  }
  else{
    alert('Invalid file path.');
    return;
  }
};

// initiate cytoscape graph 
function createCyObject(){
  cy = cytoscape({
    container: document.getElementById('cy'),
    ready: function(){
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
          label: 'data(symbol)',
          "text-valign" : "center",
          "text-halign" : "center",
          "font-size" : 10,
          "color":"#b8b8b8"
      }},
      // attributes with numbers
      {selector: 'node[val <0]',
        style: {
          'background-color': 'mapData(val,'+ nodesMin+', 0, #006cf0, white)'
      }},
      {selector: 'node[val >0]',
        style: {
          'background-color': 'mapData(val, 0,'+ nodesMax+', white, #d50000)'
      }},
      {selector: 'node[val = 0]',
        style: {
          'background-color': 'white',
          'color':'#b8b8b8'
      }},

      // attributes with boolean
      {selector: 'node[val = "false"]',
        style: {
          'background-color': '#006cf0'
      }},
      {selector: 'node[val = "true"]',
        style: {
          'background-color': '#d50000'
      }},

      // style edges
      {selector: 'edge',
        style: {
          'target-arrow-shape': 'triangle',
          'arrow-scale' : 2,
          'curve-style' : 'bezier'
        }},
      {selector: 'edge[interaction = \'compound\']',
        style: {
          'target-arrow-shape': 'triangle-backcurve',
        }},
      {selector: 'edge[interaction = \'activaion\']',
        style: {
          'target-arrow-shape': 'triangle',
        }},
      {selector: 'edge[interaction = \'expression\']',
        style: {
          'target-arrow-shape': 'triangle-backcurve',
        }},
      {selector: 'edge[interaction = \'phosphorylation\']',
        style: {
          'target-arrow-shape': 'diamond',
        }},
      {selector: 'edge[interaction = \'inhibition\']',
        style: {
          'target-arrow-shape': 'tee',
        }}
      ]
  });
}