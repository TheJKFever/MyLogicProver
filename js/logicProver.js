
(function(){
	var args = []; //In the form of [[argument,rule/given,number of variable],...,...]
	var conc; //In the form of [arg,"given conclusion, number of variables]
    //transformation in format [rule number, [argument number 1, ...., argument number n], outcome argument]
    var transformations = [];

	function validateArg(arg) {
		if (arg === "") {return false;}
		var parOpenCount=0;
		var variables=[];
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
					variables.push(arg[i]); }
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
					parOpenCount--;}
				else variables.push(arg[i]);
				if (jQuery.inArray(arg[i+1],["(", "~", "p", "q", "r", "s", "t", "u", "v", "w"])>=0) 
					{ return ("Error: "+arg[i+1]+" cannot follow "+arg[i]);}
			} //Cant have a closed parenthese, a NOT, or a variable directly after another variable or a closed parenthese
			else {
				return ("I messed up somewhere");
			}
		}
		arg = arg.join("");
		return variables;
	}

	function addArg(){
		var arg = $("newArgInput").value;
		$("newArgInput").value = "";
		var msg = validateArg(arg);
		if (typeof msg!=="array"){
			arg = [arg,"Given Argument",msg];
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
		if (typeof msg!=="array"){
			conc = [arg,"Given Conclusion",msg];
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
			alert("This argument is a Tautology and is solvable.\nI will attempt to solve now.");
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
		$("solveForm").onsubmit = solve;
	}


	window.onload = init;
	
})();


/****************
UTILITY FUNCTIONS
****************/

String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};

function $(elementID){ 
	if (typeof(elementID) == "string") { 
		return document.getElementById(elementID);
	}
}


/********************************
**********SOLVER OBJECT**********
*********************************/

