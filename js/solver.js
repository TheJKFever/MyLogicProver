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
        var _arg=[];
        for (var i=0;i<args.length;i++){
            _arg[i]=args[i][0];
        }
        _arg = InfixToPostfix.infixToPostfix(_arg.join("*"))+"%"+conc;
        //loop 256 times for all truth values, and test
        

        for (var p=0;p<2;p++){
            for (var q=0;q<2;q++){
                for (var r=0;r<2;r++){
                    for (var s=0;s<2;s++){
                        for (var t=0;t<2;t++){
                            for (var u=0;u<2;u++){
                                for (var v=0;v<2;v++){
                                    for (var w=0;w<2;w++){
                                        var tempArgToSolve = _arg;
                                        tempArgToSolve = replacePropWithTorF(tempArgToSolve,p,q,r,s,t,u,v,w);
                                        tempArgToSolve = tempArgToSolve.split("%");
                                        tempConc = InfixToPostfix.postfixEval(tempArgToSolve[1]);
                                        tempArgToSolve = InfixToPostfix.postfixEval(tempArgToSolve[0]);
                                        if (tempArgToSolve!==tempConc){
                                            return false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return true;
    },

    replacePropWithTorF: function(testArgs,p,q,r,s,t,u,v,w){
        testArgs = tempArgToSolve.replaceAll("p",binary(p));
        testArgs = tempArgToSolve.replaceAll("q",binary(q));
        testArgs = tempArgToSolve.replaceAll("r",binary(r));
        testArgs = tempArgToSolve.replaceAll("s",binary(s));
        testArgs = tempArgToSolve.replaceAll("t",binary(t));
        testArgs = tempArgToSolve.replaceAll("u",binary(u));
        testArgs = tempArgToSolve.replaceAll("v",binary(v));
        testArgs = tempArgToSolve.replaceAll("w",binary(w));
        return testArgs;
    },

    binary: function(oneOrZero){
        if (oneOrZero===0){
            return "F";
        } else {
            return "T";
        }
    }

}; // End of Solver declaration.


String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};