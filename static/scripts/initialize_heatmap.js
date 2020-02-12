var allPathsLeft;
var allPathsRight;
var allPathsMerge;
var layerLeft;
var canvasLeft;
var ctxLeft;
var layerRight;
var canvasRight;
var ctxRight;
var layerMerge;
var cavasMerge;
var ctxMerge;
var shapeNode;

var highlightedNode; 

var graphsList = [];

function getAllIndexes(arr, val) {

    var indexes = [];
    for(var i = 0; i < arr.length; i++)
        if (arr[i].includes(val))
            indexes.push(arr[i]);
    return indexes;
}

/* 
 files from directory */
function loadDir(){
  document.getElementById("loader").style.display="block";
  document.getElementById("heatmapcontainer").innerHTML = "";
  document.getElementById("cyLeft").innerHTML = "";
  document.getElementById("cyRight").innerHTML = "";
  document.getElementById('keggpathwaysLeft').style.visibility = "hidden";
  document.getElementById('KEGGpathsButtonLeft').style.visibility = "hidden";
  document.getElementById('KEGGpathsLeft').style.visibility = "hidden";
  document.getElementById('keggpathwaysRight').style.visibility = "hidden";
  document.getElementById('KEGGpathsButtonRight').style.visibility = "hidden";
  document.getElementById('KEGGpathsRight').style.visibility = "hidden";
  document.getElementById('downloadPartLeft').style.visibility = "hidden";
  document.getElementById('downloadPartRight').style.visibility = "hidden";
  document.getElementById('resetLeft').style.visibility = "hidden";
  document.getElementById('resetRight').style.visibility = "hidden";
    document.getElementById("leftID").innerHTML = "";
  document.getElementById("rightID").innerHTML = "";

  cleanSelectionsHeatmap();

  var drpLayoutLeft = document.getElementById("selectlayoutLeft")
  var seleLayoutLeft = createLayoutSele();
  drpLayoutLeft.add(seleLayoutLeft);
  

  var drpLayoutRight = document.getElementById("selectlayoutRight")
  var seleLayoutRight = createLayoutSele();
  drpLayoutRight.add(seleLayoutRight);

  layoutArray.forEach(function(s){
    var optnLayoutLeft = addLayoutOptions(s);
    var optnLayoutRight = addLayoutOptions(s)
    drpLayoutLeft.add(optnLayoutLeft);
    drpLayoutRight.add(optnLayoutRight);
  });

    let foundFiles = document.getElementById('fileName').files;
    counterlimit = foundFiles.length;
    var data = {};
    let node_ids = [];
    let node_attributes = {};
    let j = 0;
    var count = 0;
    var regExp = /\>(.*)\</;
    graphsList = [];    
    Array.from(foundFiles).forEach(function(file){
      // read file
      var path = file.name;
      var reader = new FileReader();
      reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        var arrayBuffer = evt.target.result;
        graphsList[path] = arrayBuffer.split("\n");
        count = count+ 1;
        if(count == foundFiles.length){
          for(g in graphsList){
            var graphml = graphsList[g];
            j ++;
            let keyList = getAllIndexes(graphml,'symbol')
            keyList.forEach(function(key){ // get keys
              if(key.includes('data')){
                var symbol = regExp.exec(key)[1];
                if(data[g] == undefined){
                  data[g] = []
                }
                data[g].push(symbol);
                if(j == Object.keys(graphsList).length){ 
                    var overlapDict = calculateOverlap(data);
                    createHeatmap(overlapDict);
                    document.getElementById('selectAttribute').style.visibility = "visible";
                };
              };
            });
          };
        }
      };
    };
    reader.readAsText(file);
  })
};

/* 
calculate overlap between loaded graohs
*/
function calculateOverlap(data){
  let overlap = {};
  for(let counter = 0; counter < Object.keys(data).length; counter++){  // first graph
    let key = Object.keys(data)[counter];
    overlap[counter] = {};
    overlap[counter]["sample"]=key;
    let symbols1 = data[key];
    for(let count2=0; count2 < Object.keys(data).length; count2++){   // second graph
      let key2 = Object.keys(data)[count2];
      let symbols2 = data[key2];
      let sym2 = new Set(symbols2);
      let overlapnodes = symbols1.filter(x => sym2.has(x));     // overlap number
      overlap[counter][key2]=overlapnodes.length;
      if(counter == Object.keys(data).length-1){
        if(count2 == Object.keys(data).length-1){
          return(overlap);
        };
      };
    };
  };
};

