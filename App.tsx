
import React, { useState, useCallback } from 'react';
import LessonDisplay from './components/LessonDisplay';
import ImagePrompts from './components/ImagePrompts';
import TabButton from './components/common/TabButton';
import Card from './components/common/Card';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LoadingState, GroundingChunk } from './types';
import { generateLesson } from './services/geminiService';


type Tab = 'lesson' | 'prompts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('lesson');
  
  const [word, setWord] = useState('');
  const [lesson, setLesson] = useState<string>('');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string>('');

  const handleGenerate = useCallback(async () => {
      if (!word.trim()) {
          setError('Por favor, introduce una palabra en japonés.');
          return;
      }
      setError('');
      setLesson('');
      setPrompts([]);
      setSources([]);
      setLoadingState(LoadingState.GENERATING_TEXT);
      setActiveTab('lesson');

      try {
          const { lesson: lessonText, prompts: imagePrompts, sources: groundingSources } = await generateLesson(word);
          setLesson(lessonText);
          setPrompts(imagePrompts);
          setSources(groundingSources);
          setLoadingState(LoadingState.SUCCESS);
      } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
          setLoadingState(LoadingState.ERROR);
      }
  }, [word]);

  const isLoading = loadingState === LoadingState.GENERATING_TEXT;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-4 sm:mb-0">
            Nihongo Sensei AI
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Generador de Lecciones de Japonés</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Introduce una palabra en japonés para obtener una lección divertida y memorable, además de prompts listos para usar en DALL-E 3 o tu generador de imágenes favorito.</p>
          <div className="flex flex-col sm:flex-row gap-4">
              <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="ej. 猫 (neko), 挨拶 (aisatsu)"
                  className="flex-grow w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={isLoading}
              />
              <button
                  onClick={handleGenerate}
                  className="flex items-center justify-center px-6 py-2 bg-violet-600 text-white font-semibold rounded-md shadow-md hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition-colors"
                  disabled={isLoading}
              >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  {isLoading ? 'Generando...' : 'Generar Lección'}
              </button>
          </div>
           {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
        </Card>

        {loadingState !== LoadingState.IDLE && (
          <div>
            <nav className="flex flex-wrap justify-center space-x-2 sm:space-x-4 mb-6">
              <TabButton onClick={() => setActiveTab('lesson')} isActive={activeTab === 'lesson'}>
                Lección
              </TabButton>
              <TabButton onClick={() => setActiveTab('prompts')} isActive={activeTab === 'prompts'}>
                Prompts de Imagen
              </TabButton>
            </nav>

            {activeTab === 'lesson' && <LessonDisplay lesson={lesson} sources={sources} loadingState={loadingState} />}
            {activeTab === 'prompts' && <ImagePrompts prompts={prompts} loadingState={loadingState} />}
          </div>
        )}
      </main>
      <footer className="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
        <p>Desarrollado con Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
