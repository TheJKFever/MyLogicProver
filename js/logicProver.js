
(function(){
	var props = [];
	var rules = [];
	var transformations = [];
	var conc;

	var proofList = $('proofList');


	function validateProp(prop) {
		possValues = ['p', 'q', 'r', 's', 't', 'u', 'v', 'w', '^', '|', '~', '-', '>', '<', '='];
		prop = prop.split('');
		//test for odd characters 
		for (var i=0; i<prop.length;i++){
			if (jQuery.inArray(prop[i],possValues) == -1){
				alert("Please enter a valid proposition using only p, q, r, s, t, u, v, w, ^, |, ~, - >, <, =");
				return false;
			}
		}
		return true;
		//test for correct operators 
	}

	function addProp(){

	}
	function addConc(){

	}

	function createTable(tbl){
		lAverage=0; hAverage=0;
		for (var i = 0; i<temperatures.length; i++) {
			var date = ''+(temperatures[i][0].getMonth()+1)+"/"+temperatures[i][0].getDate()+"/"+temperatures[i][0].getFullYear();
			var low = temperatures[i][1];
			var high = temperatures[i][2];
			tbl += '<tr><td>'+date+'</td><td style="text-align: right">'+low+'</td><td style="text-align: right">'+high+'</td></tr>';
			if (low < lowest){
				lowest = low;
				lowestDate = date;
			} 
			if (high > highest){
				highest = high;
				highestDate = date;	
			}
			lAverage+=temperatures[i][1];
			hAverage+=temperatures[i][2];
		}
		lAverage=(lAverage/temperatures.length).toFixed(1);
		hAverage=(hAverage/temperatures.length).toFixed(1);
		tbl+='<tr class="summaryRow"><td>Averages</td><td style="text-align: right">'+lAverage+'</td><td style="text-align: right">'+hAverage+'</td></tr>';
		tbl+='<tr class="summaryRow"><td colspan="3">The lowest temperature of '+lowest+' occured on '+lowestDate+'.</tr>';
		tbl+='<tr class="summaryRow"><td colspan="3">The highest temperature of '+highest+' occured on '+highestDate+'.</tr>';
		tbl+='</table>';
		return tbl;
	}

	function validateConc(){
		conc = $('newConcInput');
		if (validateProp(conc)){
			$('newConcInput').style.display = "none";
			$('submitConc').style.value = "Solve";			
			$('submitConc').style.margin = "0 auto";
			addConc(conc);
		}
	}

	function init() {
		'use strict';
		$('propForm').onsubmit = validateProp;
		$('concForm').onsubmit = validateConc;		
	}

	function $(elementID){ 
		if (typeof(elementID) == 'string') { 
			return document.getElementById(elementID);
		}
	}

	window.onload = init;
	
})();