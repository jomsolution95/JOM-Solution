import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
    jobsApi,
    servicesApi,
    profilesApi,
    applicationsApi,
    ordersApi,
    messagingApi,
    notificationsApi,
    usersApi,
} from '../api/services';
import { handleApiSuccess } from '../api/errorHandler';

// Query Keys
export const queryKeys = {
    jobs: ['jobs'] as const,
    job: (id: string) => ['jobs', id] as const,
    jobApplications: (id: string) => ['jobs', id, 'applications'] as const,

    services: ['services'] as const,
    service: (id: string) => ['services', id] as const,

    profiles: ['profiles'] as const,
    profile: (id: string) => ['profiles', id] as const,
    profileByUser: (userId: string) => ['profiles', 'user', userId] as const,

    applications: ['applications'] as const,
    application: (id: string) => ['applications', id] as const,

    orders: ['orders'] as const,
    order: (id: string) => ['orders', id] as const,

    conversations: ['conversations'] as const,
    conversation: (id: string) => ['conversations', id] as const,
    messages: (conversationId: string) => ['conversations', conversationId, 'messages'] as const,

    notifications: ['notifications'] as const,
    notificationCount: ['notifications', 'count'] as const,

    currentUser: ['users', 'me'] as const,
};

// Jobs Hooks
export const useJobs = (params?: any, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: [...queryKeys.jobs, params],
        queryFn: () => jobsApi.getJobs(params),
        ...options,
    });
};

export const useJob = (id: string, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.job(id),
        queryFn: () => jobsApi.getJob(id),
        enabled: !!id,
        ...options,
    });
};

export const useCreateJob = (options?: UseMutationOptions<any, any, any>) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: jobsApi.createJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
            handleApiSuccess('Job created successfully!');
        },
        ...options,
    });
};

export const useUpdateJob = (options?: UseMutationOptions<any, any, { id: string; data: any }>) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => jobsApi.updateJob(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
            queryClient.invalidateQueries({ queryKey: queryKeys.job(variables.id) });
            handleApiSuccess('Job updated successfully!');
        },
        ...options,
    });
};

export const useDeleteJob = (options?: UseMutationOptions<any, any, string>) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: jobsApi.deleteJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
            handleApiSuccess('Job deleted successfully!');
        },
        ...options,
    });
};

// Services Hooks
export const useServices = (params?: any, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: [...queryKeys.services, params],
        queryFn: () => servicesApi.getServices(params),
        ...options,
    });
};

export const useService = (id: string, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.service(id),
        queryFn: () => servicesApi.getService(id),
        enabled: !!id,
        ...options,
    });
};

export const useCreateService = (options?: UseMutationOptions<any, any, any>) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: servicesApi.createService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.services });
            handleApiSuccess('Service created successfully!');
        },
        ...options,
    });
};

export const useUpdateService = (options?: UseMutationOptions<any, any, { id: string; data: any }>) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => servicesApi.updateService(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.services });
            queryClient.invalidateQueries({ queryKey: queryKeys.service(variables.id) });
            handleApiSuccess('Service updated successfully!');
        },
        ...options,
    });
};

// Profiles Hooks
export const useProfiles = (params?: any, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: [...queryKeys.profiles, params],
        queryFn: () => profilesApi.getProfiles(params),
        ...options,
    });
};

export const useProfile = (id: string, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.profile(id),
        queryFn: () => profilesApi.getProfile(id),
        enabled: !!id,
        ...options,
    });
};

export const useUpdateProfile = (options?: UseMutationOptions<any, any, { id: string; data: any }>) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => profilesApi.updateProfile(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
            queryClient.invalidateQueries({ queryKey: queryKeys.profile(variables.id) });
            handleApiSuccess('Profile updated successfully!');
        },
        ...options,
    });
};

// Applications Hooks
export const useApplications = (params?: any, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: [...queryKeys.applications, params],
        queryFn: () => applicationsApi.getApplications(params),
        ...options,
    });
};

export const useCreateApplication = (options?: UseMutationOptions<any, any, any>) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: applicationsApi.createApplication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.applications });
            handleApiSuccess('Application submitted successfully!');
        },
        ...options,
    });
};

// Orders Hooks
export const useOrders = (params?: any, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: [...queryKeys.orders, params],
        queryFn: () => ordersApi.getOrders(params),
        ...options,
    });
};

export const useOrder = (id: string, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.order(id),
        queryFn: () => ordersApi.getOrder(id),
        enabled: !!id,
        ...options,
    });
};

// Messaging Hooks
export const useConversations = (options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.conversations,
        queryFn: messagingApi.getConversations,
        ...options,
    });
};

export const useMessages = (conversationId: string, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.messages(conversationId),
        queryFn: () => messagingApi.getMessages(conversationId),
        enabled: !!conversationId,
        ...options,
    });
};

export const useSendMessage = (options?: UseMutationOptions<any, any, { conversationId: string; content: string }>) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId, content }) => messagingApi.sendMessage(conversationId, { content }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.messages(variables.conversationId) });
        },
        ...options,
    });
};

// Notifications Hooks
export const useNotifications = (options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.notifications,
        queryFn: notificationsApi.getNotifications,
        ...options,
    });
};

export const useNotificationCount = (options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.notificationCount,
        queryFn: notificationsApi.getUnreadCount,
        refetchInterval: 30000, // Refetch every 30 seconds
        ...options,
    });
};

// User Hooks
export const useCurrentUser = (options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.currentUser,
        queryFn: usersApi.getMe,
        ...options,
    });
};