var Solver = {

    //All 19 rules in the form of [[Rule Name, Rule],[,],...[,]]
    rule: [["C.D.","(p>q)*(r>s),p|r==q|s"],["H.S.","p>q,q>r==p>r"],["M.P.","p>q,p==q"],["M.T.","p>q,~q==~p"],["D.S.","p|q,~p==q"],["Conj.","p,q==p*q"],["Distributive","p*(q|r)==(p*q)|(p*r)"],["Distributive","p|(q*r)==(p|q)*(p|r)"],["Explortation","(p*q)>r,p>(q>r)=="],["Abs.","p>q==p>(p*q)"],["Simp.","p*q==p"],["DeM.","~(p*q)==(~p|~q)"],["DeM.","~(p|q)==(~p*~q)"],["Impl.","p>q==(~p|q)"],["Equiv.","p=q==((p>q)*(q>p))"],["Equiv.","p=q==((p*q)|((~p*~q))"],["Trans.","p>q==~q>~p"],["Add.","p==p|q"],["D.N.","p==~~p"]],

    //Args in the form of [[argument],[rule/given],[number of variable]]
    //Transformations in format [rule number, [argument number 1, ...., argument number n], outcome argument]
    //Conclusion in the form [[arg],["given"],[number of variable]]

    solve: function(args, trans, conc){
        // // rule 5 - takes 2 args, 1 with 4 vars, and 2 with 2 vars, and ouputs a arg with 2 vars
        // cD: function(x, y) { // four,two>two
        // // rule 3 - takes 2 args, 1 with 2 vars, and 2 with 2 vars, and ouputs a arg with 2 vars
        // hS: function(x, y) { // two,two>two
        //     if ((x[2]>=4)&&(y[2]>=4)){
        //     }
        // // rule 1 - takes 2 args, 1 with 2 vars, and 2 with 1 vars, and ouputs a arg with 1 vars
        // mP: function(x, y) { // two,one>one
        // // rule 2 - takes 2 args, 1 with 2 vars, and 2 with 1 vars, and ouputs a arg with 1 vars
        // mT: function(x, y) { // two,one>one
        // // rule 4 - takes 2 args, 1 with 2 vars, and 2 with 1 vars, and ouputs a arg with 1 vars
        // dS: function(x, y) { // two,one>one
        // // rule 8 - takes 2 args, 1 with 1 vars, and 2 with 1 vars, and ouputs a arg with 2 vars
        // conj: function(x, y) { // one,one>two
        // // rule 17 - takes 1 arg with 3 vars, and ouputs a arg with 3 vars
        // distributive: function(x, y) { // three>three
        // // rule 18 - takes 1 arg with 3 vars, and ouputs a arg with 3 vars
        // distributive: function(x, y) { // three>three
        // // rule 19 - takes 1 arg with 3 vars, and ouputs a arg with 3 vars
        // explortation: function(x, y) { // three>three
        // // rule 6 - takes 1 arg with 2 vars, and ouputs a arg with 2 vars
        // abs: function(x, y) { // two>two
        // // rule 7 - takes 1 arg with 2 vars, and ouputs a arg with 1 vars
        // simp: function(x, y) { // two>one
        // // rule 11 - takes 1 arg with 2 vars, and ouputs a arg with 2 vars
        // deM: function(x, y) { // two>two
        // // rule 12 - takes 1 arg with 2 vars, and ouputs a arg with 2 vars
        // deM: function(x, y) { // two>two
        // // rule 13 - takes 1 arg with 2 vars, and ouputs a arg with 2 vars
        // impl: function(x, y) { // two>two
        // // rule 14 - takes 1 arg with 2 vars, and ouputs a arg with 2 vars
        // equiv: function(x, y) { // two>two
        // // rule 15 - takes 1 arg with 2 vars, and ouputs a arg with 2 vars
        // equiv: function(x, y) { // two>two
        // // rule 16 - takes 1 arg with 2 vars, and ouputs a arg with 2 vars
        // trans: function(x, y) { // two>two
        // // rule 9 - takes 1 arg with 1 vars, and ouputs a arg with 2 vars
        // add: function(x, y) { // one>two
        // // rule 10 - takes 1 arg with 1 vars, and ouputs a arg with 1 vars
        // dN: function(x, y) { // one>one

    },

    //PRECONDITION: Validated args and conc
    solvable: function(args, conc){
        var Vars=[],_arg=[];
        var i=0,j=0;
        for (i=0;i<args.length;i++){
            _arg[i]="("+args[i][0]+")";
            for (j=0;j<args[i][2].length; j++) {
				if (jQuery.inArray(args[i][2][j],Vars)===-1){
					Vars.push(args[i][2][j]);
				}
			}
        }
        _arg = InfixToPostfix.infixToPostfix(_arg.join("*"))+"%"+InfixToPostfix.infixToPostfix(conc[0]);
        //loop for all truth values, and test
        for (i=0;i<Math.pow(2,Vars.length);i++){
        	var tempArgToSolve=_arg;
			for (j=0;j<Vars.length;j++){
                tempArgToSolve = tempArgToSolve.replaceAll(Vars[j],this.binary((i>>j)&1));
			}
            tempArgToSolve = tempArgToSolve.split("%");
            if (InfixToPostfix.postfixEval(tempArgToSolve[0])!==InfixToPostfix.postfixEval(tempArgToSolve[1])){
                return false;
            }
        }
        return true;


 //        for (var p=0;p<2;p++){
 //            for (var q=0;q<2;q++){
 //                for (var r=0;r<2;r++){
 //                    for (var s=0;s<2;s++){
 //                        for (var t=0;t<2;t++){
 //                            for (var u=0;u<2;u++){
 //                                for (var v=0;v<2;v++){
 //                                    for (var w=0;w<2;w++){
 //                                        var tempArgToSolve = _arg;
 //                                        tempArgToSolve = this.replacePropWithTorF(tempArgToSolve,p,q,r,s,t,u,v,w);
 //                                        console.log(tempArgToSolve);
 //                                        tempArgToSolve = tempArgToSolve.split("%");
 //                                        tempConc = InfixToPostfix.postfixEval(tempArgToSolve[1]);
 //                                        tempArgToSolve = InfixToPostfix.postfixEval(tempArgToSolve[0]);
 //                                        if (tempArgToSolve!==tempConc){
 //                                            return false;
 //        }	}	}	}	}	}	}	}	}
 //        return true;
 //    },

 //    replacePropWithTorF: function(testArgs,p,q,r,s,t,u,v,w){
 //        testArgs = testArgs.replaceAll("p",this.binary(p));
 //        testArgs = testArgs.replaceAll("q",this.binary(q));
 //        testArgs = testArgs.replaceAll("r",this.binary(r));
 //        testArgs = testArgs.replaceAll("s",this.binary(s));
 //        testArgs = testArgs.replaceAll("t",this.binary(t));
 //        testArgs = testArgs.replaceAll("u",this.binary(u));
 //        testArgs = testArgs.replaceAll("v",this.binary(v));
 //        testArgs = testArgs.replaceAll("w",this.binary(w));
 //        return testArgs;
	},

    binary: function(oneOrZero){
        if (oneOrZero===0){
            return "F";
        } else {
            return "T";
        }
    }

}; // End of Solver declaration.



