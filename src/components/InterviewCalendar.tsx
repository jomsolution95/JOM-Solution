import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Application } from '../pages/ATSPage';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
} from 'date-fns';

interface InterviewCalendarProps {
    applications: Application[];
}

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({ applications }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Get interviews for a specific day
    const getInterviewsForDay = (day: Date) => {
        return applications.filter(
            (app) =>
                app.interviewDate &&
                isSameDay(new Date(app.interviewDate), day) &&
                app.status === 'interview'
        );
    };

    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-primary-600" />
                    Interview Schedule
                </h2>

                <div className="flex items-center gap-4">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[150px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>

                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                        key={day}
                        className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {days.map((day) => {
                    const interviews = getInterviewsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[100px] p-2 rounded-lg border transition-colors ${isCurrentMonth
                                    ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
                                } ${isToday ? 'ring-2 ring-primary-500' : ''
                                }`}
                        >
                            <div
                                className={`text-sm font-medium mb-2 ${isToday
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : isCurrentMonth
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-400 dark:text-gray-600'
                                    }`}
                            >
                                {format(day, 'd')}
                            </div>

                            {/* Interviews */}
                            <div className="space-y-1">
                                {interviews.slice(0, 2).map((app) => (
                                    <div
                                        key={app._id}
                                        className="text-xs p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded truncate"
                                        title={`${app.candidateName} - ${app.jobTitle}`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{app.candidateName}</span>
                                        </div>
                                    </div>
                                ))}

                                {interviews.length > 2 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                                        +{interviews.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-primary-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-primary-100 dark:bg-primary-900/30"></div>
                        <span className="text-gray-600 dark:text-gray-400">Interview Scheduled</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
