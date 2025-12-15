
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { User, Building2, GraduationCap, Upload, Eye, EyeOff, CheckCircle, ArrowRight, ArrowLeft, Star, ShieldCheck } from 'lucide-react';
import { BackButton } from '../components/BackButton';

// --- FIELD CONFIGURATIONS (Kept same as before) ---
interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'date' | 'select' | 'textarea' | 'file' | 'number';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  section?: 'mandatory' | 'optional';
  halfWidth?: boolean;
}

const roleFields: Record<UserRole, FieldConfig[]> = {
  individual: [
    { name: 'lastName', label: 'Nom', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'firstName', label: 'Prénom', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'email', label: 'Email', type: 'email', required: true, section: 'mandatory' },
    { name: 'password', label: 'Mot de passe', type: 'password', required: true, section: 'mandatory', halfWidth: true },
    { name: 'confirmPassword', label: 'Confirmer', type: 'password', required: true, section: 'mandatory', halfWidth: true },
    { name: 'phone', label: 'Téléphone', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'nin', label: 'NIN', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'birthDate', label: 'Date de naiss.', type: 'date', required: true, section: 'mandatory', halfWidth: true },
    { name: 'birthPlace', label: 'Lieu de naiss.', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'location', label: 'Pays / Ville', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'gender', label: 'Genre', type: 'select', options: ['Masculin', 'Féminin'], required: true, section: 'mandatory', halfWidth: true },
    { name: 'status', label: 'Statut', type: 'select', options: ['Étudiant', 'En recherche', 'Employé', 'Entrepreneur'], required: true, section: 'mandatory' },
    // Optionals
    { name: 'avatar', label: 'Photo de profil', type: 'file', section: 'optional' },
    { name: 'skills', label: 'Compétences', type: 'text', placeholder: 'Ex: Java, Marketing...', section: 'optional' },
    { name: 'bio', label: 'Biographie', type: 'textarea', placeholder: 'Courte présentation...', section: 'optional' }
  ],
  company: [
    { name: 'companyName', label: 'Nom de l’entreprise', type: 'text', required: true, section: 'mandatory' },
    { name: 'companyType', label: 'Type', type: 'select', options: ['Startup', 'PME', 'Grande Ent.', 'Agence'], required: true, section: 'mandatory', halfWidth: true },
    { name: 'sector', label: 'Secteur', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'email', label: 'Email Pro', type: 'email', required: true, section: 'mandatory' },
    { name: 'password', label: 'Mot de passe', type: 'password', required: true, section: 'mandatory', halfWidth: true },
    { name: 'confirmPassword', label: 'Confirmer', type: 'password', required: true, section: 'mandatory', halfWidth: true },
    { name: 'phone', label: 'Téléphone', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'location', label: 'Siège', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'address', label: 'Adresse', type: 'text', required: true, section: 'mandatory' },
    { name: 'repName', label: 'Représentant', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'repPost', label: 'Poste', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    // Optionals
    { name: 'logo', label: 'Logo', type: 'file', section: 'optional' },
    { name: 'website', label: 'Site web', type: 'text', section: 'optional' },
    { name: 'description', label: 'Description', type: 'textarea', section: 'optional' }
  ],
  etablissement: [
    { name: 'schoolName', label: 'Nom Établissement', type: 'text', required: true, section: 'mandatory' },
    { name: 'schoolType', label: 'Type', type: 'select', options: ['École', 'Université', 'Centre', 'Institut'], required: true, section: 'mandatory', halfWidth: true },
    { name: 'domains', label: 'Domaines', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'email', label: 'Email Admin', type: 'email', required: true, section: 'mandatory' },
    { name: 'password', label: 'Mot de passe', type: 'password', required: true, section: 'mandatory', halfWidth: true },
    { name: 'confirmPassword', label: 'Confirmer', type: 'password', required: true, section: 'mandatory', halfWidth: true },
    { name: 'phone', label: 'Téléphone', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'location', label: 'Localisation', type: 'text', required: true, section: 'mandatory', halfWidth: true },
    { name: 'repName', label: 'Responsable', type: 'text', required: true, section: 'mandatory' },
    // Optionals
    { name: 'logo', label: 'Logo', type: 'file', section: 'optional' },
    { name: 'website', label: 'Site web', type: 'text', section: 'optional' },
    { name: 'description', label: 'Description', type: 'textarea', section: 'optional' }
  ],
  admin: [],
  institution: []
};

export const Register: React.FC = () => {
  const { register, login, isLoading } = useAuth(); // Create register from AuthContext
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('individual');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormData({});
  }, [selectedRole]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0];
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    if (selectedRole && acceptTerms) {
      if (!register) {
        console.error("Register function missing in AuthContext");
        return;
      }

      try {
        // 1. Register User
        await register(formData.email, formData.password, selectedRole);

        // 2. Upload File if present
        const fileField = selectedRole === 'individual' ? 'avatar' : 'logo';
        const file = formData[fileField];

        if (file instanceof File) {
          const token = localStorage.getItem('access_token');
          const uploadData = new FormData();
          uploadData.append('file', file);

          await fetch(`${import.meta.env.VITE_API_URL}/profiles/avatar`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: uploadData
          });
        }

        navigate('/reseaux');
      } catch (error) {
        console.error("Registration error", error);
        // Toast is handled in AuthContext usually
      }
    }
  };

  const rolesList = [
    { id: 'individual', label: 'Particulier', icon: User, desc: 'Trouvez un emploi, formez-vous et développez votre réseau.' },
    { id: 'company', label: 'Entreprise', icon: Building2, desc: 'Recrutez les meilleurs talents et proposez vos services.' },
    { id: 'etablissement', label: 'Établissement', icon: GraduationCap, desc: 'Gérez vos étudiants et publiez vos formations.' },
  ];

  // Config for current form
  const currentFields = roleFields[selectedRole];
  const mandatoryFields = currentFields.filter(f => f.section === 'mandatory');
  const optionalFields = currentFields.filter(f => f.section === 'optional');

  const renderField = (field: FieldConfig) => {
    const commonClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all placeholder-gray-400 text-sm";

    return (
      <div key={field.name} className={`${field.halfWidth ? 'col-span-1' : 'col-span-2'} animate-fade-in-up`}>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>

        {field.type === 'select' ? (
          <div className="relative">
            <select
              name={field.name}
              required={field.required}
              className={`${commonClasses} appearance-none cursor-pointer`}
              onChange={handleChange}
              value={formData[field.name] || ''}
            >
              <option value="">Sélectionner...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        ) : field.type === 'textarea' ? (
          <textarea
            name={field.name}
            rows={3}
            className={commonClasses}
            placeholder={field.placeholder}
            required={field.required}
            onChange={handleChange}
            value={formData[field.name] || ''}
          />
        ) : field.type === 'file' ? (
          <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all cursor-pointer group block">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium pb-1">{field.placeholder || "Cliquez pour uploader"}</p>
            {formData[field.name] && <p className="text-xs text-primary-600 font-bold">{(formData[field.name] as File).name}</p>}
            <input
              type="file"
              className="hidden"
              name={field.name}
              onChange={handleChange}
              accept="image/*"
            />
          </label>
        ) : (
          <div className="relative">
            <input
              type={field.name.includes('password') ? (showPassword ? 'text' : 'password') : field.type}
              name={field.name}
              className={commonClasses}
              placeholder={field.placeholder}
              required={field.required}
              onChange={handleChange}
              value={formData[field.name] || ''}
            />
            {field.name.includes('password') && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left Side - Hero (Sticky) */}
      <div className="hidden xl:flex xl:w-5/12 relative bg-primary-900 h-screen sticky top-0 overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/80 to-transparent"></div>

        {/* Blobs */}
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-primary-500/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-secondary-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white mb-12">
            <img src="/logo.png" alt="Jom Solution" className="w-12 h-12 object-contain bg-white/10 backdrop-blur rounded-lg border border-white/20 p-1" />
            <span className="text-2xl font-bold tracking-tight">JOM SOLUTION</span>
          </Link>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Rejoignez la communauté des leaders de demain.
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-md">
            Créez votre compte aujourd'hui et accédez à des milliers d'opportunités, de formations et de connexions professionnelles.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => <img key={i} className="w-10 h-10 rounded-full border-2 border-primary-900" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />)}
            </div>
            <div>
              <div className="flex text-yellow-400 text-sm"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
              <p className="text-white text-sm font-medium">Rejoint par +10,000 pros</p>
            </div>
          </div>
          <p className="text-primary-200 text-xs">© 2024 Jom Solution. Tous droits réservés.</p>
        </div>
      </div>

      {/* Right Side - Scrollable Form */}
      <div className="flex-1 flex flex-col min-h-screen relative bg-white dark:bg-gray-900">
        <div className="absolute top-6 right-6 lg:top-10 lg:right-10 z-20 flex items-center gap-4">
          <p className="text-sm text-gray-500 hidden sm:block">Déjà membre ?</p>
          <Link to="/login" className="px-5 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Connexion
          </Link>
        </div>

        <div className="absolute top-6 left-6 lg:hidden z-20">
          <BackButton />
        </div>

        <div className="flex-1 flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-16 xl:px-24 max-w-3xl mx-auto w-full">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {step === 2 && (
                <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <span className="text-sm font-bold text-primary-600 tracking-wider uppercase">Étape {step} sur 2</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
              {step === 1 ? 'Choisissez votre profil' : 'Finalisez votre inscription'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {step === 1 ? 'Sélectionnez le type de compte qui correspond à vos besoins.' : `Remplissez vos informations en tant que ${rolesList.find(r => r.id === selectedRole)?.label}.`}
            </p>
          </div>

          {step === 1 ? (
            <div className="grid gap-4 mt-4 animate-fade-in-up">
              {rolesList.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id as UserRole)}
                    className="group relative flex items-start p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-xl transition-all text-left bg-white dark:bg-gray-800"
                  >
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl mr-5 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                        {role.label}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                        {role.desc}
                      </p>
                    </div>
                    <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="w-6 h-6 text-primary-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <form className="space-y-8 animate-fade-in-up" onSubmit={handleRegister}>
              {/* Mandatory Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" /> Informations requises
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  {mandatoryFields.map(renderField)}
                </div>
              </div>

              {/* Optional Section */}
              {optionalFields.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-500" /> Informations complémentaires
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    {optionalFields.map(renderField)}
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                    Je confirme avoir lu et accepté les <Link to="/legal" className="text-primary-600 hover:text-primary-500 underline font-bold">Termes et Conditions</Link> ainsi que la Politique de Confidentialité.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !acceptTerms}
                className="w-full py-4 px-6 rounded-xl shadow-lg shadow-primary-500/30 text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all font-bold text-lg flex items-center justify-center gap-2"
              >
                {isLoading ? 'Création du compte...' : 'Créer mon compte'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
