
async function createMerged(file1, file2, nodeVal, leftID, rightID, example){
  var file1_prom = await fetch("blob:"+file1).then(r => r.blob()).then(blobFile => new File([blobFile], "file1", { type: "html" }))
  var file2_prom = await fetch("blob:"+file2).then(r => r.blob()).then(blobFile => new File([blobFile], "file2", { type: "html" }))
  var files=[file1_prom, file2_prom]
  counterlimit = files.length;
    let j = 0;
    var count = 0;
    var regExp = /\>(.*)\</;
    graphsList = new Set();
    Array.from(files).forEach(function(file){
      // read file
      var path = file.name;
      var reader = new FileReader();
      reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        var arrayBuffer = evt.target.result;
        graphsList[path] = arrayBuffer.split("\n");
        count = count+ 1;
        if(count == counterlimit){
          var leftNodes;
          var leftEdges;
          var leftdrugedges;
          var interactionTypes = [];
          var rightNodes;
          var rightEdges;
          var rightdrugedges;
          var edgesToMerge=true;
          for(g in graphsList){
            var graphml = graphsList[g];
            if(j == 0){
              var nodesAndEdges = getNodesAndEdges(graphml,nodeVal, 'left');
              leftNodes = nodesAndEdges[0];
              leftEdges = nodesAndEdges[1]; 
              leftNodeValuesNum = nodesAndEdges[2];
              interactionTypes= new Set([...interactionTypes, ...nodesAndEdges[3]])
              leftdrugedges = nodesAndEdges[5]
              for(const [target, drugs] of Object.entries(leftdrugedges)){
                for(const [target2, drugs2] of Object.entries(leftdrugedges)){
                  if(target == target2){
                    continue;
                  }
                  if(drugs.length === drugs2.length &&
                    drugs.every((val, index) => val === drugs2[index])){
                    delete leftdrugedges[target2]
                  }
                }
              }
              j ++;
            }
            else if(j == 1){
              var nodesAndEdges = getNodesAndEdges(graphml,nodeVal, 'right');
              rightNodes = nodesAndEdges[0];
              rightEdges = nodesAndEdges[1]; 
              rightNodeValuesNum = nodesAndEdges[2];
              interactionTypes= new Set([...interactionTypes, ...nodesAndEdges[3]])
              var rightdrugedges = nodesAndEdges[5]
              for(const [target, drugs] of Object.entries(rightdrugedges)){
                for(const [target2, drugs2] of Object.entries(rightdrugedges)){
                  if(target == target2){
                    continue;
                  }
                  if(drugs.length === drugs2.length &&
                    drugs.every((val, index) => val === drugs2[index])){
                    delete rightdrugedges[target2]
                  }
                }
              }

            setbuttons(nodeVal);
            mergeFunction(leftNodes, rightNodes, leftEdges, rightEdges, interactionTypes, edgesToMerge, nodeVal);
            
        };
      }
    };
    };}
    reader.readAsText(file);
  })

}

async function createMergedExample(file1, file2, nodeVal, leftID, rightID){
  var files=[file1, file2]
  graphsList = []
  for(let file of files){
    var request = new XMLHttpRequest();
    request.open('GET', file, false);
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
          var type = request.getResponseHeader('Content-Type');
          if (type.indexOf("text") !== 1) {
            graphString = request.responseText.split("\n")
            isJson = false;
            var filesplit = file.split("/")
            graphsList[filesplit[filesplit.length-1]] = graphString
          }
      }
    }
    request.send(null);
  }

  let j = 0;
  var regExp = /\>(.*)\</;
  var leftNodes;
  var leftEdges;
  var interactionTypes = [];
  var rightNodes;
  var rightEdges;
  var edgesToMerge=true;
  for(g in graphsList){
    var graphml = graphsList[g];
    if(j == 0){
      var nodesAndEdges = getNodesAndEdges(graphml,nodeVal, 'left');
      leftNodes = nodesAndEdges[0];
      leftEdges = nodesAndEdges[1]; 
      leftNodeValuesNum = nodesAndEdges[2];
      interactionTypes= new Set([...interactionTypes, ...nodesAndEdges[3]])
      j ++;
    }
    else if(j == 1){
      var nodesAndEdges = getNodesAndEdges(graphml,nodeVal, 'right');
      rightNodes = nodesAndEdges[0];
      rightEdges = nodesAndEdges[1]; 
      rightNodeValuesNum = nodesAndEdges[2];
      interactionTypes= new Set([...interactionTypes, ...nodesAndEdges[3]])
      // cystyle
      

      mergeFunction(leftNodes, rightNodes, leftEdges, rightEdges, interactionTypes, edgesToMerge, nodeVal)
      setbuttons(nodeVal)

    };
  }
}

