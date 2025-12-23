import React from 'react';
import { useCVStore } from '../../stores/useCVStore';
import { cvTemplates } from '../../templates/cv';
import { ModernPdf } from '../../templates/pdf/ModernPdf';
import { MinimalistPdf } from '../../templates/pdf/MinimalistPdf';
import { CorporatePdf } from '../../templates/pdf/CorporatePdf';
import { CreativePdf } from '../../templates/pdf/CreativePdf';
import { ATSPdf } from '../../templates/pdf/ATSPdf';
import { Font, pdf } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import imageCompression from 'browser-image-compression';

// Register fonts if needed (we used standard fonts so far to avoid async loading issues in browser)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/Roboto-Regular.ttf' });

const PdfComponents: Record<string, React.FC<any>> = {
    'Modern': ModernPdf,
    'Minimalist': MinimalistPdf,
    'Corporate': CorporatePdf,
    'Creative': CreativePdf,
    'ATS': ATSPdf,
};

export const PDFExportButton: React.FC = () => {
    const {
        personalInfo,
        summary,
        experiences,
        education,
        skills,
        languages,
        projects,
        interests,
        selectedTemplateId
    } = useCVStore();

    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleDownload = async () => {
        try {
            setIsGenerating(true);

            // 1. Get Config
            const selectedConfig = cvTemplates.find(t => t.id === selectedTemplateId) || cvTemplates[0];

            // Handle Dynamic Archetype (HTML/Tailwind based)
            if (selectedConfig.archetype === 'Dynamic' && selectedConfig.variantId) {
                const { default: html2canvas } = await import('html2canvas');
                const { jsPDF } = await import('jspdf');
                const { default: CVTemplates } = await import('../../templates/cv/CVTemplates50'); // Dynamic import to avoid cycles or weight
                const { mapStoreToCVData } = await import('../../utils/cvMapper');
                const ReactDOM = await import('react-dom/client');

                // Create a hidden container for rendering
                const container = document.createElement('div');
                container.style.position = 'fixed';
                container.style.left = '-9999px';
                container.style.top = '0';
                container.style.width = '210mm'; // A4 width
                container.style.minHeight = '297mm'; // A4 height
                container.style.backgroundColor = 'white';
                document.body.appendChild(container);

                const cvData = mapStoreToCVData({
                    personalInfo, summary, experiences, education, skills, languages, projects, interests
                } as any);

                // Render the component
                const root = ReactDOM.createRoot(container);
                // Wrap in a div to ensure full height/width capture
                root.render(
                    <div className="w-[210mm] min-h-[297mm] p-0 bg-white" style={{ zoom: 1 }}> {/* Ensure scale is 1 */}
                        <CVTemplates templateId={selectedConfig.variantId} data={cvData} />
                    </div>
                );

                // Wait for render (short timeout usually enough for synchronous React render of simple components)
                await new Promise(resolve => setTimeout(resolve, 500));

                // Capture
                const canvas = await html2canvas(container, {
                    scale: 2, // Retain quality
                    useCORS: true,
                    logging: false
                });

                // Generate PDF
                const pdfDoc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const imgProps = pdfDoc.getImageProperties(imgData);
                const pdfWidth = pdfDoc.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdfDoc.save(`CV-${personalInfo.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'mon_cv'}.pdf`);

                // Cleanup
                root.unmount();
                document.body.removeChild(container);

                toast.success('CV exporté avec succès !');
                return;
            }

            // Legacy PDF (React-PDF)
            const TemplateComponent = PdfComponents[selectedConfig.archetype];

            if (!TemplateComponent) {
                throw new Error('Template PDF non trouvé');
            }

            // Optimize Avatar Image
            let optimizedAvatar = personalInfo.avatar;
            if (personalInfo.avatar && personalInfo.avatar.startsWith('data:image')) {
                try {
                    const res = await fetch(personalInfo.avatar);
                    const blob = await res.blob();
                    const compressedFile = await imageCompression(blob as File, {
                        maxSizeMB: 0.3, // Compressed to ~300KB
                        maxWidthOrHeight: 800,
                        useWebWorker: true
                    });
                    optimizedAvatar = await imageCompression.getDataUrlFromFile(compressedFile);
                } catch (e) {
                    console.warn('Image compression skipped', e);
                }
            }

            // 2. Prepare Data
            const data = {
                personalInfo: { ...personalInfo, avatar: optimizedAvatar },
                summary,
                experiences,
                education,
                skills,
                languages,
                projects,
                interests
            };

            // 3. Generate Blob
            const blob = await pdf(
                <TemplateComponent data={data} config={selectedConfig} />
            ).toBlob();

            // 4. Trigger Download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const safeName = personalInfo.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'mon_cv';
            link.href = url;
            link.download = `CV-${safeName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('CV exporté avec succès !');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Erreur lors de la génération du PDF');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération...
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                </>
            )}
        </button>
    );
};
