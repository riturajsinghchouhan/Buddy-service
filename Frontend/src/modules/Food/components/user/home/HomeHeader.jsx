import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Search, Mic, Bell, CheckCircle2, Tag, Gift, AlertCircle, Clock, BellOff, X, IndianRupee, UtensilsCrossed, ShoppingBag, Zap, Sparkles, Flame } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@food/components/ui/popover";
import { Badge } from "@food/components/ui/badge";
import { Avatar, AvatarFallback } from "@food/components/ui/avatar";
import foodIcon from "@food/assets/category-icons/food.png";
import quickIcon from "@food/assets/category-icons/quick.png";
import taxiIcon from "@food/assets/category-icons/taxi.png";
import hotelIcon from "@food/assets/category-icons/hotel.png";
import useNotificationInbox from "@food/hooks/useNotificationInbox";

const ICON_MAP = {
  CheckCircle2,
  Tag,
  Gift,
  AlertCircle
};

export default function HomeHeader({
  activeTab,
  setActiveTab,
  location,
  savedAddressText,
  handleLocationClick,
  handleSearchFocus,
  placeholderIndex,
  placeholders,
  vegMode = false,
  handleVegModeChange,
  tone = "dark",
  embedded = false,
  children,
  theme,
  hideSearch = false,
}) {
  const isLight = tone === "light";
  const glowColor = theme?.icon || (isLight ? "bg-[#7aa2ff]/20" : "bg-[#1a2517]/5");
  const tabs = [
    { id: "food", label: "Food", icon: foodIcon },
    { id: "quick", label: "Quick Commerce", icon: quickIcon },
    { id: "taxi", label: "Taxi", icon: taxiIcon },
  ];
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('food_user_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const {
    items: broadcastNotifications,
    unreadCount: broadcastUnreadCount,
    dismiss: dismissBroadcastNotification,
  } = useNotificationInbox("user", { limit: 20 });

  useEffect(() => {
    const syncNotifications = () => {
      const saved = localStorage.getItem('food_user_notifications');
      setNotifications(saved ? JSON.parse(saved) : []);
    };

    window.addEventListener('notificationsUpdated', syncNotifications);

    return () => window.removeEventListener('notificationsUpdated', syncNotifications);
  }, []);

  const mergedNotifications = useMemo(() => {
    const localItems = Array.isArray(notifications)
      ? notifications.map((item) => ({ ...item, source: "local" }))
      : [];
    const broadcastItems = (broadcastNotifications || []).map((item) => ({
      ...item,
      source: "broadcast",
      time: item.createdAt
        ? new Date(item.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        : "Just now",
      type: "broadcast",
      icon: "Bell",
      iconColor: "text-blue-600",
    }));

    return [...broadcastItems, ...localItems].sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp || 0).getTime() -
        new Date(a.createdAt || a.timestamp || 0).getTime()
    );
  }, [broadcastNotifications, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length + broadcastUnreadCount;

  const handleDeleteNotification = (id, source = "local") => {
    if (source === "broadcast") {
      dismissBroadcastNotification(id);
      return;
    }
    setNotifications((prev) => {
      const next = prev.filter((notification) => notification.id !== id);
      localStorage.setItem('food_user_notifications', JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: { count: next.filter((n) => !n.read).length } }));
      return next;
    });
  };

  return (
    <div className={`relative pt-2 ${embedded ? "pb-1" : "pb-0"} px-4 transition-all duration-700 overflow-hidden bg-transparent shadow-none`}>
      {/* Subtle Artistic Glows - Synchronized with Active Theme */}
      <div className={`absolute top-[-20%] right-[-10%] w-48 h-48 blur-[80px] rounded-full pointer-events-none opacity-40 transition-all duration-700 ${glowColor.includes('bg-') ? glowColor : glowColor.replace('text-', 'bg-')}`} />
      <div className={`absolute bottom-[-20%] left-[-10%] w-48 h-48 blur-[80px] rounded-full pointer-events-none opacity-40 transition-all duration-700 ${glowColor.includes('bg-') ? glowColor : glowColor.replace('text-', 'bg-')}`} />

      {/* Main Header Content */}
      <div className="relative z-10 space-y-2">
        {/* Row 1: Location, Toggle, and Notifications */}
        <div className="flex items-center justify-between gap-3">
          {/* Location Selector */}
          <div
            className="flex items-center gap-2 cursor-pointer group min-w-0 flex-1"
            onClick={handleLocationClick}
          >
            <div className={`p-1 rounded-lg group-active:scale-95 transition-all ${isLight ? "bg-white/80" : "bg-white/10"}`}>
              <MapPin className={`h-3.5 w-3.5 ${isLight ? "text-[#1a2517]" : "text-white/90 fill-white/20"}`} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className={`text-[14px] font-black truncate drop-shadow-sm ${isLight ? "text-[#1a2517]" : "text-white"}`}>
                  {(() => {
                    const area = location?.area || location?.subLocality || location?.mainTitle || location?.neighborhood;
                    const city = (location?.city || "").toLowerCase();
                    const state = (location?.state || "").toLowerCase();

                    if (area && !/^-?\d+(\.\d+)?$/.test(area.trim())) {
                      const areaLower = area.toLowerCase();
                      if (areaLower !== city && areaLower !== state) {
                        return area;
                      }
                    }

                    // Fallback to a part of the address if area is missing or redundant
                    if (location?.address && location.address !== "Select location") {
                      const parts = location.address.split(',').map(p => p.trim());
                      // Take the first part that isn't city or state
                      for (const part of parts) {
                        const partLower = part.toLowerCase();
                        if (partLower &&
                          partLower !== city &&
                          partLower !== state &&
                          !/^-?\d/.test(part) &&
                          part.length > 2) {
                          return part;
                        }
                      }
                    }

                    return location?.area || location?.city || "Select Location";
                  })()}
                </span>
                <ChevronDown className={`h-3 w-3 ${isLight ? "text-[#1a2517]/70" : "text-white/70"}`} />
              </div>

              <span className={`text-[10px] font-medium truncate leading-tight mt-0.5 ${isLight ? "text-[#1a2517]/70" : "text-white/90"}`}>
                {(() => {
                  // Format Row 2: State, Pincode (matching screenshot)
                  const state = location?.state || "";
                  const pincode = location?.pincode || "";

                  if (state && pincode) return `${state}, ${pincode}`;
                  if (state) return state;
                  if (pincode) return pincode;

                  // Fallback to snippet of address if no state/pincode
                  const addr = location?.address || "";
                  if (addr && addr.length > 10) {
                    return addr.split(',').slice(1, 3).join(',').trim() || "Pinpoint location";
                  }

                  return "Pinpoint location";
                })()}
              </span>

              <span className={`text-[9px] font-black uppercase tracking-[0.25em] leading-tight mt-1 ${isLight ? "text-[#1a2517]/45" : "text-white/60"}`}>
                {location?.city || "Indore"}
              </span>
            </div>
          </div>

          {/* Right Actions: Veg Toggle & Bell */}
          <div className="flex items-center gap-2.5">
            {/* Pure Veg Toggle */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all duration-300 ${vegMode ? (isLight ? "border-white/70 bg-white/70" : "border-white/40 bg-white/10") : (isLight ? "border-white/50 bg-white/40" : "border-white/10 bg-white/5")}`}
              onClick={() => handleVegModeChange?.(!vegMode)}
            >
              <div className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${vegMode ? (isLight ? "border-[#1a2517] bg-white" : "border-white bg-white") : (isLight ? "border-[#1a2517]/30" : "border-white/30")}`}>
                {vegMode && <div className="w-1 h-1 rounded-full bg-[#00b09b]" />}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tight ${vegMode ? (isLight ? "text-[#1a2517]" : "text-white") : (isLight ? "text-[#1a2517]/60" : "text-white/60")}`}>Veg</span>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <div className={`h-8 w-8 relative flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-all ${isLight ? "bg-white/70 border border-white/60" : "bg-white/10 border border-white/10"}`}>
                  <Bell className={`h-4 w-4 ${isLight ? "text-[#1a2517]" : "text-white/90"}`} />
                  {unreadCount > 0 && (
                    <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border animate-pulse ${vegMode ? (isLight ? "bg-orange-400 border-white" : "bg-orange-400 border-[#00b09b]") : (isLight ? "bg-orange-400 border-white" : "bg-orange-400 border-[#1a2517]")}`} />
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 overflow-hidden border-none shadow-2xl rounded-2xl mt-2" align="end">
                <div className="bg-white dark:bg-gray-900">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      Notifications
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-orange-100 text-[#1a2517] border-none text-[10px] h-4">
                          {unreadCount} New
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mergedNotifications.length > 0 ? (
                      mergedNotifications.slice(0, 5).map((notif) => {
                        const Icon = ICON_MAP[notif.icon] || Bell;
                        return (
                          <div key={notif.id} className="p-4 flex items-start gap-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 transition-colors">
                            <div className="mt-1 p-2 rounded-full bg-gray-100 text-[#23361A]">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{notif.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{notif.message}</p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center gap-2">
                        <BellOff className="h-10 w-10 text-gray-200" />
                        <p className="text-xs text-gray-400 font-medium">All caught up!</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 text-center">
                    <Link to="/food/user/notifications" className="text-xs font-bold text-gray-400">View All</Link>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {!hideSearch && (
          <div
            className={`relative rounded-2xl flex items-center px-4 py-3 cursor-pointer active:scale-[0.98] transition-all duration-500 w-full border backdrop-blur-md ${
              embedded
                ? "bg-white/60 border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
                : "bg-white/80 border-white/40 shadow-lg"
            }`}
            style={{ 
              borderColor: theme?.iconBorder ? (theme.iconBorder.includes('#') ? theme.iconBorder : 'rgba(255,255,255,0.3)') : 'rgba(255,255,255,0.2)',
            }}
            onClick={handleSearchFocus}
          >
            <Search className={`h-4.5 w-4.5 mr-2 shrink-0 ${theme?.text?.includes('#') ? '' : (theme?.text || "text-gray-900")}`} style={{ color: theme?.text?.includes('#') ? theme.text : undefined }} strokeWidth={3} />
            
            <div className="flex-1 overflow-hidden relative h-5">
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute inset-0 text-sm font-bold truncate flex items-center ${theme?.sub?.includes('#') ? '' : (theme?.sub || "text-gray-500")}`}
                  style={{ color: theme?.sub?.includes('#') ? theme.sub : undefined }}
                >
                  {placeholders?.[placeholderIndex] || 'Search'}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 pl-2">
              <div className="h-4 w-[1px] bg-gray-200" />
              <Mic
                className={`h-4.5 w-4.5 ${theme?.text?.includes('#') ? '' : (theme?.text || "text-gray-900")}`}
                style={{ color: theme?.text?.includes('#') ? theme.text : undefined }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVoiceSearchClick?.();
                }}
              />
            </div>
          </div>
        )}

        {/* Premium Service Hub Grid - Inspired by Super-Apps */}
        <div className="pt-2 px-1 pb-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: "food", label: "Food", icon: UtensilsCrossed, color: "bg-[#acc8a2]/20", iconColor: "text-[#1a2517]", activeBg: "bg-[#1a2517]", activeIcon: "text-white" },
              { id: "quick", label: "Store", icon: ShoppingBag, color: "bg-[#fdf2f2]", iconColor: "text-[#d32f2f]", badge: "FAST" },
              { id: "taxi", label: "Taxi", icon: Zap, color: "bg-[#f0f4ff]", iconColor: "text-[#1a73e8]" },
            ].map((service) => {
              const isActive = activeTab === service.id;
              const Icon = service.icon;
              
              return (
                <motion.button
                  key={service.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!service.placeholder) {
                      setActiveTab(service.id);
                    } else {
                      // Show coming soon or something
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className={`relative w-full aspect-square rounded-[24px] flex items-center justify-center transition-all duration-300 ${
                    isActive 
                    ? (service.activeBg || "bg-[#2e7d32]") + " shadow-lg shadow-black/10 scale-105" 
                    : service.color + " border border-white/20 hover:shadow-md"
                  }`}>
                    {/* Badge */}
                    {service.badge && (
                      <div className="absolute -top-1.5 -right-1 bg-[#ff5200] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-white/20 z-10">
                        {service.badge}
                      </div>
                    )}
                    
                    <Icon 
                      className={`h-6 w-6 transition-all duration-300 ${
                        isActive ? (service.activeIcon || "text-white") : service.iconColor
                      }`} 
                      strokeWidth={2.5} 
                    />

                    {/* Active Glow */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-0 rounded-[24px] ring-2 ring-white/30 ring-inset"
                      />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight text-center transition-colors truncate w-full ${
                    isActive ? "text-[#1a2517]" : "text-gray-500"
                  }`}>
                    {service.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
        
        {/* Children content (Banners, etc.) */}
        {children && (
          <div className="pt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

