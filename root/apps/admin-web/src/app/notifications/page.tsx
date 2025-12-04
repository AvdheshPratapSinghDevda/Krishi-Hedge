import Header from "@/components/Header";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  user_id?: string;
}

const demoNotifications = [
  { id: "n1", title: "Maize forward anchored", message: "Contract C-001 has been anchored with buyer SH-208.", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), type: "contract", read: false },
  { id: "n2", title: "Settlement window approaching", message: "Wheat forward C-003 enters delivery window tomorrow.", created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), type: "alert", read: false },
  { id: "n3", title: "New farmer onboarded", message: "Farmer #438 added 400kg Paddy exposure.", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), type: "info", read: true },
];

async function fetchNotifications(): Promise<Notification[]> {
  try {
    const res = await fetch(`http://localhost:3001/api/notifications`, { cache: "no-store" });
    if (!res.ok) {
      console.error('[Admin Notifications] Failed to fetch notifications from API');
      return demoNotifications;
    }
    const data = await res.json() as Notification[];
    return data.length > 0 ? data : demoNotifications;
  } catch (error) {
    console.error('[Admin Notifications] Error fetching notifications:', error);
    return demoNotifications;
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'contract': return 'bg-blue-100 text-blue-700';
    case 'alert': return 'bg-orange-100 text-orange-700';
    case 'warning': return 'bg-yellow-100 text-yellow-700';
    case 'success': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getTypeIcon(type: string): JSX.Element {
  switch (type) {
    case 'contract':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    case 'alert':
    case 'warning':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'success':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
  }
}

export default async function NotificationsPage() {
  const notifications = await fetchNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <main className="overview-container max-w-4xl py-6">
      <Header title="Notifications" subtitle="Latest alerts across contracts, settlements and risk." />
      
      {/* Stats Bar */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-100">
          <span className="text-sm font-medium text-blue-900">Total</span>
          <span className="text-lg font-bold text-blue-600">{notifications.length}</span>
        </div>
        {unreadCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 border border-orange-100">
            <span className="text-sm font-medium text-orange-900">Unread</span>
            <span className="text-lg font-bold text-orange-600">{unreadCount}</span>
          </div>
        )}
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">System alerts, anchors and approvals from Supabase.</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {notifications.map((note) => (
            <div 
              key={note.id} 
              className={`p-6 transition-colors hover:bg-gray-50 ${!note.read ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(note.type)}`}>
                  {getTypeIcon(note.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{note.title}</h3>
                      {!note.read && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                        {note.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatTimeAgo(note.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{note.message}</p>
                </div>
              </div>
            </div>
          ))}
          
          {notifications.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No notifications available</p>
              <p className="text-xs text-gray-400 mt-1">Notifications will appear here when there are updates</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

