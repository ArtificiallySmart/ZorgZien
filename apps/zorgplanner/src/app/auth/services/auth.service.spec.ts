import { AuthService } from './auth.service';
import { HttpService } from '../../shared/services/http.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpService: HttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });

    httpService = TestBed.inject(HttpService);
    service = TestBed.inject(AuthService);
  });

  it('should check for access token', () => {
    const spy = jest.spyOn(window.localStorage, 'getItem');
    spy.mockReturnValue('token');
    service.checkForAccessToken();
    expect(spy).toHaveBeenCalled();
  });

  it('should refresh token', (done) => {
    const response = {
      access_token: 'newToken',
      user: { id: '1', name: 'Test User' },
    };
    jest.spyOn(httpService, 'post').mockReturnValue(of(response));
    service.refreshToken().subscribe((res) => {
      expect(res).toEqual('newToken');
      done();
    });
  });

  it('should logout', () => {
    const spy = jest.spyOn(window.localStorage.__proto__, 'removeItem');
    const spy2 = jest.spyOn(httpService, 'post').mockReturnValue(of(null));
    service.logout();
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should set access token', () => {
    const spy = jest.spyOn(window.localStorage.__proto__, 'setItem');
    service.setAccessToken('token');
    expect(spy).toHaveBeenCalled();
  });
});
