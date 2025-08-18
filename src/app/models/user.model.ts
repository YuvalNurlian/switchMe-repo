export enum Gender {
    Male = 0,
    Female = 1
  }

export class User { 
    firstName: string;
    lastName: string;
    birthDate: Date;
    email: string;
    password: string;
    //confirmPassword: string;
    phone: string;
    gender: Gender;
    constructor(){
        this.firstName = '';
        this.lastName = '';
        this.birthDate = new Date();
        this.email = '';
        this.password = '';
        this.phone = '';
        this.gender = 0;
    }
}