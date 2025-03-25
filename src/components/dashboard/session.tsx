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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 h-full col-span-2"
  >
    <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-10">
      <div className="flex items-center gap-6 mb-6">
        <div className="p-4 bg-white/10 rounded-2xl text-white">
          {icon}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/80 text-lg">{description}</p>
        </div>
      </div>
    </div>

    <div className="p-8">
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8">
            <p className="text-gray-500 dark:text-gray-400 text-xl">No active sessions found</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b-2 dark:border-gray-700">
                <th className="text-left py-6 px-8 text-base font-semibold text-gray-600 dark:text-gray-300 w-1/3">Session ID</th>
                <th className="text-left py-6 px-8 text-base font-semibold text-gray-600 dark:text-gray-300 w-1/6">Type</th>
                <th className="text-left py-6 px-8 text-base font-semibold text-gray-600 dark:text-gray-300 w-1/3">Created</th>
                <th className="text-right py-6 px-8 text-base font-semibold text-gray-600 dark:text-gray-300 w-1/6">Actions</th>
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
                    className="border-b last:border-b-0 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-3">
                        <code className="text-base bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg min-w-[180px]">
                          {session.id.slice(0, 12)}...
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(session.id);
                            toast.success('Copied to clipboard');
                          }}
                          className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                          <FaClipboard size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        {session.type}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-base text-gray-600 dark:text-gray-400">
                      {new Date(session.created_at).toLocaleDateString()} at{' '}
                      {new Date(session.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-6 px-8 text-right">
                      <button
                        onClick={() => onRevoke(session.id)}
                        className="inline-flex items-center justify-center p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Revoke Session"
                      >
                        <FaTrash size={20} />
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 h-full"
    >
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-10">
        <div className="flex items-center gap-6 mb-6">
          <div className="p-4 bg-white/10 rounded-2xl text-white">
            <FaPlus size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Create New Session</h2>
            <p className="text-white/80 text-lg">Generate a new API token with custom settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="space-y-3">
          <label htmlFor="name" className="block text-lg font-medium text-gray-700 dark:text-gray-300">
            Session Name
          </label>
          <input
            type="text"
            id="name"
            value={sessionData.name}
            onChange={(e) => setSessionData({ ...sessionData, name: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-primary/30 transition-all text-lg"
            placeholder="Enter a descriptive name"
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="type" className="block text-lg font-medium text-gray-700 dark:text-gray-300">
            Session Type
          </label>
          <select
            id="type"
            value={sessionData.type}
            onChange={(e) => setSessionData({ ...sessionData, type: e.target.value as 'api' })}
            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-primary/30 transition-all text-lg"
          >
            <option value="api">API Token</option>
          </select>
        </div>

        <div className="space-y-3">
          <label htmlFor="expiry" className="block text-lg font-medium text-gray-700 dark:text-gray-300">
            Expiry (seconds)
          </label>
          <input
            type="number"
            id="expiry"
            value={sessionData.expiry}
            onChange={(e) => setSessionData({ ...sessionData, expiry: parseInt(e.target.value) })}
            min={3600}
            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-primary/30 transition-all text-lg"
            placeholder="Minimum 3600 seconds"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-5 rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 font-medium text-lg shadow-xl hover:shadow-2xl"
        >
          <FaPlus size={20} />
          Create New Session
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1600px] mx-auto px-6 xl:px-8 py-16">
        <ToastContainer
          position="bottom-right"
          theme="colored"
          hideProgressBar={false}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <FaShieldAlt size={48} />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
                Sessions Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-xl">
                Manage your active sessions and API tokens securely
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-10 min-h-[calc(100vh-300px)]">
          <SessionCard
            title="Login Sessions"
            description="Active browser sessions and login tokens"
            icon={<FaKey size={32} />}
            sessions={sessions.loginSessions}
            onRevoke={handleRevokeSession}
          />
          <CreateSessionForm onSessionCreated={fetchSessions} />
        </div>
        <div className="mt-10 grid grid-cols-3 gap-10">
          <SessionCard
            title="API Tokens"
            description="Active API tokens for application access"
            icon={<FaCog size={32} />}
            sessions={sessions.apiSessions}
            onRevoke={handleRevokeSession}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;