'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { luauTemplate } from '@/lib/wasm/wasm';
import logger from '@/lib/logger';
import { Setting, ColumnType, InnerColumnType } from '@/types/settings';
import { DispatchResult, UserGuildBaseData } from '@/types/gosdk/types';

import { SettingsErrorDisplay } from '../components/ErrorDisplay';
import { SettingsHeader } from '../components/Header';
import { SettingsForm } from '../components/SettingsForm';
import { SettingsEntry } from '../components/SettingsEntry';
import { SettingsReorderableList } from '../components/SettingsReorderableList';
import { SettingsFooter } from '../components/SettingsFooter';

export const defaultNew = (setting: Setting) => {
  let data: any = {};
  for (let column of setting.columns) {
    if (column.column_type.type === ColumnType.Scalar) {
      if (
        column.column_type.inner.type === InnerColumnType.Integer ||
        column.column_type.inner.type === InnerColumnType.Float
      ) {
        data[column.id] = 0;
      } else if (column.column_type.inner.type === InnerColumnType.Boolean) {
        data[column.id] = false;
      } else {
        data[column.id] = '';
      }
    } else if (column.column_type.type === ColumnType.Array) {
      data[column.id] = [];
    } else if (column.column_type.type === ColumnType.Widget) {
      continue;
    }
  }
  return data;
};

export const fillInSetting = async (
  setting: Setting,
  guildData: UserGuildBaseData,
  fields: { [key: string]: unknown },
  onError: (e: string) => void
) => {
  for (let column of setting.columns) {
    let data = fields[column.id];
    if (data === undefined) {
      if (column.column_type.type === ColumnType.Scalar) {
        if (
          column.column_type.inner.type === InnerColumnType.Integer ||
          column.column_type.inner.type === InnerColumnType.Float
        ) {
          fields[column.id] = 0;
        } else if (column.column_type.inner.type === InnerColumnType.Boolean) {
          fields[column.id] = false;
        } else {
          fields[column.id] = '';
        }
      } else if (column.column_type.type === ColumnType.Array) {
        fields[column.id] = [];
      } else if (column.column_type.type === ColumnType.Widget) {
        continue;
      }
    } else {
      if (column.column_type.type === ColumnType.Scalar) {
        if (
          column.column_type.inner.type === InnerColumnType.Integer ||
          column.column_type.inner.type === InnerColumnType.Float
        ) {
          if (typeof data !== 'number') {
            let num = parseFloat(data?.toString() || '0');
            if (isNaN(num)) {
              num = 0;
            }
            fields[column.id] = num;
          }
        } else if (column.column_type.inner.type === InnerColumnType.Boolean) {
          if (typeof data === 'boolean') {
            fields[column.id] = data;
          } else if (typeof data === 'string') {
            fields[column.id] = data == 'true' || data === '1' || data.toLowerCase() === 'yes';
          } else if (typeof data === 'number') {
            fields[column.id] = data !== 0;
          } else {
            fields[column.id] = false;
          }
        }
      }
    }
  }

  if (setting.title_template) {
    try {
      let titleFields: { [key: string]: unknown } = {};
      for (let field of setting.columns) {
        if (field.column_type.type === ColumnType.Widget) {
          continue;
        }
        if (
          field.column_type.inner.type === InnerColumnType.Json &&
          field.column_type.inner.style == 'template'
        ) {
          continue;
        }
        titleFields[field.id] = fields[field.id];
      }

      let title = await luauTemplate(setting.title_template, {
        fields: titleFields,
        guildData
      });

      logger.info('SettingComponent', 'Filled in title for setting: ', title);
      if (typeof title === 'string') {
        fields['title'] = title;
      }
    } catch (error) {
      onError(error?.toString() || 'Unknown error');
    }
  }

  return fields;
};

/**
 * Fetches settings data. This can be useful in e.g. mocking settings with dummy data and also allows for functionality
 * to be separate from the UI
 */
export interface SettingDataFetcher {
	/**
	 * Returns a list of all entries (as returned by the template/script) for a given setting
	 */
	listEntries: (setting: Setting) => Promise<{ [templateName: string]: DispatchResult }>;
	/**
	 * Creates a new entry for a given setting
	 * @param setting The setting to create an entry for
	 * @param fields The fields to create the entry with
	 */
	createEntry: (
		setting: Setting,
		fields: unknown
	) => Promise<{ [templateName: string]: DispatchResult }>;
	/**
	 * Updates an existing entry for a given setting
	 * @param setting The setting to update an entry for
	 * @param fields The fields to update the entry with
	 */
	updateEntry: (
		setting: Setting,
		fields: unknown
	) => Promise<{ [templateName: string]: DispatchResult }>;
	/**
	 * Deletes an entry for a given setting
	 * @param setting The setting to delete an entry for
	 * @param fields The fields to delete the entry with
	 */
	deleteEntry: (
		setting: Setting,
		fields: unknown
	) => Promise<{ [templateName: string]: DispatchResult }>;
	/**
	 * Reorders entries for a given setting
	 */
	reorderEntries: (
		setting: Setting,
		fields: unknown[]
	) => Promise<{ [templateName: string]: DispatchResult }>;
}

