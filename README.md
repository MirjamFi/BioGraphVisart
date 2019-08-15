# SubgraphVisualization

Run in terminal in /static/scripts: node server.js 

Disable Cross-Origin Restrictions in your Browser! Easiest is to start Google Chrome in the terminal using 

##### for OSX 
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security

##### for Windows10 
C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp

##### Linux
google-chrome --disable-web-security

Server running at http://localhost:3000/

Select a .graphml-file and select attribute to generate a subgraph or select a json of a previous generated graph, you can download as .png/.svg/.json. A file name can be given (without file ending) but it is not necessary. If no file name given, the graph is stored as \<file name\>\_\<attribute\>.

The label of the nodes is taken from the node attribute \<data key="v_symbol"\>...\</data\>.

To show the KEGG pathways the nodes are in, the nodes must have the EntrezID as attribute (\<data key="v_entrez"\>...\</data\>).

###### Works for Chrome 
