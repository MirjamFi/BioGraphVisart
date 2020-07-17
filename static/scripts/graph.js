/*
  create a graph with Cytoscape
*/

/*
visualize a graph from .graphml-file
*/

var removedNodes;
function visualize(graphString, noOptn) {
  document.getElementById('loader1').style.visibility = "visibile";
   
   //create cytoscape object; not necessary for json
  // if(!isJson){
    if(!noOptn && !clicked && !defaultVal){
      nodeVal = document.getElementById('values').value;
    }
    if(isJson){
      var nodes = graphString.elements.nodes;
      var edges = graphString.elements.edges;
      var nodeValuesNum = []
      for(let n of nodes){
        if(n.data[nodeVal]){
          nodeValuesNum.push(n.data[nodeVal])
        }
      }
      var interactionTypes=[]
      for(let e of edges){
        interactionTypes.push(e.data.interaction)
      }
      interactionTypes = interactionTypes.flat();
      interactionTypes = new Set(interactionTypes)
      var edgesToMerge = true;
    }
    else{
      // get nodes and edges
      if(isSIF){
      	var nodesAndEdges = getNodesAndEdgesSIF(graphString, nodeVal, "", noOptn);
      }
      else{
  	    var nodesAndEdges = getNodesAndEdges(graphString, nodeVal,"", noOptn);
      }
      var nodes = nodesAndEdges[0];
      var edges = nodesAndEdges[1]; 
      var nodeValuesNum = nodesAndEdges[2];
      interactionTypes = nodesAndEdges[3];
      var edgesToMerge = nodesAndEdges[4]
    }
    if(!noOptn){
        // set min and max for legend
        var range = legendsRange(nodeValuesNum);
        var nodesMin = range[0];
        var nodesMax = range[1];
      };
    // add nodes and edges to graph
    addNodesAndEdges(nodes, edges, nodesMin, nodesMax, noOptn);

  // }
  if(!clicked){
    $('#downloadPDF').removeAttr('disabled');
    $('#downloadPNG').removeAttr('disabled');
    $('#downloadSVG').removeAttr('disabled');
    $('#downloadJSON').removeAttr('disabled');

    document.getElementById('arrows').innerHTML = "";
    createInteractionLegend(interactionTypes, cy, edgesToMerge, noOptn);
    document.getElementById('legend').setAttribute('style','visibility:visible');
    document.getElementById('downloadPart').style.visibility = "visible";
  }
  showMetaInfo(noOptn);
  document.getElementById('loader1').style.visibility = "hidden";
  document.getElementById('selectlayout').setAttribute('style','visibility:visible');

  document.getElementById('resetLayout').onclick= function(){changeLayout(cy)};

  if(! noDrpShapes){
    activateNodeShapeChange();
  }
  
  document.getElementById('KEGGpathsButton').style.visibility ="visible";
  document.getElementById('KEGGpaths').style.visibility ="visible";

    // set background layer to hoghlight pathways
  var layer = createLayoutKeggPathways(cy, nodes, allPaths)
  var canvas = layer.getCanvas();
  var ctx = canvas.getContext('2d');
  document.getElementById('keggpathways').onclick = function(){listKEGGPathways(ctx, cy, nodes, layer, canvas, "")};
  var defaultVal = false;
  

  if(document.getElementById('nodeShapesAttr')){
    cy.style()
      .selector('node['+document.getElementById('nodeShapesAttr').value+' ="true"]')        
      .style('shape', document.getElementById('nodeShapes').value)
      .update();
  }
  addcolorlegend(cy);
}

