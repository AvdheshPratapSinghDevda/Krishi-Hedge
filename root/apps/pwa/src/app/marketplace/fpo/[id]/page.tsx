'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, MapPin, Users, Phone, Mail, CheckCircle, 
  ArrowLeft, TrendingUp, Award, Calendar, Package
} from 'lucide-react';

interface FPO {
  id: string;
  fpo_name: string;
  registration_number: string;
  district: string;
  state: string;
  primary_crops: string[];
  total_members: number;
  is_verified: boolean;
  description: string;
  fpo_type: string;
  phone: string;
  email: string;
  certifications: string[];
  registration_date: string;
}

interface CommodityListing {
  id: string;
  commodity_name: string;
  variety: string;
  grade: string;
  available_quantity: number;
  unit: string;
  price_per_unit: number;
  certifications: string[];
  delivery_options: string[];
  status: string;
}

export default function FPODetailPage() {
  const params = useParams();
  const router = useRouter();
  const fpoId = params?.id as string;

  const [fpo, setFpo] = useState<FPO | null>(null);
  const [listings, setListings] = useState<CommodityListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (fpoId) {
      fetchFPODetails();
      fetchListings();
    }
  }, [fpoId]);

  const fetchFPODetails = async () => {
    try {
      const res = await fetch(`/api/fpo?id=${fpoId}`);
      const data = await res.json();
      if (data.success) {
        setFpo(data.data);
      }
    } catch (error) {
      console.error('Error fetching FPO:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      const res = await fetch(`/api/fpo/listings?fpo_id=${fpoId}&status=active`);
      const data = await res.json();
      if (data.success) {
        setListings(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleJoinRequest = async () => {
    setJoining(true);
    try {
      const farmerPhone = localStorage.getItem('phone');
      
      const res = await fetch('/api/fpo/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fpo_id: fpoId,
          farmer_phone: farmerPhone,
          farmer_name: localStorage.getItem('name') || ''
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Membership request sent successfully! The FPO admin will review your request.');
        setShowJoinModal(false);
      } else {
        alert(data.error || 'Failed to send request');
      }
    } catch (error) {
      alert('Error sending request. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading FPO details...</p>
        </div>
      </div>
    );
  }

  if (!fpo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">FPO Not Found</h2>
          <Link href="/marketplace" className="text-emerald-600 mt-4 inline-block">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-emerald-100 mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {fpo.fpo_name}
                {fpo.is_verified && (
                  <CheckCircle className="w-6 h-6 text-emerald-200" />
                )}
              </h1>
              <p className="text-emerald-100 text-sm mt-1">{fpo.fpo_type}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-emerald-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {fpo.district}, {fpo.state}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {fpo.total_members} members
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Join FPO Button */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-emerald-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Interested in joining?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Become a member to access collective marketing, better prices, and support services
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Request to Join FPO
          </button>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed">{fpo.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Registered</p>
              <p className="text-sm text-gray-900 font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                {fpo.registration_date ? new Date(fpo.registration_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reg. Number</p>
              <p className="text-sm text-gray-900 font-medium">{fpo.registration_number}</p>
            </div>
          </div>
        </div>

        {/* Primary Crops */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Primary Crops</h2>
          <div className="flex flex-wrap gap-2">
            {fpo.primary_crops.map((crop, idx) => (
              <span
                key={idx}
                className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg font-medium text-sm"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        {fpo.certifications && fpo.certifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Certifications
            </h2>
            <div className="flex flex-wrap gap-2">
              {fpo.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            {fpo.phone && (
              <a
                href={`tel:${fpo.phone}`}
                className="flex items-center gap-3 text-gray-700 hover:text-emerald-600 transition"
              >
                <Phone className="w-5 h-5" />
                <span>{fpo.phone}</span>
              </a>
            )}
            {fpo.email && (
              <a
                href={`mailto:${fpo.email}`}
                className="flex items-center gap-3 text-gray-700 hover:text-emerald-600 transition"
              >
                <Mail className="w-5 h-5" />
                <span>{fpo.email}</span>
              </a>
            )}
          </div>
        </div>

        {/* Active Commodity Listings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Available Commodities ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active listings at the moment</p>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/marketplace/commodity/${listing.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{listing.commodity_name}</h3>
                      {listing.variety && (
                        <p className="text-sm text-gray-600">Variety: {listing.variety}</p>
                      )}
                      {listing.grade && (
                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Grade: {listing.grade}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">₹{listing.price_per_unit}</p>
                      <p className="text-xs text-gray-500">per {listing.unit}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {listing.available_quantity} {listing.unit} available
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Join {fpo.fpo_name}?</h3>
            <p className="text-gray-600 mb-6">
              Your membership request will be sent to the FPO admin for review. You'll be notified once approved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition"
                disabled={joining}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinRequest}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
                disabled={joining}
              >
                {joining ? 'Sending...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
