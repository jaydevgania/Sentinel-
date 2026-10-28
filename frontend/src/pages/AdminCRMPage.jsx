import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Mail, Building2, Shield, Download, Search, Filter,
  CheckCircle2, Clock, Sparkles, ArrowRight, UserCheck, RefreshCw, ChevronRight,
  Lock, KeyRound, UserX, Check, AlertCircle, PlusCircle
} from 'lucide-react';
import {
  fetchAdminCustomers, fetchAdminLeads, updateAdminLead,
  fetchWhitelist, grantCustomerAccess, revokeCustomerAccess
} from '../api';

export default function AdminCRMPage() {
  const [activeTab, setActiveTab] = useState('customers'); // 'customers', 'leads', 'whitelist'
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [whitelistData, setWhitelistData] = useState({ developer_emails: [], whitelisted: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [updatingLeadId, setUpdatingLeadId] = useState(null);

  // New grant access inputs
  const [newGrantEmail, setNewGrantEmail] = useState('');
  const [newGrantNotes, setNewGrantNotes] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [custData, leadData, wlData] = await Promise.all([
        fetchAdminCustomers(),
        fetchAdminLeads(),
        fetchWhitelist()
      ]);
      setCustomers(custData.customers || []);
      setLeads(leadData.leads || []);
      setWhitelistData(wlData || { developer_emails: [], whitelisted: [] });
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
      if (newStatus === 'converted' || newStatus === 'approved') {
        // Reload customers and whitelist
        const [custData, wlData] = await Promise.all([fetchAdminCustomers(), fetchWhitelist()]);
        setCustomers(custData.customers || []);
        setWhitelistData(wlData);
      }
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleGrant = async (e) => {
    if (e) e.preventDefault();
    if (!newGrantEmail) return;

    try {
      setGrantLoading(true);
      setGrantSuccessMsg(null);
      const res = await grantCustomerAccess(newGrantEmail, newGrantNotes || 'Granted by developer');
      setGrantSuccessMsg(res.message);
      setNewGrantEmail('');
      setNewGrantNotes('');
      await loadAll();
    } catch (err) {
      alert(`Failed to grant access: ${err.message}`);
    } finally {
      setGrantLoading(false);
    }
  };

  const handleQuickGrant = async (email, notes = 'Quick approved by developer') => {
    try {
      setLoading(true);
      await grantCustomerAccess(email, notes);
      await loadAll();
    } catch (err) {
      alert(`Failed to grant access: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (email) => {
    if (!confirm(`Are you sure you want to revoke customer workspace access for ${email}?`)) return;
    try {
      setLoading(true);
      await revokeCustomerAccess(email);
      await loadAll();
    } catch (err) {
      alert(`Failed to revoke access: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportCustomersCSV = () => {
    if (!customers.length) return;
    const headers = ["ID", "Name", "Email", "Company", "Brand", "Subscription Plan", "Access Approved", "Status", "Reviews Used", "Registered Date", "Last Login"];
    const rows = customers.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.company_name}"`,
      `"${c.brand_name}"`,
      c.subscription_tier,
      c.is_approved ? "YES" : "NO",
      c.subscription_status,
      c.reviews_count,
      `"${c.created_at || ''}"`,
      `"${c.last_login_at || ''}"`
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
    <div className="min-h-screen text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center font-bold text-gray-950 shadow-md shadow-amber-900/20">
                <Shield className="w-5 h-5 text-gray-950" />
              </div>
              <span className="font-extrabold text-lg text-white">SENTINEL</span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
              Developer Admin Panel
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
              Sole Developer: devgania1@gmail.com
            </span>
            <button
              onClick={loadAll}
              className="p-2 text-gray-400 hover:text-white glass-card rounded-lg transition"
              title="Refresh database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <Link
              to="/app"
              className="px-3.5 py-1.5 glass-button-primary font-bold rounded-xl text-xs transition"
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
          <div className="glass-card rounded-2xl p-5 hover:border-emerald-500/30 transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Approved Customers</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {customers.filter(c => c.is_approved).length}
            </div>
            <span className="text-[11px] text-emerald-400">Granted developer access</span>
          </div>

          <div className="glass-card rounded-2xl p-5 hover:border-amber-500/30 transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Access Requests</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {customers.filter(c => !c.is_approved).length + leads.filter(l => l.status === 'pending_approval').length}
            </div>
            <span className="text-[11px] text-amber-400">Awaiting developer approval</span>
          </div>

          <div className="glass-card rounded-2xl p-5 hover:border-cyan-500/30 transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Inbound Leads</span>
              <Mail className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{leads.length}</div>
            <span className="text-[11px] text-cyan-400">Contact form submissions</span>
          </div>

          <div className="glass-card rounded-2xl p-5 hover:border-purple-500/30 transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Access Security</span>
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-300">DEVELOPER ONLY</div>
            <span className="text-[11px] text-purple-400">Strict whitelist enforced</span>
          </div>
        </div>

        {/* Developer Access Granting Form Banner */}
        <div className="glass-panel border-amber-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center space-x-2 mb-3">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Grant Customer Access (Developer Authorization)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Only developer mail or customer emails explicitly authorized below can sign in or register to brand workspaces.
          </p>

          <form onSubmit={handleGrant} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="customer.email@company.com"
              value={newGrantEmail}
              onChange={(e) => setNewGrantEmail(e.target.value)}
              className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
            <input
              type="text"
              placeholder="Notes (e.g. Enterprise pilot customer)"
              value={newGrantNotes}
              onChange={(e) => setNewGrantNotes(e.target.value)}
              className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={grantLoading}
              className="px-5 py-2 glass-button-primary font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{grantLoading ? 'Granting...' : 'Grant Customer Access'}</span>
            </button>
          </form>

          {grantSuccessMsg && (
            <div className="mt-3 p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{grantSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Tab Selector & Controls */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customer Accounts ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Inbound Requests & Leads ({leads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('whitelist')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'whitelist'
                  ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Developer Whitelist ({(whitelistData?.whitelisted || []).length})</span>
            </button>
          </div>

          {/* Search, Filter & CSV Export */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 w-60"
              />
            </div>

            {activeTab === 'customers' && (
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="glass-input rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
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
                className="flex items-center space-x-1.5 px-3 py-1.5 glass-card hover:border-amber-500/50 text-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer"
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
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="glass-panel-subtle border-b border-white/10 text-[11px] uppercase font-bold text-gray-400">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Company & Brand</th>
                    <th className="py-3 px-4">Subscription Plan</th>
                    <th className="py-3 px-4">Access Status</th>
                    <th className="py-3 px-4">Reviews</th>
                    <th className="py-3 px-4">Signup Date</th>
                    <th className="py-3 px-4 text-right">Developer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-500">
                        No customers match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-white/5 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span>{cust.name}</span>
                            {cust.is_admin && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 rounded">
                                Dev Admin
                              </span>
                            )}
                          </div>
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
                              : 'bg-white/10 text-gray-300 border-white/20'
                          }`}>
                            {cust.subscription_tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {cust.is_approved ? (
                            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approved Access</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Approval</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-white">
                          {cust.reviews_count}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                          {cust.created_at ? new Date(cust.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {cust.is_approved ? (
                            <button
                              type="button"
                              onClick={() => handleRevoke(cust.email)}
                              className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                            >
                              Revoke Access
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickGrant(cust.email, 'Approved from customer list')}
                              className="px-2.5 py-1 glass-button-primary rounded-lg text-[11px] font-bold transition shadow cursor-pointer"
                            >
                              Grant Access
                            </button>
                          )}
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
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="glass-panel-subtle border-b border-white/10 text-[11px] uppercase font-bold text-gray-400">
                  <tr>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Company & Team</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Message</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Developer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-500">
                        No contact inquiries or access requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/5 transition">
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
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            disabled={updatingLeadId === lead.id}
                            className={`glass-input text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none ${
                              lead.status === 'converted' || lead.status === 'approved' ? 'text-emerald-400 border-emerald-500/40' :
                              lead.status === 'qualified' ? 'text-purple-400 border-purple-500/40' :
                              lead.status === 'contacted' ? 'text-blue-400 border-blue-500/40' :
                              'text-amber-400 border-amber-500/40'
                            }`}
                          >
                            <option value="new">New Lead</option>
                            <option value="pending_approval">Pending Approval</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="approved">Approved</option>
                            <option value="converted">Converted</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleQuickGrant(lead.email, `Approved from lead: ${lead.name}`)}
                            className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-bold rounded-lg text-[11px] shadow transition cursor-pointer"
                          >
                            Approve Access
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DEVELOPER WHITELIST */}
        {activeTab === 'whitelist' && (
          <div className="space-y-4">
            {/* Master Developers Card */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Developer Master Accounts (Permanent Full Access)
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {(whitelistData.developer_emails || []).map((devEmail) => (
                  <span
                    key={devEmail}
                    className="px-3 py-1.5 glass-card border border-amber-500/40 text-amber-300 rounded-xl text-xs font-mono font-semibold flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>{devEmail}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Whitelisted Customer Accounts */}
            <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Developer-Approved Customer Whitelist
                </h4>
                <span className="text-[11px] text-emerald-400">
                  {(whitelistData.whitelisted || []).length} authorized accounts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="glass-panel-subtle border-b border-white/10 text-[11px] uppercase font-bold text-gray-400">
                    <tr>
                      <th className="py-3 px-4">Authorized Customer Email</th>
                      <th className="py-3 px-4">Granted By</th>
                      <th className="py-3 px-4">Notes / Authorization</th>
                      <th className="py-3 px-4">Date Authorized</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {(whitelistData.whitelisted || []).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-gray-500">
                          No external customers whitelisted yet. Enter an email in the form above to grant access.
                        </td>
                      </tr>
                    ) : (
                      (whitelistData.whitelisted || []).map((w) => (
                        <tr key={w.id} className="hover:bg-white/5 transition">
                          <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                            {w.email}
                          </td>
                          <td className="py-3.5 px-4 text-gray-300">
                            {w.granted_by || 'developer'}
                          </td>
                          <td className="py-3.5 px-4 text-gray-300">
                            {w.notes || 'Developer authorized'}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                            {w.created_at ? new Date(w.created_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRevoke(w.email)}
                              className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
