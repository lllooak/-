import React, { useState } from 'react';
import { format, addDays, isSameDay, isAfter, isBefore } from 'date-fns';
import { Clock } from 'lucide-react';

interface ScheduleSelectorProps {
  availableSlots: {
    date: Date;
    times: string[];
  }[];
  onSelect: (date: Date, time: string) => void;
}

export function ScheduleSelector({ availableSlots, onSelect }: ScheduleSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onSelect(selectedDate, time);
    }
  };

  const getAvailableTimesForDate = (date: Date) => {
    const slot = availableSlots.find((slot) => isSameDay(slot.date, date));
    return slot ? slot.times : [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date</h3>
        <div className="grid grid-cols-7 gap-2">
          {availableSlots.map((slot) => (
            <button
              key={slot.date.toISOString()}
              onClick={() => handleDateSelect(slot.date)}
              className={`
                p-4 rounded-lg text-center transition-colors
                ${
                  selectedDate && isSameDay(selectedDate, slot.date)
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              <div className="text-sm font-medium">
                {format(slot.date, 'EEE')}
              </div>
              <div className="text-lg font-semibold">
                {format(slot.date, 'd')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time</h3>
          <div className="grid grid-cols-3 gap-3">
            {getAvailableTimesForDate(selectedDate).map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`
                  p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors
                  ${
                    selectedTime === time
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }
                `}
              >
                <Clock className="h-4 w-4" />
                <span>{time}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
