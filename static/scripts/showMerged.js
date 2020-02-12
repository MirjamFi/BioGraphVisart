function createMerged(leftNodes, leftEdges, rightNodes, rightEdges, interactionTypes){
// cystyle
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
          label: 'data(symbol)',
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
	//buttons: reset, merge, download
  if(!document.getElementById("outputNameMerge")){
	  d3.select('#merged_graph_buttons')  
	    .append('p')

  	d3.select('#merged_graph_buttons')  
  	  .append('input')
  	  .attr('name', 'outputFileMerge')
  	  .attr('type', 'text')
  	  .attr('maxlength', '512')
  	  .attr('id', 'outputNameMerge')
  	  .attr('value', 'File name')

  	d3.select('#merged_graph_buttons')  
  	  .append('button')
  	  .attr('type', 'button')
  	  .attr('class', 'butn')
  	  .attr('id','downloadMergePNG')
  	  .text('.png')
  	  .on('click', function(){downloadMergePNG()});

  	d3.select('#merged_graph_buttons')  
  	  .append('button')
  	  .attr('type', 'button')
  	  .attr('class', 'butn')
  	  .attr('id','downloadMergeSVG')
  	  .text('.svg')
  	  .on('click', function(){downloadMergeSVG()});

    d3.select('#merged_graph_buttons')
      .append('button')
      .attr('class', 'butn')
      .attr('id', 'downloadPDF')
      .text('.pdf')
      .on('click', function(){downloadMergePDF()})

    // color options dropdown
    var drpColor = document.createElement("select");
    drpColor.id = "selectColorAttribute";
    drpColor.name = "selectColor";
    document.getElementById("merged_graph_buttons").appendChild(drpColor);
    drpColor.style.visibility = "visible";
    drpColor.onchange = function(){updateColorMerged(merge_graph, symbolsLeft, symbolsRight, filenameSplitLeft, filenameSplitRight)};

    var sele = document.createElement("OPTION");    
    sele.text = "Choose node's attribute";
    sele.value = window.opener.drpValues[0];
    drpColor.add(sele);
    window.opener.drpValues.forEach(function(val){
      var optn = document.createElement("OPTION");
      optn.text=val;
      optn.value=val;
      drpColor.add(optn);
    }); 
    drpColor.value = sele.value;

    // node shape drop dpwn
    if(window.opener.shapeAttributes.length > 0){
      var nodeShapesAttr = document.createElement("select")
      nodeShapesAttr.id = "nodeShapesAttr"
      nodeShapesAttr.name = "nodeShapesAttr"
      document.getElementById("merged_graph_buttons").appendChild(nodeShapesAttr)
      nodeShapesAttr.onchange = activateShapes;

      var drpShapes = document.getElementById("nodeShapesAttr");
      var seleShapeAttr = document.createElement("OPTION");    
      seleShapeAttr.text = "Select Shape Attribute";
      seleShapeAttr.value = "";
      drpShapes.add(seleShapeAttr);

      shapeAttributes = Array.from(new Set(window.opener.shapeAttributes)); 
      if(shapeAttributes.length > 0){
        shapeAttributes.forEach(function(val){
          var optn = document.createElement("OPTION");
          optn.text=val;
          optn.value=val;
          drpShapes.add(optn);
        })
      }

      var nodeShapes = document.createElement("select")
      nodeShapes.name= "nodeShapes" 
      nodeShapes.id="nodeShapes" 
      document.getElementById("merged_graph_buttons").appendChild(nodeShapes);
      nodeShapes.onchange= function(){changeNodeShapes(merge_graph, 'heatmap_shapes')};
      

      // shapes dropdown
      var drpShape = document.getElementById("nodeShapes");
      drpShape.style.visibility = "hidden";
      var seleShape = document.createElement("OPTION");
      seleShape.text = "Select Shape";
      seleShape.value = "ellipse";
      drpShape.add(seleShape);

      const shapesArray = ["rectangle", "octagon", "rhomboid", "pentagon", "tag"];

      shapesArray.forEach(function(s){
        var nodeShape = s;
        var optnShape = document.createElement("OPTION");
        optnShape.text=nodeShape;
        optnShape.value=nodeShape;
        drpShape.add(optnShape);
      });
    }

    // layout dropdown
    var drpLayout = document.createElement("select");
    drpLayout.id = "selectlayoutMerge";
    drpLayout.name = "selectlayout";
    document.getElementById("merged_graph_buttons").appendChild(drpLayout);
    drpLayout.style.visibility = "visible";
    drpLayout.onchange = function(){changeLayout(merge_graph, 'Merge')};

    var seleLayout = document.createElement("OPTION");
    seleLayout.text = "Select Layout";
    drpLayout.add(seleLayout);

    const layoutArray = ["dagre (default)", "klay", "breadthfirst", "cose-bilkent", "grid"];

    layoutArray.forEach(function(s){
      var graphLayout = s;
      var optnLayout = document.createElement("OPTION");
      optnLayout.text=graphLayout;
      optnLayout.value=graphLayout;
      drpLayout.add(optnLayout);
    });

    var searchgene = document.createElement("input");
    searchgene.id = "searchgene";
    searchgene.value = "Search gene"
    document.getElementById("merged_graph_buttons").appendChild(searchgene);
    searchgene.setAttribute("type", "text");
    searchgene.setAttribute("width", 30);
    var searchbutn = document.createElement("button");
    searchbutn.id = "searchbutn";
    searchbutn.innerHTML = "Search";
    document.getElementById("merged_graph_buttons").appendChild(searchbutn);
    document.getElementById("searchbutn").className = 'butn';  
    searchbutn.onclick = highlightSearchedGene;

}

merge_graph = createCyObject('merged_graph', -1,1, document.getElementById('selectColorAttribute').value)
const nodesEdges = getmergedGraph(leftNodes, rightNodes, leftEdges, rightEdges, interactionTypes);
  var mergedNodes = nodesEdges[0];
  var mergedEdges = nodesEdges[1];
      merge_graph.add(mergedNodes)
      merge_graph.add(mergedEdges)
      merge_graph.nodes().noOverlap({ padding: 5 });

      // calculate label position for legend and style legend
	  var fontSize = 10;
	  var labelVal = document.getElementById("selectColorAttribute").value;
	  

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
    merge_graph.nodes('[symbol = "'+window.opener.leftID+'"]').style('border-width', 13).style('width', 50)
    .style('height', 50).style('font-weight', 'bold').style('font-size',16);
    // circle nodes only in GB light blue
    merge_graph.nodes('[graph="g2"]').style('border-width', 5).style('border-color', '#abd9e9');
    merge_graph.nodes('[symbol = "'+window.opener.rightID+'"]').style('border-width', 13)
    .style('width', 50).style('height', 50).style('font-weight', 'bold').style('font-size',16);
    // circle nodes common in both graphs black double line
    merge_graph.nodes('[graph="both"]').style('border-width', 5).style('border-color', 'black');


    // map values to node color for GA
    mapValuestoNodeColor(merge_graph, 'g1', '1', mergeMin, mergeMax, document.getElementById("selectColorAttribute").value);

    // map values to node color for GB
    mapValuestoNodeColor(merge_graph, 'g2', '2', mergeMin, mergeMax,  document.getElementById("selectColorAttribute").value);

    // on mpuse-over show value of selected attribute
   let filenameSplitLeft = window.opener.left.split("/")
	 filenameSplitLeft = filenameSplitLeft[filenameSplitLeft.length-1].split('.')[0];

    let filenameSplitRight = window.opener.right.split("/")
    filenameSplitRight = filenameSplitRight[filenameSplitRight.length-1].split('.')[0];
		 
	mergeMousover(merge_graph,'g1', document.getElementById("selectColorAttribute").value, filenameSplitLeft);
	mergeMousover(merge_graph,'g2', document.getElementById("selectColorAttribute").value, filenameSplitRight);

	// createLegendMerge(mergeMin, mergeMax);
  mergeMousoverShared(merge_graph, document.getElementById("selectColorAttribute").value, filenameSplitLeft, filenameSplitRight);
	merge_graph.layout({name: 'dagre'}).run();   
	document.getElementById('KEGGpathsButtonMerge').style.visibility ="visible";
	// set background layer to hoghlight pathways
  layerMerge = createLayoutKeggPathways(merge_graph, allPathsMerge, 'Merge')
  canvasMerge = layerMerge.getCanvas();
  ctxMerge = canvasMerge.getContext('2d');

	document.getElementById("keggpathwaysMerge").addEventListener('click', function(){listKEGGPathways(ctxMerge, merge_graph, mergedNodes, layerMerge, canvasMerge, 'Merge', 'Merge');});
	document.getElementById("keggpathwaysMerge").style.visibility = "visible";
	document.getElementById('KEGGpathsMerge').style.visibility = "visible";

  merge_graph.style()
        .selector('node['+document.getElementById('nodeShapesAttr').value+' ="true"]')        
        .style('shape', document.getElementById('nodeShapes').value)
        .update();

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
        var val = document.getElementById("selectColorAttribute").value;
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
function updateColorMerged(merge_graph, symbolsLeft, symbolsRight, filenameSplitLeft, filenameSplitRight){
  var minMax = getNodeValueRange(unionNodes, document.getElementById("selectColorAttribute").value);
  mergeMin = minMax[0];
  mergeMax = minMax[1];
  let val = document.getElementById('selectColorAttribute').value;
  mapValuestoNodeColor(merge_graph, 'g1', '1', mergeMin, mergeMax, val);
  mapValuestoNodeColor(merge_graph, 'g2', '2', mergeMin, mergeMax, val);
  mergeMousover(merge_graph, 'g1', val, filenameSplitLeft)
  mergeMousover(merge_graph, 'g2', val, filenameSplitRight)
  mergeMousoverShared(merge_graph, val, filenameSplitLeft, filenameSplitRight);
  calculateLabelColorLegend(val, 10, merge_graph, mergeMin, mergeMax)
  mergeColorLegend(merge_graph, mergeMin, val,mergeMax)
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
