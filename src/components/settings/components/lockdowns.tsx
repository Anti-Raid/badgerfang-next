import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Primary } from '../../ui/Buttons';
import { InputField } from './form-elements';
import { executeSettings, getUserGuildBaseInfo } from '@/lib/api';
import { Trash2, Lock, AlertCircle, RefreshCw, Calendar, Clock, Shield, Tv } from 'lucide-react';
import { FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface LockdownProps {
  guildId: string;
}

interface Lockdown {
  id: string;
  type: string;
  reason: string;
  created_at: string;
  channel_id?: string;
  channel_name?: string;
}

interface Channel {
  id: string;
  name: string;
}

export const Lockdowns: React.FC<LockdownProps> = ({ guildId }) => {
  const [type, setType] = useState('qsl');
  const [reason, setReason] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [channelOptions, setChannelOptions] = useState<{ value: string; label: string }[]>([]);
  const [lockdowns, setLockdowns] = useState<Lockdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // <--- added missing error state

  useEffect(() => {
    fetchLockdowns();
  }, [guildId]);

  useEffect(() => {
    if (type === 'scl') {
      fetchChannelOptions();
    }
  }, [type, guildId]);

  const fetchChannelOptions = async () => {
    try {
      const data = await getUserGuildBaseInfo(guildId);
      if (data.channels && Array.isArray(data.channels)) {
        const uniqueChannels = new Map();

        data.channels.forEach((item: any) => {
          if (item.channel && item.channel.id && item.channel.name) {
            uniqueChannels.set(item.channel.id, {
              value: item.channel.id,
              label: item.channel.name
            });
          }
        });

        const options = Array.from(uniqueChannels.values());
        setChannelOptions(options);
      }
    } catch (error) {
      console.error('Failed to fetch channel options:', error);
      toast.error('Failed to load channel options. Please try again.');
    }
  };

  const fetchLockdowns = async () => {
    setIsLoading(true);

    const payload = {
      operation: 'View',
      setting: 'lockdowns',
      fields: {}
    };

    try {
      const result = await executeSettings(guildId, payload);

      if (result.fields && Array.isArray(result.fields)) {
        const lockdownsData = result.fields.map((lockdown: any) => ({
          id: lockdown.id,
          type: lockdown.type,
          reason: lockdown.reason,
          created_at: lockdown.created_at,
          channel_id: lockdown.channel_id,
          channel_name: lockdown.channel_name
        }));
        setLockdowns(lockdownsData);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Failed to fetch lockdowns:', error);
      toast.error('Failed to load lockdowns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLockdown = async () => {
    if (!type || !reason) {
      toast.error('Please select a type and provide a reason');
      return;
    }

    if (type === 'scl' && !selectedChannelId) {
      toast.error('Please select a channel for Server Channel Lockdown');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError('');

    const formattedType = type === 'scl' ? `${type}/${selectedChannelId}` : type;

    const payload = {
      operation: 'Create',
      setting: 'lockdowns',
      fields: {
        type: formattedType,
        reason: reason
      }
    };

    try {
      await executeSettings(guildId, payload);
      setReason('');
      if (type === 'scl') {
        setSelectedChannelId('');
      }
      await fetchLockdowns();
    } catch (error) {
      console.error('Failed to add lockdown:', error);
      setError('Failed to add lockdown. Please try again.');
      toast.error('Failed to add lockdown.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLockdown = async (id: string) => {
    if (isLoading) return;
    if (!id || id.length < 30) {
      toast.error('Invalid lockdown ID. Cannot delete this item.');
      return;
    }

    setIsLoading(true);

    const payload = {
      operation: 'Delete',
      setting: 'lockdowns',
      fields: {
        id: id
      }
    };

    try {
      await executeSettings(guildId, payload);
      setLockdowns(lockdowns.filter((lockdown) => lockdown.id !== id));
    } catch (error) {
      console.error('Failed to delete lockdown:', error);
      toast.error('Failed to delete lockdown. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const lockdownTypes = [
    { value: 'qsl', label: 'QSL - Quick Server Lockdown' },
    { value: 'tsl', label: 'TSL - Temporary Server Lockdown' },
    { value: 'scl', label: 'SCL - Server Channel Lockdown' }
  ];

  const getLockdownTypeLabel = (type: string) => {
    const baseType = type.split('/')[0];
    const lockdownType = lockdownTypes.find((lt) => lt.value === baseType);
    return lockdownType ? lockdownType.label : baseType.toUpperCase();
  };

  const getTypeColor = (type: string) => {
    const baseType = type.split('/')[0];
    switch (baseType) {
      case 'qsl':
        return 'text-red-500 bg-red-500/10';
      case 'tsl':
        return 'text-amber-500 bg-amber-500/10';
      case 'scl':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString();
    } catch (e) {
      return 'Invalid time';
    }
  };

  const getChannelIdFromType = (lockdown: Lockdown): string | undefined => {
    if (lockdown.channel_id) return lockdown.channel_id;
    const typeParts = lockdown.type.split('/');
    if (typeParts.length > 1 && typeParts[0] === 'scl') {
      return typeParts[1];
    }
    return undefined;
  };

  const getChannelName = (lockdown: Lockdown) => {
    if (lockdown.channel_name) return lockdown.channel_name;
    const channelId = getChannelIdFromType(lockdown);
    if (!channelId) return '';
    const channel = channelOptions.find((option) => option.value === channelId);
    return channel ? channel.label : 'Unknown Channel';
  };

  const isSclType = (type: string) => {
    return type.startsWith('scl');
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Create New Lockdown
        </h3>

        <div className="space-y-4">
          <InputField
            label="Type"
            description="The type of the lockdown."
            type="select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={lockdownTypes}
          />

          {type === 'scl' && (
            <InputField
              label="Channel"
              description="Select the channel to apply the lockdown to."
              type="select"
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              options={channelOptions}
              placeholder="Select a channel"
            />
          )}

          <InputField
            label="Reason"
            description="The reason for starting the lockdown."
            placeholder="Enter the reason for the lockdown"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          <Primary
            Title={isLoading ? 'Creating...' : 'Create Lockdown'}
            onClick={handleAddLockdown}
            icon={FaLock}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Active Lockdowns</h3>
          <button
            onClick={fetchLockdowns}
            className="p-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
            aria-label="Refresh lockdowns"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : lockdowns.length === 0 ? (
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-muted rounded-full">
                <Shield className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            <h4 className="text-foreground font-medium mb-1">No active lockdowns</h4>
            <p className="text-muted-foreground text-sm">
              Your server is currently operating normally.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lockdowns.map((lockdown) => (
              <motion.div
                key={lockdown.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`flex justify-between items-center p-4 rounded-lg border ${getTypeColor(lockdown.type)}`}
              >
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Tv className="w-4 h-4" />
                    {getLockdownTypeLabel(lockdown.type)}
                    {isSclType(lockdown.type) && (
                      <span className="text-sm text-muted-foreground ml-2">
                        #{getChannelName(lockdown)}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm mt-1">{lockdown.reason}</div>
                  <div className="flex gap-4 text-xs mt-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(lockdown.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(lockdown.created_at)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteLockdown(lockdown.id)}
                  className="p-2 rounded-md hover:bg-destructive/20 transition-colors text-destructive"
                  aria-label="Delete lockdown"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
