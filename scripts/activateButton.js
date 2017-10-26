function activateVisualization(){
  var nodeVal = document.getElementById('values').value;
  if(nodeVal != ""){
    $('#visualize').attr("disabled", false);
  }
  else{
    alert('Select a value for nodes.');
  };
};