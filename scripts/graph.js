/*
  create a graph with Cytoscape
*/

var nodes, edges, path, tracer, nodeVal, outputName, nodeAttributes, 
  graphString, oldMin, oldMax, nodeShapeAttr;
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
read from grphml - file and initialize cy-object
*/
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
}


/*
visualize a graph from .graphml-file
*/
function visualize() {

  $('#loadGraphml').attr("disabled", true);

  nodeVal = document.getElementById('values').value;

  // get nodes and edges
  getNodesAndEdges();

  transform01toTF();

  // set min and max for legend
  legendsRange();

  // add nodes and edges to graph
  addNodesAndEdges();

  calculateLayout();

  showLegend();

  showMetaInfo();

  activateNodeShapeChange();
}

//initialize legend
function createLegend(){

  //Append a defs (for definition) element to your SVG
  svg = d3.select("#legend").append("svg");
  svg.attr("width", 189).attr("height", 60);
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

  svg.append("text")      // text label for the x axis
      .attr("x", 179 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text(nodesMax)
      .attr("id",'max');

  svg.append("text")      // text label for the x axis
      .attr("x", 94.5 )
      .attr("y", 50 )
      .style("text-anchor", "middle")
      .text("")
      .attr("id",'legendChanged');
}

//get information of nodes ande edges
function getNodesAndEdges(){
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
      if(graphString[i].includes("v_gene_name")){       // get gene names
        var genename = graphString[i].split("\>")[1].split("\<")[0];
        curNode.genename = genename;
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
      if(graphString[i].includes("e_interaction")){     // get edges interaction type
        var interact = regExp.exec(graphString[i])[1]; 
        curEdge.interaction = interact;
      }
      edges.push({data: curEdge} );
    }
  }
}

//transform 0 and 1 as atttributes to true and false
function transform01toTF(){
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
}

//set legends range by min and max of nodes' attributes
function legendsRange(){
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
    //alert('Legend\'s limits changed');
    oldMax = nodesMax;
    oldMin = nodesMin;
     $("#legendChanged").text("Legend\'s limits changed");
  }
  else{
    $("#legendChanged").text("");
  }
}

//add nodes and edges to cy-object (update if attribute has changed)
function addNodesAndEdges(){
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
}

//calculate graph layout (only once)
function calculateLayout(){
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
}

//show legend
function showLegend(){
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

//show meta-information of nodes by mouseover
function showMetaInfo(){
  cy.nodes().qtip({       // show node attibute value by mouseover
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
function changeNodeShapes(){
  var shapeAttribute = document.getElementById('nodeShapesAttr').value;
  var shape = document.getElementById('nodeShapes').value;

  if(shapeAttribute == "" || shape == ""){
    return;
  }
  var i = 0;
  var id = "";
  /*cy.style()
    .selector('node')        
    .style('shape', 'ellipse')
    .update(); */
  while(i < graphString.length){

    if(graphString[i].includes("node id")){   // get node id
      id = graphString[i].split("\"")[1];
    } 
    else if(id != "" && graphString[i].includes('\"v_'+shapeAttribute+'\">true<')){

      cy.style()
        .selector('node[id ="'+id+'"]')        
        .style('shape', shape)
        .update();

    }
    i++;
  }
  $('#legend').append('<table width="189" border="0" id="shapes"><td colspan="2" rowspan="1"></table>');

  // Find a <table> element with id="myTable":
  var tableShapes = document.getElementById("shapes");

  if(firstShape){
    firstShape = false;
    // Create an empty <thead> element and add it to the table:
    var header = tableShapes.createTHead();

    // Create an empty <tr> element and add it to the first position of <thead>:
    var row = header.insertRow(0);     

    // Insert a new cell (<td>) at the first position of the "new" <tr> element:
    var cell = row.insertCell(0);

    // Add some bold text in the new cell:
    cell.innerHTML = "<b>Attribute</b>";   

    // Insert a new cell (<td>) at the first position of the "new" <tr> element:
    var cell2 = row.insertCell(1);

    // Add some bold text in the new cell:
    cell2.innerHTML = "<b>Shape</b>";
  }

  // add a new row to table containing attribute and shape
  if(isEmpty(usedShapeAttributes) || !usedShapeAttributes.hasOwnProperty(shapeAttribute)){

    // Insert a row in the table at the last row
    var newRow   = tableShapes.insertRow(tableShapes.rows.length);

    // Insert a cell in the row at index 0 (attribute)
    var newCell  = newRow.insertCell(0);

    // Append a text node to the cell
    var newText  = document.createTextNode(shapeAttribute);
    newCell.appendChild(newText);

    usedShapeAttributes[shapeAttribute] = {"row":tableShapes.rows.length-1, "usedShape":shape};

    // Insert a cell in the row at index 1 (shape)
    var newCell2  = newRow.insertCell(1);
    // Append a text node to the cell
    var newText2  = document.createTextNode(shape);
    newCell2.appendChild(newText2);
  }

  // update shape of a attribute already used
  else{
    var rowIndex = usedShapeAttributes[shapeAttribute].row;
    var cellIndex = 1;
    tableShapes.rows[rowIndex].cells[cellIndex].innerHTML = shape;
  }
}

/* 
  download png of graph
*/
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