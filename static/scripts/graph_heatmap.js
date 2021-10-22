/*
  create a graph with Cytoscape
*/
var path;
var nodes;
var colorschemePathsLeft = [];
var colorschemePathsRight = [];
var colorschemePathsMerge = [];
var leftEdges = [];
var rightEdges = [];
  var graphLeft;
  var graphRight;
/*
visualize a graph from .graphml-file
*/
function visualize(firstTime=false, files, example) { 
  // move edge legend when scrolling
  if(!!right){
    var cys = ['cyLeft', 'cyRight'];
    jQuery(window).scroll(function() {
      if (jQuery(window).scrollTop() >= document.getElementById("right").offsetTop-700 && !!right) {
          jQuery("#legend_heatmap").css({
            "top": document.getElementById("right").offsetTop + "px",
            "left": (jQuery(window).scrollLeft()) + "px",
            "position":"absolute",
            "margin-top":0+"px",
            "margin-left":10+"px"
        });
      }
      else if(jQuery(window).scrollTop() <= document.getElementById("left").offsetTop && !!right){
      // if($(window).scrollTop() <= window.innerHeight/2){
        jQuery("#legend_heatmap").css({
          "top": document.getElementById("left").offsetTop +"px",
          "left": (jQuery(window).scrollLeft()) + "px",
          "position":"absolute",
          "margin-top":0+"px",
          "margin-left":10+"px"
        });
      }
    });
  }
  else{
    var cys = ['cyLeft'];
    // document.getElementById("legendGraphsRight").innerHTML="";
    document.getElementById('downloadPartRight').style.visibility = "hidden";
    document.getElementById('resetRight').style.visibility = "hidden";
    document.getElementById('right').style.visibility = "hidden";
    document.getElementById('keggpathwaysRight').style.visibility = "hidden";
  }
  var interactionTypes;
  var leftNodes;
  var leftEdges;
  var rightNodes;
  var rightEdges;
  var edgesToMergeLeft;
  var edgesToMergeRight;
  cys.forEach(function(cyO){
    // get nodes and edges 
    if(cyO == 'cyLeft'){
      leftGraph = true;
      graphString = graphStringLeft;
      if(isSIF){
        var leftnodesAndEdges = getNodesAndEdgesSIF(graphString, 'left');
      }
      else{
        var leftnodesAndEdges = getNodesAndEdges(graphString,nodeVal,'left');
      }
      leftNodes = leftnodesAndEdges[0];
      leftEdges = leftnodesAndEdges[1]; 
      var leftNodeValuesNum = leftnodesAndEdges[2];
      interactionTypes = leftnodesAndEdges[3];
      edgesToMergeLeft = leftnodesAndEdges[4]
      var drugedgesleft = leftnodesAndEdges[5]
      // set min and max for legend  and add nodes and edges to graph
      var leftRange = legendsRange(leftNodeValuesNum);
      var leftNodesMin = leftRange[0];
      var leftNodesMax = leftRange[1];
      graphLeft= createCyObject(cyO, leftNodesMin, leftNodesMax, nodeVal);
      addNodesAndEdges(graphLeft, leftNodes, leftEdges, leftFirstTime, leftNodesMin, leftNodesMax, drugedgesleft);
      var api = graphLeft.expandCollapse('get');
      var options = {
        layoutBy: null, // to rearrange after expand/collapse. It's just layout options or whole layout function. Choose your side!
        // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
        fisheye: false, // whether to perform fisheye view after expand/collapse you can specify a function too
        animate: true, // whether to animate on drawing changes you can specify a function too
        animationDuration: 1000, // when animate is true, the duration in milliseconds of the animation
        ready: function () {}, // callback when expand/collapse initialized
        undoable: true, // and if undoRedoExtension exists,

        cueEnabled: true, // Whether cues are enabled
        expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
        expandCollapseCueSize: 12, // size of expand-collapse cue
        expandCollapseCueLineSize: 8, // size of lines used for drawing plus-minus icons
        expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
        collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
        expandCollapseCueSensitivity: 1, // sensitivity of expand-collapse cues
        edgeTypeInfo: "interaction", // the name of the field that has the edge type, retrieved from edge.data(), can be a function, if reading the field returns undefined the collapsed edge type will be "unknown"
        groupEdgesOfSameTypeOnCollapse : true, // if true, the edges to be collapsed will be grouped according to their types, and the created collapsed edges will have same type as their group. if false the collapased edge will have "unknown" type.
        allowNestedEdgeCollapse: true, // when you want to collapse a compound edge (edge which contains other edges) and normal edge, should it collapse without expanding the compound first
        zIndex: 999 // z-index value of the canvas in which cue ımages are drawn
      };
      api.collapseAll(options)
      document.getElementById('downloadPDF').style.visibility = "visible";
      document.getElementById('downloadPDF').disabled = false;
      showConfigurationParts('Left', graphLeft, left);
      resetLayout(graphLeft, "Left");      
      showMetaInfo(graphLeft, nodeVal);
      // set background layer to hoghlight pathways
      var layerLeft = createLayoutKeggPathways(graphLeft, allPathsLeft, "Left")
      var canvasLeft = layerLeft.getCanvas();
      var ctxLeft = canvasLeft.getContext('2d');
      showKEGGParts('Left', ctxLeft, graphLeft, leftNodes, layerLeft, canvasLeft)

      graphLeft.on('tap', 'node',function(evt){
        highlightNodeTapped(evt.target.data().symbol, graphLeft);
        evt.target.addClass('highlighted');
        if(right){
          highlightNodeTapped(evt.target.data().symbol, graphLeft, graphRight);
        }
      })
      graphLeft.on('tap', function(event){
        var evtTarget = event.target;
        if( evtTarget === graphLeft ){
          graphLeft.$('node').removeClass('highlighted')
          if(right){
            graphRight.$('node').removeClass('highlighted')
          }
        }
      });
    }
    else if(cyO = 'cyRight'){
      leftGraph = false;
      graphString = graphStringRight;
      if(isSIF){
        var rightnodesAndEdges = getNodesAndEdgesSIF(graphString, 'right');
      }
      else{
        var rightnodesAndEdges = getNodesAndEdges(graphString, nodeVal, 'right');
      }
      rightNodes = rightnodesAndEdges[0];
      rightEdges = rightnodesAndEdges[1]; 
      var rightNodeValuesNum = rightnodesAndEdges[2];
      var interactionTypesRight = rightnodesAndEdges[3];
      edgesToMergeRight = rightnodesAndEdges[4]
      var drugedgesright = rightnodesAndEdges[5]

      interactionTypes = interactionTypes.add(...interactionTypesRight);
      // set min and max for legend  and add nodes and edges to graph
      var rightRange = legendsRange(rightNodeValuesNum);
      var rightNodesMin = rightRange[0];
      var rightNodesMax = rightRange[1];

      graphRight= createCyObject(cyO, rightNodesMin, rightNodesMax, nodeVal);

      addNodesAndEdges(graphRight,rightNodes, rightEdges, rightFirstTime, rightNodesMin, rightNodesMax, drugedgesright);
      var api = graphRight.expandCollapse('get');
      var options = {
        layoutBy: null, // to rearrange after expand/collapse. It's just layout options or whole layout function. Choose your side!
        // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
        fisheye: false, // whether to perform fisheye view after expand/collapse you can specify a function too
        animate: true, // whether to animate on drawing changes you can specify a function too
        animationDuration: 1000, // when animate is true, the duration in milliseconds of the animation
        ready: function () {}, // callback when expand/collapse initialized
        undoable: true, // and if undoRedoExtension exists,

        cueEnabled: true, // Whether cues are enabled
        expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
        expandCollapseCueSize: 12, // size of expand-collapse cue
        expandCollapseCueLineSize: 8, // size of lines used for drawing plus-minus icons
        expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
        collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
        expandCollapseCueSensitivity: 1, // sensitivity of expand-collapse cues
        edgeTypeInfo: "interaction", // the name of the field that has the edge type, retrieved from edge.data(), can be a function, if reading the field returns undefined the collapsed edge type will be "unknown"
        groupEdgesOfSameTypeOnCollapse : true, // if true, the edges to be collapsed will be grouped according to their types, and the created collapsed edges will have same type as their group. if false the collapased edge will have "unknown" type.
        allowNestedEdgeCollapse: true, // when you want to collapse a compound edge (edge which contains other edges) and normal edge, should it collapse without expanding the compound first
        zIndex: 999 // z-index value of the canvas in which cue ımages are drawn
      };
      api.collapseAll(options)
      document.getElementById('cyRight').style.visibility = "visible";
      showConfigurationParts('Right', graphRight, right);
      document.getElementById('right').style.visibility = "visibile";
      document.getElementById('rightID').style.visibility = "visible";
      resetLayout(graphRight, "Right");
      showMetaInfo(graphRight, nodeVal);
      // set background layer to hoghlight pathways
      var layerRight = createLayoutKeggPathways(graphRight, allPathsRight,"Right")
      var canvasRight = layerRight.getCanvas();
      var ctxRight = canvasRight.getContext('2d');
      showKEGGParts('Right',ctxRight, graphRight, rightNodes, layerRight, canvasRight);


      graphRight.on('tap', 'node',function(evt){
        highlightNodeTapped(evt.target.data().symbol, graphLeft, graphRight);
        evt.target.addClass('highlighted');
      })
      graphRight.on('tap', function(event){
          var evtTarget = event.target;
          if( evtTarget === graphRight ){
            graphLeft.$('node').removeClass('highlighted')
            graphRight.$('node').removeClass('highlighted')
          }
        });
    }
  });
  document.getElementById("arrows").innerHTML = "";
  createInteractionLegend(interactionTypes, graphLeft, edgesToMergeLeft, graphRight, edgesToMergeRight);
  if(document.getElementById('nodeShapesAttr')){
    if(!document.getElementById('heatmap_shapes')){
      var shapelegend = document.createElement("div")
      shapelegend.id = "heatmap_shapes";
      shapelegend.visibility = "visible";
      document.getElementById("legend_heatmap").appendChild(shapelegend);
      
    }
    if(document.getElementById("nodeShapes")){
      document.getElementById("nodeShapes").onchange=function(){
        changeNodeShapes(graphLeft, 'heatmap_shapes');
        if(graphRight){
          changeNodeShapes(graphRight, 'heatmap_shapes');
        }
      }

      graphLeft.style()
          .selector('node['+document.getElementById('nodeShapesAttr').value+' ="true"]')        
          .style('shape', document.getElementById('nodeShapes').value)
          .update();
      if(graphRight){
        graphRight.style()
          .selector('node['+document.getElementById('nodeShapesAttr').value+' ="true"]')        
          .style('shape', document.getElementById('nodeShapes').value)
          .update();
      }
    }
  }
  if(firstTime && graphRight){
    firstTime = false;
    clickMerge(files, nodeVal, example);
  }
  document.getElementById('legend_heatmap').setAttribute('style','visibility:visible');
  document.getElementById('searchgene').setAttribute('style','visibility:visible');
  document.getElementById('searchbutton').setAttribute('style','visibility:visible');
  document.getElementById('searchbutton').onclick=function(){highlightSearchedGene(graphLeft, graphRight)} 

} 

