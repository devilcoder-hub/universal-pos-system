import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <h2 style={{ marginBottom: '30px', color: '#2d1e54' }}>Orders</h2>
      <div className="table-container">
        <div className="table-header">
          <h3>Recent Orders ({orders.length})</h3>
          <button className="btn btn-primary">+ New Order</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.order_number}</strong></td>
                <td>{order.customer_name || 'Walk-in'}</td>
                <td>${order.total?.toFixed(2)}</td>
                <td>{order.payment_method}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: order.payment_status === 'completed' ? '#d4edda' : '#fff3cd',
                    color: order.payment_status === 'completed' ? '#155724' : '#856404',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {order.payment_status}
                  </span>
                </td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Orders;
