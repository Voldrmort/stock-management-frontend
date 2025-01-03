import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './login1';
import InventoryPage from './InventoryPage';
import { isAuthenticated, handleLogout } from './utils/auth';

// ✅ Axios Instance with Authorization Token
const API = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:5000',
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        console.log('🔑 Token attached to request:', token); // Debug
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// ✅ Authentication Wrapper for Protected Routes
const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [auth, setAuth] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuth(true);
        } else {
            navigate('/login');
        }
        setLoading(false);
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return auth ? children : <Navigate to="/login" />;
};

// ✅ Main App Component
function App() {
    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        stock: 0,
        price: 0,
        stockRoom: 'Stock Room 1',
    });
    const [reduceStockValues, setReduceStockValues] = useState({});
    const [nameSearch, setNameSearch] = useState('');
    const [stockRoomFilter, setStockRoomFilter] = useState('');

    // ✅ Fetch Inventory
    const fetchInventory = async () => {
        try {
            const response = await API.get('/inventory');
            setInventory(response.data);
        } catch (error) {
            console.error('❌ Error fetching inventory:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated()) {
            fetchInventory();
        }
    }, []);

    // ✅ Add Item
    const handleAddItem = async () => {
        try {
            await API.post('/inventory', newItem);
            fetchInventory();
            setNewItem({ name: '', stock: 0, price: 0, stockRoom: 'Stock Room 1' });
        } catch (error) {
            console.error('❌ Error adding item:', error);
        }
    };
    // ✅ Reduce Stock
   const handleReduceStock = async (id, rev, reduceValue) => {
       console.log('🔄 Reducing Stock:', { id, rev, reduceValue });

       if (!reduceValue || reduceValue <= 0) {
           alert('❗ Please enter a valid stock reduction value.');
           return;
       }

       try {
           const response = await API.put(`/inventory/reduce-stock/${id}`, {
               quantity: parseInt(reduceValue, 10),
               rev: rev,
           });
           console.log('✅ Stock reduced successfully:', response.data);

           fetchInventory(); // Refresh inventory list
           setReduceStockValues((prev) => ({ ...prev, [id]: '' }));
       } catch (error) {
           console.error('❌ Error reducing stock:', error.response?.data || error.message);
           alert('Failed to reduce stock. Please try again.');
       }
   };

    // ✅ Filtered Inventory
    const filteredInventory = inventory.filter((item) => {
        const matchesName = nameSearch === '' || item.name.toLowerCase().includes(nameSearch.toLowerCase());
        const matchesStockRoom = stockRoomFilter === '' || item.stockRoom === stockRoomFilter;
        return matchesName && matchesStockRoom;
    });

    return (
        <Router>
            <div style={{ padding: '20px' }}>
                <h1>📦 Stock Management System</h1>

                {/* ✅ Show Logout if Authenticated */}
                {isAuthenticated() && (
                    <nav>
                        <button onClick={handleLogout} style={{ marginBottom: '10px' }}>
                            Logout
                        </button>
                    </nav>
                )}

                {/* ✅ Routes */}
                <Routes>
                    {/* Public Login Route */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Inventory Route */}
                    <Route
                        path="/inventory"
                        element={
                            <ProtectedRoute>
                                <div>
                                    {/* ✅ Add Item Section */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <h2>Add New Item</h2>
                                        <input
                                            type="text"
                                            placeholder="Item Name"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            style={{ marginRight: '10px' }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={newItem.stock}
                                            onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                                            style={{ marginRight: '10px' }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                            style={{ marginRight: '10px' }}
                                        />
                                        <select
                                            value={newItem.stockRoom}
                                            onChange={(e) => setNewItem({ ...newItem, stockRoom: e.target.value })}
                                            style={{ marginRight: '10px' }}
                                        >
                                            <option value="Stock Room 1">Stock Room 1</option>
                                            <option value="Stock Room 2">Stock Room 2</option>
                                            <option value="Stock Room 3">Stock Room 3</option>
                                            <option value="Stock Room 4">Stock Room 4</option>
                                        </select>
                                        <button onClick={handleAddItem}>Add Item</button>
                                    </div>

                                    {/* ✅ Search & Filter Section */}
                                    <div>
                                        <h2>Search & Filter</h2>
                                        <input
                                            type="text"
                                            placeholder="Search by Name"
                                            value={nameSearch}
                                            onChange={(e) => setNameSearch(e.target.value)}
                                            style={{ marginRight: '10px' }}
                                        />
                                        <select
                                            value={stockRoomFilter}
                                            onChange={(e) => setStockRoomFilter(e.target.value)}
                                            style={{ marginRight: '10px' }}
                                        >
                                            <option value="">All Stock Rooms</option>
                                            <option value="Stock Room 1">Stock Room 1</option>
                                            <option value="Stock Room 2">Stock Room 2</option>
                                            <option value="Stock Room 3">Stock Room 3</option>
                                            <option value="Stock Room 4">Stock Room 4</option>
                                        </select>
                                    </div>

                                    {/* ✅ Inventory Table with Reduce Stock */}
                                    <h2>Inventory List</h2>
                                    <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'center' }}>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Stock</th>
                                                <th>Price</th>
                                                <th>Stock Room</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredInventory.map((item) => (
                                                <tr key={item._id}>
                                                    <td>{item.name || 'N/A'}</td>
                                                    <td>{item.stock ?? 'N/A'}</td>
                                                    <td>${Number(item.price || 0).toFixed(2)}</td>
                                                    <td>{item.stockRoom || 'N/A'}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            placeholder="Reduce"
                                                            value={reduceStockValues[item._id] || ''}
                                                            onChange={(e) =>
                                                                setReduceStockValues({
                                                                    ...reduceStockValues,
                                                                    [item._id]: e.target.value,
                                                                })
                                                            }
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                console.log('Reduce Stock Details:', item._id, item._rev, reduceStockValues[item._id]); // 🐞 Debug Here
                                                                handleReduceStock(item._id, item._rev, reduceStockValues[item._id]);
                                                            }}
                                                        >
                                                            Reduce Stock
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
