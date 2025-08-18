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

  // Sorting
  scoreSortOrder: 'asc' | 'desc' | null = null;



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

  sortProductsByScore(): void {
    if (this.scoreSortOrder === 'asc') {
      this.scoreSortOrder = 'desc';
    } else {
      this.scoreSortOrder = 'asc';
    }
    this.filterProducts(); // Re-apply filters and sort
  }

  loadMatchesByCurrentUser(): void {
    this.productService.getMutualExchangeMatches(this.userId).subscribe({
      next: (data: any[]) => {
        this.exchangeMatches = data.map(match => ({
          matchedProduct: {
            name: match.offered_product_name,
            price: match.offered_product_price || 0,
            userId: match.user_id
          },
          myProduct: {
            name: match.my_product_name,
            price: match.my_product_price || 0,
            userId: match.user_id
          },
          score: match.score
        }));
        console.log("mathces ---- > " , this.exchangeMatches);

      },
      error: err => console.error('שגיאה בטעינת התאמות:', err)
    });
  }


  showContactDetails(userId: string): void {
    if (!userId) {
      alert("לא נמצא מזהה משתמש.");
      return;
    }

    this.authService.getUserDataById(userId)
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

  handleExchange(myProduct: { name: string; price: number; userId: string; }, matchedProduct: { name: string; price: number; userId: string; }): void {
    if (!confirm(`האם אתה בטוח שברצונך להחליף את \"${myProduct.name}\" ב- \"${matchedProduct.name}\"?`)) {
      return;
    }

    this.productService.performExchange(myProduct.userId, matchedProduct.userId, myProduct.name, matchedProduct.name).subscribe({
      next: () => {
        alert('ההחלפה בוצעה בהצלחה!');
        // Optionally, refresh data or navigate away
        this.loadMatchesByCurrentUser(); // Reload matches after exchange
      },
      error: (err) => {
        console.error('שגיאה בביצוע ההחלפה:', err);
        alert('אירעה שגיאה בעת ביצוע ההחלפה. אנא נסה שוב.');
      }
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
    this.scoreSortOrder = null; // Reset sort order
    this.filterProducts();
  }

  filterProducts(): void {
    const term = this.searchTerm.trim().toLowerCase();

    let tempFilteredProducts = this.products.filter(product => {
      const matchesSearchTerm = term === '' || (product.name?.toLowerCase().includes(term) ?? false);

      const matchesCategory   = this.selectedCategory   ? product.category.id   === +this.selectedCategory   : true;
      const matchesCondition  = this.selectedCondition  ? product.condition.id  === +this.selectedCondition  : true;
      const matchesMinPrice   = this.minPrice  !== null ? product.price         >= this.minPrice           : true;
      const matchesMaxPrice   = this.maxPrice  !== null ? product.price         <= this.maxPrice           : true;

      const isDisliked = this.dislikedProducts.some(p => p.id === product.id);
      const matchesDislikedFilter = this.hideDisliked ? !isDisliked : true;
      return matchesSearchTerm && matchesCategory && matchesCondition && matchesMinPrice && matchesMaxPrice && matchesDislikedFilter;
    });

    // Apply sorting by score
    if (this.scoreSortOrder === 'desc') {
      tempFilteredProducts.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else if (this.scoreSortOrder === 'asc') {
      tempFilteredProducts.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    }

    this.filteredProducts = tempFilteredProducts;
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
          product.score = (product as any).score; // Map the score
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


