const Get_Shuffled= (array:any[],maxValue:number) => {
    let currentIndex = Math.min(maxValue,array.length); 
    let randomIndex=0;
    let results:number[]=[]
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
        results.push(array[randomIndex]);
    }
    return results;

  }

export default Get_Shuffled
