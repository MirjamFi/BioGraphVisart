/*
  create a graph with Cytoscape
*/

/*
visualize a graph from .graphml-file
*/

var removedNodes;
function visualize(graphString, noOptn) {
  document.getElementById('loader1').style.visibility = "visibile";
   
    // if(!noOptn && !clicked && !defaultVal){
    //   nodeVal = document.getElementById('values').value;
    // }
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
      var drugedges = nodesAndEdges[5];
    }
    if(!noOptn){
        // set min and max for legend
        var range = legendsRange(nodeValuesNum);
        var nodesMin = range[0];
        var nodesMax = range[1];
      };
    // add nodes and edges to graph
    addNodesAndEdges(nodes, edges, drugedges, nodesMin, nodesMax, noOptn);

  if(!clicked){
    document.getElementById('arrows').innerHTML = "";
    createInteractionLegend(interactionTypes, cy, edgesToMerge, noOptn);
    document.getElementById('legend').setAttribute('style','visibility:visible');

    document.getElementById('downloadPart').style.visibility = "visible";
  }
  showMetaInfo(noOptn);
  document.getElementById('loader1').style.visibility = "hidden";
  document.getElementById('selectlayout').setAttribute('style','visibility:visible');

  document.getElementById('resetLayout').onclick= function(){changeLayout(cy, selectedLayout)};

  // if(! noDrpShapes){
  //   activateNodeShapeChange();
  // }
  
  document.getElementById('KEGGpathsButton').style.visibility ="visible";
  document.getElementById('KEGGpaths').style.visibility ="visible";

    // set background layer to hoghlight pathways
  var layer = createLayoutKeggPathways(cy, allPaths)
  var canvas = layer.getCanvas();
  var ctx = canvas.getContext('2d');
  document.getElementById('keggpathways').onclick = function(){if(!collapsed){listKEGGPathways(ctx, cy, nodes, layer, canvas, "")}};
  var defaultVal = false;
  

  if(document.getElementById('nodeShapesAttr').value){
    cy.style()
      .selector('node['+document.getElementById('nodeShapesAttr').value+' ="true"]')        
      .style('shape', document.getElementById('nodeShapes').value)
      .update();
  }
  addcolorlegend(cy);
  var api = cy.expandCollapse('get');
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
    changeLayout(cy);

}

