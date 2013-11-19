
var props = []; //In the form of [[0-index,1-proposition,2-rule/given,3-array of variables,4-postfix,5-tree],...,...]
var conc;    //In the form of [0-prop,1-"given conclusion",2-array of variables,3-postfix,4-tree,5-concType]
var alreadyTried = [];  //alreadyTried in format [rule name, [proposition number 1, ...., proposition number n]]
var transformed = []; //transformed in format [rule name, [proposition number 1, ...., proposition number n]]
var givenProps = 0;

(function () {

    function validateProp(prop) {
        var i = 0; //for loops
        console.log("Vaidating prop: " + prop);
        if (prop === "") { return "Please enter an proposition"; }
        for (i = 0; i < props.length; i++) {
            if (prop === props[i][1]) {return "You have already entered this proposition"; }
        }
        var parOpenCount = 0;
        var variables=[];
        prop = prop.split("");
        var end = prop.length-1;
        for (i = 0; i < prop.length; i++) {
        //Check to see if an invalid character was entered
            if (jQuery.inArray(prop[i], ["*", "|", ">", "=", "~", "(", ")", "p", "q", "r", "s", "t", "u", "v", "w"]) == -1) {
                return "Please enter a valid proposition using only p, q, r, s, t, u, v, w, ^, |, ~, >, =, (, )"; }
            //Cant have operation or close parenthese at start
            if (i===0) { 
                if (jQuery.inArray(prop[i], [")", ">", "*", "|", "="]) >= 0) {   
                    return ("Invalid operation at character: "+(i+1)+"\nError: cannot have a closed parenthese or operation as the first character"); 
                }
            }
            //Cant have open parenthese or operation at end of a proposition
            if (i==end) { 
                if (jQuery.inArray(prop[i], ["(", "~", "*", "|", ">", "="]) >= 0) {
                    return "Invalid Proposition: Cannot end with an open parentheses or an operation"; }
                else if (prop[i]==")" && parOpenCount!==1) { return "Invalid number of parentheses"; }
                else if (jQuery.inArray(prop[i], ["p", "q", "r", "s", "t", "u", "v", "w"]) >= 0) { variables.push(prop[i]); }
            }
            //Cant have operation or close parenthese at start or after NOT
            else if (prop[i] == "~") { 
                if (jQuery.inArray(prop[i+1], [")", ">", "*", "|", "="]) >= 0) { 
                    return ("Invalid operation at character: "+(i+1)+"\nError: cannot have a closed parenthese or operation or following a NOT sign"); 
                }
            }
            //Cant have an operator or a closed parenthese directly after another operator or an open parenthese 
            else if (jQuery.inArray(prop[i],["*", ">", "|", "=", "("]) >= 0) {
                if (jQuery.inArray(prop[i+1],[")", "*", ">", "|", "="]) >= 0) { 
                    return ("Error: " + prop[i+1]+" cannot follow " + prop[i]); }
                else if (prop[i]=="(") { parOpenCount++; }
            }
            else if (jQuery.inArray(prop[i],[")", "p", "q", "r", "s", "t", "u", "v", "w"]) >= 0) {
                if (prop[i]==")") { parOpenCount--; }
                else variables.push(prop[i]);
                if (jQuery.inArray(prop[i+1],["(", "~", "p", "q", "r", "s", "t", "u", "v", "w"]) >= 0) { 
                    return ("Error: " + prop[i+1]+" cannot follow " + prop[i]); 
                }
            } //Cant have a closed parenthese, a NOT, or a variable directly after another variable or a closed parenthese
            else {
                return ("I messed up somewhere");
            }
        }
        console.log("Proposition validated!");
        prop = prop.join("");
        return variables;
    }

    function addProp(testProp) {        
        var prop = (typeof testProp !== "string")? $("newPremInput").value : testProp;
        $("newPremInput").value = "";            
        console.log("The user entered premise: " + prop);
        var msg = validateProp(prop);
        if (typeof msg === "object") {
            var propPF = Postfix.infixToPostfix(prop);
            var propT = Tree.postfixToTree(propPF);
            prop = Tree.treeToInfix(propT);
            prop = [props.length+1,prop,"Given Proposition",msg,propPF,propT]; //propIndex, proposition, text output, number of variables, postfix, tree
            props.push(prop);
            givenProps++;
            console.log("Stored proposition in Props Array in the format: [index,infix,rule/given,variables,postfix,tree]");
            if (props.length >= 1 && conc !== undefined) {
                changeToSolve();
            }
            $("proofList").innerHTML = createTable();
        } else {
            console.log("Invalid proposition: "+msg);
            alert(msg);
        }
        return false;
    }

    function addConc(testConc) {
        var conctype = $("concType").value === ("Therefore")? ">": "=";
        var prop = (typeof testConc !== "string")? $("newConcInput").value : testConc ;
        $("newConcInput").value = "";
        console.log("The user entered conclusion: " + prop);
        var msg = validateProp(prop);
        if (typeof msg === "object") {
            var concPF = Postfix.infixToPostfix(prop);
            var concT = Tree.postfixToTree(concPF);
            prop = Tree.treeToInfix(concT); 
            conc = [prop,"Given Conclusion",msg,concPF,concT,conctype]; //proposition, text output, number of variables, postfix, tree, = or >
            if (props.length >= 1) {
                changeToSolve();
            } else {
                $("newConcInput").disabled = true;
                $("submitConc").disabled = true;
            }
            $("proofList").innerHTML = createTable();
        } else { 
            console.log("Invalid proposition: "+msg);
            alert(msg);
        }
        return false;
    }

    function createTable() {
        var tbl="";
        for (var i = 0; i < props.length; i++) {
            if (props[i][2]==="Given Proposition") {
                tbl += "<li><table><tr><td>" + props[i][1]+"</td><td>" + props[i][2]+"</td></tr></table></li>";
            } else {
                tbl += "<li><table><tr><td>" + props[i][1]+"</td><td>" + (props[i][2][1].join(", ")+" " + props[i][2][0])+"</td></tr></table></li>";
            }
        }
        if (conc !== undefined) {
            tbl += "<li id='conclusionItem' type='A' value='3'><table><tr><td>"+conc[0]+"</td><td>"+conc[5]+" "+conc[1]+"</td></tr></table></li>";
        }
        console.log("Reconstructed Proof Table\n");
        return tbl;
    }

    function changeToSolve() {
        if (props.length >= 1 && conc !== undefined) {
            $("concForm").style.display = "none";
            $("solveForm").style.display = "block";
        }
    }

    function solve() {
        if (!Solver.solvable()) {
            alert("This proposition is not valid");
            return false;
        }
        Solver.solve();
        //Checks if any premise is not used, if so remove it from the outcome.
        // Cleaner.cleanup();
        $("proofList").innerHTML = createTable();
        return false;
    }

    function init() {
        $("premForm").onsubmit = addProp;
        $("concForm").onsubmit = addConc;
        $("solveForm").onsubmit = solve;
   
/***************TEST SCENARIOS***************/
//Basic Hypothetical Syllogism with cleanup testing
        // addProp("(p>s)|r");
        // addProp("p>q");
        // addProp("q>r");
        // addConc("p>r");

//Basic unsolvable data
        // addProp("(p>s)|r");
        // addProp("p>q");
        // addConc("p*r");

//Replacement Rules
        // addProp("~p|q");
        // addProp("(p*q)|(~p*~q)");
        // addProp("(p>q)*(q>p)");
        // addProp("p*(q|r)");
        // addProp("p|(q*r)");
        // addConc("(p|q)*(q|r)");

//Final Exam question 1
        addProp("p>(~q*r)");
        addProp("s|~t");
        addProp("p|t");
        addConc("q>s");
   }

   window.onload = init;

})();


