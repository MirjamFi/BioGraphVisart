# How to run it locally
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

	- **Firefox**
		* install the Firefox Add-on [*cors-plugin*](https://addons.mozilla.org/en-US/firefox/addon/cors-plugin/) and activate it.

2. In terminal go to BioGraphVisart-master/static/scripts and run
		
		node server.js

3. Open in browser http://localhost:3000/BioGraphVisart

4. Select a .graphml-file and select attribute for node coloring to generate a subgraph or select a .json of a previous generated graph.


