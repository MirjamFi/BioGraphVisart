// create canvas for kegg pathway rectangles
function createLayoutKeggPathways(cy, nodes, allPaths, pos=""){
	var layer = cy.cyCanvas({
	          zIndex: -1,
	        });
	var canvas = layer.getCanvas();
	var ctx = canvas.getContext('2d');
  if(document.getElementById("keggpathways"+pos)){
	var b = jQuery.extend( [], document.getElementById("keggpathways"+pos)
		.firstChild.data).join("");
  	if(b == "Hide KEGG Pathways" && allPaths){
  	    // highlightKEGGpaths(ctx, cy, layer, canvas);
  	    highlightKEGGpaths(ctx, canvas, cy, nodes, layer, pos, allPaths, colorschemePaths)
  	}
  	else if(b == "Show KEGG Pathways" && allPaths){
  	    document.getElementById("KEGGpaths"+pos).style.visibility ="hidden";
  	}
  }
	return layer;
}

// create list of top 5 KEGG  pathways of the displayed nodes
async function listKEGGPathways(ctx, cy, nodes, layer, canvas, pos = ""){
  //swap button "Hide"/"show"
  if(document.getElementById('keggpathways'+pos)
  		.firstChild.data == "Show KEGG Pathways"){
    document.getElementById('keggpathways'+pos)
	.firstChild.data  = "Hide KEGG Pathways";

    if(document.getElementById('KEGGpaths'+pos).style.visibility == "hidden"){
      document.getElementById('KEGGpaths'+pos).style.visibility="visible";
    }
    //get pathways from KEGG, show loader while doing so
    else{
      document.getElementById('loader'+pos).style.visibility = "visible";
      document.getElementById('keggpathways'+pos).disabled = true;
      var pathsCount = [];
      allPaths = [];
      colorschemePaths = [];
      for(var n of nodes){
        if(n["data"]["symbol"]!="legend"){
          if(n["data"]["entrezID"] != undefined){
            var entrezID = n["data"]["entrezID"].toString();
          }
          else if(n["data"]["entrez"] != undefined){
            var entrezID = n["data"]["entrez"].toString();            
          }
          let keggpaths = await getPathwaysFromKEGG(entrezID);
          keggpaths = keggpaths.split("\n")
          var line = 0;
          while(line < keggpaths.length){
            if(keggpaths[line].includes("<nobr>Pathway</nobr>")){
              line++;
              var splitarray =keggpaths[line].split("</td>")
              for(var i = 1; i < splitarray.length-2; i=i+2){
                let hsa = "hsa"+splitarray[i-1].split(">hsa")[1].split("</a>")[0]
                let p = splitarray[i].split("<td>")[1]
                p = hsa+" "+p;
                if(p != undefined){
                  if(typeof allPaths[p] == 'undefined'){
                    allPaths[p]=[];
                  }
                  allPaths[p].push(entrezID);
                  if(isNaN(pathsCount[p])){
                    pathsCount[p]=1; 
                  }
                  else{
                    pathsCount[p]=pathsCount[p]+1;
                  }
                }
              }
              break;
            } 
            else{
              line++;
            }
          }
        }
      }
          // only get top 5 of pathways (most genes in)
      var props = Object.keys(pathsCount).map(function(key) {
        return { key: key, value: this[key] };}, pathsCount);
      props = props.sort(function(p1, p2) { return p2.value - p1.value; });
      var topFive = props.slice(0, 5);
          //show table of pathways
      var tbody = document.getElementById("KEGGpaths"+pos);
      var keggForm = document.createElement('form');
      keggForm.id = "form"+pos
   
      var headerKegg = document.createElement ("h3");
      headerKegg.innerHTML = "KEGG Pathways:"
      keggForm.appendChild(headerKegg)
      // var htmlString ="<form> <h3>KEGG Pathways:</h3><br>";
      var colors = ["#66c2a5","#dfc27d","#8da0cb","#e78ac3","#a6d854"]

      for (var i = 0; i < topFive.length; i++) {
        colorschemePaths[topFive[i].key] = colors[i];
        var checkboxKegg = document.createElement('input');
        checkboxKegg.type = 'checkbox';
        checkboxKegg.value = topFive[i].key
        checkboxKegg.onclick=
        	function(){highlightKEGGpaths(ctx, canvas, cy, nodes, layer, pos, allPaths, 
        		colorschemePaths)};
        var label = document.createElement('label')
        label.innerHTML = topFive[i].key;
        label.style.color = colors[i];
        label.id = topFive[i].key; 
        label.style.fontWeight = "bold";
        // label.appendChild(checkboxKegg);  
        keggForm.appendChild(checkboxKegg);
        keggForm.appendChild(label)
        keggForm.appendChild(document.createElement("br"))
        keggForm.appendChild(document.createElement("br"))
      }
      tbody.appendChild(keggForm)
      document.getElementById('loader'+pos).style.visibility = "hidden";
      document.getElementById('keggpathways'+pos).disabled = false;
      document.getElementById('KEGGpaths'+pos).style.visibility = "visible";
    }
  }
  //Hide table, switch button to show
  else {
    document.getElementById('keggpathways'+pos)
    	.firstChild.data  = "Show KEGG Pathways";
    document.getElementById('KEGGpaths'+pos).style.visibility = "hidden";
    document.getElementById('loader'+pos).style.visibility = "hidden";
    var mergeEdgeschecked = document.getElementById('mergeEdges').checked;
    jQuery('#form'+pos+' input:checkbox').prop('checked', false);
    if(mergeEdgeschecked){
      document.getElementById('mergeEdges').checked = true;
    }
    layer.resetTransform(ctx);
    ctx.clearRect(0,0,canvas.width, canvas.height);          
    layer.setTransform(ctx);
    ctx.save();
  }
}

