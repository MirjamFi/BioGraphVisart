/*
  create a graph with Cytoscape
*/

var nodes, edges, path, tracer, nodeVal, outputName, nodeAttributes, graphString, oldMin, oldMax;
var firstTime = true;
var loadGraphCount = 0;
var legendDrawn = false;
var svg;
var  nodesMin = -1;
var nodesMax = 1;

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
          'background-color': 'white'
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

// read from grphml - file
function loadFile() {
  path = document.getElementById('graphName').value;
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

  //Append a defs (for definition) element to your SVG
  svg = d3.select("#legend").append("svg");
  svg.attr("width", 189).attr("height", 220);
  var defs = svg.append("defs");

  //Append a linearGradient element to the defs and give it a unique id
  var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

  linearGradient.selectAll("stop") 
    .data([                             
        {offset: "0%", color: "#006cf0"}, 
        {offset: "50%", color: "#ffffff"},          
        {offset: "100%", color: "#d50000"}    
      ])                  
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; }) 
    .attr("stop-color", function(d) { return d.color; });

  svg.append("rect")
  .attr("width", 189)
  .attr("height", 20)
  .style("fill", "url(#linear-gradient)");

  if(Number.isFinite(nodesMin)){
    svg.append("text")      
      .attr("x", 94.5 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text("0")
      .attr("id", "mid");
  }

  svg.append("text")      // text label for the x axis
        .attr("x", 12 )
        .attr("y", 29 )
        .style("text-anchor", "middle")
        .text(nodesMin)
        .attr("id", 'min');

  /*svg.append("text")      // legend title
      .attr("x", 94.5 )
      .attr("y", 40 )
      .style("text-anchor", "middle")
      .text("")*/
  svg.append("text")      // text label for the x axis
      .attr("x", 179 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text(nodesMax)
      .attr("id",'max');

}

// load graphml and create graph of it
function visualize() {

  $('#loadGraphml').attr("disabled", true);

  nodeVal = document.getElementById('values').value;

  // get nodes and edges
  nodes = [];
  edges = [];
  nodeValuesNum = [];

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
        var val = regExp.exec(graphString[i])[1]; // if availabe get node value
        if(!isNaN(parseFloat(val))){
          val = parseFloat(val);
          nodeValuesNum.push(val);
        }
        curNode.val = val;
      }
      if(!curNode.val){
        curNode.val = 0;
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

  // if attributes values are only 0 or 1 make them boolean
  if(!isEmpty(nodeValuesNum)){
    uniqueVals = new Set(nodeValuesNum);
    if(uniqueVals.size === 2){
      nodes.forEach( function(nodeEntry){
        if(nodeEntry.data.val === 0){
           nodeEntry.data.val = "false";
        }
        if(nodeEntry.data.val === 1){
           nodeEntry.data.val = "true";
        }   
      });
      nodeValuesNum = ["empty"]
    }
  }

  // set min and max for legend
  if(!isEmpty(nodeValuesNum)){
    if(!nodeValuesNum.includes("empty")){
      nodesMin = parseFloat(Math.max.apply(Math,nodeValuesNum).toFixed(2));
      nodesMax = parseFloat(Math.max.apply(Math,nodeValuesNum).toFixed(2));
    }
    if(!firstTime){
      if(nodesMin>oldMin){
        nodesMin = oldMin;
      }
      if(nodesMax<oldMax){
        nodesMax = oldMax;
      }
    }

    if(nodesMin >= 0 ){
      nodesMin = -1.0;
    }
    if(nodesMax <= 0){
      nodesMax = 1.0;
    }
  }
  
  else if(isEmpty(nodeValuesNum)){
    nodesMin = "false";
    nodesMax = "true";
  }

  if((!firstTime && !(nodesMax === oldMax)) || (!firstTime && !(nodesMin === oldMin))){
    alert('Legend\'s limits changed');
    oldMax = nodesMax;
    oldMin = nodesMin;
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

  // calculate layout and legend only once
  if(firstTime){
      firstTime = false;
      if(!legendDrawn){
        legendDrawn = true;
      }
      cy.layout({
      name: 'cose',//'breadthfirst',
        }).run();
      $('#download').removeAttr('disabled');
      createLegend();
      oldMin = nodesMin;
      oldMax = nodesMax;

  }

  // show legend and update if necessary
  document.getElementById('legend').setAttribute('style','visibility:visible');
  if(!isNaN(nodesMin) && (!isNaN(nodesMax)))  {    // numerical attribute
    $("#mid").text("0");
    $("#min").text(nodesMin);
    $("#max").text(nodesMax);

    cy.style()                // update the elements in the graph with the new style
      .selector('node[val <0]')
          .style('background-color', 'mapData(val,'+ nodesMin+', 0, #006cf0, white)')
    .update();
    cy.style()
      .selector('node[val >0]')
        .style('background-color', 'mapData(val,0,'+ nodesMax+', white, #d50000)')
      .update(); 

  }
  else{
    $("#mid").text("");         // boolean attribute
  
    $("#min").text(nodesMin);
    $("#max").text(nodesMax);
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