/********************************
********UTILITY FUNCTIONS********
*********************************/

String.prototype.replaceAll = function (find, replace) {
  var str = this;
  return str.replace(new RegExp(find, 'g'), replace);
};

function $(elementID) { 
    if (typeof(elementID) == "string") { return document.getElementById(elementID); }
}

function isOperand(who) {
    return (jQuery.inArray(who,["p", "q", "r", "s", "t", "u", "v", "w"]) >= 0)? true: false;
}

function isOperator(who) {
    return (jQuery.inArray(who,["~", "*", "|", ">", "=", ">"]) >= 0)? true: false;
}

/* Check for Precedence */
function prcd(who) {
    if(who=="~")                                { return(4); }
    else if((who==">")||(who=="*")||(who=="|")) { return(3); }
    else if(who=="=")                           { return(2); }
    else if ((who=="(")||(who==")"))            { return(1); }
}

function binaryToTruth(oneOrZero) {
    var truthVal = (oneOrZero===0)? "F" : "T";
    return truthVal;  
}

/********************************
**********SOLVER OBJECT**********
*********************************/

var Solver = {
    //PRECONDITION: Validated props and conc
    solvable: function() {
        console.log("Attempting to verify solvability");
        var notSolvable=false;
        var Vars=[],_prop=[];
        var i = 0,j = 0;
        //Add all of the propositions PF to _prop[] and count total variables
        console.log("****Counting total number of variables in argument");
        for (i = 0; i < givenProps; i++) {
            _prop.push(props[i][4]);
            // Check if variables in prop is in Vars and if not push it in
            for (j = 0;j< props[i][3].length; j++) {
                if (jQuery.inArray(props[i][3][j],Vars)===-1) {
                    Vars.push(props[i][3][j]);
                }
            }
        }
        //Make sure Conclusion doesn't have extra variables
        for (j = 0;j<conc[2].length; j++) {
            if (jQuery.inArray(conc[2][j],Vars)===-1) {
                Vars.push(conc[2][j]);
            }
        }
        console.log("****Counted a total of "+Vars.length+" variables");
        var ast = "";
        for (i = 0; i < props.length-1;i++){
            ast = ast.concat("*");
        }       
        //Create one long PF string for testing
        _prop = _prop.join('')+ast+conc[3]+conc[5];
        //loop for all truth values, and test
        for (i = 0; i <Math.pow(2,Vars.length); i++) {
            var tempPropToSolve=_prop;
            for (j = 0;j<Vars.length;j++) {
                tempPropToSolve = tempPropToSolve.replaceAll(Vars[j],binaryToTruth((i>>j)&1));
            }
            if (Postfix.postfixEval(tempPropToSolve)=="F") {
                notSolvable = true;
            }
        }
        if (notSolvable){
            console.log("Error: Argument is not solvable");
            return false;
        }
        console.log("Attempt succeeded, this argument is a tautology");
        return true;
    },

    solve: function() {
        //if outcome of last transformation == conclusion then end recursion
        //if not then call itself again
        console.log("\n**********Attempting to solve proof**********");
//IDEALLY SHOULD USE WHILE LOOP, BUT WILL USE 10 LOOPS FOR TESTING        
        // while (props[props.length-1][1]!==conc[0]) {
        //     this.heuristic();
        // }
//10 LOOPS FOR TESTING
        var i=0;
        for (i=0; i<10 ; i++){
            this.heuristic(i);
        }
        return;
    },

    heuristic: function(count) {
        //RULES IN HEURISTICAL ORDER, BRUTE FORCE
        var i, j = 0;
        var propsLength;
        for (i = 0; i < props.length; i++) {
            //Replacement Rules
            if (this.hasNotBeenTried("Replacement", props[i][0]) || jQuery.inArray(props[i][2][0],["DeM.", "Distrib.", "D.N.", "Exp.", "M.E.", "M.I.", "Trans."])>=0) {
                if (this.replacementRules(props[i]))  return true;
            }
            //Simplification
            if (this.hasNotBeenTried("Simp.", props[i][0])){
                if (this.simp(props[i]))  return true;
            }
        }
        for (i = 0; i < props.length; i++) {
            for (j=i+1;j< props.length;j++) {    
                //Hypothetical syllogism
                if (this.hasNotBeenTried("H.S.", props[i][0], props[j][0])) {
                    if (this.hS(props[i],props[j]))  return true;
                }
                if (this.hasNotBeenTried("M.P.", props[i][0], props[j][0])) {
                    if (this.mP(props[i],props[j]))  return true;
                }
                if (this.hasNotBeenTried("M.T.", props[i][0], props[j][0])) {
                    if (this.mT(props[i],props[j]))  return true;
                }
                if (this.hasNotBeenTried("D.S.", props[i][0], props[j][0])) {
                    if (this.dS(props[i],props[j]))  return true;                
                }
                //Constructive dilemma -- SHOULD HAVE A LOW HEURISTIC WEIGHT
                // if (this.cD(props[i],props[j])) {
                //     if (this.isSolved())  return true;                
                // }
            }
        }
        propsLength = props.length; 
        if (count<1){
            for (i=0; i<propsLength; i++) {
                for (j=i+1; j<propsLength; j++) {    
                        if (this.hasNotBeenTried("Conj.", props[i][0], props[j][0])) {
                            if (this.conj(props[i],props[j]))  return true;                
                    }
                }
            }
        }
    }, //End Heurisitc

/***********REPLACEMENT RULES************/
// DeM.                 ~(p*q)==(~p|~q)
//                      ~(p|q)==(~p*~q)
// M.I.                 (p>q)==(~p|q)
// Trans.               (p>q)==(~q>~p)
// D.N.                 p==~(~p)
// Distrib.             (p*(q|r))==((p*q)|(p*r))
//                      (p|(q*r))==((p|q)*(p|r))
// Exp.                 ((p*q)>r)==(p>(q>r))
// M.E. Biconditional   (p=q)==((p>q)*(q>p))
// M.E. Truth Table     (p=q)==((p*q)|(~p*~q))

    replacementRules: function(prop) {
        console.log("***************ATTEMPTING REPLACEMENT RULES FOR: " + prop[1]+"***************");
        var propTree = prop[5];
        //Replacement rules to | major operator
        if (propTree.top==="|") {
            if (propTree.left.top==="*" && propTree.right.top==="*") {
                if (propTree.right.left.top==="~" && propTree.right.right.top==="~") {
                    if ((Tree.compare(propTree.right.left.right,propTree.left.left) && Tree.compare(propTree.right.right.right,propTree.left.right)) ||
                        (Tree.compare(propTree.right.left.right,propTree.left.right) && Tree.compare(propTree.right.right.right,propTree.left.right)) ||
                        (Tree.compare(propTree.right.right.right,propTree.left.left) && Tree.compare(propTree.right.left.right,propTree.left.right)) ||
                        (Tree.compare(propTree.right.right.right,propTree.left.right) && Tree.compare(propTree.right.left.right,propTree.left.right))) {
                        newPropTree = new treeNode("=",propTree.left.left,propTree.left.right);
                        if (this.addTransformedProp(newPropTree, ["M.E.",[prop[0]]]))  return true;
                        newPropTree = new treeNode("*",new treeNode(">",propTree.left.left,propTree.left.right), new treeNode(">",propTree.left.right,propTree.left.left));
                        if (this.addTransformedProp(newPropTree, ["M.E.",[props[props.length-1][0]]]))  return true;
                    }
                } else if (propTree.left.left.top==="~" && propTree.left.right.top==="~") {
                    if ((Tree.compare(propTree.left.left.right,propTree.left.left) && Tree.compare(propTree.left.right.right,propTree.left.right)) ||
                        (Tree.compare(propTree.left.left.right,propTree.left.right) && Tree.compare(propTree.left.right.right,propTree.left.right)) ||
                        (Tree.compare(propTree.left.right.right,propTree.left.left) && Tree.compare(propTree.left.left.right,propTree.left.right)) ||
                        (Tree.compare(propTree.left.right.right,propTree.left.right) && Tree.compare(propTree.left.left.right,propTree.left.right))) {
                        newPropTree = new treeNode("=",propTree.right.left,propTree.right.right);
                        if (this.addTransformedProp(newPropTree, ["M.E.",[prop[0]]]))  return true;
                        newPropTree = new treeNode("*",new treeNode(">",propTree.right.left,propTree.right.right),new treeNode(">",propTree.right.right,propTree.right.left));
                        if (this.addTransformedProp(newPropTree, ["M.E.",[props[props.length-1][0]]]))  return true;
                    }
                } else if (Tree.compare(propTree.left.left,propTree.right.left)){
                    newPropTree = new treeNode("*",propTree.left.left,new treeNode("|",propTree.right.right,propTree.left.right));
                    if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;                
                } else if (Tree.compare(propTree.left.left,propTree.right.right)){
                    newPropTree = new treeNode("*",propTree.left.left,new treeNode("|",propTree.right.left,propTree.left.right));
                    if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;               
                } else if (Tree.compare(propTree.left.right,propTree.right.left)){
                    newPropTree = new treeNode("*",propTree.left.right,new treeNode("|",propTree.right.right,propTree.left.left));
                    if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;                
                } else if (Tree.compare(propTree.left.right,propTree.right.right)){
                    newPropTree = new treeNode("*",propTree.left.right,new treeNode("|",propTree.right.left,propTree.left.left));
                    if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;                
                } 
            } else if (propTree.left.top==="~" && propTree.right.top==="~"){
                if (!Tree.compare(propTree.left.right,propTree.right.right)){
                    newPropTree = new treeNode("~", undefined, new treeNode("*",propTree.left.right,propTree.right.right));
                    if (this.addTransformedProp(newPropTree, ["DeM.",[prop[0]]]))  return true;                
                }
            } else if (propTree.left.top==="~" || propTree.right.top==="~"){
                if (propTree.left.top==="~"){
                    if (!Tree.compare(propTree.left.right,propTree.right)){
                        newPropTree = new treeNode(">",propTree.left.right,propTree.right);
                        if (this.addTransformedProp(newPropTree, ["M.I.",[prop[0]]]))  return true;
                        // newPropTree = new treeNode(">", new treeNode("~",undefined,newPropTree.left), new treeNode("~",undefined,newPropTree.right));
                        // if (this.addTransformedProp(newPropTree, ["Trans.",[props[props.length-1][0]]]))  return true;
                    }   
                } else {
                    if (!Tree.compare(propTree.right.right,propTree.left)){
                        newPropTree = new treeNode(">",propTree.right.right,propTree.left);
                        if (this.addTransformedProp(newPropTree, ["M.I.",[prop[0]]]))  return true;
                        // newPropTree = new treeNode(">", new treeNode("~",undefined,newPropTree.right), new treeNode("~",undefined,newPropTree.left));
                        // if (this.addTransformedProp(newPropTree, ["Trans.",[props[props.length-1][0]]]))  return true;
                    }
                }
            } else if (propTree.right.top==="*" || propTree.left.top==="*") {
                if (propTree.right.top==="*") {
                    if (!Tree.compare(propTree.left,propTree.right.left) && !Tree.compare(propTree.left,propTree.right.right)) {
                        newPropTree = new treeNode("*", new treeNode("|", propTree.left, propTree.right.left), new treeNode("|", propTree.left, propTree.right.right));
                        if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;
                    }
                } else {
                    if (!Tree.compare(propTree.right,propTree.left.left) && !Tree.compare(propTree.right,propTree.left.right)) {
                        newPropTree = new treeNode("*", new treeNode("|", propTree.right, propTree.left.left), new treeNode("|", propTree.right, propTree.left.right));
                        if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;
                    }
                }
            }
        }
        //Replacement rules to * major operator
        else if (propTree.top==="*") {
            if (propTree.left.top===">" && propTree.right.top===">") {
                if (Tree.compare(propTree.left.left,propTree.right.right)){
                    newPropTree = new treeNode("=",propTree.left.left,propTree.right.left);
                    if (this.addTransformedProp(newPropTree, ["M.E.",[prop[0]]]))  return true;
                    newPropTree = new treeNode("|",new treeNode("*",propTree.left.left,propTree.right.left),new treeNode("*",new treeNode("~",undefined,propTree.left.left), new treeNode("~",undefined,propTree.right.left)));
                    if (this.addTransformedProp(newPropTree, ["M.E.",[props[props.length-1][0]]]))  return true;
                } else if (Tree.compare(propTree.left.right,propTree.right.left)){
                    newPropTree = new treeNode("=",propTree.left.right,propTree.right.right);
                    if (this.addTransformedProp(newPropTree, ["M.E.",[prop[0]]]))  return true;                
                    newPropTree = new treeNode("|",new treeNode("*",propTree.left.right,propTree.right.right),new treeNode("*",new treeNode("~",undefined,propTree.left.right), new treeNode("~",undefined,propTree.right.right)));
                    if (this.addTransformedProp(newPropTree, ["M.E.",[props[props.length-1][0]]]))  return true;
                }
            } else if (propTree.left.top==="|" && propTree.right.top==="|") {
                if (Tree.compare(propTree.left.left,propTree.right.left)){
                    newPropTree = new treeNode("|",propTree.left.left, new treeNode("|",propTree.right.right,propTree.left.right));
                    if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;                
                } else if (Tree.compare(propTree.left.left,propTree.right.right)){
                    newPropTree = new treeNode("|",propTree.left.left, new treeNode("|",propTree.right.left,propTree.left.right));
                    if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;                
                } else if (Tree.compare(propTree.left.right,propTree.right.left)){
                    newPropTree = new treeNode("|",propTree.left.right, new treeNode("|",propTree.right.right,propTree.left.left));
                    if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;                
                } else if (Tree.compare(propTree.left.right,propTree.right.right)){
                    newPropTree = new treeNode("|",propTree.left.right, new treeNode("|",propTree.right.left,propTree.left.left));
                    if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true; 
                }
            } else if (propTree.left.top==="|" || propTree.right.top==="|") {
                if (propTree.right.top==="|") {
                    if (!Tree.compare(propTree.left,propTree.right.left) && !Tree.compare(propTree.left,propTree.right.right)) {
                        newPropTree = new treeNode("|",new treeNode("*",propTree.left,propTree.right.left),new treeNode("*",propTree.left,propTree.right.right));
                        if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;
                    }
                } else {
                    if (!Tree.compare(propTree.right,propTree.left.left) && !Tree.compare(propTree.right,propTree.left.right)) {
                        newPropTree = new treeNode("|",new treeNode("*",propTree.right,propTree.left.left),new treeNode("*",propTree.right,propTree.left.right));
                        if (this.addTransformedProp(newPropTree, ["Distrib.",[prop[0]]]))  return true;
                    }
                }
            } else if (propTree.left.top==="~" && propTree.right.top==="~"){
                if (!Tree.compare(propTree.left.right,propTree.right.right)){
                    newPropTree = new treeNode("~",undefined,new treeNode("|",propTree.left.right,propTree.right.right));
                    if (this.addTransformedProp(newPropTree, ["DeM.",[prop[0]]]))  return true;
                }
            }
        //Replacement rules to > major operator
        } else if (propTree.top===">") {
            console.log(1);
            if (propTree.left.top==="~" && propTree.right.top==="~") {
                if (!Tree.compare(propTree.left.right,propTree.right.right)) {
                    newPropTree = new treeNode("|", new treeNode("~",undefined,propTree.right.right),propTree.left.right);
                    if (this.addTransformedProp(newPropTree, ["M.I.",[prop[0]]]))  return true;
                    newPropTree = new treeNode("|",propTree.left.right,new treeNode("~",undefined,propTree.right.right));
                    if (this.addTransformedProp(newPropTree, ["M.I.",[prop[0]]]))  return true;                    
                    newPropTree = new treeNode(">",propTree.right.right,propTree.left.right);
                    if (this.addTransformedProp(newPropTree, ["Trans.",[prop[0]]]))  return true;                    
                }
            } else if (propTree.left.top==="*"){
            console.log(2);
                if (!Tree.compare(propTree.right,propTree.left.left) && !Tree.compare(propTree.right,propTree.left.right)){
                    newPropTree = new treeNode(">",propTree.left.left,new treeNode(">",propTree.left.right,propTree.right));
                    if (this.addTransformedProp(newPropTree, ["Exp.",[prop[0]]]))  return true;
                    newPropTree = new treeNode(">",propTree.left.right,new treeNode(">",propTree.left.left,propTree.right));
                    if (this.addTransformedProp(newPropTree, ["Exp.",[prop[0]]]))  return true;                                            
                }
            } else if (propTree.right.top===">"){
                if (!Tree.compare(propTree.left,propTree.right.left) && !Tree.compare(propTree.left,propTree.right.right)){
                    newPropTree = new treeNode(">", new treeNode("*",propTree.left,propTree.right.left),propTree.right.right);
                    if (this.addTransformedProp(newPropTree, ["Exp.",[prop[0]]]))  return true;                                                                
                }
            } else if (!Tree.compare(propTree.left,propTree.right)){
            console.log(3);
                newPropTree = new treeNode("|",new treeNode("~",undefined,propTree.left),propTree.right);
                if (this.addTransformedProp(newPropTree, ["M.I.",[prop[0]]]))  return true;
                newPropTree = new treeNode("|",propTree.right,new treeNode("~",undefined,propTree.left));
                if (this.addTransformedProp(newPropTree, ["M.I.",[prop[0]]]))  return true;                
                newPropTree = new treeNode(">",new treeNode("~",undefined,propTree.right),new treeNode("~",undefined,propTree.left));
                if (this.addTransformedProp(newPropTree, ["Trans.",[prop[0]]]))  return true;                    
            }
        }
        console.log("***************FINISHED REPLACEMENT RULES FOR: " + prop[1]+"***************");
    },

//END REPLACEMENT RULES


//INFERENCE RULES
    //PRECONDITION: test to see if simp has already been tried with this prop
    simp: function(prop){
        if (prop[5].top==="*"){
        console.log("Attempting Simp. Rule on "+prop[1]);
            //Create new prop from left and right leafs and add Transformation
            newPropTree = new treeNode(prop[5].left.top,prop[5].left.left,prop[5].left.right);
            if (this.addTransformedProp(newPropTree, ["Simp.",[prop[0]]])) return true;
            newPropTree = new treeNode(prop[5].right.top,prop[5].right.left,prop[5].right.right);
            if (this.addTransformedProp(newPropTree, ["Simp.",[prop[0]]])) return true;
        }
        return false;
    },

    hS: function(prop1, prop2) {
        var newPropTree;
        if (prop1[5].top===">" && prop2[5].top===">") {
            console.log("Attempting H.S. Rule on "+prop1[1]+" and "+prop2[1]);
            if (Tree.compare(prop1[5].right,prop2[5].left)) {
                newPropTree = new treeNode(">",prop1[5].left,prop2[5].right);
            } else if (Tree.compare(prop2[5].right,prop1[5].left)) {
                newPropTree = new treeNode(">",prop2[5].left,prop1[5].right);
            } else return false;
        } else return false;
        if (Tree.compare(newPropTree.left,newPropTree.right)) { return false; }
        if (this.addTransformedProp(newPropTree, ["H.S.",[prop1[0],prop2[0]]])) return true;
        return false;
    },

    mP: function(prop1, prop2) {
        var newPropTree;
        if (prop1[5].top===">"){
            console.log("Attempting M.P. Rule on "+prop1[1]+" and "+prop2[1]);
            if (Tree.compare(prop1[5].left,prop2[5])){
                newPropTree = prop1[5].right;
            } else return false;
        } else if (prop2[5].top===">"){
            console.log("Attempting M.P. Rule on "+prop1[1]+" and "+prop2[1]);
            if (Tree.compare(prop2[5].left,prop1[5])){
                newPropTree = prop2[5].right;
            } else return false;
        } else return false;
        if (this.addTransformedProp(newPropTree, ["M.P.",[prop1[0],prop2[0]]])) return true;        
    },

    mT: function(prop1, prop2) {
        var newPropTree;
        if (prop1[5].top===">"){
            console.log("Attempting M.T. Rule on "+prop1[1]+" and "+prop2[1]);
            if (Tree.treeToInfix(new treeNode("~",undefined,prop1[5].right))===prop2[1]){
                newPropTree = new treeNode("~",undefined,prop1[5].left);
            } else return false;
        } else if (prop2[5].top===">"){
            console.log("Attempting M.T. Rule on "+prop1[1]+" and "+prop2[1]);
            if (Tree.treeToInfix(new treeNode("~",undefined,prop2[5].right))===prop1[1]){
                newPropTree = new treeNode("~",undefined,prop2[5].left);
            } else return false;
        } else return false;
        if (this.addTransformedProp(newPropTree, ["M.T.",[prop1[0],prop2[0]]])) return true;        
    },

    dS: function(prop1, prop2){
        var newPropTree;
        if (prop1[5].top==="|"){
            console.log("Attempting D.S. Rule on "+prop1[1]+" and "+prop2[1]);
            if (Tree.treeToInfix(new treeNode("~",undefined,prop1[5].right))===prop2[1]) {
                newPropTree = prop1[5].left;
            } else if (Tree.treeToInfix(new treeNode("~",undefined,prop1[5].left))===prop2[1]) {
                newPropTree = prop1[5].right;
            } else return false;
        } else if (prop2[5].top==="|"){
            console.log("Attempting D.S. Rule on "+prop1[1]+" and "+prop2[1]);
            if (Tree.treeToInfix(new treeNode("~",undefined,prop2[5].right))===prop1[1]) {
                newPropTree = prop2[5].left;
            } else if (Tree.treeToInfix(new treeNode("~",undefined,prop2[5].left))===prop1[1]) {
                newPropTree = prop2[5].right;
            } else return false;
        } else return false;
        if (this.addTransformedProp(newPropTree, ["D.S.",[prop1[0],prop2[0]]])) return true;                
    },

    // cD: function(prop1, prop2) {
    //     if (prop1[5].top===">" && prop2[5].top===">") {
    //         if (!Tree.compare(prop1[5].left,prop2[5].left) && 
    //            !Tree.compare(prop1[5].left,prop2[5].right) &&
    //            !Tree.compare(prop1[5].right,prop2[5].left) &&
    //            !Tree.compare(prop1[5].right,prop2[5].right)) {
    //             //Might need to Check if the conjunction of the two are already in args                
    //             for (var i = 0; i <args.length; i++){

    //             }
    //             transformed.push(["C.D.",[prop1[0],prop2[0]]]);
    //             this.addTransformedProp(newPropTree, transformed[transformed.length-1]);
    //         }
    //     }
    //     return false;
    // },

    conj: function(prop1, prop2) {
        if (prop1[2][0]!=="Conj." && prop2[2][0]!=="Conj."){
            console.log("Conjoining "+prop1[1]+" and "+prop2[1]);
            var newPropTree = new treeNode("*", prop1[5], prop2[5]);
            if (this.addTransformedProp(newPropTree, ["Conj.",[prop1[0],prop2[0]]])) return true;
            newPropTree = new treeNode("*", prop2[5], prop1[5]);
            if (this.addTransformedProp(newPropTree, ["Conj.",[prop2[0],prop1[0]]])) return true;
        }
    },


//END INFERENCE RULES

    isSolved: function(){
        if (props[props.length-1][1]===conc[0]){
            console.log("*****************ARGUMENT SOLVED****************");
            return true;
        }
        return false;
    },

    hasNotBeenTried: function(rule, propNum1, propNum2, propNum3, propNum4) {
        var newAttempt = [rule,propNum1,propNum2,propNum3,propNum4];
        for (var i=0;i<alreadyTried.length;i++){
            for (var j=0;j<5;j++){
                if (newAttempt[j]!=alreadyTried[i][j]){
                    break;
                } else if (j==4) {
                    return false;
                }
            }
        }
        alreadyTried.push(newAttempt);
        return true;
    },

    addTransformedProp: function(tree, trans) {
        var propInfix = Tree.treeToInfix(tree);
        for (var i=0;i<props.length;i++){
            if (propInfix==props[i][1]) { return false; }
        }
        transformed.push(trans);
        props.push([props.length+1, propInfix, trans, undefined, undefined, tree]); //propIndex, proposition, text output, number of variables, postfix, tree
        console.log("Successfully applied rule: "+trans[0]+" -> " + props[props.length-1][1]);
        if (this.isSolved())  return true;
        else return false;        
    }
}; // End of Solver declaration.

