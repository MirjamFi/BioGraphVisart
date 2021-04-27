// create dropdown for node attributes
function createSele(){
  var sele = document.createElement("OPTION");    
  sele.text = "Color attribute";
  sele.value = "";
  sele.disabled = true

  return sele;
}

//create dropdown for layout
function createLayoutSele(){
  var seleLayout =document.createElement("OPTION");
  seleLayout.text = "Layout";
  return seleLayout;
}

// add layout options
function addLayoutOptions(graphLayout, layoutOpt){
    var optnLayout = document.createElement("li");
    optnLayout.innerHTML="<a href='#'>"+graphLayout+"</a>";
    if(graphLayout == "cose-bilkent"){
      optnLayout.innerHTML="<a href='#'><i class='fas fa-check "+ layoutOpt+"' style='margin-right:5px'></i>"+graphLayout+"</a>";
    }
    optnLayout.id=graphLayout;
    return optnLayout;
}

// add legend for node color
function addcolorlegend(cy){
  cy.$('node[id = "l1"]')
          .style('color', 'black')
          .style('background-height',50)
          .style('background-width',200)
          .style('background-position-y','100%')
          .style('shape','rectangle')
          .style('width',200)
          .style('height',50)
          .style('border-width',1)
          .style('text-valign' , 'bottom')
          .style('text-max-width', 200)
}

// create label for color legend
function calculateLabelColorLegend(labelVal, fontSize, cy, nodesMin, nodesMax){
  var whitespace = getTextWidth(' ', fontSize +" arial");
  var minspace = getTextWidth(nodesMin, fontSize +" arial");
  var valspace = getTextWidth(labelVal, fontSize +" arial");
  var maxspace = getTextWidth(nodesMax, fontSize +" arial");
  var neededWhitespace = 
    ((200-(minspace+whitespace+valspace+whitespace+maxspace))/whitespace)/2;
  if(neededWhitespace <= 0){
      while(neededWhitespace <= 0){
        labelVal = labelVal.slice(0, -1);
        valspace = getTextWidth(labelVal+'...', fontSize +" arial");
        neededWhitespace = 
          ((200-(minspace+whitespace+valspace+whitespace+maxspace))/
            whitespace)/2;
      }
      labelVal = labelVal+'...';
  }
  if(!isNaN(nodesMin)){
      cy.$('node[id = "l1"]')
        .style('background-image',backgroundimg_num)
    }
    else{
      cy.$('node[id = "l1"]')
        .style('background-image',backgroundimg_bool)
    }
     cy.$('node[id = "l1"]')
      .style('label', nodesMin+' '+' '.repeat(neededWhitespace)+ labelVal +' '
        +' '.repeat(neededWhitespace) + nodesMax)

}
  function appendText(text, interact){
    if(text != ""){
      text = text + ", "
    }
    text  = text + capitalize(interact);
    return text;
  }

  function createImg(){
    var img = document.createElement('img');
    img.width =40;
    img.height =30;
    return img;
  }
    const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

    function appendToInteractionLegend(table, text, img){
    // Insert a row in the table at the last row
    var newRow   = table.insertRow();
    // Insert a cells
    var newInteraction  = newRow.insertCell(0);
    var newArrow  = newRow.insertCell(1);
    var newText  = document.createTextNode(text);
    newInteraction.appendChild(newText);
    newArrow.appendChild(img);
  }
