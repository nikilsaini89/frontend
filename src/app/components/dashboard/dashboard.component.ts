import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  studentList: any[] = []; 

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchStudentList();
  }

  fetchStudentList(): void {
    
    const token = localStorage.getItem('access_token'); // Extract token from localStorage

    if (!token) {
      console.error('No token found!');
      this.router.navigate(['/login']); // Redirect if token is missing
      return;4
    }

    // Set up headers with the token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Make HTTP GET request with headers
    
    this.http.get(`${environment.backendUrl}/auth/dashboard`, { headers }).subscribe(
      (res: any) => {
        this.studentList = res; 
        console.log(this.studentList)
      },
      (err) => {
        console.error("Error fetching student list:", err);
        this.router.navigate(['/login']); 
      }
    );
  }
  onLogout(): void{
    // Remove access_token from localStorage
    localStorage.removeItem('access_token');
    // Redirect to the login page
    this.router.navigate(['/login']);
  }
}
