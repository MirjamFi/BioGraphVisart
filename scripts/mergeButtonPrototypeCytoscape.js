
var graph = new graphlib.Graph({
        container: document.getElementById('main'),
        style: [
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
            }}]
});

graph.cy.ready(function() {
    graph.readGraphML('data/FDG_WT_control.graphml');
});

d3.select('#main')
  .append('button')
  .attr('type', 'button')
  .text('Layout')
  .on('click', function() {
      graph.cy.layout({name: 'cose'}).run();
  });
