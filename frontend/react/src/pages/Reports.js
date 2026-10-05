import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Reports() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/reports/sales/daily', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesData(response.data.report || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <h2 style={{ marginBottom: '30px', color: '#2d1e54' }}>Sales Reports</h2>
      
      <div className="chart-container">
        <div className="chart-title">Daily Sales Trend</div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total_sales" stroke="#667eea" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Daily Summary</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders</th>
              <th>Total Sales</th>
              <th>Total Discount</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.order_count}</td>
                <td>${item.total_sales?.toFixed(2)}</td>
                <td>${item.total_discount?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Reports;
