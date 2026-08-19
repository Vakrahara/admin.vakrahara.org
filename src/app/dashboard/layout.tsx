'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { pb } from '@/lib/pocketbase';
import { useInstitutions } from '@/hooks/useInstitutions';
import { 
  LayoutDashboard, Users, BookOpen, Building2, LogOut, ShieldAlert, 
  Menu, X, Loader2, ChevronRight, Package, Bell, ShoppingBag, 
  Key, Tag, Settings2, Receipt, GraduationCap, School, Swords, 
  Globe2, Server, ShieldCheck, Headphones, Sliders, Code
} from 'lucide-react';
import { LivePulseStream } from '@/components/LivePulseStream';

interface NavGroup {
  category: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: number;
  }[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Administrator');
  const [adminRole, setAdminRole] = useState('Admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { pendingCount } = useInstitutions();

  useEffect(() => {
    const verifyAuth = () => {
      if (!pb.authStore.isValid) {
        router.push(`/login?redirect=${pathname}`);
        return;
      }
      
      const record = pb.authStore.record;
      if (record) {
        setAdminName(record.name || record.username || 'Co-ordinator');
        const email = record.email?.toLowerCase();
        setAdminRole((email === 'vkarms.vk@gmail.com' || email === 'vakrahara@gmail.com') ? 'Super Admin' : 'Staff Admin');
      }
      setLoading(false);
    };

    verifyAuth();
    const unsub = pb.authStore.onChange(() => verifyAuth());
    return () => unsub();
  }, [router, pathname]);

  const handleSignOut = () => {
    pb.authStore.clear();
    document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
    router.refresh();
  };

  const navGroups: NavGroup[] = [
    {
      category: 'Core Operations',
      items: [
        { name: 'Analytics Summary', href: '/dashboard', icon: LayoutDashboard },
        { name: 'User Management', href: '/dashboard/users', icon: Users },
        { name: 'Orders & Revenue', href: '/dashboard/orders', icon: ShoppingBag },
        { name: 'Audit Trail', href: '/dashboard/audit', icon: ShieldAlert },
        { name: 'GST & Finance', href: '/dashboard/finance', icon: Receipt },
      ],
    },
    {
      category: 'Pedagogy & B2B',
      items: [
        { name: 'Pedagogy Funnels', href: '/dashboard/pedagogy', icon: GraduationCap },
        { name: 'Curriculum CMS', href: '/dashboard/content', icon: BookOpen },
        { name: 'School Affiliates', href: '/dashboard/affiliates', icon: School },
        { name: 'Institution Requests', href: '/dashboard/institutions', icon: Building2, badge: pendingCount },
      ],
    },
    {
      category: 'Multiplayer & Map',
      items: [
        { name: 'Buddhi Arena', href: '/dashboard/arena', icon: Swords },
        { name: 'Jambudvipa Map', href: '/dashboard/jambudvipa', icon: Globe2 },
      ],
    },
    {
      category: 'Growth & Deals',
      items: [
        { name: 'Push Campaigns', href: '/dashboard/push', icon: Bell },
        { name: 'Coupons & Deals', href: '/dashboard/coupons', icon: Tag },
        { name: 'Activation Keys', href: '/dashboard/activation-keys', icon: Key },
      ],
    },
    {
      category: 'System & Security',
      items: [
        { name: 'Infrastructure VPS', href: '/dashboard/infrastructure', icon: Server },
        { name: 'UGC Moderation', href: '/dashboard/moderation', icon: ShieldCheck },
        { name: 'Customer Support', href: '/dashboard/support', icon: Headphones },
        { name: 'Feature Flags', href: '/dashboard/experiments', icon: Sliders },
        { name: 'App Releases', href: '/dashboard/releases', icon: Package },
        { name: 'DevTools Sandbox', href: '/dashboard/devtools', icon: Code },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mx-auto" />
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Decrypting Control Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-gray-100 flex flex-col md:flex-row relative">
      {/* Radial Background Accent Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#800020]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Mobile Header Bar */}
      <header className="md:hidden w-full bg-[#08080c] border-b border-white/10 px-6 py-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#b8860b] to-[#d4af37] rounded-lg flex items-center justify-center shadow-lg shadow-[#d4af37]/15">
            <ShieldAlert className="w-4 h-4 text-[#050508]" />
          </div>
          <span className="font-bold tracking-wide text-white text-sm">Vakrahara Console</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-[#08080c] border-r border-white/10 p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 overflow-y-auto
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#b8860b] to-[#d4af37] rounded-xl flex items-center justify-center shadow-lg shadow-[#d4af37]/20 border border-[#d4af37]/30">
              <ShieldAlert className="w-4 h-4 text-[#050508]" />
            </div>
            <div>
              <span className="font-bold tracking-wide text-white text-sm block">Vakrahara</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Admin Console</span>
            </div>
          </div>

          {/* User Account Info */}
          <div className="p-3.5 bg-[#0d0d15] border border-white/10 rounded-xl flex items-center gap-3 shadow-inner">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-[#d4af37] flex items-center justify-center font-bold text-xs text-[#050508] shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              {adminName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{adminName}</div>
              <div className="text-[9px] font-bold text-[#d4af37] uppercase tracking-wider">{adminRole}</div>
            </div>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-3">
                  {group.category}
                </span>
                <div className="space-y-0.5 pt-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group relative
                          ${isActive 
                            ? 'bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-2 border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.05)]' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-[#d4af37]' : 'text-gray-400 group-hover:text-white'}`} />
                          {item.name}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#d4af37] text-[#050508] text-[9px] font-bold">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${isActive ? 'text-[#d4af37] opacity-80' : 'text-gray-500'}`} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sign Out Action */}
        <button
          onClick={handleSignOut}
          className="w-full mt-6 flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out Node
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 z-10 relative overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Global Realtime Pulse Widget */}
      <LivePulseStream />

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden"
        />
      )}
    </div>
  );
}
