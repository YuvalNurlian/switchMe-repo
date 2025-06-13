import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  emailNotUniqe : boolean = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router


  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nickname: ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      phone:    ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      gender:   ['', Validators.required],
      birthDate:['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const { email, password, phone, nickname, gender, birthDate } = this.form.value;
      // עדכנו את הסיגנचर של AuthService.register לקבל גם gender ו-birthDate
      this.authService
        .register(email, password, phone, nickname, gender, birthDate)
        .then(() => {
          console.log('נרשמת בהצלחה');
          this.router.navigate(['/login']);
        })
        .catch((err) => {
          if (err.code === 'auth/email-already-in-use') {
            this.emailNotUniqe = true;
            alert("האימייל שבחרת כבר בשימוש");
            
          } else {
            console.error(err);
          }
        });
        //.catch(err => console.error(err));
    }
  }
}
