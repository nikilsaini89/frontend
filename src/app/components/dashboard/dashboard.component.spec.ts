import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let http: HttpClient;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule]  //what is the use of this HttpClientTestingModule here?
    })
    .compileComponents();

    
  });
  beforeEach(() => { 
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }); 

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should call fetchStudentList on init', () => {
    spyOn(component, 'fetchStudentList');
    component.ngOnInit();
    expect(component.fetchStudentList).toHaveBeenCalled();
  });

  it('should log an console error if token is missing', () => {
    spyOn(console, 'error');
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(router, 'navigate');

    component.fetchStudentList();

    expect(console.error).toHaveBeenCalledWith('No token found!');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  

  // this test may not complete yet
  it('should set headers with token and make HTTP GET request on sucessful request', () => {
    const response = [{ name: 'test' }];
    const token = 'test-token';
    const spyHttp = spyOn(http, 'get').and.returnValue(of(response));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    spyOn(localStorage, 'getItem').and.returnValue(token);

    component.fetchStudentList();

    expect(component.studentList).toEqual(response);
    expect(spyHttp).toHaveBeenCalledWith(`${environment.backendUrl}/auth/dashboard`, { headers });
  });
  
  it('should log an console error and redirect to login on failed request', () => { 
    const errorResponse = { status: 500 };
    const token = 'test-token';
    spyOn(console, 'error');
    spyOn(router, 'navigate');
    spyOn(localStorage, 'getItem').and.returnValue(token);
    spyOn(http, 'get').and.returnValue(
      throwError(errorResponse)
    ); 

    component.fetchStudentList();

    expect(console.error).toHaveBeenCalledWith('Error fetching student list:', errorResponse);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should remove access_token from localStorage and redirect to login on logout', () => {
    spyOn(localStorage, 'removeItem');
    spyOn(router, 'navigate');

    component.onLogout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
