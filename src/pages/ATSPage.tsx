import React, { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Users, Briefcase, Filter, Plus } from 'lucide-react';
import { ApplicationCard } from '../components/ApplicationCard';
import { KanbanColumn } from '../components/KanbanColumn';
import { InterviewCalendar } from '../components/InterviewCalendar';
import api from '../api/client';
import { toast } from 'react-toastify';

export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface Application {
    _id: string;
    candidateName: string;
    candidateEmail: string;
    candidatePhone?: string;
    candidateAvatar?: string;
    jobTitle: string;
    jobId: string;
    status: ApplicationStatus;
    appliedDate: string;
    resumeUrl?: string;
    coverLetterUrl?: string;
    interviewDate?: string;
    notes?: string;
    rating?: number;
}

const statusColumns: { id: ApplicationStatus; label: string; color: string }[] = [
    { id: 'applied', label: 'Reçu', color: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'screening', label: 'En examen', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'interview', label: 'Entretien', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { id: 'offer', label: 'Offre', color: 'bg-purple-100 dark:bg-purple-900/30' },
    { id: 'hired', label: 'Recruté', color: 'bg-green-100 dark:bg-green-900/30' },
    { id: 'rejected', label: 'Refusé', color: 'bg-red-100 dark:bg-red-900/30' },
];

export const ATSPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [filterJob, setFilterJob] = useState<string>('all');

    // Fetch applications
    const { data: applicationsData, isLoading } = useQuery({
        queryKey: ['applications', filterJob],
        queryFn: async () => {
            const params = filterJob !== 'all' ? { jobId: filterJob } : {};
            const response = await api.get('/applications', { params });
            return response.data;
        },
    });

    // Fetch jobs for filter
    const { data: jobsData } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const response = await api.get('/jobs');
            return response.data;
        },
    });

    const applications: Application[] = applicationsData?.data || [];
    const jobs = jobsData?.data || [];

    // Update application status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
            const response = await api.patch(`/applications/${id}/status`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            toast.success('Statut mis à jour avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de la mise à jour');
        },
    });

    // Drag & drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const applicationId = active.id as string;
        const newStatus = over.id as ApplicationStatus;

        // Find the application
        const application = applications.find(app => app._id === applicationId);

        if (application && application.status !== newStatus) {
            // Optimistic update
            queryClient.setQueryData(['applications', filterJob], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((app: Application) =>
                        app._id === applicationId ? { ...app, status: newStatus } : app
                    ),
                };
            });

            // Update on server
            updateStatusMutation.mutate({ id: applicationId, status: newStatus });
        }

        setActiveId(null);
    };

    // Group applications by status
    const applicationsByStatus = statusColumns.reduce((acc, column) => {
        acc[column.id] = applications.filter(app => app.status === column.id);
        return acc;
    }, {} as Record<ApplicationStatus, Application[]>);

    const activeApplication = activeId
        ? applications.find(app => app._id === activeId)
        : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-[1800px] mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Gestion des Recrutements (ATS)
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Pilotez vos processus de recrutement et suivez vos candidats
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${showCalendar
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <Calendar className="w-5 h-5" />
                                Calendrier Entretiens
                            </button>
                        </div>
                    </div>

                    {/* Stats & Filters */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Users className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {applications.length} Candidats
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={filterJob}
                                onChange={(e) => setFilterJob(e.target.value)}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="all">Toutes les offres</option>
                                {jobs.map((job: any) => (
                                    <option key={job._id} value={job._id}>
                                        {job.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Calendar View */}
                {showCalendar && (
                    <div className="mb-8">
                        <InterviewCalendar applications={applications} />
                    </div>
                )}

                {/* Kanban Board */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {statusColumns.map((column) => (
                                <KanbanColumn
                                    key={column.id}
                                    id={column.id}
                                    label={column.label}
                                    color={column.color}
                                    count={applicationsByStatus[column.id]?.length || 0}
                                >
                                    <SortableContext
                                        items={applicationsByStatus[column.id]?.map(app => app._id) || []}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3">
                                            {applicationsByStatus[column.id]?.map((application) => (
                                                <ApplicationCard
                                                    key={application._id}
                                                    application={application}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </KanbanColumn>
                            ))}
                        </div>

                        {/* Drag Overlay */}
                        <DragOverlay>
                            {activeApplication && (
                                <div className="opacity-80">
                                    <ApplicationCard application={activeApplication} />
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>
        </div>
    );
};
