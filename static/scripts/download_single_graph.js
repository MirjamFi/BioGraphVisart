/* 
  download of graph
*/

// function downloadName(ext){
//   outputName = document.getElementById('outputName').value;
//   if(outputName != "Download File name"){
//     return outputName + ext;
//   }
//   else if(path){
//     return path.replace(".graphml", "_") + '_' + nodeVal + ext;
//   }
//   else{
//     return "example" + ext;
//   }
// }

function downloadPNG(){
  var png64 = cy.png({'output': 'blob'});
  saveAs(new Blob([png64], {type:"image/png"}));
}

function downloadSVG(){
  var svgContent = cy.svg({scale: 1, full: true});
  saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}));
}

function downloadJSON(){
  var json = JSON.stringify(cy.json());
  jQuery('#downloadJSON').attr('href', json);
  var download = document.createElement('a');
  download.href = 'data:text/json;charset=utf-8,'+encodeURIComponent(json);
  document.body.appendChild(download); // required for firefox
  // download.download = downloadName('.json');
  download.click();
}

function downloadPDF () {
    const domElement = document.getElementById('everything');
    var divHeight = window.innerHeight
    var divWidth = window.innerWidth
    var ratio = divHeight / divWidth;
  
    var doc = new jsPDF("l", "mm");
    var width = doc.internal.pageSize.getWidth();
    var height = (ratio * width);

    html2canvas(jQuery("#everything").get(0), { onclone: (document) => {
      document.getElementById('nav').style.visibility = 'hidden'
      // document.getElementById('description').style.visibility = 'hidden'
      document.getElementById('downloadPart').style.visibility = 'hidden' 
      document.getElementById('resetLayout').style.visibility = 'hidden'
      // document.getElementById('loadGraphml').style.visibility = 'hidden'
      document.getElementById('keggpathways').style.visibility = 'hidden'
      document.getElementById('footer').style.visibility = 'hidden'
      document.getElementById('searchbutn').style.visibility = 'hidden'
      document.getElementById('undobutn').style.visibility = 'hidden'
      // document.getElementById('exampleFile').style.visibility = 'hidden'
      if(!noDrpShapes){
        document.getElementById('nodeShapesAttr').style.visibility = 'hidden'
        document.getElementById('nodeShapes').style.visibility = 'hidden'
      }
      if(document.getElementById('searchgene').value == "Search gene"){
        document.getElementById('searchgene').style.visibility = 'hidden'
      }
    }}).then(function(canvas){
    var imgData = canvas.toDataURL('image/png');

    doc.addImage(imgData, 'PNG', 0, 0, width, height); 
 
    doc.save();
  });
}