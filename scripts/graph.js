/*
  create a graph with Cytoscape
*/


/* 
initiate cytoscape graph 
*/
var cy = cytoscape({
  container: document.getElementById('cy'),
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
        "font-size" : 10
    }},
    {selector: 'node[val < 0]',
      style: {
        'background-color': 'mapData(val, -10, 0, blue, white)'
    }},
    {selector: 'node[val > 0]',
      style: {
        'background-color': 'mapData(val, 0, 10, white, red)'
    }},

    // style edges
    {selector: 'edge',
      style: {
        'mid-target-arrow-shape': 'triangle',
      }},
  ]
});

var nodes, edges, path, tracer, nodeVal, outputName;
var firstTime = true;

// test if object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// read from grphml - file
function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}

// load graphml and create graph of it
function visualize() {

  // load file
  path = document.getElementById('graphName').value;
  tracer = document.getElementById('tracerInput').value;
  nodeVal = document.getElementById('values').value;

  if(tracer == ""){
    alert('Select a tracer.');
  }
  if(nodeVal == ""){
    alert('Select a value for nodes.');
  }
  // load graphml
  graphString = loadFile(path).split("\n");


  // get nodes and edges
  nodes = [];
  edges = [];

  var regExp = /\>([^)]+)\</; // get symbol name between > <

  for (var i = 0; i <= graphString.length - 1; i++) {
    if(graphString[i].includes("node id")){   // get node id
      var curNode = {};
      curNode.id = graphString[i].split("\"")[1]  ;
    }
    if(!isEmpty(curNode)){
      if(graphString[i].includes("symbol\"\>")){  // get symbol of node
        var symbol = regExp.exec(graphString[i])[1];
        curNode.symbol = symbol;
      }
      if(graphString[i].includes("\"v_"+tracer+"_"+nodeVal+"\"\>")){
        var val = parseFloat(regExp.exec(graphString[i])[1]); // if availabe get logRatio
        curNode.val = val;
      }
      nodes.push({data: curNode}); 
    }

    if(graphString[i].includes("edge source")){     // get edges
      s = graphString[i].split("\"")[1];
      t = graphString[i].split("\"")[3];
      edges.push({data: {id: s.concat(t), source: s, target: t}} );
    }
  }
  // add nodes and edges to graph

  cy.add(nodes.concat(edges))
  
  // update node values if tracer or values change
  if(!firstTime){
    for(n=0; n < nodes.length; n++){
      cy.batch(function(){
      cy.$('node[id =\''  + nodes[n].data.id + '\']')
        .data('val', nodes[n].data.val)
      });
    }
  }
  // calculate layout only once
  if(firstTime){
      firstTime = false;
      cy.layout({
      name: 'cose',//'breadthfirst',
        }).run();
      $('#download').removeAttr('disabled');
  }

}

// download png of graph
function downloadPNG(){
  outputName = document.getElementById('outputName').value;
  //generate PNG image to display from "id = downloadPNG"
  var png64 = cy.png();
  $('#downloadPNG').attr('href', png64);
  var download = document.createElement('a');
  download.href = 'data:image/png;base64;'+png64;
  if(outputName != "File name"){
    download.download = outputName + '.png';
  }
  else{
    download.download = path.replace(".graphml", "_" + tracer) + '_' + nodeVal + '.png';
  }
  download.click();
}