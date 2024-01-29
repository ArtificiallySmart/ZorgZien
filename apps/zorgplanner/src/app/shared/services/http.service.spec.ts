import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpService } from './http.service';

describe('HttpService', () => {
  let service: HttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });
    service = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure that there are no outstanding requests.
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute GET request', () => {
    const mockData = { data: 'test' };
    service.get('/test').subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(service['baseUrl'] + '/test');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should execute POST request', () => {
    const mockData = { data: 'test' };
    const mockPayload = { payload: 'test' };
    service.post('/test', mockPayload).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(service['baseUrl'] + '/test');
    expect(req.request.method).toBe('POST');
    req.flush(mockData);
  });

  it('should execute DELETE request', () => {
    const mockData = { data: 'test' };
    service.delete('/test').subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(service['baseUrl'] + '/test');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockData);
  });

  it('should execute PATCH request', () => {
    const mockData = { data: 'test' };
    const mockPayload = { payload: 'test' };
    service.patch('/test', mockPayload).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(service['baseUrl'] + '/test');
    expect(req.request.method).toBe('PATCH');
    req.flush(mockData);
  });
});
