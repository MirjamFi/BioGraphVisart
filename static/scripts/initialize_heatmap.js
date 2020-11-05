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
var nodeVal;

var highlightedNode; 

var graphsList = [];

var isSIF = false;

var example = false;

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

isSIF = false;
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
            if(file.name.endsWith("graphml")){
              let keyList = getAllIndexes(graphml,'symbol')
              if(keyList.length == 0){
                keyList = getAllIndexes(graphml, 'name')
              }
              keyList.forEach(function(key){ // get keys
                if(key.includes('data')){
                  var symbol = regExp.exec(key)[1];
                  if(data[g] == undefined){
                    data[g] = []
                  }
                  data[g].push(symbol);
                  if(j == Object.keys(graphsList).length){ 
                      var overlapDict = calculateOverlap(data);
                      createHeatmap(overlapDict, foundFiles, graphsList);
                      document.getElementById('selectAttribute').style.visibility = "visible";
                  };
                };
              });
            }
            else if(file.name.endsWith("sif")){
              isSIF = true;
              if(data[g] == undefined){
                    data[g] = []
              }
              var nodesSet = new Set();

              var el = graphml.find(a =>a.includes("\t"));    
              for (var i = 0; i <= graphml.length - 1; i++) { 
                if(el){
                var nodesAndInteraction = graphml[i].split("\t");
                }
                else{
                  var nodesAndInteraction = graphml[i].split(" ");
                }
                var n1 = nodesAndInteraction[0].trim();
                nodesSet.add(n1);
                var n2 = nodesAndInteraction[2].trim();
                nodesSet.add(n2);
              }
              data[g] = Array.from(nodesSet);
              if(j == Object.keys(graphsList).length){
                var overlapDict = calculateOverlap(data);
                createHeatmap(overlapDict, foundFiles, graphsList);
                document.getElementById('selectAttribute').style.visibility = "visible";
              };
            }
          };
        }
      };
    };
    reader.readAsText(file);
  })
};


/* 
 files from directory */
function loadExample(){
  example = true;

  // layout dropdown
  var drpLayoutLeft = document.getElementById("selectlayoutLeft")
   drpLayoutLeft.classList.add("Menu")
  drpLayoutLeft.classList.add("-horizontal")

  var drpLayoutRight = document.getElementById("selectlayoutRight")
   drpLayoutRight.classList.add("Menu")
  drpLayoutRight.classList.add("-horizontal")
  drpLayoutRight.id = "selectlayoutRight";

  var labelLayoutLeft = document.createElement("li")
  labelLayoutLeft.classList.add("-hasSubmenu")
  labelLayoutLeft.innerHTML = "<a href='#'>Layout</a>"
  drpLayoutLeft.appendChild(labelLayoutLeft)
  var ulLayoutLeft = document.createElement("ul")
  labelLayoutLeft.appendChild(ulLayoutLeft)

  var labelLayoutRight = document.createElement("li")
  labelLayoutRight.classList.add("-hasSubmenu")
  labelLayoutRight.innerHTML = "<a href='#'>Layout</a>"
  drpLayoutRight.appendChild(labelLayoutRight)
  var ulLayoutRight = document.createElement("ul")
  labelLayoutRight.appendChild(ulLayoutRight)

  layoutArray.forEach(function(s){
    var optnLayoutLeft = addLayoutOptions(s, "layoutOptLeft");
    optnLayoutLeft.onclick = function(){
      selectedLayoutLeft = s; 
      changeLayout(graphLeft, s);
      document.querySelectorAll('.fa-check').forEach(function(e){
        if(e.classList.contains('layoutOptLeft')){
        e.remove()}});
      optnLayoutLeft.innerHTML = "<a href='#'><i class='fas fa-check layoutOptLeft' style='margin-right:5px'></i>"+s+"</a>"
    };
    ulLayoutLeft.appendChild(optnLayoutLeft);
    var optnLayoutRight= addLayoutOptions(s, "layoutOptRight");
    optnLayoutRight.onclick = function(){
      selectedLayoutRight = s; 
      changeLayout(graphRight, s);
      document.querySelectorAll('.fa-check').forEach(function(e){
        if(e.classList.contains('layoutOptRight')){
        e.remove()}});
      optnLayoutRight.innerHTML = "<a href='#'><i class='fas fa-check layoutOptRight style='margin-right:5px'></i>"+s+"</a>"
    };
    ulLayoutRight.appendChild(optnLayoutRight);
  });
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

  isSIF = false;
  var foundFiles =[{name:"https://raw.githubusercontent.com/MirjamFi/BioGraphVisart/master/TvsL_rooted/S02.graphml"}, {name:"https://raw.githubusercontent.com/MirjamFi/BioGraphVisart/master/TvsL_rooted/S05.graphml"}, {name:"https://raw.githubusercontent.com/MirjamFi/BioGraphVisart/master/TvsL_rooted/S06.graphml"},{name:"https://raw.githubusercontent.com/MirjamFi/BioGraphVisart/master/TvsL_rooted/S09.graphml"}]
  graphsList=[]
  var regExp = /\>(.*)\</;
  var data = {};
  for(let file of foundFiles){
    var request = new XMLHttpRequest();
    request.open('GET', file["name"], false);
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
          var type = request.getResponseHeader('Content-Type');
          if (type.indexOf("text") !== 1) {
            graphString = request.responseText.split("\n")
            isJson = false;
            var filesplit = file["name"].split("/")
            graphsList[filesplit[filesplit.length-1]] = graphString
          }
      }
    }
    request.send(null);
  }
  for(g in graphsList){
    var graphml = graphsList[g]
    let keyList = getAllIndexes(graphml,'symbol')
    if(keyList.length == 0){
      keyList = getAllIndexes(graphml, 'name')
    }
    keyList.forEach(function(key){ // get keys
      if(key.includes('data')){
        var symbol = regExp.exec(key)[1];
        if(data[g] == undefined){
          data[g] = []
        }
        data[g].push(symbol);
        if(g == Object.keys(graphsList)[Object.keys(graphsList).length-1]){ 
            var overlapDict = calculateOverlap(data);
            createHeatmap(overlapDict, foundFiles, graphsList, example);
            document.getElementById('selectAttribute').style.visibility = "visible";
        };
      };
    });
  };
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