function showConfigurationParts(pos, cy, name){
  document.getElementById('reset'+pos).style.visibility = "visible";
  document.getElementById('reset'+pos+'Layout').onclick=function(){resetLayout(cy, pos)}
  document.getElementById('downloadPart'+pos).style.visibility = "visible";
  document.getElementById('download'+pos+'SVG').disabled = false;
  document.getElementById('download'+pos+'PNG').disabled = false;
  document.getElementById('download'+pos+'SVG').onclick = function(){
    downloadSVG(cy, pos, name)
  }
  document.getElementById('download'+pos+'PNG').onclick = function(){
    downloadPNG(cy, pos, name)
  }
  document.getElementById('KEGGpathsButton'+pos).style.visibility ="visible";
  document.getElementById('keggpathways'+pos).style.visibility = "visible";
  document.getElementById("selectlayout"+pos).visibility = "visible";
  document.getElementById("selectlayout"+pos).onchange= function(){changeLayout(cy, pos)}
}

function showKEGGParts(pos, ctx, cy, nodes, layer, canvas){
  document.getElementById("keggpathways"+pos).addEventListener('click', 
    function(){listKEGGPathways(ctx, cy, nodes, layer, canvas, pos);});
  document.getElementById('KEGGpaths'+pos).style.visibility = "visible";

}
//add nodes and edges to cy-object (update if attribute has changed)
function addNodesAndEdges(cyObject, nodes, edges, firstTime, nodesMin, nodesMax, drugedges){
  // add parent nodes for every drug group
  for(const [target, drugs] of Object.entries(drugedges)){
    for(const [target2, drugs2] of Object.entries(drugedges)){
      if(target == target2){
        continue;
      }
      if(drugs.length === drugs2.length &&
        drugs.every((val, index) => val === drugs2[index])){
        delete drugedges[target2]
      }
    }
  }
  for(const [target, drugs] of Object.entries(drugedges)){
    if(drugs.length > 1){
      var drugNode = {};
      drugNode.id = "n"+(nodes.length-1).toString()
      drugNode.symbol = drugs.length + " Drugs"
      nodes.push({data: drugNode});
      for(var drugnode of drugs){
        for(var node of nodes){
          if(node.data.id == drugnode){
            node.data.parent = drugNode.id
          }
        }
      }
    } 
  }

  if(loadGraphCount > 1){
    cyObject.elements().remove();
    if(cyObject === 'cyLeft'){
      leftFirstTime = false;
    }
    else if(cyObject === 'cyRight'){
      rightFirstTime = false;
    }
    loadGraphCount = 0;
  }
  cyObject.add(nodes);
  cyObject.add(edges);
  for(node of cyObject.nodes("node[id != 'l1']")){
    if(!node.isParent()){
      if(node.connectedEdges().size() == 0){
        node.remove()
      }
    }
  }
 
  cyObject.nodes().noOverlap({ padding: 5 });
  // calculate label position for legend and style legend
  var fontSize = 10;
  for(n=0; n < nodes.length; n++){
    cyObject.batch(function(){
      if(nodes[n].data.symbol){
        var labelText = nodes[n].data.symbol;
        var oldLabelText = nodes[n].data.symbol;}
      else if(nodes[n].data.name){
        var labelText = nodes[n].data.name;
        var oldLabelText = nodes[n].data.name;}
      else if(nodes[n].data.Name){
        var labelText = nodes[n].data.Name;
        var oldLabelText = nodes[n].data.Name;}
        while(getTextWidth(labelText, fontSize +" arial") > 49){
          oldLabelText = oldLabelText.slice(0,-1);
          labelText = oldLabelText+'...';
        }
       // }
       cyObject.$('node[id =\''  + nodes[n].data.id + '\']').style("label",labelText);
    });
  }
  // update node values if tracer or values change
  if(!firstTime){
    for(n=0; n < nodes.length; n++){
      cyObject.batch(function(){
      cyObject.$('node[id =\''  + nodes[n].data.id + '\']')
        .data('val', nodes[n].data.val)
      });
    }
  }
  calculateLabelColorLegend(nodeVal, fontSize, cyObject, nodesMin, nodesMax);

  addcolorlegend(cyObject)
  // cyObject.layout({
  //   name: 'cose-bilkent'
  // }).run();
  if(cyObject === 'cyLeft'){
      var selectedLayout = document.getElementById('selectlayoutLeft').value;
    }
    else if(cyObject === 'cyRight'){
      var selectedLayout = document.getElementById('selectlayoutRight').value;
    }
  
var layoutBy = {};
  if(selectedLayout == "klay"){
    var options = {
      animate: animateLayout, // Whether to transition the node positions
      klay: {
        aspectRatio: 1.49, // The aimed aspect ratio of the drawing, that is the quotient of width by height
        compactComponents: true, // Tries to further compact components (disconnected sub-graphs).
        nodeLayering:'LONGEST_PATH', // Strategy for node layering.
        /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. 
        The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
        LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
        INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
        thoroughness: 10 // How much effort should be spent to produce a nice layout..
      },
    };
    layoutBy ={
      name:'klay',
      options
    }
  }
  else if(selectedLayout == "breadthfirst"){
    layoutBy ={
        name: "breadthfirst",
        spacingFactor: 0.5,
        animate: animateLayout
      }
  }
  else if(selectedLayout == "dagre"){
    layoutBy ={
        name: "dagre",
        animate: animateLayout
      }
  }
  else if(selectedLayout == "cose-bilkent (default)"){
    layoutBy ={
        name: "cose-bilkent",
        gravityRange: 1.3,
        animate: true,
        randomize: false
      }
  }
  else if(selectedLayout == "grid"){
    layoutBy ={
        name: "grid",
        animate: animateLayout,
        avoidOverlapPadding: 5
      }
  }
  else{
    layoutBy ={
        name: "cose-bilkent",
        // Gravity range (constant)
        gravityRange: 1.3,
        animate: true,
        randomize: false
      }  
    }
  // add drug group node as parent to according drug nodes
  var options = {
      layoutBy: layoutBy, // to rearrange after expand/collapse. It's just layout options or whole layout function. Choose your side!
      // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
      fisheye: false, // whether to perform fisheye view after expand/collapse you can specify a function too
      animate: true, // whether to animate on drawing changes you can specify a function too
      animationDuration: 1000, // when animate is true, the duration in milliseconds of the animation
      ready: function () {
        cyObject.style().selector('edge[interaction = \'targets\']').style('target-arrow-shape', 'triangle').update();}, // callback when expand/collapse initialized
      undoable: true, // and if undoRedoExtension exists,

      cueEnabled: true, // Whether cues are enabled
      expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
      expandCollapseCueSize: 12, // size of expand-collapse cue
      expandCollapseCueLineSize: 8, // size of lines used for drawing plus-minus icons
      expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
      collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
      expandCollapseCueSensitivity: 1, // sensitivity of expand-collapse cues
      edgeTypeInfo: "interaction", // the name of the field that has the edge type, retrieved from edge.data(), can be a function, if reading the field returns undefined the collapsed edge type will be "unknown"
      groupEdgesOfSameTypeOnCollapse : true, // if true, the edges to be collapsed will be grouped according to their types, and the created collapsed edges will have same type as their group. if false the collapased edge will have "unknown" type.
      allowNestedEdgeCollapse: true, // when you want to collapse a compound edge (edge which contains other edges) and normal edge, should it collapse without expanding the compound first
      zIndex: 999 // z-index value of the canvas in which cue ımages are drawn
    };
  cyObject.expandCollapse(options)
  var api = cyObject.expandCollapse('get');


}

