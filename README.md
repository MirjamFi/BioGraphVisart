# SubgraphVisualization

With python3 run: python3 -m http.server \<port\>, or
With python2 run: python -m SimpleHTTPServer
in the unzipped archive and then navigated to localhost:<port>/subgraphVisualization.html. 

Load a .graphml-file by  "data/\<graph\>.graphml" and select attribute to generate a subgraph, you can download as .png. A file name can be given (without .png) but it is not necessary. If no file name given, the graph is stored as <.graphml\>\_\<attribute\>.png.

A new .graphml can only be loaded after refreshing the page.

###### Works for  Safari and Chrome (Firefox: download of graph.png not working)