function setbuttons(val){
  if(window.opener.drpValues.length > 0){
    // color options dropdown
    var drp = document.createElement("ul");
    drp.classList.add("Menu")
    drp.classList.add("-horizontal")
    drp.id = "selectColorAttribute";
    drp.style.visibility = "visible";
    document.getElementById("merged_graph_buttons").appendChild(drp);

    var labelDrp = document.createElement("li")
    labelDrp.classList.add("-hasSubmenu")
    labelDrp.innerHTML = "<a href='#'>Color attribute</a>"
    drp.appendChild(labelDrp)
    var ulDrp = document.createElement("ul")
    labelDrp.appendChild(ulDrp)
    window.opener.drpValues.forEach(function(nodeattr){
      var optnDrp = document.createElement("li");
      optnDrp.innerHTML="<a href='#'>"+nodeattr+"</a>";
      optnDrp.id=nodeattr;
      if(optnDrp.id == val){
        optnDrp.innerHTML="<a href='#'><i class='fas fa-check optnDrp' style='margin-right:5px'></i>"+nodeattr+"</a>";
      }
      ulDrp.appendChild(optnDrp)
      optnDrp.onclick = function(){
        document.querySelectorAll('.fa-check').forEach(function(e){
          if(e.classList.contains('optnDrp')){
            e.remove()}});
        this.innerHTML = "<a href='#'><i class='fas fa-check optnDrp' style='margin-right:5px'></i>"+this.id+"</a>"
        updateColorMerged(merge_graph, symbolsLeft, symbolsRight, window.opener.left.split("/"), window.opener.right.split("/"), this.id)
      }
    })
  }
    // node shape drop dpwn

    if(window.opener.shapeAttributes.length > 0){
      var nodeShapesAttr = document.createElement("ul")
     nodeShapesAttr.classList.add("Menu")
     nodeShapesAttr.classList.add("-horizontal")
     nodeShapesAttr.id="nodeShapesAttr"
     document.getElementById("merged_graph_buttons").appendChild(nodeShapesAttr);
     var labelShape = document.createElement("li")
      labelShape.classList.add("-hasSubmenu")
      labelShape.innerHTML = "<a href='#'>Node shape</a>"
      nodeShapesAttr.appendChild(labelShape)
      var ulShapes = document.createElement("ul")
      labelShape.appendChild(ulShapes)
      const shapesArray = ["rectangle", "octagon", "rhomboid", "pentagon", "tag"];
      shapeAttributes = Array.from(new Set(window.opener.shapeAttributes)); 
      if(shapeAttributes.length > 0){
        for(nodeattrShape of shapeAttributes){
        var liShape = document.createElement("li")
        liShape.classList.add("-hasSubmenu")
        liShape.innerHTML = "<a href='#'>"+nodeattrShape+"</a>"
        liShape.id= nodeattrShape
        liShape.id="nodeShapes"
        ulShapes.appendChild(liShape)
        var ulShape = document.createElement("ul")
        ulShape.id = nodeattrShape
        liShape.appendChild(ulShape)
        shapesArray.forEach(function(s){
            var optnShape = document.createElement("li")
            optnShape.innerHTML = "<a hre='#'>"+s+"</a>"
            optnShape.id= s
            ulShape.appendChild(optnShape)
            optnShape.onclick=function(){
              document.querySelectorAll('.fa-check').forEach(function(e){
                if(e.classList.contains('optnShape')){
                  e.remove()}});
              optnShape.innerHTML = "<a href='#'><i class='fas fa-check optnShape' style='margin-right:5px'></i>"+s+"</a>"
              changeNodeShapes(merge_graph, 'heatmap_shapes', optnShape.parentElement.id,s); 
              hideMenu(document.getElementById("nodeShapesAttr"))}
          })
        } 
      }
    }
    const layoutArray = ["dagre", "klay", "breadthfirst", "cose-bilkent", "grid"];

    // layout dropdown
    var drpLayout = document.createElement("ul");
    drpLayout.classList.add("Menu")
    drpLayout.classList.add("-horizontal")
    drpLayout.id = "selectlayoutMerge";
    document.getElementById("merged_graph_buttons").appendChild(drpLayout);
    var labelLayout = document.createElement("li")
    labelLayout.classList.add("-hasSubmenu")
    labelLayout.innerHTML = "<a href='#'>Layout</a>"
    drpLayout.appendChild(labelLayout)
    var ulLayout = document.createElement("ul")
    labelLayout.appendChild(ulLayout)

    layoutArray.forEach(function(s){
      var optnLayout = addLayoutOptions(s, "layoutOpt");
      optnLayout.onclick = function(){
        selectedLayout = s; 
        changeLayout(merge_graph, s);
        document.querySelectorAll('.fa-check').forEach(function(e){
          if(e.classList.contains('layoutOpt')){
          e.remove()}});
        optnLayout.innerHTML = "<a href='#'><i class='fas fa-check layoutOpt' style='margin-right:5px'></i>"+s+"</a>"
      };
      ulLayout.appendChild(optnLayout);
    });
  
    // search gene
    var searchgene = document.createElement("input");
    searchgene.id = "searchgene";
    searchgene.value = "Node label"
    document.getElementById("merged_graph_buttons").appendChild(searchgene);
    searchgene.setAttribute("type", "text");
    searchgene.setAttribute("size", 10);
    var searchbutn = document.createElement("button");
    searchbutn.id = "searchbutn";
    searchbutn.innerHTML = "Search";
    document.getElementById("merged_graph_buttons").appendChild(searchbutn);
    document.getElementById("searchbutn").className = 'butn';  
    searchbutn.onclick = highlightSearchedGene;

    var resetbutn = document.createElement("button")
    resetbutn.id = "resetMerge"
    resetbutn.innerHTML = "Reset layout"
    resetbutn.classList.add("butn");
    resetbutn.onclick = function(){resetLayout(merge_graph, "Merge")}
    document.getElementById("merged_graph_buttons").appendChild(resetbutn);
    
    forEach($(".Menu li.-hasSubmenu"), function(e){
      e.showMenu = showMenu;
      e.hideMenu = hideMenu;
    });

    forEach($(".Menu > li.-hasSubmenu"), function(e){
      e.addEventListener("click", showMenu);
    });

    forEach($(".Menu > li.-hasSubmenu li"), function(e){
      e.addEventListener("mouseenter", hideAllInactiveMenus);
    });

    forEach($(".Menu > li.-hasSubmenu li.-hasSubmenu"), function(e){
      e.addEventListener("click", showMenu);
    });

    document.addEventListener("click", hideAllInactiveMenus);
  }


