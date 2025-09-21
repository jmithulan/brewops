import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAddBox } from 'react-icons/md';
import { FaBoxOpen, FaTrashAlt, FaEdit, FaPlusCircle, FaTachometerAlt } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import { inventoryService } from '../services/inventoryService';
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
import { useAuth } from '../contexts/authcontext';

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

const Home = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [originalInventory, setOriginalInventory] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalRawLeaves, setTotalRawLeaves] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(null);
  const [chartType, setChartType] = useState('line');
  const lowInventoryToastShown = useRef(false);
  const chartRef = useRef(null);
  const location = useLocation();

  // Function to fetch inventory data
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      // Pass config to skip caching in axios
      const response = await inventoryService.getInventories({ skipCaching: true, skipDeduplication: true });
      console.log('Full API response:', response); // Debug log
      // Always extract inventories from response.data.inventories
      const inventories = (response && response.inventories) ? response.inventories : (response && response.data && response.data.inventories ? response.data.inventories : []);
      console.log('Extracted inventories:', inventories); // Debug log
      if (!Array.isArray(inventories)) {
        setOriginalInventory([]);
        setInventory([]);
        setVisibleCount(10);
        setLoading(false);
        toast.error('Inventory data is not in expected format.');
        return;
      }
      // sort newest first by createdAt
      inventories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOriginalInventory(inventories);
      setInventory(inventories);
      setVisibleCount(10);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Failed to fetch inventory data. Please try again.');
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

  // Send a notification to the server (will be picked up by production manager)
  const sendLowInventoryNotification = async (total) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';
      await axios.post(`${backendUrl}/api/notifications`, {
        title: 'Low Raw Leaves Inventory',
        body: `Raw leaves inventory is below 10,000 kg. Current total: ${total} kg.`,
        // backend may accept additional fields like recipientRole or meta; adjust if needed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to send low inventory notification:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
  }, []);


  useEffect(() => {
    if (!authLoading && isAuthenticated()) {
      fetchInventoryData();
    }
  }, [authLoading, isAuthenticated, location]);

  // Always fetch inventory data when the page/tab is focused
  useEffect(() => {
    const handleVisibility = () => {
      if (!authLoading && isAuthenticated()) {
        fetchInventoryData();
      }
    };
    window.addEventListener('focus', handleVisibility);
    return () => window.removeEventListener('focus', handleVisibility);
  }, [authLoading, isAuthenticated]);

  const handleSearch = () => {
    if (typeof searchInput !== 'string' || searchInput.trim() === '') {
      setInventory(originalInventory);
      setVisibleCount(10);
    } else {
      const filtered = originalInventory.filter(item => {
        if (typeof item.inventoryid === 'string' && typeof searchInput === 'string') {
          return item.inventoryid.toLowerCase().includes(searchInput.toLowerCase());
        }
        return false;
      });
      setInventory(filtered);
      setVisibleCount(10);
    }
  };

