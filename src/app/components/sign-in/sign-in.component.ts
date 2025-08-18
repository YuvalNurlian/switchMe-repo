import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    //this.loadGoogleSignIn();
  }

  goToCreateUser()
  {
    this.router.navigate(['/registration']);
  }
  loadGoogleSignIn() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '484856009593-pnsumidgkuomh5b552lt5i3aeu5i5mfc.apps.googleusercontent.com',
        callback: this.handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById('gSignInWrapper'),
        { theme: 'outline', size: 'large' }
      );
    } else {
      console.error('Google API failed to load.');
    }
  }

  handleCredentialResponse(response: any) {
    console.log('Encoded JWT ID token: ' + response.credential);
  }

}
