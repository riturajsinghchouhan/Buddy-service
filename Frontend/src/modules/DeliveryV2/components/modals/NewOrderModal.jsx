import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, FastForward, Clock, Phone, ChefHat, ChevronDown, AlertTriangle } from 'lucide-react';
import { ActionSlider } from '@/modules/DeliveryV2/components/ui/ActionSlider';
import { useDeliveryStore } from '@/modules/DeliveryV2/store/useDeliveryStore';
import { getHaversineDistance, calculateETA } from '@/modules/DeliveryV2/utils/geo';

/**
 * NewOrderModal - Ported to Original 1:1 Theme with Slider Accept.
 * Matches the Zomato/Swiggy style Green Header + White Card.
 */
export const NewOrderModal = ({ order, onAccept, onReject, onMinimize, riderProfile }) => {
  const { riderLocation } = useDeliveryStore();
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onReject();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onReject]);

  const { distanceKm, etaMins } = useMemo(() => {
    if (!order) return { distanceKm: null, etaMins: null };

    // A. Use provided data if available (Direct distance from socket)
    const rawDist = order.pickupDistanceKm || order.distanceKm;
    const rawEta = order.estimatedTime || order.duration || order.eta;
    
    if (rawDist != null) {
      return { 
        distanceKm: Number(rawDist).toFixed(1), 
        etaMins: rawEta && rawEta > 0 ? Math.ceil(rawEta) : Math.ceil((rawDist * 1000) / 416) + 5
      };
    }

    // B. Calculate from locations (Local calculation fallback)
    const rest = order.restaurantLocation || order.restaurantId?.location || {};
    const resLat = parseFloat(order.restaurant_lat || order.restaurantLat || rest.latitude || rest.lat);
    const resLng = parseFloat(order.restaurant_lng || order.restaurantLng || rest.longitude || rest.lng);

    if (riderLocation && !isNaN(resLat) && !isNaN(resLng)) {
      const distM = getHaversineDistance(
        riderLocation.lat, riderLocation.lng,
        resLat, resLng
      );
      const km = distM / 1000;
      // Assume 25km/h avg for initial estimate (roughly 416m/min)
      const mins = Math.ceil(distM / 416) + (order.prepTime || 5);
      
      return { 
        distanceKm: km.toFixed(1), 
        etaMins: mins 
      };
    }

    return { distanceKm: '??', etaMins: order.prepTime || 15 };
  }, [order, riderLocation]);

  if (!order) return null;

  const isShared = order.isShared || order.dispatch?.isShared;
  const earnings = order.earnings || order.riderEarning || (order.orderAmount ? order.orderAmount * 0.1 : 0);
  const totalOriginalEarning = order.sharedRiderEarning ? (Number(order.sharedRiderEarning) + Number(earnings)) : (isShared ? earnings * 2 : earnings);
  
  const restaurantName = order.restaurantName || order.restaurant_name || (order.restaurantId?.name) || 'Restaurant';
  const restaurantAddress = order.restaurantAddress || order.restaurant_address || (order.restaurantId?.location?.address) || 'Address not available';
  const deliveryAddress = order?.deliveryAddress || {};

  const geoCoords =
    Array.isArray(deliveryAddress?.location?.coordinates) &&
    deliveryAddress.location.coordinates.length >= 2
      ? {
          lng: deliveryAddress.location.coordinates[0],
          lat: deliveryAddress.location.coordinates[1],
        }
      : null;

  const customerLocation = order.customerLocation || order.deliveryLocation || geoCoords || null;

  const addressPartsFromSchema = [
    deliveryAddress.street,
    deliveryAddress.additionalDetails,
    deliveryAddress.city,
    deliveryAddress.state,
    deliveryAddress.zipCode,
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean);

  const customerAddress =
    order.customerAddress ||
    order.customer_address ||
    (addressPartsFromSchema.length ? addressPartsFromSchema.join(', ') : '') ||
    (customerLocation?.lat != null && customerLocation?.lng != null
      ? `Lat ${Number(customerLocation.lat).toFixed(5)}, Lng ${Number(customerLocation.lng).toFixed(5)}`
      : 'Location not available');

  const mapsLink =
    customerLocation?.lat != null && customerLocation?.lng != null
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          `${customerLocation.lat},${customerLocation.lng}`,
        )}`
      : null;

  const orderZone = order.zoneName || order.zoneId?.name || order.zoneId?.zoneName || order.zone?.name || order.restaurantId?.zone?.name || order.restaurantId?.zoneName;
  const riderZoneId = riderProfile?.zone?._id || riderProfile?.zone;
  const orderZoneId = order.zoneId?._id || order.zoneId || order.zone?._id || order.zone || order.restaurantId?.zone?._id || order.restaurantId?.zone;
  
  const isOutsideZone = riderZoneId && orderZoneId && String(riderZoneId) !== String(orderZoneId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-1000 bg-black/60 flex items-end justify-center p-0"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md sm:max-w-lg bg-white rounded-t-3xl sm:rounded-t-[3rem] overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.5)] flex flex-col pt-1 sm:pt-2"
      >
        {/* Handle / Minimize */}
        <div className="w-full flex justify-center pb-1.5 pt-1 bg-white relative z-10 rounded-t-3xl sm:rounded-t-[3rem] -mb-1">
          <button onClick={onMinimize} className="p-1 hover:bg-gray-100 active:scale-95 transition-all rounded-full flex flex-col items-center">
             <ChevronDown className="w-6 h-6 text-gray-400 stroke-3" />
          </button>
        </div>

        {/* Header Ribbon (Deep Tech Style) */}
        <div 
          className="p-4 sm:p-8 flex justify-between items-center text-white border-b border-white/5 bg-[#0A1F0A]"
        >
          <div>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
              {isShared ? 'Special Shared Request' : 'Incoming Request'}
            </p>
            <div className="flex flex-col">
               <h2 className={`text-2xl sm:text-4xl font-bold tracking-tighter ${isShared ? 'text-amber-400' : 'text-[#16A34A]'}`}>
                 ₹{Number(earnings || 0).toFixed(2)}
               </h2>
               {isShared && (
                 <span className="text-[10px] text-white/40 font-medium">
                   (50% of ₹{Number(totalOriginalEarning).toFixed(2)} Total)
                 </span>
               )}
            </div>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-2xl sm:rounded-3xl px-3 sm:px-6 py-2 sm:py-3 text-white font-bold text-lg sm:text-2xl shadow-inner tabular-nums">
            {timeLeft}s
          </div>
        </div>

        {/* Shared Badge */}
        {isShared && (
          <div className="px-4 sm:px-8 pt-4">
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-lg font-bold">
                🤝
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">Special Order</p>
                <p className="text-[10px] text-amber-700 font-medium leading-tight">This order is shared by another partner. Earnings are split 50/50.</p>
              </div>
            </div>
          </div>
        )}

        {/* Zone Badge & Alert */}
        <div className="px-4 sm:px-8 pt-4 flex flex-col gap-2">
          {orderZone && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Zone:</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-tight border border-gray-200">
                {orderZone}
              </span>
            </div>
          )}
          
          {isOutsideZone && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-700 leading-tight">
                This order is outside your selected zone. <br/>
                <span className="uppercase tracking-wide">Aapko apne global order aaye ge</span>
              </p>
            </div>
          )}
        </div>

        {/* Multi-Restaurant Alert */}
        {order.pickups && order.pickups.length > 1 && (
          <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-2">
            <div className="bg-[#16A34A]/10 border-2 border-[#16A34A]/30 rounded-2xl p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#16A34A] flex items-center justify-center text-[#0A1F0A] text-sm font-bold">
                  ⚡
                </div>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#0A1F0A] mb-0.5">
                  Multiple Restaurants
                </p>
                <p className="text-[10px] sm:text-xs text-[#0A1F0A]/70 leading-tight">
                  User ordered from {order.pickups.length} restaurants. Pickup items from each location.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Body */}
        <div className="p-4 sm:p-8 pb-6 sm:pb-12 space-y-5 sm:space-y-10 overflow-y-auto max-h-[78vh]">
          {/* Multi-Pickup / Drop Timeline */}
          <div className="flex gap-3 sm:gap-6">
            <div className="flex flex-col items-center gap-1.5 mt-2 py-1">
              {/* Pickup Points */}
              {(order.pickups && order.pickups.length > 0 ? order.pickups : [{ restaurantName, restaurantAddress }]).map((_, idx, arr) => (
                <React.Fragment key={`dot-pickup-${idx}`}>
                  <div className="w-5 h-5 rounded-full bg-[#16A34A] border-4 border-[#F0FDF4] shadow-lg shadow-green-600/20" />
                  <div className="w-0.5 h-16 bg-dashed border-l-2 border-[#E8F0E8]" />
                </React.Fragment>
              ))}
              
              {/* Customer Drop Dot */}
              <div className="w-5 h-5 rounded-full bg-[#0A1F0A] border-4 border-[#F0FDF4] shadow-lg shadow-[#0A1F0A]/20" />
            </div>

            <div className="flex-1 space-y-5 sm:space-y-10">
              {/* Pickups */}
              {(order.pickups && order.pickups.length > 0 ? order.pickups : [{ restaurantName, restaurantAddress }]).map((pickup, idx) => (
                <div key={`pickup-${idx}`}>
                  <div className="flex items-center gap-2 mb-2 font-bold text-[10px] uppercase tracking-widest text-[#16A34A]">
                    <ChefHat className="w-4 h-4" />
                    <span>Restaurant Pickup {order.pickups?.length > 1 ? `#${idx + 1}` : ''}</span>
                  </div>
                  <p className="text-[#0A1F0A] font-bold text-base sm:text-xl leading-tight">
                    {pickup.restaurantName || pickup.restaurant_name || restaurantName}
                  </p>
                  <p className="text-[#5D6D5D] text-sm font-medium leading-relaxed">
                    {pickup.restaurantAddress || pickup.location?.address || restaurantAddress}
                  </p>
                </div>
              ))}

              {/* Customer Drop */}
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-[10px] uppercase tracking-widest text-[#0A1F0A]">
                  <MapPin className="w-4 h-4" />
                  <span>Customer Drop</span>
                </div>
                <p className="text-[#0A1F0A] font-bold text-base sm:text-xl leading-tight">Customer Location</p>
                <p className="text-[#5D6D5D] text-sm font-medium line-clamp-2">{customerAddress}</p>
                {mapsLink && (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex mt-2 text-[10px] font-bold uppercase tracking-widest text-[#0A1F0A] hover:text-[#22C55E]"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>

           <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
             <div className="p-3 sm:p-4 bg-[#F0FDF4] rounded-2xl border border-[#E8F0E8] flex items-center gap-2.5 sm:gap-3">
               <Clock className="w-5 h-5 text-[#22C55E]" />
               <div className="flex flex-col">
                  <span className="text-[10px] text-[#5D6D5D] font-bold uppercase tracking-widest">Time</span>
                  <span className="text-sm font-bold text-[#0A1F0A]">{etaMins} MINS</span>
               </div>
             </div>
             <div className="p-3 sm:p-4 bg-[#F0FDF4] rounded-2xl border border-[#E8F0E8] flex items-center gap-2.5 sm:gap-3">
               <MapPin className="w-5 h-5 text-[#5D6D5D]" />
               <div className="flex flex-col">
                  <span className="text-[10px] text-[#5D6D5D] font-bold uppercase tracking-widest">Distance</span>
                  <span className="text-sm font-bold text-[#0A1F0A]">{distanceKm} KM</span>
               </div>
             </div>
          </div>

        {/* Action Area */}
          <div className="space-y-4 sm:space-y-6 pt-1 sm:pt-2">
            <ActionSlider 
              label={isShared ? "Slide to Join Order" : "Slide to Accept"} 
              onConfirm={() => onAccept(order)} 
              color="bg-[#22C55E]"
              successLabel={isShared ? "Joined Order ✓" : "Order Accepted ✓"}
            />

            <button 
              onClick={onReject}
              className="w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors py-2 active:scale-95"
            >
              Pass this task
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

