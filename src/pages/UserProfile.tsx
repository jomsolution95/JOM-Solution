
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Experience, Education, Skill, SocialPost } from '../types';
import { FeedPost } from '../components/FeedPost';
import api from '../api/client';
import { MapPin, Globe, Briefcase, GraduationCap, Plus, MessageCircle, Share2, Linkedin, Github, Twitter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';

export const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [similarProfiles, setSimilarProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    // Determine the ID to load: param ID or current user ID
    const targetId = userId || currentUser?.id || currentUser?._id;

    if (targetId) {
      loadProfile(targetId);
      loadSimilarProfiles();
      loadFollowStatus(targetId);
      loadFollowersCount(targetId);
    } else {
      // If no ID at all, and no current user, we can't show anything.
      // Usually protected route prevents this, but for safety:
      setLoading(false);
      setError("Impossible d'identifier le profil à afficher.");
    }
  }, [userId, currentUser]);

  const loadProfile = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Logic to determine if we are viewing "me" without an ID (optional, usually router handles /profile/me) 
      // but here we just use the ID from params.
      const response = await api.get(`/profiles/user/${id}`);
      const data = response.data;

      // Map Backend Profile to Frontend UI format
      const formattedProfile = {
        id: data.user?._id || data._id, // Handle populated user
        name: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Utilisateur',
        role: (data.user?.roles && data.user.roles[0]) ? data.user.roles[0] : 'individual',
        avatar: data.avatarUrl?.startsWith('/')
          ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${data.avatarUrl}`
          : (data.avatarUrl || `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}`),
        headline: data.bio?.substring(0, 50) || (data.user?.roles?.includes('company') ? 'Entreprise' : 'Membre JOM'),
        location: data.location || 'Localisation non renseignée',
        about: data.bio || '',
        website: data.companyDetails?.website,
        experience: data.experience?.map((e: any) => ({
          id: e._id || Math.random().toString(),
          title: e.title,
          company: e.organization,
          startDate: e.startDate ? new Date(e.startDate).getFullYear() : '',
          endDate: e.endDate ? new Date(e.endDate).getFullYear() : '',
          current: !e.endDate,
          description: e.description,
          location: ''
        })) || [],
        education: data.education?.map((e: any) => ({
          id: e._id || Math.random().toString(),
          school: e.school,
          degree: e.degree,
          field: '',
          startDate: '',
          endDate: e.year
        })) || [],
        skills: data.skills?.map((s: string) => ({ name: s, endorsements: 0 })) || [],
        socialLinks: data.socialLinks || data.user?.socialLinks || {},
        banner: data.coverUrl?.startsWith('/')
          ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${data.coverUrl}`
          : (data.coverUrl || null)
      };

      setProfile(formattedProfile);
    } catch (err) {
      console.warn("Full profile not found, trying basic user info...", err);
      try {
        // Fallback: Try to fetch basic User data if Profile document is missing
        const userResponse = await api.get(`/users/${id}`);
        const u = userResponse.data;

        const fallbackProfile = {
          id: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Utilisateur',
          role: u.roles?.[0] || 'individual',
          avatar: `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=random`,
          headline: u.roles?.includes('company') ? 'Entreprise' : 'Nouveau membre',
          location: 'Non renseigné',
          about: '',
          skills: [],
          experience: [],
          education: []
        };
        setProfile(fallbackProfile);
      } catch (userErr) {
        console.error("User also not found", userErr);
        setError("Profil introuvable.");
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFollowStatus = async (id: string) => {
    if (!currentUser) return;
    try {
      const res = await api.get(`/cvtheque/favorites/${id}/check`);
      setIsFollowing(res.data.isFavorite);
    } catch (err) {
      console.error('Error checking follow status', err);
    }
  };

  const loadFollowersCount = async (id: string) => {
    try {
      const res = await api.get(`/cvtheque/followers/${id}/count`);
      setFollowersCount(res.data.count);
    } catch (err) {
      console.error('Error loading followers count', err);
    }
  };

  const loadSimilarProfiles = async () => {
    try {
      // Just fetch recent profiles as "Similar" for now
      const response = await api.get('/profiles?limit=3');
      const profiles = response.data.data.map((p: any) => ({
        id: p.user?._id,
        name: `${p.firstName} ${p.lastName}`,
        avatar: p.avatarUrl || `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}`,
        headline: p.bio?.substring(0, 30) || 'Membre JOM'
      }));
      setSimilarProfiles(profiles);
    } catch (e) {
      console.log("Error loading similar profiles", e);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (isFollowing) {
        await api.delete(`/cvtheque/favorites/${profile.id}`);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await api.post('/cvtheque/favorites', { profileId: profile.id });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Action failed', err);
    }
  };

  const handleMessage = async () => {
    if (!profile) return;
    try {
      // Create conversation
      const res = await api.post('/messaging/conversations', {
        participants: [profile.id]
      });
      navigate(`/messaging/${res.data._id}`);
    } catch (err) {
      console.error('Failed to start conversation', err);
      // Fallback: navigate to messaging root
      navigate('/messaging');
    }
  };

  const userPosts: SocialPost[] = []; // TODO: Fetch user specific posts if API supports it (e.g. /posts?author=ID)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Profil introuvable</h2>
        <p className="text-gray-500 mb-6">{error || "Cet utilisateur n'existe pas."}</p>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] dark:bg-black/95 pb-12">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm mb-4">
        <div className="max-w-5xl mx-auto relative">

          {/* Back Button */}
          <div className="absolute top-4 left-4 z-20">
            <BackButton className="bg-white/80 dark:bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm hover:bg-white dark:hover:bg-black/70 text-gray-800 dark:text-gray-200 mb-0" />
          </div>

          {/* Banner */}
          <div className="h-48 w-full relative bg-gray-200 dark:bg-gray-700 overflow-hidden md:rounded-b-xl">
            {profile.banner ? (
              <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary-500 to-secondary-500"></div>
            )}
            <button className="absolute top-4 right-4 bg-white/80 dark:bg-black/50 p-2 rounded-full hover:bg-white transition-colors">
              <Share2 className="w-5 h-5 text-gray-700 dark:text-white" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row items-start justify-between">
              <div className="relative -mt-16 mb-4 md:mb-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white object-cover shadow-md"
                />
                {currentUser?._id !== profile.id && currentUser?.id !== profile.id && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1 md:ml-6 mt-2 md:mt-4 space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {profile.name}
                  <span className="text-xs font-normal px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 capitalize">
                    {profile.role === 'company' ? 'Entreprise' : profile.role === 'etablissement' ? 'Établissement' : 'Particulier'}
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium">{profile.headline}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                  {profile.website && <span className="flex items-center gap-1 text-primary-600"><Globe className="w-4 h-4" /> <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="hover:underline">Site web</a></span>}

                  {/* Social Links */}
                  {profile.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors"><Linkedin className="w-5 h-5" /></a>
                  )}
                  {profile.socialLinks?.github && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                  )}
                  {profile.socialLinks?.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors"><Twitter className="w-5 h-5" /></a>
                  )}

                  <span className="flex items-center gap-1 text-primary-600 font-medium cursor-pointer hover:underline ml-auto md:ml-0">{followersCount} relations</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4 md:mt-4">
                {currentUser?._id !== profile.id && currentUser?.id !== profile.id ? (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-primary-600 text-white hover:bg-primary-700'} px-6 py-1.5 rounded-full font-bold transition-colors flex items-center gap-2`}
                    >
                      {isFollowing ? 'Suivi' : <><Plus className="w-5 h-5" /> Suivre</>}
                    </button>
                    <button
                      onClick={handleMessage}
                      className="border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-6 py-1.5 rounded-full font-bold transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" /> Message
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/settings')}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-1.5 rounded-full font-bold transition-colors"
                  >
                    Modifier le profil
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 mt-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'posts' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                Activité
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'about' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                À propos
              </button>
              {profile.role === 'individual' && (
                <>
                  <button onClick={() => setActiveTab('experience')} className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'experience' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>Expérience</button>
                  <button onClick={() => setActiveTab('education')} className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'education' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>Formation</button>
                </>
              )}
              {(profile.role === 'company' || profile.role === 'etablissement') && (
                <button onClick={() => setActiveTab('services')} className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'services' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>
                  {profile.role === 'etablissement' ? 'Formations' : 'Services'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: Main Info */}
        <div className="md:col-span-2 space-y-4">

          {/* About Section */}
          {(activeTab === 'about' || activeTab === 'posts') && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">À propos</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {profile.about || "Aucune description disponible."}
              </p>
            </div>
          )}

          {/* Experience Section (Individual) */}
          {activeTab === 'experience' && profile.role === 'individual' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Expérience</h3>
              <div className="space-y-6">
                {profile.experience?.map((exp: Experience, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{exp.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{exp.company} • {exp.current ? 'Temps plein' : ''}</p>
                      <p className="text-xs text-gray-500 mt-1">{exp.startDate} - {exp.current ? 'Aujourd\'hui' : exp.endDate}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{exp.description}</p>
                    </div>
                  </div>
                ))}
                {(!profile.experience || profile.experience.length === 0) && <p className="text-gray-500 italic">Aucune expérience renseignée.</p>}
              </div>
            </div>
          )}

          {/* Education Section (Individual) */}
          {activeTab === 'education' && profile.role === 'individual' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Formation</h3>
              <div className="space-y-6">
                {profile.education?.map((edu: Education, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{edu.school}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{edu.degree}, {edu.field}</p>
                      <p className="text-xs text-gray-500 mt-1">{edu.startDate} - {edu.endDate}</p>
                    </div>
                  </div>
                ))}
                {(!profile.education || profile.education.length === 0) && <p className="text-gray-500 italic">Aucune formation renseignée.</p>}
              </div>
            </div>
          )}

          {/* Activity Feed */}
          {activeTab === 'posts' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">Activité récente</h3>
              {userPosts.length > 0 ? (
                userPosts.map((post, idx) => (
                  <FeedPost key={idx} post={post} />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-500">Aucune publication récente.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-4">
          {/* Skills (All types) */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: Skill, idx: number) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 flex items-center gap-2">
                    {skill.name}
                    <span className="text-xs bg-primary-100 text-primary-700 px-1.5 rounded-full">{skill.endorsements}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Profiles */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Autres profils</h3>
            <div className="space-y-4">
              {similarProfiles.map((p: any) => (
                <div key={p.id} className="flex gap-3 items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded transition-colors" onClick={() => navigate(`/profile/${p.id}`)}>
                  <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.headline}</div>
                  </div>
                </div>
              ))}
              {similarProfiles.length === 0 && <p className="text-sm text-gray-500">Aucune suggestion.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