function mergeFunction(leftNodes, rightNodes, leftEdges, rightEdges, interactionTypes, edgesToMerge, val){
  merge_graph = createCyObject('merged_graph', -1,1, )
  const nodesEdges = getmergedGraph(leftNodes, rightNodes, leftEdges, rightEdges, interactionTypes, edgesToMerge, val);
  var mergedNodes = nodesEdges[0];
  var mergedEdges = nodesEdges[1];

  merge_graph.add(mergedNodes)
  merge_graph.add(mergedEdges)
  for(node of merge_graph.nodes("node[id != 'l1']")){
    if(!node.isParent()){
      if(node.connectedEdges().size() == 0){
        merge_graph.remove('node#'+node.data().id)
      }
    }
  }
  merge_graph.nodes().noOverlap({ padding: 5 });
  var minMax = getNodeValueRange(mergedNodes, val);
  mergeMin = minMax[0];
  mergeMax = minMax[1];


  // calculate label position for legend and style legend
  var fontSize = 10;
  var labelVal = val


  merge_graph.style([
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
          'background-color': 'mapData('+nodeVal+','+ mergeMin+', 0, #006cf0, white)',
          'color': 'black'
      }},
      {selector: 'node['+nodeVal+']['+nodeVal+' <='+0.5*mergeMin+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node['+nodeVal+']['+nodeVal+' > "0"]',
        style: {
          'background-color': 'mapData('+nodeVal+', 0,'+ mergeMax+', white, #d50000)',
          'color': 'black'
      }},
      {selector: 'node['+nodeVal+']['+nodeVal+' >='+0.5*mergeMax+']',
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
      {selector: 'node[drug]',   
        style:{    
          'background-image': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjIsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSIyNDkuMjM1cHgiCiAgIGhlaWdodD0iMjQ5LjIzNnB4IgogICB2aWV3Qm94PSIwIDAgMjQ5LjIzNSAyNDkuMjM2IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNDkuMjM1IDI0OS4yMzYiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHNvZGlwb2RpOmRvY25hbWU9InBpbGxfaWNvbl9yZWRfMjU2LnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiPjxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTEzIj48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzMTEiIC8+PHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSI3NzgiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iNDgwIgogICAgIGlkPSJuYW1lZHZpZXc5IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIwLjk0Njg5Mzc0IgogICAgIGlua3NjYXBlOmN4PSIxMjQuNjE3NSIKICAgICBpbmtzY2FwZTpjeT0iMTI0LjYxOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMjIzIgogICAgIGlua3NjYXBlOndpbmRvdy15PSI3NCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9IkxheWVyXzEiIC8+PGcKICAgICBpZD0iZzYiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MSI+PHBhdGgKICAgICAgIGZpbGw9IiNGQkZCRkIiCiAgICAgICBkPSJNMTk1LjUxMiw1NC4yOTRjLTguMTQyLTguMTQzLTE4LjgxNS0xMi4yMjYtMjkuNDk0LTEyLjIyNmMtMTAuNjc0LDAtMjEuMzUxLDQuMDgzLTI5LjQ3LDEyLjIyNiAgIEw5NC4zOTYsOTYuNDM4bDAsMGwtNDIuMTQyLDQyLjEzNWMtMTYuMjg3LDE2LjI2Ny0xNi4yODcsNDIuNjgsMC4wMSw1OC45NjVjMTYuMjY2LDE2LjI3OCw0Mi42ODIsMTYuMjc4LDU4Ljk1NiwwbDMzLjE2My0zMy4xNSAgIGw1MS4xMTktNTEuMTE5QzIxMS43NzYsOTYuOTc0LDIxMS43NzYsNzAuNTU5LDE5NS41MTIsNTQuMjk0eiBNMTg2LjUzMiwxMDQuMjgzbC00Mi4xNDgsNDIuMTRMMTAzLjM2NSwxMDUuNGw0Mi4xNDItNDIuMTQgICBjNS40NzMtNS40NzQsMTIuNzY1LTguNTA3LDIwLjQ5Mi04LjUwN2M3Ljc1MSwwLDE1LjA0MiwzLjAzMywyMC41MTgsOC41MDdDMTk3LjgzOCw3NC41NjQsMTk3LjgzOCw5Mi45ODMsMTg2LjUzMiwxMDQuMjgzeiIKICAgICAgIGlkPSJwYXRoNCIKICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjEiIC8+PC9nPjwvc3ZnPg==',    
          'background-width': '45%',   
          'background-height': '45%',    
          'background-position-y': '100%', 
          'shape': "diamond",
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
      stimstyle,
      targetsstyle,
      expstyle,
      inhistyle, 
      reprstyle,
      bindstyle,
      dissostyle,
      compstyle,
      noncovstyle,
      molinteractstyle,
      indeffstyle,
      missstyle,
      statestyle,
      controlstyle,
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
      {
            selector: 'node.highlight',
            style: {
                'border-color': '#FFF',
                'border-width': '2px'
            }
        },
        {
            selector: 'node.semitransp',
            style:{ 'opacity': '0.5' }
        },
        {
            selector: 'edge.highlight',
            style: { 'mid-target-arrow-color': '#FFF' }
        },
        {
            selector: 'edge.semitransp',
            style:{ 'opacity': '0.2' }
        }
          ]);

  // get symbols and values for GA
  symbolsLeft = {};
  leftNodes.forEach(function( ele ){
   symbolsLeft[ele["data"]['symbol']]=ele["data"]['val'];
  });


  var arrLeft = Object.values(symbolsLeft);
  var filteredLeft = arrLeft.filter(function (el) {
    return el != null;
  });

  // get symbols and values for GA
  symbolsRight = {};
  rightNodes.forEach(function( ele ){
     symbolsRight[ele["data"]['symbol']]=ele["data"]['val'];
  });

  var arrRight = Object.values(symbolsRight);
  var filteredRight = arrRight.filter(function (el) {
    return el != null;
  });

  // legend node
  mergeColorLegend(merge_graph, mergeMin, labelVal, mergeMax)

  var g1Legend = {};
  g1Legend.data={};
  g1Legend.data.id = "g1";
  g1Legend.data.graph = "g1";
  g1Legend.data.symbol = rightID;
  g1Legend.data.group = "nodes";
  merge_graph.add(g1Legend);
  var g2Legend = {};
  g2Legend.data={};
  g2Legend.data.id = "g2";
  g2Legend.data.graph = "g2";
  g2Legend.data.symbol = leftID;
  g2Legend.data.group = "nodes";
  merge_graph.add(g2Legend);

  // circle nodes only in GA orange
  merge_graph.nodes('[graph="g1"]').style('border-width', 5).style('border-color', '#fdae61');
  merge_graph.nodes('[symbol = "'+leftID+'"]').style('border-width', 13).style('width', 50)
  .style('height', 50).style('height', 50).style('font-weight', 'bold').style('font-size',16);
  // circle nodes only in GB light blue
  merge_graph.nodes('[graph="g2"]').style('border-width', 5).style('border-color', '#abd9e9');
  merge_graph.nodes('[symbol = "'+rightID+'"]').style('border-width', 13)
  .style('width', 50).style('height', 50).style('font-weight', 'bold').style('font-size',16);
  // circle nodes common in both graphs black double line
  merge_graph.nodes('[graph="both"]').style('border-width', 5).style('border-color', 'black');


  // map values to node color for GA
  mapValuestoNodeColor(merge_graph, 'g1', '1', mergeMin, mergeMax, val);

  // map values to node color for GB
  mapValuestoNodeColor(merge_graph, 'g2', '2', mergeMin, mergeMax, val);

  // on mpuse-over show value of selected attribute
  let filenameSplitLeft = window.opener.left.split("/")
  filenameSplitLeft = filenameSplitLeft[filenameSplitLeft.length-1].split('.')[0];

  let filenameSplitRight = window.opener.right.split("/")
  filenameSplitRight = filenameSplitRight[filenameSplitRight.length-1].split('.')[0];
     
  mergeMousover(merge_graph,'g1', val, filenameSplitLeft);
  mergeMousover(merge_graph,'g2', val, filenameSplitRight);

  // createLegendMerge(mergeMin, mergeMax);
  mergeMousoverShared(merge_graph, val, filenameSplitLeft, filenameSplitRight);
  merge_graph.layout({name: 'cose-bilkent'}).run();   
  document.getElementById('KEGGpathsButtonMerge').style.visibility ="visible";
  // set background layer to hoghlight pathways
  layerMerge = createLayoutKeggPathways(merge_graph, allPathsMerge, 'Merge')
  canvasMerge = layerMerge.getCanvas();
  ctxMerge = canvasMerge.getContext('2d');

  document.getElementById("keggpathwaysMerge").addEventListener('click', function(){listKEGGPathways(ctxMerge, merge_graph, mergedNodes, layerMerge, canvasMerge, 'Merge');});
  document.getElementById("keggpathwaysMerge").style.visibility = "visible";
  document.getElementById('KEGGpathsMerge').style.visibility = "visible";

  if(document.getElementById('nodeShapesAttr')){
    merge_graph.style()
          .selector('node['+val+' ="true"]')        
          .style('shape', document.getElementById('nodeShapes').value)
          .update();
  }
  for(n=0; n < mergedNodes.length; n++){
    merge_graph.batch(function(){
      if(mergedNodes[n].data.symbol){
        var labelText = mergedNodes[n].data.symbol;
        var oldLabelText = mergedNodes[n].data.symbol;
      }
      else if(mergedNodes[n].data.name){
        var labelText = mergedNodes[n].data.name;
        var oldLabelText = mergedNodes[n].data.name;
      }
      else if(mergedNodes[n].data.Name){
        var labelText = mergedNodes[n].data.Name;
        var oldLabelText = mergedNodes[n].data.Name;
      }
      while(getTextWidth(labelText, fontSize +" arial") > 49){
        oldLabelText = oldLabelText.slice(0,-1);
        labelText = oldLabelText+'...';
      }
       merge_graph.style().selector('node[id =\''  + mergedNodes[n].data.id + '\']').style("label", labelText).style('color', 'black').update();
    });
  }
  var selectedLayout = document.getElementById('selectlayoutMerge').value;
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
        merge_graph.style().selector('edge[interaction = \'targets\']').style('target-arrow-shape', 'triangle').update();}, // callback when expand/collapse initialized
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
  merge_graph.expandCollapse(options)
  var api = merge_graph.expandCollapse('get');
  api.collapseAll(options)
  resetLayout(merge_graph, "Merge");

  merge_graph.on('tap', 'node', function(evt){    
     var clickedNode = evt.target;    
     if(clickedNode.data().symbol != undefined){    
       var targetNode = clickedNode.data().symbol   
     }    
     else if(clickedNode.data().name != undefined && clickedNode.data().drugbank_id == undefined && clickedNode.data().symbol != undefined && !clickedNode.data().symbol.includes("Drugs")){    
       var targetNode = clickedNode.data().name   
     }    
     else if(clickedNode.data().drug){  
       var info = "<div align='left' id='information'><table><tr>"    
       Object.keys(clickedNode.data()).forEach(function(key) { 
        if(key == "Synonyms"){
          info += "<td><b>Synonyms</b></td><td>"+clickedNode.data()[key]+"</td></tr>"
        }
        else if(key == "DrugBank_ID"){   
          var drugid = clickedNode.data()[key].split(" ")
           info+= "<td><b>DrugBank ID</b></td><td><a href='https://go.drugbank.com/drugs/"+drugid+"'target='_blank'>"+drugid+"</a></td></tr>"    
         }      
       });    
       info += "</table>"   
       var newWindow = window.open("/DrugInformation");   
       var doc = newWindow.document;    
       doc.open("text/html", "replace");   
       doc.write("<HTML><HEAD><TITLE>"+clickedNode.data().name+   
         "</TITLE><link rel='stylesheet' type='text/css' href='/css/subgraphCss.css'></HEAD>"+    
         "<BODY><H1>"+clickedNode.data().name+    
         "</H1>"+info+"</BODY></HTML>");    
       doc.close();   
     }
     else if(clickedNode.data().symbol != undefined && clickedNode.data().symbol.includes("Drugs")){
        clickedNode.style('shape','diamond')
        api.expand(clickedNode)    
      }   
    }) 
}

