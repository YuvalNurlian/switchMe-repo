import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

export interface UserData {
  email:    string;
  phone:    string;
  nickname: string;
  gender:   string;
  birthDate: Date;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: User | null = null;

  constructor(private auth: Auth, private firestore: Firestore) {

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
    });

  }

  // getCurrentUserId(): string | null {
  //   return this.currentUser?.uid ?? null;
  // }

  // async getCurrentUserData() {
  //   const uid = this.currentUser?.uid;
  //   if (!uid) return null;

  //   const userDocRef = doc(this.firestore, `users/${uid}`);
  //   const userDoc = await getDoc(userDocRef);
  //   return userDoc.exists() ? userDoc.data() : null;
  // }

  async getUserDataById(uid: string) {
    if (!uid) return null;
    console.log(uid);
    
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  }

  async getCurrentUserData() {
    const uid =  this.auth.currentUser?.uid;
    //"w57kT7ZTP5bbT1fq1mfP72835Kb2";
  
    if (!uid) return null;
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  }

  async register(email: string, password: string, phone: string, nickname: string, gender: string, birthDate: Date) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = userCredential.user.uid;
  
    const userDocRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userDocRef, {
      email,
      phone,
      nickname,
      gender,
      birthDate: new Date(birthDate),
      createdAt: new Date()
    });
  
    return userCredential;
  }



  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }
}
