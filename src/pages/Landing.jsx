import { useNavigate, useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import ChatInput from '../components/ChatInput';
import { newSession } from '../api';
import { Loader2, Image, Search } from 'lucide-react';
import Prism from '../components/Prism';

const Landing = () => {
  const navigate = useNavigate();
  const { refreshSessions } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    try {
      // TODO: replace stub with real axios/fetch call to /api/sessions
      const response = await newSession(message);
      if (response.success) {
        refreshSessions();
        navigate(`/session/${response.session.id}`);
      } else {
        throw new Error("Failed to create session from API");
      }
    } catch (error) {
      console.error("Failed to create new session:", error);
      setIsLoading(false);
    }
  };

  const promptSuggestions = [
    { title: 'Smart Budget', description: 'Create a budget that fits my lifestyle' },
    { title: 'Data Analytics', description: 'Explain what data analytics is in simple terms' },
    { title: 'Healthy Spending', description: 'Suggest some tips for healthy spending habits' },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] z-0 opacity-40 dark:opacity-30 pointer-events-none">
            <Prism
                animationType="rotate"
                timeScale={0.25}
                height={3.5}
                baseWidth={5.5}
                scale={3.6}
                hueShift={0.0} // Neutral hue
                colorFrequency={0.8}
                noise={0.3}
                glow={1}
            />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between max-w-3xl mx-auto px-4 pt-16 md:pt-24">
            <div className="flex-1 flex flex-col items-center text-center pt-12">
                <h1 className="text-3xl md:text-4xl font-bold text-light-primary dark:text-dark-primary">Good Evening, User.</h1>
                <p className="text-xl md:text-2xl text-light-secondary dark:text-dark-secondary mt-2">How can I help you today?</p>
            </div>

            <div className="flex-1 flex flex-col justify-end pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 md:mb-12">
                {promptSuggestions.map((prompt) => (
                    <button
                    key={prompt.title}
                    onClick={() => handleSendMessage(prompt.description)}
                    disabled={isLoading}
                    className="p-4 rounded-xl bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm hover:bg-light-border dark:hover:bg-dark-border transition-colors text-left disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-light-accent"
                    >
                    <p className="font-semibold text-light-primary dark:text-dark-primary">{prompt.title}</p>
                    <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">{prompt.description}</p>
                    </button>
                ))}
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-36">
                        <Loader2 className="h-8 w-8 animate-spin text-light-accent dark:text-dark-accent" />
                    </div>
                ) : (
                    <>
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <button className="flex items-center gap-2 text-xs text-light-secondary dark:text-dark-secondary hover:text-light-primary dark:hover:text-dark-primary transition-colors focus-visible:ring-2 focus-visible:ring-light-accent rounded-md p-1">
                        <Image className="h-4 w-4"/> Create an image
                        </button>
                        <button className="flex items-center gap-2 text-xs text-light-secondary dark:text-dark-secondary hover:text-light-primary dark:hover:text-dark-primary transition-colors focus-visible:ring-2 focus-visible:ring-light-accent rounded-md p-1">
                        <Search className="h-4 w-4"/> Search the web
                        </button>
                    </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default Landing;
