var oldHighlightedNode;
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

var highlightedNode = {
  symbol: '',
  get getsymbol() { 
    graphLeft.style().selector('node[symbol="'+this.symbol+'"]').style('border-width', 2).style('height', 50).style('width', 50).update();
    if(graphRight){
    graphRight.style().selector('node[symbol="'+this.symbol+'"]').style('border-width', 2).style('height', 50).style('width', 50).update();}
    if(merge_graph)
      merge_graph.style().selector('node[symbol="'+this.symbol+'"]').style('border-width', 5).style('height', 50).style('width', 50).update();
    return this.symbol;
  },
  set setsymbol(x) {
    this.symbol = x;
    graphLeft.style().selector('node[symbol="'+this.symbol+'"]').style('border-width', 8).style('height', 70).style('width', 70).update();
    graphRight.style().selector('node[symbol="'+this.symbol+'"]').style('border-width', 8).style('height', 70).style('width', 70).update();
    if(merge_graph)
      merge_graph.style().selector('node[symbol="'+this.symbol+'"]').style('border-width', 15).style('height', 80).style('width', 80).update();
  }
};

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
  document.getElementById('keggpathwaysRight').style.visibility = "hidden";
  document.getElementById('KEGGpathsButtonRight').style.visibility = "hidden";
  document.getElementById('downloadPartLeft').style.visibility = "hidden";
  document.getElementById('downloadPartRight').style.visibility = "hidden";
  document.getElementById('resetLeft').style.visibility = "hidden";
  document.getElementById('resetRight').style.visibility = "hidden";
    document.getElementById("leftID").innerHTML = "";
  document.getElementById("rightID").innerHTML = "";

  cleanSelections();
  // $.get('/foundFilesInDirectory', $("#directory")).then(function (files) {
  //   if(files.length == 0){
  //     alert('Folder does not exist.');
  //     document.getElementById("loader").style.visibility = "hidden";
  //   }

  var drpLayoutLeft = document.getElementById("selectlayoutLeft")
  var seleLayoutLeft = document.createElement("OPTION");
  seleLayoutLeft.text = "Select Layout";
  drpLayoutLeft.add(seleLayoutLeft);

  var drpLayoutRight = document.getElementById("selectlayoutRight")
  var seleLayoutRight = document.createElement("OPTION");
  seleLayoutRight.text = "Select Layout";
  drpLayoutRight.add(seleLayoutRight);

  const layoutArray = ["dagre (default)", "klay", "breadthfirst", "cose-bilkent", "grid"];

  layoutArray.forEach(function(s){
    var graphLayoutLeft = s;
    var optnLayoutLeft = document.createElement("OPTION");
    optnLayoutLeft.text=graphLayoutLeft;
    optnLayoutLeft.value=graphLayoutLeft;
    var graphLayoutRight = s;
    var optnLayoutRight = document.createElement("OPTION");
    optnLayoutRight.text=graphLayoutRight;
    optnLayoutRight.value=graphLayoutRight;
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
                    document.getElementById("loader").style.display="none";
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

function loadGraphml(sampleLeft, sampleRight) {
  cleanSelections();
  samples = [sampleLeft, sampleRight];
  var drpValues=[];
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

  var sele = document.createElement("OPTION");    
  sele.text = "Choose node's attribute";
  sele.value = "";
  drp.add(sele);

  drpValues = Array.from(new Set(drpValues)); 
  drpValues.forEach(function(val){
    var optn = document.createElement("OPTION");
    optn.text=val;
    optn.value=val;
    drp.add(optn);
  })
};

function cleanSelections(){
    // if it is not the first graph read, delete all selectable options
  document.getElementById('KEGGpathsLeft').innerHTML = "";
  document.getElementById('keggpathwaysLeft').firstChild.data = "Show KEGG Pathways";
  document.getElementById('KEGGpathsLeft').style.visibility = "hidden";
  document.getElementById('KEGGpathsRight').innerHTML = "";
  document.getElementById('keggpathwaysRight').firstChild.data = "Show KEGG Pathways";
  document.getElementById('KEGGpathsRight').style.visibility = "hidden";
  if(document.getElementById('keggpathwaysMerge')){
    document.getElementById('keggpathwaysMerge').style.visibility = "hidden";
  }
  allPathsLeft = null;
  allPathsRight = null;
  allPathsMerge = null;
  // document.getElementById('merged_graph').innerHTML = "";
  leftEdges = [];
  rightEdges = [];
  leftNodes = [];
  rightNodes = [];

  oldHighlightedNode = null;
  layerLeft = null;
  canvasLeft = null;
  ctxLeft = null;
  layerRight = null;
  canvasRight = null;
  ctxRight= null;
  layerMerge = null;
  cavasMerge = null;
  ctxMerge = null;

  graphLeft = null;
  graphRight= null;
  path= null;
  nodes= null;
  colorschemePathsLeft = [];
  colorschemePathsRight = [];
  colorschemePathsMerge = [];
  leftEdges = [];
  rightEdges = [];

  leftNodesMin = -1;
  leftNodesMax = 1;
  rightNodesMin = -1;
  rightNodesMax = 1;
  leftOldMin =null;
  leftOldMax =null;
  rightOldMin =null;
  rightOldMax =null;
  leftGraph = false;
  leftNodes = [];
  rightNodes = [];
  leftEdges = [];
  rightEdges = [];
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
  leftNodeValuesNum = [];
  rightNodeValuesNum = [];
  merge_graph =null;

}

// initiate cytoscape graph 
function createCyObject(cyDiv, nodesMin, nodesMax){
  document.getElementById(cyDiv).innerHTML = "";
  return cytoscape({
    container: document.getElementById(cyDiv),
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
          "font-size" : 12,
          "color":"black",
          'curve-style' : 'bezier'
      }},
      // attributes with numbers
      {selector: 'node[val <0]',
        style: {
          'background-color': 'mapData(val,'+ nodesMin+', 0, #006cf0, white)',
          'color': 'black'
      }},
      {selector: 'node[val <='+0.5*nodesMin+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node[val >0]',
        style: {
          'background-color': 'mapData(val, 0,'+ nodesMax+', white, #d50000)',
          'color': 'black'
      }},
      {selector: 'node[val >='+0.5*nodesMax+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node[val = 0]',
        style: {
          'background-color': 'white',
          'color':'black'
      }},

      // attributes with boolean
      {selector: 'node[val = "false"]',
        style: {
          'background-color': '#006cf0',
          'color':'white'
      }},
      {selector: 'node[val = "true"]',
        style: {
          'background-color': '#d50000',
          'color':'white'
      }},

     // style edges
      {selector: 'edge',
        style: {
          // 'target-arrow-shape': 'triangle',
          'arrow-scale' : 2,
          'curve-style' : 'bezier',
          // 'label':'data(interactionShort)',
          'font-size':16,
          'text-rotation':'autorotate',
          'font-weight':800,
          'target-arrow-shape' : 'vee'
          
        }},
        {selector: 'edge[interaction = \'activation\']',
          style: {
            'target-arrow-shape': 'triangle',
        }},
        {selector: 'edge[interaction = \'expression\']',
          style: {
            'target-arrow-shape': 'triangle',
        }},
        {selector: 'edge[interaction = \'inhibition\']',
          style: {
            'target-arrow-shape': 'tee',
        }},
        {selector: 'edge[interaction = \'repression\']',
          style: {
            'target-arrow-shape': 'tee',
        }},
        {selector: 'edge[interaction = \'binding/association\']',
          style: {
            'target-arrow-shape': 'triangle-cross',
        }},
        {selector: 'edge[interaction = \'dissociation\']',
          style: {
            'target-arrow-shape': 'triangle-cross',
        }},
        {selector: 'edge[interaction = \'compound\']',
          style: {
            'target-arrow-shape': 'circle',
        }},
      {selector: 'edge[interaction = \'indirect effect\']',
        style: {
          'line-style': 'dotted',
          'target-arrow-shape': 'triangle'
        }},
      {selector: 'edge[interaction = \'missing interaction\']',
        style: {
          'line-style': 'dashed',
          'target-arrow-shape': 'triangle'
        }},
        {selector: 'edge[interaction = \'state change\']',
          style: {
            'target-arrow-shape': 'square',
        }},

      {selector: 'edge[interaction = \'phosphorylation\']',
        style: {
          'target-arrow-shape': 'diamond',
          'target-label':'+p',
          'target-text-offset':20
        }},
      {selector: 'edge[interaction = \'dephosphorylation\']',
          style: {
            'target-arrow-shape': 'diamond',
            'target-label':'-p',
          'target-text-offset':20
        }},
      {selector: 'edge[interaction = \'glycosylation\']',
          style: {
           'target-arrow-shape': 'diamond',
           'target-label':'+g',
          'target-text-offset':20
        }},      
      {selector: 'edge[interaction = \'ubiquitination\']',
          style: {
            'target-arrow-shape': 'diamond',
            'target-label':'+u',
          'target-text-offset':20
        }},
      {selector: 'edge[interaction = \'methylation\']',
          style: {
            'target-arrow-shape': 'diamond',
            'target-label':'+m',
          'target-text-offset':20
        }}
      ],
  }).on('tap', 'node',function(evt){
    highlightedNode.getsymbol;
    highlightedNode.setsymbol = this.data("symbol");
    })
}

