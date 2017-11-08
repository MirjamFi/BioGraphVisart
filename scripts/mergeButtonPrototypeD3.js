//
//
//
// 
//

var graphlib = new function() {

    function default_value(val, defaultval) {
	if (typeof(val) == 'undefined' || val == null)
	    return defaultval;
	return val;
    }

    this.draw = new function() {

        this.Layout = function() {
	    this.nodes = [];
        };

	var Layout = this.Layout;

	this.random = function(graph, svg) {
	    var layout = new Layout();
	    var height = svg.attr('height');
	    var width = svg.attr('width');
	    for (i in graph.nodes) {
		var node = {
			     x: Math.random() * width,
			     y: Math.random() * height
		           };
		layout.nodes.push(node);
	    }

	    return layout;
	};

    };

    var draw = this.draw;
    
    this.Graph = function(name=null, data=null) {
        // ---
	this.nodes = [];
        this.edges = [];
	this.name = name;
	this.data = data;
	this.layout = null;
    	
	this.Node = function(data, id) {
            this.id = id;
	    this.data = data;
	    this.inedges = [];
	    this.outedges = [];
        };

	this.Edge = function(data, id, sid, tid) {
	    this.id = id;
	    this.sid = sid;
	    this.tid = tid;
	    this.data = data;
	};
    };

    this.Graph.prototype.addNode = function(data=null) {
        // ---
	var node = new this.Node(data, this.nodes.length);
	this.nodes.push(node);
	return node;
    };

    this.Graph.prototype.addNodes = function(n, data=null) {
	var nodes = [];
	if (data == null) {
	    data = [];
            for (i = 0; i < n; i++) 
	        data.push(null);
	}
	for (i = 0; i < n; i++)
	    nodes.push(this.addNode(default_value(data[i], null)));
	return nodes;
    };

    this.Graph.prototype.numNodes = function() { return this.nodes.length; };

    this.Graph.prototype.addEdge = function(s, t, data=null) {
	// ---
	var sid = s;
	if (typeof(s) != 'number') {
	    sid = s.id;
	}
	var tid = t;
	if (typeof(t) != 'number') {
	    tid = t.id;
	}
	var eid = this.edges.length;
	var edge = new this.Edge(data, eid, sid, tid);
	this.nodes[sid].outedges.push(eid);
	this.nodes[tid].inedges.push(eid);
	this.edges.push(edge);
	return edge;
    };

    this.Graph.prototype.numEdges = function() { return this.edges.length; };

    this.Graph.prototype.layout = function() { return this.layout; }

    this.Graph.prototype.draw = function(svg, layout=draw.random) {

	this.layout = layout(this, svg);
	var layout = this.layout;
	svg.selectAll('line')
	   .data(this.edges)
	   .enter()
	   .append('line')
	   .attr('class', 'edge')
	   .attr('x1', function(e) { return layout.nodes[e.sid].x; })
	   .attr('y1', function(e) { return layout.nodes[e.sid].y; })
	   .attr('x2', function(e) { return layout.nodes[e.tid].x; })
	   .attr('y2', function(e) { return layout.nodes[e.tid].y; })
	   .attr('stroke', 'black')
	   .attr('stroke-width', 2);
	svg.selectAll('circle')
	   .data(this.layout.nodes)
	   .enter()
	   .append('circle')
	   .attr('class', 'node')
	   .attr('r', function(v) { return default_value(v.r, 10); })
	   .attr('cx', function(v) { return v.x; })
	   .attr('cy', function(v) { return v.y; })
	   .attr('fill', function(v) { return default_value(v.color, 'red'); })
	   .call(d3.drag()
	           .on('start', nodedragstarted)
		   .on('drag', nodedragged)
		   .on('end', nodedragended));

	// drag listeners --- //
	//
	//
	var nodes = this.nodes;
	
	function outedges(i) {
	    return function(e,k) {
		return nodes[i].outedges.indexOf(k) > -1;
	    };
	}

	function inedges(i) {
            return function(e,k) {
	   	return nodes[i].inedges.indexOf(k) > -1;
	    };
	}

        function nodedragstarted(n, i) {
	    d3.select(this).raise().classed('active', true)
		                   .attr('fill', 'blue');
	    var edges = svg.selectAll('.edge');
	    edges.filter(outedges(i))
	         .attr('stroke', 'blue');
	    edges.filter(inedges(i))
	         .attr('stroke', 'blue');
        }

	function nodedragged(n, i) {
	    d3.select(this).attr('cx', n.x = d3.event.x)
		           .attr('cy', n.y = d3.event.y);
	    var edges = svg.selectAll('.edge');
	    edges.filter(outedges(i))
	         .attr('x1', d3.event.x)
	         .attr('y1', d3.event.y);
	    edges.filter(inedges(i))
	         .attr('x2', d3.event.x)
	         .attr('y2', d3.event.y);
	}

	function nodedragended(n, i) {
	    d3.select(this).raise().classed('active', false)
		                   .attr('fill', function(v) { 
				       return default_value(n.color, 'red'); 
				   });
	    var edges = svg.selectAll('.edge');
	    edges.filter(outedges(i))
	         .attr('stroke', 'black');
	    edges.filter(inedges(i))
	         .attr('stroke', 'black');
	}

    };
    
    
    this.merge = function(GA, GB, on) {
        // merges to graphs GA and GB on the (shared) node attribute 'on'
        var GAB = new graphlib.Graph();
        var GAprfx = GA.name ? GA.name : "GA";
        var GBprfx = GB.name ? GB.name : "GB";
        GA.nodes.forEach(function(node) {
	    GAB.addNode({[GAprfx]: node.data});
        });
        GA.edges.forEach(function(edge) {
            GAB.addEdge(edge.sid, edge.tid, {[GAprfx]: edge.data});
        });
        GAon = GA.nodes.map(function(node) { return node.data[on]; })
        GB.nodes.forEach(function(node) {
            var indexOfNode = GAon.indexOf(node.data[on]);
            if ( indexOfNode == -1 ) 
                GAB.addNode({[GBprfx]: node.data});
	    else
	        GAB.nodes[indexOfNode].data[GBprfx] = node.data;
        });
        GABedges = GAB.edges.map(function(edge) { 
	        return GA.nodes[edge.sid].data[on].toString() + GA.nodes[edge.tid].data[on].toString(); 
        });
        GABon = GAB.nodes.map(function(node) { return node.data[GAprfx] ? node.data[GAprfx][on] : node.data[GBprfx][on]; });
        GB.edges.forEach(function(edge) {
	    var source = GB.nodes[edge.sid];
	    var target = GB.nodes[edge.tid];
            var indexOfEdge = GABedges.indexOf(source.data[on].toString() + target.data[on].toString());
            if (indexOfEdge == -1) { 
	        var sid = GABon.indexOf(source.data[on]);
	        var tid = GABon.indexOf(target.data[on]);
                GAB.addEdge(sid, tid, {[GBprfx]: edge.data});
	    }
            else
                GAB.edges[indexOfEdge].data[GBprfx] = edge.data;
        });
        return GAB;
    };

};

var height = 100;
var width = 500;

var graph1 = new graphlib.Graph("G1");
var v1 = graph1.addNode({symbol: "TP53"});
var u1 = graph1.addNode({symbol: "MAPK1"});
var v1u1 = graph1.addEdge(v1, u1, {interaction: "ABC"});
console.log(graph1);

var GA = d3.select("#GA").append("svg")
                         .attr("height", height)
			 .attr("width", width);
graph1.draw(GA); 

var graph2 = new graphlib.Graph("G2");
var v2 = graph2.addNode({symbol: "TP53"});
var u2 = graph2.addNode({symbol: "PPARG"});
var v2u2 = graph2.addEdge(v2, u2, {interaction: "XYZ"});
console.log(graph2);

var GB = d3.select("#GB").append("svg")
                         .attr("height", height)
			 .attr("width", width);
graph2.draw(GB);

// merged graph

var GAB = d3.select("#GAB").append("svg")
                           .attr("height", height)
			   .attr("width", width);

d3.select('#GAB')
  .append('button')
  .attr('type', 'button')
  .text('MERGE')
  .on('click', function() {
	var merged_graph = graphlib.merge(graph1, graph2, "symbol");
	console.log(merged_graph);
	merged_graph.draw(GAB);
  });
