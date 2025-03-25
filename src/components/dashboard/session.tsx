'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaKey, FaTrash, FaPlus, FaCog, FaClipboard, FaShieldAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUserSessions, revokeSession, createSession } from '@/lib/api';
import { UserSession, CreateUserSession } from '@/types/splashtail/types';

const SessionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  sessions: UserSession[];
  onRevoke: (sessionId: string) => void;
}> = ({ title, description, icon, sessions, onRevoke }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, type: 'spring' }}
    className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 dark:border-gray-800/50 overflow-hidden"
  >
    <div className="bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 p-6 md:p-8">
      <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="p-3 md:p-4 bg-white/20 rounded-xl text-white">
          {React.cloneElement(icon as React.ReactElement, { size: 28 })}
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{title}</h2>
          <p className="text-white/80 text-base md:text-lg">{description}</p>
        </div>
      </div>
    </div>

    <div className="p-4 md:p-6">
      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-6">
            <p className="text-gray-500 dark:text-gray-400 text-base md:text-xl">No active sessions found</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700/50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Session ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Created</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sessions.map((session) => (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b last:border-b-0 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs md:text-sm bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md">
                          {session.id.slice(0, 8)}...
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(session.id);
                            toast.success('Copied to clipboard');
                          }}
                          className="text-gray-400 hover:text-primary transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                          <FaClipboard size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {session.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {new Date(session.created_at).toLocaleDateString()} 
                      <span className="ml-1">
                        {new Date(session.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onRevoke(session.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Revoke Session"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  </motion.div>
);

const CreateSessionForm: React.FC<{ onSessionCreated: () => void }> = ({ onSessionCreated }) => {
  const [sessionData, setSessionData] = useState<CreateUserSession>({
    name: '',
    type: 'api',
    expiry: 3600
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSession(sessionData);
      toast.success('Session created successfully!');
      onSessionCreated();
      setSessionData({ name: '', type: 'api', expiry: 3600 });
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring' }}
      className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 dark:border-gray-800/50 overflow-hidden"
    >
      <div className="bg-gradient-to-br from-extra/90 via-extra/80 to-extra/70 p-6 md:p-8">
        <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="p-3 md:p-4 bg-white/20 rounded-xl text-white">
            <FaPlus size={28} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Create New Session</h2>
            <p className="text-white/80 text-base md:text-lg">Generate a new API token</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
            Session Name
          </label>
          <input
            type="text"
            id="name"
            value={sessionData.name}
            onChange={(e) => setSessionData({ ...sessionData, name: e.target.value })}
            className="w-full px-3 py-2 md:px-4 md:py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-extra/30 transition-all text-sm md:text-base"
            placeholder="Enter a descriptive name"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
            Session Type
          </label>
          <select
            id="type"
            value={sessionData.type}
            onChange={(e) => setSessionData({ ...sessionData, type: e.target.value as 'api' })}
            className="w-full px-3 py-2 md:px-4 md:py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-extra/30 transition-all text-sm md:text-base"
          >
            <option value="api">API Token</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="expiry" className="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
            Expiry (seconds)
          </label>
          <input
            type="number"
            id="expiry"
            value={sessionData.expiry}
            onChange={(e) => setSessionData({ ...sessionData, expiry: parseInt(e.target.value) })}
            min={3600}
            className="w-full px-3 py-2 md:px-4 md:py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-extra/30 transition-all text-sm md:text-base"
            placeholder="Minimum 3600 seconds"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-extra text-white py-3 rounded-xl hover:bg-extra/90 transition-all flex items-center justify-center gap-2 font-medium text-sm md:text-base shadow-xl hover:shadow-2xl"
        >
          <FaPlus size={16} />
          Create Session
        </button>
      </form>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<{
    loginSessions: UserSession[];
    apiSessions: UserSession[];
  }>({
    loginSessions: [],
    apiSessions: []
  });

  const fetchSessions = async () => {
    try {
      const sessionData = await getUserSessions();
      setSessions({
        loginSessions: sessionData.sessions.filter((s): s is UserSession => s?.type === 'login') ?? [],
        apiSessions: sessionData.sessions.filter((s): s is UserSession => s?.type !== 'login') ?? []
      });
    } catch (error) {
      toast.error('Failed to fetch sessions');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      toast.success('Session revoked successfully!');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-gray-950/90 backdrop-blur-xl">
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="toast-container"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 md:mb-16"
        >
          <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="p-3 md:p-4 bg-extra/10 rounded-xl text-extra">
              <FaShieldAlt size={36} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                Sessions Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base md:text-xl">
                Manage your active sessions and API tokens securely
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <SessionCard
            title="Login Sessions"
            description="Active browser sessions"
            icon={<FaKey />}
            sessions={sessions.loginSessions}
            onRevoke={handleRevokeSession}
          />
          <CreateSessionForm onSessionCreated={fetchSessions} />
          <SessionCard
            title="API Tokens"
            description="Active API access tokens"
            icon={<FaCog />}
            sessions={sessions.apiSessions}
            onRevoke={handleRevokeSession}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;