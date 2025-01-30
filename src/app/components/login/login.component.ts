import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(private http : HttpClient, private router : Router){}

  ngOnInit(): void {
    console.log('Login page initialised')
    const token = localStorage.getItem("access_token")
    if (token) {
        this.http.get(`${environment.backendUrl}/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }).subscribe(
          (response) => {
            this.router.navigate(['/dashboard'])
          },
          (error) => {
            localStorage.removeItem('access_token');
            this.router.navigate(['/login']);
          }
        );
    }  
  }

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      this.docquityEmailValidator,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      ),
    ]),
  });
 
  docquityEmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    return email && email.endsWith('@docquity.com')
      ? null
      : { invalidEmailDomain: true };
  }
 
  onLogin() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      const formData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };
      
 
      this.http.post(`${environment.backendUrl}/auth/login`, formData).subscribe(
        (res: any) => {
          if(res.access_token){
            localStorage.setItem('access_token', res.access_token);
            console.log('Token Stored in the Local Storage')
          }
          console.log('Login Successful', res);
          // this.loginForm.get('email')?.setErrors(null); 
          this.router.navigate(['/dashboard']).then(success => {
            if (success) {
              console.log('Navigation to Dashboard successful');
            } else {
              console.error('Navigation to Dashboard failed');
            }
          });
        },
        (error) => {
          if (error.status === 409 && error.error.field === 'email') {
            this.loginForm.get('email')?.setErrors({ emailExists: true });
          }
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }
}
 