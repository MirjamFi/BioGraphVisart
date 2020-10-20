var left, right;
var leftNodesMin = -1;
var leftNodesMax = 1;
var rightNodesMin = -1;
var rightNodesMax = 1;
var leftOldMin;
var leftOldMax;
var rightOldMin;
var rightOldMax;
var leftGraph = false;
var leftNodes = [];
var rightNodes = [];
var leftEdges = [];
var rightEdges = [];
var graphStringLeft;
var graphStringRight;
var path_left;
var path_right;
var leftFirstTime = true;
var rightFirstTime = true;
var loadGraphCount = 0;
var svg_part;
var firstShape = true;
var usedShapeAttributes = [];
var getDrpDwnFiles = true;
var  leftNodeValuesNum = [];
var  rightNodeValuesNum = [];
var merge_graph;

function createHeatmap(heatmapData, foundFiles, graphsList, example=false){
    /*
        get axes labels (samples) and overlap values
    */
    var axes = [];
    var overlapArrays = [];
    //var overlapValues = [];

    var xLabels = [];

    for (let i in heatmapData){ //get file names
        axes.push(heatmapData[i]["sample"]);
        var reverse = heatmapData[i]["sample"].split("").reverse().join("")
        var reversesplit = reverse.split(".")
        var reverseselect = reversesplit.slice(1,reversesplit.length).join(".").split("").reverse().join("");
        let filenameSplit = reverseselect
        xLabels.push(filenameSplit);
    }

    var normalizedValues = heatmapData;
    var sampleSizes = [];
    for (let i in heatmapData){
    	sample = heatmapData[i]['sample']
    	sampleSizes[sample] = heatmapData[i][sample];
    }

    for (let i in heatmapData){
		sampleRow = heatmapData[i]['sample'];
		for(j=0;j < axes.length; j++){
			sampleCol = axes[j];
            i = parseInt(i);
            overlapArrays.push([j,i, Math.round(parseInt(heatmapData[i][axes[j]])*200/(parseInt(sampleSizes[sampleRow])+parseInt(sampleSizes[sampleCol])))]);
        }
    }
    var heatmapColorStopsDist = 1/9;

    var viridis = ['#440154', '#482777', '#3F4A8A', '#31678E', '#26838F', '#1F9D8A', '#6CCE5A', '#B6DE2B', '#FEE825']

    var heatmapColors = [];
    var j = 0;
    for(i=0; i < 9; i++){
        heatmapColors.push([j, viridis[i]]);
        j = j + heatmapColorStopsDist;
    }

    /*
    create heatmap
    */

    jQuery(function () {
        var leftSelect;
        var rightSelect;
        jQuery('#heatmapcontainer').highcharts({
            
            chart: {
                type: 'heatmap',
                marginTop: 70,
                marginBottom: 70
            },
            plotOptions: {
                series: {
                    events: {
                        click: function (event) {
                            if(isSIF){
                                left = leftSelect+'.sif';
                                right=rightSelect+'.sif';
                            }
                            else{
                                left = leftSelect+'.graphml';
                                right=rightSelect+'.graphml';
                            }
                            document.getElementById("leftID").innerHTML = "";
                            document.getElementById("rightID").innerHTML = "";
                            // document.getElementById('values').setAttribute('style','visibility:visible');
                            document.getElementById("leftID").innerHTML = leftSelect;
                            if(left === right){
                                document.getElementById("rightID").innerHTML = "";
                                document.getElementById("cyRight").innerHTML = "";
                                right = null;
                            }
                            else{
                                document.getElementById("rightID").innerHTML = rightSelect;
                                
                            }
                            var files = []
                            if(example){
                                for(file of foundFiles){
                                    if(file.name.includes(left)){
                                        files.push(file)
                                    }
                                    else if(file.name.includes(right)){
                                        files.push(file)
                                    }
                                }
                            }
                            else{
                                for(file of foundFiles){
                                    if(file.name == left){
                                        files.push(file)
                                    }
                                    else if(file.name == right){
                                        files.push(file)
                                    }
                                }
                            }
                            loadGraphml(left, right, graphsList);
                            visualize(true, files, example);
                        }
                    }
                }
            },
                
            title: {
                text: 'Node Overlap'
            },
            xAxis: {
                categories: xLabels,
                labels: {
                    rotation: -25,
                } 
            },
            yAxis: {
                categories: xLabels,
                title: null
            },
            colorAxis: {
                stops: heatmapColors ,
                min:0,
                max: 100,
                reversed: false
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 320
            },
            tooltip: {
                formatter: function () {
                    leftSelect = this.series.xAxis.categories[this.point.y];
                    rightSelect = this.series.yAxis.categories[this.point.x];
                    return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> has a overlap of <br><b>' +
                        this.point.value + '% </b> with <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
                }
            },
            series: [{
                name: 'Node overlap',
                borderWidth: 1,
                data: overlapArrays,  // first:x, second:y, thirsd:value
                dataLabels: {
                    enabled: true,
                    color: 'black',
                    style: {
                        textShadow: 'none'
                    },
                    format: this.percentage
                }
            }]
        })
    });
    document.getElementById("loader").style.display="none";
};
