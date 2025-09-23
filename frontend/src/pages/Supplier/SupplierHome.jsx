import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
<<<<<<< HEAD
import NavigationBar from '../../components/navigationBar';
=======
>>>>>>> b34fc7b (init)
import SupplierSidebar from '../../components/SupplierSidebar';
import { Link, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { FaBoxOpen, FaTrashAlt, FaEdit, FaPlusCircle, FaUsers } from 'react-icons/fa';
import Spinner from '../../components/Spinner';
<<<<<<< HEAD
import Footer from '../../components/Footer';
=======
import Footer from '../../components/footer';
>>>>>>> b34fc7b (init)
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  Title, 
  Tooltip, 
  Legend
);

export default function SupplierHome() {
<<<<<<< HEAD
=======
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';
>>>>>>> b34fc7b (init)
  const [originalSuppliers, setOriginalSuppliers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [activeSuppliers, setActiveSuppliers] = useState(0);
  const [chartType, setChartType] = useState('line');
  const chartRef = useRef(null);
  const location = useLocation();

  // Function to fetch suppliers data
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Token available:', !!token);
      
      // Try to fetch all suppliers first (including inactive)
      let response;
      try {
<<<<<<< HEAD
        response = await axios.get('http://localhost:5000/api/suppliers/all', {
=======
        response = await axios.get(`${API_URL}/api/suppliers/all`, {
>>>>>>> b34fc7b (init)
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (apiError) {
        console.log('All suppliers endpoint not available, trying default endpoint...');
        // Fallback to regular suppliers endpoint
<<<<<<< HEAD
        response = await axios.get('http://localhost:5000/api/suppliers', {
=======
        response = await axios.get(`${API_URL}/api/suppliers`, {
>>>>>>> b34fc7b (init)
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        const suppliersData = response.data.data || [];
        console.log('Fetched suppliers count:', suppliersData.length);
        console.log('Sample supplier data:', suppliersData[0]);
        
        // Sort newest first by createdAt
        suppliersData.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
        setOriginalSuppliers(suppliersData);
        setSuppliers(suppliersData);
        setVisibleCount(10);
      } else {
        console.error('Failed to fetch suppliers:', response.data?.message);
        // Use mock data with mixed statuses as fallback
        const mockSuppliers = [
          {
            _id: 'mock1',
            supplier_id: 'SUP00001',
            name: 'Green Valley Tea Suppliers',
            address: '123 Green Valley Road, Colombo',
            contact_number: '+94771234567',
            email: 'greenvally@example.com',
            rate: 150,
            is_active: true,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'mock2',
            supplier_id: 'SUP00002',
            name: 'Highland Tea Gardens',
            address: 'Highland Estate, Kandy',
            contact_number: '+94777654321',
            email: 'highland@example.com',
            rate: 155,
            is_active: true,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'mock3',
            supplier_id: 'SUP00003',
            name: 'Mountain Fresh Tea Co.',
            address: 'Mountain View, Nuwara Eliya',
            contact_number: '+94712345678',
            email: 'mountain@example.com',
            rate: 148,
            is_active: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'mock4',
            supplier_id: 'SUP17571618746464',
            name: 'Kamal Perera',
            address: 'Matara',
            contact_number: '+94771234567',
            email: 'kamal@example.com',
            rate: 150,
            is_active: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'mock5',
            supplier_id: 'SUP-20250907-0930',
            name: 'Rasika Perera',
            address: '123/6, 1st lane, Panadura',
            contact_number: '0715689723',
            email: 'rasika@example.com',
            rate: 150,
            is_active: true,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'mock6',
            supplier_id: 'SUP-20250907-1008',
            name: 'Sherin Perera',
            address: 'Pinkella Road, Hirana',
            contact_number: '0715689723',
            email: 'sherin@example.com',
            rate: 150,
            is_active: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'mock7',
            supplier_id: 'SUP-20250907-1009',
            name: 'Shehan Perera',
            address: 'Pinkella Road, Hirana',
            contact_number: '6461359646',
            email: 'shehan@example.com',
            rate: 150,
            is_active: false,
            createdAt: new Date().toISOString(),
          },
        ];
        setOriginalSuppliers(mockSuppliers);
        setSuppliers(mockSuppliers);
        setVisibleCount(10);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Use mock data as fallback for development
      const mockSuppliers = [
        {
          _id: 'error1',
          supplier_id: 'SUP00001',
          name: 'Green Valley Tea Suppliers',
          address: '123 Green Valley Road, Colombo',
          contact_number: '+94771234567',
          email: 'greenvally@example.com',
          rate: 150,
          is_active: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'error2',
          supplier_id: 'SUP00002',
          name: 'Highland Tea Gardens',
          address: 'Highland Estate, Kandy',
          contact_number: '+94777654321',
          email: 'highland@example.com',
          rate: 155,
          is_active: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'error3',
          supplier_id: 'SUP-20250907-0930',
          name: 'Rasika Perera',
          address: '123/6, 1st lane, Panadura',
          contact_number: '0715689723',
          email: 'rasika@example.com',
          rate: 150,
          is_active: false,
          createdAt: new Date().toISOString(),
        },
      ];
      setOriginalSuppliers(mockSuppliers);
      setSuppliers(mockSuppliers);
      setVisibleCount(10);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup effect to destroy chart instances when chart type changes
  useEffect(() => {
    return () => {
      // Clean up any existing chart instances
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartType]);

  useEffect(() => {
    setLoading(true);
  }, []);

  // Initial data fetch and refresh on navigation state change
  useEffect(() => {
    fetchSuppliers();
    
    // Show success message if coming from create supplier
    if (location.state?.message) {
      setTimeout(() => {
        toast.success(location.state.message);
      }, 100);
      
      // Clear the state to prevent showing message on subsequent visits
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.refresh, location.state?.timestamp]);

  const handleSearch = () => {
    if (searchInput.trim() === '') {
      setSuppliers(originalSuppliers);
      setVisibleCount(10);
    } else {
      const filtered = originalSuppliers.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchInput.toLowerCase())) ||
        (item.supplier_id && item.supplier_id.toLowerCase().includes(searchInput.toLowerCase()))
      );
      setSuppliers(filtered);
      setVisibleCount(10);
    }
  };

  // Report generation function for suppliers
  const handleReportGeneration = () => {
    try {
      const currentDate = new Date();
      const pastMonth = new Date();
      pastMonth.setMonth(currentDate.getMonth() - 1);
      
      const pastMonthSuppliers = originalSuppliers.filter(item => {
        if (!item.createdAt && !item.created_at) return false;
        const itemDate = new Date(item.createdAt || item.created_at);
        return itemDate >= pastMonth && itemDate <= currentDate;
      });

      if (pastMonthSuppliers.length === 0) {
        toast.error('No supplier records found for the past month.');
        return;
      }

      const doc = new jsPDF();
      let yPosition = 20;

      // Header
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('SUPPLIER MANAGEMENT REPORT', 105, 20, { align: 'center' });

      // Report metadata
      yPosition = 45;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Report Period: ${pastMonth.toLocaleDateString()} - ${currentDate.toLocaleDateString()}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Generated on: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Total Records: ${pastMonthSuppliers.length}`, 20, yPosition);
      yPosition += 15;

      // Executive Summary
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition - 5, 180, 25, 'F');
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('EXECUTIVE SUMMARY', 20, yPosition + 5);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      yPosition += 15;
      
      const avgRate = pastMonthSuppliers.reduce((sum, item) => sum + (item.rate || 0), 0) / pastMonthSuppliers.length;
      doc.text(`• Total Suppliers: ${pastMonthSuppliers.length}`, 25, yPosition);
      yPosition += 5;
      doc.text(`• Average Rate: LKR ${avgRate.toFixed(2)} per kg`, 25, yPosition);
      yPosition += 5;
      doc.text(`• Highest Rate: LKR ${Math.max(...pastMonthSuppliers.map(item => item.rate || 0))} per kg`, 25, yPosition);
      yPosition += 5;
      doc.text(`• Lowest Rate: LKR ${Math.min(...pastMonthSuppliers.map(item => item.rate || 0))} per kg`, 25, yPosition);
      yPosition += 15;

      // Detailed supplier records
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('DETAILED SUPPLIER RECORDS', 20, yPosition);
      yPosition += 10;

      const detailedHeaders = [['#', 'Supplier ID', 'Name', 'Contact', 'Rate (LKR/kg)', 'Date Added']];
      const detailedRows = pastMonthSuppliers.map((item, index) => [
        (index + 1).toString(),
        item.supplier_id || 'N/A',
        item.name || 'N/A',
        item.contact_number || 'N/A',
        (item.rate || 0).toString(),
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
      ]);

      autoTable(doc, {
        head: detailedHeaders,
        body: detailedRows,
        startY: yPosition,
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated by Supplier Management System | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      const fileName = `Supplier_Report_${pastMonth.toISOString().slice(0, 7)}_to_${currentDate.toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
      
      toast.success(`Report generated successfully! Found ${pastMonthSuppliers.length} records from the past month.`);
      
    } catch (error) {
      console.error('Error generating supplier report:', error);
      toast.error('Failed to generate report. Please try again.');
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    if (e.target.value) {
      const filtered = originalSuppliers.filter(item => {
        const itemDate = new Date(item.createdAt || item.created_at);
        return itemDate.getMonth() === parseInt(e.target.value);
      });
      setSuppliers(filtered);
      setVisibleCount(10);
    } else {
      setSuppliers(originalSuppliers);
      setVisibleCount(10);
    }
  };

  const handleSort = () => {
    const sorted = [...suppliers].sort((a, b) => (a.rate || 0) - (b.rate || 0));
    setSuppliers(sorted);
    setVisibleCount(10);
  };

  // Calculate statistics
  useEffect(() => {
    const total = originalSuppliers.length;
    const active = originalSuppliers.filter(supplier => supplier.status !== 'inactive').length;
    
    setTotalSuppliers(total);
    setActiveSuppliers(active);
  }, [originalSuppliers]);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
    supplier.supplier_id?.toLowerCase().includes(searchInput.toLowerCase())
  );

  const chartData = {
    labels: suppliers.map(item => item.supplier_id || item.name || 'Unknown'),
    datasets: [
      {
        label: 'Rate (LKR/kg)',
        data: suppliers.map(item => item.rate || 0),
        backgroundColor: 'rgba(34,197,94,0.7)',
        borderColor: 'rgba(34,197,94,1)',
        borderWidth: 2,
        hoverBackgroundColor: 'rgba(34,197,94,1)',
        hoverBorderColor: 'rgba(21,128,61,1)',
        pointBackgroundColor: 'rgba(34,197,94,1)',
        pointBorderColor: '#fff',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Supplier Rates (LKR per kg)' },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Rate: LKR ${context.parsed.y} per kg`;
          }
        }
      },
    },
    hover: { mode: 'nearest', intersect: true },
    scales: {
      y: { beginAtZero: true },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
<<<<<<< HEAD
      <NavigationBar />
=======
>>>>>>> b34fc7b (init)
      {/* Layout with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="bg-gray-800 text-white w-64 h-screen p-6 space-y-4 sticky top-0">
          <Link to="/SupplierHome" className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 bg-opacity-40 text-sm font-medium">
            <FaUsers /> Suppliers
          </Link>
<<<<<<< HEAD
          <Link to="/SupplierRecode" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium">
=======
          <Link to="/suppliers" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium">
>>>>>>> b34fc7b (init)
            <FaEdit /> Supply Records
          </Link>
          <Link to="/SupplierHome" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium">
            <FaBoxOpen /> Analytics
          </Link>
<<<<<<< HEAD
          <Link to="/SupplierHome" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium">
=======
          <Link to="/reports" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium">
>>>>>>> b34fc7b (init)
            <FaPlusCircle /> Reports
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Supplier List</h1>
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="text"
                placeholder="Search by Supplier Name or ID..."
                className="border border-gray-300 px-4 py-2 rounded"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-900">
                Search
              </button>
              <button onClick={handleReportGeneration} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-900">
                Generate Report
              </button>
              <Link
<<<<<<< HEAD
                to="/suppliers/create"
=======
                to="/suppliers/new"
>>>>>>> b34fc7b (init)
                state={{ background: location }}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-900"
              >
                <MdOutlineAddBox className="text-xl mr-2" />
                Add Supplier
              </Link>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-4 mb-4 w-auto">
              <label htmlFor="month" className="font-medium">Select Month:</label>
              <select
                id="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="">All</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>

            {/* Display for total suppliers */}
            <div className="bg-blue-100 p-4 rounded-lg w-auto shadow-md mb-2">
              <h2 className="text-lg font-bold text-blue-800">Total Suppliers</h2>
              <p className="text-blue-700 text-xl">{totalSuppliers}</p>
            </div>

            {/* Active suppliers display */}
            <div className="bg-green-100 p-4 rounded-lg w-auto shadow-md mb-2">
              <h2 className="text-lg font-bold text-green-800">Active Suppliers</h2>
              <p className="text-green-700 text-xl">{activeSuppliers}</p>
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
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Supplier ID</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Name</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Address</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Contact</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Rate (LKR/kg)</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.slice(0, visibleCount).map((item, index) => (
                    <tr key={item._id || item.id} className="border-t">
                      <td className="px-6 py-3">{index + 1}</td>
                      <td className="px-6 py-3 font-semibold text-black">{item.supplier_id || item.supplierId || 'N/A'}</td>
                      <td className="px-6 py-3">{item.name || item.supplierName || 'N/A'}</td>
                      <td className="px-6 py-3">{item.address || 'N/A'}</td>
                      <td className="px-6 py-3">{item.contact_number || item.contactNumber || 'N/A'}</td>
                      <td className="px-6 py-3">{item.rate || 'N/A'}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-4">
                          <Link 
<<<<<<< HEAD
                            to={`/suppliers/details/${item._id || item.id}`} 
=======
                            to={`/suppliers/${item._id || item.id}`} 
>>>>>>> b34fc7b (init)
                            state={{ background: location }}
                            className="text-green-700 text-xl"
                          >
                            <BsInfoCircle />
                          </Link>
                          <Link 
<<<<<<< HEAD
                            to={`/suppliers/edit/${item._id || item.id}`} 
=======
                            to={`/suppliers/${item._id || item.id}/edit`} 
>>>>>>> b34fc7b (init)
                            state={{ background: location }}
                            className="text-yellow-600 text-xl"
                          >
                            <AiOutlineEdit />
                          </Link>
                          <Link 
<<<<<<< HEAD
                            to={`/suppliers/delete/${item._id || item.id}`} 
=======
                            to={`/suppliers/${item._id || item.id}/delete`} 
>>>>>>> b34fc7b (init)
                            state={{ background: location }}
                            className="text-red-600 text-xl"
                          >
                            <MdOutlineDelete />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {suppliers.length > visibleCount && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setVisibleCount((c) => Math.min(c + 10, suppliers.length))}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Show more
              </button>
            </div>
          )}

          {/* Interactive Chart */}
          <div className="mt-12 bg-white p-6 rounded-lg shadow-md max-w-2xl w-auto mx-auto">
            <div className="mb-4 flex items-center w-auto gap-4">
              <label htmlFor="chartType" className="font-medium">Chart Type:</label>
              <select
                id="chartType"
                value={chartType}
                onChange={e => setChartType(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
              </select>
            </div>
            <div style={{ height: '400px', width: '100%' }}>
              {chartType === 'bar' ? (
                <Bar 
                  key={`bar-chart-${suppliers.length}`} 
                  ref={chartRef}
                  data={chartData} 
                  options={{
                    ...chartOptions,
                    maintainAspectRatio: false,
                    responsive: true
                  }} 
                />
              ) : (
                <Line 
                  key={`line-chart-${suppliers.length}`} 
                  ref={chartRef}
                  data={chartData} 
                  options={{
                    ...chartOptions,
                    maintainAspectRatio: false,
                    responsive: true
                  }} 
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
