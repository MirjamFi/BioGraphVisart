# BioGraphVisart
This is a web-based tool to interactively visualize *.graphml*-files, especially with biological background. It is written in javascript based on [nodejs](nodejs.org) and [cytoscape.js](http://js.cytoscape.org). It is meant for smaller graphs (up to 30 nodes) but of course bigger networks can be used with loss of clarity and comprehensibility and it takes longer calculation times.

**Nodes** are usually human genes but can be something different with restricted options of visualisation and additional information.
The **labels** of the nodes are taken from the node attribute *\<data key="v\_symbol"\>...\</data\>* (if gene symbols available) or *\<data key="v\_name"\>...\</data\>* (otherwise).

**Edges** are interactions between genes taken from the edge attribute *\<data key="e_interaction"\>...\</data\>*. Edge arrows representation depends on the interaction type (see [kegg.js](https://www.kegg.jp/kegg/xml/docs/)) and is shown in the table ***Interactions***. Default edge arrow is 'vee'.

Nodes are **color**ed by numeric or boolean attribute values you can select from the drop-down menu *Select Coloring Attribute*. If no such attributes are available the nodes are white. The **legend node** in the graph displays the selected attribute's name and the value range (blue: low values/false, red: high values/true, white: 0 or undefined).

In addition, the **node shape** can be changed according to boolean node attributes. Select the attribute from the second drop-down menu *Select Shape Attribute* and select the shape from *Select Shape* drop-down menu. If the attribute is true for a node, the shape is changed accordingly.

The generated graph can be **download**ed as *png, svg* or *json*. A file name can be given (without file ending) but it is not necessary. If no file name given, the graph is stored as *\<filename\>\_\<attribute\>\<png,svg,json\>*. The *json*-file can be used to save the current status of the graph and can be loaded back in again for further interactive visualization instead of loading the native *.graphml*.

Moving the mouse over a node displays the attributes value, over an edge it displays the interaction type (important if there are multiple interactions for one edge). The nodes can be draged and moved around. You can zoom in and out using the mouse wheel/touch pad and also reset the layout (button *Reset layout*).

If the nodes have the EntrezID as attribute (*\<data key="v\_entrez"\>...\</data\>* or *\<data key="v\_entrezID"\>...\</data\>*), clicking on the button *Show KEGG pathways* the ***human*** pathways the displayed genes/nodes are in are collected from [KEGG](https://www.genome.jp/kegg/) and the five pathways in which most of the displayed genes are in are listed. These pathways can be selected and the contained genes are highlighted by accordingly colored rectangles. Nodes that are close to each other are assembled in the same rectangle. Depending on the zoom this might cause that nodes are contained that should not be. Zooming in helps to clearify nodes in question. Highlighted pathways can of course be hidden again. 

At any time the node color attribute can be changed without changing the displayed graph. 

You can also simply load another *.graphml* without reloading the page.
 
![](https://github.com/MirjamFi/SubgraphVisualization/blob/master/Example.png)


### How to start it
You need to have [nodejs](nodejs.org) installed.

1. Disable Cross-Origin Restrictions in your Browser!  

	- **Google Chrome**:
		* Start Google Chrome in the terminal using 

	 		OSX 
	 
	 			open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
	 		Windows10
		
				C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp

			Linux
		
				google-chrome --disable-web-security

	- **Safari**
		* Go to *Safari -> Preferences -> Advanced*

		* Tick *Show Develop Menu* in menu bar

		* In the Develop Menu tick *Disable Cross-Origin Restrictions* and tick *Disable local file restrictions*


2. Run terminal in *SubgraphVisualization-master/static/scripts*: 
		
		node server.js 

3. Open in browser

		http://localhost:3000/

4. Select a .graphml-file and select attribute for node coloring to generate a subgraph or select a .json of a previous generated graph.


