var props = []; //In the form of [[0-index,1-Infix,2-rule/given,3-variables,4-postfix,5-tree,6-usedCount,7-decommissioned],...,...]
var finalProps = []; //To be used by Cleaner Object
var concs = [];    //In the form of [[0-index,1-Infix,2-rule/given,3-variables,4-postfix,5-tree,6-usedCount,7-decommissioned,8-concType],...,...]
var givenProps = 0;

(function () {
    function validateProp(prop) {
        var i = 0; //for loops
        console.log("Vaidating prop: " + prop);
        if (prop === "") return "Please enter an proposition";
        for (i = 0; i < props.length; i++) {
            if (prop === props[i][1]) return "You have already entered this proposition";
        }
        var parOpenCount = 0;
        var variables=[];
        prop = prop.split("");
        var end = prop.length-1;
        for (i = 0; i < prop.length; i++) {
        //Check to see if an invalid character was entered
            if (jQuery.inArray(prop[i], ["*", "v", ">", "=", "~", "(", ")", "A", "B", "C", "D", "E", "F", "G", "H"]) == -1)
                return "Please enter a valid proposition using only A, B, C, D, E, F, G, H, *, |, ~, >, =, (, )";
            if (i===0) { 
                if (jQuery.inArray(prop[i], [")", ">", "*", "v", "="]) >= 0)   
                    return ("Invalid operation at character: "+(i+1)+"\nError: cannot have a closed parenthese or operation as the first character");
            }
            if (i==end) { 
                if (jQuery.inArray(prop[i], ["(", "~", "*", "v", ">", "="]) >= 0)
                    return "Invalid Proposition: Cannot end with an open parentheses or an operation";
                else if (prop[i]==")" && parOpenCount!==1) return "Invalid number of parentheses";
                else if (jQuery.inArray(prop[i], ["A", "B", "C", "D", "E", "F", "G", "H"]) >= 0) variables.push(prop[i]);
            }
            else if (prop[i] === "~") { 
                if (prop[i+1]==="~"){
                    prop.splice(i,2);
                } else if (jQuery.inArray(prop[i+1], [")", ">", "*", "v", "="]) >= 0)
                    return ("Invalid operation at character: "+(i+1)+"\nError: cannot have a closed parenthese or operation or following a NOT sign");
            }
            else if (jQuery.inArray(prop[i],["*", ">", "v", "=", "("]) >= 0) {
                if (jQuery.inArray(prop[i+1],[")", "*", ">", "v", "="]) >= 0) 
                    return ("Error: " + prop[i+1]+" cannot follow " + prop[i]);
                else if (prop[i]=="(") parOpenCount++;
            }
            else if (jQuery.inArray(prop[i],[")", "A", "B", "C", "D", "E", "F", "G", "H"]) >= 0) {
                if (prop[i]==")") parOpenCount--;
                else variables.push(prop[i]);
                if (jQuery.inArray(prop[i+1],["(", "~", "A", "B", "C", "D", "E", "F", "G", "H"]) >= 0) { 
                    return ("Error: " + prop[i+1]+" cannot follow " + prop[i]); 
                }
            }
        }
        console.log("Proposition validated!");
        prop = prop.join("");
        return [prop,variables];
    }

    function addProp(testProp) {        
        var prop = (typeof testProp !== "string")? $("newPremInput").value : testProp;
        $("newPremInput").value = "";            
        console.log("The user entered premise: " + prop);
        prop = validateProp(prop);
        if (typeof prop[1] === "object") {
            var variables = prop[1];
            var propPF = Postfix.infixToPostfix(prop[0]);
            var propT = Tree.postfixToTree(propPF);
            prop = Tree.treeToInfix(propT);
            prop = [props.length+1,prop,["Given Proposition",[(givenProps-50)]],variables,propPF,propT,0,false];
            props.push(prop);
            givenProps++;
            if (props.length >= 1 && concs.length!==0) {
                changeToSolve();
            }
            $("proofList").innerHTML = createTable(props);
        } else {
            console.log("Invalid proposition: "+prop[1]);
            alert(prop);
        }
        return false;
    }

    function addConc(testConc) {
        var conctype = $("concType").value === ("Therefore")? ">": "=";
        var prop = (typeof testConc !== "string")? $("newConcInput").value : testConc ;
        $("newConcInput").value = "";
        console.log("The user entered conclusion: " + prop);
        prop = validateProp(prop);
        if (typeof prop[1] === "object") {
            var variables = prop[1];            
            var concPF = Postfix.infixToPostfix(prop[0]);
            var concT = Tree.postfixToTree(concPF);
            prop = Tree.treeToInfix(concT); 
            conc = [concs.length+1,prop,["Given Conclusion",[0]],variables,concPF,concT,0,false,conctype];
            concs.push(conc);
            if (props.length >= 1) {
                changeToSolve();
            } else {
                $("newConcInput").disabled = true;
                $("submitConc").disabled = true;
            }
            $("proofList").innerHTML = createTable(props);
        } else { 
            console.log("Invalid proposition: "+prop[1]);
            alert(prop);
        }
        return false;
    }

    function createTable(propArray) {
        var tbl = "";
        for (var i = 0; i < propArray.length; i++) {
            if (propArray[i][2][0]==="Given Proposition") {
                tbl += "<li><table><tr><td>"+propArray[i][1]+"</td><td>"+propArray[i][2][0]+"</td><td style='width:50px;text-align:center'>"+propArray[i][6]+"</td></tr></table></li>";
            } else {
                tbl += "<li><table><tr><td>"+propArray[i][1]+"</td><td>"+(propArray[i][2][1].join(", ")+" "+propArray[i][2][0])+"</td><td style='width:50px;text-align:center'>"+propArray[i][6]+"</td></tr></table></li>";
            }
        }
        if (concs.length!==0) {
            tbl += "<li id='conclusionItem' type='A' value='3'><table><tr><td>"+concs[0][1]+"</td><td>"+concs[0][8]+" "+concs[0][2][0]+"</td><td style='width:50px;text-align:center'>"+concs[0][6]+"</td></tr></table></li>";
        }
        console.log("Reconstructed Proof Table\n");
        return tbl;
    }

    function changeToSolve() {
        if (props.length >= 1 && concs.length!==0) {
            $("concForm").style.display = "none";
            $("solveForm").style.display = "block";
        }
    }

    function resetProof(){
        props = [];
        finalProps = [];
        concs = [];
        givenProps = 0;
        $("proofList").innerHTML = 
                "<li><table><tr><td>First premise</td><td>1. Given premise</td><td style='width:50px;text-align:center'>0</td></tr></table>"+
                "<li><table><tr><td>Second premise</td><td>2. Given premise</td><td style='width:50px;text-align:center'>0</td></tr></table>"+
                "<li><table><tr><td>Third premise</td><td>3. Given premise</td><td style='width:50px;text-align:center'>0</td></tr></table>"+
                "<li id='conclusionItem' type='A' value='3'><table><tr><td>Conclusion</td><td>Given conclusion</td><td style='width:50px;text-align:center'>0</td></tr></table>";
        $("concForm").style.display = "block";
        $("solveForm").style.display = "none";
        $("submitSolve").value = "Solve";
        $("solveForm").onsubmit = solve;                
        return false;
    }

    function solve(){
        $("submitSolve").value = "Clear";
        $("solveForm").onsubmit = resetProof;
        if (!Solver.solvable()) {
            alert("This argument is not valid");
            return false;
        }
        if (Solver.solve()){
            Cleaner.cleanup();
        }
        // else Cleaner.removeZeros(props);
        $("proofList").innerHTML = createTable(finalProps);
        return false;
    }

    function init() {
        $("premForm").onsubmit = addProp;
        $("concForm").onsubmit = addConc;
        $("solveForm").onsubmit = solve;
        $("fq1").onclick = examQuestion1;
        $("fq2").onclick = examQuestion2;
        $("fq3").onclick = examQuestion3;
        $("fq4").onclick = examQuestion4;
        $("fq5").onclick = examQuestion5;
        $("fq6").onclick = examQuestion6;
        $("fq7").onclick = examQuestion7;
        $("fq8").onclick = examQuestion8;
        $("fq9").onclick = examQuestion9;
        $("fq10").onclick = examQuestion10;
    }

/*************** EXAM QUESTIONS ***************/
    function examQuestion1(){
        resetProof();
        addProp("A>(~B*C)");
        addProp("Dv~E");
        addProp("AvE");
        addConc("B>D");
        return false;
    }    
    function examQuestion2(){
        resetProof();
        addProp("B>((AvC)>F)");
        addProp("(FvD)>E");
        addConc("B>(C>E)");
    }
    function examQuestion3(){
        resetProof();
        addProp("~(H*~(AvB))");
        addProp("~(AvD)");
        addProp("C>(AvE)");
        addConc("~(~E*~B)v~(CvH)");

    }
    function examQuestion4(){
        resetProof();
        addProp("A>(BvC)");
        addProp("(B>D)*(C>E)");
        addConc("A>(DvE)");
    }
    function examQuestion5(){
        resetProof();
        addProp("E>B");
        addProp("BvC");
        addProp("C=D");
        addConc("EvD");
    }
    function examQuestion6(){
        resetProof();
        addProp("(A>B)>B");
        addConc("(B>A)>A");        
    }
    function examQuestion7(){
        resetProof();
        addProp("Av(~B*C)");
        addProp("B>~A");
        addConc("~B");
    }
    function examQuestion8(){
        resetProof();
        addProp("A>(B>C)");
        addConc("(A>B)>(A>C)");
    }
    function examQuestion9(){
        resetProof();
        addProp("Av(B>D)");
        addProp("B>~E");
        addProp("B*(E=D)");
        addConc("B>(AvC)");
    }
    function examQuestion10(){
        resetProof();
        addProp("G=(Av(~Bv~C))");
        addProp("(Av~B)>D");
        addProp("(Av~C)>E");
        addConc("G>(D*E)");
    }

    window.onload = init;
})();



/********************************
********UTILITY FUNCTIONS********
*********************************/

String.prototype.replaceAll = function (find, replace) {
  var str = this;
  console.log("replacing all "+find+" with "+replace);
  return str.replace(new RegExp(find, 'g'), replace);
};

