import React, { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { baseUrl1 } from "../utils/services";

const QuizHost = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);

  const { quizId } = useParams();
  const socket = useMemo(() => io(
    
   

    baseUrl1
  
  ), []);

  useEffect(() => {
    const generateRoomCode = () => {
      const newRoomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      setRoomCode(newRoomCode);
      socket.emit("create room", newRoomCode);
    };

    generateRoomCode();
  }, [socket]);

  const startQuiz = () => {
    if (roomCode) {
      socket.emit("start quiz", roomCode, quizId);
      setQuizStarted(true);
    } else {
      console.error("Room code is missing");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Host a Quiz</h1>
        {roomCode ? (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <p className="text-lg text-gray-700 mb-4">
              Room Code: <span className="font-bold text-blue-600">{roomCode}</span>
            </p>
            {!quizStarted ? (
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                onClick={startQuiz}
              >
                Start Quiz
              </button>
            ) : (
              <p className="text-lg font-bold text-green-600">The quiz has started!</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Generating room code...</p>
        )}
      </div>
    </div>
  );
};

export default QuizHost;
