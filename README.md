# BioGraphVisart
This is a web-based tool to interactively visualize networks, especially with biological background. It is written in javascript based on [cytoscape.js](http://js.cytoscape.org). It is available under [biographvisart.org](http://biographvisart.org).

## How to run it locally
You need to have [nodejs](nodejs.org) installed.

1. In terminal go to 

		cd BioGraphVisart-master/static/scripts 
	and run
		
		node server.js

2. Open in browser 

		http://localhost:3000/BioGraphVisart

3. Select a .graphml-file or select a .json of a previous generated graph.

4. To show the KEGG Pathways disable Cross-Origin Restrictions in your Browser!  

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

	- **Firefox**
		* install the Firefox Add-on [*cors-plugin*](https://addons.mozilla.org/en-US/firefox/addon/cors-plugin/) and activate it.

## Embedding in other web applications
Import the BioGraphVisart main html into your html:

		<head>
	    	<link rel="import" href="https://raw.githubusercontent.com/MirjamFi/BioGraphVisart/master/templates/BioGraphVisart.html">
		</head>
		<script>
		   	var link = document.querySelector('link[rel="import"]');
		   	var content = link.import;
			var el = content.getElementById('everything');
		
		    document.body.appendChild(el.cloneNode(true));
  		</script>