//show meta-information of nodes by mouseover
function showMetaInfo(cyObject, nodeVal){
  cyObject.elements('node').qtip({       // show node attibute value by mouseover
    show: {   
      event: 'mouseover', 
      solo: true,
    },
    content: {text : function(){
      if(!isNaN(parseFloat(this.data()[nodeVal]))){
            if(this.data('symbol') != undefined){
              if(this.data('DriverType')!=undefined){
                if(this.data("secondaryNames")){
                  return '<b>'+ this.data('symbol') +'</b><br>' + 
                  '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2) + '</b><br>' + 
                  '<b> Driver Type: </b>'+ this.data('DriverType') + '<br><b> Secondary Names: </b>' +
                  this.data('secondaryNames')
                }
                else{
                  return '<b>'+ this.data('symbol') +'</b><br>' + 
                  '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2) + '</b><br>' + 
                  '<b> Driver Type: </b>'+ this.data('DriverType')
                }
              }
              else{
                if(this.data("secondaryNames")){
                  return '<b>'+ this.data('symbol') +'</b><br>' + 
                  '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2)+ '<br><b> Secondary Names: </b>' +
                  this.data('secondaryNames')
                }
                else{
                  return '<b>'+ this.data('symbol') +'</b><br>' + 
                  '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2)
                }
              }
            }
            else if(this.data('name') != undefined){
              if(this.data('DriverType')!= undefined){
                if(this.data("secondaryNames") != undefined){
                  return '<b>'+ this.data('name')+'</b><br>' +
                  '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2)+ '</b><br>' + 
                  '<b> Driver Type: </b>'+ this.data('DriverType')+ '<br><b> Secondary Names: </b>' +
                  this.data('secondaryNames')
                }
                else{
                  return '<b>'+ this.data('name')+'</b><br>' +
                  '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2)+ '</b><br>' + 
                  '<b> Driver Type: </b>'+ this.data('DriverType')
                }
                
              }
              else{
                if(this.data("secondaryNames") != undefined){
                  return '<b>'+ this.data('name')+'</b><br>' +
                  '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2)+ '<br><b> Secondary Names: </b>' +
                  this.data('secondaryNames')
                }
                else{
                  return '<b>'+ this.data('name')+'</b><br>' +
                  '<b>'+nodeVal +'</b>: ' + parseFloat(this.data()[nodeVal]).toFixed(2)
                }
              }
            }
          } //numbers          
          else{
            if(this.data('symbol') != undefined){
              if(this.data('DriverType')!= undefined){
                if(this.data("secondaryNames") != undefined){
                  return '<b>'+ this.data('symbol') +'</b><br>' + 
                  '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal]+ '</b><br>' + 
                  '<b> Driver Type: </b>'+ this.data('DriverType')+ '<br><b> Secondary Names: </b>' +
                  this.data('secondaryNames')
                }
                else{
                  return '<b>'+ this.data('symbol') +'</b><br>' + 
                  '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal]+ '</b><br>' + 
                  '<b> Driver Type: </b>'+ this.data('DriverType');
                }
              }
              else{
                if(this.data("secondaryNames") != undefined){
                  return '<b>'+ this.data('symbol') +'</b><br>' + 
                 '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal]+ '<br><b> Secondary Names: </b>' +
                  this.data('secondaryNames')
                }
                else{
                 return '<b>'+ this.data('symbol') +'</b><br>' + 
                 '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal];
                }
              }
             }
            else if(this.data('name') != undefined){
              if(this.data('DriverType')!= undefined){
                if(this.data("secondaryNames") != undefined){
                  return '<b>'+ this.data('name')+'</b><br>' +
                  '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal]+ '</b><br>' + 
                  '<b> Driver Type: </b>'+ this.data('DriverType')+ '<br><b> Secondary Names: </b>' +
                  this.data('secondaryNames')
                }
                else{
                  return '<b>'+ this.data('name')+'</b><br>' +
                  '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal]+ '</b><br>' + 
                  '<b> Driver Type: </b>'+ this.data('DriverType');
                }
              }
              else{
                if(this.data("secondaryNames") != undefined){
                  return '<b>'+ this.data('name')+'</b><br>' +
                 '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal]+ '<br><b> Secondary Names: </b>' +
                  this.data('secondaryNames')
                }
                else{
                 return '<b>'+ this.data('name')+'</b><br>' +
                 '<b>'+nodeVal +'</b>: '+ this.data()[nodeVal];
               }
            }}
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
  cyObject.elements('edge').qtip({       // show node attibute value by mouseover
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


/*
reset view (zoom, position)
*/
function resetLayout(cy, pos){
var animateLayout = true;
  var selectedLayout = document.getElementById('selectlayout' + pos).value;
  if(selectedLayout == "klay"){
    var options = {
      animate: animateLayout, // Whether to transition the node positions
      klay: {
        aspectRatio: 1.49, // The aimed aspect ratio of the drawing, that is the quotient of width by height
        compactComponents: true, // Tries to further compact components (disconnected sub-graphs).
        nodeLayering:'LONGEST_PATH', // Strategy for node layering.
        /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. 
        The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
        LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
        INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
        thoroughness: 10 // How much effort should be spent to produce a nice layout..
      },
    };
    cy.layout({
      name:'klay',
      options
    }).run();
  }
  else if(selectedLayout == "breadthfirst"){
    cy.layout({
        name: "breadthfirst",
        spacingFactor: 0.5,
        animate: animateLayout
      }).run();
  }
  else if(selectedLayout == "dagre"){
    cy.layout({
        name: "dagre",
        animate: animateLayout
      }).run();
  }
  else if(selectedLayout == "cose-bilkent (default)"){
    cy.layout({
        name: "cose-bilkent",
        // Gravity range (constant)
        gravityRange: 1.3,
        animate: true
      }).run();
  }
  else if(selectedLayout == "grid"){
    cy.layout({
        name: "grid",
        animate: animateLayout,
        avoidOverlapPadding: 5
      }).run();
  }
  else{
    cy.layout({
        name: "cose-bilkent",
        // Gravity range (constant)
        gravityRange: 1.3,
        animate: true
      }).run();
    document.getElementById('selectlayout'+pos).value = "cose-bilkent (default)";
  }
  if(highlightedNode){
    cy.$('node[symbol="'+highlightedNode+'"]').addClass("highlighted");
  }
};

