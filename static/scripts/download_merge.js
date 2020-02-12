/*
	download merged graph
*/

function downloadMergePNG(){
	outputName = document.getElementById('outputNameMerge').value;
  	var png64 = merge_graph.png();
	$('#downloadPNGMerge').attr('href', png64);
	var download = document.createElement('a');
	download.href = 'data:image/png;base64;'+png64;
  	download.download = outputName + '.png';
	download.click();
}

function downloadMergeSVG(){
	outputName = document.getElementById('outputNameMerge').value;
  	var svgContent = merge_graph.svg({scale: 1, full: true});
  	saveAs(new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"}), outputName +".svg");
}

function downloadMergePDF(){
	const domElement = document.getElementById('body');
	var divHeight = window.innerHeight
	var divWidth = window.innerWidth
	var ratio = divHeight / divWidth;

	var doc = new jsPDF("l", "mm", "a4");
	var width = doc.internal.pageSize.getWidth();
	var height = (ratio * width);

	html2canvas($("#body").get(0), { onclone: (document) => {
	    document.getElementById('nav').style.visibility = 'hidden'
	    document.getElementById('resetMerge').style.visibility = 'hidden'
	    document.getElementById('nav').style.visibility = 'hidden';
	    document.getElementById('merged_graph_buttons').style.visibility = 'hidden'
	    document.getElementById('footer').style.visibility = 'hidden'
	    document.getElementById('searchbutn').style.visibility = 'hidden'
	    if(document.getElementById('searchgene').value == "Search gene"){
	      document.getElementById('searchgene').style.visibility = 'hidden'
	    }
	}}).then(function(canvas){
	  var imgData = canvas.toDataURL('image/png');

	  doc.addImage(imgData, 'PNG', 0, 0, width, height); 
	  outputName = document.getElementById('outputNameMerge').value;
	  doc.save(outputName + '.pdf');
	})
}