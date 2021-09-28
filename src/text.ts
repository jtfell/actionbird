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

// TODO: Limit max number
const hashCode = (s, l) => s.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

const findSuitableWord = (word, kFactor, options) => {
  let i = options.indexOf(word);
  if (i === -1) {
    // Find another word starting with the same 2 first letters
    i = options.findIndex(w => w.startsWith(`${word[0]}${word[1]}`));

    if (i === -1) {
      // Find another word starting with the same first letter
      i = options.findIndex(w => w.startsWith(`${word[0]}`));
    }

    // i = hashCode(word, options.length);
  }

  let toSub = options[i + kFactor];
  while (calculatePolarity(toSub) < 0) {
    toSub = options[i + kFactor];
    i++;
  }
  return toSub;
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

 let count = 0;
 const wordsToSubsitute = wordsInTweet.filter(w => w.polarity <= 0).map(w => {
   if (w.class === 'NOUN') {
     const toSub = findSuitableWord(w.word, kFactor, NOUNS);
     text = text.replace(new RegExp(w.word, 'i'), toSub);
     count++;
   }

   if (w.class === 'ADJECTIVE') {
     const toSub = findSuitableWord(w.word, kFactor, ADJECTIVES);
     text = text.replace(new RegExp(w.word, 'i'), toSub);
     count++;
   }
 });

 // If no changes, don't tweet it.
 if (count === 0) {
   return null;
 }

 return text;
};

