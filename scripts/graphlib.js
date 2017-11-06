//
//
//
// 
//

"use strict";

var graphlib = new function() {
    
    this.Graph = function(cyinit={}, data=null) {
        // ---
	//
	this.data = data;
	this.cy = cytoscape(cyinit);
    };

    this.Graph.prototype.readGraphML = function(path) {
	var graph = this;
	$.get(path, function(graphml) {
	    // get attribute information
	    var node_attributes = {};
	    var edge_attributes = {};
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
/*
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
        GABon = GAB.nodes.map(function(node) { 
	    return node.data[GAprfx] ? node.data[GAprfx][on] : node.data[GBprfx][on];
       	});
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
*/
};