export const noOpFetcher: SettingDataFetcher = {
	listEntries: async (setting: Setting) => {
		return {};
	},
	createEntry: async (setting: Setting, fields: unknown) => {
		logger.info('noOpFetcher', 'createEntry called with setting:', setting, 'and fields:', fields);
		return {};
	},
	updateEntry: async (setting: Setting, fields: unknown) => {
		logger.info('noOpFetcher', 'updateEntry called with setting:', setting, 'and fields:', fields);
		return {};
	},
	deleteEntry: async (setting: Setting, fields: unknown) => {
		logger.info('noOpFetcher', 'deleteEntry called with setting:', setting, 'and fields:', fields);
		return {};
	},
	reorderEntries: async (setting: Setting, fields: unknown[]) => {
		logger.info(
			'noOpFetcher',
			'reorderEntries called with setting:',
			setting,
			'and fields:',
			fields
		);
		return {};
	}
};

interface SettingsManagerProps {
  guildId: string;
  setting: Setting;
  fetcher: SettingDataFetcher;
  guildData: UserGuildBaseData;
}

export const SettingComponent: React.FC<SettingsManagerProps> = ({
  guildId,
  setting,
  fetcher,
  guildData
}) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState<any>(null);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [loadErrors, setLoadErrors] = useState<{ [templateName: string]: string }>({});
  const [isReordered, setIsReordered] = useState(false);

  const processRes = (res: { [templateName: string]: any }) => {
    let errors: { [templateName: string]: string } = {};
    for (let templateName in res) {
      if (res[templateName].type !== 'Ok') {
        let errorMessage = res[templateName].data?.toString() || 'Unknown error';
        errors[templateName] = errorMessage;
      }
    }
    setLoadErrors(errors);
  };

  const fetchSetting = async () => {
    try {
      const result = await fetcher.listEntries(setting);
      let mergedFields: any[] = [];
      let errors: { [templateName: string]: string } = {};

      for (const templateName in result) {
        let templateResult = result[templateName];
        if (!templateResult) {
          errors[templateName] = `No data found for template ${templateName}`;
          continue;
        }

        if (templateResult.type != 'Ok') {
          errors[templateName] = templateResult.data?.toString() || 'Unknown error';
          continue;
        }

        if (!templateResult.data) {
          errors[templateName] = `No data returned by template ${templateName}`;
          continue;
        }

        if (Array.isArray(templateResult.data)) {
          for (let f of templateResult.data) {
            mergedFields.push(
              await fillInSetting(setting, guildData, f, (e) => {
                errors[templateName] = e;
                logger.error('SettingsManager', 'Failed to fill in setting:', e);
              })
            );
          }
        } else if (typeof templateResult.data === 'object') {
          mergedFields.push(
            await fillInSetting(setting, guildData, templateResult.data, (e) => {
              errors[templateName] = e;
              logger.error('SettingsManager', 'Failed to fill in setting:', e);
            })
          );
        } else {
          errors[templateName] = `Unexpected data type returned by template ${templateName}`;
        }
      }

      if (setting.index_by) {
        mergedFields = mergedFields.toSorted((a, b) => {
          let aIndex = a[setting.index_by!] || Number.MAX_SAFE_INTEGER;
          let bIndex = b[setting.index_by!] || Number.MAX_SAFE_INTEGER;
          return aIndex - bIndex;
        });

        for (let i = 0; i < mergedFields.length; i++) {
          if (mergedFields[i][setting.index_by] === undefined) {
            mergedFields[i][setting.index_by] = i + 1;
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        setLoadErrors(errors);
      }

      setEntries(mergedFields);
    } catch (error) {
      toast.error(`Failed to fetch entries: ${error}`);
    }
  };

  const validateOperation = async (operation: string, sendFields: any) => {
    if (setting.validation_template) {
      const params = {
        op: operation,
        fields: sendFields,
        entries,
        guildData: guildData
      };

      try {
        const result = await luauTemplate(setting.validation_template, params);
        if (result !== null) {
          return result as { [key: string]: unknown };
        }
      } catch (error) {
        logger.error('SettingsManager', `Failed to validate ${operation}:`, error);
        toast.error(`Failed to validate ${operation} of ${setting.name}: ${error}`);
        throw error;
      }
    }
    return sendFields;
  };

  const handleAddEntry = async () => {
    try {
      let sendFields = structuredClone(newEntry);
      sendFields = await validateOperation('Create', sendFields);
      
      const res = await fetcher.createEntry(setting, sendFields);
      processRes(res);
      setNewEntry(null);
      setShowNewEntryForm(false);
      fetchSetting();
    } catch (error) {
      logger.error('SettingsManager', 'Failed to add new entry:', error);
      toast.error(`Failed to add ${setting.name}`);
    }
  };

  const handleDeleteEntry = async (fields: { [key: string]: unknown }) => {
    try {
      let sendFields: { [key: string]: unknown } = {};
      for (let column of setting.columns) {
        if (column.primary_key) {
          let entry = fields[column.id];
          if (entry === undefined) {
            toast.error(`Missing primary key field ${column.id} for deletion`);
            return;
          }
          sendFields[column.id] = entry;
        }
      }

      sendFields = await validateOperation('Delete', sendFields);
      const res = await fetcher.deleteEntry(setting, sendFields);
      processRes(res);
      setEntries(entries.filter((entry) => entry !== fields));
    } catch (error) {
      logger.error('SettingsManager', 'Failed to delete entry:', error);
      toast.error(`Failed to delete ${setting.name}`);
    }
  };

  const handleSaveEdit = async () => {
    try {
      let sendFields = structuredClone(editingEntry);
      sendFields = await validateOperation('Update', sendFields);
      
      const res = await fetcher.updateEntry(setting, sendFields);
      processRes(res);
      setEditingEntry(null);
      fetchSetting();
    } catch (error) {
      logger.error('SettingsManager', 'Failed to edit entry:', error);
      toast.error(`Failed to edit ${setting.name}`);
    }
  };

  const handleReorderEntry = async () => {
    try {
      let sendFields: any[] = [];
      for (let fields of entries) {
        let _sendFields: { [key: string]: unknown } = {};
        for (let column of setting.columns) {
          if (column.primary_key) {
            let entry = fields[column.id];
            if (entry === undefined) {
              toast.error(`Missing primary key field ${column.id} for reorder`);
              return;
            }
            _sendFields[column.id] = entry;
          }
        }
        _sendFields[setting.index_by || ''] = fields[setting.index_by || ''] || 0;
        sendFields.push(_sendFields);
      }

      sendFields = await validateOperation('Reorder', sendFields);
      const res = await fetcher.reorderEntries(setting, sendFields);
      processRes(res);
      fetchSetting();
      setIsReordered(false);
    } catch (error) {
      logger.error('SettingsManager', 'Failed to reorder entries:', error);
      toast.error(`Failed to reorder ${setting.name}`);
    }
  };

  const handleAddNew = () => {
    setNewEntry(defaultNew(setting));
    setShowNewEntryForm(true);
  };

  const handleReorder = (newEntries: any[]) => {
    newEntries.forEach((entry, index) => {
      if (setting.index_by) {
        entry[setting.index_by] = index + 1;
      }
    });
    setEntries(newEntries);
    setIsReordered(true);
  };

  useEffect(() => {
    fetchSetting();
  }, [guildId, fetcher]);

  return (
    <div className="space-y-4">
      <SettingsErrorDisplay 
        loadErrors={loadErrors} 
        onRetry={fetchSetting} 
      />
      
      <SettingsHeader 
        settingName={setting.name} 
        onAddNew={handleAddNew} 
      />

      {showNewEntryForm && (
        <SettingsForm
          columns={setting.columns}
          values={newEntry}
          onChange={setNewEntry}
          onSave={handleAddEntry}
          onCancel={() => setShowNewEntryForm(false)}
          operation="Create"
          guildData={guildData}
          settingName={setting.name}
        />
      )}

      {editingEntry && (
        <SettingsForm
          columns={setting.columns}
          values={editingEntry}
          onChange={setEditingEntry}
          onSave={handleSaveEdit}
          onCancel={() => setEditingEntry(null)}
          operation="Update"
          guildData={guildData}
          settingName={setting.name}
        />
      )}

      {entries?.length > 0 && setting.operations.includes('View') && (
        <>
          {setting.index_by ? (
            <SettingsReorderableList
              entries={entries}
              onReorder={handleReorder}
              onEdit={setEditingEntry}
              onDelete={handleDeleteEntry}
              onSaveOrder={handleReorderEntry}
              isReordered={isReordered}
              indexBy={setting.index_by}
            />
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <SettingsEntry
                  key={index}
                  entry={entry}
                  index={index}
                  onEdit={setEditingEntry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          )}
        </>
      )}

      <SettingsFooter footerText={setting.footer?.end_text} />
    </div>
  );
};