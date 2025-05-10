import React, { useEffect, useState } from 'react';
import { useCreatorStore } from '../stores/creatorStore';
import { DollarSign, Download, Calendar, TrendingUp } from 'lucide-react';
import { EarningsChart } from './EarningsChart';
import { format } from 'date-fns';

export function EarningsPage() {
  const { earnings, initializeRealtime } = useCreatorStore();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    initializeRealtime();
  }, []);

  // Calculate total earnings (only from completed requests)
  const totalEarnings = earnings
    .filter(earning => earning.status === 'completed')
    .reduce((sum, earning) => sum + Number(earning.amount.toFixed(2)), 0);
  
  // Calculate pending earnings (not yet completed)
  const pendingEarnings = earnings
    .filter(earning => earning.status === 'pending')
    .reduce((sum, earning) => sum + Number(earning.amount.toFixed(2)), 0);

  const chartData = {
    labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'],
    earnings: [1200, 1900, 1500, 2200, 1800, 2500],
    bookings: [24, 38, 30, 44, 36, 50],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">הכנסות ותשלומים</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">סך הכל הכנסות</p>
              <p className="text-2xl font-semibold text-gray-900">₪{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">הכנסות בהמתנה</p>
              <p className="text-2xl font-semibold text-gray-900">₪{pendingEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">החודש</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₪{earnings
                  .filter(earning => {
                    const date = new Date(earning.created_at);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && 
                           date.getFullYear() === now.getFullYear() &&
                           earning.status === 'completed'; // Only count completed earnings
                  })
                  .reduce((sum, earning) => sum + Number(earning.amount.toFixed(2)), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">סקירת הכנסות</h2>
            <div className="flex space-x-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="border rounded-lg px-3 py-2 mr-4"
              >
                <option value="weekly">שבועי</option>
                <option value="monthly">חודשי</option>
                <option value="yearly">שנתי</option>
              </select>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="line">גרף קווי</option>
                <option value="bar">גרף עמודות</option>
              </select>
            </div>
          </div>
          <div className="h-96">
            <EarningsChart
              data={chartData}
              type={chartType}
              title={`הכנסות ${timeframe === 'weekly' ? 'שבועיות' : timeframe === 'monthly' ? 'חודשיות' : 'שנתיות'}`}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">היסטוריית תשלומים</h2>
            <button className="flex items-center text-primary-600 hover:text-primary-700">
              <Download className="h-5 w-5 ml-2" />
              ייצוא
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">בקשה</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earnings.map((earning) => (
                <tr key={earning.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(earning.created_at), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {earning.request_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₪{Number(earning.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${earning.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${earning.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${earning.status === 'refunded' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {earning.status === 'completed' ? 'שולם' : 
                       earning.status === 'pending' ? 'בהמתנה' : 
                       earning.status === 'refunded' ? 'הוחזר' : earning.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
