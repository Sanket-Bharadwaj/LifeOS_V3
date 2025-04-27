
import React, { useState, useEffect } from 'react';
import { getGreeting } from '@/utils/dateUtils';
import { getRandomQuote } from '@/utils/quotes';

interface GreetingHeaderProps {
  userName: string;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({ userName }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote, setQuote] = useState(getRandomQuote());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Generate a new quote every hour
    const quoteTimer = setInterval(() => {
      setQuote(getRandomQuote());
    }, 3600000);
    
    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-2xl font-bold mb-1">{formattedTime}</p>
          <h1 className="greeting-text mb-1">
            {getGreeting()}, {userName}!
          </h1>
        </div>
      </div>
      
      <div className="mt-4 glass-card p-4 rounded-lg">
        <blockquote className="italic text-sm">
          "{quote.text}"
        </blockquote>
        <p className="text-right text-xs text-muted-foreground mt-1">- {quote.author}</p>
      </div>
    </div>
  );
};

export default GreetingHeader;
