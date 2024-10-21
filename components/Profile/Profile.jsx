import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Payments from './Payment';
import Billing from './Billing';

const tabs = [
  "Profile", "Billing", "Payments"
]

export default function Profile() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('Profile');

  if (!session) {
    return <div className="text-white">Please log in to view your profile.</div>;
  }

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="flex min-h-screen bg-transparent text-white">
      <div className="w-1/4 bg-transparent p-6 border-r border-gray-600 relative">
        <h2 className="text-2xl font-bold mb-6 text-white">Settings</h2>
        <ul>
          {tabs.map((tab) => (
            <li
              key={tab}
              className={`cursor-pointer py-2 px-4 mb-2 rounded ${
                activeTab === tab ? 'bg-white bg-opacity-90 text-black' : 'hover:bg-white hover:bg-opacity-20'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
        <button
          onClick={handleSignOut}
          className="absolute bottom-6 left-6 right-6 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
      <div className="w-3/4 p-6">
        {activeTab === 'Profile' && (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-white">User Profile</h1>
            <div className="bg-transparent p-6 rounded-lg">
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">Name</label>
                <p>{session.user.name}</p>
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">Email</label>
                <p>{session.user.email}</p>
              </div>
              {/* Add more user information fields as needed */}
            </div>
          </div>
        )}
        {activeTab === 'Billing' && <Billing />}
        {activeTab === 'Payments' && <Payments />}
      </div>
    </div>
  );
}