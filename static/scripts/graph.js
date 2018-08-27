/*
  create a graph with Cytoscape
*/

/*
visualize a graph from .graphml-file
*/
function visualize() {

  $('#graphName').attr("disabled", true);
  $('#loadGraphml').attr("disabled", true);

  nodeVal = document.getElementById('values').value;

  $('#gfiles').attr("disabled", true);
  // get nodes and edges
  nodeValuesNum = getNodesAndEdges();

  nodeValuesNum = transform01toTF(nodeValuesNum);

  // set min and max for legend
  legendsRange(nodeValuesNum);
  // add nodes and edges to graph
  addNodesAndEdges();

  calculateLayout();

  showLegend();

  document.getElementById('downloadPart').style.visibility = "visible";

  showMetaInfo();

  activateNodeShapeChange();

}

//initialize legend
function createLegend(){
  var defs = svg.append("defs");

  if(nodesMin === "false"){
    svg.append("rect")
    .attr("width", 99)
    .attr("height", 20)
    .style("fill", "#006cf0")
    .attr("x", 0);
     svg.append("rect")
    .attr("width", 99)
    .attr("height", 20)
    .attr("x", 99)
    .style("fill", "#d50000");
  }
  else{
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
}
  if(Number.isFinite(nodesMin)){
    svg.append("text")      
      .attr("x", 94.5 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text("0")
      .attr("id", "mid");
  }

  svg.append("text")      // text label min
        .attr("x", 12 )
        .attr("y", 29 )
        .style("text-anchor", "middle")
        .text(nodesMin)
        .attr("id", 'min');

  svg.append("text")      // text label max
      .attr("x", 179 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text(nodesMax)
      .attr("id",'max');

  svg.append("text")      // text label mid
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
  sorafenibTargets = [];
  oncogenes = [];
  variants=[];
  varSor = [];
  varOnc = [];
  oncSor = [];
  oncSorVar = [];
  drivers = [];
  driOnc = [];
  driOncSor = [];
  driOncVar = [];
  driOncSorVar = [];
  driSor = [];
  driSorVar = [];
  driVar = [];
  nodeValuesNum = [];
  attributesTypes = {};


  var regExp = /\>([^)]+)\</; // get symbol name between > <

  for (var i = 0; i <= graphString.length - 1; i++) {
    if(graphString[i].includes("attr.type=")){
      //var curAttr = {};
      attributesTypes[graphString[i].split(" ")[3].split("\"")[1]] = graphString[i].split(" ")[6].split("\"")[1];
      //attributesTypes.push(curAttr);
    }
    if(graphString[i].includes("node id")){   // get node id
      var curNode = {};
      curNode.id = graphString[i].split("\"")[1]  ;
      nodes.push({data: curNode});
    }
    if(!isEmpty(curNode)){
      if(graphString[i].includes("symbol\"\>")){  // get symbol of node
        var symbol = regExp.exec(graphString[i])[1];
        curNode.symbol = symbol;
      }
      if(graphString[i].includes("\"v_"+nodeVal+"\"\>")){
        var val = regExp.exec(graphString[i])[1]; // if availabe get node value
        if(!isNaN(parseFloat(val))){
          attrID = graphString[i].split(" ")[7].split("\"")[1];
          currVal = {};
          currVal.val = parseFloat(val);
          currVal.attr = attributesTypes[attrID];;
          nodeValuesNum.push(currVal);
        }
        else if(val === "false" || val === "true"){
          currVal = {};
          currVal.val = val;
          currVal.attr = "boolean";
          nodeValuesNum.push(currVal);
        }
        curNode.val = currVal.val;
      }
      if(graphString[i].includes("v_gene_name")){       // get gene names
        var genename = graphString[i].split("\>")[1].split("\<")[0];
        curNode.genename = genename;
      }
       
      //attributes for icons
      if(graphString[i].includes("\"v_sorafenib_targets\">true")){
        var sorafenibTarget = curNode.id;
        sorafenibTargets.push(sorafenibTarget);
      }

      if(graphString[i].includes("v_oncogenes_vogelstein\">true")){
        var oncogene = curNode.id;
        if(oncogene == sorafenibTarget && !oncSor.includes(variant)){
          oncSor.push(curNode.id);
          sorafenibTargets.pop();
        }
        else{
          oncogenes.push(oncogene);
        }
      }

    if(graphString[i].includes("v_vcf_Sift\">1") || 
      graphString[i].includes("v_vcf_PolyPhen2\">1") || 
      graphString[i].includes("v_vcf_MetaLR\">1")){
        var variant = curNode.id;
        if(variant == sorafenibTarget && !varSor.includes(variant)){
          varSor.push(curNode.id);
          sorafenibTargets.pop();
        }
        if(variant == oncogene){
          varOnc.push(curNode.id);
          oncogenes.pop();
        }
        if(variant == oncogene && variant == sorafenibTarget && !oncSorVar.includes(variant)){
          oncSorVar.push(curNode.id);
          sorafenibTargets.pop();
          oncogenes.pop();
          varSor.pop();
          oncSor.pop()
        }
        else{
           variants.push(variant);
        }
      }
      
    }

    if(graphString[i].includes("v_drivers_Uniprot\">true") || 
      graphString[i].includes("v_drivers_tsgene\">true") || 
      graphString[i].includes("v_drivers_vogelstein\">true")||
      graphString[i].includes("v_drivers_Rubio-Perez\">true") ||
      graphString[i].includes("v_drivers_cosmic\">true")){
        var driver = curNode.id;
        if(driver == sorafenibTarget && !driSor.includes(driver)){
          driSor.push(curNode.id);
          sorafenibTargets.pop();
        }
        if(driver == oncogene && !driOnc.includes(driver)){
          driOnc.push(curNode.id);
          oncogenes.pop();
        }
        if(driver == variant && !driVar.includes(driver)){
          driVar.push(driver);
          variants.pop();
        }
        if(driver == oncogene && driver == sorafenibTarget && !driOncSor.includes(driver)){
          driOncSor.push(curNode.id);
          sorafenibTargets.pop();
          oncogenes.pop();
          driOnc.pop();
          driSor.pop();
        }
        if(driver == oncogene && driver == variant && !driOncVar.includes(driver)){
          driOncVar.push(curNode.id);
          oncogenes.pop();
          variants.pop();
          driOnc.pop();
          driVar.pop();
        }
        if(driver == sorafenibTarget && driver == variant && !driSorVar.includes(driver)){
          driSorVar.push(curNode.id);
          sorafenibTargets.pop();
          variants.pop();
          driSor.pop();
          driVar.pop();
        }
        if(driver == oncogene && driver == sorafenibTarget && driver == variant && !driOncSorVar.includes(driver)){
          driOncSorVar.push(curNode.id);
          sorafenibTargets.pop();
          oncogenes.pop();
          variants.pop();
          driSor.pop();
          driOnc.pop();
          driVar.pop();
        }
        if(! drivers.includes(driver)){
           drivers.push(driver);
          }
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
  return nodeValuesNum;
}

//transform 0 and 1 as atttributes to true and false
function transform01toTF(nodeValuesNumT){
  // if attributes values are only 0 or 1 make them boolean
  nodeValues = [];
  lenNodeValues = nodeValuesNumT.length;
  // attribute not available 
  if(isEmpty(nodeValuesNumT)){
      return [];
  }
  else if(!isEmpty(nodeValuesNumT)){
    for(var i=0; i < nodeValuesNumT.length; i++){
      attrType = Object.entries(nodeValuesNumT[i])[1][1];
      // boolean attributes and boolean atribtes tored as 0 or 1
      if(attrType == "boolean" ){
          if(Object.entries(nodeValuesNumT[i])[0][1] == 0){
            nodeValues.push("false");
          }
          if(Object.entries(nodeValuesNumT[i])[0][1] == 1){
            nodeValues.push("true"); 
          } 
       // }
        delete nodeValuesNumT[i];  
        lenNodeValues -=1;
      }
      
      // double attributes
      if(attrType === "double"){
        //nodeEntry.data.val = Object.entries(nodeValuesNumT[i])[0][1];
        nodeValues.push(Object.entries(nodeValuesNumT[i])[0][1])
      }
    }
  }
  if(lenNodeValues == 0){
    return ["empty"];
  } 
  
  return nodeValues;
  
}

//set legends range by min and max of nodes' attributes
function legendsRange(nodeValuesNum){
  if(!isEmpty(nodeValuesNum)){
    if(!nodeValuesNum.includes("empty")){
      //nodesMin = parseFloat(Math.max.apply(Math,nodeValuesNum).toFixed(2));
      //nodesMax = parseFloat(Math.max.apply(Math,nodeValuesNum).toFixed(2));
      nodesMin = nodeValuesNum.reduce(function(a, b) {
                  return parseFloat(Math.min(a, b).toFixed(2));
                });
      nodesMax = nodeValuesNum.reduce(function(a, b) {
            return parseFloat(Math.max(a, b).toFixed(2));
          });
    if(!firstTime){
      if(nodesMin>oldMin){
        nodesMin = oldMin;
      }
      if(nodesMax<oldMax){
        nodesMax = oldMax;
      }
    }

    if(nodesMin >= 0){
      nodesMin = -1.0;
    }
    if(nodesMax <= 0){
      nodesMax = 1.0;
    }
  }
    else{
      nodesMin = "false";
      nodesMax = "true";
    }
  }
  
  else if(isEmpty(nodeValuesNum)){
    nodesMin = "false";
    nodesMax = "true";
  }

  if((!firstTime && !(nodesMax === oldMax)) || (!firstTime && !(nodesMin === oldMin))){
    oldMax = nodesMax;
    oldMin = nodesMin;
    $("#svgid").empty();
    createLegend();
     $("#legendChanged").text("Legend\'s limits changed");
  }
  else{
    $("#legendChanged").text("");
  }
}

//add nodes and edges to cy-object (update if attribute has changed)
function addNodesAndEdges(){

  cy.add(nodes.concat(edges));

  for(var i = 0, len = sorafenibTargets.length; i < len; i++){
    n = sorafenibTargets[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
      .style('background-image', pill_black) 
      .style('background-height','40%')
      .style('background-width','40%')
      .style('background-position-y','90%')
      //.style('color','#b8b8b8');
    });
  };

  for(var i = 0, len = oncogenes.length; i < len; i++){
    n = oncogenes[i];
    cy.batch(function(){
      cy.$('node[id=\''+n+'\']')
        .style('background-image', disease_black) 
        .style('background-height','40%')
        .style('background-width','40%')
        .style('background-position-y','90%')
        });
  };
  for(var i = 0, len = variants.length; i < len; i++){
    n = variants[i];
    cy.batch(function(){
      cy.$('node[id=\''+n+'\']')
        .style('background-image', variant_black) 
        .style('background-height','40%')
        .style('background-width','40%')
        .style('background-position-y','90%')
        });
  };

  for(var i = 0, len = varSor.length; i < len; i++){
    n = varSor[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', variant_pill) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','93%')
        });
  };

  for(var i = 0, len = varOnc.length; i < len; i++){
    n = varOnc[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', variant_disease) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','93%')
        });
  };

  for(var i = 0, len = oncSor.length; i < len; i++){
    n = oncSor[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', pill_disease) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
        });
  };

  for(var i = 0, len = oncSorVar.length; i < len; i++){
    n = oncSorVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', pill_disease_variant) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
      });
  };

  for(var i = 0, len = drivers.length; i < len; i++){
    n = drivers[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_black) 
        .style('background-height','40%')
        .style('background-width','40%')
        .style('background-position-y','93%')
      });
  };

  for(var i = 0, len = driSor.length; i < len; i++){
    n = driSor[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_pill) 
        .style('background-height','60%')
        .style('background-width','60%')
        .style('background-position-y','93%')
        });
  };

  for(var i = 0, len = driVar.length; i < len; i++){
    n = driVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_variant) 
        .style('background-height','60%')
        .style('background-width','60%')
        .style('background-position-y','93%')
        });
  };

  for(var i = 0, len = driOnc.length; i < len; i++){
    n = driOnc[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_disease) 
        .style('background-height','50%')
        .style('background-width','50%')
        .style('background-position-y','99%')
        });
  };

  for(var i = 0, len = driSorVar.length; i < len; i++){
    n = driSorVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_variant_pill) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
        });
  };

  for(var i = 0, len = driOncVar.length; i < len; i++){
    n = driOncVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_variant_disease) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
        });
  };
  for(var i = 0, len = driOncSor.length; i < len; i++){
    n = driOncSor[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_pill_disease) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
      });
  };
  for(var i = 0, len = driOncSorVar.length; i < len; i++){
    n = driOncSorVar[i];
    cy.batch(function(){
    cy.$('node[id=\''+n+'\']')
        .style('background-image', gene_pill_disease_variant) 
        .style('background-height','40%')
        .style('background-width','50%')
        .style('background-position-y','90%')
        });
  };
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

      cy.layout({
      name: 'dagre',
        // Whether to fit the network view after when done
      fit: true,

      // Padding on fit
      padding: 30
        }).run();
      $('#download').removeAttr('disabled');

      // create Legend
      svg = d3.select("#legend").append("svg")
      .attr("id", "svgid");
      svg.attr("width", 189).attr("height", 60);
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
  cy.elements('node').qtip({       // show node attibute value by mouseover
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

  // select nodes with given attribute
  var i = 0;
  var id = "";
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

  // list all shapes already used
  usedShapes = []
  for (var key in usedShapeAttributes) {
    if (Object.prototype.hasOwnProperty.call(usedShapeAttributes, key)) {
        var val = usedShapeAttributes[key];
        usedShapes[val] = key;
    }
  }

  // no shapes have been used so far
  if(isEmpty(usedShapeAttributes)){
    usedShapeAttributes[shapeAttribute] = shape;
     shapeNode = cytoscape({
        container: document.getElementById('legend'),
        layout: {
          name: 'preset'
        },
        style: [
            {selector: 'node',
              style: {
              width: 18,
              height: 18,
              shape: shape,
              'background-color': '#666666',
              label: 'data(id)',
              'font-size': 10
            }
          }
        ]
      });
 
   shapeNode.add({ // node n1
              group: 'nodes', 

              data: { 
                id: shapeAttribute, 
              },
              position: { // the model position of the node (optional on init, mandatory after)
                x: 94,
                y: 50
              }
            });
   ycoord = 50;
  } 

  // test if shape has been used for another attribute
  else if(Object.keys(usedShapes).includes(shape)){
    if(usedShapes[shape] == shapeAttribute) return;
    var replace = confirm("Shape is already used. Do you want to replace "+usedShapes[shape]+" by "+ shapeAttribute+"?")

    // is shape has been used change previous attributes shape back to ellipse
    if(replace){
      delete(usedShapeAttributes[usedShapes[shape]]);
      ycoord = shapeNode.$('node[id ="'+usedShapes[shape]+'"]').position()['y']-35;
      shapeNode.remove('node[id ="'+usedShapes[shape]+'"]');

      var i = 0;
      var id = "";
      while(i < graphString.length){

        if(graphString[i].includes("node id")){   // get node id
          id = graphString[i].split("\"")[1];
        } 
        else if(id != "" && graphString[i].includes('\"v_'+usedShapes[shape]+'\">true<')){

          cy.style()
            .selector('node[id ="'+id+'"]')        
            .style('shape', 'ellipse')
            .update();

        }
        i++;
      }
    }
    else return;

  }
  
  // update shape of a attribute already used
  if (usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    shapeNode.style()
      .selector('node[id ="'+shapeAttribute+'"]')        
      .style('shape', shape)
      .update();
    usedShapeAttributes[shapeAttribute] = shape;
    usedShapes[shape] = shapeAttribute
  }

  // add new shape and attribute
  else if(!isEmpty(usedShapeAttributes) && !usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    ycoord = ycoord + 35;
    usedShapeAttributes[shapeAttribute] = shape;
    shapeNode.add( { group: "nodes", data: { id: shapeAttribute}, position:{'x':94, 'y':ycoord}});
    shapeNode.style()
        .selector('node[id ="'+shapeAttribute+'"]')        
        .style('shape', shape)
        .update();
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
     fileName = path.replace(".graphml", "_").split('data')[1].slice( 1 ) ;
     download.download = fileName + '_' + nodeVal + '.png';
  }
  download.click();
}