var drpValues = [];
var shapeAttributes = [];
function loadGraphml(sampleLeft, sampleRight) {
  cleanSelectionsHeatmap();
  samples = [sampleLeft, sampleRight];
  samples.forEach(function (sample){
    var graphString;
    if(!!sample){
        if(sample == sampleLeft){
          path_left = sample;
          graphString = graphsList[path_left];
          graphStringLeft = graphsList[path_left];
        }
        else if(sample == sampleRight){
          path_right=sample;
          graphString = graphsList[path_right];
          graphStringRight = graphsList[path_right];
        }

      // put node atttributes into dropdown select object
        for (var i = 0; i <= graphString.length - 1; i++) {
          if(graphString[i].includes("for=\"node\"") && 
            (graphString[i].includes("attr.type=\"double\"") || 
              (graphString[i].includes("attr.type=\"boolean\"")))){
            var nodeattr = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
            drpValues.push(nodeattr);
            if(graphString[i].includes("attr.type=\"boolean\"")){
              shapeAttributes.push(nodeattr);
            }
          };
          if(graphString[i].includes("<node id=\"n0\">")){
            break;
          };
        };
      }
    else{
      return;
    }
  });
  var drp = document.getElementById("values");      // node attributes
  removeOptions(drp);

  var sele = createSele();
  drp.add(sele);

  drpValues = Array.from(new Set(drpValues)); 
  drpValues.forEach(function(val){
    var optn = document.createElement("OPTION");
    optn.text=val;
    optn.value=val;
    drp.add(optn);
  })
  document.getElementById('values').value = drpValues[0];

  var drpShapeAttr = document.getElementById("nodeShapesAttr"); // boolean attributes
  removeOptions(drpShapeAttr); 

  var sele = document.createElement("OPTION");    
  sele.text = "Choose node's attribute";
  sele.value = "";
  drpShapeAttr.add(sele);

  shapeAttributes = Array.from(new Set(shapeAttributes)); 
  if(shapeAttributes.length > 0){
    shapeAttributes.forEach(function(val){
      var optn = document.createElement("OPTION");
      optn.text=val;
      optn.value=val;
      drpShapeAttr.add(optn);
    })
    drpShapeAttr.style.visibility = "visible";
  }
};

function cleanSelectionsHeatmap(){
  if(shapeNode){
    shapeNode.elements().remove();
  }
  document.getElementById('keggpathwaysLeft').firstChild.data = "Show KEGG Pathways";
  //document.getElementById('KEGGpathsLeft').style.visibility = "hidden";
  document.getElementById('KEGGpathsLeft').innerHTML = "";
  document.getElementById('keggpathwaysRight').firstChild.data = "Show KEGG Pathways";
  //document.getElementById('KEGGpathsRight').style.visibility = "hidden";
  document.getElementById('KEGGpathsRight').innerHTML = "";
  if(document.getElementById('keggpathwaysMerge')){
    document.getElementById('keggpathwaysMerge').style.visibility = "hidden";
  }
  document.getElementById('selectlayoutLeft').value = 'Select Layout';
  document.getElementById('selectlayoutRight').value = 'Select Layout';

  path= null;

  leftGraph = false;
  graphStringLeft =null;
  graphStringRight =null;
  path_left =null;
  path_right =null;
  leftFirstTime = true;
  rightFirstTime = true;
  loadGraphCount = 0;
  svg_part =null;
  firstShape = true;
  usedShapeAttributes = [];
  getDrpDwnFiles = true;

}

// initiate cytoscape graph 
function createCyObject(cyDiv, nodesMin, nodesMax, val){
  document.getElementById(cyDiv).innerHTML = "";
  return cytoscape({
    container: document.getElementById(cyDiv),
    ready: function(){
          },
    style: [
         // style nodes
      basicstyle,
      {selector: 'node',
      style:{
        'label':'data(symbol)'
      }},
      // attributes with numbers
      {selector: 'node['+val+' <0]',
        style: {
          'background-color': 'mapData(val,'+ nodesMin+', 0, #006cf0, white)',
          'color': 'black'
      }},
      {selector: 'node['+val+'<='+0.5*nodesMin+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node['+val+'>0]',
        style: {
          'background-color': 'mapData(val, 0,'+ nodesMax+', white, #d50000)',
          'color': 'black'
      }},
      {selector: 'node['+val+'>='+0.5*nodesMax+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node['+val+'= 0]',
        style: {
          'background-color': 'white',
          'color':'black'
      }},

      // attributes with boolean
      {selector: 'node['+val+'= "false"]',
        style: {
          'background-color': '#006cf0',
          'color':'white'
      }},
      {selector: 'node['+val+'= "true"]',
        style: {
          'background-color': '#d50000',
          'color':'white'
      }},

      {selector: '.highlighted',
            style:{
                'border-width': 8,
                'height':70,
                width:70
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
      ],
  })
}

function highlightNodeTapped(symbol, graphL=undefined, graphR=undefined){
  if(graphL){
    graphL.$('node').removeClass('highlighted')
    graphL.$('node[symbol="'+symbol+'"]').addClass('highlighted')
  }
  if(graphR){
    graphR.$('node').removeClass('highlighted')
    graphR.$('node[symbol="'+symbol+'"]').addClass('highlighted')
  }
}

