

**MyLogicProver** is an inference enginer that using the rules of Aristotelian logic to prove a conclusion using a given set of premises. It will first determine if the conclusion is logically provable using only the set of premises. Then it then use a variad of artificial intelligence techniques such as a combination of forward and backward chaining, guided heuristics, and intelligent elimination to identify a short path of inference from the premises to the conclusion. All code is written in javascript.

### Future developments: ###
* Currently, MyLogicProver is only able to take 8 variables for it's premises and conclusions. I would like to change this to be an unlimited number of variables. 
* The operators are limited to certain characters, but I would like to include code that will recognize natural langauage such as "not X is Y".
* Update the heuristic to calculate probabilities of each next tranformation being the likely shortest path toward the conclusion/premise in forward/bakward search (based off number of variables, apriori statistics of each transformation being included in a solution, etc), and prefer the higher probability transformations.
