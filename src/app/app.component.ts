import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}
  title = 'switch-me';

  goToSignIn() {
    this.router.navigate(['/sign-in']); // ניווט ל-sign-in
  }
}


