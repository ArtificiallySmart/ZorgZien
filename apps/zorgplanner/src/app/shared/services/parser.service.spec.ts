import { TestBed } from '@angular/core/testing';

import { ParserService } from './parser.service';

describe('ParserService', () => {
  let service: ParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parse method', () => {
    it('should correctly parse the input string to an array of CareDemandEntry objects', () => {
      // Setup
      const sampleData = `9933\t9.019,6\t90\n9919\t4.728,0\t47\n9611\t5.260,5\t46\n9901\t3.972,5\t38`;
      const expectedOutput = [
        { zipcode: 9933, hours: 9019.6, clients: 90 },
        { zipcode: 9919, hours: 4728.0, clients: 47 },
        { zipcode: 9611, hours: 5260.5, clients: 46 },
        { zipcode: 9901, hours: 3972.5, clients: 38 },
      ];

      // Act
      const result = service.parse(sampleData);

      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('parseZipcodes method', () => {
    it('should return an array of zip codes for a string with multiple valid zip codes', () => {
      const result = service.parseZipcodes('1234, 5678, 9012');
      expect(result).toEqual(['1234', '5678', '9012']);
    });

    it('should return an empty array for a string with no valid zip codes', () => {
      const result = service.parseZipcodes('no zip codes here');
      expect(result).toEqual([]);
    });

    it('should return an array of valid zip codes for a string with mixed content', () => {
      const result = service.parseZipcodes('abcd 1234 efgh 5678');
      expect(result).toEqual(['1234', '5678']);
    });

    it('should return an empty array for an empty string', () => {
      const result = service.parseZipcodes('');
      expect(result).toEqual([]);
    });

    it('should ignore zip codes of incorrect lengths', () => {
      const result = service.parseZipcodes('123 12345 6789 1234');
      expect(result).toEqual(['6789', '1234']);
    });
  });
});
