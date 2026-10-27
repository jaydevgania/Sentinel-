import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Mail, Building2, Shield, Download, Search, Filter,
  CheckCircle2, Clock, Sparkles, ArrowRight, UserCheck, RefreshCw, ChevronRight
} from 'lucide-react';
import { fetchAdminCustomers, fetchAdminLeads, updateAdminLead } from '../api';

export default function AdminCRMPage() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [updatingLeadId, setUpdatingLeadId] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [custData, leadData] = await Promise.all([
        fetchAdminCustomers(),
        fetchAdminLeads()
      ]);
      setCustomers(custData.customers || []);
      setLeads(leadData.leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      setUpdatingLeadId(leadId);
      await updateAdminLead(leadId, newStatus);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const exportCustomersCSV = () => {
    if (!customers.length) return;
    const headers = ["ID", "Name", "Email", "Company", "Brand", "Subscription Plan", "Status", "Reviews Used", "Registered Date", "Last Login"];
    const rows = customers.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.company_name}"`,
      `"${c.brand_name}"`,
      c.subscription_tier,
      c.subscription_status,
      c.reviews_count,
      c.created_at,
      c.last_login_at || "Never"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sentinel_customers_database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = !searchQuery ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = !tierFilter || c.subscription_tier?.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const filteredLeads = leads.filter(l => {
    return !searchQuery ||
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center font-bold text-gray-950">
                <Shield className="w-5 h-5 text-gray-950" />
              </div>
              <span className="font-extrabold text-lg text-white">SENTINEL</span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Admin & Customer Database
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadAll}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg border border-gray-800 transition"
              title="Refresh database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <Link
              to="/app"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-xs transition"
            >
              Launch Studio &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Registered Customers</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{customers.length}</div>
            <span className="text-[11px] text-emerald-400">Captured in real database</span>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Inbound Leads</span>
              <Mail className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{leads.length}</div>
            <span className="text-[11px] text-cyan-400">From Contact Page</span>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pro & Enterprise Users</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-purple-300">
              {customers.filter(c => c.subscription_tier === 'pro' || c.subscription_tier === 'enterprise').length}
            </div>
            <span className="text-[11px] text-purple-400">Paying / Upgraded Tiers</span>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Database Status</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">ONLINE</div>
            <span className="text-[11px] text-gray-400 font-mono">SQLite / Postgres pgvector</span>
          </div>
        </div>

        {/* Tab Selector & Controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'customers'
                  ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customer Accounts ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'leads'
                  ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact Form Leads ({leads.length})</span>
            </button>
          </div>

          {/* Search, Filter & CSV Export */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-950 border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 w-60"
              />
            </div>

            {activeTab === 'customers' && (
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">All Tiers</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            )}

            {activeTab === 'customers' && (
              <button
                onClick={exportCustomersCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold border border-gray-700 transition"
                title="Export customer list to CSV"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: CUSTOMERS DATABASE */}
        {activeTab === 'customers' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950/80 border-b border-gray-800 text-[11px] uppercase font-bold text-gray-400">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Company & Brand</th>
                    <th className="py-3 px-4">Subscription Plan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reviews Run</th>
                    <th className="py-3 px-4">Signup Date</th>
                    <th className="py-3 px-4">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-500">
                        No customers match your filter or no users registered yet.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-gray-850/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{cust.name}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{cust.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-200">{cust.company_name}</div>
                          <div className="text-[11px] text-amber-400">{cust.brand_name}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            cust.subscription_tier === 'pro'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : cust.subscription_tier === 'enterprise'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-gray-800 text-gray-300 border-gray-700'
                          }`}>
                            {cust.subscription_tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="capitalize">{cust.subscription_status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-white">
                          {cust.reviews_count}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                          {cust.created_at ? new Date(cust.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                          {cust.last_login_at ? new Date(cust.last_login_at).toLocaleTimeString() : 'Never'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: INBOUND CONTACT LEADS */}
        {activeTab === 'leads' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950/80 border-b border-gray-800 text-[11px] uppercase font-bold text-gray-400">
                  <tr>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Company & Team</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Message</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-500">
                        No contact inquiries found.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-850/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{lead.name}</div>
                          <div className="text-[11px] text-amber-400 font-mono">{lead.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-200">{lead.company || 'Direct Inquiry'}</div>
                          <div className="text-[11px] text-gray-400">Team: {lead.team_size || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-200">
                          {lead.subject}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-gray-300 text-[11px] line-clamp-2" title={lead.message}>
                            {lead.message}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                          {lead.created_at ? new Date(lead.created_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            disabled={updatingLeadId === lead.id}
                            className={`bg-gray-950 border text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none ${
                              lead.status === 'converted' ? 'text-emerald-400 border-emerald-500/40' :
                              lead.status === 'qualified' ? 'text-purple-400 border-purple-500/40' :
                              lead.status === 'contacted' ? 'text-blue-400 border-blue-500/40' :
                              'text-amber-400 border-amber-500/40'
                            }`}
                          >
                            <option value="new">New Lead</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="converted">Converted</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
