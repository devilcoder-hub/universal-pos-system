class Product {
  final int id;
  final String name;
  final String sku;
  final String category;
  final double price;
  final double cost;
  final int stock;
  final bool active;
  final String currencyCode;
  final double taxRate;

  Product({
    required this.id,
    required this.name,
    required this.sku,
    required this.category,
    required this.price,
    required this.cost,
    required this.stock,
    this.active = true,
    this.currencyCode = 'USD',
    this.taxRate = 0.0,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      sku: json['sku'] ?? '',
      category: json['category'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      cost: (json['cost'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      active: (json['active'] ?? true),
      currencyCode: json['currency_code'] ?? 'USD',
      taxRate: (json['tax_rate'] ?? 0).toDouble(),
    );
  }
}