// show rectangles for selected pathways
function highlightKEGGpaths(ctx, canvas, cy, nodes, layer, pos="", allPaths, colorschemePaths){
  ctx.clearRect(0,0,canvas.width, canvas.height);
  cy.on("render cyCanvas.resize", evt => {
    layer.resetTransform(ctx);
    ctx.clearRect(0,0,canvas.width, canvas.height);          
    layer.setTransform(ctx);
    ctx.save();
    drawPathwayRectangles(ctx, cy, nodes, allPaths, colorschemePaths, pos);
    ctx.restore();
  });
  cy.zoom(cy.zoom()*1.000000000000001);
}

// draw rectangles highlighting the selected pathways
function drawPathwayRectangles(ctx, cy, nodes, allPaths, colorschemePaths, pos=""){
  var allCheckedPaths = getCheckedBoxes($('#form'+pos+' input:checkbox'));
  if(allCheckedPaths){
    for(var path of allCheckedPaths){
        var cp = [... allPaths[path]];
        //get neighbored nodes in same pathway for each node
        var nearest_groups = getNeighbors(cp, cy);
        // merge group of neighboring nodes if they intersect
        var merged_nodes = mergeNodeGroups(nearest_groups, cp);
        //mark connected nodes in pathway
        ctx.globalAlpha = 0.6;
        var merged_nodes_grouped = Object.values(merged_nodes)
        for(var grouped_nodes of merged_nodes_grouped){
          var max_dist_x = 0;
          var max_dist_y = 0;
          var most_x=100000;
          var most_y=100000;
          // multiple nodes in one rectangle
          if(grouped_nodes.size > 1){
            for(let n of grouped_nodes){
              if(cy.$("node[entrezID ="+n+"]").position()){
                var position = cy.$("node[entrezID ="+n+"]").position();
              }
              else if(cy.$("node[entrez ="+n+"]").position()){
                var position = cy.$("node[entrez ="+n+"]").position();
              }
              for(let m of grouped_nodes){
                var pos_m;
                if(cy.$("node[entrezID ="+m+"]").position()){
                  pos_m = cy.$("node[entrezID ="+m+"]").position()
                }
                else if(cy.$("node[entrez ="+m+"]").position()){
                  pos_m = cy.$("node[entrez ="+m+"]").position()
                }
                let dist_x = Math.abs(position['x'] -  pos_m['x']);
                if(dist_x >= max_dist_x){
                  max_dist_x = dist_x
                  if(position['x'] <= pos_m['x'] && position['x'] < most_x){
                    most_x = position['x'];
                  }
                  else if(position['x'] > pos_m['x'] && pos_m['x'] < most_x){
                    most_x = pos_m['x'];
                  }
                }
                let dist_y = Math.abs(position['y'] -  pos_m['y']);
                if(dist_y >= max_dist_y){
                  max_dist_y = dist_y
                  if(position['y'] <= pos_m['y'] && position['y'] < most_y){
                    most_y = position['y'];
                  }
                  else if(position['y'] > pos_m['y'] && pos_m['y'] < most_y){
                    most_y = pos_m['y'];
                  }
                }
              }
            }
            if(cy.$("node[entrezID ="+[...grouped_nodes][0]+"]").length > 0){
              var renderedWidth = 
              	cy.$("node[entrezID ="+[...grouped_nodes][0]+"]").width();
            }
            else if(cy.$("node[entrez ="+[...grouped_nodes][0]+"]").length > 0){
              var renderedWidth = 
              	cy.$("node[entrez ="+[...grouped_nodes][0]+"]").width();
            }
            max_dist_x = (max_dist_x + renderedWidth);
            max_dist_y = (max_dist_y + renderedWidth);

            // if nodes lay on one line, set sides to node width
            if(max_dist_x==0){
              max_dist_x = renderedWidth;
            }
            if(max_dist_y==0){
              max_dist_y = renderedWidth;
            }
            centroid = {"x": most_x, "y":most_y}
            var breaked = false;
            for(var node of nodes){
              if(cy.$("node[entrez ="+node.data['entrez']+"]")){
                var testposition =  cy.$("node[entrez ="+node.data['entrez']+"]").renderedPosition();}
              else if(cy.$("node[entrezID ="+node.data['entrezID']+"]")){
                var testposition =  cy.$("node[entrezID ="+node.data['entrezID']+"]").renderedPosition();}
              if(!grouped_nodes.has(node.data["symbol"]) && testposition &&
                testposition['x'] > centroid['x']-(0.5*renderedWidth) && testposition['x'] < centroid['x']-(0.5*renderedWidth) + max_dist_x &&
                testposition['y'] > centroid['y']-(0.5*renderedWidth) && testposition['y'] < centroid['y']-(0.5*renderedWidth) + max_dist_y){
                for(var n of grouped_nodes){
                  if(cy.$("node[entrez ="+n+"]")){
                    var npos = cy.$("node[entrez ="+n+"]").position();}
                  else if(cy.$("node[entrezID ="+n+"]")){
                    var npos = cy.$("node[entrezID ="+n+"]").position();}
                  merged_nodes_grouped.push(new Set([n]));
                }
                breaked = true;
                break;
              }
            }
            if(!breaked){
              drawRect(pos, centroid, renderedWidth, max_dist_x, max_dist_y, path, 
              	ctx, colorschemePaths)         
            }  
          }

          // single node in square
          else if(grouped_nodes.size == 1){
            var k = [...grouped_nodes][0];
            let renderedPos_id = cy.$("node[entrezID ="+k+"]").position();
            let renderedPos = cy.$("node[entrez ="+k+"]").position();
            if(renderedPos_id){
              var position = renderedPos_id;
              var side = (cy.$("node[entrezID ="+k+"]").width()/Math.sqrt(2))*1.7;
              drawRect(pos, position, side, side, side, path, ctx, colorschemePaths);
            }
            else if(renderedPos){
              var position = renderedPos;
              var side = (cy.$("node[entrez ="+k+"]").width()/Math.sqrt(2))*1.7;
              drawRect(pos, position, side, side, side, path, ctx, colorschemePaths);
            }
          }
        }
      }
    }
}