function highlightSearchedGene(){
  var gene = document.getElementById('searchgene').value;
  if(gene == ""){
    merge_graph.$('node').style("border-width", 5); 
    merge_graph.$('node[id = "l1"]').style("border-width", 1);  
    merge_graph.$('node[id = "g1"]').style("border-width", 13);  
    merge_graph.$('node[id = "g2"]').style("border-width", 13); 
    merge_graph.$('node[drug]').style("border-width", 2);
    document.getElementById('searchgene').value = "Search gene"
  }
  else if(merge_graph.$('node[symbol=\''  + gene + '\']').length>0){
    merge_graph.$('node').style("border-width", 5);
    merge_graph.$('node[symbol =\''  + gene + '\']').style("border-width", 10);
    merge_graph.$('node[id = "l1"]').style("border-width", 1);
    merge_graph.$('node[id = "g1"]').style("border-width", 13);  
    merge_graph.$('node[id = "g2"]').style("border-width", 13);
    merge_graph.$('node[drug]').style("border-width", 2);  

  }
  else if(merge_graph.$('node[name =\''  + gene + '\']').length>0){
    merge_graph.$('node').style("border-width", 5);
    merge_graph.$('node[name =\''  + gene + '\']').style("border-width", 10);
    merge_graph.$('node[id = "l1"]').style("border-width", 1);
    merge_graph.$('node[id = "g1"]').style("border-width", 13);  
    merge_graph.$('node[id = "g2"]').style("border-width", 13);  
    merge_graph.$('node[drug]').style("border-width", 2);

  }
  else if(merge_graph.$('node[Name =\''  + gene + '\']').length>0){
    merge_graph.$('node').style("border-width", 5);
    merge_graph.$('node[drug]').style("border-width", 2);
    merge_graph.$('node[Name =\''  + gene + '\']').style("border-width", 10);
    merge_graph.$('node[id = "l1"]').style("border-width", 1);
    merge_graph.$('node[id = "g1"]').style("border-width", 13);  
    merge_graph.$('node[id = "g2"]').style("border-width", 13); 
  }
  else{
    document.getElementById('searchgene').value = gene+" not found"
  }
}