// create legend for edges
function createInteractionLegend(interactionTypes, graphLeft, edgesToMerge, graphRight=undefined, edgesToMergeRight = null) {
  // show legend and update if necessary
    var table = document.getElementById('arrows');
    if(table.rows.length == 0){
      var i = 0;
      var otherisset = false;
      var firstText = "";
      var secondText = "";
      var thirdText = "";
      var fourthText = "";
      var fifthText = "";
      var sixthText = "";
      var seventhText = "";
      var eightthText = "";
      var ninethText = "";
      var tenthText = "";
      var eleventhText = "";
      var twelvethText = "";

      var firstimg = createImg();
      var secondimg = createImg();
      var thirdimg = createImg();
      var fourthimg = createImg();
      var fifthimg = createImg();
      var sixthimg = createImg();
      var seventhimg = createImg();
      var seventhimg = createImg();
      var eightthimg = createImg();
      var ninethimg = createImg();
      var tenthimg = createImg();
      var eleventhimg = createImg();
      var twelvethimg = createImg();
      for(var interact of interactionTypes){
        if(["activation", "expression", "stimulation", "targets"].includes(interact)){
          firstText = appendText(firstText, interact)
          firstimg.src = activation_expression;
        }
        else if(["inhibition", "repression"].includes(interact)){
          secondText  = appendText(secondText, interact)
          secondimg.src = inhibition_repression;
        }
        else if(["compound", "non-covalent binding", "molecular interaction"].includes(interact)){
          thirdText  = appendText(thirdText, interact)
          thirdimg.src = compound;
        }
        else if(["binding/association", "dissociation"].includes(interact)){
          fourthText = appendText(fourthText, interact)
          fourthimg.src = bindingassociation_dissociation;
        }
        else if(["state change, control"].includes(interact)){
          fifthText  = appendText(fifthText, interact)
          fifthimg.src = statechange;
        }
        else if(["indirect effect"].includes(interact)){
          sixthText = appendText(sixthText, interact)
          sixthimg.src = indirecteffect;
        }
        else if(["missing interaction"].includes(interact)){
          seventhText = appendText(seventhText, interact)
          seventhimg.src = missinginteraction;
        }
        else if(["phosphorylation"].includes(interact)){
          eightthText = appendText(eightthText, interact)
          eightthimg.src = phosphorylation;
        }
        else if(["dephosphorylation"].includes(interact)){
          ninethText = appendText(ninethText, interact)
          ninethimg.src = dephosphorylation;
        }
        else if(["glycosylation"].includes(interact)){
          tenthText = appendText(tenthText, interact)
          tenthimg.src = glycosylation;
        }
        else if(["methylation"].includes(interact)){
          eleventhText = appendText(eleventhText, interact)
          eleventhimg.src = methylation;
        }
        else if(["ubiquitination"].includes(interact)){
          twelvethText = appendText(twelvethText, interact)
          twelvethimg.src = ubiquitination;
        }
        else{
          otherisset = true;
        }
        i++;
      }
      if(i == interactionTypes.size){
        if(firstText != ""){
          appendToInteractionLegend(table, firstText, firstimg)
        }
        if(secondText != ""){
          appendToInteractionLegend(table, secondText, secondimg)
        }
        if(thirdText != ""){
          appendToInteractionLegend(table, thirdText, thirdimg)
        }
        if(fourthText != ""){
          appendToInteractionLegend(table, fourthText, fourthimg)
        }
        if(fifthText != ""){
          appendToInteractionLegend(table, fifthText, fifthimg)
        }
        if(sixthText != ""){
          appendToInteractionLegend(table, sixthText, sixthimg)
        }
        if(seventhText != ""){
          appendToInteractionLegend(table, seventhText, seventhimg)
        }
        if(eightthText != ""){
          appendToInteractionLegend(table, eightthText, eightthimg)
        }
        if(ninethText != ""){
          appendToInteractionLegend(table, ninethText, ninethimg)
        }
        if(tenthText != ""){
          appendToInteractionLegend(table, tenthText, tenthimg)
        }
        if(eleventhText != ""){
          appendToInteractionLegend(table, eleventhText, eleventhimg)
        }
        if(twelvethText != ""){
          appendToInteractionLegend(table, twelvethText, twelvethimg)
        }
        if(otherisset){
          var img = createImg();
          img.src = other;
          appendToInteractionLegend(table, 'Other', img)
        }

        if(i == interactionTypes.size && (edgesToMerge || edgesToMergeRight)){
          var newRow = table.insertRow();
          var multipleInteractions = table.insertRow();
          var checkMultiple = newRow.insertCell(0);
          var newArrow = newRow.insertCell(1);

          var newCheckMultiple = document.createElement('input');
          newCheckMultiple.type = "checkbox";
          newCheckMultiple.id = "mergeEdges";
          newCheckMultiple.checked = true;
          newCheckMultiple.addEventListener('click', function(){
            mergeEdges(graphLeft);
            if(graphRight){
              mergeEdges(graphRight)
            }
          });

          var label = document.createElement('label')
          label.htmlFor = "mergeEdges";
          label.appendChild(document.createTextNode('Multiple interactions'));

          checkMultiple.appendChild(newCheckMultiple);
          checkMultiple.appendChild(label)

          var img = createImg();
          img.src = multipleinteractions;
          newArrow.appendChild(img);
      }
      }
    }
}

