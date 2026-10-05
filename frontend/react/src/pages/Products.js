import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <h2 style={{ marginBottom: '30px', color: '#2d1e54' }}>Products Inventory</h2>
      <div className="table-container">
        <div className="table-header">
          <h3>All Products ({products.length})</h3>
          <button className="btn btn-primary">+ Add Product</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Stock</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td><strong>{product.name}</strong></td>
                <td>{product.sku}</td>
                <td>{product.category}</td>
                <td>${product.price?.toFixed(2)}</td>
                <td>${product.cost?.toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: product.stock > 10 ? '#d4edda' : '#ffe5e5',
                    color: product.stock > 10 ? '#155724' : '#721c24',
                  }}>
                    {product.stock}
                  </span>
                </td>
                <td>{((product.price - product.cost) / product.price * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Products;