var drpValues = [];
var shapeAttributes = [];
  var onceSearch=false;

function loadGraphml(sampleLeft, sampleRight, graphsList) {
  cleanSelectionsHeatmap();
  samples = [sampleLeft, sampleRight];
  var onceAttr = false
  var firstVal = true;
  var onceShapes = false
  samples.forEach(sample=>{
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
      if(!isSIF){

        for (var i = 0; i <= graphString.length - 1; i++) {
          if(graphString[i].includes("for=\"node\"") && 
            (graphString[i].includes("attr.type=\"double\"") || 
              (graphString[i].includes("attr.type=\"boolean\"")))){
            var nodeattr = graphString[i].split("attr.name=")[1].split(" ")[0].replace(/"/g, "");
            if(!drpValues.includes(nodeattr)){
              drpValues.push(nodeattr);
              if(!onceAttr){
                var drp = document.getElementById("values")
                drp.classList.add("Menu")
                drp.classList.add("-horizontal")
                drp.id = "values";
                drp.style.visibility = "visible";

                var labelDrp = document.createElement("li")
                labelDrp.classList.add("-hasSubmenu")
                labelDrp.innerHTML = "<a href='#'>Color attribute</a>"
                drp.appendChild(labelDrp)
                var ulDrp = document.createElement("ul")
                ulDrp.id="ulDrp"
                labelDrp.appendChild(ulDrp)
                onceAttr = true
              }
              var ulDrp = document.getElementById("ulDrp")
              var optnDrp = document.createElement("li");
              optnDrp.id=nodeattr;

              if(firstVal){
                optnDrp.innerHTML="<a href='#'><i class='fas fa-check optnDrp' style='margin-right:5px'></i>"+optnDrp.id+"</a>"
                nodeVal = optnDrp.id
                firstVal = false;
              }
              else{
                optnDrp.innerHTML="<a href='#'>"+nodeattr+"</a>";}
                ulDrp.appendChild(optnDrp)
                optnDrp.onclick = function(){
                document.querySelectorAll('.fa-check').forEach(e =>{
                  if(e.classList.contains('optnDrp')){
                    e.remove()}});
                  this.innerHTML = "<a href='#'><i class='fas fa-check optnDrp' style='margin-right:5px'></i>"+this.id+"</a>"
                  nodeVal = this.id
                  visualize()
              }
              if(graphString[i].includes("attr.type=\"boolean\"")){
                shapeAttributes.push(nodeattr);
                console.log(onceShapes)
                if(!onceShapes){
                  console.log(onceShapes)
                  var drpShapes = document.createElement("ul")
                  drpShapes.id="nodeShapesAttr"
                  drpShapes.classList.add("Menu")
                  drpShapes.classList.add("-horizontal")
                  drpShapes.style.visibility = "visible"
                  document.getElementById("config").appendChild("drpShapes")
                  var labelShape = document.createElement("li")
                  labelShape.classList.add("-hasSubmenu")
                  labelShape.innerHTML = "<a href='#'>Node shape</a>"
                  drpShapes.appendChild(labelShape)
                  var ulShapes = document.createElement("ul")
                  labelShape.appendChild(ulShapes)
                  const shapesArray = ["rectangle", "octagon", "rhomboid", "pentagon", "tag"];
                  onceShapes = true
                }
                var liShape = document.createElement("li")
                liShape.classList.add("-hasSubmenu")
                liShape.innerHTML = "<a href='#'>"+nodeattr+"</a>"
                liShape.id= nodeattr
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
                  // optnShape.parentElement.innerHTML = "<a href='#'><i class='fas fa-check liShape' style='margin-right:5px'></i>"+optnShape.parentElement.id+"</a>"
                  changeNodeShapes(graphLeft, "heatmapcontainer", optnShape.parentElement.id, this.id)
                  changeNodeShapes(graphRight, "heatmapcontainer", optnShape.parentElement.id, this.id)
                  hideMenu(document.getElementById("nodeShapesAttr"))}
                })
              }
            }
          };
          if(graphString[i].includes("<node id=\"n0\">")){
            break;
          };
        };
        if(!onceSearch){
          var searchgeneInput = document.createElement("input")
          searchgeneInput.type = "text"
          searchgeneInput.id = "searchgene"
          searchgeneInput.size = "10"
          searchgeneInput.style.visibility = "hidden"
          searchgeneInput.value = "Node label"
          document.getElementById("config").appendChild(searchgeneInput)
          var searchgenebtn = document.createElement("button")
          searchgenebtn.classList.add("butn")
          searchgenebtn.id = "searchbutton"
          searchgenebtn.style.visibility = "hidden"
          searchgenebtn.innerHTML = "Search"
          document.getElementById("config").appendChild(searchgenebtn)
          var downloadbtn = document.createElement("button")
          downloadbtn.classList.add("butn")
          downloadbtn.id = "downloadPDF"
          downloadbtn.onclick=downloadPDF;
          // downloadbtn.disabled="disabled"
          // downloadbtn.style.visibility ="hidden"
          downloadbtn.innerHTML="<i class='fas fa-file-download fa-lg'></i>"
          document.getElementById("config").appendChild(downloadbtn)
          onceSearch = true;
        }
      }
    }
    else{
      return;
    }
  });
    // layout dropdown
  var drpLayoutLeft = document.getElementById("selectlayoutLeft")
   drpLayoutLeft.classList.add("Menu")
  drpLayoutLeft.classList.add("-horizontal")

  var drpLayoutRight = document.getElementById("selectlayoutRight")
   drpLayoutRight.classList.add("Menu")
  drpLayoutRight.classList.add("-horizontal")
  drpLayoutRight.id = "selectlayoutRight";

  var labelLayoutLeft = document.createElement("li")
  labelLayoutLeft.classList.add("-hasSubmenu")
  labelLayoutLeft.innerHTML = "<a href='#'>Layout</a>"
  drpLayoutLeft.appendChild(labelLayoutLeft)
  var ulLayoutLeft = document.createElement("ul")
  labelLayoutLeft.appendChild(ulLayoutLeft)

  var labelLayoutRight = document.createElement("li")
  labelLayoutRight.classList.add("-hasSubmenu")
  labelLayoutRight.innerHTML = "<a href='#'>Layout</a>"
  drpLayoutRight.appendChild(labelLayoutRight)
  var ulLayoutRight = document.createElement("ul")
  labelLayoutRight.appendChild(ulLayoutRight)

  layoutArray.forEach(function(s){
    var optnLayoutLeft = addLayoutOptions(s, "layoutOptLeft");
    optnLayoutLeft.onclick = function(){
      selectedLayoutLeft = s; 
      changeLayout(graphLeft, s);
      document.querySelectorAll('.fa-check').forEach(function(e){
        if(e.classList.contains('layoutOptLeft')){
        e.remove()}});
      optnLayoutLeft.innerHTML = "<a ><i class='fas fa-check layoutOptLeft' style='margin-right:5px'></i>"+s+"</a>"
    };
    ulLayoutLeft.appendChild(optnLayoutLeft);
    var optnLayoutRight= addLayoutOptions(s, "layoutOptRight");
    optnLayoutRight.onclick = function(){
      selectedLayoutRight = s; 
      changeLayout(graphRight, s);
      document.querySelectorAll('.fa-check').forEach(function(e){
        if(e.classList.contains('layoutOptRight')){
        e.remove()}});
      optnLayoutRight.innerHTML = "<a><i class='fas fa-check layoutOptRight style='margin-right:5px'></i>"+s+"</a>"
    };
    ulLayoutRight.appendChild(optnLayoutRight);
  });
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
};

//remove all options of dropdown
function removeOptions(selectbox){
    var i;
    for(i = selectbox.options.length - 1 ; i >= 0 ; i--)
    {
        selectbox.remove(i);
    }
}

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
  document.getElementById('selectlayoutLeft').innerHTML = "";
  document.getElementById('selectlayoutRight').innerHTML = "";

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
      // {selector: 'node',
      // style:{
      //   'label':'data(symbol)'
      // }},
      // attributes with numbers
      {selector: 'node['+val+' <0]',
        style: {
          'background-color': 'mapData('+val+','+ nodesMin+', 0, #006cf0, white)',
          'color': 'black'
      }},
      {selector: 'node['+val+'<='+0.5*nodesMin+']',
        style: {
          'color': 'white'
      }},
      {selector: 'node['+val+'>0]',
        style: {
          'background-color': 'mapData('+val+', 0,'+ nodesMax+', white, #d50000)',
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

