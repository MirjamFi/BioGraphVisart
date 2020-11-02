var cystyle =  [
            {selector: 'node',
                style: {
                  width: 50,
                  height: 50,
                  shape: 'ellipse',
                  'background-color': 'white',
                  'border-color' : 'black',
                  'border-style' : 'solid',
                  'border-width' : '2',
                  // label: 'data(symbol)',
                  "text-valign" : "center",
                  "text-halign" : "center",
                  "font-size" : 12,
                  "color":"black"
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
            {
              selector: 'node:selected',
              css: {
                'border-width': 10,
                'width':70,
                'height':70
              }
            }
          ];
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


            mergeFunction(leftNodes, rightNodes, leftEdges, rightEdges, interactionTypes, edgesToMerge, nodeVal);
            setbuttons(nodeVal);
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
        // updateColorMerged(merge_graph, symbolsLeft, symbolsRight, window.opener.left.split("/"), window.opener.right.split("/"), this.id)
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
      // if(shapeAttributes.length > 0){
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

    // layout dropdown
    const layoutArray = ["dagre", "klay", "breadthfirst", "cose-bilkent", "grid"];
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
    searchgene.value = "Search gene"
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
// }

function mergeFunction(leftNodes, rightNodes, leftEdges, rightEdges, interactionTypes, edgesToMerge, val){
  merge_graph = createCyObject('merged_graph', -1,1, )
  const nodesEdges = getmergedGraph(leftNodes, rightNodes, leftEdges, rightEdges, interactionTypes, edgesToMerge, val);
  var mergedNodes = nodesEdges[0];
  var mergedEdges = nodesEdges[1];
      merge_graph.add(mergedNodes)
      merge_graph.add(mergedEdges)
      merge_graph.nodes().noOverlap({ padding: 5 });

  for(n=0; n < mergedNodes.length; n++){
    merge_graph.batch(function(){
      if(mergedNodes[n].data.symbol){
        var labelText = mergedNodes[n].data.symbol;
        var oldLabelText = mergedNodes[n].data.symbol;
      }
      else{
        var labelText = mergedNodes[n].data.name;
        var oldLabelText = mergedNodes[n].data.name;
      }
      while(getTextWidth(labelText, fontSize +" arial") > 49){
        oldLabelText = oldLabelText.slice(0,-1);
        labelText = oldLabelText+'...';
      }
       merge_graph.$('node[id =\''  + mergedNodes[n].data.id + '\']').style("label", labelText);
    });
  }

  // calculate label position for legend and style legend
  var fontSize = 10;
  var labelVal = val


  merge_graph.style(cystyle);

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

  // circle nodes only in GA orange
  merge_graph.nodes('[graph="g1"]').style('border-width', 5).style('border-color', '#fdae61');
  merge_graph.nodes('[symbol = "'+leftID+'"]').style('border-width', 13).style('width', 50)
  .style('height', 50).style('font-weight', 'bold').style('font-size',16);
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
}

function highlightSearchedGene(){
  var gene = document.getElementById('searchgene').value;
  if(gene == ""){
    merge_graph.$('node').style("border-width", 5); 
    merge_graph.$('node[id = "l1"]').style("border-width", 1);  
    merge_graph.$('node[id = "g1"]').style("border-width", 13);  
    merge_graph.$('node[id = "g2"]').style("border-width", 13);  
    document.getElementById('searchgene').value = "Search gene"
  }
  else if(merge_graph.$('node[symbol=\''  + gene + '\']').length>0){
    merge_graph.$('node').style("border-width", 5);
    merge_graph.$('node[symbol =\''  + gene + '\']').style("border-width", 10);
    merge_graph.$('node[id = "l1"]').style("border-width", 1);
    merge_graph.$('node[id = "g1"]').style("border-width", 13);  
    merge_graph.$('node[id = "g2"]').style("border-width", 13);  

  }
  else if(merge_graph.$('node[name =\''  + gene + '\']').length>0){
    merge_graph.$('node').style("border-width", 5);
    merge_graph.$('node[name =\''  + gene + '\']').style("border-width", 10);
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