// merging of multiple edges between two nodes
function mergeEdges(cy, cy2=undefined){
  // do not merge edges
  if(!document.getElementById("mergeEdges").checked) {
    loopEdges:
    for(var i = 0; i<cy.edges().length;i++){
      var e = cy.edges()[i].data();
      // find multiple edges
      if(typeof e.interaction != "string"){
        // hide merged edge
        cy.edges('edge[id = "'+e.id+'"]').style('display', 'none');
        loopInteraction:
        for(var interact of e.interaction){
          loopId:
          for(var j = i; j < cy.edges().length; j++){
            // single edge is already contained
            if(cy.edges()[j].data().id == e.id+'_'+interact.trim()){
              //show single edge
              cy.edges('edge[id = "'+e.id+'_'+interact.trim()+'"]')
                .style('display', 'element').update;
              continue loopInteraction;
            }
          }
          // add single edge to graph
          cy.add({
            group: 'edges',
            data: { id:e.id+'_'+interact.trim(), source:e.source, 
              target:e.target, interaction:interact.trim()},
          });
        }
      }
      else if(e.interaction.includes(",")){
        cy.edges()[i].data().interaction = e.interaction.split(",");
        cy.edges()[i].style('target-arrow-shape', 'vee')
          .style('line-style','solid').update;
        i--;
      }
    }
    showMetaInfo(cy);
  }
  // merge edge
  else if(document.getElementById("mergeEdges").checked){
    for(var i = 0; i < cy.edges().length; i++){
      var edge = cy.edges()[i]
      // show merged edges
      if(edge.hidden()){
        edge.style('display', 'element').style('target-arrow-shape', 'vee')
          .style('line-style','solid');
      }
      // hide single edges
      else if(edge.data().id.includes(edge.data().interaction) || 
        edge.data().id.includes(',')){
          edge.style('display', 'none');
      }
    }
      
  }
  if(cy2 != undefined){
    mergeEdges(cy2);
  }
}

