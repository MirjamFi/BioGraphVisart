function linkGraphofGene(gene){
	var graphml = getGraphforGene(gene);
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://localhost:3000/vis", false);
	xhr.setRequestHeader('Content-Type', 'application/xml');
	xhr.send(graphml);
	xhr = new XMLHttpRequest();
	xhr.open("GET","http://localhost:3000", false);
}