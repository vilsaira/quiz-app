import React, { useState, useEffect } from 'react';
import quizData from './quiz.json';
import { Button } from "@/components/ui/button";

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [answers, setAnswers] = useState({});
  const [user, setUser] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [checked, setChecked] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds

  useEffect(() => {
    const shuffled = [...quizData].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  }, []);

  useEffect(() => {
    if (user && startTime === null) {
      setStartTime(Date.now());
    }
  }, [user]);

  useEffect(() => {
  if (!user || showResults) return;

  const interval = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setEndTime(Date.now());
        setTimedOut(true);
        setShowResults(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [user, showResults]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleLogin = () => {
    const username = prompt("Enter your name to login:");
    if (username) setUser({ name: username });
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => {
      const prevAnswers = prev[questionIndex] || [];
      const newAnswers = prevAnswers.includes(optionIndex)
        ? prevAnswers.filter((i) => i !== optionIndex)
        : [...prevAnswers, optionIndex];
      return { ...prev, [questionIndex]: newAnswers };
    });
  };

  const handleCheck = () => {
    setChecked(true);
    const q = questions[currentCard];
    const userAns = answers[currentCard]?.sort().join(',');
    const correctAns = q.correct.sort().join(',');
    if (userAns === correctAns) {
      setTimeLeft((prev) => prev + 15); // Reward 15 seconds
    }
  };

  const handleNext = () => {
    if (currentCard < questions.length - 1) {
      setCurrentCard(currentCard + 1);
      setChecked(false);
    } else {
      setEndTime(Date.now());
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      const userAns = answers[i]?.sort().join(',');
      const correctAns = q.correct.sort().join(',');
      if (userAns === correctAns) correct++;
    });
    return correct;
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Button onClick={handleLogin}>Login to Start Quiz</Button>
      </div>
    );
  }

  if (showResults) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl text-center">
        <h2 className="text-xl font-bold mb-4">
          {timedOut ? "Time's Up! You Lost." : "Quiz Results"}
        </h2>
        {!timedOut && (
          <>
            <p className="mb-2">Correct Answers: {calculateScore()} / {questions.length}</p>
            <p>Time Left: {formatTime(timeLeft)}</p>
          </>
        )}
      </div>
    </div>
  );
}


  const question = questions[currentCard];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between mb-4">
          <h1 className="text-lg font-semibold">Welcome, {user.name}</h1>
          <div className="text-lg font-mono bg-black text-green-400 px-3 py-1 rounded">{formatTime(timeLeft)}</div>
        </div>
        <h2 className="text-base font-bold mb-4">{question.question}</h2>

        {question.options.map((opt, idx) => {
          const isCorrect = question.correct.includes(idx);
          const isSelected = answers[currentCard]?.includes(idx);
          const showGreen = checked && isCorrect;
          const showRed = checked && isSelected && !isCorrect;

          return (
            <div
              key={idx}
              className={
                'mb-2 p-2 rounded ' +
                (showGreen ? 'border-4 border-green-500 ' : '') +
                (showRed ? 'border-2 border-red-500 ' : 'border')
              }
            >
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  disabled={checked}
                  checked={isSelected || false}
                  onChange={() => handleAnswer(currentCard, idx)}
                  className="w-4 h-4"
                />
                <span>{opt}</span>
              </label>
            </div>
          );
        })}

        <div className="mt-6">
          {!checked ? (
            <Button onClick={handleCheck} className="w-full">
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full">
              {currentCard < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
