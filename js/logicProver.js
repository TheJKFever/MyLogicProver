
var props = []; //In the form of [[0-index,1-proposition,2-rule/given,3-array of variables,4-postfix,5-tree],...,...]
var conc;    //In the form of [0-prop,1-"given conclusion",2-array of variables,3-postfix,4-tree,5-concType]
var alreadyTried = [];  //alreadyTried in format [rule name, [proposition number 1, ...., proposition number n]]
var transformed = []; //transformed in format [rule name, [proposition number 1, ...., proposition number n]]
var lockedInTrue = [];
var lockedInFalse = [];

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
                    return "Invalid Proposition: Cannot end with an open parenthese or an operation"; }
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
            prop = [props.length+1,prop,"Given Proposition", msg, propPF,Tree.postfixToTree(propPF)]; //propIndex, proposition, text output, number of variables, postfix, tree
            props.push(prop);
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
            conc = [prop,"Given Conclusion",msg,concPF,Tree.postfixToTree(concPF),conctype]; //proposition, text output, number of variables, postfix, tree, = or >
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
                tbl += "<li><table><tr><td>" + props[i][1]+"</td><td>" + props[i][0]+".) " + props[i][2]+"</td></tr></table></li>";
            } else {
                tbl += "<li><table><tr><td>" + props[i][1]+"</td><td>" + props[i][0]+".) "+(props[i][2][1].join(", ")+" " + props[i][2][0])+"</td></tr></table></li>";
            }
        }
        if (conc !== undefined) {
            tbl += "<li id='conclusionItem' type='A' value='3'><table><tr><td>"+conc[0]+"</td><td>"+conc[5]+" "+conc[1]+"</td></tr></table></li>";
        }
        console.log("Reconstructed Proof Table");
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
        Cleaner.cleanup();
        $("proofList").innerHTML = createTable();
        return false;
    }

    function init() {
        $("premForm").onsubmit = addProp;
        $("concForm").onsubmit = addConc;
        $("solveForm").onsubmit = solve;
        // addProp("(p>s)|r");
        // addProp("p>q");
        // addProp("q>r");
        // addConc("p>r");
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
        var Vars=[],_prop=[];
        var i = 0,j = 0;
        //Add all of the propositions PF to _prop[] and count total variables
        for (i = 0; i < props.length; i++) {
            _prop[i]=[props[i][4],"*"];
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
        //Create one long PF string for testing
        _prop = Postfix.infixToPostfix(_prop[0].join('')+_prop[1].join('')+conc[0]+conc[5]);
        //loop for all truth values, and test
        for (i = 0; i <Math.pow(2,Vars.length); i++) {
            var tempPropToSolve=_prop;
            for (j = 0;j<Vars.length;j++) {
                tempPropToSolve = tempPropToSolve.replaceAll(Vars[j],binaryToTruth((i>>j)&1));
            }
            if (!Postfix.postfixEval(tempPropToSolve)) {
                console.log("Error: Argument is not solvable");
                return false;
            }
        }
        console.log("Attempt succeeded, this argument is a tautology");
        return true;
    },

    solve: function() {
        //if outcome of last transformation == conclusion then end recursion
        //if not then call itself again
        console.log("\n**********Attempting to solve proof**********");
        while (props[props.length-1][1]!==conc[0]) {
            this.heuristic();
        }
        console.log("***********Argument solved***********\n");
        return;
    },

    heuristic: function() {
        //RULES IN HEURISTICAL ORDER, BRUTE FORCE
        for (var i = 0; i < props.length; i++) {
            //Simplification
            if (this.notAlreadyTried("Simp.", props[i][0])){
                if (this.simp(props[i])) {
                    if (this.isSolved()) { return true; }
                }
            }
            // New loop for rules that require two propositions
            for (var j=i+1;j< props.length;j++) {    
                //Hypothetical syllogism
                if (this.notAlreadyTried("H.S.", props[i][0], props[j][0])) {
                    if (this.hS(props[i],props[j])) {
                        if (this.isSolved()) { return true; }                
                    }                
                }
                //Constructive dilemma -- SHOULD HAVE A LOW HEURISTIC WEIGHT
                // if (this.cD(props[i],props[j])) {
                //     if (this.isSolved()) { return true; }                
                // }                

            } // End second loop
        } // End first loop
    }, //End Heurisitc

//REPLACEMENT RULES

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
    replacementRules: function(prop){
        console.log("ATTEMPTING REPLACEMENT RULES FOR: " + prop[1]);
        var propTree = prop[5];
        //Replacement rules to | major operator
        if (propTree.top==="|") {
            if (propTree.left==="*" && propTree.right==="*") {
                if (propTree.right.left==="~" && propTree.right.right==="~") {
                    if (Tree.compare(propTree.right.left.left,propTree.left.left) && Tree.compare(propTree.right.right.left,propTree.left.right)) {
                        transformed.push(["M.E.",[prop[0]]]);
                        newPropTree = new treeNode("=",propTree.left.left,propTree.left.right);
                        this.addTransformedProp(newPropTree, transformed[transformed.length-1]);
                        console.log("Successfully applied rule: \"M.E.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                        if (this.isSolved()) { return true; }
                        transformed.push(["M.E.",[props[props.length-1][0]]]);
                        newPropTree = new treeNode("*",new treeNode(">",propTree.left.left,propTree.left.right),new treeNode(">",propTree.left.right,propTree.left.left));
                        this.addTransformedProp(newPropTree, transformed[transformed.length-1]);
                        console.log("Successfully applied rule: \"M.E.\"\n" + props[props.length-2][1] + " -> " + props[props.length-1][1]);
                        if (this.isSolved()) { return true; }
                        // M.E.
                    }
                } else if (propTree.left.left==="~" && propTree.left.right==="~") {
                    if (Tree.compare(propTree.left.left.left,propTree.right.left) && Tree.compare(propTree.left.right.left,propTree.right.right)) {
                        transformed.push(["M.E.",[prop[0]]]);
                        newPropTree = new treeNode("=",propTree.right.left,propTree.right.right);
                        this.addTransformedProp(newPropTree, transformed[transformed.length-1]);
                        console.log("Successfully applied rule: \"M.E.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                        if (this.isSolved()) { return true; }
                        transformed.push(["M.E.",[props[props.length-1][0]]]);
                        newPropTree = new treeNode("*",new treeNode(">",propTree.right.left,propTree.right.right),new treeNode(">",propTree.right.right,propTree.right.left));
                        this.addTransformedProp(newPropTree, transformed[transformed.length-1]);
                        console.log("Successfully applied rule: \"M.E.\"\n" + props[props.length-2][1] + " -> " + props[props.length-1][1]);
                        if (this.isSolved()) { return true; }
                        // M.E.
                    }
                } else if (Tree.compare(propTree.left.left,propTree.right.left)){
                    transformed.push(["Distrib.",[prop[0]]]);
                    newPropTree = new treeNode("*",propTree.left.left,new treeNode("|",propTree.right.right,propTree.left.right));
                    this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                    console.log("Successfully applied rule: \"Distrib.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                    if (this.isSolved()) { return true; }
                    // Distrib.
                } else if (Tree.compare(propTree.left.left,propTree.right.right)){
                    transformed.push(["Distrib.",[prop[0]]]);
                    newPropTree = new treeNode("*",propTree.left.left,new treeNode("|",propTree.right.left,propTree.left.right));
                    this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                    console.log("Successfully applied rule: \"Distrib.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                    if (this.isSolved()) { return true; }
                    // Distrib.
                } else if (Tree.compare(propTree.left.right,propTree.right.left)){
                    transformed.push(["Distrib.",[prop[0]]]);
                    newPropTree = new treeNode("*",propTree.left.right,new treeNode("|",propTree.right.right,propTree.left.left));
                    this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                    console.log("Successfully applied rule: \"Distrib.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                    if (this.isSolved()) { return true; }
                    // Distrib.
                } else if (Tree.compare(propTree.left.right,propTree.right.right)){
                    transformed.push(["Distrib.",[prop[0]]]);
                    newPropTree = new treeNode("*",propTree.left.right,new treeNode("|",propTree.right.left,propTree.left.left));
                    this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                    console.log("Successfully applied rule: \"Distrib.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                    if (this.isSolved()) { return true; }
                    // Distrib.
                }
            } else if (propTree.left==="~" && propTree.right==="~"){
                if (!Tree.compare(propTree.left.left,propTree.right.left)){
                    transformed.push(["DeM.",[prop[0]]]);
                    newPropTree = new treeNode("~", new treeNode("*",propTree.left.left,propTree.right.left));
                    this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                    console.log("Successfully applied rule: \"DeM.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                    if (this.isSolved()) { return true; }
                    // DeM.
                }
            } else if (propTree.left==="~" || propTree.right==="~"){
             if (propTree.left==="~"){
                if (!Tree.compare(propTree.left.left,propTree.right)){
                    transformed.push(["M.I.",[prop[0]]]);
                    newPropTree = new treeNode(">",propTree.left.left,propTree.right);
                    this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                    console.log("Successfully applied rule: \"M.I.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                    if (this.isSolved()) { return true; }
                        // M.I.
                        transformed.push(["Trans.",[props[props.length-1][0]]]);
                        newPropTree = new treeNode(">", new treeNode("~",newPropTree.left), new treeNode("~",newPropTree.right));
                        this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                        console.log("Successfully applied rule: \"Trans.\"\n" + props[props.length-2][1] + " -> " + props[props.length-1][1]);
                        if (this.isSolved()) { return true; }
                        // Trans.
                    }
                } else {
                 if (!Tree.compare(propTree.right.left,propTree.left)){
                    transformed.push(["M.I.",[prop[0]]]);
                    newPropTree = new treeNode(">",propTree.right.left,propTree.left);
                    this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                    console.log("Successfully applied rule: \"M.I.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                    if (this.isSolved()) { return true; }
                        // M.I.
                        transformed.push(["Trans.",[props[props.length-1][0]]]);
                        newPropTree = new treeNode(">", new treeNode("~",newPropTree.left), new treeNode("~",newPropTree.right));
                        this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                        console.log("Successfully applied rule: \"Trans.\"\n" + props[props.length-2][1] + " -> " + props[props.length-1][1]);
                        if (this.isSolved()) { return true; }
                        // Trans.
                    }
                }
            } else if (propTree.right==="*" || propTree.left==="*") {
                if (propTree.right==="*") {
                    if (Tree.compare(propTree.left,propTree.right.left) && Tree.compare(propTree.left,propTree.right.right) && Tree.compare(propTree.right.left,propTree.right.right)){
                        transformed.push(["Distrib.",[prop[0]]]);
                        newPropTree = new treeNode("*", new treeNode("|", propTree.left, propTree.right.left), new treeNode("|", propTree.left, propTree.right.right));
                        this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                        console.log("Successfully applied rule: \"Distrib.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                        if (this.isSolved()) { return true; }
                        // Distrib.
                    }
                } else {
                    if (Tree.compare(propTree.right,propTree.left.left) && Tree.compare(propTree.right,propTree.left.right) && Tree.compare(propTree.left.left,propTree.left.right)){
                        transformed.push(["Distrib.",[prop[0]]]);
                        newPropTree = new treeNode("*", new treeNode("|", propTree.right, propTree.left.left), new treeNode("|", propTree.right, propTree.left.right));
                        this.addTransformedProp(newPropTree, transformed[transformed.length-1]);                
                        console.log("Successfully applied rule: \"Distrib.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
                        if (this.isSolved()) { return true; }
                        // Distrib.
                    }
                }
            }
        }
        //Replacement rules to * major operator
        else if (propTree.top==="*") {
            return false; // TO-DO Build out * replacement rules
        }
        console.log("FINISHED REPLACEMENT RULES FOR: " + prop[1]);
    },

//END REPLACEMENT RULES


//INFERENCE RULES
    //PRECONDITION: test to see if simp has already been tried with this prop
    simp: function(prop){
        if (prop[5].top==="*"){
            transformed.push(["Simp.",[prop[0]]]);
//DONT NEED THIS RIGHT NOW, BUT MIGHT LATER
        //If left or right leaf is an operand or ~, then lock in respective Truth and False values
                    // if (prop[5].left.right===undefined){
                    //     if (prop[5].left==="~"){
                    //         if (jQuery.inArray(prop[5].left.left,lockedInFalse)===-1) {
                    //             lockedInFalse.push(prop[5].left.left);
                    //         }   
                    //     } else if (jQuery.inArray(prop[5].left,lockedInTrue)===-1) {
                    //         lockedInTrue.push(prop[5].left);
                    //     }
                    // }
                    // if (prop[5].right.right===undefined){
                    //     if (prop[5].right==="~"){
                    //         if (jQuery.inArray(prop[5].right.left,lockedInFalse)===-1) {
                    //             lockedInFalse.push(prop[5].right.left);
                    //         }   
                    //     } else if (jQuery.inArray(prop[5].right,lockedInTrue)===-1) {
                    //         lockedInTrue.push(prop[5].right);
                    //     }
                    // }


            //Create new prop from left and right leafs and add Transformation
            newPropTree = new treeNode(prop[5].left,prop[5].left.left,prop[5].right.right);
            this.addTransformedProp(newPropTree, transformed[transformed.length-1]);
            console.log("Successfully applied rule: \"Simp.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
            newPropTree = new treeNode(prop[5].right,prop[5].left.left,prop[5].right.right);
            this.addTransformedProp(newPropTree, transformed[transformed.length-1]);
            console.log("Successfully applied rule: \"Simp.\"\n" + prop[1] + " -> " + props[props.length-1][1]);
            return true;
        }
        return false;
    },

    //PRECONDITION: test to see if hS has already been tried with these props
    hS: function(prop1, prop2) {
        if (prop1[5].top===">" && prop2[5].top===">") {
            var newPropTree;
            if (Tree.compare(prop1[5].right,prop2[5].left)) {
                newPropTree = new treeNode(">",prop1[5].left,prop2[5].right);
            } else if (Tree.compare(prop2[5].right,prop1[5].left)) {
                newPropTree = new treeNode(">",prop2[5].left,prop1[5].right);
            } else {
                return false; 
            }
            transformed.push(["H.S.",[prop1[0],prop2[0]]]);
            this.addTransformedProp(newPropTree, transformed[transformed.length-1]);
            console.log("Successfully applied rule: \"H.S.\"\n" + prop1[1] +  "*" + prop2[1] + " -> " + props[props.length-1][1]);
            return true;
        }
        return false;
    },

    //Can be tried over again after any truth value is locked in
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

//END INFERENCE RULES

    isSolved: function(){
        if (props[props.length-1][1]!==conc[0]) return true;
        return false;
    },

    notAlreadyTried: function(rule, propNum1, propNum2, propNum3, propNum4) {
        var propNums = [propNum1];
        if (propNum2) { propNums.push(propNum2); }
        if (propNum3) { propNums.push(propNum3); }
        if (propNum4) { propNums.push(propNum4); }
        if (jQuery.inArray([rule,propNums],alreadyTried)===-1) {
            alreadyTried.push([rule,propNums]);
            return true;
        }
        return false;
    },

    addTransformedProp: function(tree, trans) {
        var prop_infix = Tree.treeToInfix(tree);
        props.push([props.length+1,prop_infix,trans, null, null,tree]); //propIndex, proposition, text output, number of variables, postfix, tree
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
                propsUsed = this.check(props[propToCheck[2][1][i]],propsUsed);
            }
        }
        return propsUsed;
    },

    keepProps: function(propsUsed) {
        var lastDeleted=100;
        var totalDeleted = 0;
        for (var i = 0; i < propsUsed.length; i++) {
            for (var j = 0;j< props.length;j++) {
                if (propsUsed[i]==props[j][0]) {
                    i++;
                    if (props[j][0]>lastDeleted) {
                        props[j][0]=props[j][0]-totalDeleted;
                        for (var l = 0;l< props[j][2][1].length;l++) {
                            if (props[j][2][1][l]>lastDeleted) { 
                                props[j][2][1][l]=props[j][2][1][l]-totalDeleted; 
                            }
                        }
                    }
                }
                else {
                    lastDeleted=props[j][0];
                    props.splice(j, 1);
                    totalDeleted++;
                    j--;
                }
            }
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
        for(var i = 0; i < postfixStr.length; i++) {
            if(typeof postfixStr[i] == "boolean") { stackArr.push(postfixStr[i]); }
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
    this.top = top;
    this.left = left;
    this.right = right;
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
    //        except "~" has 1 left child and no right child 
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
        if ((node.top !== "~")) {
            node.right = this.postfixToTreeRecursive(new treeNode(postfixArr.pop()),postfixArr);
        }
        // New left node
        node.left = this.postfixToTreeRecursive(new treeNode(postfixArr.pop()),postfixArr);
        return node;
    },

    treeToInfix: function(tree) {
        var infixArr = [];
        infixArr = infixArr.concat(this.treeToInfixRecursive(tree.left,infixArr));
        infixArr.push(tree.top);
        infixArr = infixArr.concat(this.treeToInfixRecursive(tree.right,infixArr));
        return infixArr.join('');        
    },

    treeToInfixRecursive: function(node, infixArr) {
        //Left
        if (isOperand(node.top)) { return node.top; }
        infixArr.push("(");
        infixArr = infixArr.concat(this.treeToInfixRecursive(node.left,infixArr));
        //Top
        infixArr.push(node.top);
        //Right
        infixArr = infixArr.concat(this.treeToInfixRecursive(node.left,infixArr));
        infixArr.push(")");
        return infixArr;
    },

    compare: function(x,y) {
        if (x===undefined && y===undefined)
            return true;
        if (x.top == y.top) {
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