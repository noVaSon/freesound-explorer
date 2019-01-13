import { removeObjEntriesWithValueBelow, castObjKeysToDescendingArraySortedByValue } from './objectUtils';
import { changeArrayOfStringsToLowerCase, countOccurrencesOfEntries } from './arrayUtils';

// modified version of https://codepen.io/ccallen001/pen/YGOzRA
const mostFreqStr = (arr, clusterSize) => {
  // TODO: re-factor ErrorHandling

  // ERROR HANDLING
  // more than one argument passed
  // the argument is not an array OR if it's empty
  if (!Array.isArray(arr) || arr.length < 1) {
    return console.log('Sorry, you may only pass an array of strings to mostFreqStr.');
  }
  // an element in arr is not a string
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'string') {
      return console.log(`Sorry, element at index ${i} is not a string.`);
    }
  }

  const lcArr = changeArrayOfStringsToLowerCase(arr);
  const countObj = countOccurrencesOfEntries(lcArr);
  const prunedObj = removeObjEntriesWithValueBelow(countObj, Math.log(clusterSize));

  return castObjKeysToDescendingArraySortedByValue(prunedObj);
}

export const frequentPatterns = (transactions, rawQuery) => {
  return new Promise((resolve, reject) => {
    try {
      const frequent = mostFreqStr(_.flatten(transactions), transactions.length);
      const query = rawQuery.toLowerCase();
      const result = frequent.filter((rawEntry, _, arr) => {
        const entry = rawEntry.toLowerCase();
        // filter out plural or singular versions of the original query or any entry
        // saves the plural versions rather than singular ones, covering a few irregular
        return (
          !(entry === query
          || query.split(/\W/).includes(entry) // any terms in the query
          || query.split(/\W/).map(e => e.slice(0, -2)).includes(`${entry}`)
          || query.split(/\W/).map(e => `${e}ing`).includes(`${entry}`) // -ing
          || query.split(/\W/).map(e => `${e.slice(0,-1)}ing`).includes(`${entry}`) // irregular: race, racing
          || query.split(/\W/).map(e => `${e}s`).includes(`${entry}`) // plural
          || query.split(/\W/).map(e => `${e}ed`).includes(`${entry}`) // past
          || arr.includes(`${entry}s`) // variants of exisiting base terms
          || arr.includes(`${entry}ing`)
          || arr.includes(`${entry}oes`)
          || arr.includes(`${entry}en`)
          || arr.includes(`${entry}ren`)
          || arr.includes(`${entry.slice(0, -1)}ves`)
          || arr.includes(`${entry.slice(0, -2)}ves`)
          )
        );
      });
      if (result.length) {
        resolve(result);
      } else resolve([]);
    } catch (e) {
      console.log(e);
      reject([]);
    }
  });
};
