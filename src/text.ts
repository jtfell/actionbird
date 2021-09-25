import { readFileSync } from 'fs';
import { CUSTOM_WORDS } from './customWords';

//
//
//
const NEGATIVE_WORDS = readFileSync(`${__dirname}/../data/negative-words.txt`, 'utf8').split('\n').filter(w => !!w);
const isNegative = w => NEGATIVE_WORDS.includes(w);

//
//
//
const AFINN_165 = JSON.parse(readFileSync(`${__dirname}/../data/afinn-165.json`, 'utf8'));

//
// https://github.com/felixfischer/categorized-words
//
const WORDS = JSON.parse(readFileSync(`${__dirname}/../data/wordlist.json`, 'utf8'));
const { N: NOUNS, A: ADJECTIVES, V: VERBS, P: PRONOUNS, I: INTERJECTIONS, C: CONJUNCTION } = WORDS;
const isNoun = w => NOUNS.includes(w);
const isAdjective = w => ADJECTIVES.includes(w);

const classify = w => {
 if (isNoun(w)) return 'NOUN';
 if (isAdjective(w)) return 'ADJECTIVE';
};

//
//
//
const SENTICON = JSON.parse(readFileSync(`${__dirname}/../data/senticon_en.json`, 'utf8'));

const calculatePolarity = w => {
 if (SENTICON[w] !== undefined) {
   return parseFloat(SENTICON[w].pol);
 }
 if (AFINN_165[w] !== undefined) {
   // Normalise
   AFINN_165[w] / 5.0;
 }

 // Baseline negative
 if (isNegative(w)) {
   return -0.05;
 }
};
 
//
// 
//
export const rewriteText = (text, kFactor) => {
 const wordsInTweet = text.split(' ').map(w => w.toLowerCase().replace(/[^A-Za-z0-9]/g, '')).map(word => ({
   word,
   polarity: calculatePolarity(word),
   class: classify(word),
   ...CUSTOM_WORDS[word],
 }));

 const wordsToSubsitute = wordsInTweet.filter(w => w.polarity <= 0).map(w => {
   if (w.class === 'NOUN') {
     const i = NOUNS.indexOf(w.word);
     const toSub = NOUNS[i + kFactor];
     text = text.replace(new RegExp(w.word, 'i'), toSub);
   }

   if (w.class === 'ADJECTIVE') {
     const i = ADJECTIVES.indexOf(w.word);
     const toSub = ADJECTIVES[i + kFactor];
     text = text.replace(new RegExp(w.word, 'i'), toSub);
   }
 });

 return text;
};

