function linkGraphofGene(gene){
	var graphml = getGraphforGene(gene).then(
		response => graphml = response)
	graphml.then(function(response){
		var isChromium = window.chrome;
		var winNav = window.navigator;
		var vendorName = winNav.vendor;
		var isOpera = typeof window.opr !== "undefined";
		var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
		var isIOSChrome = winNav.userAgent.match("CriOS");

		var new_response = response
		if (isIOSChrome) {
		   // is Google Chrome on IOS
		} else if(
		  isChromium !== null &&
		  typeof isChromium !== "undefined" &&
		  vendorName === "Google Inc." &&
		  isOpera === false &&
		  isIEedge === false
		) {
		   // is Google Chrome
		   new_response = new_response.replace(/\</g,"&lt;")

		} else { 
		   // not Google Chrome
		}
		let graphStringRaw = new_response.split("\n")
		window.open("http://localhost:3000/vis?graphString="+graphStringRaw) 


	})

}