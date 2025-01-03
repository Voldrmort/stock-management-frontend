import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InventoryPage() {
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

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await axios.get('http://localhost:5000/inventory');
            setInventory(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };


    const handleAddItem = async () => {
        try {
            await axios.post('http://localhost:5000/inventory', newItem);
            fetchInventory();
            setNewItem({ name: '', stock: 0, price: 0, stockRoom: 'Stock Room 1' });
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

   const handleReduceStock = async (id, rev, reduceValue) => {
       if (!reduceValue || reduceValue <= 0) {
           alert('Please enter a valid stock reduction value.');
           return;
       }

       if (!rev) {
           console.error('Revision ID (rev) is missing!');
           alert('Item revision ID is missing. Please refresh the page.');
           return;
       }

       try {
           await axios.put(`http://localhost:5000/inventory/reduce-stock/${id}`, {
               quantity: parseInt(reduceValue),
               rev: rev,
           });
           fetchInventory();
           setReduceStockValues((prev) => ({ ...prev, [id]: '' }));
       } catch (error) {
           console.error('Error reducing stock:', error);
           alert('Failed to reduce stock. Please try again.');
       }
   };

    const filteredInventory = inventory.filter((item) => {
        const matchesName = nameSearch === '' || item.name.toLowerCase().includes(nameSearch.toLowerCase());
        const matchesStockRoom = stockRoomFilter === '' || item.stockRoom === stockRoomFilter;
        return matchesName && matchesStockRoom;
    });

    return (
        <div>
            <h2>Inventory Management</h2>

            {/* Add New Item */}
            <div>
                <h3>Add New Item</h3>
                <input
                    type="text"
                    placeholder="Item Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Stock"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                />
                <select
                    value={newItem.stockRoom}
                    onChange={(e) => setNewItem({ ...newItem, stockRoom: e.target.value })}
                >
                    <option value="Stock Room 1">Stock Room 1</option>
                    <option value="Stock Room 2">Stock Room 2</option>
                    <option value="Stock Room 3">Stock Room 3</option>
                    <option value="Stock Room 4">Stock Room 4</option>
                </select>
                <button onClick={handleAddItem}>Add Item</button>
            </div>

            {/* Search and Filter */}
            <div>
                <h3>Search & Filter</h3>
                <input
                    type="text"
                    placeholder="Search by Name"
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                />
                <select
                    value={stockRoomFilter}
                    onChange={(e) => setStockRoomFilter(e.target.value)}
                >
                    <option value="">All Stock Rooms</option>
                    <option value="Stock Room 1">Stock Room 1</option>
                    <option value="Stock Room 2">Stock Room 2</option>
                </select>
            </div>

            {/* Inventory Table */}
            <table>
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
                            <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                            <td>{item.stockRoom || 'N/A'}</td>
                            <td>
                                <input
                                    type="number"
                                    placeholder="Reduce Stock"
                                    value={reduceStockValues[item._id] || ''}
                                    onChange={(e) =>
                                        setReduceStockValues({
                                            ...reduceStockValues,
                                            [item._id]: e.target.value,
                                        })
                                    }
                                />
                                <button
                                    onClick={() =>
                                        handleReduceStock(item._id, item._rev, reduceStockValues[item._id])
                                    }
                                >
                                    Reduce Stock
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default InventoryPage;
