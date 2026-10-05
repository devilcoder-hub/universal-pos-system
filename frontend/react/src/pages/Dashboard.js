import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

function Dashboard() {
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/reports/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(response.data.dashboard || {});
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  const cards = [
    { title: 'Total Revenue', value: `$${(dashboard.total_revenue || 0).toFixed(2)}`, icon: '💰' },
    { title: 'Total Orders', value: dashboard.total_orders || 0, icon: '📦' },
    { title: 'Total Products', value: dashboard.total_products || 0, icon: '📊' },
    { title: 'Total Customers', value: dashboard.total_customers || 0, icon: '👥' },
    { title: "Today's Revenue", value: `$${(dashboard.today_revenue || 0).toFixed(2)}`, icon: '📈' },
  ];

  return (
    <Layout>
      <h2 style={{ marginBottom: '30px', color: '#2d1e54' }}>Dashboard Overview</h2>
      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <div className="card-title">{card.title}</div>
            <div className="card-value">{card.value}</div>
            <div className="card-icon" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Dashboard;
