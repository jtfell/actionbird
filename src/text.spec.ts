import { rewriteText } from './text';

const TEST = [
  `Another 
@ScottMorrisonMP
 vaccination failure with forged vaccination certificates now on our streets. It’s almost 2 months since I alerted the Govt to this issue and presented them with a technical solution. Instead they pursue COVIDSafe 2.0 🤦‍♂️ #auspol`,
 `And Clive Palmer is out spending millions of dollars spreading misinformation, backing up the anti-vax fake news via text messages to everyone in the country, but the gov says nothing, presumably waiting for another election-time boost from the billionaire.`
];

console.log(TEST.map(t => rewriteText(t, 15)));

