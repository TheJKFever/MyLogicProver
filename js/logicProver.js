/*jshint esversion: 6 */
/*global $, console, alert, $, window */
/// <reference path="./node_modules/@types/jquery/index.d.ts"/>
'use strict';
/* Globals and Constances */
var props = []; //In the form of [[0-index,1-Infix,2-rule/given,3-variables,4-postfix,5-tree,6-usedCount,7-decommissioned],...,...]
var finalProps = []; //To be used by Cleaner Object
var concs = []; //In the form of [[0-index,1-Infix,2-rule/given,3-variables,4-postfix,5-tree,6-usedCount,7-decommissioned,8-concType],...,...]
var givenProps = 0;
var OPERATORS = ["~", "*", "v", ">", "=", "¬"];
(function () {
    function validateProp(prop) {
        var i = 0; //for loops
        console.log("Vaidating prop: " + prop);
        if (prop === "")
            return "Please enter an proposition";
        for (i = 0; i < props.length; i++) {
            if (prop === props[i][1])
                return "You have already entered this proposition";
        }
        var parOpenCount = 0;
        var variables = [];
        prop = prop.split("");
        var end = prop.length - 1;
        for (i = 0; i < prop.length; i++) {
            //Check to see if an invalid character was entered
            if ($.inArray(prop[i], ["*", "v", ">", "=", "~", "(", ")", "A", "B", "C", "D", "E", "F", "G", "H"]) == -1)
                return "Please enter a valid proposition using only A, B, C, D, E, F, G, H, *, |, ~, >, =, (, )";
            if (i === 0) {
                if ($.inArray(prop[i], [")", ">", "*", "v", "="]) >= 0)
                    return ("Invalid operation at character: " + (i + 1) + "\nError: cannot have a closed parenthese or operation as the first character");
            }
            if (i == end) {
                if ($.inArray(prop[i], ["(", "~", "*", "v", ">", "="]) >= 0)
                    return "Invalid Proposition: Cannot end with an open parentheses or an operation";
                else if (prop[i] == ")" && parOpenCount !== 1)
                    return "Invalid number of parentheses";
                else if ($.inArray(prop[i], ["A", "B", "C", "D", "E", "F", "G", "H"]) >= 0)
                    variables.push(prop[i]);
            }
            else if (prop[i] === "~") {
                if (prop[i + 1] === "~") {
                    prop.splice(i, 2);
                }
                else if ($.inArray(prop[i + 1], [")", ">", "*", "v", "="]) >= 0)
                    return ("Invalid operation at character: " + (i + 1) + "\nError: cannot have a closed parenthese or operation or following a NOT sign");
            }
            else if ($.inArray(prop[i], ["*", ">", "v", "=", "("]) >= 0) {
                if ($.inArray(prop[i + 1], [")", "*", ">", "v", "="]) >= 0)
                    return ("Error: " + prop[i + 1] + " cannot follow " + prop[i]);
                else if (prop[i] == "(")
                    parOpenCount++;
            }
            else if ($.inArray(prop[i], [")", "A", "B", "C", "D", "E", "F", "G", "H"]) >= 0) {
                if (prop[i] == ")")
                    parOpenCount--;
                else
                    variables.push(prop[i]);
                if ($.inArray(prop[i + 1], ["(", "~", "A", "B", "C", "D", "E", "F", "G", "H"]) >= 0) {
                    return ("Error: " + prop[i + 1] + " cannot follow " + prop[i]);
                }
            }
        }
        console.log("Proposition validated!");
        prop = prop.join("");
        return [prop, variables];
    }
    function addProp(testProp) {
        var prop = (typeof testProp !== "string") ? $("#newPremInput").val() : testProp;
        $("#newPremInput").val("");
        console.log("The user entered premise: " + prop);
        prop = validateProp(prop);
        if (typeof prop[1] === "object") {
            var variables = prop[1];
            var propPF = Postfix.infixToPostfix(prop[0]);
            var propT = Tree.postfixToTree(propPF);
            prop = Tree.treeToInfix(propT);
            prop = [props.length + 1, prop, ["Given Proposition", [(givenProps - 50)]], variables, propPF, propT, 0, false];
            props.push(prop);
            givenProps++;
            if (props.length >= 1 && concs.length !== 0) {
                changeToSolve();
            }
            $("#proofList").html(createTable(props));
        }
        else {
            console.log("Invalid proposition: " + prop[1]);
            alert(prop);
        }
        return false;
    }
    function addConc(testConc) {
        var conctype = $("#concType").val() === ("Therefore") ? ">" : "=";
        var prop = (typeof testConc !== "string") ? $("#newConcInput").val() : testConc;
        $("#newConcInput").val("");
        console.log("The user entered conclusion: " + prop);
        prop = validateProp(prop);
        if (typeof prop[1] === "object") {
            var variables = prop[1];
            var concPF = Postfix.infixToPostfix(prop[0]);
            var concT = Tree.postfixToTree(concPF);
            prop = Tree.treeToInfix(concT);
            var conc = [concs.length + 1, prop, ["Given Conclusion", [0]], variables, concPF, concT, 0, false, conctype];
            concs.push(conc);
            if (props.length >= 1) {
                changeToSolve();
            }
            else {
                $("#newConcInput").prop('disabled', true);
                $("#submitConc").prop('disabled', true);
            }
            $("#proofList").html(createTable(props));
        }
        else {
            console.log("Invalid proposition: " + prop[1]);
            alert(prop);
        }
        return false;
    }
    function createTable(propArray) {
        var tbl = "";
        for (var i = 0; i < propArray.length; i++) {
            if (propArray[i][2][0] === "Given Proposition") {
                tbl += "<li><div class='proof_item_1'>" + propArray[i][1] + "</div><div class='proof_item_2'>" + propArray[i][2][0] + "</div></li>";
            }
            else {
                tbl += "<li><div class='proof_item_1'>" + propArray[i][1] + "</div><div class='proof_item_2'>" + (propArray[i][2][1].join(", ") + " " + propArray[i][2][0]) + "</div></li>";
            }
        }
        if (concs.length !== 0) {
            tbl += "<li id='conclusionItem' type='A' value='3'><div class='proof_item_1'>" + concs[0][1] + "</div><div class='proof_item_2'>" + concs[0][8] + " " + concs[0][2][0] + "</div></li>";
        }
        console.log("Reconstructed Proof Table\n");
        return tbl;
    }
    function changeToSolve() {
        if (props.length >= 1 && concs.length !== 0) {
            $("#concForm").hide();
            $("#solveForm").show();
        }
    }
    function resetProof() {
        props = [];
        finalProps = [];
        concs = [];
        givenProps = 0;
        $("#proofList").html("<li><div class='proof_item_1'>First premise</div><div class='proof_item_2'>1. Given premise</div></li>" +
            "<li><div class='proof_item_1'>Second premise</div><div class='proof_item_2'>2. Given premise</div></li>" +
            "<li><div class='proof_item_1'>Third premise</div><div class='proof_item_2'>3. Given premise</div></li>" +
            "<li id='conclusionItem' type='A' value='3'><div class='proof_item_1'>Conclusion</div><div class='proof_item_2'>Given conclusion</div></li>");
        $("#concForm").show();
        $("#solveForm").hide();
        $("#submitSolve").val("Solve");
        $("#solveForm").off('submit', resetProof);
        $("#solveForm").on('submit', solve);
        return false;
    }
    function solve() {
        $("#submitSolve").val("Clear");
        $("#solveForm").off('submit', solve);
        $("#solveForm").on('submit', resetProof);
        if (!Solver.isSolvable()) {
            alert("This argument is not valid");
            return false;
        }
        console.log("Why'd you get here");
        if (Solver.solve()) {
            Cleaner.cleanup();
        }
        // else Cleaner.removeZeros(props);
        $("#proofList").html(createTable(finalProps));
        return false;
    }
    function init() {
        $("#premForm").on('submit', addProp);
        $("#concForm").on('submit', addConc);
        $("#solveForm").on('submit', solve);
        $("#fq1").on('click', examQuestion1);
        $("#fq2").on('click', examQuestion2);
        $("#fq3").on('click', examQuestion3);
        $("#fq4").on('click', examQuestion4);
        $("#fq5").on('click', examQuestion5);
        $("#fq6").on('click', examQuestion6);
        $("#fq7").on('click', examQuestion7);
        $("#fq8").on('click', examQuestion8);
        $("#fq9").on('click', examQuestion9);
        $("#fq10").on('click', examQuestion10);
    }
    /*************** EXAM QUESTIONS ***************/
    function examQuestion1() {
        resetProof();
        addProp("A>(~B*C)");
        addProp("Dv~E");
        addProp("AvE");
        addConc("B>D");
        return false;
    }
    function examQuestion2() {
        resetProof();
        addProp("B>((AvC)>F)");
        addProp("(FvD)>E");
        addConc("B>(C>E)");
    }
    function examQuestion3() {
        resetProof();
        addProp("~(H*~(AvB))");
        addProp("~(AvD)");
        addProp("C>(AvE)");
        addConc("~(~E*~B)v~(CvH)");
    }
    function examQuestion4() {
        resetProof();
        addProp("A>(BvC)");
        addProp("(B>D)*(C>E)");
        addConc("A>(DvE)");
    }
    function examQuestion5() {
        resetProof();
        addProp("E>B");
        addProp("BvC");
        addProp("C=D");
        addConc("EvD");
    }
    function examQuestion6() {
        resetProof();
        addProp("(A>B)>B");
        addConc("(B>A)>A");
    }
    function examQuestion7() {
        resetProof();
        addProp("Av(~B*C)");
        addProp("B>~A");
        addConc("~B");
    }
    function examQuestion8() {
        resetProof();
        addProp("A>(B>C)");
        addConc("(A>B)>(A>C)");
    }
    function examQuestion9() {
        resetProof();
        addProp("Av(B>D)");
        addProp("B>~E");
        addProp("B*(E=D)");
        addConc("B>(AvC)");
    }
    function examQuestion10() {
        resetProof();
        addProp("G=(Av(~Bv~C))");
        addProp("(Av~B)>D");
        addProp("(Av~C)>E");
        addConc("G>(D*E)");
    }
    window.onload = init;
})();
String.prototype.replaceAll = function (find, replace) {
    return this.replace(new RegExp(find, 'g'), replace);
};
function isOperand(who) {
    return !isReserved(who);
}
function isReserved(who) {
    if (isOperator(who))
        return true;
    switch (who) {
        case '(':
        case ')':
            return true;
        default:
            return false;
    }
}
function isOperator(who) {
    if (typeof who === 'undefined')
        return false;
    return OPERATORS.indexOf(who) != -1;
    // return (["~", "*", "v", ">", "="].indexOf(who) != -1);
}
/* Check for Precedence */
function prcd(operator) {
    switch (operator) {
        case '~': return 4;
        case '>':
        case '*':
        case 'v': return 3;
        case '=': return 2;
        case '(':
        case ')': return 1;
    }
}
function binaryToTruth(oneOrZero) {
    var truthVal = (oneOrZero === 0) ? "F" : "T";
    return truthVal;
}
/********************************
**********SOLVER OBJECT**********
*********************************/
var Solver = {
    //PRECONDITION: Validated props and concs
    isSolvable: function () {
        console.log("Attempting to verify solvability");
        var Vars = [], _prop = [];
        var i = 0, j = 0;
        //Add all of the propositions PF to _prop[] and count total variables
        console.log("****Counting total number of variables in argument");
        for (i = 0; i < givenProps; i++) {
            _prop.push(props[i][4]);
            // Check if variables in prop is in Vars and if not push it in
            for (j = 0; j < props[i][3].length; j++) {
                if ($.inArray(props[i][3][j], Vars) === -1) {
                    Vars.push(props[i][3][j]);
                }
            }
        }
        //Add variable from Conclusion if there are extras
        for (j = 0; j < concs[0][3].length; j++) {
            if ($.inArray(concs[0][3][j], Vars) === -1) {
                Vars.push(concs[0][3][j]);
            }
        }
        console.log("****Counted a total of " + Vars.length + " variables");
        var ast = "";
        for (i = 0; i < props.length - 1; i++) {
            ast = ast.concat("*");
        }
        //Create one long PF string for testing
        var _tempPropToSolve = _prop.join('') + ast + concs[0][4] + concs[0][8];
        //loop for all truth values, and test
        for (i = 0; i < Math.pow(2, Vars.length); i++) {
            var tempPropToSolve = _tempPropToSolve;
            for (j = 0; j < Vars.length; j++) {
                tempPropToSolve = tempPropToSolve.replaceAll(Vars[j], binaryToTruth((i >> j) & 1));
            }
            console.log(tempPropToSolve);
            if (Postfix.postfixEval(tempPropToSolve) == "F") {
                console.log("Error: Argument is not solvable");
                return false;
            }
        }
        console.log("Attempt succeeded, this argument is a tautology");
        return true;
    },
    solve: function () {
        console.log("\n**********Attempting to solve proof**********");
        //IDEALLY SHOULD USE WHILE LOOP, BUT WILL USE 10 LOOPS FOR TESTING
        var i = 0;
        var propsLength = props.length;
        BackwardsSolver.solve();
        for (i = 0; i < 13; i++) {
            if (this.heuristic(i))
                return true;
        }
        alert("Could Not Solve");
        return false;
    },
    heuristic: function (count) {
        var i;
        var propsLength = props.length;
        for (i = 0; i < propsLength; i++) {
            if (props[i][7] !== true) {
                props[i][7] = true;
                var result = [];
                var root = props[i][5];
                if (isOperator(root.top)) {
                    //TOP ACTION
                    if (root.top === "=") {
                        //ME
                        if (this.addTransformedProp(new Tree("*", new Tree(">", root.left, root.right), new Tree(">", root.right, root.left)), ["ME", [props[i][0]]]))
                            return true;
                        if (this.addTransformedProp(new Tree("v", new Tree("*", root.left, root.right), new Tree("*", new Tree("~", undefined, root.left), new Tree("~", undefined, root.right))), ["Truth Table Form", [props[i][0]]]))
                            return true;
                    }
                    else if (root.top === "v") {
                        //Immediate Inferences
                        if (root.right.top === "TRUE") {
                            if (this.addTransformedProp(root.right, ["Immediate Inference", [props[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "TRUE") {
                            if (this.addTransformedProp(root.left, ["Immediate Inference", [props[i][0]]]))
                                return true;
                        }
                        if (root.right.top === "FALSE") {
                            if (this.addTransformedProp(root.left, ["Immediate Inference", [props[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "FALSE") {
                            if (this.addTransformedProp(root.right, ["Immediate Inference", [props[i][0]]]))
                                return true;
                        }
                        //Tautology
                        if (Tree.compare(root.left, root.right)) {
                            if (this.addTransformedProp(root.left, ["Tautology", [props[i][0]]]))
                                return true;
                        }
                        //DISTRIB
                        if (root.left.top === "*" && root.right.top === "*") {
                            //ME
                            if (Tree.compare(new Tree("~", undefined, root.left.left), root.right.left) || Tree.compare(root.left.left, new Tree("~", undefined, root.right.left))) {
                                if (Tree.compare(new Tree("~", undefined, root.left.right), root.right.right) || Tree.compare(root.left.right, new Tree("~", undefined, root.right.right))) {
                                    if (this.addTransformedProp(new Tree("=", root.left.left, root.left.right), ["Truth Table Form", [props[i][0]]]))
                                        return true;
                                    if (this.addTransformedProp(new Tree("*", new Tree(">", root.left.left, root.left.right), new Tree(">", root.left.right, root.left.left)), ["ME", [props[i][0]]]))
                                        return true;
                                }
                            }
                            else if (Tree.compare(new Tree("~", undefined, root.left.left), root.right.right) || Tree.compare(root.left.left, new Tree("~", undefined, root.right.right))) {
                                if (Tree.compare(new Tree("~", undefined, root.left.right), root.right.left) || Tree.compare(root.left.right, new Tree("~", undefined, root.right.left))) {
                                    if (this.addTransformedProp(new Tree("=", root.left.left, root.left.right), ["Truth Table Form", [props[i][0]]]))
                                        return true;
                                    if (this.addTransformedProp(new Tree("*", new Tree(">", root.left.left, root.left.right), new Tree(">", root.left.right, root.left.left)), ["ME", [props[i][0]]]))
                                        return true;
                                }
                            }
                            //DISTRIB
                            if (Tree.compare(root.left.left, root.right.left)) {
                                if (this.addTransformedProp(new Tree("*", root.left.left, new Tree("v", root.right.right, root.left.right)), ["Distrib.", [props[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.left, root.right.right)) {
                                if (this.addTransformedProp(new Tree("*", root.left.left, new Tree("v", root.right.left, root.left.right)), ["Distrib.", [props[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.left)) {
                                if (this.addTransformedProp(new Tree("*", root.left.right, new Tree("v", root.right.right, root.left.left)), ["Distrib.", [props[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.right)) {
                                if (this.addTransformedProp(new Tree("*", root.left.right, new Tree("v", root.right.left, root.left.left)), ["Distrib.", [props[i][0]]]))
                                    return true;
                            }
                        }
                        else if (root.right.top === "*") {
                            if (this.addTransformedProp(new Tree("*", new Tree("v", root.left, root.right.left), new Tree("v", root.left, root.right.right)), ["Distrib.", [props[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "*") {
                            if (this.addTransformedProp(new Tree("*", new Tree("v", root.right, root.left.left), new Tree("v", root.right, root.left.right)), ["Distrib.", [props[i][0]]]))
                                return true;
                        }
                        //Simp immediately after Dist.
                        if (props[props.length - 1][2] === ["Distrib.", [props[i][0]]]) {
                            if (this.addTransformedProp(props[props.length - 1][5].left, ["Simp.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(props[props.length - 1][5].right, ["Simp.", [props[i][0]]]))
                                return true;
                        }
                        //Comm
                        if (this.addTransformedProp(new Tree(root.top, root.right, root.left), ["Comm.", [props[i][0]]]))
                            return true;
                        if (root.right.top === "v" && root.left.top === "v") {
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.left.left, root.left.right), new Tree("v", root.right.left, root.right.left)), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.left.left, root.right.left), new Tree("v", root.left.right, root.right.left)), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.left.left, root.right.left), new Tree("v", root.left.right, root.right.left)), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.left.right, root.right.left), new Tree("v", root.right.left, root.left.left)), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.left.right, root.right.left), new Tree("v", root.left.left, root.right.left)), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.right.left, root.right.left), new Tree("v", root.left.left, root.left.right)), ["Comm.", [props[i][0]]]))
                                return true;
                        }
                        if (root.right.top === "v") {
                            if (this.addTransformedProp(new Tree("v", root.right.left, new Tree("v", root.left, root.right.right)), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", root.right.right, new Tree("v", root.left, root.right.left)), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.right.right, root.left), root.right.left), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.right.right, root.right.left), root.left), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.right.left, root.left), root.right.right), ["Comm.", [props[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "v") {
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.left.left, root.right), root.left.right), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", new Tree("v", root.left.right, root.right), root.left.left), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", root.right, new Tree("v", root.left.left, root.left.right)), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", root.left.left, new Tree("v", root.right, root.left.right)), ["Comm.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree("v", root.left.right, new Tree("v", root.right, root.left.left)), ["Comm.", [props[i][0]]]))
                                return true;
                        }
                        //MI
                        if (this.addTransformedProp(new Tree(">", new Tree("~", undefined, root.left), root.right), ["MI", [props[i][0]]]))
                            return true;
                        if (this.addTransformedProp(new Tree(">", new Tree("~", undefined, root.right), root.left), ["MI", [props[i][0]]]))
                            return true;
                    }
                    else if (root.top === "*") {
                        //Immediate Inferences
                        if (root.right.top === "TRUE") {
                            if (this.addTransformedProp(root.left, ["Immediate Inference", [props[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "TRUE") {
                            if (this.addTransformedProp(root.right, ["Immediate Inference", [props[i][0]]]))
                                return true;
                        }
                        //Tautology
                        if (Tree.compare(root.left, root.right)) {
                            if (this.addTransformedProp(root.left, ["Tautology", [props[i][0]]]))
                                return true;
                        }
                        //SIMP
                        if (this.addTransformedProp(root.left, ["Simp.", [props[i][0]]]))
                            return true;
                        if (this.addTransformedProp(root.right, ["Simp.", [props[i][0]]]))
                            return true;
                        //DISTRIB
                        if (root.left.top === "v" && root.right.top === "v") {
                            if (Tree.compare(root.left.left, root.right.left)) {
                                if (this.addTransformedProp(new Tree("v", root.left.left, new Tree("*", root.right.right, root.left.right)), ["Distrib.", [props[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.left, root.right.right)) {
                                if (this.addTransformedProp(new Tree("v", root.left.left, new Tree("*", root.right.left, root.left.right)), ["Distrib.", [props[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.left)) {
                                if (this.addTransformedProp(new Tree("v", root.left.right, new Tree("*", root.right.right, root.left.left)), ["Distrib.", [props[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.right)) {
                                if (this.addTransformedProp(new Tree("v", root.left.right, new Tree("*", root.right.left, root.left.left)), ["Distrib.", [props[i][0]]]))
                                    return true;
                            }
                        }
                        else if (root.right.top === "v") {
                            if (this.addTransformedProp(new Tree("v", new Tree("*", root.left, root.right.left), new Tree("*", root.left, root.right.right)), ["Distrib.", [props[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "v") {
                            if (this.addTransformedProp(new Tree("v", new Tree("*", root.right, root.left.left), new Tree("*", root.right, root.left.right)), ["Distrib.", [props[i][0]]]))
                                return true;
                        }
                        //ME
                        if (root.left.top === ">" && root.right.top === ">") {
                            if (Tree.compare(root.left.left, root.right.right) && Tree.compare(root.left.right, root.right.left)) {
                                if (this.addTransformedProp(new Tree("=", root.left.left, root.right.left), ["ME", [props[i][0]]]))
                                    return true;
                                if (this.addTransformedProp(new Tree("v", new Tree("*", root.left.left, root.right.left), new Tree("*", new Tree("~", undefined, root.left.left), new Tree("~", undefined, root.right.left))), ["Truth Table Form", [props[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.left) && Tree.compare(root.left.left, root.right.right)) {
                                if (this.addTransformedProp(new Tree("=", root.left.left, root.right.left), ["ME", [props[i][0]]]))
                                    return true;
                                if (this.addTransformedProp(new Tree("v", new Tree("*", root.left.left, root.right.left), new Tree("*", new Tree("~", undefined, root.left.left), new Tree("~", undefined, root.right.left))), ["Truth Table Form", [props[i][0]]]))
                                    return true;
                            }
                        }
                    }
                    else if (root.top === ">") {
                        //Immediate Inferences
                        if (root.left.top === "TRUE") {
                            if (this.addTransformedProp(root.right, ["Immediate Inference", [props[i][0]]]))
                                return true;
                        }
                        else if (root.right.top === "FALSE") {
                            if (this.addTransformedProp(new Tree("~", undefined, root.left), ["Immediate Inference", [props[i][0]]]))
                                return true;
                        }
                        //EXP
                        if (root.left.top === "*") {
                            if (this.addTransformedProp(new Tree(">", root.left.left, new Tree(">", root.left.right, root.right)), ["Exp.", [props[i][0]]]))
                                return true;
                            if (this.addTransformedProp(new Tree(">", root.left.right, new Tree(">", root.left.left, root.right)), ["Exp.", [props[i][0]]]))
                                return true;
                        }
                        else if (root.right.top === ">") {
                            if (this.addTransformedProp(new Tree(">", new Tree("*", root.left, root.right.left), root.right.right), ["Exp.", [props[i][0]]]))
                                return true;
                        }
                        //ABS
                        if (root.right === "*") {
                            if (Tree.compare(root.right.left, root.left)) {
                                if (this.addTransformedProp(new Tree(">", root.left, root.right.right), ["Abs.", [props[i][0]]]))
                                    return true;
                            }
                        }
                        //MI
                        if (this.addTransformedProp(new Tree("v", new Tree("~", undefined, root.left), root.right), ["MI", [props[i][0]]]))
                            return true;
                        //TRANS
                        if (this.addTransformedProp(new Tree(">", new Tree("~", undefined, root.right), new Tree("~", undefined, root.left)), ["Trans.", [props[i][0]]]))
                            return true;
                    }
                    //************* ENTER RECURSIVE FUNCTIONS *****************
                    //START RECURSIVE LEFT
                    if (root.top !== "~") {
                        result = this.heuristicRecursive(root.left, []);
                        for (var x = 0; x < result.length; x++) {
                            if (this.addTransformedProp(new Tree(root.top, result[x][1], root.right), [result[x][0], [props[i][0]]]))
                                return true;
                        }
                    }
                    //START RECURSIVE RIGHT
                    result = this.heuristicRecursive(root.right, []);
                    for (var x = 0; x < result.length; x++) {
                        if (this.addTransformedProp(new Tree(root.top, root.left, result[x][1]), [result[x][0], [props[i][0]]]))
                            return true;
                    }
                }
            }
            // ********** END RECURSIVE FUNCTIONS ***********
            if (this.inferenceRules(props[i]))
                return true;
            if (this.aDd(props[i]))
                return true;
            if (count < 2 || count > 10) {
                if (this.deM(props[i]))
                    return true;
            }
        }
        return false;
    },
    heuristicRecursive: function (prop, result) {
        var resultRecursive = [];
        var x;
        if (prop.top === undefined || isOperand(prop.top))
            return result;
        //RECURSIVE ACTION
        if (prop.top === "=") {
            result.push(["ME.", new Tree("*", new Tree(">", prop.left, prop.right), new Tree(">", prop.right, prop.left))]);
            result.push(["Truth Table Form", new Tree("v", new Tree("*", prop.left, prop.right), new Tree("*", new Tree("~", undefined, prop.left), new Tree("~", undefined, prop.right)))]);
        }
        else if (prop.top === "v") {
            //Immediate Inferences
            if (prop.right.top === "TRUE") {
                result.push(["Immediate Inference", prop.right]);
            }
            else if (prop.left.top === "TRUE") {
                result.push(["Immediate Inference", prop.left]);
            }
            if (prop.right.top === "FALSE") {
                result.push(["Immediate Inference", prop.left]);
            }
            else if (prop.left.top === "FALSE") {
                result.push(["Immediate Inference", prop.right]);
            }
            //Tautology
            if (Tree.compare(prop.left, prop.right)) {
                result.push(["Tautology", prop.left]);
            }
            //Comm
            result.push(["Comm.", new Tree(prop.top, prop.right, prop.left)]);
            if (prop.right.top === "v" && prop.left.top === "v") {
                result.push(["Comm.", new Tree("v", new Tree("v", prop.left.left, prop.left.right), new Tree("v", prop.right.left, prop.right.left))]);
                result.push(["Comm.", new Tree("v", new Tree("v", prop.left.left, prop.right.left), new Tree("v", prop.left.right, prop.right.left))]);
                result.push(["Comm.", new Tree("v", new Tree("v", prop.left.left, prop.right.left), new Tree("v", prop.left.right, prop.right.left))]);
                result.push(["Comm.", new Tree("v", new Tree("v", prop.left.right, prop.right.left), new Tree("v", prop.right.left, prop.left.left))]);
                result.push(["Comm.", new Tree("v", new Tree("v", prop.left.right, prop.right.left), new Tree("v", prop.left.left, prop.right.left))]);
                result.push(["Comm.", new Tree("v", new Tree("v", prop.right.left, prop.right.left), new Tree("v", prop.left.left, prop.left.right))]);
            }
            if (prop.right.top === "v") {
                result.push(["Comm.", new Tree("v", prop.right.left, new Tree("v", prop.left, prop.right.right))]);
                result.push(["Comm.", new Tree("v", prop.right.right, new Tree("v", prop.left, prop.right.left))]);
                result.push(["Comm.", new Tree("v", new Tree("v", prop.right.right, prop.left), prop.right.left)]);
                result.push(["Comm.", new Tree("v", new Tree("v", prop.right.right, prop.right.left), prop.left)]);
                result.push(["Comm.", new Tree("v", new Tree("v", prop.right.left, prop.left), prop.right.right)]);
            }
            else if (prop.left.top === "v") {
                result.push(["Comm.", new Tree("v", new Tree("v", prop.left.left, prop.right), prop.left.right)]);
                result.push(["Comm.", new Tree("v", new Tree("v", prop.left.right, prop.right), prop.left.left)]);
                result.push(["Comm.", new Tree("v", prop.right, new Tree("v", prop.left.left, prop.left.right))]);
                result.push(["Comm.", new Tree("v", prop.left.left, new Tree("v", prop.right, prop.left.right))]);
                result.push(["Comm.", new Tree("v", prop.left.right, new Tree("v", prop.right, prop.left.left))]);
            }
            //MI
            result.push(["MI", new Tree(">", new Tree("~", undefined, prop.left), prop.right)]);
            result.push(["MI", new Tree(">", new Tree("~", undefined, prop.right), prop.left)]);
            //DISTRIB
            if (prop.left.top === "*" && prop.right.top === "*") {
                if (Tree.compare(prop.left.left, prop.right.left)) {
                    result.push(["Distrib.", new Tree("*", prop.left.left, new Tree("v", prop.right.right, prop.left.right))]);
                }
                else if (Tree.compare(prop.left.left, prop.right.right)) {
                    result.push(["Distrib.", new Tree("*", prop.left.left, new Tree("v", prop.right.left, prop.left.right))]);
                }
                else if (Tree.compare(prop.left.right, prop.right.left)) {
                    result.push(["Distrib.", new Tree("*", prop.left.right, new Tree("v", prop.right.right, prop.left.left))]);
                }
                else if (Tree.compare(prop.left.right, prop.right.right)) {
                    result.push(["Distrib.", new Tree("*", prop.left.right, new Tree("v", prop.right.left, prop.left.left))]);
                }
                //ME
                if (Tree.compare(new Tree("~", undefined, prop.left.left), prop.right.left) || Tree.compare(prop.left.left, new Tree("~", undefined, prop.right.left))) {
                    if (Tree.compare(new Tree("~", undefined, prop.left.right), prop.right.right) || Tree.compare(prop.left.right, new Tree("~", undefined, prop.right.right))) {
                        result.push(["Truth Table Form", new Tree("=", prop.left.left, prop.left.right)]);
                        result.push(["ME.", new Tree("*", new Tree(">", prop.left.left, prop.left.right), new Tree(">", prop.left.right, prop.left.left))]);
                    }
                }
                else if (Tree.compare(new Tree("~", undefined, prop.left.left), prop.right.right) || Tree.compare(prop.left.left, new Tree("~", undefined, prop.right.right))) {
                    if (Tree.compare(new Tree("~", undefined, prop.left.right), prop.right.left) || Tree.compare(prop.left.right, new Tree("~", undefined, prop.right.left))) {
                        result.push(["Truth Table Form", new Tree("=", prop.left.left, prop.left.right)]);
                        result.push(["ME.", new Tree("*", new Tree(">", prop.left.left, prop.left.right), new Tree(">", prop.left.right, prop.left.left))]);
                    }
                }
            }
            else if (prop.right.top === "*") {
                result.push(["Distrib.", new Tree("*", new Tree("v", prop.left, prop.right.left), new Tree("v", prop.left, prop.right.right))]);
            }
            else if (prop.left.top === "*") {
                result.push(["Distrib.", new Tree("*", new Tree("v", prop.right, prop.left.left), new Tree("v", prop.right, prop.left.right))]);
            }
        }
        else if (prop.top === "*") {
            //Immediate Inferences
            if (prop.right.top === "TRUE") {
                result.push(["Immediate Inference", prop.left]);
            }
            else if (prop.left.top === "TRUE") {
                result.push(["Immediate Inference", prop.right]);
            }
            //Tautology
            if (Tree.compare(prop.left, prop.right)) {
                result.push(["Tautology", prop.left]);
            }
            //DISTRIB
            if (prop.left.top === "v" && prop.right.top === "v") {
                if (Tree.compare(prop.left.left, prop.right.left)) {
                    result.push(["Distrib.", new Tree("v", prop.left.left, new Tree("*", prop.right.right, prop.left.right))]);
                }
                else if (Tree.compare(prop.left.left, prop.right.right)) {
                    result.push(["Distrib.", new Tree("v", prop.left.left, new Tree("*", prop.right.left, prop.left.right))]);
                }
                else if (Tree.compare(prop.left.right, prop.right.left)) {
                    result.push(["Distrib.", new Tree("v", prop.left.right, new Tree("*", prop.right.right, prop.left.left))]);
                }
                else if (Tree.compare(prop.left.right, prop.right.right)) {
                    result.push(["Distrib.", new Tree("v", prop.left.right, new Tree("*", prop.right.left, prop.left.left))]);
                }
            }
            else if (prop.right.top === "v") {
                result.push(["Distrib.", new Tree("v", new Tree("*", prop.left, prop.right.left), new Tree("*", prop.left, prop.right.right))]);
            }
            else if (prop.left.top === "v") {
                result.push(["Distrib.", new Tree("v", new Tree("*", prop.right, prop.left.left), new Tree("*", prop.right, prop.left.right))]);
            }
            //ME
            if (prop.left.top === ">" && prop.right.top === ">") {
                if (Tree.compare(prop.left.left, prop.right.right) && Tree.compare(prop.left.right, prop.right.left)) {
                    result.push(["ME.", new Tree("=", prop.left.left, prop.right.left)]);
                    result.push(["Truth Table Form", new Tree("v", new Tree("*", prop.left.left, prop.right.left), new Tree("*", new Tree("~", undefined, prop.left.left), new Tree("~", undefined, prop.right.left)))]);
                }
            }
        }
        else if (prop.top === ">") {
            //Immediate Inferences
            if (prop.left.top === "TRUE") {
                result.push(["Immediate Inference", prop.right]);
            }
            else if (prop.right.top === "FALSE") {
                result.push(["Immediate Inference", new Tree("~", undefined, prop.left)]);
            }
            //MI
            result.push(["MI", new Tree("v", new Tree("~", undefined, prop.left), prop.right)]);
            //TRANS
            result.push(["Trans.", new Tree(">", new Tree("~", undefined, prop.right), new Tree("~", undefined, prop.left))]);
            if (prop.left.top === "*") {
                result.push(["Exp.", new Tree(">", prop.left.left, new Tree(">", prop.left.right, prop.right))]);
                result.push(["Exp.", new Tree(">", prop.left.right, new Tree(">", prop.left.left, prop.right))]);
            }
            else if (prop.right.top === ">") {
                result.push(["Exp.", new Tree(">", new Tree("*", prop.left, prop.right.left), prop.right.right)]);
            }
        }
        //CONTINUE RECURSIVE LEFT
        if (prop.top !== "~") {
            resultRecursive = this.heuristicRecursive(prop.left, []);
            for (x = 0; x < resultRecursive.length; x++) {
                result.push([resultRecursive[x][0], new Tree(prop.top, resultRecursive[x][1], prop.right)]);
            }
        }
        //CONTINUE RECURSIVE RIGHT
        resultRecursive = this.heuristicRecursive(prop.right, []);
        for (x = 0; x < resultRecursive.length; x++) {
            result.push([resultRecursive[x][0], new Tree(prop.top, prop.left, resultRecursive[x][1])]);
        }
        return result;
    },
    // DeM.                 ~(A*B)==(~A|~B)
    //                      ~(A|B)==(~A*~B)
    deM: function (prop) {
        var result = [];
        var root = prop[5];
        //TOP ACTION
        if (isOperand(root.top))
            return false;
        if (root.top === "~") {
            if (root.right.top === "*") {
                if (this.addTransformedProp(new Tree("v", new Tree("~", undefined, root.right.left), new Tree("~", undefined, root.right.right)), ["TD", [prop[0]]]))
                    return true;
            }
            else if (root.right.top === "v") {
                if (this.addTransformedProp(new Tree("*", new Tree("~", undefined, root.right.left), new Tree("~", undefined, root.right.right)), ["TD.", [prop[0]]]))
                    return true;
            }
        }
        else if (root.top === "v") {
            if (this.addTransformedProp(new Tree("~", undefined, new Tree("*", new Tree("~", undefined, root.left), new Tree("~", undefined, root.right))), ["TE", [prop[0]]]))
                return true;
        }
        else if (root.top === "*") {
            if (this.addTransformedProp(new Tree("~", undefined, new Tree("v", new Tree("~", undefined, root.left), new Tree("~", undefined, root.right))), ["TE", [prop[0]]]))
                return true;
        }
        //START RECURSIVE LEFT
        if (root.top !== "~") {
            result = this.deMRecursive(root.left, []);
            for (var x = 0; x < result.length; x++) {
                if (this.addTransformedProp(new Tree(root.top, result[x][1], root.right), [result[x][0], [prop[0]]]))
                    return true;
            }
        }
        //START RECURSIVE RIGHT
        result = this.deMRecursive(root.right, []);
        for (var x = 0; x < result.length; x++) {
            if (this.addTransformedProp(new Tree(root.top, root.left, result[x][1]), [result[x][0], [prop[0]]]))
                return true;
        }
        return false;
    },
    deMRecursive: function (prop, result) {
        var resultRecursive = [];
        var x;
        if (prop.top === undefined || isOperand(prop.top))
            return result;
        //RECURSIVE ACTION
        if (prop.top === "~") {
            if (prop.right.top === "*") {
                result.push(["TD", new Tree("v", new Tree("~", undefined, prop.right.left), new Tree("~", undefined, prop.right.right))]);
            }
            else if (prop.right.top === "v") {
                result.push(["TD", new Tree("*", new Tree("~", undefined, prop.right.left), new Tree("~", undefined, prop.right.right))]);
            }
        }
        else if (prop.top === "v") {
            result.push(["TE", new Tree("~", undefined, new Tree("*", new Tree("~", undefined, prop.left), new Tree("~", undefined, prop.right)))]);
        }
        else if (prop.top === "*") {
            result.push(["TE", new Tree("~", undefined, new Tree("v", new Tree("~", undefined, prop.left), new Tree("~", undefined, prop.right)))]);
        }
        //CONTINUE RECURSIVE LEFT
        if (prop.top !== "~") {
            resultRecursive = this.deMRecursive(prop.left, []);
            for (x = 0; x < resultRecursive.length; x++) {
                result.push([resultRecursive[x][0], new Tree(prop.top, resultRecursive[x][1], prop.right)]);
            }
        }
        //CONTINUE RECURSIVE RIGHT
        resultRecursive = this.deMRecursive(prop.right, []);
        for (x = 0; x < resultRecursive.length; x++) {
            result.push([resultRecursive[x][0], new Tree(prop.top, prop.left, resultRecursive[x][1])]);
        }
        return result;
    },
    removeDN: function (tree) {
        if (tree.top === undefined || isOperand(tree.top))
            return tree;
        if (tree.top === "~" && tree.right.top === "~") {
            tree = tree.right.right;
            if (tree.top === undefined || isOperand(tree.top))
                return tree;
        }
        if (tree.top !== "~") {
            tree.left = this.removeDN(tree.left);
        }
        tree.right = this.removeDN(tree.right);
        return tree;
    },
    convertNonTruth: function (tree) {
        if (tree.top === undefined || isOperand(tree.top))
            return tree;
        if (tree.top === "~") {
            if (tree.right.top === "FALSE") {
                tree.top = "TRUE";
                return tree;
            }
            else if (tree.right.top === "TRUE") {
                tree.top = "FALSE";
                return tree;
            }
        }
        if (tree.top !== "~") {
            tree.left = this.convertNonTruth(tree.left);
        }
        tree.right = this.convertNonTruth(tree.right);
        return tree;
    },
    truthReplacement: function (prop) {
        var result = [];
        var root = prop[5];
        if (isOperand(root.top))
            return false;
        //TOP ACTION
        if (root.top === "*") {
            if (Tree.compare(new Tree("~", undefined, root.left), root.right) || Tree.compare(root.left, new Tree("~", undefined, root.right))) {
                prop[7] = true;
                if (this.addTransformedProp(new Tree("FALSE"), ["Consistency", [prop[0]]]))
                    return true;
            }
        }
        if (root.top === "v") {
            if (Tree.compare(new Tree("~", undefined, root.left), root.right) || Tree.compare(root.left, new Tree("~", undefined, root.right))) {
                prop[7] = true;
                if (this.addTransformedProp(new Tree("TRUE"), ["Excluded Middle", [prop[0]]]))
                    return true;
            }
        }
        //START RECURSIVE LEFT
        if (root.top !== "~") {
            result = this.truthReplacementRecursive(root.left, []);
            for (var x = 0; x < result.length; x++) {
                prop[7] = true;
                if (this.addTransformedProp(new Tree(root.top, result[x][1], root.right), [result[x][0], [prop[0]]]))
                    return true;
            }
        }
        //START RECURSIVE RIGHT
        result = this.truthReplacementRecursive(root.right, []);
        for (var x = 0; x < result.length; x++) {
            prop[7] = true;
            if (this.addTransformedProp(new Tree(root.top, root.left, result[x][1]), [result[x][0], [prop[0]]]))
                return true;
        }
        return false;
    },
    truthReplacementRecursive: function (tree, result) {
        var resultRecursive = [];
        var x;
        if (tree.top === undefined || isOperand(tree.top))
            return result;
        //RECURSIVE ACTION
        if (tree.top === "*") {
            if (Tree.compare(new Tree("~", undefined, tree.left), tree.right) || Tree.compare(tree.left, new Tree("~", undefined, tree.right))) {
                result.push(["Consistency", new Tree("FALSE")]);
            }
        }
        else if (tree.top === "v") {
            if (Tree.compare(new Tree("~", undefined, tree.left), tree.right) || Tree.compare(tree.left, new Tree("~", undefined, tree.right))) {
                result.push(["Excluded Middle", new Tree("TRUE")]);
            }
        }
        //CONTINUE RECURSIVE LEFT
        if (tree.top !== "~") {
            resultRecursive = this.truthReplacementRecursive(tree.left, []);
            for (x = 0; x < resultRecursive.length; x++) {
                result.push([resultRecursive[x][0], new Tree(tree.top, resultRecursive[x][1], tree.right)]);
            }
        }
        //CONTINUE RECURSIVE RIGHT
        resultRecursive = this.truthReplacementRecursive(tree.right, []);
        for (x = 0; x < resultRecursive.length; x++) {
            result.push([resultRecursive[x][0], new Tree(tree.top, tree.left, resultRecursive[x][1])]);
        }
        return result;
    },
    inferenceRules: function (prop) {
        var root = prop[5];
        if (root.top === undefined || isOperand(root.top))
            return false;
        for (var i = 0; i < props.length; i++) {
            if (prop[0] === props[i][0]) { }
            else if (root.top === "v") {
                //DS
                if (Tree.compare(new Tree("~", undefined, root.right), props[i][5]) || Tree.compare(root.right, new Tree("~", undefined, props[i][5]))) {
                    if (this.addTransformedProp(root.left, ["DS", [prop[0], props[i][0]]]))
                        return true;
                }
                else if (Tree.compare(new Tree("~", undefined, root.left), props[i][5]) || Tree.compare(root.left, new Tree("~", undefined, props[i][5]))) {
                    if (this.addTransformedProp(root.right, ["DS", [prop[0], props[i][0]]]))
                        return true;
                }
                //Conj
                if (props[i][5].top === "v") {
                    if (Tree.compare(root.left, props[i][5].left) || Tree.compare(root.left, props[i][5].right) || Tree.compare(root.right, props[i][5].left) || Tree.compare(root.right, props[i][5].right)) {
                        if (this.addTransformedProp(new Tree("*", root, props[i][5]), ["Conj.", [prop[0], props[i][0]]]))
                            return true;
                    }
                    else
                        return false;
                }
            }
            else if (root.top === "*" && root.left.top === ">" && root.right.top === ">") {
                //CD
                var tempProp = new Tree("v", root.left.left, root.right.left);
                for (i = 0; i < props.length; i++) {
                    if (props[i][5].top === "v") {
                        if (Tree.compare(props[i][5], tempProp)) {
                            if (this.addTransformedProp(new Tree("v", root.left.right, root.right.right), ["CD", [prop[0], props[i][0]]]))
                                return true;
                        }
                    }
                }
            }
            else if (root.top === ">") {
                //MP
                if (Tree.compare(root.left, props[i][5])) {
                    if (this.addTransformedProp(root.right, ["MP", [prop[0], props[i][0]]]))
                        return true;
                }
                //MT
                if (Tree.compare(new Tree("~", undefined, root.right), props[i][5]) || Tree.compare(root.right, new Tree("~", undefined, props[i][5]))) {
                    if (this.addTransformedProp(new Tree("~", undefined, root.left), ["MT", [prop[0], props[i][0]]]))
                        return true;
                }
                //HS
                if (props[i][5].top === ">") {
                    if (Tree.compare(root.right, props[i][5].left)) {
                        if (this.addTransformedProp(new Tree(">", root.left, props[i][5].right), ["HS", [prop[0], props[i][0]]]))
                            return true;
                    }
                    if (Tree.compare(root.left, props[i][5].right)) {
                        if (this.addTransformedProp(new Tree(">", props[i][5].left, root.right), ["HS", [prop[0], props[i][0]]]))
                            return true;
                    }
                }
            }
        }
        return false;
    },
    aDd: function (prop) {
        var i;
        var root = prop[5];
        if (isOperand(root.top))
            return false;
        if (root.top === ">") {
            for (i = 0; i < props.length; i++) {
                if (root.left.top === "v") {
                    if (Tree.compare(props[i][5], root.left.left)) {
                        if (this.addTransformedProp(new Tree("v", props[i][5], root.left.right), ["Add.", [props[i][0]]]))
                            return true;
                        if (this.inferenceRules(prop))
                            return true;
                    }
                    else if (Tree.compare(props[i][5], root.left.right)) {
                        if (this.addTransformedProp(new Tree("v", props[i][5], root.left.left), ["Add.", [props[i][0]]]))
                            return true;
                        if (this.inferenceRules(prop))
                            return true;
                    }
                }
                if (root.right.top === "*") {
                    if (Tree.compare(new Tree("~", undefined, props[i][5]), root.right.left) || Tree.compare(props[i][5], new Tree("~", undefined, root.right.left))) {
                        if (this.addTransformedProp(new Tree("v", new Tree("~", undefined, root.right.right), props[i][5]), ["Add.", [props[i][0]]]))
                            return true;
                        if (this.deM(props[props.length - 1]))
                            return true;
                        if (this.inferenceRules(prop))
                            return true;
                    }
                    else if (Tree.compare(new Tree("~", undefined, props[i][5]), root.right.right) || Tree.compare(props[i][5], new Tree("~", undefined, root.right.right))) {
                        if (this.addTransformedProp(new Tree("v", new Tree("~", undefined, root.right.left), props[i][5]), ["Add.", [props[i][0]]]))
                            return true;
                        if (this.deM(props[props.length - 1]))
                            return true;
                        if (this.inferenceRules(prop))
                            return true;
                    }
                }
            }
        }
    },
    //END INFERENCE RULES
    //SEPCIAL DISJUNCT RULE
    // allOperatorsAreDisjuncts: function(tree) {
    //     if (isOperand(tree.top)) return true;
    //     else if (tree.top === "~") {
    //         if (isOperand(tree.right.top)) return true;
    //     }
    //     else if (tree.top === "v") {
    //         if (!allOperatorsAreDisjuncts(tree.left)) return false;
    //         if (!allOperatorsAreDisjuncts(tree.right)) return false;
    //     }
    //     else return false;
    //     return true;
    // },
    isSolved: function () {
        var newlyAddedProp = props[props.length - 1];
        for (var i = 0; i < concs.length; i++) {
            if (Tree.compare(newlyAddedProp[5], concs[i][5])) {
                newlyAddedProp[6] = 1;
                if (!BackwardsSolver.solved(concs[i][2]))
                    return false;
                console.log("*****************ARGUMENT SOLVED****************");
                return true;
            }
            else if (concs[i][5].top === "v") {
                if (Tree.compare(newlyAddedProp[5], concs[i][5].left || Tree.compare(newlyAddedProp[5], concs[i][5].right))) {
                    newlyAddedProp[6] = 1;
                    newlyAddedProp = [props.length + 1, concs[i][1], ["Add.", [props.length]], undefined, undefined, concs[i][5], 1, undefined];
                    props.push(newlyAddedProp);
                    if (!BackwardsSolver.solved(concs[i][2]))
                        return false;
                    console.log("*****************ARGUMENT SOLVED****************");
                    return true;
                }
            }
        }
        return false;
    },
    addTransformedProp: function (tree, trans) {
        tree = this.removeDN(tree);
        tree = this.convertNonTruth(tree);
        // tree = this.removeTautology(tree);
        var propInfix = Tree.treeToInfix(tree);
        if (propInfix.length > 27)
            return false;
        if ((propInfix.split("~").length - 1) > 4)
            return false;
        for (var i = 0; i < props.length; i++) {
            if (propInfix == props[i][1])
                return false;
        }
        if (trans[1].length == 2) {
            console.log("Added Prop using " + trans[0] + ": " + props[trans[1][0] - 1][1] + " & " + props[trans[1][1] - 1][1] + " -> " + props.length + 1 + ". " + propInfix);
            props[trans[1][0] - 1][6] += 1;
            props[trans[1][1] - 1][6] += 1;
        }
        else {
            console.log("Added Prop using " + trans[0] + ": " + props[trans[1][0] - 1][1] + " -> " + propInfix);
            props[trans[1][0] - 1][6] += 1;
        }
        props.push([props.length + 1, propInfix, trans, undefined, undefined, tree, 0, false]);
        if (this.isSolved())
            return true;
        if (this.truthReplacement(props[props.length - 1]))
            return true;
        else
            return false;
    }
}; // END OF SOLVER OBJECT
/********************************
**********BACKWARDS SOLVER**********
*********************************/
var BackwardsSolver = {
    solve: function () {
        console.log("\n**********Building Conclusion Array**********");
        //IDEALLY SHOULD USE WHILE LOOP, BUT WILL USE 10 LOOPS FOR TESTING
        for (var i = 0; i < 13; i++) {
            if (this.heuristic(i))
                return true;
            if (concs.length > 4000)
                break;
        }
        // Cleaner.removeZeros(concs);
        return false;
    },
    solved: function (trans) {
        if (trans[0] === "Given Conclusion")
            return true;
        var conc1 = concs[trans[1][0] - 1].slice(); //Retrieve next conclusion1 and store in conc1
        var newTrans = conc1[2].slice();
        if (trans[0] === "MP") {
            Solver.addTransformedProp(new Tree("v", conc1[5].right, new Tree("~", undefined, conc1[5].left)), ["Add.", [props[props.length - 1][0]]]);
            props[props.length - 1][6] = 1;
            conc1[2] = ["MI", [props.length]];
        }
        else if (trans[0] === "MT") {
            Solver.addTransformedProp(new Tree("v", new Tree("~", undefined, conc1[5].left), conc1[5].right), ["Add.", [props[props.length - 1][0]]]);
            props[props.length - 1][6] = 1;
            conc1[2] = ["MI", [props.length]];
        }
        else if (trans[0] === "DS") {
            conc1[2] = ["Add.", [props.length]];
        }
        else if (trans[0] === "TE") {
            conc1[2] = ["TD", [props.length]];
        }
        else if (trans[0] === "TD") {
            conc1[2] = ["TE", [props.length]];
        }
        else if (trans[0] === "Simp.") {
            var newTransProps = [];
            var haveLeft = (conc1[5].left.top === "TRUE") ? true : false;
            var haveRight = (conc1[5].right.top === "TRUE") ? true : false;
            for (var i = 0; i < props.length; i++) {
                if (haveLeft === false && Tree.compare(conc1[5].left, props[i][5])) {
                    newTransProps.push(i + 1);
                    haveLeft = true;
                }
                if (haveRight === false && Tree.compare(conc1[5].right, props[i][5])) {
                    newTransProps.push(i + 1);
                    haveRight = true;
                }
            }
            if (haveLeft && haveRight) {
                conc1[2] = ["Conj.", newTransProps];
            }
            else
                return false;
        }
        else {
            conc1[2] = [trans[0], [props.length]];
        }
        conc1[0] = props.length + 1; //Change index of conc, to last index of props
        conc1[6] = 1;
        props.push(conc1);
        if (this.solved(newTrans))
            return true;
        return false;
    },
    heuristic: function (count) {
        //RULES IN HEURISTICAL ORDER, BRUTE FORCE
        var i;
        var concsLength = concs.length;
        //Inference rules
        for (i = 0; i < concsLength; i++) {
            if (concs[i][7] !== true) {
                concs[i][7] = true;
                var result = [];
                var root = concs[i][5];
                if (isOperator(root.top)) {
                    //TOP ACTION
                    if (root.top === "=") {
                        //ME
                        if (this.addTransformedConc(new Tree("*", new Tree(">", root.left, root.right), new Tree(">", root.right, root.left)), ["ME", [concs[i][0]]]))
                            return true;
                        if (this.addTransformedConc(new Tree("v", new Tree("*", root.left, root.right), new Tree("*", new Tree("~", undefined, root.left), new Tree("~", undefined, root.right))), ["Truth Table Form", [concs[i][0]]]))
                            return true;
                    }
                    else if (root.top === "v") {
                        //Immediate Inferences
                        if (root.right.top === "TRUE") {
                            if (this.addTransformedConc(root.right, ["Immediate Inference", [concs[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "TRUE") {
                            if (this.addTransformedConc(root.left, ["Immediate Inference", [concs[i][0]]]))
                                return true;
                        }
                        if (root.right.top === "FALSE") {
                            if (this.addTransformedConc(root.left, ["Immediate Inference", [concs[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "FALSE") {
                            if (this.addTransformedConc(root.right, ["Immediate Inference", [concs[i][0]]]))
                                return true;
                        }
                        //Tautology
                        if (Tree.compare(root.left, root.right)) {
                            if (this.addTransformedConc(root.left, ["Tautology", [concs[i][0]]]))
                                return true;
                        }
                        //DISTRIB
                        if (root.left.top === "*" && root.right.top === "*") {
                            //ME
                            if (Tree.compare(new Tree("~", undefined, root.left.left), root.right.left) || Tree.compare(root.left.left, new Tree("~", undefined, root.right.left))) {
                                if (Tree.compare(new Tree("~", undefined, root.left.right), root.right.right) || Tree.compare(root.left.right, new Tree("~", undefined, root.right.right))) {
                                    if (this.addTransformedConc(new Tree("=", root.left.left, root.left.right), ["Truth Table Form", [concs[i][0]]]))
                                        return true;
                                    if (this.addTransformedConc(new Tree("*", new Tree(">", root.left.left, root.left.right), new Tree(">", root.left.right, root.left.left)), ["ME", [concs[i][0]]]))
                                        return true;
                                }
                            }
                            else if (Tree.compare(new Tree("~", undefined, root.left.left), root.right.right) || Tree.compare(root.left.left, new Tree("~", undefined, root.right.right))) {
                                if (Tree.compare(new Tree("~", undefined, root.left.right), root.right.left) || Tree.compare(root.left.right, new Tree("~", undefined, root.right.left))) {
                                    if (this.addTransformedConc(new Tree("=", root.left.left, root.left.right), ["Truth Table Form", [concs[i][0]]]))
                                        return true;
                                    if (this.addTransformedConc(new Tree("*", new Tree(">", root.left.left, root.left.right), new Tree(">", root.left.right, root.left.left)), ["ME", [concs[i][0]]]))
                                        return true;
                                }
                            }
                            //DISTRIB
                            if (Tree.compare(root.left.left, root.right.left)) {
                                if (this.addTransformedConc(new Tree("*", root.left.left, new Tree("v", root.right.right, root.left.right)), ["Distrib.", [concs[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.left, root.right.right)) {
                                if (this.addTransformedConc(new Tree("*", root.left.left, new Tree("v", root.right.left, root.left.right)), ["Distrib.", [concs[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.left)) {
                                if (this.addTransformedConc(new Tree("*", root.left.right, new Tree("v", root.right.right, root.left.left)), ["Distrib.", [concs[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.right)) {
                                if (this.addTransformedConc(new Tree("*", root.left.right, new Tree("v", root.right.left, root.left.left)), ["Distrib.", [concs[i][0]]]))
                                    return true;
                            }
                        }
                        else if (root.right.top === "*") {
                            if (this.addTransformedConc(new Tree("*", new Tree("v", root.left, root.right.left), new Tree("v", root.left, root.right.right)), ["Distrib.", [concs[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "*") {
                            if (this.addTransformedConc(new Tree("*", new Tree("v", root.right, root.left.left), new Tree("v", root.right, root.left.right)), ["Distrib.", [concs[i][0]]]))
                                return true;
                        }
                        //Simp immediately after Dist.
                        if (concs[concs.length - 1][2] === ["Distrib.", [concs[i][0]]]) {
                            if (this.addTransformedConc(concs[concs.length - 1][5].left, ["Simp.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(concs[concs.length - 1][5].right, ["Simp.", [concs[i][0]]]))
                                return true;
                        }
                        //MI
                        if (this.addTransformedConc(new Tree(">", new Tree("~", undefined, root.left), root.right), ["MI", [concs[i][0]]]))
                            return true;
                        if (this.addTransformedConc(new Tree(">", new Tree("~", undefined, root.right), root.left), ["MI", [concs[i][0]]]))
                            return true;
                        //Comm
                        if (this.addTransformedConc(new Tree(root.top, root.right, root.left), ["Comm.", [concs[i][0]]]))
                            return true;
                        if (root.right.top === "v" && root.left.top === "v") {
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.left.left, root.left.right), new Tree("v", root.right.left, root.right.left)), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.left.left, root.right.left), new Tree("v", root.left.right, root.right.left)), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.left.left, root.right.left), new Tree("v", root.left.right, root.right.left)), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.left.right, root.right.left), new Tree("v", root.right.left, root.left.left)), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.left.right, root.right.left), new Tree("v", root.left.left, root.right.left)), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.right.left, root.right.left), new Tree("v", root.left.left, root.left.right)), ["Comm.", [concs[i][0]]]))
                                return true;
                        }
                        if (root.right.top === "v") {
                            if (this.addTransformedConc(new Tree("v", root.right.left, new Tree("v", root.left, root.right.right)), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", root.right.right, new Tree("v", root.left, root.right.left)), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.right.right, root.left), root.right.left), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.right.right, root.right.left), root.left), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.right.left, root.left), root.right.right), ["Comm.", [concs[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "v") {
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.left.left, root.right), root.left.right), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", new Tree("v", root.left.right, root.right), root.left.left), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", root.right, new Tree("v", root.left.left, root.left.right)), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", root.left.left, new Tree("v", root.right, root.left.right)), ["Comm.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree("v", root.left.right, new Tree("v", root.right, root.left.left)), ["Comm.", [concs[i][0]]]))
                                return true;
                        }
                    }
                    else if (root.top === "*") {
                        //Immediate Inferences
                        if (root.right.top === "TRUE") {
                            if (this.addTransformedConc(root.left, ["Immediate Inference", [concs[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "TRUE") {
                            if (this.addTransformedConc(root.right, ["Immediate Inference", [concs[i][0]]]))
                                return true;
                        }
                        //Tautology
                        if (Tree.compare(root.left, root.right)) {
                            if (this.addTransformedConc(root.left, ["Tautology", [concs[i][0]]]))
                                return true;
                        }
                        //SIMP
                        if (this.addTransformedConc(root.left, ["Simp.", [concs[i][0]]]))
                            return true;
                        if (this.addTransformedConc(root.right, ["Simp.", [concs[i][0]]]))
                            return true;
                        //DISTRIB
                        if (root.left.top === "v" && root.right.top === "v") {
                            if (Tree.compare(root.left.left, root.right.left)) {
                                if (this.addTransformedConc(new Tree("v", root.left.left, new Tree("*", root.right.right, root.left.right)), ["Distrib.", [concs[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.left, root.right.right)) {
                                if (this.addTransformedConc(new Tree("v", root.left.left, new Tree("*", root.right.left, root.left.right)), ["Distrib.", [concs[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.left)) {
                                if (this.addTransformedConc(new Tree("v", root.left.right, new Tree("*", root.right.right, root.left.left)), ["Distrib.", [concs[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.right)) {
                                if (this.addTransformedConc(new Tree("v", root.left.right, new Tree("*", root.right.left, root.left.left)), ["Distrib.", [concs[i][0]]]))
                                    return true;
                            }
                        }
                        else if (root.right.top === "v") {
                            if (this.addTransformedConc(new Tree("v", new Tree("*", root.left, root.right.left), new Tree("*", root.left, root.right.right)), ["Distrib.", [concs[i][0]]]))
                                return true;
                        }
                        else if (root.left.top === "v") {
                            if (this.addTransformedConc(new Tree("v", new Tree("*", root.right, root.left.left), new Tree("*", root.right, root.left.right)), ["Distrib.", [concs[i][0]]]))
                                return true;
                        }
                        //ME
                        if (root.left.top === ">" && root.right.top === ">") {
                            if (Tree.compare(root.left.left, root.right.right) && Tree.compare(root.left.right, root.right.left)) {
                                if (this.addTransformedConc(new Tree("=", root.left.left, root.right.left), ["ME", [concs[i][0]]]))
                                    return true;
                                if (this.addTransformedConc(new Tree("v", new Tree("*", root.left.left, root.right.left), new Tree("*", new Tree("~", undefined, root.left.left), new Tree("~", undefined, root.right.left))), ["Truth Table Form", [concs[i][0]]]))
                                    return true;
                            }
                            else if (Tree.compare(root.left.right, root.right.left) && Tree.compare(root.left.left, root.right.right)) {
                                if (this.addTransformedConc(new Tree("=", root.left.left, root.right.left), ["ME", [concs[i][0]]]))
                                    return true;
                                if (this.addTransformedConc(new Tree("v", new Tree("*", root.left.left, root.right.left), new Tree("*", new Tree("~", undefined, root.left.left), new Tree("~", undefined, root.right.left))), ["Truth Table Form", [concs[i][0]]]))
                                    return true;
                            }
                        }
                    }
                    else if (root.top === ">") {
                        //Immediate Inferences
                        if (root.left.top === "TRUE") {
                            if (this.addTransformedConc(root.right, ["Immediate Inference", [concs[i][0]]]))
                                return true;
                        }
                        else if (root.right.top === "FALSE") {
                            if (this.addTransformedConc(new Tree("~", undefined, root.left), ["Immediate Inference", [concs[i][0]]]))
                                return true;
                        }
                        //EXP
                        if (root.left.top === "*") {
                            if (this.addTransformedConc(new Tree(">", root.left.left, new Tree(">", root.left.right, root.right)), ["Exp.", [concs[i][0]]]))
                                return true;
                            if (this.addTransformedConc(new Tree(">", root.left.right, new Tree(">", root.left.left, root.right)), ["Exp.", [concs[i][0]]]))
                                return true;
                        }
                        else if (root.right.top === ">") {
                            if (this.addTransformedConc(new Tree(">", new Tree("*", root.left, root.right.left), root.right.right), ["Exp.", [concs[i][0]]]))
                                return true;
                        }
                        //ABS
                        if (root.right === "*") {
                            if (Tree.compare(root.right.left, root.left)) {
                                if (this.addTransformedConc(new Tree(">", root.left, root.right.right), ["Abs.", [concs[i][0]]]))
                                    return true;
                            }
                        }
                        //MI
                        if (this.addTransformedConc(new Tree("v", new Tree("~", undefined, root.left), root.right), ["MI", [concs[i][0]]]))
                            return true;
                        //TRANS
                        if (this.addTransformedConc(new Tree(">", new Tree("~", undefined, root.right), new Tree("~", undefined, root.left)), ["Trans.", [concs[i][0]]]))
                            return true;
                    }
                    //************* ENTER RECURSIVE FUNCTIONS *****************
                    //START RECURSIVE LEFT
                    if (root.top !== "~") {
                        result = Solver.heuristicRecursive(root.left, []);
                        for (var x = 0; x < result.length; x++) {
                            if (this.addTransformedConc(new Tree(root.top, result[x][1], root.right), [result[x][0], [concs[i][0]]]))
                                return true;
                        }
                    }
                    //START RECURSIVE RIGHT
                    result = Solver.heuristicRecursive(root.right, []);
                    for (var x = 0; x < result.length; x++) {
                        if (this.addTransformedConc(new Tree(root.top, root.left, result[x][1]), [result[x][0], [concs[i][0]]]))
                            return true;
                    }
                }
            }
            // ********** END RECURSIVE FUNCTIONS ***********
            if (this.inferenceRules(concs[i]))
                return true;
            if (count < 2 || count > 10) {
                if (this.deM(concs[i]))
                    return true;
            }
            if (concs.length > 3000)
                return false;
        }
        return false;
    },
    truthReplacement: function (conc) {
        var result = [];
        var root = conc[5];
        //TOP ACTION
        if (isOperand(root.top))
            return false;
        if (root.top === "*") {
            if (Tree.compare(new Tree("~", undefined, root.left), root.right) || Tree.compare(root.left, new Tree("~", undefined, root.right))) {
                conc[7] = true;
                if (this.addTransformedConc(new Tree("FALSE"), ["Consistency", [conc[0]]]))
                    return true;
            }
        }
        else if (root.top === "v") {
            if (Tree.compare(new Tree("~", undefined, root.left), root.right) || Tree.compare(root.left, new Tree("~", undefined, root.right))) {
                conc[7] = true;
                if (this.addTransformedConc(new Tree("TRUE"), ["Excluded Middle", [conc[0]]]))
                    return true;
            }
        }
        //START RECURSIVE LEFT
        if (root.top !== "~") {
            result = Solver.truthReplacementRecursive(root.left, []);
            for (var x = 0; x < result.length; x++) {
                conc[7] = true;
                if (this.addTransformedConc(new Tree(root.top, result[x][1], root.right), [result[x][0], [conc[0]]]))
                    return true;
            }
        }
        //START RECURSIVE RIGHT
        result = Solver.truthReplacementRecursive(root.right, []);
        for (var x = 0; x < result.length; x++) {
            conc[7] = true;
            if (this.addTransformedConc(new Tree(root.top, root.left, result[x][1]), [result[x][0], [conc[0]]]))
                return true;
        }
        return false;
    },
    inferenceRules: function (conc) {
        var root = conc[5];
        if (root.top === undefined || isOperand(root.top))
            return false;
        for (var i = 0; i < concs.length; i++) {
            if (conc[0] === concs[i][0]) { }
            else if (root.top === "v") {
                if (Tree.compare(new Tree("~", undefined, root.right), concs[i][5]) || Tree.compare(root.right, new Tree("~", undefined, concs[i][5]))) {
                    if (this.addTransformedConc(root.left, ["DS", [conc[0], concs[i][0]]]))
                        return true;
                }
                else if (Tree.compare(new Tree("~", undefined, root.left), concs[i][5]) || Tree.compare(root.left, new Tree("~", undefined, concs[i][5]))) {
                    if (this.addTransformedConc(root.right, ["DS", [conc[0], concs[i][0]]]))
                        return true;
                }
            }
            else if (root.top === ">") {
                if (Tree.compare(root.left, concs[i][5])) {
                    if (this.addTransformedConc(root.right, ["MP", [conc[0], concs[i][0]]]))
                        return true;
                }
                if (Tree.compare(new Tree("~", undefined, root.right), concs[i][5]) || Tree.compare(root.right, new Tree("~", undefined, concs[i][5]))) {
                    if (this.addTransformedConc(new Tree("~", undefined, root.left), ["MT", [conc[0], concs[i][0]]]))
                        return true;
                }
            }
        }
        return false;
    },
    // DeM.                 ~(A*B)==(~A|~B)
    //                      ~(A|B)==(~A*~B)
    deM: function (conc) {
        var result = [];
        var root = conc[5];
        //TOP ACTION
        if (root.top === undefined || isOperand(root.top))
            return false;
        if (root.top === "~") {
            if (root.right.top === "*") {
                if (this.addTransformedConc(new Tree("v", new Tree("~", undefined, root.right.left), new Tree("~", undefined, root.right.right)), ["TD", [conc[0]]]))
                    return true;
            }
            else if (root.right.top === "v") {
                if (this.addTransformedConc(new Tree("*", new Tree("~", undefined, root.right.left), new Tree("~", undefined, root.right.right)), ["TD.", [conc[0]]]))
                    return true;
            }
        }
        else if (root.top === "v") {
            if (this.addTransformedConc(new Tree("~", undefined, new Tree("*", new Tree("~", undefined, root.left), new Tree("~", undefined, root.right))), ["TE", [conc[0]]]))
                return true;
        }
        else if (root.top === "*") {
            if (this.addTransformedConc(new Tree("~", undefined, new Tree("v", new Tree("~", undefined, root.left), new Tree("~", undefined, root.right))), ["TE", [conc[0]]]))
                return true;
        }
        //START RECURSIVE LEFT
        if (root.top !== "~") {
            result = this.deMRecursive(root.left, []);
            for (var x = 0; x < result.length; x++) {
                if (this.addTransformedConc(new Tree(root.top, result[x][1], root.right), [result[x][0], [conc[0]]]))
                    return true;
            }
        }
        //START RECURSIVE RIGHT
        result = this.deMRecursive(root.right, []);
        for (var x = 0; x < result.length; x++) {
            if (this.addTransformedConc(new Tree(root.top, root.left, result[x][1]), [result[x][0], [conc[0]]]))
                return true;
        }
        return false;
    },
    deMRecursive: function (conc, result) {
        var resultRecursive = [];
        var x;
        if (conc.top === undefined || isOperand(conc.top))
            return result;
        //RECURSIVE ACTION
        if (conc.top === "~") {
            if (conc.right.top === "*") {
                result.push(["TD", new Tree("v", new Tree("~", undefined, conc.right.left), new Tree("~", undefined, conc.right.right))]);
            }
            else if (conc.right.top === "v") {
                result.push(["TD", new Tree("*", new Tree("~", undefined, conc.right.left), new Tree("~", undefined, conc.right.right))]);
            }
        }
        else if (conc.top === "v") {
            result.push(["TE", new Tree("~", undefined, new Tree("*", new Tree("~", undefined, conc.left), new Tree("~", undefined, conc.right)))]);
        }
        else if (conc.top === "*") {
            result.push(["TE", new Tree("~", undefined, new Tree("v", new Tree("~", undefined, conc.left), new Tree("~", undefined, conc.right)))]);
        }
        //CONTINUE RECURSIVE LEFT
        if (conc.top !== "~") {
            resultRecursive = this.deMRecursive(conc.left, []);
            for (x = 0; x < resultRecursive.length; x++) {
                result.push([resultRecursive[x][0], new Tree(conc.top, resultRecursive[x][1], conc.right)]);
            }
        }
        //CONTINUE RECURSIVE RIGHT
        resultRecursive = this.deMRecursive(conc.right, []);
        for (x = 0; x < resultRecursive.length; x++) {
            result.push([resultRecursive[x][0], new Tree(conc.top, conc.left, resultRecursive[x][1])]);
        }
        return result;
    },
    aDd: function (conc) {
        var i;
        var root = conc[5];
        if (isOperand(root.top))
            return false;
        if (root.top === ">") {
            if (root.left.top === "v") {
                for (i = 0; i < concs.length; i++) {
                    if (Tree.compare(concs[i][5], root.left.left)) {
                        if (this.addTransformedConc(new Tree("v", concs[i][5], root.left.right), ["Add.", [concs[i][0]]]))
                            return true;
                        if (this.inferenceRules(conc))
                            return true;
                    }
                    else if (Tree.compare(concs[i][5], root.left.right)) {
                        if (this.addTransformedConc(new Tree("v", concs[i][5], root.left.left), ["Add.", [concs[i][0]]]))
                            return true;
                        if (this.inferenceRules(conc))
                            return true;
                    }
                }
            }
        }
        else if (root.top === ">") {
            if (root.right.top === "*") {
                for (i = 0; i < concs.length; i++) {
                    if (Tree.compare(new Tree("~", undefined, concs[i][5]), root.right.left) || Tree.compare(concs[i][5], new Tree("~", undefined, root.right.left))) {
                        if (this.addTransformedConc(new Tree("v", new Tree("~", undefined, root.right.right), concs[i][5]), ["Add.", [concs[i][0]]]))
                            return true;
                        if (concs[concs.length - 1][2] === ["Add.", [concs[i][0]]]) {
                            if (this.deM(concs[concs.length - 1]))
                                return true;
                            if (this.inferenceRules(conc))
                                return true;
                        }
                    }
                    else if (Tree.compare(new Tree("~", undefined, concs[i][5]), root.right.right) || Tree.compare(concs[i][5], new Tree("~", undefined, root.right.right))) {
                        if (this.addTransformedConc(new Tree("v", new Tree("~", undefined, root.right.left), concs[i][5]), ["Add.", [concs[i][0]]]))
                            return true;
                        if (concs[concs.length - 1][2] === ["Add.", [concs[i][0]]]) {
                            if (this.deM(concs[concs.length - 1]))
                                return true;
                            if (this.inferenceRules(conc))
                                return true;
                        }
                    }
                }
            }
        }
    },
    //END INFERENCE RULES
    isSolved: function () {
        for (var i = 0; i < props.length; i++) {
            if (Tree.compare(concs[concs.length - 1][5], props[i][5])) {
                console.log("*****************ARGUMENT SOLVED****************");
                if (this.solved(concs[concs.length - 1][2]))
                    return true;
                return true;
            }
        }
        return false;
    },
    addTransformedConc: function (tree, trans) {
        tree = Solver.removeDN(tree);
        tree = Solver.convertNonTruth(tree);
        var concInfix = Tree.treeToInfix(tree);
        if (concInfix.length > 27)
            return false;
        if ((concInfix.split("~").length - 1) > 4)
            return false;
        for (var i = 0; i < concs.length; i++) {
            if (concInfix == concs[i][1])
                return false;
        }
        if (trans[1].length == 2) {
            console.log("Added Conc using " + trans[0] + ": " + concs[trans[1][0] - 1][1] + " & " + concs[trans[1][1] - 1][1] + " -> " + concInfix);
        }
        else {
            console.log("Added Conc using " + trans[0] + ": " + concs[trans[1][0] - 1][1] + " -> " + concInfix);
        }
        concs.push([concs.length + 1, concInfix, trans, undefined, undefined, tree, 0, false, undefined]);
        if (this.truthReplacement(concs[concs.length - 1]))
            return true;
        // if (this.isSolved()) return true;
        return false;
    }
}; // END OF BACKWARDS SOLVER
/********************************
**********CLEANER OBJECT**********
*********************************/
var Cleaner = {
    cleanup: function () {
        // check if this prop uses any other props besides given ones. If so then check those,
        var propsUsed = [props.length];
        propsUsed = this.check(props[props.length - 1], propsUsed);
        propsUsed.sort(function (a, b) { return a - b; });
        this.keepProps(propsUsed);
        return;
    },
    check: function (propToCheck, propsUsed) {
        if (propToCheck[2][0] === "Given Proposition")
            return propsUsed;
        for (var i = 0; i < propToCheck[2][1].length; i++) {
            if ($.inArray(propToCheck[2][1][i], propsUsed) === -1) {
                propsUsed.push(propToCheck[2][1][i]);
                propsUsed = this.check(props[propToCheck[2][1][i] - 1], propsUsed);
            }
        }
        return propsUsed;
    },
    keepProps: function (propsUsed) {
        var newProps = [];
        var i;
        for (i = 0; i < propsUsed.length; i++) {
            var transIndex = props[propsUsed[i] - 1][2][1].slice();
            if (transIndex.length === 2) {
                if (transIndex[0] > transIndex[1]) {
                    props[propsUsed[i] - 1][2][1][1] = transIndex[0];
                    props[propsUsed[i] - 1][2][1][0] = transIndex[1];
                }
            }
            newProps.push(props[propsUsed[i] - 1]);
        }
        finalProps = newProps;
        //RECALIBRATE NUMBERS
        var currentProp = 1;
        for (i = 0; i < finalProps.length; i++) {
            var numToChange = finalProps[i][0];
            for (var j = 0; j < finalProps.length; j++) {
                for (var l = 0; l < finalProps[j][2][1].length; l++) {
                    if (finalProps[j][2][0] !== "Given Proposition") {
                        if (finalProps[j][2][1][l] == numToChange) {
                            finalProps[j][2][1][l] = currentProp;
                        }
                    }
                }
            }
            finalProps[i][0] = currentProp;
            currentProp++;
        }
        return;
    },
    removeZeros: function (propArray) {
        for (var i = 0; i < propArray.length; i++) {
            if (propArray[i][6] === 0) {
                console.log("removed: " + propArray[i][1]);
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
    infixToPostfix: function (infixStr) {
        console.log(infixStr);
        var postfixStr = [];
        var stackArr = [];
        var postfixPtr = 0;
        var infixArr = infixStr.split("");
        for (var i = 0; i < infixArr.length; i++) {
            if (isOperand(infixArr[i])) {
                postfixStr[postfixPtr] = infixArr[i];
                postfixPtr++;
            }
            else if (isOperator(infixArr[i])) {
                while ((stackArr.length !== 0) && (prcd(infixArr[i]) <= prcd(stackArr[stackArr.length - 1])) && infixArr[i] !== "~") {
                    postfixStr[postfixPtr] = stackArr.pop();
                    postfixPtr++;
                }
                stackArr.push(infixArr[i]);
            }
            else if (infixArr[i] == "(")
                stackArr.push(infixArr[i]);
            else if (infixArr[i] == ")") {
                while (stackArr[stackArr.length - 1] != "(") {
                    postfixStr[postfixPtr] = stackArr.pop();
                    postfixPtr++;
                }
                stackArr.pop();
            }
        }
        while (stackArr.length !== 0) {
            if (stackArr[stackArr.length - 1] == "(")
                stackArr.pop();
            else
                postfixStr[postfixStr.length] = stackArr.pop();
        }
        console.log("" + infixStr + " transformed to postix notation: " + postfixStr.join(''));
        return postfixStr.join('');
    },
    postfixSubEval: function (sym, prop1, prop2) {
        var returnVal;
        if (sym == "~")
            returnVal = (prop1 === "T") ? "F" : "T";
        else if (sym == "*")
            returnVal = (prop1 === "F" || prop2 === "F") ? "F" : "T";
        else if (sym == ">")
            returnVal = (prop1 === "F" || prop2 === "T") ? "T" : "F";
        else if (sym == "v")
            returnVal = (prop1 === "T" || prop2 === "T") ? "T" : "F";
        else if (sym == "=")
            returnVal = (prop1 == prop2) ? "T" : "F";
        return returnVal;
    },
    // PRECONDITION: postfixStr must be in T & F
    postfixEval: function (postfixStr) {
        var stackArr = [];
        postfixStr = postfixStr.split('');
        for (var i = 0; i < postfixStr.length; i++) {
            if (postfixStr[i] == "T" || postfixStr[i] == "F")
                stackArr.push(postfixStr[i]);
            else {
                var pushVal;
                if (postfixStr[i] == "~") {
                    pushVal = this.postfixSubEval(postfixStr[i], stackArr.pop());
                }
                else {
                    var temp = stackArr.pop();
                    pushVal = this.postfixSubEval(postfixStr[i], stackArr.pop(), temp);
                }
                stackArr.push(pushVal);
            }
        }
        return (stackArr[0]);
    }
};
/********************************
***********TREE OBJECT***********
*********************************/
var Tree = (function () {
    //PRECONDITON: Must be in Postfix first
    // Turns AB>r~*pr>> into:
    //               >
    //             /   \
    //            /     \
    //           /       \
    //         *           >
    //       /   \       /   \
    //      >     ~     A     r
    //    /  \      \
    //   A    B      r
    // RULES: every operation must have 2 children
    //        except "~" has 1 right child and no left child
    //        every operator is a leaf
    function Tree(top, left, right) {
        this.top = top;
        this.left = left;
        this.right = right;
        this.simplify();
    }
    Tree.prototype.simplify = function () {
        if (this.top === "~") {
            if (this.right === "FALSE") {
                this.top = "TRUE";
                this.right = undefined;
            }
            else if (this.right === "TRUE") {
                this.top = "FALSE";
                this.right = undefined;
            }
        }
        else if (this.top === "=") {
            if (this.left instanceof Tree && this.right instanceof Tree) {
                if (this.left.top === "~" && this.right.top === "~") {
                    this.top = this.top;
                    this.left = this.left.right;
                    this.right = this.right.right;
                }
            }
        }
    };
    Tree.postfixToTree = function (postfixStr) {
        var postfixArr = postfixStr.split("");
        var tree = new Tree(postfixArr.pop());
        console.log("Transformed " + postfixStr + " to Tree Data Structure");
        return this.postfixToTreeRecursive(tree, postfixArr);
    };
    Tree.postfixToTreeRecursive = function (node, postfixArr) {
        if (isOperand(node.top))
            return node;
        // New right node
        node.right = this.postfixToTreeRecursive(new Tree(postfixArr.pop()), postfixArr);
        // New left node
        if (node.top !== "~") {
            node.left = this.postfixToTreeRecursive(new Tree(postfixArr.pop()), postfixArr);
        }
        return node;
    };
    Tree.treeToInfix = function (tree) {
        var infixArr = [];
        if (isOperand(tree.top))
            return tree.top;
        if (tree.top !== "~") {
            infixArr = infixArr.concat(this.treeToInfixRecursive(tree.left));
        }
        infixArr.push(tree.top);
        infixArr = infixArr.concat(this.treeToInfixRecursive(tree.right));
        return infixArr.join('');
    };
    Tree.treeToInfixRecursive = function (node) {
        var infixArr = [];
        //Left
        if (isOperand(node.top))
            return node.top;
        if (node.top !== "~") {
            infixArr.push("(");
            infixArr = infixArr.concat(this.treeToInfixRecursive(node.left));
        }
        //Top
        infixArr.push(node.top);
        //Right
        infixArr = infixArr.concat(this.treeToInfixRecursive(node.right));
        if (node.top !== "~")
            infixArr.push(")");
        return infixArr;
    };
    Tree.gatherLeaves = function (tree, leaves) {
        return leaves;
    };
    //Compares two trees to see if they're equal
    Tree.compare = function (x, y) {
        if (x === y)
            return true; // undefined, null, TRUE, FALSE, etc.
        else if (x === undefined || y === undefined)
            return false; // unused leaf node
        else if (x.top === y.top) {
            if (isOperand(x.top))
                return true;
            if (x.top === "~") {
                if (!this.compare(x.right, y.right))
                    return false;
                return true;
            }
            else if (x.top === ">") {
                if (!this.compare(x.left, y.left))
                    return false;
                if (!this.compare(x.right, y.right))
                    return false;
                return true;
            }
            else if (x.top === "*" || x.top === "=" || x.top === "v") {
                if (this.compare(x.left, y.left)) {
                    if (!this.compare(x.right, y.right))
                        return false;
                    return true;
                }
                else if (this.compare(x.left, y.right)) {
                    if (!this.compare(x.right, y.left))
                        return false;
                    return true;
                }
            }
        }
        else
            return false;
    };
    return Tree;
})();
;