// Pass the checkbox name to the function
function getCheckedBoxes(chkboxName) {
  var checkboxes = chkboxName;
  var checkboxesChecked = [];
  // loop over them all
  for (var i=0; i<checkboxes.length; i++) {
     // And stick the checked ones onto an array...
     if (checkboxes[i].checked) {
        checkboxesChecked.push(checkboxes[i].value);
     }
  }
  // Return the array if it is non-empty, or null
  return checkboxesChecked.length > 0 ? checkboxesChecked : null;
}

// make httprequest to kegg
async function getPathwaysFromKEGG(name) {
     return new Promise(function (resolve, reject) {
         let xhr = new XMLHttpRequest();
         xhr.open('GET', "https://www.kegg.jp/entry/hsa:" + name);
         xhr.onload = function () {
             if (this.status >= 200 && this.status < 300) {
                 resolve(xhr.response);
             } else {
                 reject({
                     status: this.status,
                     statusText: xhr.statusText
                 });
             }
         };
         xhr.onerror = function () {
             reject({
                 status: this.status,
                 statusText: xhr.statusText
             });
         };
         xhr.send();
     });
 }

// get neighbored nodes in same pathway for each node
function getNeighbors(cp, cy){
  var g = 0;
  var nearest_groups = {};
  for(var i = 0; i < cp.length-1; i++){
    let renderedPos_i_id = cy.$("node[entrezID ="+cp[i]+"]").renderedPosition();
    let renderedPos_i = cy.$("node[entrez ="+cp[i]+"]").renderedPosition();
    var position = 0;
    if(renderedPos_i_id){
      position = renderedPos_i_id;
    }
    else if(renderedPos_i){
      position = renderedPos_i;
    }
    else{
      continue;
    }
    for(var j = 1; j < cp.length; j++){
      let renderedPos_j_id = cy.$("node[entrezID ="+cp[j]+"]").renderedPosition();
      let renderedPos_j = cy.$("node[entrez ="+cp[j]+"]").renderedPosition();
      var pos_m = 0;
      if(renderedPos_j_id){
        pos_m = renderedPos_j_id;
      }
      else if(renderedPos_j){
        pos_m = renderedPos_j;
      }
      else{
        continue;
      }
      let dist = 
        Math.getDistance(position['x'], position['y'], pos_m['x'], pos_m['y']);
      if(dist < (0.1*cy.width()) && dist > 0){
        nearest_groups[g] = new Set()
        nearest_groups[g].add(cp[i]);
        nearest_groups[g].add(cp[j]);
      }
    }
    g += 1;
  }
  return nearest_groups;
}