/********************************
**********CLEANER OBJECT**********
*********************************/

var Cleaner = {
    cleanup: function() {
        // check if this prop uses any other props besides given ones. If so then check those, 
        var propsUsed = [props.length];
        propsUsed = this.check(props[props.length-1],propsUsed);
        propsUsed.sort(function(a,b) {return a-b; } ) ;
        // cleanup using propsUsed
        this.keepProps(propsUsed);
        return;
    },

    check: function(propToCheck, propsUsed) {
       if (propToCheck[2]==="Given Proposition") {return propsUsed; }
       for (var i = 0; i < propToCheck[2][1].length; i++) {
            if (jQuery.inArray(propToCheck[2][1][i],propsUsed)===-1) {
                propsUsed.push(propToCheck[2][1][i]);
                propsUsed = this.check(props[propToCheck[2][1][i]-1],propsUsed);
            }
        }
        return propsUsed;
    },

    keepProps: function(propsUsed) {
        var newProps = [];
        var i;
        for (i=0;i<propsUsed.length;i++){
            newProps.push(props[propsUsed[i]-1]);
        }
        props = newProps;
        //RECALIBRATE NUMBERS
        var currentProp=1;
        for (i=0;i<props.length;i++){
            var numToChange = props[i][0];
            for (var j=0;j<props.length;j++){
                for (var l=0;l<props[j][2][1].length;l++){
                    if (props[j][2]!=="Given Proposition"){
                        if (props[j][2][1][l]==numToChange){
                            props[j][2][1][l]=currentProp;
                        }
                    }
                }
            }
            props[i][0]=currentProp;
            currentProp++;
        }
        return;
    }
}; // End of Cleaner declaration


