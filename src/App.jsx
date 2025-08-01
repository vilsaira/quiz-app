import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import quizData from './quiz.json';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (user && startTime === null) {
      setStartTime(Date.now());
    }
  }, [user]);

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

  const handleNext = () => {
    if (currentCard < quizData.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      setEndTime(Date.now());
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.forEach((q, i) => {
      const userAns = answers[i]?.sort().join(',');
      const correctAns = q.correct.sort().join(',');
      if (userAns === correctAns) correct++;
    });
    return correct;
  };

  const getTimeTaken = () => {
    if (!startTime || !endTime) return "0s";
    const duration = (endTime - startTime) / 1000;
    return `${duration.toFixed(1)}s`;
  };

  if (!user) return <Button onClick={handleLogin}>Login to Start Quiz</Button>;

  if (showResults) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Quiz Results</h2>
        <p>Correct Answers: {calculateScore()} / {quizData.length}</p>
        <p>Time Taken: {getTimeTaken()}</p>
      </div>
    );
  }

  const question = quizData[currentCard];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
      <Card className="mb-4">
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">{question.question}</h2>
          {question.options.map((opt, idx) => (
            <div key={idx}>
              <label>
                <input
                  type="checkbox"
                  checked={answers[currentCard]?.includes(idx) || false}
                  onChange={() => handleAnswer(currentCard, idx)}
                />
                {" "}{opt}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
      <Button onClick={handleNext} className="w-full">{currentCard < quizData.length - 1 ? "Next" : "Finish"}</Button>
    </div>
  );
};

export default App;