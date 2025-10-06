

import React, { useState, useCallback } from 'react';
import { Member, Role } from '../types';
import CloseIcon from './icons/CloseIcon';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';

interface DataImportModalProps {
    onClose: () => void;
    onImport: (newMembers: Member[]) => void;
    roles: Role[];
}

type ImportStep = 'upload' | 'preview' | 'success';

const REQUIRED_HEADERS = ['name', 'email', 'phone', 'joinDate', 'birthDate', 'status', 'descendance', 'role'];

const DataImportModal: React.FC<DataImportModalProps> = ({ onClose, onImport, roles }) => {
    const [step, setStep] = useState<ImportStep>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [parsedData, setParsedData] = useState<Member[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const resetState = () => {
        setStep('upload');
        setFile(null);
        setIsLoading(false);
        setParsedData([]);
        setErrors([]);
    };

    const parseCSV = (csvText: string): { validMembers: Member[], errors: string[] } => {
        const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return { validMembers: [], errors: ["Le fichier est vide ou ne contient que l'en-tête."] };

        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const localErrors: string[] = [];
        
        const missingHeaders = REQUIRED_HEADERS.filter(rh => !header.includes(rh));
        if (missingHeaders.length > 0) {
            return { validMembers: [], errors: [`En-têtes manquants ou incorrects : ${missingHeaders.join(', ')}`] };
        }
        
        const headerIndexMap = REQUIRED_HEADERS.reduce((acc, h) => {
            acc[h] = header.indexOf(h);
            return acc;
        }, {} as Record<string, number>);
        
        const defaultMemberRoleId = roles.find(r => r.id === 'member')?.id || roles[0]?.id || '';

        const validMembers = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            if (values.length !== header.length) {
                localErrors.push(`Ligne ${index + 2}: Nombre de colonnes incorrect.`);
                return null;
            }
            try {
                const status = values[headerIndexMap['status']];
                if (status !== 'Actif' && status !== 'Inactif') throw new Error('Statut invalide');

                const roleName = values[headerIndexMap['role']];
                const foundRole = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
                if (!foundRole) {
                    localErrors.push(`Ligne ${index + 2}: Rôle "${roleName}" non trouvé. Assignation du rôle par défaut.`);
                }
                const roleId = foundRole ? foundRole.id : defaultMemberRoleId;

                const member: Member = {
                    id: Date.now() + index, // Temporary unique ID
                    name: values[headerIndexMap['name']],
                    email: values[headerIndexMap['email']],
                    phone: values[headerIndexMap['phone']],
                    joinDate: new Date(values[headerIndexMap['joinDate']]).toISOString(),
                    birthDate: new Date(values[headerIndexMap['birthDate']]).toISOString(),
                    status: status as 'Actif' | 'Inactif',
                    descendance: values[headerIndexMap['descendance']],
                    roleId: roleId,
                    avatar: `https://ui-avatars.com/api/?name=${values[headerIndexMap['name']].replace(' ', '+')}&background=random`,
                };
                if (!member.name || !member.email) throw new Error("Nom ou email manquant");
                return member;
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Erreur inconnue';
                localErrors.push(`Ligne ${index + 2}: Données invalides ou mal formatées (${message}).`);
                return null;
            }
        }).filter((m): m is Member => m !== null);

        return { validMembers, errors: localErrors };
    };

    const handleFileProcess = (selectedFile: File) => {
        if (selectedFile.type !== 'text/csv') {
            setErrors(["Type de fichier invalide. Veuillez sélectionner un fichier CSV."]);
            return;
        }
        setFile(selectedFile);
        setIsLoading(true);
        setErrors([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const { validMembers, errors: parseErrors } = parseCSV(text);
            if(validMembers.length > 0) {
                 setParsedData(validMembers);
            }
            setErrors(parseErrors);
            setIsLoading(false);
            setStep('preview');
        };
        reader.onerror = () => {
             setErrors(["Erreur lors de la lecture du fichier."]);
             setIsLoading(false);
        };
        reader.readAsText(selectedFile);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
        }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileProcess(e.dataTransfer.files[0]);
        }
    };
    
    const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragOver(true);
        else if (e.type === 'dragleave') setIsDragOver(false);
    };

    const handleConfirmImport = () => {
        onImport(parsedData);
        setStep('success');
    };

    const handleDownloadTemplate = () => {
        const csvContent = REQUIRED_HEADERS.join(',') + '\n' +
        'Exemple Nom,exemple@email.com,99887766,2024-01-15,1990-05-20,Actif,Exemple,Membre';
        
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'template_import_membres.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderUploadStep = () => (
        <>
             <div className="p-6 space-y-4">
                 <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/50 rounded-md">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">Instructions</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                        Le fichier CSV doit contenir les colonnes suivantes dans n'importe quel ordre : {REQUIRED_HEADERS.join(', ')}.
                    </p>
                     <button onClick={handleDownloadTemplate} className="mt-3 flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                         <DownloadIcon /> <span className="ml-2">Télécharger le modèle</span>
                     </button>
                </div>
                 <label htmlFor="csv-upload" className={`relative block w-full h-48 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 ${isDragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600'}`}
                    onDrop={handleDrop} onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents}
                 >
                    <div className="flex flex-col items-center justify-center h-full">
                        <UploadIcon />
                        <span className="mt-2 block text-sm font-semibold text-gray-900 dark:text-gray-200">
                           {isDragOver ? "Relâchez pour importer" : "Glissez-déposez un fichier ici"}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">ou cliquez pour sélectionner (CSV uniquement)</span>
                    </div>
                     <input type="file" id="csv-upload" accept=".csv" onChange={handleFileChange} className="sr-only" />
                 </label>
            </div>
             <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500">
                    Annuler
                </button>
            </div>
        </>
    );

    const renderPreviewStep = () => (
        <>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Aperçu de l'importation</h4>
                 <div className={`p-3 rounded-md ${parsedData.length > 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'}`}>
                    <p className="font-medium">{parsedData.length} membre(s) valide(s) prêt(s) à être importé(s).</p>
                </div>
                {errors.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
                        <p className="font-medium text-red-800 dark:text-red-200">{errors.length} erreur(s) ou avertissement(s) trouvé(s) :</p>
                        <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 mt-1 max-h-24 overflow-y-auto">
                            {errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}
                {parsedData.length > 0 && (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">Nom</th>
                                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
                                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">Rôle</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800">
                                {parsedData.slice(0, 5).map((member, i) => (
                                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="p-2 text-gray-900 dark:text-gray-200">{member.name}</td>
                                        <td className="p-2 text-gray-900 dark:text-gray-200">{member.email}</td>
                                        <td className="p-2 text-gray-900 dark:text-gray-200">{roles.find(r => r.id === member.roleId)?.name || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 5 && <p className="text-center text-xs p-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">...et {parsedData.length - 5} autre(s)</p>}
                    </div>
                )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
                 <button type="button" onClick={resetState} className="px-4 py-2 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500">
                    Retour
                </button>
                 <div className="space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500">
                        Annuler
                    </button>
                    <button type="button" onClick={handleConfirmImport} disabled={parsedData.length === 0} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                        Confirmer l'importation
                    </button>
                </div>
            </div>
        </>
    );

    const renderSuccessStep = () => (
         <div className="p-6 text-center">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
                 <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
             </div>
             <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mt-4">Importation terminée</h4>
             <p className="text-gray-600 dark:text-gray-400 mt-1">{parsedData.length} membre(s) ont été préparé(s) pour l'ajout.</p>
             <button onClick={onClose} className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Fermer
             </button>
         </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Importer des membres depuis un fichier CSV</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><CloseIcon /></button>
                </div>
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <>
                        {step === 'upload' && renderUploadStep()}
                        {step === 'preview' && renderPreviewStep()}
                        {step === 'success' && renderSuccessStep()}
                    </>
                )}
            </div>
        </div>
    );
};

export default DataImportModal;