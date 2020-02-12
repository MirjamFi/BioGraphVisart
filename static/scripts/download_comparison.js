/* 
  download png of graph
*/


function downloadPNG(cy, pos, name){

  var png64 = cy.png();
  $('#downloadPNG'+pos).attr('href', png64);
  var download = document.createElement('a');
  download.href = 'data:image/png;base64;'+png64;

  var outputName = document.getElementById('outputName'+pos).value;
  if(outputName != "File name"){
    download.download = outputName + '.png';
  }
  else{
    var reverse = name.split("").reverse().join("")
    var reversesplit = reverse.split(".")
    var reverseselect = reversesplit.slice(1,reversesplit.length).join("_").split("").reverse().join("");
    let filenameSplit = reverseselect
     var fileName = filenameSplit;
     download.download = fileName + '_' + nodeVal + '.png';
  }
  download.click();
}

function downloadSVG(cy, pos, name, nodeVal){
  outputName = document.getElementById('outputName'+pos).value;
  var svgContent = cy.svg({scale: 1, full: true});
  if(outputName != "File name"){
    saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), outputName +".svg");
  }
  else{
    var reverse = name.split("").reverse().join("")
    var reversesplit = reverse.split(".")
    var reverseselect = reversesplit.slice(1,reversesplit.length).join("_").split("").reverse().join("");
    let filenameSplitLeft = reverseselect
     fileName = filenameSplitLeft;
     saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), fileName + '_' + nodeVal + ".svg");
  }
}

function downloadPDF() {
    $(window).scrollTop(0);
    const domElement = document.getElementById('body');
    var divHeight = window.innerHeight
    var divWidth = window.innerWidth
    var ratio = divHeight / divWidth;
  
    var doc = new jsPDF("l", "mm");
    var width = doc.internal.pageSize.getWidth();
    var height = (ratio * width);

    html2canvas($("body").get(0), { onclone: (document) => {
      document.getElementById('description').remove();
      document.getElementById('heatmapcontainer').remove();
      document.getElementById('selectAttribute').remove();
      document.getElementById('outputNameHeatmap').remove();
      document.getElementById('downloadPDF').remove();
      document.getElementById('resetLeft').remove();
      document.getElementById('downloadPartLeft').remove();
      document.getElementById('resetRight').remove();
      document.getElementById('downloadPartRight').remove();
      document.getElementById('dataPart').remove();
      document.getElementById('values').remove();
      document.getElementById('nodeShapesAttr').remove();
      document.getElementById('nodeShapes').remove();
      document.getElementById('keggpathwaysLeft').style.visibility = 'hidden'
      document.getElementById('keggpathwaysRight').style.visibility = 'hidden'
      document.getElementById("legend_heatmap").style.top = 200 +"px";
      document.getElementById('nav').style.visibility = 'hidden'
      document.getElementById('footer').style.visibility = 'hidden'
      document.getElementById('searchbutton').style.visibility = 'hidden'
      if(document.getElementById('searchgene').value == "Search gene"){
        document.getElementById('searchgene').style.visibility = 'hidden'
      }
    }}).then(function(canvas){
    var imgData = canvas.toDataURL('image/png');

    doc.addImage(imgData, 'PNG', 0, 0, width, height); 
    outputName = document.getElementById('outputNameHeatmap').value;
    doc.save(outputName + '.pdf');
  });
}