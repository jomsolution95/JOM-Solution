# Application Tracking Integration Guide

## Backend Integration

### 1. Add Timeline and Messages to Application Schema

```typescript
// In your Application schema
{
  // ... existing fields
  
  status: {
    type: String,
    enum: ['sent', 'viewed', 'in_progress', 'rejected', 'interview', 'accepted'],
    default: 'sent',
  },
  
  timeline: [{
    status: String,
    date: Date,
    description: String,
  }],
  
  messages: [{
    from: { type: Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
  
  viewedAt: Date,
  lastUpdated: { type: Date, default: Date.now },
  
  // Follow-up tracking
  followUpCount: { type: Number, default: 0 },
  lastFollowUpAt: Date,
  canFollowUp: { type: Boolean, default: true },
}
```

### 2. Create Application Tracking Endpoints

```typescript
// applications.controller.ts

/**
 * Get user's applications with timeline
 */
@Get('user')
@UseGuards(JwtAuthGuard)
async getUserApplications(@Request() req: any) {
  const applications = await this.applicationsService.getUserApplications(
    req.user.userId
  );
  return { applications };
}

/**
 * Send follow-up to recruiter (Premium)
 */
@Post(':id/follow-up')
@UseGuards(JwtAuthGuard)
async sendFollowUp(@Request() req: any, @Param('id') id: string) {
  // Check premium status
  const hasPremium = await this.premiumService.verifyPlan(
    req.user.userId,
    [SubscriptionPlan.INDIVIDUAL_PREMIUM, SubscriptionPlan.INDIVIDUAL_PLUS]
  );
  
  if (!hasPremium) {
    throw new ForbiddenException('Premium subscription required');
  }
  
  await this.applicationsService.sendFollowUp(id, req.user.userId);
  return { success: true };
}
```

### 3. Application Service Methods

```typescript
// applications.service.ts

async getUserApplications(userId: string | Types.ObjectId) {
  return this.applicationModel
    .find({ userId: new Types.ObjectId(userId) })
    .populate('jobId', 'title companyName location')
    .populate('messages.from', 'name')
    .sort({ appliedAt: -1 });
}

async updateStatus(
  applicationId: string | Types.ObjectId,
  status: string,
  description?: string
) {
  const application = await this.applicationModel.findById(applicationId);
  
  if (!application) {
    throw new NotFoundException('Application not found');
  }
  
  // Add to timeline
  application.timeline.push({
    status,
    date: new Date(),
    description: description || `Statut changé en ${status}`,
  });
  
  application.status = status;
  application.lastUpdated = new Date();
  
  if (status === 'viewed') {
    application.viewedAt = new Date();
  }
  
  return await application.save();
}

async sendFollowUp(
  applicationId: string | Types.ObjectId,
  userId: string | Types.ObjectId
) {
  const application = await this.applicationModel.findOne({
    _id: applicationId,
    userId: new Types.ObjectId(userId),
  });
  
  if (!application) {
    throw new NotFoundException('Application not found');
  }
  
  // Check if can follow up (max 1 per week)
  if (application.lastFollowUpAt) {
    const daysSinceLastFollowUp = 
      (Date.now() - application.lastFollowUpAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastFollowUp < 7) {
      throw new BadRequestException(
        `Vous pouvez relancer dans ${Math.ceil(7 - daysSinceLastFollowUp)} jours`
      );
    }
  }
  
  // Send notification to recruiter
  await this.notificationModel.create({
    userId: application.jobId.companyId,
    type: 'application_follow_up',
    title: 'Relance de candidature',
    message: `Un candidat a relancé sa candidature pour ${application.jobId.title}`,
    data: {
      applicationId: application._id,
      jobId: application.jobId._id,
    },
  });
  
  // Update application
  application.followUpCount += 1;
  application.lastFollowUpAt = new Date();
  application.canFollowUp = false; // Will be reset after 7 days
  
  application.timeline.push({
    status: 'follow_up',
    date: new Date(),
    description: 'Relance envoyée au recruteur',
  });
  
  await application.save();
}
```

### 4. Automatic Status Updates

```typescript
// When recruiter views application
async markAsViewed(applicationId: string) {
  await this.updateStatus(applicationId, 'viewed', 'Candidature consultée par le recruteur');
}

// When recruiter changes status
async updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  message?: string
) {
  const application = await this.updateStatus(applicationId, newStatus, message);
  
  // Send notification to candidate
  await this.notificationModel.create({
    userId: application.userId,
    type: 'application_status_update',
    title: 'Mise à jour de candidature',
    message: `Votre candidature pour ${application.jobId.title} est maintenant "${newStatus}"`,
    data: {
      applicationId: application._id,
      status: newStatus,
    },
  });
  
  return application;
}
```

## Frontend Usage

### 1. Import and Use Component

```typescript
import { MyApplications } from '../pages/MyApplications';

// In your router
<Route path="/my-applications" element={<MyApplications />} />
```

### 2. Status Flow

```
sent → viewed → in_progress → interview → accepted
                            ↓
                        rejected
```

### 3. Timeline Events

Timeline automatically tracks:
- Application submission
- Status changes
- Recruiter views
- Follow-ups sent
- Messages received

### 4. Follow-up Rules

- **Premium only** feature
- Maximum 1 follow-up per 7 days
- Sends notification to recruiter
- Tracked in timeline
- Counter displayed

## Automatic Follow-up (Premium)

### Cron Job for Reminders

```typescript
// In a scheduled service
@Cron('0 9 * * *') // Every day at 9 AM
async sendFollowUpReminders() {
  // Find applications that haven't been updated in 7 days
  const staleApplications = await this.applicationModel.find({
    status: { $in: ['sent', 'viewed'] },
    lastUpdated: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    userId: { $in: await this.getPremiumUsers() },
  });
  
  for (const app of staleApplications) {
    // Send reminder to user
    await this.notificationModel.create({
      userId: app.userId,
      type: 'follow_up_reminder',
      title: 'Relancez votre candidature',
      message: `Votre candidature pour ${app.jobId.title} n'a pas été mise à jour depuis 7 jours`,
      data: { applicationId: app._id },
    });
  }
}
```

## Statistics

Track application metrics:

```typescript
async getApplicationStats(userId: string) {
  const applications = await this.applicationModel.find({ userId });
  
  return {
    total: applications.length,
    byStatus: {
      sent: applications.filter(a => a.status === 'sent').length,
      viewed: applications.filter(a => a.status === 'viewed').length,
      in_progress: applications.filter(a => a.status === 'in_progress').length,
      interview: applications.filter(a => a.status === 'interview').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    },
    responseRate: (applications.filter(a => a.status !== 'sent').length / applications.length) * 100,
    averageResponseTime: calculateAverageResponseTime(applications),
  };
}
```

## Testing

1. Create test applications with different statuses
2. Test status transitions
3. Test follow-up with/without premium
4. Verify timeline updates
5. Check message display
6. Test filters

## Environment Variables

No additional environment variables required.
