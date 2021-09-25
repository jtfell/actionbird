import { rewriteText } from './text';

const TEST = `Another 
@ScottMorrisonMP
 vaccination failure with forged vaccination certificates now on our streets. It’s almost 2 months since I alerted the Govt to this issue and presented them with a technical solution. Instead they pursue COVIDSafe 2.0 🤦‍♂️ #auspol`;

console.log(rewriteText(TEST, 15));

