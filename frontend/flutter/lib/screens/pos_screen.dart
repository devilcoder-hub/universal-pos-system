import 'package:flutter/material.dart';
import '../models/cart_item.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class PosScreen extends StatefulWidget {
  const PosScreen({super.key});

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final searchController = TextEditingController();
  List<Product> products = [];
  List<CartItem> cart = [];
  String selectedCurrency = 'USD';
  String paymentMethod = 'Cash';
  bool loading = true;

  @override
  void initState() {
    super.initState();
    loadProducts();
  }

  Future<void> loadProducts() async {
    final response = await ApiService.getProducts();
    setState(() {
      products = (response['products'] as List?)
          ?.map((p) => Product.fromJson(p))
          .toList() ?? [];
      loading = false;
    });
  }

  void addToCart(Product product) {
    setState(() {
      for (var item in cart) {
        if (item.product.id == product.id) {
          item.quantity += 1;
          return;
        }
      }
      cart.add(CartItem(product: product));
    });
  }

  void removeFromCart(int index) {
    setState(() => cart.removeAt(index));
  }

  double calculateTotal() {
    double total = 0;
    for (var item in cart) {
      total += item.product.price * item.quantity;
    }
    return total;
  }

  Future<void> checkout() async {
    if (cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cart is empty')),
      );
      return;
    }

    final items = cart.map((item) => {
      'product_id': item.product.id,
      'quantity': item.quantity,
      'discount_percent': 0,
    }).toList();

    final response = await ApiService.createOrder({
      'customer_id': null,
      'items': items,
      'payment_method': paymentMethod,
      'currency_code': selectedCurrency,
      'discount': 0,
    });

    if (response['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Order ${response['order']['order_number']} created')),
      );
      setState(() => cart.clear());
    }
  }

  List<Product> get filteredProducts {
    final query = searchController.text.toLowerCase();
    if (query.isEmpty) return products;
    return products
        .where((p) => p.name.toLowerCase().contains(query) || p.sku.toLowerCase().contains(query))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    final total = calculateTotal();

    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: searchController,
                        onChanged: (_) => setState(() {}),
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.search),
                          hintText: 'Search product',
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    DropdownButton<String>(
                      value: selectedCurrency,
                      items: const [
                        DropdownMenuItem(value: 'USD', child: Text('USD')),
                        DropdownMenuItem(value: 'EUR', child: Text('EUR')),
                        DropdownMenuItem(value: 'GBP', child: Text('GBP')),
                        DropdownMenuItem(value: 'INR', child: Text('INR')),
                      ],
                      onChanged: (val) => setState(() => selectedCurrency = val ?? 'USD'),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.4,
                    ),
                    itemCount: filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = filteredProducts[index];
                      return Card(
                        child: InkWell(
                          onTap: () => addToCart(product),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                const SizedBox(height: 6),
                                Text('SKU: ${product.sku}'),
                                Text('Category: ${product.category}'),
                                Text('Price: \$${product.price}'),
                                const Spacer(),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Stock: ${product.stock}'),
                                    ElevatedButton(
                                      onPressed: () => addToCart(product),
                                      child: const Text('Add'),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
        Expanded(
          flex: 1,
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Cart', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Expanded(
                  child: cart.isEmpty
                      ? const Center(child: Text('No items yet'))
                      : ListView.builder(
                          itemCount: cart.length,
                          itemBuilder: (context, index) {
                            final item = cart[index];
                            return ListTile(
                              title: Text(item.product.name),
                              subtitle: Text('${item.quantity} x \$${item.product.price}'),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(onPressed: () => setState(() { if (item.quantity > 1) item.quantity--; else cart.removeAt(index); }), icon: const Icon(Icons.remove)),
                                  IconButton(onPressed: () => setState(() => item.quantity++), icon: const Icon(Icons.add)),
                                  IconButton(onPressed: () => removeFromCart(index), icon: const Icon(Icons.delete)),
                                ],
                              ),
                            );
                          },
                        ),
                ),
                const Divider(),
                DropdownButtonFormField<String>(
                  value: paymentMethod,
                  decoration: const InputDecoration(
                    labelText: 'Payment',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'Cash', child: Text('Cash')),
                    DropdownMenuItem(value: 'Card', child: Text('Card')),
                    DropdownMenuItem(value: 'Mobile Wallet', child: Text('Mobile Wallet')),
                  ],
                  onChanged: (val) => setState(() => paymentMethod = val ?? 'Cash'),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  color: Colors.grey[100],
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Total: \$${total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: checkout,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.deepPurple),
                    child: const Text('Checkout'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
