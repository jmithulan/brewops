import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import NavigationBar from '../components/navigationBar';
import Footer from '../components/Footer';
import InventorySidebar from '../components/inventorySidebar';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const SupplyRecordTable = () => {
    const [supplyrecords, setSupplyRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchType, setSearchType] = useState('');
    const [filteredSupplyRecords, setFilteredSupplyRecords] = useState([]);
    const [teaLeavesQuantity, setTeaLeavesQuantity] = useState(() => {
        const savedQuantity = localStorage.getItem('teaLeavesQuantity');
        return savedQuantity ? Number(savedQuantity) : 0;
    });
    const [manualAmount, setManualAmount] = useState(0);
    const tableRef = useRef();

    useEffect(() => {
        // Use mock data for demo/testing
        const mockData = [
            { _id: '1', supplier: 'GreenLeaf Farms', date: '2025-08-10', quantity: 120, status: 'Pending' },
            { _id: '2', supplier: 'TeaSource Ltd', date: '2025-08-09', quantity: 80, status: 'Pending' },
            { _id: '3', supplier: 'Herbal Harvest', date: '2025-08-08', quantity: 60, status: 'Inventory' },
            { _id: '4', supplier: 'Mountain Teas', date: '2025-08-07', quantity: 100, status: 'Pending' }
        ];
        setSupplyRecords(mockData);
        // Uncomment below to use backend
        // getSupplyRecords();
    }, []);

    const getSupplyRecords = async () => {
        setLoading(true);
        axios.get('http://localhost:5555/supplyrecords')
            .then((response) => {
                const formattedRecords = response.data.map(record => ({
                    ...record,
                    date: record.date.split('T')[0] 
                }));
                setSupplyRecords(formattedRecords); 
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    };

    useEffect(() => {
        axios.get('http://localhost:5555/teaLeaves')
            .then((response) => {
                const quantity = response.data.quantity;
                setTeaLeavesQuantity(quantity);
                localStorage.setItem('teaLeavesQuantity', quantity); // Save quantity to local storage
            })
            .catch((error) => {
                console.error('Error fetching tea leaves quantity:', error);
            });
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchInput, searchType]);

    const handleSearch = () => {
        if (searchInput.trim() === '') {
            setFilteredSupplyRecords([]);
        } else {
            const filtered = supplyrecords.filter(record => {
                return record.supplier.toLowerCase().includes(searchInput.toLowerCase());
            });
            setFilteredSupplyRecords(filtered);
        }
    };

    const handleAccept = (record) => {
        axios.put('http://localhost:5555/teaLeaves/increment', { incrementAmount: record.quantity })
            .then((response) => {
                setTeaLeavesQuantity(prevQuantity => prevQuantity + record.quantity);
                localStorage.setItem('teaLeavesQuantity', teaLeavesQuantity + record.quantity); // Update local storage
                handleRecordStatus(record._id);
            })
            .catch((error) => {
                console.error('Error updating tea leaves quantity:', error);
            });
    };

    const handleRecordStatus = async (recordId) => {
        try {
            const response = await axios.put(`http://localhost:5555/supplyrecords/changeStatus/${recordId}`, { status: 'Inventory' });
            console.log(response);
            if(response.status){
                getSupplyRecords();
            }
        } catch (error) {
            console.error(error);
        } 
    };

    const handleManualIncrease = () => {
        const newQuantity = teaLeavesQuantity + manualAmount;
        setTeaLeavesQuantity(newQuantity);
        localStorage.setItem('teaLeavesQuantity', newQuantity);
        setManualAmount(0);
    };

    const handleManualDecrease = () => {
        if (manualAmount <= teaLeavesQuantity) {
            const newQuantity = teaLeavesQuantity - manualAmount;
            setTeaLeavesQuantity(newQuantity);
            localStorage.setItem('teaLeavesQuantity', newQuantity);
            setManualAmount(0);
        } else {
            alert('Cannot decrease more than current quantity');
        }
    };


    return (
        <div className="min-h-screen flex flex-col">
            <NavigationBar />
            <div className="flex flex-1">
                <aside className="bg-gray-800 text-white w-64 h-screen p-6 space-y-4 sticky top-0">
                    <Link to="/HomePage" className="block px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium">Home</Link>
                    <Link to="/inventories" className="block px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium">Inventory</Link>
                    <Link to="/waste-management" className="block px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium">Waste Management</Link>
                    <Link to="/Irawleaves" className="block px-4 py-2 rounded bg-green-600 bg-opacity-40 text-sm font-medium">Raw Leaves Management</Link>
                </aside>
                <main className="flex-1 p-8 overflow-auto">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Supplier Records Table</h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <input
                                type="text"
                                placeholder="Search by supplier..."
                                className="border border-gray-300 px-4 py-2 rounded"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-900">
                                Search
                            </button>
                            <label className="text-gray-600 ml-2 mr-2" htmlFor="teaLeavesQuantityInput">Tea Leaves Quantity:</label>
                            <input
                                id="teaLeavesQuantityInput"
                                type="number"
                                className="border border-gray-300 px-2 py-1 rounded w-24"
                                value={teaLeavesQuantity}
                                onChange={e => setTeaLeavesQuantity(Number(e.target.value))}
                                disabled={loading}
                            />
                            <Link to="/Rawtealeaves2" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Send to Production</Link>
                        </div>
                    </div>
                    {loading ? (
                        <Spinner />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-8'>
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>No</th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Supplier</th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Supply Date</th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Quantity (KG)</th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(filteredSupplyRecords.length > 0 ? filteredSupplyRecords : supplyrecords).map((item, index) => (
                                        <tr key={item._id} className="border-t">
                                            <td className="px-6 py-3">{index + 1}</td>
                                            <td className="px-6 py-3">{item.supplier}</td>
                                            <td className="px-6 py-3">{item.date}</td>
                                            <td className="px-6 py-3">{item.quantity}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex gap-4 justify-center">
                                                    <button disabled={item.status === 'Inventory'} className={item.status === 'Pending' ? "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" : "bg-gray-500 text-white font-bold py-2 px-4 rounded"} onClick={() => handleAccept(item)}>Accept</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default SupplyRecordTable;