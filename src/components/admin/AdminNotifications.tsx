'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, ShoppingCart, MessageSquare } from 'lucide-react';
import { getAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/actions/notifications';
import { useRouter } from 'next/navigation';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url: string | null;
  created_at: string;
};

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const data = await getAdminNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Simple polling every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
      setNotifications(notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
    }
    
    if (notification.link_url) {
      setIsOpen(false);
      router.push(notification.link_url);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'inquiry': return <MessageSquare className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full hover:bg-[#f5f5f5] flex items-center justify-center text-[#595959] transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#dc2626] rounded-full border border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#eaeaea] rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#eaeaea] bg-[#fcfcfc]">
            <h3 className="font-bold text-sm text-[#111111]">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-[#0070f3] hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-[#595959]">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#595959]">No notifications yet.</div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 p-4 text-left transition-colors border-b border-[#eaeaea] last:border-0 hover:bg-[#f5f5f5] ${!notification.is_read ? 'bg-[#fcfcfc]' : 'bg-white'}`}
                  >
                    <div className="mt-1 flex-shrink-0 bg-white border border-[#eaeaea] p-1.5 rounded-md shadow-sm">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-0.5 ${!notification.is_read ? 'font-bold text-[#111111]' : 'font-medium text-[#444444]'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-[#595959] line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-[#888888] mt-2 uppercase tracking-wide">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-[#0070f3] rounded-full mt-2 flex-shrink-0"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