// Replace your existing handleReportGeneration function with this modern version
const handleReportGeneration = () => {
  try {
    // Get current date and calculate past month date range
    const currentDate = new Date();
    const pastMonth = new Date();
    pastMonth.setMonth(currentDate.getMonth() - 1);
    
    // Filter inventories from the past month
    const pastMonthInventories = originalInventory.filter(item => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= pastMonth && itemDate <= currentDate;
    });

    if (pastMonthInventories.length === 0) {
      toast.error('No inventory records found for the past month.');
      return;
    }

    // Calculate statistics
    const totalQuantity = pastMonthInventories.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const averageQuantity = totalQuantity / pastMonthInventories.length;
    const minQuantity = Math.min(...pastMonthInventories.map(item => item.quantity || 0));
    const maxQuantity = Math.max(...pastMonthInventories.map(item => item.quantity || 0));

    // Group by week for trend analysis
    const weeklyData = {};
    pastMonthInventories.forEach(item => {
      const itemDate = new Date(item.createdAt);
      const weekStart = new Date(itemDate);
      weekStart.setDate(itemDate.getDate() - itemDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { count: 0, totalQuantity: 0, items: [] };
      }
      weeklyData[weekKey].count++;
      weeklyData[weekKey].totalQuantity += item.quantity || 0;
      weeklyData[weekKey].items.push(item);
    });

    const doc = new jsPDF();
    let yPosition = 20;

    // Header with company branding
    doc.setFillColor(34, 197, 94); // Green color
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('INVENTORY MANAGEMENT REPORT', 105, 20, { align: 'center' });

    // Report metadata
    yPosition = 45;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Report Period: ${pastMonth.toLocaleDateString()} - ${currentDate.toLocaleDateString()}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Generated on: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Records: ${pastMonthInventories.length}`, 20, yPosition);
    yPosition += 15;

    // Executive Summary Section
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPosition - 5, 180, 25, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('EXECUTIVE SUMMARY', 20, yPosition + 5);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPosition += 15;
    
    doc.text(`• Total Inventory Quantity: ${totalQuantity.toLocaleString()} kg`, 25, yPosition);
    yPosition += 5;
    doc.text(`• Average Quantity per Entry: ${averageQuantity.toFixed(2)} kg`, 25, yPosition);
    yPosition += 5;
    doc.text(`• Highest Single Entry: ${maxQuantity.toLocaleString()} kg`, 25, yPosition);
    yPosition += 5;
    doc.text(`• Lowest Single Entry: ${minQuantity.toLocaleString()} kg`, 25, yPosition);
    yPosition += 15;

    // Weekly Trend Analysis
    if (Object.keys(weeklyData).length > 1) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('WEEKLY TREND ANALYSIS', 20, yPosition);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      yPosition += 10;

      const weeklyHeaders = [['Week Starting', 'Entries', 'Total Quantity (kg)', 'Average (kg)']];
      const weeklyRows = Object.entries(weeklyData)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([weekStart, data]) => [
          new Date(weekStart).toLocaleDateString(),
          data.count.toString(),
          data.totalQuantity.toLocaleString(),
          (data.totalQuantity / data.count).toFixed(2)
        ]);

      autoTable(doc, {
        head: weeklyHeaders,
        body: weeklyRows,
        startY: yPosition,
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 20, right: 20 },
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Inventory Status Analysis
    const lowStock = pastMonthInventories.filter(item => (item.quantity || 0) < 100);
    const mediumStock = pastMonthInventories.filter(item => (item.quantity || 0) >= 100 && (item.quantity || 0) < 500);
    const highStock = pastMonthInventories.filter(item => (item.quantity || 0) >= 500);

    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text('INVENTORY STATUS DISTRIBUTION', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPosition += 10;

    const statusHeaders = [['Status Category', 'Count', 'Percentage', 'Total Quantity (kg)']];
    const statusRows = [
      ['Low Stock (< 100 kg)', lowStock.length.toString(), `${((lowStock.length/pastMonthInventories.length)*100).toFixed(1)}%`, lowStock.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString()],
      ['Medium Stock (100-499 kg)', mediumStock.length.toString(), `${((mediumStock.length/pastMonthInventories.length)*100).toFixed(1)}%`, mediumStock.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString()],
      ['High Stock (≥ 500 kg)', highStock.length.toString(), `${((highStock.length/pastMonthInventories.length)*100).toFixed(1)}%`, highStock.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString()]
    ];

    autoTable(doc, {
      head: statusHeaders,
      body: statusRows,
      startY: yPosition,
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 20, right: 20 },
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Detailed Inventory Records
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text('DETAILED INVENTORY RECORDS', 20, yPosition);
    yPosition += 10;

    const detailedHeaders = [['#', 'Inventory ID', 'Quantity (kg)', 'Date Created', 'Status']];
    const detailedRows = pastMonthInventories
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((item, index) => {
        let status = 'High Stock';
        if ((item.quantity || 0) < 100) status = 'Low Stock';
        else if ((item.quantity || 0) < 500) status = 'Medium Stock';
        
        return [
          (index + 1).toString(),
          item.inventoryid || 'N/A',
          (item.quantity || 0).toLocaleString(),
          item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
          status
        ];
      });

    autoTable(doc, {
      head: detailedHeaders,
      body: detailedRows,
      startY: yPosition,
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated by Inventory Management System | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('This report is confidential and for internal use only', 105, 285, { align: 'center' });
    }

    // Save the PDF with a descriptive filename
    const fileName = `Inventory_Report_${pastMonth.toISOString().slice(0, 7)}_to_${currentDate.toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    
    toast.success(`Report generated successfully! Found ${pastMonthInventories.length} records from the past month.`);
    
  } catch (error) {
    console.error('Error generating modern PDF report:', error);
    toast.error('Failed to generate report. Please try again.');
  }
};

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    if (e.target.value) {
      const filtered = originalInventory.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() === parseInt(e.target.value);
      });
      setInventory(filtered);
      setVisibleCount(10);
    } else {
      setInventory(originalInventory);
      setVisibleCount(10);
    }
  };

  const handleSort = () => {
    const sorted = [...inventory].sort((a, b) => a.quantity - b.quantity);
    setInventory(sorted);
    setVisibleCount(10);
  };

  useEffect(() => {
    // Calculate total raw leaves inventory
    const total = originalInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setTotalRawLeaves(total);

    // Check if inventory is below threshold and avoid duplicate notifications
    if (total < 10000 && previousTotal !== null && total !== previousTotal) {
      // Send notification to production manager via backend
      sendLowInventoryNotification(total);
      // Show a local toast once for this low-inventory event
      if (!lowInventoryToastShown.current) {
        toast.error('Warning: Raw leaves inventory is below 10,000 kg! Notify the production manager.');
        lowInventoryToastShown.current = true;
      }
    }

    // Reset the local-toast flag if inventory recovers above threshold
    if (total >= 10000 && lowInventoryToastShown.current) {
      lowInventoryToastShown.current = false;
    }

    // Update previous total after all checks
    setPreviousTotal(total);
  }, [originalInventory]);

  const chartData = {
    labels: inventory.map(item => item.inventoryid),
    datasets: [
      {
        label: 'Quantity',
        data: inventory.map(item => item.quantity),
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
      title: { display: true, text: 'Inventory Quantity per Item' },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Quantity: ${context.parsed.y}`;
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
      {/* Layout with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
  <aside className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700 h-screen p-6 space-y-4 sticky top-0 text-white">
          <Link to="/inventory" className="flex items-center space-x-2 p-3 rounded-lg bg-green-600 bg-opacity-40 text-base font-medium">
            <FaBoxOpen className="text-lg" />
            <span>Inventory Management</span>
          </Link>
          <Link to="/ProductionManagerDashboard" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-700 text-base font-medium">
            <FaTachometerAlt className="text-lg" />
            <span>Dashboard</span>
          </Link>
          <Link to="/Production" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-700 text-base font-medium">
            <FaEdit className="text-lg" />
            <span>Production</span>
          </Link>
          <Link to="/inventory/new" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-700 text-base font-medium">
            <FaPlusCircle className="text-lg" />
            <span>Add Inventory</span>
          </Link>

        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Inventory List</h1>
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="text"
                placeholder="Search by Inventory Number..."
                className="border border-gray-300 px-4 py-2 rounded"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-900">
                Search
              </button>
              <button 
                onClick={fetchInventoryData} 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button onClick={handleReportGeneration} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-900">
                Generate Report
              </button>
              <Link
                to="/inventory/new"
                state={{ background: location }}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-900"
              >
                <MdOutlineAddBox className="text-xl mr-2" />
                Add Inventory
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

            {/* Display for current total raw leaves inventory */}
            <div className="bg-green-100 p-4 rounded-lg w-auto shadow-md mb-2">
              <h2 className="text-lg font-bold text-green-800">Current Raw Leaves Inventory</h2>
              <p className="text-green-700 text-xl">{totalRawLeaves} kg</p>
            </div>

            {/* Minimum required inventory display */}
            <div className="bg-yellow-100 p-4 rounded-lg w-auto shadow-md mb-2">
              <h2 className="text-lg font-bold text-yellow-800">Minimum Required to Reach Full Inventory</h2>
              <p className="text-yellow-700 text-xl">{Math.max(10000 - totalRawLeaves, 0)} kg</p>
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
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Inventory ID</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Quantity (kg)</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Date Created</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.slice(0, visibleCount).map((item, index) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-6 py-3">{index + 1}</td>
                      <td className="px-6 py-3 font-semibold text-black">{item.inventoryid ?? '-'}</td>
                      <td className="px-6 py-3">{item.quantity ?? '-'}</td>
                      <td className="px-6 py-3">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-4">
                          <Link to={`/inventory/${item.id}`} state={{ background: location }} className="text-green-700 text-xl">
                            <BsInfoCircle />
                          </Link>
                          <Link to={`/inventory/edit/${item.id}`} state={{ background: location }} className="text-yellow-600 text-xl">
                            <AiOutlineEdit />
                          </Link>
                          {/* Delete button removed as requested */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {inventory.length > visibleCount && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setVisibleCount((c) => Math.min(c + 10, inventory.length))}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Show more
              </button>
            </div>
          )}

          {/* Interactive Chart at the end of the page */}
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
                  key={`bar-chart-${inventory.length}`} 
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
                  key={`line-chart-${inventory.length}`} 
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
};

export default Home;