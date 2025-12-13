# Premium Module

## Overview

Complete premium subscription management system with MongoDB schemas, services, and middleware.

## Schemas

### 1. Subscription (`subscription.schema.ts`)
Manages user subscriptions and payment history.

**Fields**:
- `userId`: Reference to User
- `plan`: individual-pro | company-biz | school-edu
- `status`: active | cancelled | expired | trial | suspended
- `startDate`: Subscription start date
- `endDate`: Subscription end date
- `autoRenew`: Auto-renewal flag
- `quotasUsed`: Object tracking quota usage
- `paymentHistory`: Array of payment records
- `price`: Subscription price
- `currency`: Currency (default: FCFA)

### 2. PremiumQuota (`premiumQuotas.schema.ts`)
Tracks monthly quotas for premium features.

**Fields**:
- `userId`: Reference to User
- `quotaType`: cv_views | job_posts | course_uploads | student_slots | boosts
- `used`: Current usage
- `limit`: Maximum allowed
- `periodStart`: Period start date
- `periodEnd`: Period end date
- `unlimited`: Unlimited quota flag

**Methods**:
- `hasQuotaAvailable()`: Check if quota available
- `getRemainingQuota()`: Get remaining quota
- `incrementUsage(amount)`: Increment usage
- `resetQuota()`: Reset to 0

### 3. Boost (`boosts.schema.ts`)
Manages temporary visibility boosts.

**Fields**:
- `userId`: Reference to User
- `type`: profile_star | job_featured | training_featured | etc.
- `targetId`: ID of boosted item
- `startDate`: Boost start date
- `endDate`: Boost end date
- `status`: active | expired | cancelled | pending
- `price`: Boost price
- `analytics`: Views, clicks, conversions

**Methods**:
- `isActive()`: Check if boost is currently active
- `expire()`: Mark as expired

### 4. ProfileView (`profileViews.schema.ts`)
Tracks profile views for analytics.

**Fields**:
- `profileId`: Viewed profile
- `viewerId`: Viewer (optional for anonymous)
- `date`: View date
- `source`: search | recommendation | direct | job_application
- `ipAddress`: Viewer IP
- `metadata`: Additional tracking data

### 5. Certificate (`certificates.schema.ts`)
Manages course completion certificates.

**Fields**:
- `userId`: Certificate recipient
- `courseId`: Completed course
- `code`: Unique certificate code
- `certificateUrl`: PDF URL
- `issueDate`: Issue date
- `status`: issued | revoked | expired
- `blockchainHash`: Blockchain verification (optional)

**Methods**:
- `isValid()`: Check if certificate is valid
- `revoke()`: Revoke certificate

### 6. TrainingContent (`trainingContent.schema.ts`)
Manages course content (videos, PDFs, quizzes).

**Fields**:
- `institutionId`: Content owner
- `courseId`: Parent course
- `title`: Content title
- `type`: video | pdf | quiz | document | audio
- `url`: Content URL
- `duration`: Duration in seconds
- `status`: draft | published | archived
- `quizQuestions`: Array of quiz questions

### 7. StudentProgress (`studentProgress.schema.ts`)
Tracks student progress through courses.

**Fields**:
- `studentId`: Student reference
- `courseId`: Course reference
- `progress`: Progress percentage (0-100)
- `completed`: Completion flag
- `moduleProgress`: Array of module progress
- `quizAttempts`: Array of quiz attempts
- `totalTimeSpent`: Total time in seconds

**Methods**:
- `updateProgress()`: Recalculate progress
- `completeModule(moduleId)`: Mark module as complete

## Service (`premium.service.ts`)

### Core Methods

#### Subscription Management
```typescript
hasActiveSubscription(userId): Promise<boolean>
getActiveSubscription(userId): Promise<Subscription>
verifyPlan(userId, requiredPlan): Promise<boolean>
```

#### Quota Management
```typescript
hasQuotaAvailable(userId, quotaType): Promise<boolean>
getRemainingQuota(userId, quotaType): Promise<number>
incrementQuota(userId, quotaType, amount): Promise<void>
initializeQuotas(userId, plan): Promise<void>
resetMonthlyQuotas(userId): Promise<void>
getUserQuotas(userId): Promise<object>
```

#### Access Control
```typescript
canPerformAction(userId, requiredPlan, quotaType?): Promise<{allowed, reason?}>
```

