import { ZipcodeRangePipe } from './zipcode-range.pipe';

describe('ZipcodeRangePipe', () => {
  let pipe: ZipcodeRangePipe;

  beforeEach(() => {
    pipe = new ZipcodeRangePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return correct range when last is false', () => {
    expect(pipe.transform(1000, 200, false)).toEqual('1000 - 1199');
  });

  it('should return correct range when last is true', () => {
    expect(pipe.transform(1000, 200, true)).toEqual('1000 - 1200');
  });

  it('should return correct range for single digit interval', () => {
    expect(pipe.transform(1000, 5, false)).toEqual('1000 - 1004');
  });
});
