import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, FileText, Check } from 'lucide-react';
import { useHrmsData, AppNotification } from '../../contexts/HrmsDataContext';

export const NotificationPopover: React.FC = () => {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useHrmsData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'leave':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'punch':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'payroll':
        return <FileText className="w-4 h-4 text-sky-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`In-app notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        title="In-App Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                type="button"
                onClick={() => markNotificationRead(notif.id)}
                className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                  !notif.isRead ? 'bg-indigo-50/30 hover:bg-indigo-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-xl bg-slate-100 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-bold truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Live HRMS Activity & Approval Alerts
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