//add nodes and edges to cy-object (update if attribute has changed)
function addNodesAndEdges(nodes, edges, drugedges, nodesMin, nodesMax, noOptn){
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
      {selector: 'node[midrug_id]',   
        style:{    
          'background-image': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjIsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSIyNDkuMjM1cHgiCiAgIGhlaWdodD0iMjQ5LjIzNnB4IgogICB2aWV3Qm94PSIwIDAgMjQ5LjIzNSAyNDkuMjM2IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNDkuMjM1IDI0OS4yMzYiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9InBpbGxfaWNvbl9yZWRfMjU2LnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPjxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTEzIj48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzMTEiIC8+PHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSI3NzgiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iNDgwIgogICAgIGlkPSJuYW1lZHZpZXc5IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIwLjk0Njg5Mzc0IgogICAgIGlua3NjYXBlOmN4PSIxMjQuNjE3NSIKICAgICBpbmtzY2FwZTpjeT0iMTI0LjYxOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMjIzIgogICAgIGlua3NjYXBlOndpbmRvdy15PSI3NCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9IkxheWVyXzEiIC8+PGcKICAgICBpZD0iZzYiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MSI+PHBhdGgKICAgICAgIGZpbGw9IiNGQkZCRkIiCiAgICAgICBkPSJNMTk1LjUxMiw1NC4yOTRjLTguMTQyLTguMTQzLTE4LjgxNS0xMi4yMjYtMjkuNDk0LTEyLjIyNmMtMTAuNjc0LDAtMjEuMzUxLDQuMDgzLTI5LjQ3LDEyLjIyNiAgIEw5NC4zOTYsOTYuNDM4bDAsMGwtNDIuMTQyLDQyLjEzNWMtMTYuMjg3LDE2LjI2Ny0xNi4yODcsNDIuNjgsMC4wMSw1OC45NjVjMTYuMjY2LDE2LjI3OCw0Mi42ODIsMTYuMjc4LDU4Ljk1NiwwbDMzLjE2My0zMy4xNSAgIGw1MS4xMTktNTEuMTE5QzIxMS43NzYsOTYuOTc0LDIxMS43NzYsNzAuNTU5LDE5NS41MTIsNTQuMjk0eiBNMTg2LjUzMiwxMDQuMjgzbC00Mi4xNDgsNDIuMTRMMTAzLjM2NSwxMDUuNGw0Mi4xNDItNDIuMTQgICBjNS40NzMtNS40NzQsMTIuNzY1LTguNTA3LDIwLjQ5Mi04LjUwN2M3Ljc1MSwwLDE1LjA0MiwzLjAzMywyMC41MTgsOC41MDdDMTk3LjgzOCw3NC41NjQsMTk3LjgzOCw5Mi45ODMsMTg2LjUzMiwxMDQuMjgzeiIKICAgICAgIGlkPSJwYXRoNCIKICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjEiIC8+PC9nPjwvc3ZnPg==',    
          'background-width': '45%',   
          'background-height': '45%',    
          'background-position-y': '100%', 
     }},
     {selector: ':parent',
        style: {
          'border-width':0.5,
          "background-color": "lightgrey",
          'background-opacity': 0.5,
        }},
    {selector: "node.cy-expand-collapse-collapsed-node",
      style: {
        'shape': "diamond",
        "background-color": "lightgrey",
        'background-image': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjIsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSIyNDkuMjM1cHgiCiAgIGhlaWdodD0iMjQ5LjIzNnB4IgogICB2aWV3Qm94PSIwIDAgMjQ5LjIzNSAyNDkuMjM2IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNDkuMjM1IDI0OS4yMzYiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9InBpbGxfaWNvbl9yZWRfMjU2LnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPjxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTEzIj48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzMTEiIC8+PHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSI3NzgiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iNDgwIgogICAgIGlkPSJuYW1lZHZpZXc5IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIwLjk0Njg5Mzc0IgogICAgIGlua3NjYXBlOmN4PSIxMjQuNjE3NSIKICAgICBpbmtzY2FwZTpjeT0iMTI0LjYxOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMjIzIgogICAgIGlua3NjYXBlOndpbmRvdy15PSI3NCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9IkxheWVyXzEiIC8+PGcKICAgICBpZD0iZzYiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MSI+PHBhdGgKICAgICAgIGZpbGw9IiNGQkZCRkIiCiAgICAgICBkPSJNMTk1LjUxMiw1NC4yOTRjLTguMTQyLTguMTQzLTE4LjgxNS0xMi4yMjYtMjkuNDk0LTEyLjIyNmMtMTAuNjc0LDAtMjEuMzUxLDQuMDgzLTI5LjQ3LDEyLjIyNiAgIEw5NC4zOTYsOTYuNDM4bDAsMGwtNDIuMTQyLDQyLjEzNWMtMTYuMjg3LDE2LjI2Ny0xNi4yODcsNDIuNjgsMC4wMSw1OC45NjVjMTYuMjY2LDE2LjI3OCw0Mi42ODIsMTYuMjc4LDU4Ljk1NiwwbDMzLjE2My0zMy4xNSAgIGw1MS4xMTktNTEuMTE5QzIxMS43NzYsOTYuOTc0LDIxMS43NzYsNzAuNTU5LDE5NS41MTIsNTQuMjk0eiBNMTg2LjUzMiwxMDQuMjgzbC00Mi4xNDgsNDIuMTRMMTAzLjM2NSwxMDUuNGw0Mi4xNDItNDIuMTQgICBjNS40NzMtNS40NzQsMTIuNzY1LTguNTA3LDIwLjQ5Mi04LjUwN2M3Ljc1MSwwLDE1LjA0MiwzLjAzMywyMC41MTgsOC41MDdDMTk3LjgzOCw3NC41NjQsMTk3LjgzOCw5Mi45ODMsMTg2LjUzMiwxMDQuMjgzeiIKICAgICAgIGlkPSJwYXRoNCIKICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjEiIC8+PC9nPjwvc3ZnPg==',    
        'background-width': '45%',   
        'background-height': '45%',    
        'background-position-y': '100%' 

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
      methystyle,
      {'selector': 'edge.cy-expand-collapse-meta-edge',
        style: {
          'curve-style': 'unbundled-bezier',
          'control-point-distances': '0 0 0',
          'target-arrow-shape': 'triangle',
        },
      },
      ]
  });
