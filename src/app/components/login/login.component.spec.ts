import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let http: HttpClient;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, LoginComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    fixture.detectChanges();   // what is this doing? 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should verify token in ngOnInit if token exists', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue('test-token');
    const spyHttp = spyOn(http, 'get').and.returnValue(of({})); // Mock successful response
    const spyRouter = spyOn(router, 'navigate');

    component.ngOnInit();
    tick();

    expect(spyHttp).toHaveBeenCalledWith(`${environment.backendUrl}/auth/verify-token`, {
      headers: { Authorization: 'Bearer test-token' },
    });
    expect(spyRouter).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should remove token and redirect to login if token verification fails', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue('test-token');
    const spyHttp = spyOn(http, 'get').and.returnValue(throwError({ status: 401 })); // Mock failure response
    const removeItemSpy = spyOn(localStorage, 'removeItem');
    const spyRouter = spyOn(router, 'navigate');

    component.ngOnInit();
    tick();

    expect(spyHttp).toHaveBeenCalled();
    expect(removeItemSpy).toHaveBeenCalledWith('access_token');
    expect(spyRouter).toHaveBeenCalledWith(['/login']);
  }));

  it('should not verify token if no token is present in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    const spyHttp = spyOn(http, 'get');

    component.ngOnInit();

    expect(spyHttp).not.toHaveBeenCalled();
  });

  it('should submit the form and navigate to dashboard on successful login', fakeAsync(() => {
    spyOn(http, 'post').and.returnValue(of({ access_token: 'test-token' }));
    spyOn(localStorage, 'setItem');
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.loginForm.setValue({ email: 'test@docquity.com', password: 'Password1!' });
    component.onLogin();
    tick(); 
    

    expect(http.post).toHaveBeenCalledWith(`${environment.backendUrl}/auth/login`, {
      email: 'test@docquity.com',
      password: 'Password1!',
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'test-token');
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should not call API if form is invalid', () => {
    spyOn(http, 'post');

    component.loginForm.setValue({ email: 'invalid-test', password: 'pass' }); // Invalid email & password
    component.onLogin();

    expect(http.post).not.toHaveBeenCalled();
  });

  it('should log an error if navigation fails', fakeAsync(() => {
    spyOn(http, 'post').and.returnValue(of({ access_token: 'test-token' }));
    spyOn(localStorage, 'setItem');
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(false));
    spyOn(console, 'error');

    component.loginForm.setValue({ email: 'test@docquity.com', password: 'Password1!' });
    component.onLogin();
    tick();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    expect(console.error).toHaveBeenCalledWith('Navigation to Dashboard failed');
  }));
});
