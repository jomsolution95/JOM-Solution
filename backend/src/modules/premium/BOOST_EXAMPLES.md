# Boost System - Usage Examples

## Backend Integration

### 1. Jobs Controller - Add Boost to Job Listings

```typescript
// backend/src/modules/jobs/jobs.controller.ts
import { BoostService } from '../premium/services/boost.service';
import { BoostType } from '../premium/schemas/boosts.schema';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly boostService: BoostService,
  ) {}

  /**
   * Get all jobs with boosted jobs first
   */
  @Get()
  async getAllJobs(@Query() query: SearchJobsDto) {
    // Get boosted job IDs
    const boostedJobIds = await this.boostService.getBoostedItems('job', BoostType.JOB_FEATURED);
    
    // Fetch jobs with boosted ones prioritized
    const jobs = await this.jobsService.findAll(query, boostedJobIds);
    
    return { jobs };
  }

  /**
   * Get single job and check if boosted
   */
  @Get(':id')
  async getJob(@Param('id') id: string) {
    const job = await this.jobsService.findOne(id);
    const isBoosted = await this.boostService.hasActiveBoost(id, BoostType.JOB_FEATURED);
    
    // Increment boost analytics if boosted
    if (isBoosted) {
      const boosts = await this.boostService.getActiveBoosts(id);
      if (boosts.length > 0) {
        await this.boostService.incrementAnalytics(boosts[0]._id, 'views');
      }
    }
    
    return { job, isBoosted };
  }
}
```

### 2. Profiles/Users Controller - Boosted Profiles

```typescript
// backend/src/modules/profiles/profiles.controller.ts
import { BoostService } from '../premium/services/boost.service';
import { BoostType } from '../premium/schemas/boosts.schema';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly boostService: BoostService,
  ) {}

  /**
   * Search profiles with boosted profiles first (CVthèque)
   */
  @Get('search')
  async searchProfiles(@Query() query: SearchProfilesDto) {
    // Get boosted profile IDs
    const boostedProfileIds = await this.boostService.getBoostedItems('profile', BoostType.PROFILE_STAR);
    
    // Search with boosted profiles prioritized
    const profiles = await this.profilesService.search(query, boostedProfileIds);
    
    return { profiles };
  }
}
```

## Frontend Integration

### 1. Job Detail Page - Add Boost Button

```typescript
// src/pages/JobDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BoostButton } from '../components/BoostButton';
import { BoostPopup } from '../components/BoostPopup';
import api from '../api/client';

export const JobDetail: React.FC = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [isBoosted, setIsBoosted] = useState(false);
  const [showBoostPopup, setShowBoostPopup] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    const response = await api.get(`/jobs/${id}`);
    setJob(response.data.job);
    setIsBoosted(response.data.isBoosted);
  };

  return (
    <div>
      {/* Job Details */}
      <h1>{job?.title}</h1>
      
      {/* Boost Button (only for job owner) */}
      <BoostButton
        onClick={() => setShowBoostPopup(true)}
        isBoosted={isBoosted}
      />

      {/* Boost Popup */}
      {showBoostPopup && (
        <BoostPopup
          targetId={id!}
          targetType="job"
          onClose={() => setShowBoostPopup(false)}
          onSuccess={() => {
            loadJob();
            setShowBoostPopup(false);
          }}
        />
      )}
    </div>
  );
};
```

### 2. User Profile Page - Add Boost Button

```typescript
// src/pages/UserProfile.tsx
import React, { useState } from 'react';
import { BoostButton } from '../components/BoostButton';
import { BoostPopup } from '../components/BoostPopup';

export const UserProfile: React.FC = () => {
  const [showBoostPopup, setShowBoostPopup] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const userId = 'current-user-id';

  return (
    <div>
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <h1>Mon Profil</h1>
        
        <BoostButton
          onClick={() => setShowBoostPopup(true)}
          isBoosted={isBoosted}
          variant="secondary"
        />
      </div>

      {/* Boost Popup */}
      {showBoostPopup && (
        <BoostPopup
          targetId={userId}
          targetType="profile"
          onClose={() => setShowBoostPopup(false)}
          onSuccess={() => {
            setIsBoosted(true);
            setShowBoostPopup(false);
          }}
        />
      )}
    </div>
  );
};
```

### 3. Jobs Listing - Show Boosted Badge

```typescript
// src/pages/Jobs.tsx
import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../api/client';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const response = await api.get('/jobs');
    setJobs(response.data.jobs);
  };

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <div key={job.id} className="relative p-6 bg-white rounded-lg border">
          {/* Boosted Badge */}
          {job.isBoosted && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                <Star className="w-3 h-3 fill-current" />
                À LA UNE
              </div>
            </div>
          )}
          
          <h3 className="text-xl font-bold">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
        </div>
      ))}
    </div>
  );
};
```

### 4. My Boosts Dashboard

```typescript
// src/pages/MyBoosts.tsx
import React, { useEffect, useState } from 'react';
import { Zap, Calendar, TrendingUp } from 'lucide-react';
import api from '../api/client';

export const MyBoosts: React.FC = () => {
  const [boosts, setBoosts] = useState<any[]>([]);

  useEffect(() => {
    loadBoosts();
  }, []);

  const loadBoosts = async () => {
    const response = await api.get('/boosts/my-boosts');
    setBoosts(response.data.boosts);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mes Boosts</h1>
      
      <div className="grid gap-4">
        {boosts.map((boost) => (
          <div key={boost._id} className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">{boost.type}</h3>
                  <p className="text-sm text-gray-500">
                    {boost.status === 'active' ? 'Actif' : 'Expiré'}
                  </p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                boost.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {boost.status}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Début</p>
                <p className="font-medium">
                  {new Date(boost.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Fin</p>
                <p className="font-medium">
                  {new Date(boost.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {boost.analytics && (
              <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    {boost.analytics.views}
                  </p>
                  <p className="text-xs text-gray-500">Vues</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    {boost.analytics.clicks}
                  </p>
                  <p className="text-xs text-gray-500">Clics</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    {boost.analytics.applications}
                  </p>
                  <p className="text-xs text-gray-500">Candidatures</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    {boost.analytics.conversions}
                  </p>
                  <p className="text-xs text-gray-500">Conversions</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## API Endpoints

```
POST   /api/boosts                    - Create boost
GET    /api/boosts/my-boosts          - Get user's boosts
GET    /api/boosts/target/:targetId   - Get boosts for target
GET    /api/boosts/check/:targetId    - Check if target is boosted
POST   /api/boosts/:boostId/activate  - Activate boost after payment
DELETE /api/boosts/:boostId           - Cancel boost
POST   /api/boosts/:boostId/analytics/:metric - Increment analytics
```

## Cron Job

The boost expiration cron job runs automatically every hour:

```typescript
// Runs in BoostService
@Cron(CronExpression.EVERY_HOUR)
async expireOldBoosts(): Promise<void> {
  // Automatically expires boosts past their endDate
}
```

## Boost Prices & Durations

```typescript
PROFILE_STAR: 2,000 FCFA - 7 days
PROFILE_URGENT: 1,000 FCFA - 14 days
JOB_FEATURED: 5,000 FCFA - 7 days
JOB_URGENT: 2,000 FCFA - 14 days
JOB_PUSH_NOTIFICATION: 15,000 FCFA - 1 send
TRAINING_FEATURED: 10,000 FCFA - 15 days
```
