import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { getHistory, askQuestion } from '../api';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import Plasma from '../components/Plasma';
import { Loader2 } from 'lucide-react';

const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { refreshSessions } = useOutletContext();
  const [session, setSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // TODO: replace stub with real axios/fetch call to /api/sessions/:sessionId
    getHistory(sessionId)
      .then(data => {
        if (data.success) {
          setSession(data);
          setHistory(data.history);
        } else {
          navigate('/');
        }
      })
      .finally(() => setIsLoading(false));
  }, [sessionId, navigate]);

  const handleSendMessage = async (messageText) => {
    setIsResponding(true);
    const tempUserEntry = {
        id: `temp-user-${Date.now()}`,
        question: messageText,
        answer: null, // No answer yet
        timestamp: new Date(),
    };
    setHistory(prev => [...prev, tempUserEntry]);

    try {
      // TODO: replace stub with real axios/fetch call to /api/sessions/:sessionId/ask
      const response = await askQuestion(sessionId, messageText);
      if (response.success) {
        // Replace temp entry with real one from API
        setHistory(prev => prev.map(entry => entry.id === tempUserEntry.id ? response.entry : entry));
        if (history.length === 0) { // First message in a new session
            refreshSessions();
        }
      } else {
        throw new Error("API failed to provide an answer");
      }
    } catch (error) {
      console.error("Failed to get response:", error);
      const errorEntry = { 
        ...tempUserEntry,
        id: `err-${Date.now()}`,
        answer: { id: Date.now() + 1, description: 'Sorry, I encountered an error.', table: null, feedback: {like: 0, dislike: 0} }
      };
      setHistory(prev => prev.map(entry => entry.id === tempUserEntry.id ? errorEntry : entry));
    } finally {
      setIsResponding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-light-accent dark:text-dark-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <ChatHeader session={session} />
      <div className="flex-1 overflow-y-auto relative">
        {!isLoading && (
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <Plasma 
                color={isDarkMode ? "#8B5CF6" : "#E9D5FF"}
                speed={0.6}
                direction="forward"
                scale={1.1}
                opacity={isDarkMode ? 0.8 : 0.15}
                mouseInteractive={true}
              />
            </div>
          </div>
        )}
        <div className="relative z-10">
          <MessageList history={history} sessionId={sessionId} setHistory={setHistory} />
          {isResponding && (
              <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-light-accent dark:text-dark-accent" />
              </div>
          )}
        </div>
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isResponding} />
    </div>
  );
};

export default ChatPage;
