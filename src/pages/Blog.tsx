
import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackButton } from '../components/BackButton';

export const Blog: React.FC = () => {
  const articles = [
    {
      id: 1,
      title: "Comment digitaliser votre PME en 2024 ?",
      excerpt: "Découvrez les étapes clés pour réussir la transition numérique de votre entreprise en Afrique de l'Ouest.",
      author: "Seynabou Diallo",
      date: "12 Oct 2024",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      category: "Business"
    },
    {
      id: 2,
      title: "Les métiers les plus recherchés au Sénégal",
      excerpt: "Analyse des tendances du marché de l'emploi et des compétences qui feront la différence.",
      author: "Moussa Konaté",
      date: "08 Oct 2024",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      category: "Carrière"
    },
    {
      id: 3,
      title: "L'impact du Mobile Money sur l'économie informelle",
      excerpt: "Comment Wave et Orange Money transforment les échanges quotidiens des petits commerçants.",
      author: "Sarah Johnson",
      date: "25 Sep 2024",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80",
      category: "Finance"
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog & Actualités</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Conseils, tendances et actualités de l'écosystème JOM.</p>
        </div>

        {/* Featured Article (First one) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-64 lg:h-auto relative">
                <img src={articles[0].image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="p-8 flex flex-col justify-center">
                <span className="text-primary-600 font-bold text-sm uppercase tracking-wide mb-2">{articles[0].category}</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{articles[0].title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{articles[0].excerpt}</p>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><User className="w-4 h-4"/> {articles[0].author}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {articles[0].date}</span>
                    </div>
                    <Link to="#" className="flex items-center gap-1 text-primary-600 font-bold hover:gap-2 transition-all">
                        Lire <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {articles.slice(1).map((article) => (
               <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                   <div className="h-48 overflow-hidden">
                       <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                   <div className="p-6">
                       <span className="text-xs font-bold text-primary-600 uppercase mb-2 block">{article.category}</span>
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">{article.title}</h3>
                       <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                       <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                           <span>{article.date}</span>
                           <span>{article.author}</span>
                       </div>
                   </div>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
