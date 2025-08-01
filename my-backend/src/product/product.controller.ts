import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { Product } from './product.model'
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('not-mine/:uid')
  async getNotMyProducts(@Param('uid') uid: string): Promise<any[]> {
    return this.productService.getAllProducts(uid);
  }


  @Get('user/:uid')
  async getByUser(@Param('uid') uid: string): Promise<any[]> {
    return this.productService.getProductsByUserId(uid);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)  // מחזיר 204 אם הצליח
  async delete(@Param('id') id: string): Promise<void> {
    // id מגיע כ-string, נהפוך למספר
    await this.productService.deleteProduct(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() product: Product): Promise<any> {
    return this.productService.insertNewProduct(product);
  }


  @Post('mark-as-interested')
  @HttpCode(HttpStatus.CREATED)
  async markAsInterested(@Body() body: { userId: string, productId: number }): Promise<any> {
    const { userId, productId } = body;
    return this.productService.markAsInterested(userId, productId);
  }

  @Post('mark-as-not-interested')
  @HttpCode(HttpStatus.CREATED)
  async markAsNotInterested(@Body() body: { userId: string, productId: number }): Promise<any> {
    const { userId, productId } = body;
    return this.productService.markAsNotInterested(userId, productId);
  }

  @Get('potential-exchange/:productId')
  async getPotentialExchangeProducts(@Param('productId') productId: number) {
    return this.productService.getPotentialExchangeProducts(productId);
  }

  @Get('interest/:userId/:isInterest')
async getProductsByInterest(
  @Param('userId') userId: string,
  @Param('isInterest') isInterest: number
): Promise<any[]> {
  return this.productService.getProductsByInterest(userId, +isInterest);
}

@Get('mutual-exchange/:userId')
async getMutualExchange(@Param('userId') userId: string): Promise<any[]> {
  return this.productService.getMutualExchangeMatches(userId);
}

@Post('perform-exchange')
@HttpCode(HttpStatus.OK)
async performExchange(@Body() body: { myProductUserId: string, matchedProductUserId: string, myProductName: string, matchedProductName: string }): Promise<any> {
  const { myProductUserId, matchedProductUserId, myProductName, matchedProductName } = body;
  return this.productService.performExchange(myProductUserId, matchedProductUserId, myProductName, matchedProductName);
}


  // @Get('interested-by-others/:userId')
  // async getProductsInterestedByOthers(@Param('userId') userId: string) {
  //   return this.productService.getProductsInterestedByOthers(userId);
  // }
}
