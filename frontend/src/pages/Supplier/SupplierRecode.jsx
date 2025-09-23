import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
<<<<<<< HEAD
import NavigationBar from "../../components/navigationBar";
=======
>>>>>>> b34fc7b (init)
import SupplierSidebar from "../../components/SupplierSidebar";
import { Link, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineAddBox, MdOutlineDelete } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import {
  FaBoxOpen,
  FaTrashAlt,
  FaEdit,
  FaPlusCircle,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";
import Spinner from "../../components/Spinner";
<<<<<<< HEAD
import Footer from "../../components/Footer";

export default function SupplierRecode() {
=======
import Footer from "../../components/footer";

export default function SupplierRecode() {
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';
>>>>>>> b34fc7b (init)
  const [originalRecords, setOriginalRecords] = useState([]);
  const [records, setRecords] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const location = useLocation();

  // Function to fetch suppliers for filter dropdown
  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
<<<<<<< HEAD
      const response = await axios.get("http://localhost:5000/api/suppliers", {
=======
      const response = await axios.get(`${API_URL}/api/suppliers`, {
>>>>>>> b34fc7b (init)
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        setSuppliers(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  // Function to fetch delivery records data
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      console.log("Token available:", !!token);

<<<<<<< HEAD
      let url = "http://localhost:5000/api/deliveries";

      // If specific supplier is selected, use supplier-specific endpoint
      if (selectedSupplier) {
        url = `http://localhost:5000/api/deliveries/supplier/${selectedSupplier}`;
=======
      let url = `${API_URL}/api/deliveries`;

      // If specific supplier is selected, use supplier-specific endpoint
      if (selectedSupplier) {
        url = `${API_URL}/api/deliveries/supplier/${selectedSupplier}`;
>>>>>>> b34fc7b (init)
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        const recordsData = response.data.data || [];
        // Sort by delivery_date (newest first)
        recordsData.sort(
          (a, b) => new Date(b.delivery_date) - new Date(a.delivery_date)
        );
        setOriginalRecords(recordsData);
        setRecords(recordsData);
        setVisibleCount(10);
      } else {
        console.error("Failed to fetch records:", response.data?.message);
        toast.error("Failed to load delivery records");
        setOriginalRecords([]);
        setRecords([]);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error(
        "Failed to load delivery records. Please check your connection."
      );
      setOriginalRecords([]);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSuppliers();
    fetchRecords();

    // Show success message if provided
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state?.refresh, location.state?.timestamp]);

  // Refetch when supplier filter changes
  useEffect(() => {
    if (selectedSupplier !== "") {
      fetchRecords();
    }
  }, [selectedSupplier]);

  // Update stats when records change
  useEffect(() => {
    setTotalRecords(records.length);

    const totalQty = records.reduce((sum, record) => {
      const quantity = parseFloat(record.quantity) || 0;
      return sum + quantity;
    }, 0);

    const totalAmt = records.reduce((sum, record) => {
      const amount = parseFloat(record.total_amount) || 0;
      return sum + amount;
    }, 0);

    setTotalQuantity(totalQty);
    setTotalAmount(totalAmt);
  }, [records]);

  // Filter and search functionality
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !searchInput ||
      record.supplier_name?.toLowerCase().includes(searchInput.toLowerCase()) ||
      record.supplier_code?.toLowerCase().includes(searchInput.toLowerCase()) ||
      record.payment_method
        ?.toLowerCase()
        .includes(searchInput.toLowerCase()) ||
      record.id?.toString().includes(searchInput);

    const matchesMonth =
      !selectedMonth ||
      new Date(record.delivery_date).getMonth() === parseInt(selectedMonth);

    return matchesSearch && matchesMonth;
  });

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setVisibleCount(10);
  };

  // Handle month filter
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setVisibleCount(10);
  };

  // Handle supplier filter
  const handleSupplierChange = (e) => {
    setSelectedSupplier(e.target.value);
    setVisibleCount(10);
  };

  // Load more records
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // Generate PDF report
  const handleReportGeneration = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Delivery Records Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total Records: ${filteredRecords.length}`, 14, 40);
    doc.text(`Total Quantity: ${totalQuantity.toFixed(2)} kg`, 14, 48);
    doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, 14, 56);

    const tableColumn = [
      "ID",
      "Supplier Code",
      "Supplier Name",
      "Quantity (kg)",
      "Rate/kg",
      "Total Amount",
      "Payment Method",
      "Status",
    ];
    const tableRows = [];

    filteredRecords.forEach((record) => {
      const recordData = [
        record.id.toString(),
        record.supplier_code || "N/A",
        record.supplier_name || "N/A",
        (parseFloat(record.quantity) || 0).toFixed(2),
        `Rs. ${(parseFloat(record.rate_per_kg) || 0).toFixed(2)}`,
        `Rs. ${(parseFloat(record.total_amount) || 0).toFixed(2)}`,
        record.payment_method === "spot" ? "Spot Payment" : "Monthly Payment",
        record.payment_status || "pending",
      ];
      tableRows.push(recordData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0] },
    });

    doc.save(
      `delivery-records-report-${new Date().toISOString().split("T")[0]}.pdf`
    );
    toast.success("Report generated successfully!");
  };

  // Handle delete record
  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this delivery record?")
    ) {
      try {
        const token = localStorage.getItem("jwtToken");
<<<<<<< HEAD
        await axios.delete(`http://localhost:5000/api/deliveries/${id}`, {
=======
        await axios.delete(`${API_URL}/api/deliveries/${id}`, {
>>>>>>> b34fc7b (init)
          headers: { Authorization: `Bearer ${token}` },
        });

        // Remove from local state
        setRecords(records.filter((record) => record.id !== id));
        setOriginalRecords(
          originalRecords.filter((record) => record.id !== id)
        );
        toast.success("Delivery record deleted successfully");
      } catch (error) {
        console.error("Error deleting record:", error);
        toast.error("Failed to delete delivery record");
      }
    }
  };

  // Get display records
  const displayRecords = filteredRecords.slice(0, visibleCount);

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      <div className="flex-1">
<<<<<<< HEAD
        <NavigationBar />
=======
>>>>>>> b34fc7b (init)
        <div className="flex">
          <SupplierSidebar />
          <main className="flex-1 p-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Delivery Records
                </h1>
                <p className="text-gray-600">
                  Manage tea leaf deliveries and records
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReportGeneration}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Generate Report
                </button>
                <Link
                  to="/supplyRecode/create"
                  state={{ background: location }}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  <MdOutlineAddBox className="text-xl mr-2" />
                  Add New Record
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <FaBoxOpen className="text-3xl text-blue-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalRecords}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <FaUsers className="text-3xl text-green-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalQuantity.toFixed(2)} kg
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <FaPlusCircle className="text-3xl text-purple-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-800">
                      Rs. {totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <FaPlusCircle className="text-3xl text-orange-500 mr-4" />
                  <div>
                    <p className="text-gray-600">Today's Records</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        records.filter(
                          (r) =>
                            new Date(r.delivery_date).toDateString() ===
                            new Date().toDateString()
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Search Records
                  </label>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by supplier, ID, or payment method..."
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="supplier"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Filter by Supplier
                  </label>
                  <select
                    id="supplier"
                    value={selectedSupplier}
                    onChange={handleSupplierChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Suppliers</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.supplier_id} - {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="month"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Filter by Month
                  </label>
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={fetchRecords}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setSelectedMonth("");
                      setSelectedSupplier("");
                      setVisibleCount(10);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Delivery Records
                    </h2>
                    <p className="text-sm text-gray-600">
                      Complete list of tea leaf delivery records
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(visibleCount, filteredRecords.length)} of{" "}
                    {filteredRecords.length} records
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : displayRecords.length === 0 ? (
                <div className="text-center py-12">
                  <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    No delivery records found
                  </p>
                  <p className="text-gray-400">
                    {searchInput || selectedMonth || selectedSupplier
                      ? "Try adjusting your search filters"
                      : "Add your first tea leaf delivery record to get started"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black">
                            Supplier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black">
                            Delivery Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black">
                            Quantity (kg)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black">
                            Rate/kg
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black">
                            Total Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black">
                            Payment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displayRecords.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3">
                              <div className="text-sm font-mono text-gray-900">
                                DEL-{item.id.toString().padStart(4, "0")}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {item.supplier_name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.supplier_code || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="text-sm text-gray-900">
                                {new Date(
                                  item.delivery_date
                                ).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="text-sm text-gray-900">
                                {(parseFloat(item.quantity) || 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="text-sm text-gray-900">
                                Rs.{" "}
                                {(parseFloat(item.rate_per_kg) || 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="text-sm font-medium text-green-600">
                                Rs.{" "}
                                {(parseFloat(item.total_amount) || 0).toFixed(
                                  2
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.payment_method === "spot"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {item.payment_method === "spot"
                                  ? "Spot"
                                  : "Monthly"}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.payment_status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : item.payment_status === "overdue"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.payment_status || "pending"}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex gap-3">
                                <Link
                                  to={`/supplyRecode/details/${item.id}`}
                                  state={{ background: location }}
                                  className="text-green-700 text-xl hover:text-green-900"
                                  title="View Details"
                                >
                                  <BsInfoCircle />
                                </Link>
                                <Link
                                  to={`/supplyRecode/edit/${item.id}`}
                                  state={{ background: location }}
                                  className="text-yellow-600 text-xl hover:text-yellow-800"
                                  title="Edit Record"
                                >
                                  <AiOutlineEdit />
                                </Link>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="text-red-600 text-xl hover:text-red-800"
                                  title="Delete Record"
                                >
                                  <MdOutlineDelete />
                                </button>
                                {item.payment_method === "spot" &&
                                  item.payment_status !== "paid" && (
                                    <Link
                                      to={`/suppliers/payments?recordId=${item.id}`}
                                      className="text-blue-600 text-xl hover:text-blue-800"
                                      title="Process Spot Payment"
                                    >
                                      <FaDollarSign />
                                    </Link>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Load More Button */}
                  {filteredRecords.length > visibleCount && (
                    <div className="bg-gray-50 px-6 py-3 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Load More ({filteredRecords.length - visibleCount}{" "}
                        remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
