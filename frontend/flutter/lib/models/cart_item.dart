import 'product.dart';

class CartItem {
  final Product product;
  int quantity;
  double discountPercent;

  CartItem({
    required this.product,
    this.quantity = 1,
    this.discountPercent = 0.0,
  });
}
