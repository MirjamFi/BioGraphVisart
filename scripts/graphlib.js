//
//
//
// 
//

"use strict";

var graphlib = new function() {
    
    this.Graph = function(cyinit={}, data=null, name=null) {
        // ---
	//
	this.cy = cytoscape(cyinit);
	this.data = data;
	this.name = name;
    };

    this.Graph.prototype.readGraphML = function(path) {
	var graph = this;
	var node_attributes = {};
	var edge_attributes = {};
	$.get(path, function(graphml) {
	    // get attribute information
	    $(graphml).find('key').each(function() {
		var $key = $(this);
		var id = $key.attr("id");
		var name = $key.attr("attr.name");
		var type = $key.attr("attr.type");
		if ($key.attr("for") == "node") 
		    node_attributes[id] = {type: type, name: name};
		else  // $key.attr("for") == "edge"
		    edge_attributes[id] = {type: type, name: name};
	    });
	    // get nodes
	    var data = [];
	    var node_ids = [];
            $(graphml).find('node').each(function() {
		var $node = $(this);
		var ndata = {};
		node_ids.push($node.attr("id"));
		$node.find('data').each(function() {
		     var $data = $(this);
		     var attr = node_attributes[$data.attr("key")];
		     if (attr.type == 'double')
		         ndata[attr.name] = parseFloat($data.text());
		     else if (attr.type == 'int')
			 ndata[attr.name] = parseInt($data.text());
		     else if (attr.type == 'boolean')
			 ndata[attr.name] = ($data.text() == 'true') ? true : false;
		     else
			 ndata[attr.name] = $data.text().toString();
		});
		data.push(ndata);
	    });
	    graph.addNodes(data.length, data);
	    // get edges
	    data = [];
	    var nidtuples = [];
	    $(graphml).find('edge').each(function() {
		var $edge = $(this);
		var edata = {};
		nidtuples.push([$edge.attr('source'), $edge.attr('target')]);
		$edge.find('data').each(function() {
		    var $data = $(this);
		    var attr = edge_attributes[$data.attr('key')];
		    if (attr.type == 'double')
		        edata[attr.name] = parseFloat($data.text());
		    else if (attr.type == 'int')
		        edata[attr.name] = parseInt($data.text());
		    else if (attr.type == 'boolean')
		        edata[attr.name] = ($data.text() == 'true') ? true : false;
		    else
		        edata[attr.name] = $data.text().toString();
		});
		data.push(edata);
            });
	    graph.addEdges(nidtuples, data);
	});
	//graph.name = path;
	return [node_attributes, edge_attributes];
    };

    this.Graph.prototype.numNodes = function() { 
        return this.cy.nodes().size();
    };

    this.Graph.prototype.addNode = function(data={}) {
        // ---
	data.id = 'n' + this.numNodes().toString();
	return this.cy.add({group: 'nodes', data: data});
    };

    this.Graph.prototype.addNodes = function(n, data=null) {
        if (data == null) 
	    data = _.range(n).map(function() { return {}; });
	var num_nodes = this.numNodes();
	var nodes = data.map(function(d, i) {
	    d.id = 'n' + (num_nodes+i).toString();
	    return {group: 'nodes', data: d};
	});
        return this.cy.add(nodes);
    };

    this.Graph.prototype.numEdges = function() { 
        return this.cy.edges().size();
    };

    this.Graph.prototype.addEdge = function(s, t, data={}) {
	// ---
	var sid = 'n' + s;
	if (typeof(s) != 'number')
	    sid = s.id();
	var tid = 'n' + t;
	if (typeof(t) != 'number') 
	    tid = t.id();
	data.id = 'e' + this.numEdges();
	data.source = sid;
	data.target = tid;
	return this.cy.add({group: 'edges', data: data});
    };

    this.Graph.prototype.addEdges = function(nidtuples, data=null) {
	if (data == null)
	    data = _.range(nidtuples.length).map(function() { return {}; });
	var num_edges = this.numEdges();
	var edges = nidtuples.map(function(e, i) {
	    var d = data[i];
	    d.id = 'e' + (num_edges+i).toString();
	    d.source = (e[0][0] == 'n') ? e[0] : ('n' + e[0]);
	    d.target = (e[1][0] == 'n') ? e[1] : ('n' + e[1]);
	    return {groups: 'edges', data: d};
	});
	return this.cy.add(edges);
    }

    this.merge = function(GA, GB, on, cyinit={}, data=null, name=null) {
        // merges to graphs GA and GB on the (shared) node attribute 'on'
        var GAB = new graphlib.Graph(cyinit, data, name);
	// data prefixes
        var GAprfx = GA.name ? GA.name : "GA";
        var GBprfx = GB.name ? GB.name : "GB";
	// copy GA with data prefix
	// GA nodes
	var NA = GA.cy.nodes().toArray().map(function(node) {
	    return {[on]: node.data(on), [GAprfx]: node.data(), _intersection: false};
	});
	console.log(NA);
	GAB.addNodes(NA.length, NA);
	// GA edges
	var nidtuplesA = GA.cy.edges().toArray().map(function(edge) {
	    return [edge.data("source"), edge.data("target")];
	});
	console.log(nidtuplesA);
	var EA = GA.cy.edges().toArray().map(function(edge) {
	    return {[GAprfx]: edge.data()};
	});
	console.log(EA);
	GAB.addEdges(nidtuplesA, EA);
	// merge GB into GAB
	// GB nodes
	var onvals = NA.map(function(data) { return data[on]; });
	console.log(onvals);
	GB.cy.nodes().forEach(function(node) {
	    var nindex = onvals.indexOf(node.data(on));
	    if (nindex == -1)
	        GAB.addNode({[on]: node.data(on), [GBprfx]: node.data(), _intersection: false});
	    else
	        GAB.cy.nodes()[nindex].data({[GBprfx]: node.data(), _intersection: true});
	});
	// GB edges (assuming both GA and GB are induced subgraphs of one underlying graph ...)
	var onvals_edges = GAB.cy.edges().toArray().map(function(edge) { 
	    return edge.source().data(on) + edge.target().data(on); 
	});
	console.log(onvals_edges);
	onvals = GAB.cy.nodes().toArray().map(function(node) { return node.data(on); });
	GB.cy.edges().forEach(function(edge) {
	     var son = edge.source().data(on);
	     var ton = edge.target().data(on);
	     var eindex = onvals_edges.indexOf(son +  ton);
	     if (eindex == -1) {
		 var sid = onvals.indexOf(son);
		 var tid = onvals.indexOf(ton);
	         GAB.addEdge(sid, tid, {[GBprfx]: edge.data()});
             }
	     else
	         GAB.cy.edges()[eindex].data({[GBprfx]: edge.data()});
	});
	return GAB;
    };

};
