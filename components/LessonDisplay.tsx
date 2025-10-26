import React from 'react';
import { LoadingState, GroundingChunk } from '../types';
import Card from './common/Card';

interface LessonDisplayProps {
    lesson: string;
    sources: GroundingChunk[];
    loadingState: LoadingState;
}

// A simple function to convert the expected markdown format to HTML
const renderMarkdown = (text: string) => {
    const lines = text.trim().split('\n');
    const htmlElements: string[] = [];
    let inList = false;

    for (const line of lines) {
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
        
        if (processedLine.startsWith('### ')) {
            htmlElements.push(`<h3 class="text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-white">${processedLine.substring(4)}</h3>`);
        } else if (processedLine.startsWith('> ')) {
            htmlElements.push(`<blockquote class="border-l-4 border-violet-500 pl-4 italic my-4 text-gray-600 dark:text-gray-300">${processedLine.substring(2)}</blockquote>`);
        } else if (processedLine.trim() === '---') {
            htmlElements.push('<hr class="my-6 border-gray-200 dark:border-gray-700" />');
        } else if (processedLine.startsWith('* ')) {
            if (!inList) {
                htmlElements.push('<ul class="space-y-1 my-4">');
                inList = true;
            }
            htmlElements.push(`<li class="ml-5 list-disc">${processedLine.substring(2)}</li>`);
        } else {
            if (inList) {
                htmlElements.push('</ul>');
                inList = false;
            }
            if (processedLine.trim()) {
                htmlElements.push(`<p class="text-gray-700 dark:text-gray-300 my-2">${processedLine}</p>`);
            } else {
                // This creates vertical space between paragraphs or list groups
                htmlElements.push('<div class="h-4"></div>');
            }
        }
    }

    if (inList) {
        htmlElements.push('</ul>');
    }

    return { __html: htmlElements.join('') };
};

const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson, sources, loadingState }) => {

    if (loadingState === LoadingState.GENERATING_TEXT) {
        return (
            <Card className="p-6 text-center">
                <div className="flex justify-center items-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Generando tu lección de japonés...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Esto puede tardar unos segundos. ¡Gracias por tu paciencia!</p>
            </Card>
        );
    }

    if (!lesson) {
        return (
            <Card className="p-6 text-center">
                <p className="text-lg text-gray-600 dark:text-gray-300">Tu lección aparecerá aquí cuando se genere.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 sm:p-8">
                <div className="max-w-none leading-relaxed" dangerouslySetInnerHTML={renderMarkdown(lesson)} />
                {sources && sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Fuentes (Google Search):</h3>
                        <ul className="list-disc list-inside space-y-2">
                            {sources.map((source, index) => (
                                source.web?.uri && (
                                    <li key={index}>
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default LessonDisplay;
