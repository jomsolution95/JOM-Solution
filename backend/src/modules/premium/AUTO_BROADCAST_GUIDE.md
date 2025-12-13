# Auto-Broadcast Integration Guide

## Backend Integration

### 1. Add fields to Job Schema

```typescript
// In your Job schema
{
  autoBroadcast: {
    type: Boolean,
    default: false,
  },
  broadcasted: {
    type: Boolean,
    default: false,
  },
  broadcastedAt: {
    type: Date,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  featuredUntil: {
    type: Date,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
}
```

### 2. Update Job Creation Endpoint

```typescript
// In jobs.controller.ts
@Post()
async createJob(@Body() dto: CreateJobDto, @Request() req: any) {
  // Check if user has premium plan
  const hasPremium = await this.premiumService.verifyPlan(
    req.user.userId,
    [SubscriptionPlan.COMPANY_STANDARD, SubscriptionPlan.COMPANY_BIZ]
  );

  const job = await this.jobsService.create({
    ...dto,
    companyId: req.user.userId,
    isPremium: hasPremium,
    autoBroadcast: hasPremium ? dto.autoBroadcast : false,
  });

  return { job };
}
```

### 3. Register JobBroadcastService

The service is already registered in PremiumModule. Make sure to import the required models:

```typescript
// In premium.module.ts
MongooseModule.forFeature([
  // ... existing schemas
  { name: 'Job', schema: JobSchema },
  { name: 'Post', schema: PostSchema },
  { name: 'Notification', schema: NotificationSchema },
])
```

## Frontend Integration

### 1. Add to Job Creation Form

```typescript
import { AutoBroadcastToggle } from '../components/AutoBroadcastToggle';

function JobCreateForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    // ... other fields
    autoBroadcast: false,
  });

  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check user's premium status
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const response = await api.get('/premium/status');
      setIsPremium(response.data.isPremium);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  return (
    <form>
      {/* ... other form fields */}

      {/* Auto-Broadcast Toggle */}
      <AutoBroadcastToggle
        enabled={formData.autoBroadcast}
        onChange={(enabled) => setFormData({ ...formData, autoBroadcast: enabled })}
        isPremium={isPremium}
      />

      {/* Submit button */}
    </form>
  );
}
```

### 2. Display Broadcast Stats

```typescript
import { BarChart3, Users, Heart, MessageCircle } from 'lucide-react';

function JobBroadcastStats({ jobId }: { jobId: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, [jobId]);

  const loadStats = async () => {
    try {
      const response = await api.get(`/jobs/broadcast/${jobId}/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!stats?.broadcasted) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4">Statistiques de Diffusion</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Notifications</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {stats.notificationsSent}
          </p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">J'aime</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.socialEngagement?.likes || 0}
          </p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Commentaires</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {stats.socialEngagement?.comments || 0}
          </p>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Partages</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {stats.socialEngagement?.shares || 0}
          </p>
        </div>
      </div>

      {stats.featuredUntil && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⭐ En vedette jusqu'au {new Date(stats.featuredUntil).toLocaleDateString('fr-FR')}
          </p>
        </div>
      )}
    </div>
  );
}
```

## Cron Job Configuration

The cron job runs automatically every hour. To customize:

```typescript
// In job-broadcast.service.ts

// Every hour (default)
@Cron(CronExpression.EVERY_HOUR)

// Or customize:
@Cron('0 */2 * * *') // Every 2 hours
@Cron('0 9 * * *')   // Every day at 9 AM
@Cron('0 9 * * 1-5') // Weekdays at 9 AM
```

## Manual Broadcast

To manually trigger broadcast for a specific job:

```typescript
// Frontend
const handleManualBroadcast = async (jobId: string) => {
  try {
    await api.post(`/jobs/broadcast/${jobId}`);
    toast.success('Diffusion lancée avec succès');
  } catch (error) {
    toast.error('Erreur lors de la diffusion');
  }
};
```

## Targeted Notifications

The system automatically finds matching talents based on:
- Skills matching job requirements
- Location proximity
- User preferences (job alerts enabled)
- User role (individual/talent)

To customize matching logic, edit `findMatchingTalents()` in `job-broadcast.service.ts`.

## Testing

1. Create a premium job with `autoBroadcast: true`
2. Wait for next cron execution (or trigger manually)
3. Check:
   - Social network feed for new post
   - Homepage carousel for featured job
   - Notifications for matching users
   - Broadcast stats endpoint

## Environment Variables

No additional environment variables required. The service uses existing database connections.