//add nodes and edges to cy-object (update if attribute has changed)
function addNodesAndEdges(nodes, edges, nodesMin, nodesMax, noOptn){
  cy = cytoscape({
    container: document.getElementById('cy'),
    ready: function(){
          },
    elements: nodes.concat(edges),
    style: [
         // style nodes
      basicstyle,
      {selector: 'node[!'+nodeVal+']',
        style: {
          'background-color': 'white',
          'color':'black'
      }},
      // attributes with numbers
      {selector: 'node['+nodeVal+']['+nodeVal+' < "0"]',
        style: {
          'background-color': 'mapData('+nodeVal+','+ nodesMin+', 0, #006cf0, white)',
          'color': 'black'
      }},
      {selector: 'node['+nodeVal+']['+nodeVal+' <='+0.5*nodesMin+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node['+nodeVal+']['+nodeVal+' > "0"]',
        style: {
          'background-color': 'mapData('+nodeVal+', 0,'+ nodesMax+', white, #d50000)',
          'color': 'black'
      }},
      {selector: 'node['+nodeVal+']['+nodeVal+' >='+0.5*nodesMax+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node['+nodeVal+']['+nodeVal+' = "0"]',
        style: {
          'background-color': 'white',
          'color':'black'
      }},

      // attributes with boolean
      {selector: 'node['+nodeVal+']['+nodeVal+' = "false"]',
        style: {
          'background-color': '#006cf0',
          'color':'white'
      }},
      {selector: 'node['+nodeVal+']['+nodeVal+' = "true"]',
        style: {
          'background-color': '#d50000',
          'color':'white'
      }},

      {selector: 'node[id = "l1"]',
        style:{
          'color': 'black',
          'background-height':50,
          'background-width':200,
          'background-position-y':'100%',
          'shape': 'rectangle',
          'width':200,
          'height':50,
          'border-width':1,
          'text-valign' : 'bottom',
          'text-max-width': 200
      }},

      // style edges
      basicedgestyle,
      actstyle,
      expstyle,
      inhistyle, 
      reprstyle,
      bindstyle,
      dissostyle,
      compstyle,
      indeffstyle,
      missstyle,
      statestyle,
      phosphostyle,
      dephosphostyle,
      glycostyle,
      ubiquistyle,
      methystyle
      ]
  });
  changeLayout(cy);
  if(nodes.every(function(x){return(x.data["symbol"])})){
    for(n=0; n < nodes.length; n++){
      cy.batch(function(){
        var labelText = nodes[n].data.symbol;
        var oldLabelText = nodes[n].data.symbol;
          while(getTextWidth(labelText, fontSize +" arial") > 49){
            oldLabelText = oldLabelText.slice(0,-1);
            labelText = oldLabelText+'...';
          }
         // }
         cy.$('node[id =\''  + nodes[n].data.id + '\']').style("label", labelText);
      });
    }
  }
  else{
    for(n=0; n < nodes.length; n++){
      cy.batch(function(){
        var labelText = nodes[n].data.name;
        var oldLabelText = nodes[n].data.name;
          while(getTextWidth(labelText, fontSize +" arial") > 49){
            oldLabelText = oldLabelText.slice(0,-1);
            labelText = oldLabelText+'...';
          }
         // }
         cy.$('node[id =\''  + nodes[n].data.id + '\']').style("label",labelText);
      });
    }
  }
  for(var e =0; e < edges.length; e++){
      cy.batch(function(){
        if(Array.isArray(edges[e].data.interaction) || edges[e].data.interaction.split(",").length > 1){
            cy.$('edge[id =\''  + edges[e].data.id + '\']').style('target-arrow-shape', 'vee').style('line-style','solid');
        }
      });
    }
  // on tap
  cy.nodes().noOverlap({ padding: 5 });
  if(!noOptn){
  // calculate label position for legend and style legend
    var fontSize = 10;
    calculateLabelColorLegend(nodeVal, fontSize, cy, nodesMin, nodesMax);
   }

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


  // update node values if tracer or values change
  if(!firstTime){
    for(n=0; n < nodes.length; n++){
      cy.batch(function(){
      cy.$('node[id =\''  + nodes[n].data.id + '\']')
        .data(nodeVal, nodes[n].data[nodeVal])
      });
    }
  }
}


//show meta-information of nodes by mouseover
function showMetaInfo(noOptn){
  if(! noOptn || isJson){
    cy.elements('node').qtip({       // show node attibute value by mouseover
        show: {   
          event: 'mouseover', 
          solo: true,
        },
        content: {text : function(){
          if(!isNaN(parseFloat(this.data()[nodeVal]))){
            if(this.data('symbol') != undefined){
               return '<b>'+ this.data('symbol') +'</b><br>' + 
               '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2)}
             else if(this.data('name') != undefined){
               return '<b>'+ this.data('name')+'</b><br>' +
               '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2)}
             } //numbers          
          else{
            if(this.data('symbol') != undefined){
               return '<b>'+ this.data('symbol') +'</b><br>' + 
               '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal];
             }
            else if(this.data('name') != undefined){
             return '<b>'+ this.data('name')+'</b><br>' +
             '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal];
            }
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
   else if(!isJson && noOptn){
     cy.elements('node').qtip({       // show node attibute value by mouseover
         show: {   
           event: 'mouseover', 
           solo: true,
         },
         content: {text : function(){
           if(this.data('symbol')){
             return '<b>'+ this.data('symbol') +'</b>'; } //numbers
           else if(this.data('name')){
             return '<b>'+ this.data('name')+'</b>';
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
      cy.elements('edge').qtip({       // show node attibute value by mouseover
        show: {   
          event: 'mouseover', 
          solo: true,
        },
        content: {text : function(){
            return '<b>'+this.data()['interaction'] +'</b> ' 
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

/* undo deletion of nodes */
function undoDeletion(){
  entry = removedNodes.pop()
  if(entry != undefined){
    entry.restore();
  }
}




