import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import { adminAPI } from '../../services/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => { adminAPI.getSettings().then(({ data }) => setSettings(data.settings)); }, []);

  const update = async (key, value) => {
    await adminAPI.updateSetting({ setting_key: key, setting_value: value });
    setMsg({ type: 'success', text: 'Setting updated.' });
    adminAPI.getSettings().then(({ data }) => setSettings(data.settings));
  };

  return (
    <DashboardLayout>
      <h1 className="font-display font-bold text-3xl mb-8">System Settings</h1>
      {msg && <Alert type={msg.type} message={msg.text} />}
      <div className="admin-settings-card">
        {settings.map((s) => (
          <div key={s.setting_key} className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="font-medium capitalize">{s.setting_key.replace('_', ' ')}</p>
              <p className="text-sm text-gray-500">{s.setting_value}</p>
            </div>
          </div>
        ))}
        <p className="text-sm text-gray-400">Weather API: Open-Meteo → Node.js → Python Flask (port 5001)</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