function $(elementID) { 
    if (typeof(elementID) == "string") return document.getElementById(elementID);
}

function isOperand(who) {
    return (jQuery.inArray(who,["A", "B", "C", "D", "E", "F", "G", "H", "TRUE", "FALSE"]) >= 0)? true: false;
}

function isOperator(who) {
    return (jQuery.inArray(who,["~", "*", "v", ">", "="]) >= 0)? true: false;
}

/* Check for Precedence */
function prcd(who) {
    if(who=="~")                                return(4);
    else if((who==">")||(who=="*")||(who=="v")) return(3);
    else if(who=="=")                           return(2);
    else if ((who=="(")||(who==")"))            return(1);
}

function binaryToTruth(oneOrZero) {
    var truthVal = (oneOrZero===0)? "F" : "T";
    return truthVal;  
}

/********************************
**********SOLVER OBJECT**********
*********************************/

var Solver = {
    //PRECONDITION: Validated props and concs
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
        //Add variable from Conclusion if there are extras
        for (j = 0;j<concs[0][3].length; j++) {
            if (jQuery.inArray(concs[0][3][j],Vars)===-1) {
                Vars.push(concs[0][3][j]);
            }
        }
        console.log("****Counted a total of "+Vars.length+" variables");
        var ast = "";
        for (i = 0; i < props.length-1;i++){
            ast = ast.concat("*");
        }       
        //Create one long PF string for testing
        _prop = _prop.join('')+ast+concs[0][4]+concs[0][8];
        //loop for all truth values, and test
        for (i = 0; i <Math.pow(2,Vars.length); i++) {
            var tempPropToSolve=_prop;
            for (j = 0;j<Vars.length;j++) {
                tempPropToSolve = tempPropToSolve.replaceAll(Vars[j],binaryToTruth((i>>j)&1));
            }
            if (Postfix.postfixEval(tempPropToSolve)=="F") {
                console.log("Error: Argument is not solvable");
                return false;
            }
        }
        console.log("Attempt succeeded, this argument is a tautology");
        return true;
    },

    solve: function() {
        console.log("\n**********Attempting to solve proof**********");
//IDEALLY SHOULD USE WHILE LOOP, BUT WILL USE 10 LOOPS FOR TESTING        
        var i=0;
        var propsLength = props.length;
        BackwardsSolver.solve();
        for (i=0; i<13;i++){
            if (this.heuristic()) return true;
        }
        alert("Could Not Solve");
        return false;
    },

    heuristic: function() {
        var i;
        var propsLength = props.length;
        for (i = 0; i < propsLength; i++) {
            if (props[i][7]!==true){
                props[i][7]=true;
                var result = [];
                root = props[i][5];
                if (isOperator(root.top)){
                    //TOP ACTION
                    if (root.top==="="){
                        //ME
                        if (this.addTransformedProp(new treeNode("*",new treeNode(">",root.left,root.right),new treeNode(">",root.right,root.left)), ["ME",[props[i][0]]])) return true;                            
                        if (this.addTransformedProp(new treeNode("v",new treeNode("*",root.left,root.right),new treeNode("*",new treeNode("~",undefined,root.left), new treeNode("~",undefined,root.right))), ["Truth Table Form",[props[i][0]]])) return true;
                    }
                    else if (root.top==="v") {
                        //Immediate Inferences
                        if (root.right.top==="FALSE"){
                            if (this.addTransformedProp(root.left, ["Immediate Inference",[props[i][0]]])) return true;
                        } else if (root.left.top==="FALSE"){
                            if (this.addTransformedProp(root.right, ["Immediate Inference",[props[i][0]]])) return true;
                        }                        
                        //Tautology
                        if (Tree.compare(root.left, root.right)){
                            if (this.addTransformedProp(root.left, ["Tautology",[props[i][0]]])) return true;                
                        }
                        //DISTRIB
                        if (root.left.top==="*" && root.right.top==="*") {
                            if (Tree.compare(root.left.left,root.right.left)){
                                if (this.addTransformedProp(new treeNode("*",root.left.left,new treeNode("v",root.right.right,root.left.right)), ["Distrib.",[props[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.left,root.right.right)){
                                if (this.addTransformedProp(new treeNode("*",root.left.left,new treeNode("v",root.right.left,root.left.right)), ["Distrib.",[props[i][0]]])) return true;               
                            } else if (Tree.compare(root.left.right,root.right.left)){
                                if (this.addTransformedProp(new treeNode("*",root.left.right,new treeNode("v",root.right.right,root.left.left)), ["Distrib.",[props[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.right,root.right.right)){
                                if (this.addTransformedProp(new treeNode("*",root.left.right,new treeNode("v",root.right.left,root.left.left)), ["Distrib.",[props[i][0]]])) return true;                
                            }
                            //ME
                            if (Tree.compare(new treeNode("~",undefined,root.left.left),root.right.left) || Tree.compare(root.left.left,new treeNode("~",undefined,root.right.left))) {
                                if (Tree.compare(new treeNode("~",undefined,root.left.right),root.right.right) || Tree.compare(root.left.right,new treeNode("~",undefined,root.right.right))){
                                    if (this.addTransformedProp(new treeNode("=",root.left.left,root.left.right), ["Truth Table Form",[props[i][0]]])) return true;
                                    if (this.addTransformedProp(new treeNode("*",new treeNode(">",root.left.left,root.left.right),new treeNode(">",root.left.right,root.left.left)), ["ME",[props[i][0]]])) return true;                            
                                }
                            } else if (Tree.compare(new treeNode("~",undefined,root.left.left),root.right.right) || Tree.compare(root.left.left,new treeNode("~",undefined,root.right.right))) {
                                if (Tree.compare(new treeNode("~",undefined,root.left.right),root.right.left) || Tree.compare(root.left.right,new treeNode("~",undefined,root.right.left))){
                                    if (this.addTransformedProp(new treeNode("=",root.left.left,root.left.right), ["Truth Table Form",[props[i][0]]])) return true;
                                    if (this.addTransformedProp(new treeNode("*",new treeNode(">",root.left.left,root.left.right),new treeNode(">",root.left.right,root.left.left)), ["ME",[props[i][0]]])) return true;                            
                                }
                            }
                        }
                        //DISTRIB
                        else if (root.right.top==="*") {
                            if (this.addTransformedProp(new treeNode("*", new treeNode("v", root.left, root.right.left), new treeNode("v", root.left, root.right.right)), ["Distrib.",[props[i][0]]])) return true;
                        } else if (root.left.top==="*") {
                            if (this.addTransformedProp(new treeNode("*", new treeNode("v", root.right, root.left.left), new treeNode("v", root.right, root.left.right)), ["Distrib.",[props[i][0]]])) return true;
                        }
                        //Comm
                        if (this.addTransformedProp(new treeNode(root.top,root.right,root.left), ["Comm.",[props[i][0]]])) return true;
                        if (root.right.top==="v" && root.left.top==="v"){
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.left.left,root.left.right),new treeNode("v",root.right.left,root.right.left)),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.left.left,root.right.left),new treeNode("v",root.left.right,root.right.left)),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.left.left,root.right.left),new treeNode("v",root.left.right,root.right.left)),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.left.right,root.right.left),new treeNode("v",root.right.left,root.left.left)),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.left.right,root.right.left),new treeNode("v",root.left.left,root.right.left)),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.right.left,root.right.left),new treeNode("v",root.left.left,root.left.right)),["Comm.",[props[i][0]]])) return true;                           
                        }
                        if (root.right.top==="v"){
                            if (this.addTransformedProp(new treeNode("v",root.right.left,new treeNode("v",root.left,root.right.right)),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",root.right.right,new treeNode("v",root.left,root.right.left)),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.right.right,root.left),root.right.left),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.right.right,root.right.left),root.left),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.right.left,root.left),root.right.right),["Comm.",[props[i][0]]])) return true;
                        } else if (root.left.top==="v"){
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.left.left,root.right),root.left.right),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",new treeNode("v",root.left.right,root.right),root.left.left),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",root.right,new treeNode("v",root.left.left,root.left.right)),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",root.left.left,new treeNode("v",root.right,root.left.right)),["Comm.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode("v",root.left.right,new treeNode("v",root.right,root.left.left)),["Comm.",[props[i][0]]])) return true;
                        }
                        //MI
                        if (this.addTransformedProp(new treeNode(">",new treeNode("~", undefined, root.left),root.right), ["MI",[props[i][0]]])) return true;
                        if (this.addTransformedProp(new treeNode(">",new treeNode("~", undefined, root.right),root.left), ["MI",[props[i][0]]])) return true;
                    }
                    else if (root.top==="*"){
                        //Immediate Inferences
                        if (root.right.top==="TRUE"){
                            if (this.addTransformedProp(root.left, ["Immediate Inference",[props[i][0]]])) return true;
                        } else if (root.left.top==="TRUE"){
                            if (this.addTransformedProp(root.right, ["Immediate Inference",[props[i][0]]])) return true;
                        }
                        //Tautology
                        if (Tree.compare(root.left, root.right)){
                            if (this.addTransformedProp(root.left, ["Tautology",[props[i][0]]])) return true;                
                        }
                        //SIMP
                        if (this.addTransformedProp(root.left, ["Simp.",[props[i][0]]])) return true;
                        if (this.addTransformedProp(root.right, ["Simp.",[props[i][0]]])) return true;
                        //DISTRIB
                        if (root.left.top==="v" && root.right.top==="v") {
                            if (Tree.compare(root.left.left,root.right.left)){
                                if (this.addTransformedProp(new treeNode("v",root.left.left, new treeNode("*",root.right.right,root.left.right)), ["Distrib.",[props[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.left,root.right.right)){
                                if (this.addTransformedProp(new treeNode("v",root.left.left, new treeNode("*",root.right.left,root.left.right)), ["Distrib.",[props[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.right,root.right.left)){
                                if (this.addTransformedProp(new treeNode("v",root.left.right, new treeNode("*",root.right.right,root.left.left)), ["Distrib.",[props[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.right,root.right.right)){
                                if (this.addTransformedProp(new treeNode("v",root.left.right, new treeNode("*",root.right.left,root.left.left)), ["Distrib.",[props[i][0]]])) return true; 
                            }
                        }
                        else if (root.right.top==="v") {
                            if (this.addTransformedProp(new treeNode("v",new treeNode("*",root.left,root.right.left),new treeNode("*",root.left,root.right.right)), ["Distrib.",[props[i][0]]])) return true;
                        } else if (root.left.top==="v") {
                            if (this.addTransformedProp(new treeNode("v",new treeNode("*",root.right,root.left.left),new treeNode("*",root.right,root.left.right)), ["Distrib.",[props[i][0]]])) return true;
                        }
                        //ME
                        if (root.left.top===">" && root.right.top===">") {
                            if (Tree.compare(root.left.left,root.right.right) && Tree.compare(root.left.right,root.right.left)){
                                if (this.addTransformedProp(new treeNode("=",root.left.left,root.right.left), ["ME",[props[i][0]]]))  return true;
                                if (this.addTransformedProp(new treeNode("v",new treeNode("*",root.left.left,root.right.left),new treeNode("*",new treeNode("~",undefined,root.left.left), new treeNode("~",undefined,root.right.left))), ["Truth Table Form",[props[i][0]]]))  return true;
                            } else if (Tree.compare(root.left.right,root.right.left) && Tree.compare(root.left.left,root.right.right)){
                                if (this.addTransformedProp(new treeNode("=",root.left.left,root.right.left), ["ME",[props[i][0]]]))  return true;
                                if (this.addTransformedProp(new treeNode("v",new treeNode("*",root.left.left,root.right.left),new treeNode("*",new treeNode("~",undefined,root.left.left), new treeNode("~",undefined,root.right.left))), ["Truth Table Form",[props[i][0]]]))  return true;
                            }
                        }                
                    }
                    else if (root.top===">"){
                        //Immediate Inferences
                        if (root.left.top==="TRUE"){
                            if (this.addTransformedProp(root.right, ["Immediate Inference",[props[i][0]]])) return true;
                        } else if (root.right.top==="FALSE"){
                            if (this.addTransformedProp(new treeNode("~",undefined,root.left), ["Immediate Inference",[props[i][0]]])) return true;
                        }
                        //EXP
                        if (root.left.top==="*"){
                            if (this.addTransformedProp(new treeNode(">",root.left.left,new treeNode(">",root.left.right,root.right)), ["Exp.",[props[i][0]]])) return true;
                            if (this.addTransformedProp(new treeNode(">",root.left.right,new treeNode(">",root.left.left,root.right)), ["Exp.",[props[i][0]]])) return true;                                            
                        } else if (root.right.top===">"){
                            if (this.addTransformedProp(new treeNode(">", new treeNode("*",root.left,root.right.left),root.right.right), ["Exp.",[props[i][0]]])) return true;                                                                
                        }
                        //ABS
                        if (root.right==="*"){
                            if (Tree.compare(root.right.left,root.left)){
                                if (this.addTransformedProp(new treeNode(">",root.left,root.right.right),["Abs.",[props[i][0]]])) return true;
                            }
                        }
                        //MI
                        if (this.addTransformedProp(new treeNode("v",new treeNode("~", undefined, root.left),root.right), ["MI",[props[i][0]]])) return true;
                        //TRANS
                        if (this.addTransformedProp(new treeNode(">",new treeNode("~", undefined, root.right),new treeNode("~", undefined, root.left)), ["Trans.",[props[i][0]]])) return true;
                    }
//************* ENTER RECURSIVE FUNCTIONS *****************
                    //START RECURSIVE LEFT
                    if (root.top!=="~"){            
                        result = this.heuristicRecursive(root.left, []);
                        for (x=0;x<result.length;x++){
                            if (this.addTransformedProp(new treeNode(root.top, result[x][1], root.right), [result[x][0],[props[i][0]]])) return true;
                        }
                    }
                    //START RECURSIVE RIGHT
                    result = this.heuristicRecursive(root.right, []);
                    for (x=0;x<result.length;x++){
                        if (this.addTransformedProp(new treeNode(root.top, root.left, result[x][1]), [result[x][0],[props[i][0]]])) return true;
                    }
                }
            }
// ********** END RECURSIVE FUNCTIONS ***********
            if (this.inferenceRules(props[i])) return true;
            if (this.aDd(props[i])) return true;
            if (this.deM(props[i])) return true;
        }
        return false;
    },

    heuristicRecursive: function(prop, result){
        var resultRecursive = [];
        var x;
        if (prop.top===undefined || isOperand(prop.top)) return result;
        //RECURSIVE ACTION
        if (prop.top==="="){
            result.push(["ME.",new treeNode("*",new treeNode(">",prop.left,prop.right),new treeNode(">",prop.right,prop.left))]);                          
            result.push(["Truth Table Form",new treeNode("v",new treeNode("*",prop.left,prop.right),new treeNode("*",new treeNode("~",undefined,prop.left), new treeNode("~",undefined,prop.right)))]);
        } else if (prop.top==="v") {
            //Immediate Inferences
            if (prop.right.top==="FALSE"){
                result.push(["Immediate Inference",prop.left]);
            } else if (prop.left.top==="FALSE"){
                result.push(["Immediate Inference",prop.right]);
            }                        
            //Tautology
            if (Tree.compare(prop.left, prop.right)){
                result.push(["Tautology",prop.left]);              
            }
            //Comm
            result.push(["Comm.",new treeNode(prop.top,prop.right,prop.left)]);
            if (prop.right.top==="v" && prop.left.top==="v"){
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.left.left,prop.left.right),new treeNode("v",prop.right.left,prop.right.left))]);
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.left.left,prop.right.left),new treeNode("v",prop.left.right,prop.right.left))]);
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.left.left,prop.right.left),new treeNode("v",prop.left.right,prop.right.left))]);
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.left.right,prop.right.left),new treeNode("v",prop.right.left,prop.left.left))]);
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.left.right,prop.right.left),new treeNode("v",prop.left.left,prop.right.left))]);
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.right.left,prop.right.left),new treeNode("v",prop.left.left,prop.left.right))]);                           
            }
            if (prop.right.top==="v"){
                result.push(["Comm.",new treeNode("v",prop.right.left,new treeNode("v",prop.left,prop.right.right))]);
                result.push(["Comm.",new treeNode("v",prop.right.right,new treeNode("v",prop.left,prop.right.left))]);
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.right.right,prop.left),prop.right.left)]);
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.right.right,prop.right.left),prop.left)]);
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.right.left,prop.left),prop.right.right)]);
            } else if (prop.left.top==="v"){
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.left.left,prop.right),prop.left.right)]);
                result.push(["Comm.",new treeNode("v",new treeNode("v",prop.left.right,prop.right),prop.left.left)]);
                result.push(["Comm.",new treeNode("v",prop.right,new treeNode("v",prop.left.left,prop.left.right))]);
                result.push(["Comm.",new treeNode("v",prop.left.left,new treeNode("v",prop.right,prop.left.right))]);
                result.push(["Comm.",new treeNode("v",prop.left.right,new treeNode("v",prop.right,prop.left.left))]);
            }
            //MI
            result.push(["MI",new treeNode(">",new treeNode("~", undefined, prop.left),prop.right)]);
            result.push(["MI",new treeNode(">",new treeNode("~", undefined, prop.right),prop.left)]);
            //DISTRIB
            if (prop.left.top==="*" && prop.right.top==="*") {
                if (Tree.compare(prop.left.left,prop.right.left)){
                    result.push(["Distrib.",new treeNode("*",prop.left.left,new treeNode("v",prop.right.right,prop.left.right))]);
                } else if (Tree.compare(prop.left.left,prop.right.right)){
                    result.push(["Distrib.",new treeNode("*",prop.left.left,new treeNode("v",prop.right.left,prop.left.right))]);
                } else if (Tree.compare(prop.left.right,prop.right.left)){
                    result.push(["Distrib.",new treeNode("*",prop.left.right,new treeNode("v",prop.right.right,prop.left.left))]);
                } else if (Tree.compare(prop.left.right,prop.right.right)){
                    result.push(["Distrib.",new treeNode("*",prop.left.right,new treeNode("v",prop.right.left,prop.left.left))]);
                }
                //ME
                if (Tree.compare(new treeNode("~",undefined,prop.left.left),prop.right.left) || Tree.compare(prop.left.left,new treeNode("~",undefined,prop.right.left))) {
                    if (Tree.compare(new treeNode("~",undefined,prop.left.right),prop.right.right) || Tree.compare(prop.left.right,new treeNode("~",undefined,prop.right.right))){
                        result.push(["Truth Table Form",new treeNode("=",prop.left.left,prop.left.right)]);
                        result.push(["ME.",new treeNode("*",new treeNode(">",prop.left.left,prop.left.right),new treeNode(">",prop.left.right,prop.left.left))]);                            
                    }
                } else if (Tree.compare(new treeNode("~",undefined,prop.left.left),prop.right.right) || Tree.compare(prop.left.left,new treeNode("~",undefined,prop.right.right))) {
                    if (Tree.compare(new treeNode("~",undefined,prop.left.right),prop.right.left) || Tree.compare(prop.left.right,new treeNode("~",undefined,prop.right.left))){
                        result.push(["Truth Table Form",new treeNode("=",prop.left.left,prop.left.right)]);
                        result.push(["ME.",new treeNode("*",new treeNode(">",prop.left.left,prop.left.right),new treeNode(">",prop.left.right,prop.left.left))]);                           
                    }
                }
            }
            //DISTRIB
            else if (prop.right.top==="*") {
                result.push(["Distrib.",new treeNode("*", new treeNode("v", prop.left, prop.right.left), new treeNode("v", prop.left, prop.right.right))]);
            } else if (prop.left.top==="*") {
                result.push(["Distrib.",new treeNode("*", new treeNode("v", prop.right, prop.left.left), new treeNode("v", prop.right, prop.left.right))]);
            }
        } else if (prop.top==="*") {
            //Immediate Inferences
            if (prop.right.top==="TRUE"){
                result.push(["Immediate Inference",prop.left]);
            } else if (prop.left.top==="TRUE"){
                result.push(["Immediate Inference",prop.right]);
            }
            //Tautology
            if (Tree.compare(prop.left, prop.right)){
                result.push(["Tautology",prop.left]);              
            }
            //DISTRIB
            if (prop.left.top==="v" && prop.right.top==="v") {
                if (Tree.compare(prop.left.left,prop.right.left)){
                    result.push(["Distrib.",new treeNode("v",prop.left.left, new treeNode("*",prop.right.right,prop.left.right))]);
                } else if (Tree.compare(prop.left.left,prop.right.right)){
                    result.push(["Distrib.",new treeNode("v",prop.left.left, new treeNode("*",prop.right.left,prop.left.right))]);
                } else if (Tree.compare(prop.left.right,prop.right.left)){
                    result.push(["Distrib.",new treeNode("v",prop.left.right, new treeNode("*",prop.right.right,prop.left.left))]);
                } else if (Tree.compare(prop.left.right,prop.right.right)){
                    result.push(["Distrib.",new treeNode("v",prop.left.right, new treeNode("*",prop.right.left,prop.left.left))]);
                }
            }
            else if (prop.right.top==="v") {
                result.push(["Distrib.",new treeNode("v",new treeNode("*",prop.left,prop.right.left),new treeNode("*",prop.left,prop.right.right))]);
            } else if (prop.left.top==="v") {
                result.push(["Distrib.",new treeNode("v",new treeNode("*",prop.right,prop.left.left),new treeNode("*",prop.right,prop.left.right))]);
            }
            //ME
            if (prop.left.top===">" && prop.right.top===">") {
                if (Tree.compare(prop.left.left,prop.right.right) && Tree.compare(prop.left.right,prop.right.left)){
                    result.push(["ME.",new treeNode("=",prop.left.left,prop.right.left)]);
                    result.push(["Truth Table Form",new treeNode("v",new treeNode("*",prop.left.left,prop.right.left),new treeNode("*",new treeNode("~",undefined,prop.left.left), new treeNode("~",undefined,prop.right.left)))]);
                }
            }
        } else if (prop.top===">"){
            //Immediate Inferences
            if (prop.left.top==="TRUE"){
                result.push(["Immediate Inference",prop.right]);
            } else if (prop.right.top==="FALSE"){
                result.push(["Immediate Inference",new treeNode("~",undefined,prop.left)]);
            }
            //MI
            result.push(["MI",new treeNode("v",new treeNode("~", undefined, prop.left),prop.right)]);
            //TRANS
            result.push(["Trans.",new treeNode(">",new treeNode("~", undefined, prop.right),new treeNode("~", undefined, prop.left))]);
            if (prop.left.top==="*"){
                result.push(["Exp.",new treeNode(">",prop.left.left,new treeNode(">",prop.left.right,prop.right))]);
                result.push(["Exp.",new treeNode(">",prop.left.right,new treeNode(">",prop.left.left,prop.right))]);
            } else if (prop.right.top===">"){
                result.push(["Exp.",new treeNode(">", new treeNode("*",prop.left,prop.right.left),prop.right.right)]);
            }
        }
        //CONTINUE RECURSIVE LEFT
        if (prop.top!=="~"){
            resultRecursive = this.heuristicRecursive(prop.left, []);
            for (x=0;x<resultRecursive.length;x++){
                result.push([resultRecursive[x][0],new treeNode(prop.top, resultRecursive[x][1], prop.right)]);
            }
        }
        //CONTINUE RECURSIVE RIGHT
        resultRecursive = this.heuristicRecursive(prop.right, []);
        for (x=0;x<resultRecursive.length;x++){
            result.push([resultRecursive[x][0],new treeNode(prop.top, prop.left, resultRecursive[x][1])]);
        }
        return result;
    },

    // DeM.                 ~(A*B)==(~A|~B)
    //                      ~(A|B)==(~A*~B)
    deM: function(prop){
        var result = [];
        var root=prop[5];
        //TOP ACTION
        if (isOperand(root.top)) return false;
        if (root.top==="~"){
            if (root.right.top==="*"){
                if (this.addTransformedProp(new treeNode("v", new treeNode("~", undefined, root.right.left), new treeNode("~", undefined, root.right.right)), ["TD",[prop[0]]]))  return true;
            } 
            else if (root.right.top==="v"){
                if (this.addTransformedProp(new treeNode("*", new treeNode("~", undefined, root.right.left), new treeNode("~", undefined, root.right.right)), ["TD.",[prop[0]]]))  return true;
            }
        } 
        else if (root.top==="v"){
            if (this.addTransformedProp(new treeNode("~", undefined, new treeNode("*", new treeNode("~", undefined, root.left), new treeNode("~", undefined, root.right))), ["TE",[prop[0]]]))  return true;
        }
        else if (root.top==="*"){
            if (this.addTransformedProp(new treeNode("~", undefined, new treeNode("v", new treeNode("~", undefined, root.left), new treeNode("~", undefined, root.right))), ["TE",[prop[0]]]))  return true;
        }
        //START RECURSIVE LEFT
        if (root.top!=="~"){            
            result = this.deMRecursive(root.left, []);
            for (x=0;x<result.length;x++){
                if (this.addTransformedProp(new treeNode(root.top, result[x][1], root.right), [result[x][0],[prop[0]]]))  return true;
            }
        }
        //START RECURSIVE RIGHT
        result = this.deMRecursive(root.right, []);
        for (x=0;x<result.length;x++){
            if (this.addTransformedProp(new treeNode(root.top, root.left, result[x][1]), [result[x][0],[prop[0]]]))  return true;
        }
        return false;
    },

    deMRecursive: function(prop, result){
        var resultRecursive = [];
        var x;
        if (prop.top===undefined || isOperand(prop.top)) return result;
        //RECURSIVE ACTION
        if (prop.top==="~"){
            if (prop.right.top==="*"){
                result.push(["TD",new treeNode("v", new treeNode("~", undefined, prop.right.left), new treeNode("~", undefined, prop.right.right))]);
            } 
            else if (prop.right.top==="v"){
                result.push(["TD",new treeNode("*", new treeNode("~", undefined, prop.right.left), new treeNode("~", undefined, prop.right.right))]);
            }
        }
        else if (prop.top==="v"){
            result.push(["TE",new treeNode("~", undefined, new treeNode("*", new treeNode("~", undefined, prop.left), new treeNode("~", undefined, prop.right)))]);
        }
        else if (prop.top==="*"){
            result.push(["TE",new treeNode("~", undefined, new treeNode("v", new treeNode("~", undefined, prop.left), new treeNode("~", undefined, prop.right)))]);
        }
        //CONTINUE RECURSIVE LEFT
        if (prop.top!=="~"){
            resultRecursive = this.deMRecursive(prop.left, []);
            for (x=0;x<resultRecursive.length;x++){
                result.push([resultRecursive[x][0],new treeNode(prop.top, resultRecursive[x][1], prop.right)]);
            }
        }
        //CONTINUE RECURSIVE RIGHT
        resultRecursive = this.deMRecursive(prop.right, []);
        for (x=0;x<resultRecursive.length;x++){
            result.push([resultRecursive[x][0],new treeNode(prop.top, prop.left, resultRecursive[x][1])]);
        }
        return result;
    },

    removeDN: function(tree){
        if (tree.top===undefined || isOperand(tree.top)) return tree;
        if (tree.top==="~" && tree.right.top==="~"){
            tree = tree.right.right;
            if (tree.top===undefined || isOperand(tree.top)) return tree;
        }
        if (tree.top!=="~"){
            tree.left = this.removeDN(tree.left);
        }
        tree.right = this.removeDN(tree.right);
        return tree;
    },

    convertNonTruth: function(tree){
        if (tree.top===undefined || isOperand(tree.top)) return tree;
        if (tree.top==="~"){
            if (tree.right.top==="FALSE"){
                tree.top="TRUE";
                return tree;
            } 
            else if (tree.right.top==="TRUE"){
                tree.top="FALSE";
                return tree;
            }
        }
        if (tree.top!=="~"){
            tree.left = this.convertNonTruth(tree.left);
        }
        tree.right = this.convertNonTruth(tree.right);
        return tree;
    },

    truthReplacement: function(prop){
        var result=[];
        var root=prop[5];
        if (isOperand(root.top)) return false;
        //TOP ACTION
        if (root.top==="*"){
            if (Tree.compare(new treeNode("~",undefined,root.left),root.right) || Tree.compare(root.left,new treeNode("~",undefined,root.right))){
                prop[7]=true;
                if (this.addTransformedProp(new treeNode("FALSE"), ["Consistency",[prop[0]]])) return true;                
            }
        }
        if (root.top==="v"){
            if (Tree.compare(new treeNode("~",undefined,root.left),root.right) || Tree.compare(root.left,new treeNode("~",undefined,root.right))){
                prop[7]=true;
                if (this.addTransformedProp(new treeNode("TRUE"), ["Exluded Middle",[prop[0]]])) return true;                                            
            }
        }
        //START RECURSIVE LEFT
        if (root.top!=="~"){            
            result = this.truthReplacementRecursive(root.left, []);
            for (x=0;x<result.length;x++){
                prop[7]=true;
                if (this.addTransformedProp(new treeNode(root.top, result[x][1], root.right), [result[x][0],[prop[0]]]))  return true;
            }
        }
        //START RECURSIVE RIGHT
        result = this.truthReplacementRecursive(root.right, []);
        for (x=0;x<result.length;x++){
            prop[7]=true;
            if (this.addTransformedProp(new treeNode(root.top, root.left, result[x][1]), [result[x][0],[prop[0]]]))  return true;
        }
        return false;
    },

    truthReplacementRecursive: function(tree, result){
        var resultRecursive = [];
        var x;
        if (tree.top===undefined || isOperand(tree.top)) return result;
        //RECURSIVE ACTION
        if (tree.top==="*"){
            if (Tree.compare(new treeNode("~",undefined,tree.left),tree.right) || Tree.compare(tree.left,new treeNode("~",undefined,tree.right))){
                result.push(["Consistency",new treeNode("FALSE")]);              
            }
        }
        if (tree.top==="v"){
            if (Tree.compare(new treeNode("~",undefined,tree.left),tree.right) || Tree.compare(tree.left,new treeNode("~",undefined,tree.right))){
                result.push(["Exluded Middle",new treeNode("TRUE")]);                                            
            }
        }
        //CONTINUE RECURSIVE LEFT
        if (tree.top!=="~"){
            resultRecursive = this.truthReplacementRecursive(tree.left, []);
            for (x=0;x<resultRecursive.length;x++){
                result.push([resultRecursive[x][0],new treeNode(tree.top, resultRecursive[x][1], tree.right)]);
            }
        }
        //CONTINUE RECURSIVE RIGHT
        resultRecursive = this.truthReplacementRecursive(tree.right, []);
        for (x=0;x<resultRecursive.length;x++){
            result.push([resultRecursive[x][0],new treeNode(tree.top, tree.left, resultRecursive[x][1])]);
        }
        return result;
    },

    inferenceRules: function(prop){
        var root = prop[5];        
        if (root.top===undefined || isOperand(root.top)) return false;
        for (var i=0;i<props.length;i++){
            if (prop[0]===props[i][0]){}
            else if (root.top==="v"){
                //DS
                if (Tree.compare(new treeNode("~",undefined,root.right),props[i][5]) || Tree.compare(root.right,new treeNode("~",undefined,props[i][5]))) {
                    if (this.addTransformedProp(root.left, ["DS",[prop[0],props[i][0]]])) return true;
                } else if (Tree.compare(new treeNode("~",undefined,root.left),props[i][5]) || Tree.compare(root.left,new treeNode("~",undefined,props[i][5]))) {
                    if (this.addTransformedProp(root.right, ["DS",[prop[0],props[i][0]]])) return true;
                }
                //Conj
                if (props[i][5].top==="v"){
                    if (Tree.compare(root.left,props[i][5].left) || Tree.compare(root.left,props[i][5].right) || Tree.compare(root.right,props[i][5].left) || Tree.compare(root.right,props[i][5].right)){
                        if (this.addTransformedProp(new treeNode("*", root, props[i][5]), ["Conj.",[prop[0],props[i][0]]])) return true;
                    } else return false;
                }
            } else if (root.top==="*" && root.left.top===">" && root.right.top===">") {
                //CD
                var tempProp = new treeNode("v",root.left.left,root.right.left);
                for (i=0;i<props.length;i++){
                    if (props[i][5].top==="v"){
                        if (Tree.compare(props[i][5],tempProp)){
                            if (this.addTransformedProp(new treeNode("v",root.left.right,root.right.right), ["CD",[prop[0],props[i][0]]])) return true;                    
                        }
                    }
                }
            } else if (root.top===">"){
                //MP
                if (Tree.compare(root.left,props[i][5])){
                    if (this.addTransformedProp(root.right, ["MP",[prop[0],props[i][0]]])) return true;
                }
                //MT
                if (Tree.compare(new treeNode("~",undefined,root.right),props[i][5]) || Tree.compare(root.right,new treeNode("~",undefined,props[i][5]))) {
                    if (this.addTransformedProp(new treeNode("~",undefined,root.left), ["MT",[prop[0],props[i][0]]])) return true;        
                }
                //HS
                if (props[i][5].top===">"){
                    if (Tree.compare(root.right,props[i][5].left)) {
                        if (this.addTransformedProp(new treeNode(">",root.left,props[i][5].right), ["HS",[prop[0],props[i][0]]])) return true;
                    }
                    if (Tree.compare(root.left,props[i][5].right)) {
                        if (this.addTransformedProp(new treeNode(">",props[i][5].left,root.right), ["HS",[prop[0],props[i][0]]])) return true;
                    }
                    for (var j=0;j<props.length;j++){
                        if (prop[2][1][0]!==props[j][0]){
                            if (props[j][5].top==="v"){
                                if (Tree.compare(props[j][5].left,root.left)){
                                    if (Tree.compare(props[j][5].right,props[i][5].left)){
                                        if (this.addTransformedProp(new treeNode("*", root, props[i][5]), ["Conj.",[prop[0],props[i][0]]])) return true;
                                        if (props[props.length-1][2]===["Conj.",[prop[0],props[i][0]]]) {
                                            if (this.addTransformedProp(new treeNode("v", root.right, props[i][5].right), ["CD",[props[props.length-1][0],props[j][0]]])) return true;
                                        }
                                    }                                
                                } else if (Tree.compare(props[j][5].left,props[i][5].left)){
                                    if (Tree.compare(props[j][5].right,root.left)){
                                        if (this.addTransformedProp(new treeNode("*", root, props[i][5]), ["Conj.",[prop[0],props[i][0]]])) return true;
                                        if (props[props.length-1][2]===["Conj.",[prop[0],props[i][0]]]) {
                                            if (this.addTransformedProp(new treeNode("v", root.right, props[i][5].right), ["CD",[props[props.length-1][0],props[j][0]]])) return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } 
        return false;
    },

    aDd: function(prop){
        var i;
        var root = prop[5];
        if (isOperand(root.top)) return false;
        if (root.top===">") {
            for (i=0;i<props.length;i++){
                if (root.left.top==="v") {
                    if (Tree.compare(props[i][5],root.left.left)){
                        if (this.addTransformedProp(new treeNode("v",props[i][5],root.left.right),["Add.",[props[i][0]]])) return true;
                        if (this.inferenceRules(prop)) return true;
                    } else if (Tree.compare(props[i][5],root.left.right)){
                        if (this.addTransformedProp(new treeNode("v",props[i][5],root.left.left),["Add.",[props[i][0]]])) return true;
                        if (this.inferenceRules(prop)) return true;
                    }
                } if (root.right.top==="*") {
                    if (Tree.compare(new treeNode("~",undefined,props[i][5]),root.right.left) || Tree.compare(props[i][5],new treeNode("~",undefined,root.right.left))) {
                        if (this.addTransformedProp(new treeNode("v",new treeNode("~",undefined,root.right.right),props[i][5]),["Add.",[props[i][0]]])) return true;
                        if (this.deM(props[props.length-1])) return true;
                        if (this.inferenceRules(prop)) return true;
                    } else if (Tree.compare(new treeNode("~",undefined,props[i][5]),root.right.right) || Tree.compare(props[i][5],new treeNode("~",undefined,root.right.right))){
                        if (this.addTransformedProp(new treeNode("v",new treeNode("~",undefined,root.right.left),props[i][5]),["Add.",[props[i][0]]])) return true;
                        if (this.deM(props[props.length-1])) return true;
                        if (this.inferenceRules(prop)) return true;
                    }
                }
            }
        }
    },
//END INFERENCE RULES
//SEPCIAL DISJUNCT RULE
    allOperatorsAreDisjuncts: function(tree){
        if (isOperand(tree.top)) return true;
        else if (tree.top==="~"){
            if (isOperand(tree.right.top)) return true;
        } 
        else if (tree.top==="v"){
            if (!allOperatorsAreDisjuncts(tree.left)) return false;
            if (!allOperatorsAreDisjuncts(tree.right)) return false;
        } 
        else return false;
        return true;
    },

    isSolved: function(){
        var newlyAddedProp = props[props.length-1];
        for (var i=0;i<concs.length;i++){
            if (Tree.compare(newlyAddedProp[5],concs[i][5])){
                newlyAddedProp[6]=1;
                if (!BackwardsSolver.solved(concs[i][2])) return false;
                console.log("*****************ARGUMENT SOLVED****************");
                return true;
            } 
            else if (concs[i][5].top==="v"){
                if (Tree.compare(newlyAddedProp[5],concs[i][5].left || Tree.compare(newlyAddedProp[5],concs[i][5].right))){
                    newlyAddedProp[6]=1;
                    newlyAddedProp = [props.length+1,concs[i][1],["Add.",[props.length]],undefined,undefined,concs[i][5],1,undefined];
                    props.push(newlyAddedProp);
                    if (!BackwardsSolver.solved(concs[i][2])) return false;
                    console.log("*****************ARGUMENT SOLVED****************");
                    return true;
                }
            }
        }
        return false;
    },

    addTransformedProp: function(tree, trans) {
        tree = this.removeDN(tree);
        tree = this.convertNonTruth(tree);
        // tree = this.removeTautology(tree);
        var propInfix = Tree.treeToInfix(tree);
        if (propInfix.length>27) return false;
        if ((propInfix.split("~").length-1)>4) return false;
        for (var i=0;i<props.length;i++){
            if (propInfix==props[i][1]) return false;
        }
        if (trans[1].length==2){
            console.log("Added Prop using "+trans[0]+": "+props[trans[1][0]-1][1]+" & "+props[trans[1][1]-1][1]+" -> "+propInfix);
            props[trans[1][0]-1][6]+=1;
            props[trans[1][1]-1][6]+=1;
        } else {
            console.log("Added Prop using "+trans[0]+": "+props[trans[1][0]-1][1]+" -> "+propInfix);
            props[trans[1][0]-1][6]+=1;
        }
        props.push([props.length+1, propInfix, trans, undefined, undefined, tree,0,false]);
        if (this.truthReplacement(props[props.length-1])) return true;
        if (this.isSolved()) return true;
        else return false;        
    }

}; // END OF SOLVER OBJECT

/********************************
**********BACKWARDS SOLVER**********
*********************************/

var BackwardsSolver = {
    solve: function() {
        console.log("\n**********Building Conclusion Array**********");
//IDEALLY SHOULD USE WHILE LOOP, BUT WILL USE 10 LOOPS FOR TESTING        
        for (var i=0; i<13;i++){
            if (this.heuristic()) return true;
            if (concs.length>4000) break;
        }
        // Cleaner.removeZeros(concs);
        return false;
    },

    solved: function(trans){
        if (trans[0]==="Given Conclusion") return true;
        var conc1 = concs[trans[1][0]-1].slice(); //Retrieve conclusion1 and store in conc1
        var newTrans = conc1[2].slice();
        if (trans[0]==="MP"){
            Solver.addTransformedProp(new treeNode("v",conc1[5].right,new treeNode("~",undefined,conc1[5].left)),["Add.",[props[props.length-1][0]]]);
            props[props.length-1][6]=1;
            conc1[2] = ["MI",[props.length]];
        }
        else if (trans[0]==="MT"){
            Solver.addTransformedProp(new treeNode("v",new treeNode("~",undefined,conc1[5].left),conc1[5].right),["Add.",[props[props.length-1][0]]]);
            props[props.length-1][6]=1;
            conc1[2] = ["MI",[props.length]];
        }
        else if (trans[0]==="DS"){
            conc1[2] = ["Add.",[props.length]];
        }
        else if (trans[0]==="TE"){
            conc1[2] = ["TD",[props.length]];
        }
        else if (trans[0]==="TD"){
            conc1[2] = ["TE",[props.length]];
        }
        else if (trans[0]==="Simp."){
            var newTransProps=[];
            var haveLeft = (conc1[5].left.top==="TRUE")? true: false;
            var haveRight = (conc1[5].right.top==="TRUE")? true: false;
            for (var i=0;i<props.length;i++){
                if (haveLeft===false && Tree.compare(conc1[5].left,props[i][5])){
                    newTransProps.push(i+1);
                    haveLeft=true;
                }
                if (haveRight===false && Tree.compare(conc1[5].right,props[i][5])){
                    newTransProps.push(i+1);
                    haveRight=true;
                }
            }
            if (haveLeft && haveRight){
                conc1[2] = ["Conj.",newTransProps];
            } else return false;
        }
        else { //ME, Trans., Distrib., Exp., Truth Table Form
            conc1[2] = [trans[0],[props.length]];
        }
        conc1[0] = props.length+1; //Change index of conc, to last index of props
        conc1[6]=1;
        props.push(conc1);
        if (this.solved(newTrans)) return true;
        return false;
    },

    heuristic: function() {
        //RULES IN HEURISTICAL ORDER, BRUTE FORCE
        var i;
        var concsLength = concs.length;
        //Inference rules
        for (i = 0; i < concsLength; i++) {
            if (concs[i][7]!==true){
                concs[i][7]=true;
                var result = [];
                root = concs[i][5];
                if (isOperator(root.top)){
                    //TOP ACTION
                    if (root.top==="="){
                        //ME
                        if (this.addTransformedConc(new treeNode("*",new treeNode(">",root.left,root.right),new treeNode(">",root.right,root.left)), ["ME",[concs[i][0]]])) return true;                            
                        if (this.addTransformedConc(new treeNode("v",new treeNode("*",root.left,root.right),new treeNode("*",new treeNode("~",undefined,root.left), new treeNode("~",undefined,root.right))), ["Truth Table Form",[concs[i][0]]])) return true;
                    }
                    else if (root.top==="v") {
                        //Immediate Inferences
                        if (root.right.top==="FALSE"){
                            if (this.addTransformedConc(root.left, ["Immediate Inference",[concs[i][0]]])) return true;
                        } else if (root.left.top==="FALSE"){
                            if (this.addTransformedConc(root.right, ["Immediate Inference",[concs[i][0]]])) return true;
                        }                        
                        //Tautology
                        if (Tree.compare(root.left, root.right)){
                            if (this.addTransformedConc(root.left, ["Tautology",[concs[i][0]]])) return true;                
                        }
                        //DISTRIB
                        if (root.left.top==="*" && root.right.top==="*") {
                            if (Tree.compare(root.left.left,root.right.left)){
                                if (this.addTransformedConc(new treeNode("*",root.left.left,new treeNode("v",root.right.right,root.left.right)), ["Distrib.",[concs[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.left,root.right.right)){
                                if (this.addTransformedConc(new treeNode("*",root.left.left,new treeNode("v",root.right.left,root.left.right)), ["Distrib.",[concs[i][0]]])) return true;               
                            } else if (Tree.compare(root.left.right,root.right.left)){
                                if (this.addTransformedConc(new treeNode("*",root.left.right,new treeNode("v",root.right.right,root.left.left)), ["Distrib.",[concs[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.right,root.right.right)){
                                if (this.addTransformedConc(new treeNode("*",root.left.right,new treeNode("v",root.right.left,root.left.left)), ["Distrib.",[concs[i][0]]])) return true;                
                            }
                            //ME
                            if (Tree.compare(new treeNode("~",undefined,root.left.left),root.right.left) || Tree.compare(root.left.left,new treeNode("~",undefined,root.right.left))) {
                                if (Tree.compare(new treeNode("~",undefined,root.left.right),root.right.right) || Tree.compare(root.left.right,new treeNode("~",undefined,root.right.right))){
                                    if (this.addTransformedConc(new treeNode("=",root.left.left,root.left.right), ["Truth Table Form",[concs[i][0]]])) return true;
                                    if (this.addTransformedConc(new treeNode("*",new treeNode(">",root.left.left,root.left.right),new treeNode(">",root.left.right,root.left.left)), ["ME",[concs[i][0]]])) return true;                            
                                }
                            } else if (Tree.compare(new treeNode("~",undefined,root.left.left),root.right.right) || Tree.compare(root.left.left,new treeNode("~",undefined,root.right.right))) {
                                if (Tree.compare(new treeNode("~",undefined,root.left.right),root.right.left) || Tree.compare(root.left.right,new treeNode("~",undefined,root.right.left))){
                                    if (this.addTransformedConc(new treeNode("=",root.left.left,root.left.right), ["Truth Table Form",[concs[i][0]]])) return true;
                                    if (this.addTransformedConc(new treeNode("*",new treeNode(">",root.left.left,root.left.right),new treeNode(">",root.left.right,root.left.left)), ["ME",[concs[i][0]]])) return true;                            
                                }
                            }
                        }
                        //DISTRIB
                        else if (root.right.top==="*") {
                            if (this.addTransformedConc(new treeNode("*", new treeNode("v", root.left, root.right.left), new treeNode("v", root.left, root.right.right)), ["Distrib.",[concs[i][0]]])) return true;
                        } else if (root.left.top==="*") {
                            if (this.addTransformedConc(new treeNode("*", new treeNode("v", root.right, root.left.left), new treeNode("v", root.right, root.left.right)), ["Distrib.",[concs[i][0]]])) return true;
                        }
                        //MI
                        if (this.addTransformedConc(new treeNode(">",new treeNode("~", undefined, root.left),root.right), ["MI",[concs[i][0]]])) return true;
                        if (this.addTransformedConc(new treeNode(">",new treeNode("~", undefined, root.right),root.left), ["MI",[concs[i][0]]])) return true;
                        //Comm
                        if (this.addTransformedConc(new treeNode(root.top,root.right,root.left), ["Comm.",[concs[i][0]]])) return true;
                        if (root.right.top==="v" && root.left.top==="v"){
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.left.left,root.left.right),new treeNode("v",root.right.left,root.right.left)),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.left.left,root.right.left),new treeNode("v",root.left.right,root.right.left)),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.left.left,root.right.left),new treeNode("v",root.left.right,root.right.left)),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.left.right,root.right.left),new treeNode("v",root.right.left,root.left.left)),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.left.right,root.right.left),new treeNode("v",root.left.left,root.right.left)),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.right.left,root.right.left),new treeNode("v",root.left.left,root.left.right)),["Comm.",[concs[i][0]]])) return true;                           
                        }
                        if (root.right.top==="v"){
                            if (this.addTransformedConc(new treeNode("v",root.right.left,new treeNode("v",root.left,root.right.right)),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",root.right.right,new treeNode("v",root.left,root.right.left)),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.right.right,root.left),root.right.left),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.right.right,root.right.left),root.left),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.right.left,root.left),root.right.right),["Comm.",[concs[i][0]]])) return true;
                        } else if (root.left.top==="v"){
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.left.left,root.right),root.left.right),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",new treeNode("v",root.left.right,root.right),root.left.left),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",root.right,new treeNode("v",root.left.left,root.left.right)),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",root.left.left,new treeNode("v",root.right,root.left.right)),["Comm.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode("v",root.left.right,new treeNode("v",root.right,root.left.left)),["Comm.",[concs[i][0]]])) return true;
                        }
                    }
                    else if (root.top==="*"){
                        //Immediate Inferences
                        if (root.right.top==="TRUE"){
                            if (this.addTransformedConc(root.left, ["Immediate Inference",[concs[i][0]]])) return true;
                        } else if (root.left.top==="TRUE"){
                            if (this.addTransformedConc(root.right, ["Immediate Inference",[concs[i][0]]])) return true;
                        }
                        //Tautology
                        if (Tree.compare(root.left, root.right)){
                            if (this.addTransformedConc(root.left, ["Tautology",[concs[i][0]]])) return true;                
                        }
                        //SIMP
                        if (this.addTransformedConc(root.left, ["Simp.",[concs[i][0]]])) return true;
                        if (this.addTransformedConc(root.right, ["Simp.",[concs[i][0]]])) return true;
                        //DISTRIB
                        if (root.left.top==="v" && root.right.top==="v") {
                            if (Tree.compare(root.left.left,root.right.left)){
                                if (this.addTransformedConc(new treeNode("v",root.left.left, new treeNode("*",root.right.right,root.left.right)), ["Distrib.",[concs[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.left,root.right.right)){
                                if (this.addTransformedConc(new treeNode("v",root.left.left, new treeNode("*",root.right.left,root.left.right)), ["Distrib.",[concs[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.right,root.right.left)){
                                if (this.addTransformedConc(new treeNode("v",root.left.right, new treeNode("*",root.right.right,root.left.left)), ["Distrib.",[concs[i][0]]])) return true;                
                            } else if (Tree.compare(root.left.right,root.right.right)){
                                if (this.addTransformedConc(new treeNode("v",root.left.right, new treeNode("*",root.right.left,root.left.left)), ["Distrib.",[concs[i][0]]])) return true; 
                            }
                        }
                        else if (root.right.top==="v") {
                            if (this.addTransformedConc(new treeNode("v",new treeNode("*",root.left,root.right.left),new treeNode("*",root.left,root.right.right)), ["Distrib.",[concs[i][0]]])) return true;
                        } else if (root.left.top==="v") {
                            if (this.addTransformedConc(new treeNode("v",new treeNode("*",root.right,root.left.left),new treeNode("*",root.right,root.left.right)), ["Distrib.",[concs[i][0]]])) return true;
                        }
                        //ME
                        if (root.left.top===">" && root.right.top===">") {
                            if (Tree.compare(root.left.left,root.right.right) && Tree.compare(root.left.right,root.right.left)){
                                if (this.addTransformedConc(new treeNode("=",root.left.left,root.right.left), ["ME",[concs[i][0]]]))  return true;
                                if (this.addTransformedConc(new treeNode("v",new treeNode("*",root.left.left,root.right.left),new treeNode("*",new treeNode("~",undefined,root.left.left), new treeNode("~",undefined,root.right.left))), ["Truth Table Form",[concs[i][0]]]))  return true;
                            } else if (Tree.compare(root.left.right,root.right.left) && Tree.compare(root.left.left,root.right.right)){
                                if (this.addTransformedConc(new treeNode("=",root.left.left,root.right.left), ["ME",[concs[i][0]]]))  return true;
                                if (this.addTransformedConc(new treeNode("v",new treeNode("*",root.left.left,root.right.left),new treeNode("*",new treeNode("~",undefined,root.left.left), new treeNode("~",undefined,root.right.left))), ["Truth Table Form",[concs[i][0]]]))  return true;
                            }
                        }                
                    }
                    else if (root.top===">"){
                        //Immediate Inferences
                        if (root.left.top==="TRUE"){
                            if (this.addTransformedConc(root.right, ["Immediate Inference",[concs[i][0]]])) return true;
                        } else if (root.right.top==="FALSE"){
                            if (this.addTransformedConc(new treeNode("~",undefined,root.left), ["Immediate Inference",[concs[i][0]]])) return true;
                        }
                        //EXP
                        if (root.left.top==="*"){
                            if (this.addTransformedConc(new treeNode(">",root.left.left,new treeNode(">",root.left.right,root.right)), ["Exp.",[concs[i][0]]])) return true;
                            if (this.addTransformedConc(new treeNode(">",root.left.right,new treeNode(">",root.left.left,root.right)), ["Exp.",[concs[i][0]]])) return true;                                            
                        } else if (root.right.top===">"){
                            if (this.addTransformedConc(new treeNode(">", new treeNode("*",root.left,root.right.left),root.right.right), ["Exp.",[concs[i][0]]])) return true;                                                                
                        }
                        //ABS
                        if (root.right==="*"){
                            if (Tree.compare(root.right.left,root.left)){
                                if (this.addTransformedConc(new treeNode(">",root.left,root.right.right),["Abs.",[concs[i][0]]])) return true;
                            }
                        }
                        //MI
                        if (this.addTransformedConc(new treeNode("v",new treeNode("~", undefined, root.left),root.right), ["MI",[concs[i][0]]])) return true;
                        //TRANS
                        if (this.addTransformedConc(new treeNode(">",new treeNode("~", undefined, root.right),new treeNode("~", undefined, root.left)), ["Trans.",[concs[i][0]]])) return true;
                    }
//************* ENTER RECURSIVE FUNCTIONS *****************
                    //START RECURSIVE LEFT
                    if (root.top!=="~"){            
                        result = Solver.heuristicRecursive(root.left, []);
                        for (x=0;x<result.length;x++){
                            if (this.addTransformedConc(new treeNode(root.top, result[x][1], root.right), [result[x][0],[concs[i][0]]])) return true;
                        }
                    }
                    //START RECURSIVE RIGHT
                    result = Solver.heuristicRecursive(root.right, []);
                    for (x=0;x<result.length;x++){
                        if (this.addTransformedConc(new treeNode(root.top, root.left, result[x][1]), [result[x][0],[concs[i][0]]])) return true;
                    }
                }
            }
// ********** END RECURSIVE FUNCTIONS ***********
//CANT DO HS BECAUSE TOO DIFFICULT TO CHECK IN BACKWARDS CHECKER                    
            // if (this.hS(concs[i])) return true;
            if (this.inferenceRules(concs[i])) return true;
            if (this.deM(concs[i])) return true;
//CANT DO CD BECAUSE TOO DIFFICULT TO CHECK IN BACKWARDS CHECKER                    
            // if (this.cD(concs[i])) return true;
        if (concs.length>3000) return false;
        }
        // if (count>5){
        //     for (i = 0; i < concsLength; i++) {
//Conj is useless backwards, and Add is impossible
                // if (this.conj(concs[i])) return true;
        //     }
        // }
        return false;
    },

    truthReplacement: function(conc){
        var result=[];
        var root=conc[5];
        //TOP ACTION
        if (isOperand(root.top)) return false;
        if (root.top==="*"){
            if (Tree.compare(new treeNode("~",undefined,root.left),root.right) || Tree.compare(root.left,new treeNode("~",undefined,root.right))){
                prop[7]=true;
                if (this.addTransformedConc(new treeNode("FALSE"), ["Consistency",[conc[0]]])) return true;                
            }
        }
        if (root.top==="v"){
            if (Tree.compare(new treeNode("~",undefined,root.left),root.right) || Tree.compare(root.left,new treeNode("~",undefined,root.right))){
                conc[7]=true;        
                if (this.addTransformedConc(new treeNode("TRUE"), ["Exluded Middle",[conc[0]]])) return true;
            }
        }
        //START RECURSIVE LEFT
        if (root.top!=="~"){            
            result = Solver.truthReplacementRecursive(root.left, []);
            for (x=0;x<result.length;x++){
                conc[7]=true;
                if (this.addTransformedConc(new treeNode(root.top, result[x][1], root.right), [result[x][0],[conc[0]]]))  return true;
            }
        }
        //START RECURSIVE RIGHT
        result = Solver.truthReplacementRecursive(root.right, []);
        for (x=0;x<result.length;x++){
            conc[7]=true;
            if (this.addTransformedConc(new treeNode(root.top, root.left, result[x][1]), [result[x][0],[conc[0]]]))  return true;
        }
        return false;
    },

    inferenceRules: function(conc){
        var root=conc[5];
        if (root.top===undefined || isOperand(root.top)) return false;
        for (var i=0;i<concs.length;i++){
            if (conc[0]===concs[i][0]){}
            else if (root.top==="v"){
                if (Tree.compare(new treeNode("~",undefined,root.right),concs[i][5]) || Tree.compare(root.right,new treeNode("~",undefined,concs[i][5]))) {
                    if (this.addTransformedConc(root.left, ["DS",[conc[0],concs[i][0]]])) return true;
                } else if (Tree.compare(new treeNode("~",undefined,root.left),concs[i][5]) || Tree.compare(root.left,new treeNode("~",undefined,concs[i][5]))) {
                    if (this.addTransformedConc(root.right, ["DS",[conc[0],concs[i][0]]])) return true;
                }
            } else if (root.top===">"){
                if (Tree.compare(root.left,concs[i][5])){
                    if (this.addTransformedConc(root.right, ["MP",[conc[0],concs[i][0]]])) return true;
                }
                if (Tree.compare(new treeNode("~",undefined,root.right),concs[i][5]) || Tree.compare(root.right,new treeNode("~",undefined,concs[i][5]))) {
                    if (this.addTransformedConc(new treeNode("~",undefined,root.left), ["MT",[conc[0],concs[i][0]]])) return true;        
                }
            }
        } 
        return false;
    },

    // DeM.                 ~(A*B)==(~A|~B)
    //                      ~(A|B)==(~A*~B)
    deM: function(conc){
        var result = [];
        var root=conc[5];
        //TOP ACTION
        if (root.top===undefined || isOperand(root.top)) return false;
        if (root.top==="~"){
            if (root.right.top==="*"){
                if (this.addTransformedConc(new treeNode("v", new treeNode("~", undefined, root.right.left), new treeNode("~", undefined, root.right.right)), ["TD",[conc[0]]]))  return true;
            } 
            else if (root.right.top==="v"){
                if (this.addTransformedConc(new treeNode("*", new treeNode("~", undefined, root.right.left), new treeNode("~", undefined, root.right.right)), ["TD.",[conc[0]]]))  return true;
            }
        } 
        else if (root.top==="v"){
            if (this.addTransformedConc(new treeNode("~", undefined, new treeNode("*", new treeNode("~", undefined, root.left), new treeNode("~", undefined, root.right))), ["TE",[conc[0]]]))  return true;
        }
        else if (root.top==="*"){
            if (this.addTransformedConc(new treeNode("~", undefined, new treeNode("v", new treeNode("~", undefined, root.left), new treeNode("~", undefined, root.right))), ["TE",[conc[0]]]))  return true;
        }
        //START RECURSIVE LEFT
        if (root.top!=="~"){            
            result = this.deMRecursive(root.left, []);
            for (x=0;x<result.length;x++){
                if (this.addTransformedConc(new treeNode(root.top, result[x][1], root.right), [result[x][0],[conc[0]]]))  return true;
            }
        }
        //START RECURSIVE RIGHT
        result = this.deMRecursive(root.right, []);
        for (x=0;x<result.length;x++){
            if (this.addTransformedConc(new treeNode(root.top, root.left, result[x][1]), [result[x][0],[conc[0]]]))  return true;
        }
        return false;
    },

    deMRecursive: function(conc, result){
        var resultRecursive = [];
        var x;
        if (conc.top===undefined || isOperand(conc.top)) return result;
        //RECURSIVE ACTION
        if (conc.top==="~"){
            if (conc.right.top==="*"){
                result.push(["TD",new treeNode("v", new treeNode("~", undefined, conc.right.left), new treeNode("~", undefined, conc.right.right))]);
                // console.log("applied DeM on: "+Tree.treeToInfix(conc)+" -> "+Tree.treeToInfix(result[result.length-1]));
            } 
            else if (conc.right.top==="v"){
                result.push(["TD",new treeNode("*", new treeNode("~", undefined, conc.right.left), new treeNode("~", undefined, conc.right.right))]);
                // console.log("applied DeM on: "+Tree.treeToInfix(conc)+" -> "+Tree.treeToInfix(result[result.length-1]));
            }
        } 
        else if (conc.top==="v"){
            result.push(["TE",new treeNode("~", undefined, new treeNode("*", new treeNode("~", undefined, conc.left), new treeNode("~", undefined, conc.right)))]);
            // console.log("applied DeM on: "+Tree.treeToInfix(conc)+" -> "+Tree.treeToInfix(result[result.length-1]));
        }
        else if (conc.top==="*"){
            result.push(["TE",new treeNode("~", undefined, new treeNode("v", new treeNode("~", undefined, conc.left), new treeNode("~", undefined, conc.right)))]);
            // console.log("applied DeM on: "+Tree.treeToInfix(conc)+" -> "+Tree.treeToInfix(result[result.length-1]));
        }
        //CONTINUE RECURSIVE LEFT
        if (conc.top!=="~"){
            resultRecursive = this.deMRecursive(conc.left, []);
            for (x=0;x<resultRecursive.length;x++){
                result.push([resultRecursive[x][0],new treeNode(conc.top, resultRecursive[x][1], conc.right)]);
            }
        }
        //CONTINUE RECURSIVE RIGHT
        resultRecursive = this.deMRecursive(conc.right, []);
        for (x=0;x<resultRecursive.length;x++){
            result.push([resultRecursive[x][0],new treeNode(conc.top, conc.left, resultRecursive[x][1])]);
        }
        return result;
    },

    aDd: function(conc){
        var i;
        root = conc[5];
        if (isOperand(root.top)) return false;
        if (root.top===">") {
            if (root.left.top==="v") {
                for (i=0;i<concs.length;i++){
                    if (Tree.compare(concs[i][5],root.left.left)){
                        if (this.addTransformedConc(new treeNode("v",concs[i][5],root.left.right),["Add.",[concs[i][0]]])) return true;
                        if (this.inferenceRules(conc)) return true;
                    } else if (Tree.compare(concs[i][5],root.left.right)){
                        if (this.addTransformedConc(new treeNode("v",concs[i][5],root.left.left),["Add.",[concs[i][0]]])) return true;
                        if (this.inferenceRules(conc)) return true;
                    }
                }
            }
        } else if (root.top===">") {
            if (root.right.top==="*") {
                for (i=0;i<concs.length;i++){
                    if (Tree.compare(new treeNode("~",undefined,concs[i][5]),root.right.left) || Tree.compare(concs[i][5],new treeNode("~",undefined,root.right.left))) {
                        if (this.addTransformedConc(new treeNode("v",new treeNode("~",undefined,root.right.right),concs[i][5]),["Add.",[concs[i][0]]])) return true;
                        if (concs[concs.length-1][2]===["Add.",[concs[i][0]]]) {
                            if (deM(concs[concs.length-1])) return true;
                            if (this.inferenceRules(conc)) return true;                            
                        }
                    } else if (Tree.compare(new treeNode("~",undefined,concs[i][5]),root.right.right) || Tree.compare(concs[i][5],new treeNode("~",undefined,root.right.right))){
                        if (this.addTransformedConc(new treeNode("v",new treeNode("~",undefined,root.right.left),concs[i][5]),["Add.",[concs[i][0]]])) return true;
                        if (concs[concs.length-1][2]===["Add.",[concs[i][0]]]) {
                            if (this.deM(concs[concs.length-1])) return true;
                            if (this.inferenceRules(conc)) return true;
                        }
                    }
                }
            }
        }
    },

//END INFERENCE RULES

    isSolved: function(){
        for (var i=0;i<props.length;i++){
            if (Tree.compare(concs[concs.length-1][5],props[i][5])){
                console.log("*****************ARGUMENT SOLVED****************");
                if (this.solved(concs[concs.length-1][2])) return true;
                return true;
            }
        }
        return false;
    },

    addTransformedConc: function(tree, trans) {
        tree = Solver.removeDN(tree);
        tree = Solver.convertNonTruth(tree);
        var concInfix = Tree.treeToInfix(tree);
        if (concInfix.length>27) return false;
        if ((concInfix.split("~").length-1)>4) return false;        
        for (var i=0;i<concs.length;i++){
            if (concInfix==concs[i][1]) return false;
        }
        if (trans[1].length==2){
            console.log("Added Conc using "+trans[0]+": "+concs[trans[1][0]-1][1]+" & "+concs[trans[1][1]-1][1]+" -> "+concInfix);
        } else {
            console.log("Added Conc using "+trans[0]+": "+concs[trans[1][0]-1][1]+" -> "+concInfix);
        }
        concs.push([concs.length+1,concInfix,trans,undefined,undefined,tree,0,false,undefined]);
        if (this.truthReplacement(concs[concs.length-1])) return true;        
        // if (this.isSolved()) return true;
        return false;
    }

}; // END OF BACKWARDS SOLVER

/********************************
**********CLEANER OBJECT**********
*********************************/

var Cleaner = {
    cleanup: function() {
        // check if this prop uses any other props besides given ones. If so then check those, 
        var propsUsed = [props.length];
        propsUsed = this.check(props[props.length-1],propsUsed);
        propsUsed.sort(function(a,b) { return a-b; } );
        this.keepProps(propsUsed);
        return;
    },

    check: function(propToCheck, propsUsed) {
       if (propToCheck[2][0]==="Given Proposition") return propsUsed;
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
            var transIndex = props[propsUsed[i]-1][2][1].slice();
            if (transIndex.length===2){
                if (transIndex[0]>transIndex[1]){
                    props[propsUsed[i]-1][2][1][1]=transIndex[0];
                    props[propsUsed[i]-1][2][1][0]=transIndex[1];
                }                
            }
            newProps.push(props[propsUsed[i]-1]);
        }
        finalProps = newProps;
        //RECALIBRATE NUMBERS
        var currentProp=1;
        for (i=0;i<finalProps.length;i++){
            var numToChange = finalProps[i][0];
            for (var j=0;j<finalProps.length;j++){
                for (var l=0;l<finalProps[j][2][1].length;l++){
                    if (finalProps[j][2][0]!=="Given Proposition"){
                        if (finalProps[j][2][1][l]==numToChange){
                            finalProps[j][2][1][l]=currentProp;
                        }
                    }
                }
            }
            finalProps[i][0]=currentProp;
            currentProp++;
        }
        return;
    },

    removeZeros: function(propArray){
        for (var i=0;i<propArray.length;i++){
            if (propArray[i][6]===0){
                console.log("removed: "+propArray[i][1]);
                propArray.splice(i, 1);
                i--;
            }
        }
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
                while((stackArr.length!==0) && (prcd(infixArr[i])<=prcd(stackArr[stackArr.length-1])) && infixArr[i]!=="~") {
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
            if(stackArr[stackArr.length-1]=="(") stackArr.pop();
            else postfixStr[postfixStr.length]=stackArr.pop();
        }
        console.log(""+infixStr+" transformed to postix notation: "+postfixStr.join(''));
        return postfixStr.join('');
    },

    postfixSubEval: function(sym,prop1,prop2) {
        var returnVal;
        if(sym=="~") returnVal = (prop1==="T")? "F" : "T";
        else if(sym=="*") returnVal = (prop1==="F" || prop2==="F")? "F" : "T";
        else if(sym==">") returnVal = (prop1==="F" || prop2==="T")? "T" : "F";
        else if(sym=="v") returnVal = (prop1==="T" || prop2==="T")? "T" : "F";
        else if(sym=="=") returnVal = (prop1==prop2)? "T" : "F";
        return returnVal;
    },

    // PRECONDITION: postfixStr must be in T & F
    postfixEval: function(postfixStr) {
        var stackArr=[];
        postfixStr=postfixStr.split('');
        for(var i = 0; i < postfixStr.length; i++) {
            if(postfixStr[i]=="T" || postfixStr[i]=="F") stackArr.push(postfixStr[i]);
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
        console.log("");
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
    if (top==="~" && right==="TRUE") this.right="FALSE";
    if (top==="~" && right==="FALSE") this.right="TRUE";
    if (top==="="){
        if (typeof(left)==="object" && typeof(right)==="object"){
            if (left.top==="~" && right.top==="~"){
                this.top = top;
                this.left = left.right;
                this.right = right.right;                
            }
        }
    }
}


var Tree = {
    //PRECONDITON: Must be in Postfix first
    // Turns pB>Br>*pr>> into:
    //               >
    //             /   \
    //            /     \
    //           /       \
    //         *           >
    //       /   \       /   \
    //      >     >     A     r
    //    /  \   /  \
    //   A    B B    r
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
        if (isOperand(tree.top)) return tree.top;
        if (tree.top!=="~") {
            infixArr = infixArr.concat(this.treeToInfixRecursive(tree.left));
        }
        infixArr.push(tree.top);
        infixArr = infixArr.concat(this.treeToInfixRecursive(tree.right));
        return infixArr.join('');        
    },

    treeToInfixRecursive: function(node) {
        infixArr = [];
        //Left
        if (isOperand(node.top)) return node.top;
        if (node.top !== "~") {
            infixArr.push("(");
            infixArr = infixArr.concat(this.treeToInfixRecursive(node.left));
        }
        //Top
        infixArr.push(node.top);
        //Right
        infixArr = infixArr.concat(this.treeToInfixRecursive(node.right));
        if (node.top !=="~") infixArr.push(")");
        return infixArr;
    },

    gatherLeaves: function(tree,leaves){
        return leaves;
    },

    //Compares two trees to see if they're epual
    compare: function(x,y) {
        if (x===undefined && y===undefined)
            return true;
        else if (x===undefined || y===undefined)
            return false;
        else if (x.top===y.top) {
            if (isOperand(x.top)) return true;
            if (x.top==="~"){
                if (!this.compare(x.right,y.right)) return false;
                return true;
            } 
            else if (x.top===">"){
                if (!this.compare(x.left,y.left)) return false;
                if (!this.compare(x.right,y.right)) return false;
                return true;
            } 
            else if (x.top==="*" || x.top==="=" || x.top==="v"){
                if (this.compare(x.left,y.left)){
                    if (!this.compare(x.right,y.right)) return false;
                    return true;                    
                }
                else if (this.compare(x.left,y.right)){
                    if (!this.compare(x.right,y.left)) return false;
                    return true;
                }
            }
        } else return false;
    }
};