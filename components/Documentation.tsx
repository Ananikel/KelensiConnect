import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { DocArticle, Attachment } from '../types';
import SearchIcon from './icons/SearchIcon';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import CloseIcon from './icons/CloseIcon';
import DocumentationIcon from './icons/DocumentationIcon';
import CameraIcon from './icons/CameraIcon';
import FileIcon from './icons/FileIcon';
import DownloadIcon from './icons/DownloadIcon';

interface DocumentationProps {
    articles: DocArticle[];
    onSaveArticle: (article: DocArticle) => void;
    onDeleteArticle: (articleId: string) => void;
    selectedArticleId: string | null;
    setSelectedArticleId: (id: string | null) => void;
}

interface ArticleModalProps {
    article: DocArticle | null;
    onClose: () => void;
    onSave: (article: DocArticle) => void;
    categories: string[];
}

interface DeleteModalProps {
    article: DocArticle;
    onClose: () => void;
    onConfirm: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, onSave, categories }) => {
    const [title, setTitle] = useState(article?.title || '');
    const [category, setCategory] = useState(article?.category || '');
    const [content, setContent] = useState(article?.content || '');
    const [attachments, setAttachments] = useState<Attachment[]>(article?.attachments || []);

    // Camera state
    const [isCameraOn, setIsCameraOn] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const handleCancelCamera = useCallback(() => {
        stopCamera();
        setIsCameraOn(false);
    }, [stopCamera]);

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const handleStartCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOn(true);
        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
            alert("Impossible d'accéder à la caméra. Veuillez vérifier les autorisations de votre navigateur.");
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            const video = videoRef.current;
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const newImage = canvasRef.current.toDataURL('image/jpeg');
            const newAttachment: Attachment = {
                name: `capture-${Date.now()}.jpg`,
                type: 'image/jpeg',
                url: newImage
            };
            setAttachments(prev => [...prev, newAttachment]);
            handleCancelCamera();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newAttachment: Attachment = {
                    name: file.name,
                    type: file.type,
                    url: e.target?.result as string
                };
                setAttachments(prev => [...prev, newAttachment]);
            };
            reader.readAsDataURL(file);
        });
        
        if(e.target) e.target.value = '';
    };

    const handleRemoveAttachment = (indexToRemove: number) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const articleId = article?.id || title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        onSave({
            id: articleId,
            title,
            category,
            content,
            attachments,
            lastModified: new Date().toISOString(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{article ? 'Modifier l\'article' : 'Créer un article'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><CloseIcon /></button>
                </div>
                <form id="article-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="doc-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
                        <input type="text" id="doc-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                    </div>
                    <div>
                        <label htmlFor="doc-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
                        <input list="doc-categories" id="doc-category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                        <datalist id="doc-categories">
                            {categories.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>
                    <div>
                        <label htmlFor="doc-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contenu</label>
                        <textarea id="doc-content" value={content} onChange={e => setContent(e.target.value)} rows={10} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 font-mono text-sm" placeholder="Vous pouvez utiliser des sauts de ligne pour la mise en forme." required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pièces jointes</label>
                        <div className="mt-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                           {isCameraOn ? (
                                <div className="space-y-3">
                                    <div className="bg-black rounded-lg overflow-hidden">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto"></video>
                                    </div>
                                    <div className="flex justify-center space-x-4">
                                        <button type="button" onClick={handleCapture} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            Capturer
                                        </button>
                                        <button type="button" onClick={handleCancelCamera} className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-4">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">Ajouter un fichier</button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden"/>
                                        <button type="button" onClick={handleStartCamera} className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">Prendre une photo</button>
                                    </div>
                                    {attachments.length > 0 && (
                                       <div className="mt-4 space-y-2">
                                           {attachments.map((att, index) => (
                                               <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                                   <div className="flex items-center min-w-0">
                                                       {att.type.startsWith('image/') ? (
                                                            <img src={att.url} alt={att.name} className="w-8 h-8 object-cover rounded-md mr-2"/>
                                                       ) : (
                                                            <div className="w-8 h-8 flex-shrink-0 mr-2 text-gray-500 dark:text-gray-400"><FileIcon/></div>
                                                       )}
                                                       <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{att.name}</span>
                                                   </div>
                                                   <button type="button" onClick={() => handleRemoveAttachment(index)} className="text-red-500 hover:text-red-700 ml-2" aria-label="Supprimer pièce jointe">
                                                        <DeleteIcon/>
                                                   </button>
                                               </div>
                                           ))}
                                       </div>
                                   )}
                                </>
                           )}
                           <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                    </div>
                </form>
                <div className="mt-auto bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end space-x-3 border-t dark:border-gray-700 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500">Annuler</button>
                    <button type="submit" form="article-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Enregistrer</button>
                </div>
            </div>
        </div>
    );
};

const DeleteModal: React.FC<DeleteModalProps> = ({ article, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Confirmer la suppression</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Êtes-vous sûr de vouloir supprimer l'article <strong>"{article.title}"</strong> ?</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500">Annuler</button>
                <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Supprimer</button>
            </div>
        </div>
    </div>
);

const Documentation: React.FC<DocumentationProps> = ({ articles, onSaveArticle, onDeleteArticle, selectedArticleId, setSelectedArticleId }) => {
    const sortedArticles = useMemo(() => [...articles].sort((a,b) => a.title.localeCompare(b.title)), [articles]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [articleToEdit, setArticleToEdit] = useState<DocArticle | null>(null);
    const [articleToDelete, setArticleToDelete] = useState<DocArticle | null>(null);

    const filteredArticles = useMemo(() => {
        if (!searchTerm) return sortedArticles;
        return sortedArticles.filter(a =>
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedArticles, searchTerm]);

    const articlesByCategory = useMemo(() => {
        return filteredArticles.reduce((acc, article) => {
            (acc[article.category] = acc[article.category] || []).push(article);
            return acc;
        }, {} as Record<string, DocArticle[]>);
    }, [filteredArticles]);

    const allCategories = useMemo(() => [...new Set(articles.map(a => a.category))].sort(), [articles]);
    
    const selectedArticle = useMemo(() => {
        const found = articles.find(a => a.id === selectedArticleId);
        if (found && !filteredArticles.some(fa => fa.id === found.id)) {
            setSelectedArticleId(null);
            return undefined;
        }
        return found;
    }, [articles, selectedArticleId, filteredArticles, setSelectedArticleId]);
    
    const handleOpenCreateModal = () => {
        setArticleToEdit(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (article: DocArticle) => {
        setArticleToEdit(article);
        setModalOpen(true);
    };

    const handleSave = (articleData: DocArticle) => {
        onSaveArticle(articleData);
        setModalOpen(false);
        if (!articleToEdit) {
            setSelectedArticleId(articleData.id);
        }
    };
    
    const handleDeleteConfirm = () => {
        if (articleToDelete) {
            onDeleteArticle(articleToDelete.id);
            if (selectedArticleId === articleToDelete.id) {
                const remainingArticles = articles.filter(a => a.id !== articleToDelete.id);
                setSelectedArticleId(remainingArticles.length > 0 ? remainingArticles[0].id : null);
            }
            setArticleToDelete(null);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex h-[calc(100vh-8.5rem)] md:h-[calc(100vh-10rem)] overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Rechercher un article..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                        </div>
                        <button onClick={handleOpenCreateModal} className="w-full flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <PlusIcon /><span className="ml-2">Créer un article</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <nav className="space-y-4">
                            {Object.entries(articlesByCategory).map(([category, articlesInCategory]) => (
                                <div key={category}>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{category}</h3>
                                    <ul className="space-y-1">
                                        {articlesInCategory.map(article => (
                                            <li key={article.id}>
                                                <button onClick={() => setSelectedArticleId(article.id)} className={`w-full text-left p-2 rounded-md text-sm font-medium transition-colors ${selectedArticleId === article.id ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                    {article.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                    {selectedArticle ? (
                        <>
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{selectedArticle.title}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Dernière modification le {new Date(selectedArticle.lastModified).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                                        <button onClick={() => handleOpenEditModal(selectedArticle)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Modifier"><EditIcon /></button>
                                        <button onClick={() => setArticleToDelete(selectedArticle)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Supprimer"><DeleteIcon /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" style={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedArticle.content}
                                </div>
                                {selectedArticle.attachments && selectedArticle.attachments.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pièces Jointes</h4>
                                        <div className="space-y-3">
                                            {selectedArticle.attachments.map((att, index) => (
                                                <a href={att.url} download={att.name} key={index} className="flex items-center p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                                    <div className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-400 flex-shrink-0"><FileIcon/></div>
                                                    <span className="flex-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{att.name}</span>
                                                    <div className="w-5 h-5 ml-3 text-gray-500"><DownloadIcon/></div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-8">
                           <div className="w-16 h-16 text-gray-400"><DocumentationIcon /></div>
                            <h3 className="mt-4 text-xl font-semibold">Centre d'aide</h3>
                            <p className="mt-1 max-w-md">
                                {filteredArticles.length === 0 && searchTerm ?
                                'Aucun article ne correspond à votre recherche.' :
                                'Sélectionnez un article dans le menu de gauche pour l\'afficher, ou créez un nouvel article pour commencer.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <ArticleModal article={articleToEdit} onClose={() => setModalOpen(false)} onSave={handleSave} categories={allCategories} />}
            {articleToDelete && <DeleteModal article={articleToDelete} onClose={() => setArticleToDelete(null)} onConfirm={handleDeleteConfirm} />}
        </>
    );
};

export default Documentation;