// get nodes and edges grom graphml string
function getNodesAndEdges(graphString, nodeVal,graphpos = undefined, noOptn = false){
    var nodes = [];
    var edges = [];
    var nodeValuesNum = [];
    var interactionTypes = new Set();
    var edgesToMerge = false;
    var drugnodes = [];
    var drugedges = [];
    var drugtargets = {};
    if(graphpos == "left"){
        var leftNodes = [];
    }
    else if(graphpos == "right"){
        var rightNodes = [];
    }

    var prevId = "";
    var pos = 0;

    var regExp = /\>([^)]+)\</; // get symbol name between > <

    for (var i = 0; i <= graphString.length - 1; i++) {
      if(graphString[i].includes("node id")){   // get node id
          var curNode = {};
          curNode.id = graphString[i].split("\"")[1]  ;
          if(graphpos == "left"){
            curNode.graph = "g1";
            leftNodes.push({data: curNode});
          }
          else if(graphpos == "right"){
            curNode.graph = "g2";
            rightNodes.push({data: curNode});
          }
          nodes.push({data: curNode});
      }
      if(!isEmpty(curNode)){
          if(graphString[i].includes("key=\"v_") && 
            !graphString[i].includes("v_id")){
            var attrname = graphString[i].split("v_")[1].split("\">")[0].replace(/=\"\"/,"").replace(/\\\"=\"/,"").replace(/\s/,"_").replace(/\"/,"")
            var val = graphString[i].split(/\>/)[1].split(/\</)[0]
            if(attrname == "entrez_gene" && val.includes("http")){
              val = val.split("/").pop()
            }
            if(!isNaN(parseFloat(val)) && attrname != "name" && !attrname.includes("PDB") && !attrname.includes("Drug IDs")){
                curNode[attrname] = parseFloat(val);
            }
            else{
                curNode[attrname] = val;
            }
          }
          if(graphString[i].includes("\"v_"+nodeVal+"\"\>")){
            var val = regExp.exec(graphString[i])[1]; // if availabe get node value
            if(!isNaN(parseFloat(val))){
              var splitGraphString = graphString[i].split(" ")
              attrID = splitGraphString.filter(s => s.includes('key'))[0].split("\"")[1];
                currVal = {};
                currVal.val = parseFloat(val);
                nodeValuesNum.push(currVal.val);
            }
            else if(val === "false" || val === "true"){
              currVal = {};
                currVal[val] = val;
                currVal.attr = "boolean";
                nodeValuesNum.push(currVal);
                curNode.val = val;
            }
          }
      }   
      if(graphString[i].includes("edge source")){     // get edges
          var curEdge = {};
          s = graphString[i].split("\"")[1];
          t = graphString[i].split("\"")[3];
          curEdge.id = s.concat(t);
          curEdge.source = s;
          curEdge.target = t;
          if(drugnodes.includes(curEdge.source)){
            if(!drugedges[curEdge.target]){
              drugedges[curEdge.target] = []
            }
            drugedges[curEdge.target].push(curEdge.source)
          }
      }
      if(!isEmpty(curEdge)){
          if(graphString[i].includes("e_interaction")){     // get edges interaction type
            var interact = regExp.exec(graphString[i])[1]; 
            if(interact.includes(",")){
                var interactarray = interact.split(",")
                for(let inter of interactarray){
                  interactionTypes.add(inter);
                }
            }
            else{ 
                interactionTypes.add(interact);
            }

            if(prevId == curEdge.id){                       // multiple edges between two nodes
                if(!Array.isArray(edges[pos-1].data.interaction)){
                  curEdge.interaction=
                    [edges[pos-1].data.interaction, interact]
                  if(graphpos == "left"){
                      leftEdges.splice(pos-1,1)
                  }
                  else if(graphpos == "right"){
                      rightEdges.splice(pos-1,1)
                  }
                  edges.splice(pos-1,1)
                  pos = pos -1
                }
                else{
                  edges[pos-1].data.interaction.push(interact)
                  if(graphpos == "left"){
                      if(!Array.isArray(leftEdges[pos-1].data.interaction)){
                        leftEdges[pos-1].data.interaction = 
                          [leftEdges[pos-1].data.interaction]
                      }
                      leftEdges[pos-1].data.interaction.push(interact);
                  }
                  else if(graphpos == "right"){
                      if(!Array.isArray(rightEdges[pos-1].data.interaction)){
                        rightEdges[pos-1].data.interaction = 
                          [rightEdges[pos-1].data.interaction]
                      }
                      rightEdges[pos-1].data.interaction.push(interact)
                  }
                  continue;
                }
                edgesToMerge = true;
            }
            else{
              curEdge.interaction = interact;
            }
            if(graphpos == "left"){
              curEdge.graph = "g1";
              leftEdges.push({data: curEdge});
            }
            else if(graphpos == "right"){
              curEdge.graph = "g2";
              rightEdges.push({data: curEdge});
            }
            edges.push({data: curEdge} );

            prevId = curEdge.id;
            pos = pos +1;
          }
      }
    }
    for(var node of nodes){
      if(node.data.Drugtarget == "true"){
        var drugnumbers = []
        for (const [key, value] of Object.entries(node.data)) {
          if(key.includes("Drugtarget_")){
            var drugsplit = key.split("_")
            var drugnum = drugsplit[1]
            if(!drugnumbers.includes(drugnum)){
              var drug = {}
              drug.target = node.data.id
              drug.number = drugnum
              drug.id = "n" + Object.keys(nodes).length
              drugnodes.push(drug)
              drugnumbers.push(drugnum)
              drug.drug = true
              nodes.push({data: drug});
              if(!drugedges[node.data.id]){
                drugedges[node.data.id] = []
              }
              drugedges[node.data.id].push(drug.id)
              var edge = {}
              edge.id = drug.id.concat(node.data.id);
              edge.source = drug.id;
              edge.target = node.data.id;
              edge.interaction = "stimulation"
              edges.push({data:edge})
            }
            else if(drugnumbers.includes(drugnum)){
              for(var drugnode of drugnodes){
                if(drugnode.target == node.data.id && drugnode.number == drugnum){
                  drugnode[drugsplit.slice(2).join("_")] = value
                  if(drugsplit.slice(2).join("_") == "Name"){
                    drugnode.name = value
                  }
                }
              } 
            }
          }
        }
        delete node.data.Drugtarget
      }
    }
    if(!noOptn){
    var legendNode = {};
        legendNode.id = "l1";
        legendNode.symbol = "legend";
        nodes.push({data:legendNode});
  }
  return [nodes, edges, nodeValuesNum, interactionTypes, edgesToMerge, drugedges];
}

