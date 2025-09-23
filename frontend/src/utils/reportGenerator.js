// src/utils/reportGenerator.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import { format } from 'date-fns';

// Main function to generate and download report
export const generateAndDownloadReport = async (type, data, period) => {
  try {
    let doc;
    
    switch(type) {
      case 'inventory':
        doc = await generateInventoryReport(data.inventoryItems, data.totalRawLeaves || 0);
        break;
      case 'supplier':
        doc = await generateSupplierReport(data.suppliers || []);
        break;
      case 'dashboard':
        doc = await generateDashboardReport();
        break;
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
    
    // Create filename
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `brewops-${type}-report-${dateStr}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error(`Error generating ${type} report:`, error);
    throw error;
  }
};

// Helper to format date
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Create inventory report
export const generateInventoryReport = async (inventoryData, totalRawLeaves) => {
  try {
    // Fetch additional inventory stats
    const token = localStorage.getItem('jwtToken');
    const response = await axios.get('http://localhost:5000/api/reports/inventory/daily', {
      headers: { Authorization: `Bearer ${token}` },
      params: { date: new Date().toISOString().split('T')[0] }
    });

    const stats = response.data || { inventoryStats: {} };

    // Create PDF document
    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(0, 100, 0); // Dark green
    doc.text("BrewOps Tea Factory", 105, 20, { align: "center" });
    
    // Add report title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Inventory Status Report", 105, 30, { align: "center" });
    
    // Add report date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${formatDate(new Date())}`, 105, 38, { align: "center" });
    
    // Add summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Inventory Summary", 20, 50);
    
    doc.setFontSize(12);
    doc.text(`Total Raw Leaves Inventory: ${totalRawLeaves.toLocaleString()} kg`, 30, 60);
    doc.text(`Minimum Required Level: 10,000 kg`, 30, 68);
    doc.text(`Status: ${totalRawLeaves >= 10000 ? 'Adequate' : 'Low Stock - Action Required'}`, 30, 76);
    
    if (stats.inventoryStats) {
      doc.text(`Today's Entries: ${stats.inventoryStats.total_items || 0}`, 30, 84);
      doc.text(`Average Quantity per Entry: ${Math.round(stats.inventoryStats.avg_quantity || 0)} kg`, 30, 92);
    }
    
    // Add inventory table
    doc.setFontSize(14);
    doc.text("Recent Inventory Entries", 20, 110);
    
    const tableData = inventoryData.slice(0, 15).map((item, index) => [
      index + 1,
      item.inventoryid || '-',
      `${item.quantity?.toLocaleString() || '0'} kg`,
      item.createdAt ? formatDate(item.createdAt) : '-'
    ]);
    
    doc.autoTable({
      startY: 115,
      head: [['#', 'Inventory ID', 'Quantity', 'Date Created']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 128, 0] },
      alternateRowStyles: { fillColor: [240, 248, 240] }
    });
    
    // Skip chart generation as Chart.js is not imported
    const pageHeight = doc.internal.pageSize.height;
    
    // Add recommendations section
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 140 : pageHeight - 50;
    if (finalY > pageHeight - 50) {
      doc.addPage();
      doc.text("Recommendations", 20, 20);
      
      if (totalRawLeaves < 10000) {
        doc.setTextColor(255, 0, 0);
        doc.text("• URGENT: Inventory is below minimum required level.", 25, 30);
        doc.text(`• Order at least ${(10000 - totalRawLeaves).toLocaleString()} kg more raw leaves.`, 25, 38);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.setTextColor(0, 128, 0);
        doc.text("• Inventory levels are adequate.", 25, 30);
        doc.setTextColor(0, 0, 0);
      }
      
      doc.text("• Monitor daily usage and maintain optimal stock levels.", 25, 46);
      doc.text("• Schedule regular inventory audits for data accuracy.", 25, 54);
    } else {
      doc.text("Recommendations", 20, finalY + 10);
      
      if (totalRawLeaves < 10000) {
        doc.setTextColor(255, 0, 0);
        doc.text("• URGENT: Inventory is below minimum required level.", 25, finalY + 20);
        doc.text(`• Order at least ${(10000 - totalRawLeaves).toLocaleString()} kg more raw leaves.`, 25, finalY + 28);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.setTextColor(0, 128, 0);
        doc.text("• Inventory levels are adequate.", 25, finalY + 20);
        doc.setTextColor(0, 0, 0);
      }
      
      doc.text("• Monitor daily usage and maintain optimal stock levels.", 25, finalY + 36);
      doc.text("• Schedule regular inventory audits for data accuracy.", 25, finalY + 44);
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `BrewOps Tea Factory - Confidential - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    return doc;
  } catch (error) {
    console.error("Error generating inventory report:", error);
    throw error;
  }
};

// Create supplier report
export const generateSupplierReport = async (supplierData) => {
  try {
    // Fetch additional supplier stats
    const token = localStorage.getItem('jwtToken');
    const response = await axios.get('http://localhost:5000/api/reports/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
      params: { period: '30d' }
    });

    const stats = response.data || { supplierStats: {} };
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(0, 100, 0);
    doc.text("BrewOps Tea Factory", 105, 20, { align: "center" });
    
    // Add report title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Supplier Management Report", 105, 30, { align: "center" });
    
    // Add report date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${formatDate(new Date())}`, 105, 38, { align: "center" });
    
    // Add summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Supplier Summary", 20, 50);
    
    doc.setFontSize(12);
    doc.text(`Total Active Suppliers: ${supplierData.length}`, 30, 60);
    
    if (stats.supplierStats) {
      doc.text(`Recent Deliveries (30 days): ${stats.supplierStats.total_deliveries || 0}`, 30, 68);
      doc.text(`Total Quantity Delivered: ${Math.round(stats.supplierStats.total_quantity || 0).toLocaleString()} kg`, 30, 76);
      doc.text(`Total Amount Paid: ${formatCurrency(stats.supplierStats.total_amount || 0)}`, 30, 84);
      doc.text(`Average Rate Per Kg: ${formatCurrency(stats.supplierStats.avg_rate || 0)}/kg`, 30, 92);
    }
    
    // Add supplier table
    doc.setFontSize(14);
    doc.text("Supplier List", 20, 110);
    
    const tableData = supplierData.slice(0, 15).map((supplier, index) => [
      index + 1,
      supplier.supplier_id || '-',
      supplier.name || '-',
      supplier.contact_number || '-',
      `${supplier.rate || 0} LKR/kg`
    ]);
    
    doc.autoTable({
      startY: 115,
      head: [['#', 'Supplier ID', 'Name', 'Contact', 'Rate']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 128, 0] },
      alternateRowStyles: { fillColor: [240, 248, 240] }
    });
    
    // Add chart for supplier distribution (if we have data)
    if (stats.recentActivities && stats.recentActivities.length > 0) {
      const pageHeight = doc.internal.pageSize.height;
      
      // Check if we need a new page
      if (doc.lastAutoTable.finalY > pageHeight - 120) {
        doc.addPage();
        doc.text("Recent Supplier Activities", 20, 20);
        
        // Recent activities table
        const activityData = stats.recentActivities.map((activity, index) => [
          index + 1,
          formatDate(activity.date),
          activity.description,
          formatCurrency(activity.amount)
        ]);
        
        doc.autoTable({
          startY: 25,
          head: [['#', 'Date', 'Description', 'Amount']],
          body: activityData,
          theme: 'striped',
          headStyles: { fillColor: [0, 100, 0] }
        });
      } else {
        doc.text("Recent Supplier Activities", 20, doc.lastAutoTable.finalY + 20);
        
        // Recent activities table
        const activityData = stats.recentActivities.map((activity, index) => [
          index + 1,
          formatDate(activity.date),
          activity.description,
          formatCurrency(activity.amount)
        ]);
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 25,
          head: [['#', 'Date', 'Description', 'Amount']],
          body: activityData,
          theme: 'striped',
          headStyles: { fillColor: [0, 100, 0] }
        });
      }
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `BrewOps Tea Factory - Confidential - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    return doc;
  } catch (error) {
    console.error("Error generating supplier report:", error);
    throw error;
  }
};

// Create a comprehensive dashboard report combining inventory and supplier data
export const generateDashboardReport = async () => {
  try {
    // Fetch dashboard stats
    const token = localStorage.getItem('jwtToken');
    const dashboardResponse = await axios.get('http://localhost:5000/api/reports/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const stats = dashboardResponse.data;
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFontSize(22);
    doc.setTextColor(0, 100, 0);
    doc.text("BrewOps Tea Factory", 105, 20, { align: "center" });
    
    // Add report title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Executive Dashboard Report", 105, 30, { align: "center" });
    
    // Add report date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${formatDate(new Date())}`, 105, 38, { align: "center" });
    doc.text(`Reporting Period: Last ${stats.period || '30'} days`, 105, 44, { align: "center" });
    
    // Create KPI section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Key Performance Indicators", 20, 55);
    
    // Draw KPI boxes
    // Supplier KPIs
    doc.setFillColor(240, 248, 255); // Light blue
    doc.rect(20, 60, 80, 50, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 150);
    doc.text("Supplier Metrics", 60, 70, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Active Suppliers: ${stats.supplierStats?.active_suppliers || 0}`, 25, 80);
    doc.text(`Total Deliveries: ${stats.supplierStats?.total_deliveries || 0}`, 25, 88);
    doc.text(`Total Quantity: ${Math.round(stats.supplierStats?.total_quantity || 0).toLocaleString()} kg`, 25, 96);
    
    // Inventory KPIs
    doc.setFillColor(240, 255, 240); // Light green
    doc.rect(110, 60, 80, 50, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text("Inventory Metrics", 150, 70, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Items: ${stats.inventoryStats?.total_items || 0}`, 115, 80);
    doc.text(`Total Quantity: ${Math.round(stats.inventoryStats?.total_quantity || 0).toLocaleString()} kg`, 115, 88);
    doc.text(`Low Stock Items: ${stats.inventoryStats?.low_stock_items || 0}`, 115, 96);
    
    // Payment KPIs
    doc.setFillColor(255, 248, 240); // Light orange
    doc.rect(20, 120, 80, 50, 'F');
    doc.setFontSize(14);
    doc.setTextColor(150, 75, 0);
    doc.text("Payment Metrics", 60, 130, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Payments: ${stats.paymentStats?.total_payments || 0}`, 25, 140);
    doc.text(`Paid: ${formatCurrency(stats.paymentStats?.paid_amount || 0)}`, 25, 148);
    doc.text(`Pending: ${formatCurrency(stats.paymentStats?.pending_amount || 0)}`, 25, 156);
    
    // Additional KPIs (can be customized)
    doc.setFillColor(255, 240, 245); // Light pink
    doc.rect(110, 120, 80, 50, 'F');
    doc.setFontSize(14);
    doc.setTextColor(150, 0, 75);
    doc.text("Overall Metrics", 150, 130, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Calculate overall stats
    const avgRate = stats.supplierStats?.avg_rate || 0;
    doc.text(`Avg Rate: ${formatCurrency(avgRate)}/kg`, 115, 140);
    
    // Pending ratio
    const pendingRatio = stats.paymentStats?.pending_count / 
      (stats.paymentStats?.total_payments || 1) * 100;
    doc.text(`Pending Ratio: ${pendingRatio.toFixed(1)}%`, 115, 148);
    
    // Inventory health
    const inventoryHealth = stats.inventoryStats?.low_stock_items === 0 ? 'Good' : 
      stats.inventoryStats?.low_stock_items < 3 ? 'Fair' : 'Needs Attention';
    doc.text(`Inventory Health: ${inventoryHealth}`, 115, 156);
    
    // Recent Activities
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Recent Activities", 20, 180);
    
    if (stats.recentActivities && stats.recentActivities.length > 0) {
      const activityData = stats.recentActivities.slice(0, 10).map((activity, index) => [
        index + 1,
        formatDate(activity.date),
        activity.description,
        formatCurrency(activity.amount)
      ]);
      
      doc.autoTable({
        startY: 185,
        head: [['#', 'Date', 'Description', 'Amount']],
        body: activityData,
        theme: 'striped',
        headStyles: { fillColor: [0, 100, 0] }
      });
    }
    
    // Add recommendations
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 210;
    
    if (finalY > doc.internal.pageSize.height - 50) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Analysis & Recommendations", 20, 20);
      
      doc.setFontSize(12);
      // Generate some intelligent recommendations based on the data
      let yPos = 35;
      
      // Inventory recommendations
      if (stats.inventoryStats?.low_stock_items > 0) {
        doc.setTextColor(200, 0, 0);
        doc.text(`• ${stats.inventoryStats.low_stock_items} inventory items have low stock. Consider reordering.`, 25, yPos);
        yPos += 10;
      } else {
        doc.setTextColor(0, 150, 0);
        doc.text('• Inventory levels are currently adequate.', 25, yPos);
        yPos += 10;
      }
      
      // Payment recommendations
      if (stats.paymentStats?.pending_amount > 0) {
        doc.setTextColor(200, 100, 0);
        doc.text(`• ${formatCurrency(stats.paymentStats.pending_amount)} in pending payments requires attention.`, 25, yPos);
        yPos += 10;
      }
      
      // Supplier activity recommendations
      doc.setTextColor(0, 0, 0);
      if (stats.supplierStats?.total_deliveries > 20) {
        doc.text('• High supplier activity indicates strong supply chain performance.', 25, yPos);
      } else if (stats.supplierStats?.total_deliveries < 10) {
        doc.text('• Low supplier activity may require supplier engagement initiatives.', 25, yPos);
      } else {
        doc.text('• Supplier activity is at normal levels.', 25, yPos);
      }
      yPos += 10;
      
      // General recommendations
      doc.text('• Continue monitoring inventory levels to maintain optimal production capacity.', 25, yPos);
      yPos += 10;
      doc.text('• Regular supplier performance reviews recommended to ensure quality consistency.', 25, yPos);
    } else {
      doc.setFontSize(16);
      doc.text("Analysis & Recommendations", 20, finalY);
      
      doc.setFontSize(12);
      // Generate some intelligent recommendations based on the data
      let yPos = finalY + 15;
      
      // Inventory recommendations
      if (stats.inventoryStats?.low_stock_items > 0) {
        doc.setTextColor(200, 0, 0);
        doc.text(`• ${stats.inventoryStats.low_stock_items} inventory items have low stock. Consider reordering.`, 25, yPos);
        yPos += 10;
      } else {
        doc.setTextColor(0, 150, 0);
        doc.text('• Inventory levels are currently adequate.', 25, yPos);
        yPos += 10;
      }
      
      // Payment recommendations
      if (stats.paymentStats?.pending_amount > 0) {
        doc.setTextColor(200, 100, 0);
        doc.text(`• ${formatCurrency(stats.paymentStats.pending_amount)} in pending payments requires attention.`, 25, yPos);
        yPos += 10;
      }
      
      // Supplier activity recommendations
      doc.setTextColor(0, 0, 0);
      if (stats.supplierStats?.total_deliveries > 20) {
        doc.text('• High supplier activity indicates strong supply chain performance.', 25, yPos);
      } else if (stats.supplierStats?.total_deliveries < 10) {
        doc.text('• Low supplier activity may require supplier engagement initiatives.', 25, yPos);
      } else {
        doc.text('• Supplier activity is at normal levels.', 25, yPos);
      }
      yPos += 10;
      
      // General recommendations
      doc.text('• Continue monitoring inventory levels to maintain optimal production capacity.', 25, yPos);
      yPos += 10;
      doc.text('• Regular supplier performance reviews recommended to ensure quality consistency.', 25, yPos);
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `BrewOps Tea Factory - Executive Report - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    return doc;
  } catch (error) {
    console.error("Error generating dashboard report:", error);
    throw error;
  }
};
