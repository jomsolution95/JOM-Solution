/**
 * ANALYTICS USAGE EXAMPLES
 * 
 * These are code examples showing how to integrate analytics tracking.
 * Copy the relevant tracking calls into your actual components.
 * 
 * Note: These examples assume you have the following functions in your app:
 * - processPayment(), submitApplication(), likePost(), sharePost()
 * - navigate() from react-router-dom
 * - toast from react-toastify
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { trackPremiumConversion } from '../utils/analytics';
import { trackHotjarPremiumUpgrade } from '../utils/hotjar';
import { trackApplicationSubmit } from '../utils/analytics';
import { trackHotjarATSInteraction } from '../utils/hotjar';
import { trackSocialEngagement } from '../utils/analytics';
import { trackHotjarSocialEngagement } from '../utils/hotjar';
import { trackProfileView } from '../utils/analytics';
import { trackHotjarProfileView } from '../utils/hotjar';

// Example: Tracking Premium Conversion
export const PremiumCheckoutExample = () => {
    const navigate = useNavigate();

    const handlePaymentSuccess = async (plan: string, price: number) => {
        // Your payment processing logic here
        // await processPayment(plan, price);

        // Track conversion in GA4
        trackPremiumConversion(plan, price);

        // Track in Hotjar
        trackHotjarPremiumUpgrade(plan);

        // Redirect to success page
        navigate('/premium/success');
    };

    return (
        <button onClick={() => handlePaymentSuccess('monthly', 5000)}>
            Complete Purchase
        </button>
    );
};

// Example: Tracking Job Application
export const JobApplicationExample = () => {
    const handleSubmit = async (jobId: string, jobTitle: string) => {
        // Your application submission logic here
        // await submitApplication(jobId);

        // Track in GA4
        trackApplicationSubmit(jobId, jobTitle);

        // Track in Hotjar
        trackHotjarATSInteraction('apply');

        toast.success('Application submitted!');
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit('job123', 'Senior Developer');
        }}>
            {/* Form fields */}
            <button type="submit">Submit Application</button>
        </form>
    );
};

// Example: Tracking Social Engagement
interface Post {
    id: string;
    title: string;
}

export const PostCardExample = ({ post }: { post: Post }) => {
    const handleLike = async () => {
        // Your like logic here
        // await likePost(post.id);

        // Track engagement
        trackSocialEngagement('like', 'post', post.id);
        trackHotjarSocialEngagement('like');
    };

    const handleShare = async () => {
        // Your share logic here
        // await sharePost(post.id);

        // Track engagement
        trackSocialEngagement('share', 'post', post.id);
        trackHotjarSocialEngagement('share');
    };

    return (
        <div>
            <button onClick={handleLike}>Like</button>
            <button onClick={handleShare}>Share</button>
        </div>
    );
};

// Example: Tracking Profile Views
export const UserProfileExample = ({ userId }: { userId: string }) => {
    useEffect(() => {
        // Track profile view when component mounts
        trackProfileView(userId, 'user');
        trackHotjarProfileView('user');
    }, [userId]);

    return <div>{/* Profile content */}</div>;
};
