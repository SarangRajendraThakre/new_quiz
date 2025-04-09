import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { baseUrl1 } from "../utils/services";
const TakeQuiz = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizEnded, setQuizEnded] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  

  const socket = useMemo(() => io(

    baseUrl1
   

  
  
  ), []);
  const { quizId } = useParams(); // Quiz room code from URL

  useEffect(() => {
    socket.emit('join room', quizId, (response) => {
      console.log('Join room response:', response); // Debug response from server
    });

    socket.on('quiz started', (quizData) => {
      console.log('Quiz started received:', quizData);
      setQuizStarted(true);
      setQuestions(quizData.questions); // Use the questions array from server
    });

    socket.on('quiz ended', (results) => {
      setQuizEnded(true);
      setLeaderboard(results);
    });

    return () => {
      socket.disconnect();
    };
  }, [quizId]);

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  };

  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (answers[currentQuestion.id] === currentQuestion.options[currentQuestion.answer]) {
      setScore((prevScore) => prevScore + 1);
    }

    const isLastQuestion = currentQuestionIndex + 1 === questions.length;

    if (!isLastQuestion) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizEnded(true);
      socket.emit('submit score', { score: score + 1, roomCode: quizId });
    }

    console.log("Selected Answer:", answers[currentQuestion.id]);
    console.log("Correct Answer:", currentQuestion.options[currentQuestion.answer]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {quizStarted ? (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
          {!quizEnded ? (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-gray-800">
                Question {currentQuestionIndex + 1}
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                {questions[currentQuestionIndex]?.question}
              </p>
              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestionIndex]?.options.map((option, index) => (
                  <button
                    key={index}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    onClick={() =>
                      handleAnswerSelect(questions[currentQuestionIndex].id, option)
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                className="mt-6 bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600"
                onClick={submitAnswer}
              >
                Next
              </button>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Quiz Ended</h1>
              <p className="text-lg text-gray-700 mb-4">Your Score: {score}</p>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Leaderboard</h2>
              <ul className="list-disc list-inside text-left">
                {leaderboard.map((entry, index) => (
                  <li key={index} className="text-gray-700">
                    {entry.username}: {entry.score}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xl text-gray-700">Waiting for the host to start the quiz...</p>
      )}
    </div>
  );
};

export default TakeQuiz;
