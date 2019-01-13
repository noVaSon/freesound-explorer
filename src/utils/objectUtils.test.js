import deepFreeze from 'deep-freeze';
import * as utils from './objectUtils';

describe('object utils', () => {
  describe('getObjectPropertyTokens', () => {
    it('correctly returns all the tokens in property', () => {
      const property = 'x.abc.y.d';
      const expectedTokens = ['x', 'abc', 'y', 'd'];
      const property2 = 'x[0].abc.y';
      const expectedTokens2 = ['x', '0', 'abc', 'y'];
      expect(utils.getObjectPropertyTokens(property)).toEqual(expectedTokens);
      expect(utils.getObjectPropertyTokens(property2)).toEqual(expectedTokens2);
    });
  });
  describe('readObjectPropertyByPropertyAbsName', () => {
    it('correctly returns the property value of an object', () => {
      const x = { a: [22, { b: 3 }] };
      expect(utils.readObjectPropertyByPropertyAbsName(x, 'a[1].b')).toEqual(3);
      expect(utils.readObjectPropertyByPropertyAbsName(x, 'a.1.b')).toEqual(3);
    });
  });
  describe('getPropertyArrayOfDictionaryEntries', () => {
    it('correctly returns the array of property values of an dictionary like object', () => {
      const x = {
        0: { a: [22, { b: 3 }] },
        1: { a: [22, { b: 2 }] },
      };
      expect(utils.getPropertyArrayOfDictionaryEntries(x, 'a[1].b')).toEqual([3, 2]);
      expect(utils.getPropertyArrayOfDictionaryEntries(x, 'a.1.b')).toEqual([3, 2]);
    });
  });
  describe('pureDeleteObjectKey', () => {
    const testObj = { x: 1, y: { a: 4, b: [3, 4, 5], c: { d: 1 } } };
    deepFreeze(testObj);
    it('correctly removes properties without changing the original object', () => {
      const testProp = 'y.b';
      const expectedOutput = { x: 1, y: { a: 4, c: { d: 1 } } };
      expect(utils.pureDeleteObjectKey(testObj, testProp)).toEqual(expectedOutput);
      const minLength = 'y';
      const expectedOutput2 = { x: 1 };
      expect(utils.pureDeleteObjectKey(testObj, minLength)).toEqual(expectedOutput2);
    });
    it('correcly handles unexisting properties', () => {
      const testProp = 'z.d';
      expect(utils.pureDeleteObjectKey(testObj, testProp)).toEqual(testObj);
      const minLength = 'y.d';
      const leaveKey = true;
      // a non-existing key should not be "left" on the object
      expect(utils.pureDeleteObjectKey(testObj, minLength, leaveKey)).toEqual(testObj);
    });
    it('works as expected with leaveKey parameter', () => {
      const leaveKey = true;
      const testProp = 'y.b';
      const expectedOutput = { x: 1, y: { a: 4, b: undefined, c: { d: 1 } } };
      expect(utils.pureDeleteObjectKey(testObj, testProp, leaveKey)).toEqual(expectedOutput);
    });
  });
});

describe('isObjNotEmpty', () => {
  it('correctly shows empty objects', () => {
    const emptyObject = {};
    expect(utils.isObjectNotEmpty(emptyObject)).toEqual(false);
  });
  it('correctly shows entries without values as not empty', () => {
    const undefinedProp = { empty: undefined };
    expect(utils.isObjectNotEmpty(undefinedProp)).toEqual(true);
    const normalObj = {a: [1, 2, 3], b: "secondProp"};
    expect(utils.isObjectNotEmpty(normalObj)).toEqual(true);
  });
});

describe('removeObjEntriesWithValueBelow', () => {
  const testObj1 = { x: 1, y: 2, c: 3 };
  deepFreeze(testObj1);
  it('correctly removes properties with a length below given minimum', () => {
    const minLength1 = '2';
    const expectedOutput = { y: 2, c: 3 };
    expect(utils.removeObjEntriesWithValueBelow(testObj1, minLength1)).toEqual(expectedOutput);
    const minLength2 = '4';
    const expectedOutput2 = {};
    expect(utils.removeObjEntriesWithValueBelow(testObj1, minLength2)).toEqual(expectedOutput2);
  });
  it('correcly handles empty objects', () => {
    const minLength3 = '1';
    const emptyObject = {};
    expect(utils.removeObjEntriesWithValueBelow(emptyObject, minLength3)).toEqual(emptyObject);
  });
});

describe('castObjKeysToDescendingArraySortedByValue', () => {
  it('correctly sorts the objects keys by their numerical value descending', () => {
    const testObj1 = { a: 3, b: 4, c: 1 };
    const expectedOutput = ['b', 'a', 'c'];
    expect(utils.castObjKeysToDescendingArraySortedByValue(testObj1)).toEqual(expectedOutput);
  });
});
