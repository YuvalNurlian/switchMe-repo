import { Component } from '@angular/core';
import { User } from '../../models/user.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration',
  imports: [],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
 
  newUser : User = new User();

  ngOnInit() {
    this.newUser = new User();
  }
}
