'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Building2, MapPin, Package, TrendingUp, 
  Truck, Award, Calendar, CheckCircle, Phone
} from 'lucide-react';

interface Listing {
  id: string;
  commodity_name: string;
  variety: string;
  grade: string;
  available_quantity: number;
  unit: string;
  price_per_unit: number;
  min_order_quantity: number;
  price_negotiable: boolean;
  quality_parameters: any;
  certifications: string[];
  harvest_date: string;
  available_from: string;
  available_until: string;
  storage_location: string;
  delivery_options: string[];
  fpo: {
    id: string;
    fpo_name: string;
    district: string;
    state: string;
    phone: string;
    email: string;
    is_verified: boolean;
  };
}

export default function CommodityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (listingId) {
      fetchListingDetails();
    }
  }, [listingId]);

  const fetchListingDetails = async () => {
    try {
      const res = await fetch(`/api/fpo/listings?status=active`);
      const data = await res.json();
      if (data.success) {
        const found = data.data.find((l: Listing) => l.id === listingId);
        setListing(found || null);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (listing?.fpo.phone) {
      window.location.href = `tel:${listing.fpo.phone}`;
    }
  };

  const handleCreateContract = () => {
    // Navigate to existing new contract screen (query params can be used later to prefill)
    if (!listing) return;
    const params = new URLSearchParams({ commodity: listing.commodity_name, fpo_id: listing.fpo.id });
    router.push(`/contracts/new?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Listing Not Found</h2>
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
              <Package className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{listing.commodity_name}</h1>
              {listing.variety && (
                <p className="text-emerald-100 text-sm mt-1">Variety: {listing.variety}</p>
              )}
              {listing.grade && (
                <span className="inline-block mt-2 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  Grade: {listing.grade}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Price & Quantity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Price</p>
              <p className="text-3xl font-bold text-emerald-600">
                ₹{listing.price_per_unit}
                <span className="text-base text-gray-500 ml-2">/ {listing.unit}</span>
              </p>
              {listing.price_negotiable && (
                <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                  Negotiable
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Available Quantity</p>
              <p className="text-3xl font-bold text-gray-900">
                {listing.available_quantity}
                <span className="text-base text-gray-500 ml-2">{listing.unit}</span>
              </p>
              {listing.min_order_quantity && (
                <p className="text-xs text-gray-600 mt-2">
                  Min order: {listing.min_order_quantity} {listing.unit}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h2>
          <Link
            href={`/marketplace/fpo/${listing.fpo.id}`}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                {listing.fpo.fpo_name}
                {listing.fpo.is_verified && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {listing.fpo.district}, {listing.fpo.state}
              </p>
            </div>
          </Link>
        </div>

        {/* Quality & Certifications */}
        {listing.certifications && listing.certifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Certifications
            </h2>
            <div className="flex flex-wrap gap-2">
              {listing.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  ✓ {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Availability & Delivery */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Availability & Delivery</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Available From</p>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(listing.available_from).toLocaleDateString()}
                </p>
              </div>
              {listing.available_until && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Available Until</p>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(listing.available_until).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {listing.harvest_date && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Harvest Date</p>
                <p className="text-sm text-gray-900">{new Date(listing.harvest_date).toLocaleDateString()}</p>
              </div>
            )}

            {listing.storage_location && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Storage Location</p>
                <p className="text-sm text-gray-900">{listing.storage_location}</p>
              </div>
            )}

            {listing.delivery_options && listing.delivery_options.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2 flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Delivery Options
                </p>
                <div className="flex flex-wrap gap-2">
                  {listing.delivery_options.map((option, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quality Parameters */}
        {listing.quality_parameters && Object.keys(listing.quality_parameters).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quality Parameters</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(listing.quality_parameters).map(([key, value]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold">{key}</p>
                  <p className="text-sm text-gray-900 font-medium mt-1">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-6 sticky bottom-0">
          <div className="flex gap-3">
            <button
              onClick={handleContact}
              className="flex-1 border-2 border-emerald-600 text-emerald-600 font-semibold py-3 px-4 rounded-lg hover:bg-emerald-50 transition flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Contact Seller
            </button>
            <button
              onClick={handleCreateContract}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Create Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
