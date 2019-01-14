import { mapCircles } from 'stylesheets/variables.json';
import * as soundsUtils from './utils';

describe('sound utils', () => {
  describe('isSoundInsideScreen', () => {
    const circleDiameter = parseInt(mapCircles.defaultRadius, 10) * 2;
    it('detects when sound is out of screen', () => {
      const position = {
        cx: -circleDiameter - 1, // not visible by just 1px
        cy: -circleDiameter - 1,
      };
      expect(soundsUtils.isSoundInsideScreen(position)).toBeFalsy();
    });
    it('detects when sound is inside screen', () => {
      const position = {
        cx: -circleDiameter + 1, // visible by just 1px
        cy: -circleDiameter + 1,
      };
      expect(soundsUtils.isSoundInsideScreen(position)).toBeTruthy();
    });
  });
});

describe('shortenCreativeCommonsLicense', () => {
  it('returns a formatted abbreviation from the CC license URI', () => {
    const inputString1 = 'http://creativecommons.org/licenses/by/3.0/';
    const expectedOutput1 = 'CC BY 3.0';
    expect(soundsUtils.shortenCreativeCommonsLicense(inputString1)).toEqual(expectedOutput1);
    const inputString2 = 'http://creativecommons.org/publicdomain/sampling+/1.0/';
    const expectedOutput2 = 'Sampling Plus 1.0';
    expect(soundsUtils.shortenCreativeCommonsLicense(inputString2)).toEqual(expectedOutput2);
  });
  it('returns a dash, when the uri is wrong or an undefined string is entered', () => {
    const inputString1 = 'http://creativecommons.org/publicdomain/<wronginput>/1.0/';
    const expectedOutput1 = '-';
    expect(soundsUtils.shortenCreativeCommonsLicense(inputString1)).toEqual(expectedOutput1);
    const inputString2 = undefined;
    const expectedOutput2 = '-';
    expect(soundsUtils.shortenCreativeCommonsLicense(inputString2)).toEqual(expectedOutput2);
  });
});
