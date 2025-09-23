// components/InventorySidebar.jsx
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 h-full bg-gray-800 text-white p-5 fixed top-0 left-0">
      <h2 className="text-2xl font-bold mb-6">Inventory</h2>
      <ul className="space-y-4">
        <li>
          <Link to="/supplier" className="block hover:bg-gray-700 px-3 py-2 rounded">Dashboard</Link>
        </li>
        <li>
          <Link to="/supplier/transactions" className="block hover:bg-gray-700 px-3 py-2 rounded">Transaction</Link>
        </li>
        <li>
          <Link to="/supplier/leaves-quality" className="block hover:bg-gray-700 px-3 py-2 rounded">Leaves Quality</Link>
        </li>
        <li>
          <Link to="/supplier/payment-summary" className="block hover:bg-gray-700 px-3 py-2 rounded">Payment Summary</Link>
        </li>
        <li>
          <Link to="/supplier/edit-profile" className="block hover:bg-gray-700 px-3 py-2 rounded">Edit profile</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