var selectedLayout = document.getElementById('selectlayout').value;
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
  else if(selectedLayout == "cose-bilkent"){
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
        cy.style().selector('edge[interaction = \'targets\']').style('target-arrow-shape', 'triangle').update();}, // callback when expand/collapse initialized
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
  cy.expandCollapse(options)
  var api = cy.expandCollapse('get');

   // shorten too long labels
  for(n=0; n < nodes.length; n++){
    cy.batch(function(){
      var labelText, oldLabelText;
      if(nodes[n].data.symbol){
        labelText = nodes[n].data.symbol;
        oldLabelText = nodes[n].data.symbol;
          while(getTextWidth(labelText, fontSize +" arial") > 49){
            oldLabelText = oldLabelText.slice(0,-1);
            labelText = oldLabelText+'...';
          }
      }
      else if(nodes[n].data.name){
        labelText = nodes[n].data.name;
        oldLabelText = nodes[n].data.name;
          while(getTextWidth(labelText, fontSize +" arial") > 49){
            oldLabelText = oldLabelText.slice(0,-1);
            labelText = oldLabelText+'...';
          }
      }
      cy.$('node[id =\''  + nodes[n].data.id + '\']').style("label", labelText);
    } )
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

// on click collapse all other nodes and expand database nodes for clicked node   
 if(!collapsed){    
   cy.on('tap', 'node', function(evt){    
     var clickedNode = evt.target;    
     if(clickedNode.data().symbol != undefined){    
       var targetNode = clickedNode.data().symbol   
     }    
     else if(clickedNode.data().name != undefined && clickedNode.data().drugbank_id == undefined && !clickedNode.data().symbol.includes("Drugs")){    
       var targetNode = clickedNode.data().name   
     }    
     else if(clickedNode.data().drugbank_id != undefined){    
       var info = "<div align='left' id='information'><table><tr>"    
       Object.keys(clickedNode.data()).forEach(function(key) {    
         if(key == "id"){   
           return;    
         }    
         if(key == "drugbank_id"){    
           info+= "<td><b>"+key.charAt(0).toUpperCase() + key.slice(1).split("_").join(" ")+    
             "</b></td><td><a href='https://www.drugbank.ca/drugs/"+clickedNode.data()[key]+"'target='_blank'>"+clickedNode.data()[key]+"</a></td></tr>"    
         }    
         else{    
           info += "<td><b>"+key.charAt(0).toUpperCase() + key.slice(1).split("_").join(" ")+"</b></td><td>"+clickedNode.data()[key]+"</td></tr>"   
         }    
       });    
       info += "</table>"   
       var newWindow = window.open("BioGraphVisart/DrugInformation");   
       var doc = newWindow.document;    
       doc.open("text/html", "replace");    
       doc.write("<HTML><HEAD><TITLE>"+clickedNode.data().name+   
         "</TITLE><link rel='stylesheet' type='text/css' href='http://127.0.0.1:3000/static/css/subgraphCss.css'></HEAD>"+    
         "<BODY><H1>"+clickedNode.data().name+    
         "</H1>"+info+"</BODY></HTML>");    
       doc.close();   
     }
     else if(clickedNode.data().symbol.includes("Drugs")){
        clickedNode.style('shape','diamond')
        // api.expand(clickedNode)    
      }    
     var clickedNodesPosition = cy.$(clickedNode).position();
     if(clickedNode.data().drugbank_id === undefined && !clickedNode.data().symbol.includes("Drugs")){   
        var neighboringgraphml = getGraphforGene(targetNode).then(   
          response => {return response.text()});    
        neighboringgraphml.then(function(response){   
          document.getElementById("loader1").style.visibility = "hidden";
          if(response){ 
            if(response=="undefined"){
              alert("No network found for " +targetNode+".")
            } 
            else{
              if(document.getElementById('values')){   
                document.getElementById('values').disabled = true;   
              }    
              if(document.getElementById('nodeShapesAttr')){   
                document.getElementById('nodeShapesAttr').disabled = true;   
              }    
              if(document.getElementById('nodeShapes')){   
                document.getElementById('nodeShapes').disabled = true;   
              }   
              collapsed = true;    
              var noOptn_collapsed = true;   
              visualize(response.split("\n"), noOptn_collapsed);   
              cy.remove(cy.elements('node[id = "l1"]'))
              cy.elements('node[name = "'+ targetNode+'"] ').style('border-width', 5).style('font-weight', 'bold')   

                cy.elements('node[midrug_id]').style('background-image', 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjIsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSIyNDkuMjM1cHgiCiAgIGhlaWdodD0iMjQ5LjIzNnB4IgogICB2aWV3Qm94PSIwIDAgMjQ5LjIzNSAyNDkuMjM2IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNDkuMjM1IDI0OS4yMzYiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9InBpbGxfaWNvbl9yZWRfMjU2LnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPjxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTEzIj48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzMTEiIC8+PHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSI3NzgiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iNDgwIgogICAgIGlkPSJuYW1lZHZpZXc5IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIwLjk0Njg5Mzc0IgogICAgIGlua3NjYXBlOmN4PSIxMjQuNjE3NSIKICAgICBpbmtzY2FwZTpjeT0iMTI0LjYxOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMjIzIgogICAgIGlua3NjYXBlOndpbmRvdy15PSI3NCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9IkxheWVyXzEiIC8+PGcKICAgICBpZD0iZzYiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MSI+PHBhdGgKICAgICAgIGZpbGw9IiNGQkZCRkIiCiAgICAgICBkPSJNMTk1LjUxMiw1NC4yOTRjLTguMTQyLTguMTQzLTE4LjgxNS0xMi4yMjYtMjkuNDk0LTEyLjIyNmMtMTAuNjc0LDAtMjEuMzUxLDQuMDgzLTI5LjQ3LDEyLjIyNiAgIEw5NC4zOTYsOTYuNDM4bDAsMGwtNDIuMTQyLDQyLjEzNWMtMTYuMjg3LDE2LjI2Ny0xNi4yODcsNDIuNjgsMC4wMSw1OC45NjVjMTYuMjY2LDE2LjI3OCw0Mi42ODIsMTYuMjc4LDU4Ljk1NiwwbDMzLjE2My0zMy4xNSAgIGw1MS4xMTktNTEuMTE5QzIxMS43NzYsOTYuOTc0LDIxMS43NzYsNzAuNTU5LDE5NS41MTIsNTQuMjk0eiBNMTg2LjUzMiwxMDQuMjgzbC00Mi4xNDgsNDIuMTRMMTAzLjM2NSwxMDUuNGw0Mi4xNDItNDIuMTQgICBjNS40NzMtNS40NzQsMTIuNzY1LTguNTA3LDIwLjQ5Mi04LjUwN2M3Ljc1MSwwLDE1LjA0MiwzLjAzMywyMC41MTgsOC41MDdDMTk3LjgzOCw3NC41NjQsMTk3LjgzOCw5Mi45ODMsMTg2LjUzMiwxMDQuMjgzeiIKICAgICAgIGlkPSJwYXRoNCIKICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjEiIC8+PC9nPjwvc3ZnPg==')    
                .style('background-width', '45%')    
                .style('background-height', '45%')   
                .style('background-position-y', '100%')    
            }; 
          }}); 
          }  
        });

        if(document.getElementById("maingraph")){
          document.getElementById("maingraph").remove();
        }
     } 
     else if(collapsed){  // display additional drug info in extra tab/window from database graph   
       cy.on('tap', 'node', function(evt){    
         var clickedNode = evt.target.data();   
         if(clickedNode.midrug_id != undefined){    
           var info = "<div align='left' id='information'><table><tr>"    
           Object.keys(clickedNode).forEach(function(key) {   
             if(key == "id"){   
               return;    
             }    
             if(key == "drugbank_id"){    
               info+= "<td><b>"+key.charAt(0).toUpperCase() + key.slice(1).split("_").join(" ")+"</b></td><td><a href='https://www.drugbank.ca/drugs/"+clickedNode[key]+"'target='_blank'>"+clickedNode[key]+"</a></td></tr>"   
             }    
             else{    
               info += "<td><b>"+key.charAt(0).toUpperCase() + key.slice(1).split("_").join(" ")+"</b></td><td>"+clickedNode[key]+"</td></tr>"    
             }    
           });    
           info += "</table>"   
           var newWindow = window.open("");   
           var doc = newWindow.document;    
           doc.open("text/html", "replace");    
           doc.write("<HTML><HEAD><TITLE>"+clickedNode.name+    
             "</TITLE><link rel='stylesheet' type='text/css' href='http://127.0.0.1:3000/static/subgraphCss.css'></HEAD>"+    
             "<BODY><H1>"+clickedNode.name+   
             "</H1>"+info+"</BODY></HTML>");    
           doc.close();   
         }});   
       // if (process.browser) {   
         cy.elements('node').qtip({       // show node attibute value by mouseover    
           show: {    
             event: 'mouseover',    
             solo: true,    
           },   
           content: {text : function(){   
               return this.data('name')   
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
         })   
       if(!document.getElementById("maingraph")){
            var maingraph = document.createElement("button");
            maingraph.id = "maingraph";
            maingraph.id = "maingraph";
            maingraph.innerHTML = "Initial Network";
            // maingraph.style.cssFloat = "right"
            document.getElementById("configPart").appendChild(maingraph);
            document.getElementById("maingraph").className = 'butn';  
            maingraph.onclick = function(){
              if(document.getElementById('values')){   
                  document.getElementById('values').disabled = false;   
                }    
               if(document.getElementById('nodeShapesAttr')){   
                 document.getElementById('nodeShapesAttr').disabled = false   
               }    
               if(document.getElementById('nodeShapes')){   
                 document.getElementById('nodeShapes').disabled = false;   
               }    
               collapsed = false;  
               if(document.getElementById('values')){
                  noOptn = false;
                } 
               visualize(graphString, noOptn)};   
          }     
     }
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

async function getGraphforGene(name){   
  document.getElementById("loader1").style.visibility = "visible" 
  var data = {'name':name};
  const response = await fetch("/BioGraphVisart/graph", {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    //credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return await response; // parses JSON response into native JavaScript objects
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
   else if(noOptn){
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




