
var InfixToPostfix = {
	isOperand: function(who)
	{
		return((!isOperator(who) && (who!="(") && (who!=")"))? true : false);
	},

	isOperator: function(who)
	{
		return((who=="*" || who=="|" || who==">" || who=="=" || who==">")? true : false);
	},

	isEmpty: function(stackArr)
	{
		return((stackArr.length===0)? true : false);
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
		postfixStr=[];
		var stackArr=[];
		var postfixPtr=0;
		infixStr=infixStr.split("");
		for(var i=0; i<infixStr.length; i++)
		{
			if(isOperand(infixStr[i]))
			{
				postfixStr[postfixPtr]=infixStr[i];
				postfixPtr++;
			}
			else if(isOperator(infixStr[i]))
			{
				while((!isEmpty(stackArr)) && (prcd(infixStr[i])<=prcd(stackArr[stackArr.length-1])))
				{
					postfixStr[postfixPtr]=pop(stackArr);
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
					postfixStr[postfixPtr]=pop(stackArr);
					postfixPtr++;
				}
				pop(stackArr);
			}
		}
		while(!isEmpty(stackArr))
		{
			if(stackArr[stackArr.length-1]=="(")
				pop(stackArr);
			else
				postfixStr[postfixStr.length]=pop(stackArr);
		}
		alert(postfixStr.join(''));
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
			if(isOperand(postfixStr[i]))
				stackArr.push(postfixStr[i]);
			else
			{
				var pushVal;
				if (postfixStr[i]=="~"){
					pushVal=PostfixSubEval(pop(postfixStr[i],stackArr));
				} else {
					var temp=pop(stackArr);
					pushVal=PostfixSubEval(postfixStr[i],pop(stackArr),temp);
				}
				stackArr.push(pushVal);
			}
		}
		return(stackArr[0]);
	}
};