// get nodes and edges grom sif string
function getNodesAndEdgesSIF(graphString, graphpos = undefined, noOptn = false){
    var nodes = [];
    var edges = [];
    var interactionTypes = new Set();
     var edgesToMerge = false;
    if(graphpos == "left"){
        var leftNodes = [];
    }
    else if(graphpos == "right"){
        var rightNodes = [];
    }

    var prevId = "";
    var pos = 0;
    var nodesSet = new Set();

    var el = graphString.find(a =>a.includes("\t"));    
    for (var i = 0; i <= graphString.length - 1; i++) { 
      if(el){
      var nodesAndInteraction = graphString[i].split("\t");
    }
    else{
      var nodesAndInteraction = graphString[i].split(" ");
    }
    var n1 = nodesAndInteraction[0].trim();
    nodesSet.add(n1);
    var interact = nodesAndInteraction[1].trim();
    var n2 = nodesAndInteraction[2].trim();
    nodesSet.add(n2);

    if(interact.includes(",")){
        var interactarray = interact.split(",")
        for(let inter of interactarray){
          interactionTypes.add(inter);
        }
    }
    else{ 
        interactionTypes.add(interact);
    }
  }
  var nodesWIDs = {};
  var j = 0;
  for(var node of nodesSet){
    var curNode = {};
    curNode.id = "n"+j;
    curNode.name = node;
    nodesWIDs[node] = curNode.id;
    j++;
    if(graphpos == "left"){
      curNode.graph = "g1";
      leftNodes.push({data: curNode});
    }
    else if(graphpos == "right"){
      curNode.graph = "g2";
      rightNodes.push({data: curNode});
    }
    nodes.push({data: curNode});
  }
  for (var i = 0; i <= graphString.length - 1; i++) { 
    var curEdge = {};
    if(el){
      var nodesAndInteraction = graphString[i].split("\t");
    }
    else{
      var nodesAndInteraction = graphString[i].split(" ");
    }
    var n1 = nodesAndInteraction[0].trim();
    var interact = nodesAndInteraction[1].trim();
    var n2 = nodesAndInteraction[2].trim();
    var s = nodesWIDs[n1];
    var t = nodesWIDs[n2];
    curEdge.id = s.concat(t)
    curEdge.source = s;
    curEdge.target = t;
    if(prevId == curEdge.id){                       // multiple edges between two nodes
          if(!Array.isArray(edges[pos-1].data.interaction)){
            curEdge.interaction=
              [edges[pos-1].data.interaction, interact]
            if(graphpos == "left"){
                leftEdges.splice(pos-1,1)
            }
            else if(graphpos == "right"){
                rightEdges.splice(pos-1,1)
            }
            edges.splice(pos-1,1)
            pos = pos -1
          }
          else{
            edges[pos-1].data.interaction.push(interact)
            if(graphpos == "left"){
                if(!Array.isArray(leftEdges[pos-1].data.interaction)){
                  leftEdges[pos-1].data.interaction = 
                    [leftEdges[pos-1].data.interaction]
                }
                leftEdges[pos-1].data.interaction.push(interact);
            }
          else if(graphpos == "right"){
              if(!Array.isArray(rightEdges[pos-1].data.interaction)){
                rightEdges[pos-1].data.interaction = 
                  [rightEdges[pos-1].data.interaction]
              }
              rightEdges[pos-1].data.interaction.push(interact)
          }
          continue;
        }
        edgesToMerge = true;
      }
      else{
        curEdge.interaction = interact;
      }
      if(graphpos == "left"){
        curEdge.graph = "g1";
        leftEdges.push({data: curEdge});
      }
      else if(graphpos == "right"){
        curEdge.graph = "g2";
        rightEdges.push({data: curEdge});
      }
      edges.push({data: curEdge} );

      prevId = curEdge.id;
      pos = pos +1;
    }
    if(!noOptn){
    var legendNode = {};
        legendNode.id = "l1";
        legendNode.symbol = "legend";
        nodes.push({data:legendNode});
  }
    return [nodes, edges, [], interactionTypes, edgesToMerge];
}