/********************************
******INFIX TO POSTFIX OBJECT*****
*********************************/


var InfixToPostfix = {
	isOperand: function(who)
	{
		return (jQuery.inArray(who,["p", "q", "r", "s", "t", "u", "v", "w"])>=0)? true: false;
	},

	isOperator: function(who)
	{
		return((who=="*" || who=="|" || who==">" || who=="=" || who==">")? true : false);
	},

	/* Check for Precedence */
	prcd: function(who)
	{
		if(who=="~")
			return(4);
		else if((who==">")||(who=="*")||(who=="|"))
			return(3);
		else if(who=="=")
			return(2);
		else if ((who=="(")||(who==")"))
			return(1);
	},

	infixToPostfix: function(infixStr)
	{
		var postfixStr=[];
		var stackArr=[];
		var postfixPtr=0;
		infixStr=infixStr.split("");
		for(var i=0; i<infixStr.length; i++)
		{
			if(this.isOperand(infixStr[i]))
			{
				postfixStr[postfixPtr]=infixStr[i];
				postfixPtr++;
			}
			else if(this.isOperator(infixStr[i]))
			{
				while((stackArr.length!==0) && (this.prcd(infixStr[i])<=this.prcd(stackArr[stackArr.length-1])))
				{
					postfixStr[postfixPtr]=stackArr.pop();
					postfixPtr++;
				}
				stackArr.push(infixStr[i]);
			}
			else if(infixStr[i]=="(")
				stackArr.push(infixStr[i]);
			else if(infixStr[i]==")")
			{
				while(stackArr[stackArr.length-1]!="(")
				{
					postfixStr[postfixPtr]=stackArr.pop();
					postfixPtr++;
				}
				stackArr.pop();
			}
		}
		while(stackArr.length!==0)
		{
			if(stackArr[stackArr.length-1]=="(")
				stackArr.pop();
			else
				postfixStr[postfixStr.length]=stackArr.pop();
		}
		return postfixStr.join('');
	},

	postfixSubEval: function(sym,arg1,arg2)
	{
		var returnVal;
		if(sym=="~")
			if (arg1=="T"){
				return "F";
			} else {
				return "T";
			}
		if(sym=="*")
			if (arg1=="F" || arg2 =="F"){
				return "F";
			} else {
				return "T";
			}
		else if(sym==">")
			if (arg1=="F"){
				return "T";
			} else if (arg2=="T"){
				return "T";
			} else {
				return "F";
			}
		else if(sym=="|")
			if (arg1=="T"||arg2=="T"){
				return "T";
			} else {
				return "F";
			}
		else if(sym=="=")
			if (arg1==arg2){
				return "T";
			} else {
				return "F";
			}
	},

	// PRECONDITION: postfixStr must be in T & F
	postfixEval: function(postfixStr)
	{
		var stackArr=[];
		for(var i=0; i<postfixStr.length; i++)
		{
			if(this.isOperand(postfixStr[i]))
				stackArr.push(postfixStr[i]);
			else
			{
				var pushVal;
				if (postfixStr[i]=="~"){
					pushVal=this.postfixSubEval(postfixStr[i],stackArr.pop());
				} else {
					var temp=stackArr.pop();
					pushVal=this.postfixSubEval(postfixStr[i],stackArr.pop(),temp);
				}
				stackArr.push(pushVal);
			}
		}
		return(stackArr[0]);
	}
};