/********************************
**********POSTFIX OBJECT*********
*********************************/

var Postfix = {
    infixToPostfix: function(infixStr) {
        var postfixStr=[];
        var stackArr=[];
        var postfixPtr = 0;
        var infixArr=infixStr.split("");
        for(var i = 0; i < infixArr.length; i++) {
            if(isOperand(infixArr[i])) {
                postfixStr[postfixPtr]=infixArr[i];
                postfixPtr++;
            }
            else if(isOperator(infixArr[i])) {
                while((stackArr.length!==0) && (prcd(infixArr[i])<=prcd(stackArr[stackArr.length-1]))) {
                    postfixStr[postfixPtr]=stackArr.pop();
                    postfixPtr++;
                }
            stackArr.push(infixArr[i]);
            }
            else if(infixArr[i]=="(")
                stackArr.push(infixArr[i]);
            else if(infixArr[i]==")") {
                while(stackArr[stackArr.length-1]!="(") {
                    postfixStr[postfixPtr]=stackArr.pop();
                    postfixPtr++;
                }
            stackArr.pop();
            }
        }
        while(stackArr.length!==0) {
            if(stackArr[stackArr.length-1]=="(") { stackArr.pop(); }
            else { postfixStr[postfixStr.length]=stackArr.pop(); }
        }
        console.log(""+infixStr+" transformed to postix notation: "+postfixStr.join(''));
        return postfixStr.join('');
    },

    postfixSubEval: function(sym,prop1,prop2) {
        var returnVal;
        if(sym=="~") { returnVal = (prop1==="T")? "F" : "T"; }
        else if(sym=="*") { returnVal = (prop1==="F" || prop2==="F")? "F" : "T"; }
        else if(sym==">") { returnVal = (prop1==="F" || prop2==="T")? "T" : "F"; }
        else if(sym=="|") { returnVal = (prop1==="T" || prop2==="T")? "T" : "F"; }
        else if(sym=="=") { returnVal = (prop1 == prop2)? "T" : "F"; }
        return returnVal;
    },

    // PRECONDITION: postfixStr must be in T & F
    postfixEval: function(postfixStr) {
        var stackArr=[];
        postfixStr=postfixStr.split('');
        for(var i = 0; i < postfixStr.length; i++) {
            if(postfixStr[i]=="T" || postfixStr[i]=="F") { stackArr.push(postfixStr[i]); }
            else {
                var pushVal;
                if (postfixStr[i]=="~") {
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

/********************************
***********TREE OBJECT***********
*********************************/

function treeNode(top,left,right) {
    if ((left===undefined && right===undefined)||(!Tree.compare(left,right))){
        this.top = top;
        this.left = left;
        this.right = right;
    }
    else {
        this.top = left.top;
        this.left = left.left;
        this.right = left.right;
    }
}


var Tree = {
    //PRECONDITON: Must be in Postfix first
    // Turns pq>qr>*pr>> into:
    //               >
    //             /   \
    //            /     \
    //           /       \
    //         *           >
    //       /   \       /   \
    //      >     >     p     r
    //    /  \   /  \
    //   p    q q    r
    // RULES: every operation must have 2 children 
    //        except "~" has 1 right child and no left child 
    //        every operator is a leaf
    postfixToTree: function(postfixStr) {
        var postfixArr=postfixStr.split("");
        var root = new treeNode(postfixArr.pop());
        console.log("Transformed "+postfixStr+" to Tree Data Structure");
        return this.postfixToTreeRecursive(root,postfixArr);
    },

    postfixToTreeRecursive: function(node,postfixArr) {
        if (isOperand(node.top)) return node;
        // New right node
        node.right = this.postfixToTreeRecursive(new treeNode(postfixArr.pop()),postfixArr);
        // New left node
        if (node.top !== "~") {
            node.left = this.postfixToTreeRecursive(new treeNode(postfixArr.pop()),postfixArr);
        }
        return node;
    },

    treeToInfix: function(tree) {
        var infixArr = [];
        if (isOperand(tree.top)) { return tree.top; }
        if (tree.top !== "~") {
            infixArr = infixArr.concat(this.treeToInfixRecursive(tree.left));
        }
        infixArr.push(tree.top);
        infixArr = infixArr.concat(this.treeToInfixRecursive(tree.right));
        return infixArr.join('');        
    },

    treeToInfixRecursive: function(node) {
        infixArr = [];
        //Left
        if (isOperand(node.top)) { return node.top; }
        if (node.top !== "~") {
            infixArr.push("(");
            infixArr = infixArr.concat(this.treeToInfixRecursive(node.left));
        }
        //Top
        infixArr.push(node.top);
        //Right
        infixArr = infixArr.concat(this.treeToInfixRecursive(node.right));
        if (node.top !=="~") { infixArr.push(")"); }
        return infixArr;
    },

    //Compares two trees to see if they're equal
    compare: function(x,y) {
        if (x===undefined && y===undefined)
            return true;
        else if (x===undefined || y===undefined)
            return false;
        else if (x.top == y.top) {
            if (this.compare(x.left,y.left)) {
                if (this.compare(x.right,y.right)) {
                    return true;
                } 
            return false;
            }
        return false;
        } 
    return false;
    }

};