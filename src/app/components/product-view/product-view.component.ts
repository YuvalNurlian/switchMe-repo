import { Component, OnInit } from '@angular/core';
import { ExchangeMatch, Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { ConditionService } from '../../services/condition.service';
import { Condition } from '../../models/condition.model';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule }         from '@angular/forms';  
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';



@Component({
  selector: 'app-product-view',
  standalone: true,
  imports: [CommonModule,FormsModule   
  ], 
  templateUrl: './product-view.component.html',
  styleUrl: './product-view.component.css'
})
export class ProductViewComponent implements OnInit {

  selectedProduct: Product | null = null;
  showProductDetails: boolean = false;
  userName : String = '';
  userId: string = '';

  //my products
  showMyProducts: boolean = false;
  myProducts: Product[] = [];
  //liked or disliked product
  showLikedProducts: boolean = false;
  likedProducts: Product[] = [];
  dislikedProducts: Product[] = [];

  filteredProducts: Product[] = [];
  products: Product[] = [];

  categories: Category[] = [];
  conditions: Condition[] = [];

  // filters
  selectedCategory: string = '';
  selectedCondition: string = '';
  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  hideDisliked: boolean = false;

  //matches
  exchangeMatches: ExchangeMatch[] = [];
  showExchangeMatches: boolean = false;



  constructor(private productService: ProductService, private categoryService: CategoryService, private conditionService: ConditionService,private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const uid = this.authService.getCurrentUserId();
    this.userId = uid ? uid : 'שגיאה בזיהוי משתמש';
    console.log("user id: ", uid);

      // טוען את התנאים והקטגוריות בו זמנית
  forkJoin([
    this.conditionService.getConditions(),
    this.categoryService.getCategories()
  ]).subscribe({
    next: ([conditions, categories]) => {
      console.log('📌 תנאים וקטגוריות נטענו:', conditions, categories);
      this.conditions = conditions;
      this.categories = categories;

      // לאחר מכן, טוען את המוצרים
      this.loadProductsByUser();
      this.loadProducts();
      this.loadDislikedProducts();
      this.loadLikedProducts();
      this.loadMatchesByCurrentUser();
    },
    error: (err) => {
      console.error('❌ שגיאה בטעינת תנאים או קטגוריות:', err);
    }
  });

    // this.authService.getCurrentUserData()
    // .then(data => {
    //   console.log(data);
    //   this.userName = data?.['nickname'] ? data?.['nickname']  : '' ;

    //   const jsDate: Date = data?.['birthDate']?.toDate();
    //   console.log(jsDate.toLocaleDateString());     
    // })
    // .catch(err => console.error('שגיאה בקבלת משתמש:', err));
  }

  loadMatchesByCurrentUser(): void {
    this.productService.getMutualExchangeMatches(this.userId).subscribe({
      next: (data: any[]) => {
        this.exchangeMatches = data.map(match => ({
          matchedProduct: {
            id: match.product1_id,
            name: match.name1,
            description: match.description1 || '',
            category: this.categories.find(c => c.id === match.category1) || { id: 0, name: 'לא ידוע' },
            condition: this.conditions.find(c => c.id === match.condition1) || { id: 0, name: 'לא ידוע' },
            purchasePrice: match.purchaseprice1 || 0,
            price: match.price1 || 0,
            approvedByAI: match.approvedbyai1,
            manufacturer: match.manufacturer1 || '',
            yearsUsed: match.yearsused1 || 0,
            material: match.material1 || '',
            dimensions: match.dimensions1 || '',
            userId: match.user2_id,
            countInterestedUsers: 0
          },
          myProduct: {
            id: match.product2_id,
            name: match.name2,
            description: match.description2 || '',
            category: this.categories.find(c => c.id === match.category2) || { id: 0, name: 'לא ידוע' },
            condition: this.conditions.find(c => c.id === match.condition2) || { id: 0, name: 'לא ידוע' },
            purchasePrice: match.purchaseprice2 || 0,
            price: match.price2 || 0,
            approvedByAI: match.approvedbyai2,
            manufacturer: match.manufacturer2 || '',
            yearsUsed: match.yearsused2 || 0,
            material: match.material2 || '',
            dimensions: match.dimensions2 || '',
            userId: match.user1_id,
            countInterestedUsers: 0
          }
        }));
        console.log("mathces ---- > " , this.exchangeMatches);
        
      },
      error: err => console.error('שגיאה בטעינת התאמות:', err)
    });
  }
  

