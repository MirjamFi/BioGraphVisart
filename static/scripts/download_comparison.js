/* 
  download png of graph
*/


function downloadPNG(cy, pos, name){

  var png64 = cy.png({'output': 'blob'});
  saveAs(new Blob([png64], {type:"image/png"}));
}

function downloadSVG(cy, pos, name, nodeVal){
  var svgContent = cy.svg({scale: 1, full: true});
  saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}));
}

function downloadPDF() {
    jQuery(window).scrollTop(0);
    const domElement = document.getElementById('body');
    var divHeight = window.innerHeight
    var divWidth = window.innerWidth
    var ratio = divHeight / divWidth;
  
    var doc = new jsPDF("l", "mm");
    var width = doc.internal.pageSize.getWidth();
    var height = (ratio * width);

    html2canvas(jQuery("body").get(0), { onclone: (document) => {
      document.getElementById('description').remove();
      document.getElementById('heatmapcontainer').remove();
      document.getElementById('selectAttribute').remove();
      document.getElementById('downloadPDF').remove();
      document.getElementById('resetLeft').remove();
      document.getElementById('resetRight').remove();
      document.getElementById('keggpathwaysLeft').style.visibility = 'hidden'
      document.getElementById('keggpathwaysRight').style.visibility = 'hidden'
      document.getElementById('nav').style.visibility = 'hidden'
      document.getElementById('footer').style.visibility = 'hidden'
    }}).then(function(canvas){
    var imgData = canvas.toDataURL('image/png');

    doc.addImage(imgData, 'PNG', 0, 0, width, height); 
    doc.save();
  });
}