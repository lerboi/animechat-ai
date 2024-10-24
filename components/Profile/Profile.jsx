'use client'

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Payments from './Payment';
import Subscriptions from './Subscriptions';
import { LuPencilLine } from "react-icons/lu";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const tabs = [
  "Profile", "Subscriptions", "Payments"
]

export default function Profile() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (session) {
      fetchUserInfo();
    }
  }, [session]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/User/getUserInfo');
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setNewName(data.name);
      } else {
        console.error('Failed to fetch user info');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  if (!session) {
    return <div className="text-white">Please log in to view your profile.</div>;
  }

  const handleSignOut = () => {
    signOut();
  };

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    try {
      const response = await fetch('/api/User/updateName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        setIsEditingName(false);
        await update({ name: newName });
        fetchUserInfo();
      } else {
        console.error('Failed to update name');
      }
    } catch (error) {
      console.error('Error updating name:', error);
    }
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
        {activeTab === 'Profile' && userInfo && (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-white">User Profile</h1>
            <div className="bg-transparent p-6 rounded-lg space-y-4">
              <div className="flex-col items-center">
                <div className='flex'>
                  <label className="block text-white text-sm font-bold">Name</label>
                  <LuPencilLine onClick={handleEditName} className="scale-[90%] relative top-[2px] ml-1 hover:cursor-pointer text-slate-200 hover:text-white" />
                </div>
                {isEditingName ? (
                  <div className="flex-col items-center space-x-2">
                    <Input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-gray-700 text-white"
                    />
                    <Button onClick={handleSaveName} className="bg-blue-500 hover:bg-blue-600">
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p>{userInfo.name}</p>
                    
                      
                  
                  </div>
                )}
              </div>
              <div>
                <label className="block text-white text-sm font-bold mb-2">Email</label>
                <p>{userInfo.email}</p>
              </div>
              <div>
                <label className="block text-white text-sm font-bold mb-2">Text Tokens</label>
                <p>{userInfo.textTokens}</p>
              </div>
              <div>
                <label className="block text-white text-sm font-bold mb-2">Image Tokens</label>
                <p>{userInfo.imageTokens}</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Subscriptions' && <Subscriptions />}
        {activeTab === 'Payments' && <Payments />}
      </div>
    </div>
  );
}