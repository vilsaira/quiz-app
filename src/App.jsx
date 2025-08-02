import React, { useState, useEffect } from 'react';
import quizData from './quiz.json'; // already imported
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const App = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Shuffle once when component mounts
    const shuffled = [...quizData].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  }, []);

  // Use `questions` instead of `quizData` throughout the component
  const [currentCard, setCurrentCard] = useState(0);
  const [answers, setAnswers] = useState({});
  const [user, setUser] = useState(null);
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
    if (currentCard < questions.length - 1) {
      setCurrentCard(currentCard + 1);
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

  const getTimeTaken = () => {
    if (!startTime || !endTime) return "0s";
    const duration = (endTime - startTime) / 1000;
    return `${duration.toFixed(1)}s`;
  };

  if (!user) return <Button onClick={handleLogin}>Login to Start Quiz</Button>;

  if (showResults) {
    return (
      <div>
        <h2>Quiz Results</h2>
        <p>Correct Answers: {calculateScore()} / {questions.length}</p>
        <p>Time Taken: {getTimeTaken()}</p>
      </div>
    );
  }

  const question = questions[currentCard];

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <h2>{question.question}</h2>
      {question.options.map((opt, idx) => (
        <div key={idx}>
          <label>
            <input
              type="checkbox"
              checked={answers[currentCard]?.includes(idx) || false}
              onChange={() => handleAnswer(currentCard, idx)}
            />
            {opt}
          </label>
        </div>
      ))}
      <Button onClick={handleNext}>
        {currentCard < questions.length - 1 ? "Next" : "Finish"}
      </Button>
    </div>
  );
};

export default App;
