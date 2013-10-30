
(function(){
	//In the form of [[argument],[rule/given],[number of variable]]
	var args = [];
	var conc;
    //transformation in format [rule number, [argument number 1, ...., argument number n], outcome argument]
    var transformations = [];

	function validateArg(arg) {
		if (arg === "") {return false;}
		var parOpenCount=0;
		var numVariables=0;
		arg = arg.split("");
		var end = arg.length-1;
		for (i=0; i<arg.length;i++){
			//Check to see if an invalid character was entered
			if (jQuery.inArray(arg[i],["*", "|", ">", "=", "~", "(", ")", "p", "q", "r", "s", "t", "u", "v", "w"]) == -1){
				return "Please enter a valid argument using only p, q, r, s, t, u, v, w, ^, |, ~, >, =, (, )";}
			//Cant have operation or close parenthese at start
			if (i===0) { 
				if (jQuery.inArray(arg[i],[")", ">", "*", "|", "="])>=0)
					{return ("Invalid operation at character: "+(i+1)+"\n"+
					"Error: cannot have a closed parenthese or operation as the first character");}
			}
			//Cant have open parenthese or operation at end of a argument
			if (i==end) { 
				if (jQuery.inArray(arg[i],["(", "~", "*", "|", ">", "="])>=0){
					return "Invalid Argument: Cannot end with an open parenthese or an operation";}
				else if (arg[i]==")" && parOpenCount!==1){
					return "Invalid number of parentheses";}
				else if (jQuery.inArray(arg[i],["p", "q", "r", "s", "t", "u", "v", "w"])>=0){ 
					numVariables++; }
			}
			//Cant have operation or close parenthese at start or after NOT
			else if (arg[i]=="~") { 
				if (jQuery.inArray(arg[i+1],[")", ">", "*", "|", "="])>=0)
					{return ("Invalid operation at character: "+(i+1)+"\n"+
					"Error: cannot have a closed parenthese or operation or following a NOT sign");}
			}
			//Cant have an operator or a closed parenthese directly after another operator or an open parenthese 
			else if (jQuery.inArray(arg[i],["*", ">", "|", "=", "("])>=0) {
				if (jQuery.inArray(arg[i+1],[")", "*", ">", "|", "="])>=0)
					{ return ("Error: "+arg[i+1]+" cannot follow "+arg[i]);}
				else if (arg[i]=="("){
					parOpenCount++;
				}
			}
			else if (jQuery.inArray(arg[i],[")", "p", "q", "r", "s", "t", "u", "v", "w"])>=0) {
				if (arg[i]==")"){
					parOpenCount--;
				}
				else (numVariables++);
				if (jQuery.inArray(arg[i+1],["(", "~", "p", "q", "r", "s", "t", "u", "v", "w"])>=0) 
					{ return ("Error: "+arg[i+1]+" cannot follow "+arg[i]);}
			} //Cant have a closed parenthese, a NOT, or a variable directly after another variable or a closed parenthese
			else {
				return ("I messed up somewhere");
			}
		}
		arg = arg.join("");
		return numVariables;
	}

	function addArg(){
		var arg = $("newArgInput").value;
		$("newArgInput").value = "";
		var msg = validateArg(arg);
		if (typeof msg==="number"){
			arg = [[arg],["Given Argument"],[msg]];
			args.push(arg);
				if (args.length>=1 && conc !== undefined){
					changeToSolve();
				}
			$("proofList").innerHTML = createTable();
		} else { 
			alert(msg);
		}
		return false;
	}

	function addConc(){
		var arg = $("newConcInput").value;
		$("newConcInput").value="";
		var msg = validateArg(arg);
		if (typeof msg==="number"){
			conc = [[arg],["Given Conclusion"],[msg]];
			if (args.length>=1){
				changeToSolve();
			} else {
				$("newConcInput").disabled = true;
				$("submitConc").disabled = true;
			}
			$("proofList").innerHTML = createTable();
		} else { 
			alert(msg);
		}
		return false;
	}

	function createTable(){
		var tbl="";
		for (var i=0; i<args.length; i++) {
			tbl += "<li><table><tr><td>"+args[i][0]+"</td><td>"+(i+1)+" "+args[i][1]+"</td></tr></table></li>";
		}
		if (conc !== undefined){
			tbl += "<li id='conclusionItem' type='A' value='3'><table><tr><td>"+conc[0]+"</td><td>"+conc[1]+"</td></tr></table></li>";
		}
		return tbl;
	}

	function changeToSolve(){
		if (args.length>=1 && conc !== undefined){
			$("concForm").style.display = "none";
			$("solveForm").style.display = "block";
		}
	}

	function solve(){
		if (!Solver.solvable(args,conc)){
			alert("This argument is not valid");
			return false;
		} else {
			alert("This argument is a Tuatology and is solvable.\nI will attempt to solve now.");
		}
		transformations = Solver.solve(args, transformations, conc);
		args.push(transformations[transformations.length-1][3]);
		$("proofList").innerHTML = createTable();
		//if outcome of last transformation == conclusion then end recursion
		//if not then call itself again
		//Create function to check if any premise is not used, if so remove it from the outcome.

		return false;
	}
	
	function init() {
		"use strict";
		$("argForm").onsubmit = addArg;
		$("concForm").onsubmit = addConc;
		$("solveForm").onsubmit = solve();
	}

	function $(elementID){ 
		if (typeof(elementID) == "string") { 
			return document.getElementById(elementID);
		}
	}

	window.onload = init;
	
})();