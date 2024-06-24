import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Award, RotateCcw, SkipForward, Pause, Play, Menu, ChevronLeft, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function AdvancedNetworkSecurityGame() {
  const [allQuestions, setAllQuestions] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/questions.json')
      .then(response => response.json())
      .then(data => {
        setAllQuestions(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading questions:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedTopics.length > 0 && Object.keys(allQuestions).length > 0) {
      const selectedQuestions = selectedTopics.flatMap(topic => allQuestions[topic]);
      setQuestions(selectedQuestions);
      setAnsweredQuestions(new Array(selectedQuestions.length).fill(null));
    } else {
      setQuestions([]);
      setAnsweredQuestions([]);
    }
  }, [selectedTopics, allQuestions]);

  useEffect(() => {
    if (gameStarted && !showScore && !gameOver && timeLeft > 0 && !isPaused && !isLoading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isLoading) {
      setGameOver(true);
    }
  }, [timeLeft, showScore, gameOver, isPaused, isLoading, gameStarted]);

  const handleAnswerClick = (selectedAnswer) => {
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestion] = selectedAnswer;
    setAnsweredQuestions(newAnsweredQuestions);

    if (questions[currentQuestion].correctAnswer === selectedAnswer) {
      setScore(score + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setTimeLeft(60);
    } else {
      setShowScore(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
      setTimeLeft(60);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setShowExplanation(false);
    setGameOver(false);
    setTimeLeft(60);
    setIsPaused(false);
    setAnsweredQuestions(new Array(questions.length).fill(null));
    setGameStarted(false);
  };

  const startGame = () => {
    if (selectedTopics.length > 0) {
      setGameStarted(true);
    } else {
      alert("Please select at least one topic before starting the game.");
    }
  };

  const skipQuestion = () => {
    handleNextQuestion();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleTopicChange = (topic) => {
    setSelectedTopics(prevTopics => 
      prevTopics.includes(topic)
        ? prevTopics.filter(t => t !== topic)
        : [...prevTopics, topic]
    );
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderLatex = (text) => {
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$.*?\$)/);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const latex = part.slice(2, -2);
        try {
          return <BlockMath key={index} math={latex} />;
        } catch (error) {
          console.error('Error rendering block LaTeX:', error);
          return <span key={index} style={{color: 'red'}}>[Block LaTeX Error]</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const latex = part.slice(1, -1);
        try {
          return <InlineMath key={index} math={latex} />;
        } catch (error) {
          console.error('Error rendering inline LaTeX:', error);
          return <span key={index} style={{color: 'red'}}>[Inline LaTeX Error]</span>;
        }
      }
      return part;
    });
  };
 
  const CustomSidebar = () => (
    <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Select Topics</h3>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {Object.keys(allQuestions).map(topic => (
            <div key={topic} className="flex items-center">
              <input
                type="checkbox"
                id={topic}
                checked={selectedTopics.includes(topic)}
                onChange={() => handleTopicChange(topic)}
                className="mr-2"
              />
              <label htmlFor={topic}>{topic}</label>
            </div>
          ))}
        </div>
        {!gameStarted && (
          <Button onClick={startGame} disabled={selectedTopics.length === 0} className="mt-4 w-full">
            Start Quiz
          </Button>
        )}
      </div>
    </div>
  );

  const QuestionSidebar = () => (
    <div className="w-64 h-screen fixed right-0 top-0 bg-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Questions</h3>
      {questions.map((q, index) => (
        <div
          key={index}
          className={`cursor-pointer p-2 mb-2 rounded ${
            index === currentQuestion ? 'bg-[rgb(38,45,62)] text-white' : 'hover:bg-gray-300'
          } ${answeredQuestions[index] !== null ? 'font-bold' : ''}`}
          onClick={() => setCurrentQuestion(index)}
        >
          Question {index + 1}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

 
  return (
    <div className="flex">
      <CustomSidebar />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : ''} ${gameStarted ? 'mr-64' : ''}`}>
        <div className="max-w-3xl mx-auto bg-gray-100 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Questions</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={toggleSidebar}>
                <Menu className="h-4 w-4" />
              </Button>
              {gameStarted && (
                <>
                  <Button onClick={togglePause} variant="outline">
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <div className="flex items-center">
                    <Clock className="mr-2" />
                    <span className="text-xl font-semibold">{timeLeft}s</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {!gameStarted ? (
            <div className="text-center">
              <h3 className="text-xl mb-4">Select topics and start the quiz when you're ready!</h3>
            </div>
          ) : (
            <>
              <Progress value={(timeLeft / 60) * 100} className="mb-4" />
              {(showScore || gameOver) ? (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
                  <p className="text-xl mb-4">You scored {score} out of {questions.length}</p>
                  <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                  <Button onClick={restartGame} className="mt-4">
                    <RotateCcw className="mr-2 h-4 w-4" /> Play Again
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-4">Question {currentQuestion + 1} of {questions.length}</p>
                  <p className="text-lg font-semibold mb-4">{renderLatex(questions[currentQuestion].question)}</p>
                  <div className="space-y-2 mb-4">
                  {questions[currentQuestion].options.map((option, index) => (
                <Button
                    key={index}
                    onClick={() => handleAnswerClick(index)}
                    className={`w-full justify-start text-left ${answeredQuestions[currentQuestion] === index ? 'bg-blue-500' : ''}`}
                    disabled={showExplanation}
                    style={{
                    padding: '10px',
                    height: 'auto',
                    whiteSpace: 'normal',  // Allow text wrapping
                    wordBreak: 'break-word',  // Handle long words
                    display: 'flex', // Flexbox for alignment
                    alignItems: 'center', // Center align items vertically
                    minHeight: '50px' // Ensure a minimum height for better spacing
                    }}
                >
                    <div style={{ width: '100%' }}>
                    {renderLatex(option)}
                    </div>
                </Button>
))}
                  </div>
                  {showExplanation && (
                    <Alert className={`mt-4 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                      {isCorrect ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                      <AlertTitle>{isCorrect ? 'Correct!' : 'Incorrect'}</AlertTitle>
                      <AlertDescription>
                        {renderLatex(questions[currentQuestion].explanation)}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-between mt-4">
                    <Button onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button onClick={skipQuestion} disabled={showExplanation}>
                      <SkipForward className="mr-2 h-4 w-4" /> Skip
                    </Button>
                    {showExplanation && (
                      <Button onClick={handleNextQuestion}>
                        Next Question
                      </Button>
                    )}
                  </div>
                  <p className="mt-4 text-right">Score: {score}/{questions.length}</p>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {gameStarted && <QuestionSidebar />}
    </div>
  );
}