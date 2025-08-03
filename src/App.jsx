import React, { useState, useEffect } from 'react';
import quizDataRaw from './quiz.json';
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
  const [timeLeft, setTimeLeft] = useState(60);
  const [seenQuestions, setSeenQuestions] = useState(new Set());
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    // Shuffle questions and options
    const shuffledQuestions = [...quizDataRaw]
      .sort(() => Math.random() - 0.5)
      .map((q) => {
        const zipped = q.options.map((opt, idx) => ({
          text: opt,
          isCorrect: q.correct.includes(idx),
        }));
        const shuffled = zipped.sort(() => Math.random() - 0.5);
        return {
          question: q.question,
          category: q.category || 'Unknown',
          options: shuffled.map(o => o.text),
          correct: shuffled
            .map((o, i) => (o.isCorrect ? i : null))
            .filter(i => i !== null),
        };
      });
    setQuestions(shuffledQuestions);
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

    const isCorrect = userAns === correctAns;
    if (isCorrect) {
      setSeenQuestions((prev) => new Set(prev).add(q.question));
      setTimeLeft((prev) => prev + 15);
    }

    setCategoryStats((prev) => {
      const cat = q.category || 'Unknown';
      const prevStat = prev[cat] || { correct: 0, total: 0 };
      return {
        ...prev,
        [cat]: {
          correct: prevStat.correct + (isCorrect ? 1 : 0),
          total: prevStat.total + 1,
        }
      };
    });
  };

  const handleNext = () => {
    const q = questions[currentCard];
    const userAns = answers[currentCard]?.sort().join(',');
    const correctAns = q.correct.sort().join(',');
    const isCorrect = userAns === correctAns;

    const updatedQuestions = [...questions];

    if (!isCorrect && !seenQuestions.has(q.question)) {
      updatedQuestions.push(q); // re-add incorrect question
    }

    if (currentCard < updatedQuestions.length - 1) {
      setQuestions(updatedQuestions);
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
          <h2 className="text-xl font-bold mb-4">Quiz Results</h2>
          <p className="mb-2">Correct Answers: {calculateScore()} / {questions.length}</p>
          <p className="mb-4">Time Left: {formatTime(timeLeft)}</p>
          <h3 className="font-semibold mb-2">Category Breakdown:</h3>
          <ul className="text-left list-disc list-inside">
            {Object.entries(categoryStats).map(([cat, stats]) => (
              <li key={cat}>{cat}: {stats.correct} / {stats.total}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const question = questions[currentCard];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl">
        <div className="flex flex-col sm:flex-row sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <div>
            <p className="text-sm text-gray-500 italic">{question.category}</p>
            <p className="text-sm text-gray-600">Question {currentCard + 1} of {questions.length}</p>
          </div>
          <div className="text-lg font-mono bg-black text-green-400 px-3 py-1 rounded text-center w-24">
            {formatTime(timeLeft)}
          </div>
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