  showContactDetails(product: Product): void {
    console.log(product.userId);
    
    const uid = (product as any).user_id ? (product as any).user_id : (product as any).userId;
    if (!uid) {
      alert("לא נמצא מזהה משתמש.");
      return;
    }
  
    this.authService.getUserDataById(uid)
      .then(data => {
        if (data) {
          alert(
            `👤 ${data['nickname'] || 'ללא שם'}\n📞 ${data['phone'] || 'ללא טלפון'}\n📧 ${data['email'] || 'ללא אימייל'}`
          );        } else {
          alert("לא נמצאו פרטי משתמש.");
        }
      })
      .catch(err => {
        console.error('שגיאה בקבלת פרטי משתמש:', err);
        alert("אירעה שגיאה בעת ניסיון להביא פרטי משתמש.");
      });
  }

  isProductLiked(productId: number): boolean {
    return this.likedProducts.some(p => p.id === productId);
  }
  
  isProductDisliked(productId: number): boolean {
    return this.dislikedProducts.some(p => p.id === productId);
  }
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedCondition = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.hideDisliked = false;
    this.filterProducts();
  }

  filterProducts(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredProducts = this.products.filter(product => {
      const matchesSearchTerm = term === '' || (product.name?.toLowerCase().includes(term) ?? false);

      const matchesCategory   = this.selectedCategory   ? product.category.id   === +this.selectedCategory   : true;
      const matchesCondition  = this.selectedCondition  ? product.condition.id  === +this.selectedCondition  : true;
      const matchesMinPrice   = this.minPrice  !== null ? product.price         >= this.minPrice           : true;
      const matchesMaxPrice   = this.maxPrice  !== null ? product.price         <= this.maxPrice           : true;

      const isDisliked = this.dislikedProducts.some(p => p.id === product.id);
      const matchesDislikedFilter = this.hideDisliked ? !isDisliked : true;
      return matchesSearchTerm && matchesCategory && matchesCondition && matchesMinPrice && matchesMaxPrice && matchesDislikedFilter;
    });
  }

  viewProduct(product: Product): void {
    console.log(product);
    
    this.selectedProduct = product;
    this.showProductDetails = true;
  }

  deleteMyProduct(product: Product) {
    if (!confirm(`למחוק את "${product.name}"?`)) {
      return;
    }

    // כאן product.id הוא מספר
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        // מסירים מהמערך לפי שדה id (מספר)
        this.myProducts = this.myProducts.filter(p => p.id !== product.id);
        alert('המוצר נמחק בהצלחה.');
      },
      error: err => {
        console.error('❌ שגיאה במחיקת מוצר:', err);
        alert('אירעה שגיאה במחיקת המוצר. נסה שוב.');
      }
    });
  }

  loadProductsByUser(): void {
    const uid = 
    //"cZ0uZokmNNeqw1Aufo5A0Arxj4z2" ;
    //"7rTeyEtBsdZWQwNJmqjACsCQ7vl1";
    this.authService.getCurrentUserId();
    if (!uid) 
      {
        console.log("my products error with: UID");

        return;
      }
      console.log(uid);
      
    this.productService.getProductsByUserId(uid).subscribe({
      next: (data: Product[]) => {
        console.log('📦 מוצרים של המשתמש נטענו:', data);
        this.myProducts = data.map(product => {
          const categoryId = (product as any).category_id;
          const conditionId = (product as any).condition_id;
  
          product.category = this.categories.find(cat => cat.id === +categoryId) || { id: categoryId, name: 'לא ידוע' };
          product.condition = this.conditions.find(cond => cond.id === +conditionId) || { id: conditionId, name: 'לא ידוע' };
          product.approvedByAI = (product as any).approvedbyai;
          product.countInterestedUsers = (product as any).interested_count || 0;
          return product;
        });
      },
      error: (err) => console.error('❌ שגיאה בטעינת מוצרים לפי משתמש:', err)
    });
  }

  loadLikedProducts(): void {
    const uid = this.authService.getCurrentUserId();
    if (!uid) {
      console.error("⚠️ שגיאה: לא נמצא UID בעת טעינת מוצרים שאהב");
      return;
    }
  
    this.productService.getProductsByInterest(uid, 1).subscribe({
      next: (data: Product[]) => {
        this.likedProducts = data;
        console.log('✅ מוצרים שאהב נטענו:', this.likedProducts);
      },
      error: (err) => console.error('❌ שגיאה בטעינת מוצרים שאהב:', err)
    });
  }
  
  loadDislikedProducts(): void {
    const uid = this.authService.getCurrentUserId();
    if (!uid) {
      console.error("⚠️ שגיאה: לא נמצא UID בעת טעינת מוצרים שלא אהב");
      return;
    }
  
    this.productService.getProductsByInterest(uid, 0).subscribe({
      next: (data: Product[]) => {
        this.dislikedProducts = data;
        console.log('🚫 מוצרים שלא אהב נטענו:', this.dislikedProducts);
      },
      error: (err) => console.error('❌ שגיאה בטעינת מוצרים שלא אהב:', err)
    });
  }

  loadProducts(): void {
    const uid = 
    //"cZ0uZokmNNeqw1Aufo5A0Arxj4z2" ;
    //"7rTeyEtBsdZWQwNJmqjACsCQ7vl1";
    this.authService.getCurrentUserId();
    if (!uid) 
      {
        console.log("load all products error with: UID");
        return;
      }

    this.productService.getProductsNotMine(uid).subscribe({
      next: (data: Product[]) => {
        this.products = data.map(product => {
          const categoryId = (product as any).category_id;
          const conditionId = (product as any).condition_id;
  
          product.category = this.categories.find(cat => cat.id === +categoryId) || { id: categoryId, name: 'לא ידוע' };
          product.condition = this.conditions.find(cond => cond.id === +conditionId) || { id: conditionId, name: 'לא ידוע' };
          product.approvedByAI = (product as any).approvedbyai;
          return product;
        });
  
        this.filteredProducts = this.products;
        console.log(this.filteredProducts);
        
      },
      error: (err: any) => console.error('❌ שגיאה בטעינת מוצרים:', err)
    });

  }

  getPotentialExchangeProducts(productId: number): void {
    this.productService.getPotentialExchangeProducts(productId).subscribe({
      next: (data: Product[]) => {
        console.log( "potential products: ", data);
  
        this.filteredProducts = data.map(product => {
          const categoryId = (product as any).category_id;
          const conditionId = (product as any).condition_id;
  
          product.category = this.categories.find(cat => cat.id === +categoryId) || { id: categoryId, name: 'לא ידוע' };
          product.condition = this.conditions.find(cond => cond.id === +conditionId) || { id: conditionId, name: 'לא ידוע' };
          product.approvedByAI = (product as any).approvedbyai;
          return product;
        });
      },
      error: (err) => console.error('❌ שגיאה בטעינת מוצרים פוטנציאליים להחלפה:', err)
    });
  }

  markProductAsInterested(productId: number): void {
    if (this.userId === 'שגיאה בזיהוי משתמש') {
      alert("לא זוהה משתמש.");
      return;
    }
  
    this.productService.markAsInterested(this.userId, productId).subscribe({
      next: () => {
        alert('המוצר נוסף לרשימה שלך!');
  
        const product = this.products.find(p => p.id === productId);
        if (product && !this.likedProducts.some(p => p.id === productId)) {
          this.likedProducts.push(product);
        }
  
        this.dislikedProducts = this.dislikedProducts.filter(p => p.id !== productId);
        this.filterProducts();
      },
      error: (err) => {
        console.error('שגיאה בהוספת המוצר', err);
        alert('אירעה שגיאה, אנא נסה שוב.');
      }
    });
  }

  markProductAsNotInterested(productId: number): void {
    if (this.userId === 'שגיאה בזיהוי משתמש') {
      alert("לא זוהה משתמש.");
      return;
    }
  
    this.productService.markAsNotInterested(this.userId, productId).subscribe({
      next: () => {
        alert('תודה, נציג לך פחות מוצרים דומים');
  
        const product = this.products.find(p => p.id === productId);
        if (product && !this.dislikedProducts.some(p => p.id === productId)) {
          this.dislikedProducts.push(product);
        }
  
        this.likedProducts = this.likedProducts.filter(p => p.id !== productId);
        this.filterProducts();
      },
      error: (err) => {
        console.error('שגיאה בפעולה ', err);
        alert('אירעה שגיאה, אנא נסה שוב.');
      }
    });
  }
  


  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  navigateToAboutUs(): void {
    
    this.router.navigate(['/about-us']);
  
  }

  navigateToProductEdit()
  {
    this.router.navigate(['/product-edit']);

  }

    loadConditions(): void {
      this.conditionService.getConditions().subscribe({
        next: (data: Condition[]) => {
          console.log('📌 תנאים נטענו:', data);
          this.conditions = data;
        },
        error: (err: any) => {
          console.error('❌ שגיאה בטעינת תנאים:', err);
        }
      });
    }
  
    loadCategories(): void {
      this.categoryService.getCategories().subscribe({
        next: (data) => {
          console.log('📌 קטגוריות נטענו:', data);
          this.categories = data;
        },
        error: (err) => {
          console.error('❌ שגיאה בטעינת קטגוריות:', err);
        }
      });
    }
}


