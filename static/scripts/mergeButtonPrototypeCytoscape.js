var cystyle =  [
                 {selector: 'node',
                    style: {
                      width: 50,
                      height: 50,
                      shape: 'ellipse',
                      'background-color': 'white',
                      'border-color' : 'black',
                      'border-style' : 'solid',
                      'border-width' : '2',
                      label: 'data(symbol)',
                      "text-valign" : "center",
                      "text-halign" : "center",
                      "font-size" : 10
                    }
		  }
                ];

var graph1 = new graphlib.Graph({
        container: document.getElementById('graph1'),
	style: cystyle
});

graph1.readGraphML('data/FDG_WT_control.graphml');

d3.select('#graph1')
  .append('button')
  .attr('type', 'button')
  .text('Layout')
  .on('click', function() {
      graph1.cy.layout({name: 'cose'}).run();
  });

var graph2 = new graphlib.Graph({
        container: document.getElementById('graph2'),
	style: cystyle
});

graph2.readGraphML('data/FDG_WT_therapy.graphml');

d3.select('#graph2')
  .append('button')
  .attr('type', 'button')
  .text('Layout')
  .on('click', function() {
      graph2.cy.layout({name: 'cose'}).run();
  });

// merged graph
//
var merged_graph;

d3.select('#merged_graph')
  .append('button')
  .attr('type', 'button')
  .text('MERGE!')
  .on('click', function() {
      cyinit = { 
                 container: document.getElementById('merged_graph'),
                 style: cystyle
	       };		 
      merged_graph = graphlib.merge(graph1, graph2, "symbol", cyinit);
      console.log(merged_graph)
      merged_graph.cy.layout({name: 'cose'}).run();
      merged_graph.cy.nodes('[?_intersection]').style('border-width', 5).style('border-color', 'red');
  });
