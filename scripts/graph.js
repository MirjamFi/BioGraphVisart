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
      }},
  ]
});

var nodes, edges, path, tracer, nodeVal, outputName, nodeAttributes, graphString;
var firstTime = true;
var loadGraphCount = 0;

// test if object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//remove all options of dropdown
function removeOptions(selectbox)
{
    var i;
    for(i = selectbox.options.length - 1 ; i >= 0 ; i--)
    {
        selectbox.remove(i);
    }
}

// read from grphml - file
function loadFile() {
  path = document.getElementById('graphName').value;
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", path, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    graphString = xmlhttp.responseText.split("\n");
  }
  // put node atttributes into dropdown select object
  var drp = document.getElementById("values");
  removeOptions(drp);
  var sele = document.createElement("OPTION");
  sele.text = "Choose value";
  sele.value = "";
  drp.add(sele);
  for (var i = 0; i <= graphString.length - 1; i++) {
    if(graphString[i].includes("for=\"node\"") && 
      (graphString[i].includes("attr.type=\"double\"") || 
        (graphString[i].includes("attr.type=\"boolean\"")))){
      var nodeattr = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
      var optn = document.createElement("OPTION");
      optn.text=nodeattr;
      optn.value=nodeattr;
      drp.add(optn);
    };
  };
  loadGraphCount ++;
};

// load graphml and create graph of it
function visualize() {
  nodeVal = document.getElementById('values').value;
  $('#visualize').attr("disabled", true);
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
      if(graphString[i].includes("\"v_"+nodeVal+"\"\>")){
        var val = parseFloat(regExp.exec(graphString[i])[1]); // if availabe get node value
        curNode.val = val;
      }
      nodes.push({data: curNode}); 
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
      if(graphString[i].includes("e_interaction")){     // get edges
        var interact = regExp.exec(graphString[i])[1]; // if availabe get logRatio
        curEdge.interaction = interact;
      }
      edges.push({data: curEdge} );
    }
  }
  // add nodes and edges to graph
  if(loadGraphCount > 1){
    cy.elements().remove();
    firstTime = true;
    loadGraphCount = 0;
  }
  cy.add(nodes.concat(edges));
  
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
    download.download = path.replace(".graphml", "_") + '_' + nodeVal + '.png';
  }
  download.click();
}