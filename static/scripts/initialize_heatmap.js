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
/* load files from directory */
function loadDir(){
  // document.getElementById("loadDir").disabled = true;
  document.getElementById("loader").style.display="block";
  document.getElementById("heatmapcontainer").innerHTML = "";
  document.getElementById("cyLeft").innerHTML = "";
  document.getElementById("cyRight").innerHTML = "";
  document.getElementById('keggpathwaysLeft').style.visibility = "hidden";
  document.getElementById('keggpathwaysRight').style.visibility = "hidden";
  document.getElementById('downloadPartLeft').style.visibility = "hidden";
  document.getElementById('downloadPartRight').style.visibility = "hidden";
  document.getElementById('resetLeft').style.visibility = "hidden";
  document.getElementById('resetRight').style.visibility = "hidden";
    document.getElementById("leftID").innerHTML = "";
  document.getElementById("rightID").innerHTML = "";

  cleanSelections();
  $.get('/foundFilesInDirectory', $("#directory")).then(function (files) {
    if(files.length == 0){
      alert('Folder does not exist.');
      document.getElementById("loader").style.visibility = "hidden";
    }
    let foundFiles = files;

    counterlimit = foundFiles.length;
    let data = {};
    let node_ids = [];
    let node_attributes = {};
    let j = 0;
    foundFiles.forEach(function(file){
      file = "http://127.0.0.1:3000/static/scripts/"+file.replace(/\\/g,'/')
      data[file]=[];

      let k = 0;
      $.get(file).then(function(graphml) {
        // get attribute information
        let keyList = $(graphml).find('key')
        keyList.each(function(){ // get keys
          var $key = $(this);
          var id = $key.attr("id");
          var name = $key.attr("attr.name");
          var type = $key.attr("attr.type");
          if ($key.attr("for") == "node"){ 
            node_attributes[id] = {type: type, name: name};
          }
          k++;
          if(k == keyList.length){
            let n = 0;
            let nodeList = $(graphml).find('node')
            nodeList.each(function() { //get nodes
              let $node = $(this);
              let ndata = {};
              node_ids.push($node.attr("id"));
              let datalist = $node.find('data');

              let d = 0;
              datalist.each(function() {  //get symbols
                let $data = $(this);
                let attr = node_attributes[$data.attr("key")];
                if(attr.name == 'symbol'){
                  data[file].push($data.text().toString());
                };
                if(j == counterlimit-1 && n == nodeList.length-1 &&  d == datalist.length-1){ 
                    var overlapDict = calculateOverlap(data);
                    createHeatmap(overlapDict);
                    document.getElementById("loader").style.display="none";
                    // element.parentNode.removeChild(element);
                    document.getElementById('selectAttribute').style.visibility = "visible";
                };
                d++;
                if(d == datalist.length){
                  n++;
                  if(n == nodeList.length){
                    j++;
                  }
                };
              });
            });
          };
        });
      });
    });
  });
  document.getElementById("keggpathwaysLeft").addEventListener('click', function(){listKEGGPathways('Left', leftNodes);});
  document.getElementById("keggpathwaysRight").addEventListener('click', function(){listKEGGPathways('Right', rightNodes);});

}

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
  document.getElementById('KEGGpathsLeft').style.visibility ="visible";

  document.getElementById('KEGGpathsRight').style.visibility ="visible";

    document.getElementById('keggpathwaysLeft').style.visibility = "visible";
    document.getElementById('keggpathwaysRight').style.visibility = "visible";

  samples = [sampleLeft, sampleRight];
  var drpValues=[];
  samples.forEach(function (sample){
    if(!!sample){
      let filenameSplit = sample.split("/")
      let patient = filenameSplit[filenameSplit.length-1].split('.')[0]   //name of graph

      let path_sample = "../../"+sample;    //get file
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", path_sample, false);
      xmlhttp.send();
      if (xmlhttp.status==200) {
        graphString = xmlhttp.responseText.split("\n");
        if(sample == sampleLeft){
          graphStringLeft = graphString;
          path_left = path_sample;
        }
        else if(sample == sampleRight){
          graphStringRight = graphString;
          path_right=path_sample;
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
  // document.getElementById('KEGGpathsMerge').innerHTML = "";
  // document.getElementById('keggpathwaysMerge').firstChild.data = "Show KEGG Pathways";
  // document.getElementById('KEGGpathsMerge').style.visibility = "hidden";
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

