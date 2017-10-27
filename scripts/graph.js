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
var legendDrawn = false;

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
  console.log(path.endsWith('.graphml'));
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
    }
  else{
    alert('Invalid file path.');
    return;
  }
  
};

function createLegend(){
  document.getElementById('legend').setAttribute('style','visibility:visible');

  //Append a defs (for definition) element to your SVG
  var svg = d3.select("#legend").append("svg");
  svg.attr("width", 189).attr("height", 220);
  var defs = svg.append("defs");

  //Append a linearGradient element to the defs and give it a unique id
  var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

  linearGradient.selectAll("stop") 
    .data([                             
        {offset: "0%", color: "#0000ff"}, 
        {offset: "50%", color: "#ffffff"},          
        {offset: "100%", color: "#ff0000"}    
      ])                  
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; }) 
    .attr("stop-color", function(d) { return d.color; });

  svg.append("rect")
  .attr("width", 189)
  .attr("height", 20)
  .style("fill", "url(#linear-gradient)");

  svg.append("text")      // text label for the x axis
        .attr("x", 10 )
        .attr("y", 29 )
        .style("text-anchor", "middle")
        .text("-10");
  svg.append("text")      
      .attr("x", 94.5 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text("0");
  svg.append("text")      
      .attr("x", 94.5 )
      .attr("y", 40 )
      .style("text-anchor", "middle")
      .text("log2ratio");
  svg.append("text")      // text label for the x axis
      .attr("x", 183 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text("10");

  //document.getElementById("defs").setAttribute('style','visibility:visible');*/

  $('#visualize').attr("disabled", true);
}

// load graphml and create graph of it
function visualize() {

  nodeVal = document.getElementById('values').value;
  
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
      if(!legendDrawn){
        legendDrawn = true;
        createLegend();
      }
      cy.layout({
      name: 'cose',//'breadthfirst',
        }).run();
      $('#download').removeAttr('disabled');
  }

}

// download png of graph
function downloadPNG(){
  outputName = document.getElementById('outputName').value;
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