//initialize legend
function createLegend(nodesMin, nodesMax, isLeft){

  let filenameSplitLeft = left.split("/")
  filenameSplitLeft = filenameSplitLeft[filenameSplitLeft.length-1].split('.')[0];
  

  if(right != null){
    var filenameSplitRight = right.split("/")
    filenameSplitRight = filenameSplitRight[filenameSplitRight.length-1].split('.')[0];
  }
  else{
    var filenameSplitRight = '';
  };

  var defs = svg_part.append("defs");

  if(nodesMin === "false"){
      svg_part.append("rect")
      .attr('class',"draggable")
      .attr("width", 99)
      .attr("height", 20)
      .style("fill", "#006cf0")
      .attr("x", 0)
       svg_part.append("rect")
      .attr('class',"draggable")
      .attr("width", 99)
      .attr("height", 20)
      .attr("x", 99)
      .style("fill", "#d50000")
    }

  else if(nodesMin === "not available as attribute"){
      svg_part.append("rect")
        .attr("width", 99)
        .attr("height", 20)
        .attr("x", 0)
        .style("fill", "#ffffff")
        .attr('class',"draggable");
      svg_part.append("rect")
        .attr("width", 99)
        .attr("height", 20)
        .attr("x", 99)
        .style("fill", "#ffffff")
        .attr('class',"draggable");
  }
  else{
    //Append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient.selectAll("stop") 
      .data([                             
          {offset: "0%", color: "#006cf0"}, 
          {offset: "50%", color: "#ffffff"},          
          {offset: "100%", color: "#d50000"}    
        ])                  
      .enter().append("stop")
      .attr("offset", function(d) { return d.offset; }) 
      .attr("stop-color", function(d) { return d.color; });

    svg_part.append("rect")
    .attr("width", 189)
    .attr("height", 20)
    .style("fill", "url(#linear-gradient)")
    .attr('class',"draggable");
  }
  if(Number.isFinite(nodesMin)){
    svg_part.append("text")      
      .attr("x", 94.5 )
      .attr("y", 29 )
      .style("text-anchor", "middle")
      .text("0")
      .attr("id", "mid");
  }

  svg_part.append("text")      // text label left
        //.attr("x", 5 )
        .attr("y", 29 )
        .style("text-anchor", "left")
        .text(nodesMin)
        .attr("id", 'min');

  svg_part.append("text")      // text label right
      .attr("x", 189)
      .attr("y", 29 )
      .style("text-anchor", "end")
      .text(nodesMax)
      .attr("id",'max');

  if(isLeft){
      svg_part.append("text")      // text label middle
        .attr("x", 94.5 )
        .attr("y", 50 )
        .style("text-anchor", "middle")
        .text(nodeVal)
        .attr("id",'legendChanged');
  }
  else{
      svg_part.append("text")      // text label middle
        .attr("x", 94.5 )
        .attr("y", 50 )
        .style("text-anchor", "middle")
        .text(nodeVal)
        .attr("id",'legendChanged');
  }
  //dragElement(document.getElementById("legendGraphsRight"));
}


//set legends range by min and max of nodes' attributes
function legendsRange(nodesMin, nodesMax, oldMin, oldMax, firstTime, nodeValuesNum){
  if(!isEmpty(nodeValuesNum)){
    if(!nodeValuesNum.includes("empty")){
      nodesMin = nodeValuesNum.reduce(function(a, b) {
                  return parseFloat(Math.min(a, b).toFixed(2));
                });
      nodesMax = nodeValuesNum.reduce(function(a, b) {
            return parseFloat(Math.max(a, b).toFixed(2));
          });
      if(!firstTime){
        if(nodesMin>oldMin){
          nodesMin = oldMin;
        }
        if(nodesMax<oldMax){
          nodesMax = oldMax;
        }
      }

      if(nodesMin >= 0){
        nodesMin = -1.0;
      }
      if(nodesMax <= 0){
        nodesMax = 1.0;
      }
    }
    else{
      nodesMin = "false";
      nodesMax = "true";
    }
  }
  
  else if(isEmpty(nodeValuesNum)){
    nodesMin = "not available as attribute";
    nodesMax = "";
  }

  if((!firstTime && !(nodesMax === oldMax)) || (!firstTime && !(nodesMin === oldMin))){
    oldMax = nodesMax;
    oldMin = nodesMin;
    $("#svgid").empty();
    createLegend();
  }
  return[nodesMin, nodesMax, oldMin, oldMax]
}