//set legends range by min and max of nodes' attributes
function legendsRange(nodeValuesNum){
  if(!isEmpty(nodeValuesNum)){
    if(!nodeValuesNum.includes("empty")){
      var nodesMin = nodeValuesNum.reduce(function(a, b) {
        return parseFloat(Math.min(a, b).toFixed(2));
      });
      if(nodesMin > 0){
        nodesMin = -1;
      }
      else if(nodesMin >= 0){
        nodesMin = -1.0;
      }
      var nodesMax = nodeValuesNum.reduce(function(a, b) {
            return parseFloat(Math.max(a, b).toFixed(2));
          });
      if(nodesMax < 0){
        nodesMax = 1;
      }

      if(nodesMax <= 0){
        nodesMax = 1.0;
      }
      else if(isNaN(nodesMin) && isNaN(nodesMax)){
        nodesMin = "false";
        nodesMax = "true";
      }
    }
  }
  else if(isEmpty(nodeValuesNum)){
    var nodesMin = "false";
    var nodesMax = "true";
  }
  return [nodesMin, nodesMax]
}

/* helper functions */
// test if object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// show drop downs for nodes' shapes attribute and shape itself
function activateNodeShapeChange(){
  document.getElementById('nodeShapesAttr')
    .setAttribute('style','visibility:visible');
}

function activateShapes(){
  document.getElementById('nodeShapes')
    .setAttribute('style','visibility:visible');
}