#### Boost Management
```typescript
getActiveBoosts(targetId): Promise<Boost[]>
hasActiveBoost(targetId, boostType?): Promise<boolean>
expireOldBoosts(): Promise<void>
```

## Guard (`guards/premium.guard.ts`)

### Decorators

#### `@RequiresPremium(options)`
Protect routes with premium requirement.

```typescript
@RequiresPremium({
  plan: SubscriptionPlan.COMPANY_BIZ,
  quotaType: QuotaType.CV_VIEWS,
  autoIncrement: true
})
@Get('cv-database')
async getCVDatabase() {
  // Only accessible to Company Biz subscribers
  // Automatically increments CV_VIEWS quota
}
```

#### Simplified Decorators
```typescript
@RequiresIndividualPro()
@RequiresCompanyBiz()
@RequiresSchoolEdu()
```

#### With Quota
```typescript
@RequiresPremiumWithQuota(
  SubscriptionPlan.COMPANY_BIZ,
  QuotaType.JOB_POSTS,
  true // auto-increment
)
@Post('jobs')
async createJob() {
  // Checks subscription AND quota
  // Auto-increments job post count
}
```

## Controller (`premium.controller.ts`)

### Endpoints

```
GET    /premium/status                  - Get subscription status
GET    /premium/subscription            - Get subscription details
GET    /premium/quotas                  - Get all quotas
GET    /premium/quotas/:type            - Get specific quota
POST   /premium/check-access            - Check if can perform action
POST   /premium/verify-plan             - Verify plan
GET    /premium/boosts/:targetId        - Get active boosts
GET    /premium/boosts/:targetId/check  - Check if has boost
```

## Plan Quotas

### Individual Pro (4,900 FCFA/month)
- Boosts: 3/month
- No CV views, job posts, or course uploads

### Company Biz (29,900 FCFA/month)
- CV Views: 50/month
- Job Posts: 10/month
- Boosts: 5/month

### School Edu (49,900 FCFA/month)
- Course Uploads: Unlimited
- Student Slots: Unlimited
- Boosts: 3/month

## Usage Examples

### Protect a Route
```typescript
@Controller('jobs')
export class JobsController {
  @Post()
  @RequiresPremiumWithQuota(
    SubscriptionPlan.COMPANY_BIZ,
    QuotaType.JOB_POSTS,
    true
  )
  async createJob(@Body() dto: CreateJobDto) {
    // Only Company Biz subscribers can create jobs
    // Automatically increments job post quota
    return this.jobsService.create(dto);
  }
}
```

### Check Access Programmatically
```typescript
const result = await this.premiumService.canPerformAction(
  userId,
  SubscriptionPlan.COMPANY_BIZ,
  QuotaType.CV_VIEWS
);

if (!result.allowed) {
  throw new ForbiddenException(result.reason);
}
```

### Get User Quotas
```typescript
const quotas = await this.premiumService.getUserQuotas(userId);
// Returns:
// {
//   cv_views: { used: 10, limit: 50, remaining: 40, periodEnd: Date },
//   job_posts: { used: 2, limit: 10, remaining: 8, periodEnd: Date }
// }
```

### Track Profile View
```typescript
await this.profileViewModel.create({
  profileId: targetUserId,
  viewerId: currentUserId,
  source: 'search',
  metadata: { searchQuery: 'developer' }
});
```

## Integration with App Module

Add to `app.module.ts`:

```typescript
import { PremiumModule } from './modules/premium/premium.module';

@Module({
  imports: [
    // ... other modules
    PremiumModule,
  ],
})
export class AppModule {}
```

## Cron Jobs (Recommended)

### Reset Monthly Quotas
```typescript
@Cron('0 0 1 * *') // First day of month at midnight
async resetAllQuotas() {
  const users = await this.userModel.find({ isPremium: true });
  for (const user of users) {
    await this.premiumService.resetMonthlyQuotas(user._id);
  }
}
```

### Expire Old Boosts
```typescript
@Cron('0 * * * *') // Every hour
async expireBoosts() {
  await this.premiumService.expireOldBoosts();
}
```

## Testing

```bash
# Unit tests
npm run test premium.service.spec.ts

# E2E tests
npm run test:e2e premium.e2e-spec.ts
```