//calculate distance between two nodes
Math.getDistance = function( x1, y1, x2, y2 ) {
  var   xs = x2 - x1,
        ys = y2 - y1;   
  xs *= xs;
  ys *= ys;
  return Math.sqrt( xs + ys );
};


// merge groups if they intersect
function mergeNodeGroups(nearest_groups, cp_copy){
  var merged_nodes={};
  var m = 0;
  var nearest_groups_values = Object.values(nearest_groups);
  for(let group1 of nearest_groups_values){
    var new_group = new Set();
    for(let group2 of nearest_groups_values){
      let intersection = new Set([...group1].filter(x => group2.has(x)));
      if(intersection.size > 0){
        let union = new Set([...group1, ...group2]);
        new_group = new Set([...new_group, ...union]);
        cp_copy = new Set([...cp_copy].filter(x => !union.has(x)));
      }
    }
    var cur_group = Array.from(new_group);
    var added = false;

    if(Object.keys(merged_nodes).length == 0){
      merged_nodes[m] = new Set();
      merged_nodes[m]= new_group;
    }
    else{
      for(let k of Object.keys(merged_nodes)){
        if(cur_group.some(x=> merged_nodes[k].has(x))){
          merged_nodes[k] = new Set([...merged_nodes[k], ...cur_group]);
          added = true;
          break;
        }
      }
      if(!added){
        m += 1;
        merged_nodes[m] = new Set([...cur_group]);
      }
    }
  }
  for(let single of cp_copy){
    m+=1;
    merged_nodes[m]=new Set([single]);
  }

  // check again if groups can be further uninionized
  var merged_nodes_new = {};
  var new_ind = 0;
  merged_nodes_new[new_ind] = new Set();
  for(let k of Object.keys(merged_nodes)){
    let intersection = new Set([...merged_nodes[k]]
      .filter(x => merged_nodes_new[new_ind].has(x)));
    if(intersection.size > 0){
      var union = new Set([...merged_nodes[k], ...merged_nodes_new[new_ind]]);
      merged_nodes_new[new_ind] = new Set([...union]);
    }
    else{
      if(!merged_nodes_new[new_ind].size == 0){
        new_ind += 1;
        merged_nodes_new[new_ind] = merged_nodes[k];          
      }
      else{
        merged_nodes_new[new_ind] = merged_nodes[k];
      }
    }
  }
  return merged_nodes_new;
}

// draw a rectangle at given position with given sidelengths and colored by pathway
function drawRect(pos, position, nodeWidth, side_x, side_y, path, ctx, colorschemePaths){
    ctx.beginPath();
    ctx.rect(position['x']-(0.5*nodeWidth), position['y']-
      (0.5*nodeWidth), side_x, side_y);
    ctx.fillStyle =colorschemePaths[path];
    ctx.fill();
    ctx.closePath();
}