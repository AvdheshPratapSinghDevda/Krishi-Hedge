'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, Users, Package, TrendingUp, Plus, 
  Settings, CheckCircle, XCircle, Clock, Eye
} from 'lucide-react';

interface FPO {
  id: string;
  fpo_name: string;
  total_members: number;
  is_verified: boolean;
  district: string;
  state: string;
}

interface Member {
  id: string;
  farmer_name: string;
  farmer_phone: string;
  status: string;
  join_date: string;
  membership_type: string;
}

interface Listing {
  id: string;
  commodity_name: string;
  available_quantity: number;
  unit: string;
  price_per_unit: number;
  status: string;
  views_count: number;
  inquiries_count: number;
}

export default function FPODashboard() {
  const [fpo, setFpo] = useState<FPO | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'listings'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const fpoId = localStorage.getItem('fpo_id');
      
      if (!fpoId) {
        // Redirect to FPO login
        window.location.href = '/auth/fpo/login';
        return;
      }

      // Fetch FPO details
      const fpoRes = await fetch(`/api/fpo?id=${fpoId}`);
      const fpoData = await fpoRes.json();
      if (fpoData.success) {
        setFpo(fpoData.data);
      }

      // Fetch members
      const membersRes = await fetch(`/api/fpo/members?fpo_id=${fpoId}`);
      const membersData = await membersRes.json();
      if (membersData.success) {
        const allMembers = membersData.data || [];
        setMembers(allMembers.filter((m: Member) => m.status === 'active'));
        setPendingMembers(allMembers.filter((m: Member) => m.status === 'pending'));
      }

      // Fetch listings
      const listingsRes = await fetch(`/api/fpo/listings?fpo_id=${fpoId}`);
      const listingsData = await listingsRes.json();
      if (listingsData.success) {
        setListings(listingsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMember = async (memberId: string) => {
    try {
      const res = await fetch('/api/fpo/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memberId,
          status: 'active',
          approved_by: fpo?.fpo_name
        })
      });

      if (res.ok) {
        fetchDashboardData();
        alert('Member approved successfully');
      }
    } catch (error) {
      alert('Error approving member');
    }
  };

  const handleRejectMember = async (memberId: string) => {
    try {
      const res = await fetch('/api/fpo/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memberId,
          status: 'exited'
        })
      });

      if (res.ok) {
        fetchDashboardData();
        alert('Member request rejected');
      }
    } catch (error) {
      alert('Error rejecting member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!fpo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">FPO Not Found</h2>
          <Link href="/auth/fpo/login" className="text-emerald-600 mt-4 inline-block">
            Login to FPO Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-7 h-7" />
                {fpo.fpo_name}
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                {fpo.district}, {fpo.state}
                {fpo.is_verified && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </p>
            </div>
            <Link
              href="/fpo/settings"
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Users className="w-6 h-6 text-white mb-2" />
              <p className="text-2xl font-bold text-white">{fpo.total_members}</p>
              <p className="text-emerald-100 text-sm">Active Members</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Package className="w-6 h-6 text-white mb-2" />
              <p className="text-2xl font-bold text-white">{listings.filter(l => l.status === 'active').length}</p>
              <p className="text-emerald-100 text-sm">Active Listings</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Clock className="w-6 h-6 text-white mb-2" />
              <p className="text-2xl font-bold text-white">{pendingMembers.length}</p>
              <p className="text-emerald-100 text-sm">Pending Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 font-semibold text-sm transition ${
              activeTab === 'overview'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-4 font-semibold text-sm transition ${
              activeTab === 'members'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Members {pendingMembers.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingMembers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-4 font-semibold text-sm transition ${
              activeTab === 'listings'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Listings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/fpo/listings/create"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
              >
                <Plus className="w-8 h-8" />
                <div>
                  <p className="font-bold text-lg">New Listing</p>
                  <p className="text-emerald-100 text-sm">Add commodity</p>
                </div>
              </Link>
              <Link
                href="/marketplace"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4"
              >
                <Eye className="w-8 h-8" />
                <div>
                  <p className="font-bold text-lg">View Public Page</p>
                  <p className="text-blue-100 text-sm">See your profile</p>
                </div>
              </Link>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Listings</h2>
              {listings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No listings yet</p>
              ) : (
                <div className="space-y-3">
                  {listings.slice(0, 5).map((listing) => (
                    <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{listing.commodity_name}</h3>
                          <p className="text-sm text-gray-600">{listing.available_quantity} {listing.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">₹{listing.price_per_unit}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {listing.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>{listing.views_count} views</span>
                        <span>{listing.inquiries_count} inquiries</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingMembers.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Pending Membership Requests ({pendingMembers.length})
                </h2>
                <div className="space-y-3">
                  {pendingMembers.map((member) => (
                    <div key={member.id} className="bg-white rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">{member.farmer_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">{member.farmer_phone}</p>
                        <p className="text-xs text-gray-500">Applied: {new Date(member.join_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveMember(member.id)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectMember(member.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Members */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Active Members ({members.length})</h2>
              {members.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No active members yet</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900">{member.farmer_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{member.farmer_phone}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {member.membership_type}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">Since {new Date(member.join_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Commodity Listings</h2>
              <Link
                href="/fpo/listings/create"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                New Listing
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Listings Yet</h3>
                <p className="text-gray-600 mb-6">Create your first commodity listing to connect with buyers</p>
                <Link
                  href="/fpo/listings/create"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Listing
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{listing.commodity_name}</h3>
                        <p className="text-gray-600">{listing.available_quantity} {listing.unit} available</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">₹{listing.price_per_unit}</p>
                        <span className={`inline-block text-xs px-3 py-1 rounded-full mt-2 ${
                          listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {listing.views_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {listing.inquiries_count} inquiries
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
