import { FteToHoursPipe } from './fte-to-hours.pipe';

describe('FteToHoursPipe', () => {
  let pipe: FteToHoursPipe;

  beforeEach(() => {
    pipe = new FteToHoursPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return 0 when input is 0', () => {
    expect(pipe.transform(0)).toEqual(0);
  });

  it('should return 36 when input is 1', () => {
    expect(pipe.transform(1)).toEqual(36);
  });

  it('should return 72 when input is 2', () => {
    expect(pipe.transform(2)).toEqual(72);
  });

  it('should return 180 when input is 5', () => {
    expect(pipe.transform(5)).toEqual(180);
  });

  it('should return 360 when input is 10', () => {
    expect(pipe.transform(10)).toEqual(360);
  });
});
