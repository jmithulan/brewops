// components/InventorySidebar.jsx
import { Link } from 'react-router-dom';
import brewOpsLogo from '../assets/react.svg';

const InventorySidebar = () => {
  return (
    <div className="w-64 h-full bg-gray-800 text-white p-5 fixed left-0" style={{ top: '64px' }}>
      <div className="flex items-center mb-6">
        <img src={brewOpsLogo} alt="BrewOps Logo" className="w-8 h-8 mr-2" />
        <span className="font-bold text-lg">BrewOps</span>
      </div>
      <ul className="space-y-4 mt-2">
        <li>
          <Link to="/HomePage" className="block hover:bg-gray-700 px-3 py-2 rounded">Home</Link>
        </li>
        <li>
          <Link to="/inventorys" className="block hover:bg-gray-700 px-3 py-2 rounded">Inventory</Link>
        </li>
        <li>
          <Link to="/waste-management" className="block hover:bg-gray-700 px-3 py-2 rounded">Waste Management</Link>
        </li>
        <li>
          <Link to="/Pendingshipmentss" className="block hover:bg-gray-700 px-3 py-2 rounded">Pending Shipments</Link>
        </li>
        <li>
          <Link to="/Irawleaves" className="block hover:bg-gray-700 px-3 py-2 rounded">Raw Leaves Management</Link>
        </li>
      </ul>
    </div>
  );
};

export default InventorySidebar;
