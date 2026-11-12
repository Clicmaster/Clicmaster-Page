import React, { useState } from 'react';
import { NEWS_ARTICLES } from '../../data/serverData.ts';
import { NewsItem } from '../../types/index.ts';
import { Heart, Clock, ArrowRight, X, Share2, Check } from 'lucide-react';

export const NewsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [likesState, setLikesState] = useState<Record<string, number>>(
    NEWS_ARTICLES.reduce((acc, item) => ({ ...acc, [item.id]: item.likes }), {})
  );
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const categories = ['Todas', 'Actualización', 'Facciones', 'Eventos', 'Comunidad'];

  const filteredNews =
    selectedCategory === 'Todas'
      ? NEWS_ARTICLES
      : NEWS_ARTICLES.filter((item) => item.category === selectedCategory);

  const handleLike = (articleId: string) => {
    if (hasLiked[articleId]) {
      setLikesState((prev) => ({ ...prev, [articleId]: prev[articleId] - 1 }));
      setHasLiked((prev) => ({ ...prev, [articleId]: false }));
    } else {
      setLikesState((prev) => ({ ...prev, [articleId]: prev[articleId] + 1 }));
      setHasLiked((prev) => ({ ...prev, [articleId]: true }));
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="noticias" className="py-16 sm:py-20 bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#248811] dark:text-[#67F23B] mb-2">
              Boletín Informativo Oficial
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
              Últimas Noticias & Actualizaciones
            </h2>
          </div>

          {/* Category Tabs (Interactive Filter Controls as permitted by constitution) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNews.map((article) => {
            const likes = likesState[article.id] || article.likes;
            const isLiked = !!hasLiked[article.id];

            return (
              <article
                key={article.id}
                className="bg-white dark:bg-[#1A1A1C] rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={article.image}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-md bg-white/95 dark:bg-[#121212]/95 text-neutral-900 dark:text-white backdrop-blur-md shadow-xs">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    {/* Metadata line without pills (Rule 1.A) */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                      <span>{article.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-[#2B6BFF] dark:group-hover:text-[#67F23B] transition-colors leading-snug line-clamp-2 mb-2">
                      {article.title}
                    </h3>

                    <p className="text-xs text-[#7B7B7B] dark:text-neutral-400 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 pb-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleLike(article.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                      isLiked
                        ? 'text-red-500 bg-red-50 dark:bg-red-950/40'
                        : 'text-neutral-500 hover:text-red-500 bg-neutral-50 dark:bg-neutral-800/60'
                    }`}
                    aria-label="Dar me gusta a la noticia"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="tabular-nums">{likes}</span>
                  </button>

                  <button
                    onClick={() => setActiveArticle(article)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2B6BFF] dark:text-[#67F23B] hover:underline"
                  >
                    <span>Leer más</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Full Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1A1A1C] max-w-2xl w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="relative h-60 shrink-0">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#67F23B] text-[#121212] mb-2 inline-block">
                  {activeArticle.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight text-white drop-shadow">
                  {activeArticle.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span>Por {activeArticle.author}</span>
                <span>{activeArticle.date}</span>
              </div>
              <p className="text-base text-neutral-700 dark:text-neutral-200 leading-relaxed">
                {activeArticle.content}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Para más detalles, opiniones ciudadanas o participar en debates sobre este boletín, conéctate a nuestro servidor de Discord en el canal #anuncios-oficiales.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike(activeArticle.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                  <span>{likesState[activeArticle.id] || activeArticle.likes} Apoyos</span>
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? '¡Enlace copiado!' : 'Compartir'}</span>
                </button>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