function mergeMousoverShared(merge_graph, val, filenameSplitLeft, filenameSplitRight){
merge_graph.nodes('[graph = "both"]').qtip({       // show node attibute value by mouseover
      show: {   
        event: 'mouseover', 
        solo: true,
      },
      content: {text : function(){
        if(!isNaN(parseFloat(this.data(val+'_g2'))) && !isNaN(parseFloat(this.data(val+'_g1')))){
          return '<b>'+val +' ' +filenameSplitLeft +'</b>: ' + parseFloat(this.data(val+'_g1')).toFixed(2) +
          '<br><b>'+val +' ' +filenameSplitRight +'</b>: ' + parseFloat(this.data(val+'_g2')).toFixed(2)} //numbers
        else if(isNaN(parseFloat(this.data(val+'_g2'))) && !isNaN(parseFloat(this.data(val+'_g1')))){
          return '<b>'+val +' ' +filenameSplitLeft +'</b>: ' + parseFloat(this.data(val+'_g1')).toFixed(2) +
          '<br><b>'+val +' ' +filenameSplitRight +'</b>: ' + this.data(val+'_g2')} //numbers
        else if(!isNaN(parseFloat(this.data(val+'_g2'))) && isNaN(parseFloat(this.data(val+'_g1')))){
          return '<b>'+val +' ' +filenameSplitLeft +'</b>: ' + this.data(val+'_g1') +
          '<br><b>'+val +' ' +filenameSplitRight +'</b>: ' + parseFloat(this.data(val+'_g2')).toFixed(2)} //numbers         //bools
        else{
          return '<b>'+val +' </b>: ' + this.data(val+'_g1');
      }}},
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
function updateColorMerged(merge_graph, symbolsLeft, symbolsRight, filenameSplitLeft, filenameSplitRight, val){
  var minMax = getNodeValueRange(unionNodes, val);
  mergeMin = minMax[0];
  mergeMax = minMax[1];
  mapValuestoNodeColor(merge_graph, 'g1', '1', mergeMin, mergeMax, val);
  mapValuestoNodeColor(merge_graph, 'g2', '2', mergeMin, mergeMax, val);
  mergeMousover(merge_graph, 'g1', val, filenameSplitLeft)
  mergeMousover(merge_graph, 'g2', val, filenameSplitRight)
  mergeMousoverShared(merge_graph, val, filenameSplitLeft, filenameSplitRight);
  calculateLabelColorLegend(val, 10, merge_graph, mergeMin, mergeMax)
  mergeColorLegend(merge_graph, mergeMin, val, mergeMax)
}

function mergeColorLegend(merge_graph, mergeMin, labelVal, mergeMax){
  var whitespace = getTextWidth(' ', 10 +" arial");
    if(mergeMin == 'NaN' && mergeMax == 'NaN'){
      mergeMin = 'false'
      mergeMax = 'true'
    }
    var minspace = getTextWidth(mergeMin, 10 +" arial");
    var valspace = getTextWidth(labelVal, 10 +" arial");
    var maxspace = getTextWidth(mergeMax, 10 +" arial");
    var neededWhitespace = ((167-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
    if(neededWhitespace <= 0){

      while(neededWhitespace <= 0){
        labelVal = labelVal.slice(0, -1);
        valspace = getTextWidth(labelVal+'...', 10 +" arial");

        neededWhitespace = ((167-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
      }
      labelVal = labelVal+'...';
    }

  // legend node
  if(!isNaN(mergeMin)){
      merge_graph.$('node[symbol = "legend"]')
        .style('background-image', backgroundimg_num)
  }
  if(isNaN(mergeMin)){
    merge_graph.$('node[symbol = "legend"]')
       .style('background-image', backgroundimg_bool)
  }
    merge_graph.$('node[symbol = "legend"]').style('color', 'black')
    .style('color', 'black')
    .style('background-height',50)
    .style('background-width',200)
    .style('background-position-y','100%')
    .style('shape', 'rectangle')
    .style('width',200)
    .style('height',50)
            .style('label', mergeMin+' '+' '.repeat(neededWhitespace)+ labelVal +' '+' '.repeat(neededWhitespace) + mergeMax)
    .style('border-width',1)
    .style('text-valign' , 'bottom')
    .style('text-max-width', 200)

}

