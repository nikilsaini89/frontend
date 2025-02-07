import { ComponentFixture, TestBed,fakeAsync, tick } from '@angular/core/testing';

import { SignupComponent } from './signup.component';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';


describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let http: HttpClient;
  let router: Router;

  const invalidFormData = {
    firstName: '',
    lastName: '',
    userName: '',
    email: 'invalid-email',
    password: '123',
    confirmPassword: '456',
    mobile: 'abcd',
    country: '',
  };
  const validFormData = {
    firstName: 'mohit',
    lastName: 'kasnia',
    userName: 'mohit_kasnia',
    email: 'mohit@docquity.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
    mobile: '1234567890',
    country: '+91',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent, HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  function setFormValues(data: any) {
    component.userForm.setValue(data);
  }

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

  it('should submit the form on sucessful signup and reset the form', fakeAsync(() => {
    

    const spyHttp = spyOn(http, 'post').and.returnValue(of({})); // Mock successful response, can type any message inside if wanted
    const spyReset = spyOn(component.userForm, 'reset');
    
    setFormValues(validFormData);

    const formData = {
      firstname: 'mohit',
      lastname: 'kasnia',
      username: 'mohit_kasnia',
      email: 'mohit@docquity.com',
      password: 'Password1!',
      mobile_number: '1234567890',
      country_code: '+91',
    };

    component.onUserSave();

    expect(spyHttp).toHaveBeenCalledWith(`${environment.backendUrl}/auth/signup`, formData);
    expect(spyReset).toHaveBeenCalled();
    expect(component.serverError).toBeNull();
    expect(component.successMessage).toBe('Registration successful! You can now log in.');
  }));
  

  it('should not call API if form is invalid', () => {
    spyOn(http, 'post');
    setFormValues(invalidFormData); // Invalid email & password
    component.onUserSave();

    expect(http.post).not.toHaveBeenCalled();
  });
  
  it('should raise exception if username or ', fakeAsync(() => {
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
  it('should set emailExists error if email conflict occurs', fakeAsync(() => {
    spyOn(http, 'post').and.returnValue(
      throwError({ status: 409, error: { field: 'email' } })
    );
  
    setFormValues(validFormData);
  
    component.onUserSave();
    tick();
  
    expect(component.userForm.get('email')?.errors).toEqual({ emailExists: true });
    expect(component.successMessage).toBeNull();
  }));
  
  it('should set usernameExists error if username conflict occurs', fakeAsync(() => {
    spyOn(http, 'post').and.returnValue(
      throwError({ status: 409, error: { field: 'username' } })
    );
  
    setFormValues(validFormData);
  
    component.onUserSave();
    tick();
  
    expect(component.userForm.get('userName')?.errors).toEqual({ usernameExists: true });
    expect(component.successMessage).toBeNull();
  }));
  
  it('should set serverError message if an unexpected error occurs', fakeAsync(() => {
    spyOn(http, 'post').and.returnValue(
      throwError({ status: 500 }) // Simulating a server error
    );

    setFormValues(validFormData);
    component.onUserSave();
    tick();
  
    expect(component.serverError).toBe('An unexpected error occurred. Please try again later.');
    expect(component.successMessage).toBeNull();
  }));
});