// change node shape of nodes with given attribute
function changeNodeShapes(cy, container, shapeAttribute, shape){
    // select nodes with given attribute
    if(cy.nodes().filter('node['+shapeAttribute+' ="true"]').length > 0){
    cy.style()
        .selector('node['+shapeAttribute+' ="true"]')        
        .style('shape', shape)
        .update();
  }

  // list all shapes already used
  usedShapes = []
  for (var key in usedShapeAttributes) {
    if (Object.prototype.hasOwnProperty.call(usedShapeAttributes, key)) {
          var val = usedShapeAttributes[key];
          usedShapes[val] = key;
      }
  }

  // no shapes have been used so far
  if(isEmpty(usedShapeAttributes)){
    usedShapeAttributes[shapeAttribute] = shape;
     shapeNode = cytoscape({
        container: document.getElementById(container),
        autolock: true,
        layout: {
          name: 'preset'
        },
        style: [
            {selector: 'node',
              style: {
              width: 18,
              height: 18,
              shape: shape,
              'background-color': '#666666',
              label: 'data(id)',
              'font-size': 10,
              'overlay-opacity': 0,
            }
          }
        ],
      });

    shapeNode.userZoomingEnabled( false );
   shapeNode.add({ // node n1
              group: 'nodes', 

              data: { 
                id: shapeAttribute, 
              },
              position: { // the model position of the node (optional on init, mandatory after)
                x: 80,
                y: 50
              },
               locked: true,
            });
   ycoord = 50;
   shapeNode.nodes().ungrabify();

  } 
  // test if shape has been used for another attribute
  else if(Object.keys(usedShapes).includes(shape)){
    if(usedShapes[shape] == shapeAttribute) return;
    var replace = 
      confirm("Shape is already used. Do you want to replace "+
        usedShapes[shape]+" by "+ shapeAttribute+"?")

    // is shape has been used change previous attributes shape back to ellipse
    if(replace){
      delete(usedShapeAttributes[usedShapes[shape]]);
      ycoord = shapeNode.$('node[id ="'+usedShapes[shape]+'"]')
        .position()['y']-35;
      shapeNode.remove('node[id ="'+usedShapes[shape]+'"]');
    }
    else return;

  }
  
  // update shape of a attribute already used
  if (usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    if(shape == "ellipse"){
        shapeNode.remove('node[id ="'+shapeAttribute+'"]')
        if(shapeNode.nodes().length == 0){
          usedShapeAttributes = [];
        }
      }
    else{
      usedShapeAttributes[shapeAttribute] = shape;
      usedShapes[shape] = shapeAttribute
      shapeNode.style()
        .selector('node[id ="'+shapeAttribute+'"]')        
        .style('shape', shape)
        .update();
    }
  }

  // add new shape and attribute
  else if(!isEmpty(usedShapeAttributes) && 
      !usedShapeAttributes.hasOwnProperty(shapeAttribute)){
    ycoord = ycoord + 35;
    usedShapeAttributes[shapeAttribute] = shape;
    shapeNode.add( { group: "nodes", data: { id: shapeAttribute}, 
      position:{'x':80, 'y':ycoord}});
    shapeNode.style()
        .selector('node[id ="'+shapeAttribute+'"]')        
        .style('shape', shape)
        .update();
    shapeNode.nodes().ungrabify().update();

  }
}

/*
  Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 */
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = 
      document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
} 

function changeLayout(cy, selectedLayout){
  var animateLayout = true;
  // var selectedLayout = document.getElementById('selectlayout'+pos).id;
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
  else if(selectedLayout == "cose-bilkent"){
    cy.layout({
        name: "cose-bilkent",
        // Gravity range (constant)
        gravityRange: 1.3,
        animate: true,
        randomize: false
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
        animate: true,
        randomize: false
      }).run();
  }
}

// highlight gene searched by text input
function highlightSearchedGene(cy, secondcy=undefined){
  var gene = document.getElementById('searchgene').value;
  if(gene == ""){
    cy.$('node').style("border-width", 2); 
    cy.$('node[id = "l1"]').style("border-width", 1); 
    if(secondcy){
      secondcy.$('node').style("border-width", 2); 
      secondcy.$('node[id = "l1"]').style("border-width", 1);
    } 
    document.getElementById('searchgene').value = "Search gene"
  }
  else if(cy.$('node[symbol=\''  + gene + '\']').length>0){
    cy.$('node').style("border-width", 2);
    cy.$('node[symbol =\''  + gene + '\']').style("border-width", 10);
    cy.$('node[id = "l1"]').style("border-width", 1);
    if(secondcy && secondcy.$('node[symbol=\''  + gene + '\']').length>0){
      secondcy.$('node').style("border-width", 2);
      secondcy.$('node[symbol =\''  + gene + '\']').style("border-width", 10);
      secondcy.$('node[id = "l1"]').style("border-width", 1);
    }
  }
  else if(cy.$('node[name =\''  + gene + '\']').length>0){
    cy.$('node').style("border-width", 2);
    cy.$('node[name =\''  + gene + '\']').style("border-width", 10);
    cy.$('node[id = "l1"]').style("border-width", 1);
    if(secondcy && secondcy.$('node[name =\''  + gene + '\']').length>0){
      secondcy.$('node').style("border-width", 2);
      secondcy.$('node[name =\''  + gene + '\']').style("border-width", 10);
      secondcy.$('node[id = "l1"]').style("border-width", 1);
    }
  }
  else{
    document.getElementById('searchgene').value = gene+" not found"
  }
}
