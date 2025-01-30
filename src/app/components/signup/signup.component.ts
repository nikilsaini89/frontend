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
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
 
@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  constructor(private http : HttpClient, private router: Router){}

  ngOnInit(): void {
    const token = localStorage.getItem("access_token")
    if (token) {
        this.http.get(`${environment.backendUrl}/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to request
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
  
  serverError: string | null = null;
  successMessage: string | null = null;

  userForm: FormGroup = new FormGroup(
    {
      firstName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z]+$/),
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z]+$/),
      ]),
      userName: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9_]+$/),
      ]),
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
      confirmPassword: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{10}$/),
      ]),
      country: new FormControl('+91', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );
 
  
 
  docquityEmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    return email && email.endsWith('@docquity.com')
      ? null
      : { invalidEmailDomain: true };
  }
 
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword
      ? null
      : { passwordsMismatch: true };
  }
 
  onUserSave() {
    if (this.userForm.valid) {
      
 
      console.log('Form is valid');
      console.log(this.userForm.value);

      const formData = {
        firstname: this.userForm.value.firstName,
        lastname: this.userForm.value.lastName,
        username: this.userForm.value.userName,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        mobile_number: this.userForm.value.mobile,
        country_code: this.userForm.value.country,
      };
      
 
      this.http.post(`${environment.backendUrl}/auth/signup`, formData).subscribe(
        (res) => {
          console.log('Signup Successful', res);
          this.successMessage = 'Registration successful! You can now log in.';
          this.serverError = null;
          this.userForm.reset();
          // this.userForm.get('email')?.setErrors(null); // Clear errors
        },
        (error) => {
          if (error.status === 409 && error.error.field === 'email') {
            this.userForm.get('email')?.setErrors({ emailExists: true });
          }
          else{
            this.serverError =
              'An unexpected error occurred. Please try again later.';
          }
          this.successMessage = null;
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }
}