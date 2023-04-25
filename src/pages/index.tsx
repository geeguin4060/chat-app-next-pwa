import io from "socket.io-client";
import { useState, useEffect, KeyboardEventHandler, useCallback } from "react";
import { Socket } from "socket.io-client";
import Image from "next/image";

type Message = {
  author: string;
  message: string;
};

interface ClientToServerEvents {
  "receive-message": (messagae: Message) => void;
}

interface ServerToClientEvents {
  "send-message": (messagae: Message) => void;
}

let socket: Socket<ClientToServerEvents, ServerToClientEvents>;

const Home = () => {
  const [userName, setUserName] = useState("");
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<Message>>([]);
  const socketInitializer = useCallback(async () => {
    await fetch("/api/socket");

    socket = io();

    socket.on("receive-message", ({ author, message }) => {
      setMessages((prev) => [...prev, { author, message }]);
    });
  }, []);

  useEffect(() => {
    socketInitializer();

    return () => {
      socket?.disconnect();
    };
  }, [socketInitializer]);

  const sendMessage = async () => {
    socket.emit("send-message", { author, message });

    setMessage("");
  };

  const handleKeypress: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      if (message) {
        sendMessage();
      }
    }
  };

  return (
    <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-gray-500">
      <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
        {!author ? (
          <>
            <Image
              className="flex-none"
              src="/assets/icons/icon-48x48.png"
              alt="icon"
              width="48"
              height="48"
            />
            <h3 className="font-bold text-white text-xl">
              How people should call you?
            </h3>
            <input
              type="text"
              placeholder="Identity..."
              value={userName}
              className="p-3 rounded-md outline-none"
              onChange={(e) => setUserName(e.target.value)}
            />
            <button
              onClick={() => {
                setAuthor(userName);
              }}
              className="bg-white rounded-md px-4 py-2 text-xl"
            >
              Go!
            </button>
          </>
        ) : (
          <>
            <div className="flex align-middle space-x-2">
              <Image
                className="flex-none"
                src="/assets/icons/icon-48x48.png"
                alt="icon"
                width="32"
                height="32"
              />
              <span className="font-bold text-white text-xl">
                Your user name: {userName}
              </span>
            </div>
            <div className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
              <div className="h-full last:border-b-0 overflow-y-scroll">
                {messages.map((msg, i) => {
                  return (
                    <div
                      className="w-full py-1 px-2 border-b border-gray-200"
                      key={i}
                    >
                      {msg.author} : {msg.message}
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-300 w-full flex rounded-bl-md">
                <input
                  type="text"
                  placeholder="New message..."
                  value={message}
                  className="outline-none py-2 px-2 rounded-bl-md flex-1"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyUp={handleKeypress}
                />
                <div className="border-l border-gray-300 flex justify-center items-center  rounded-br-md group hover:bg-cyan-400 transition-all">
                  <button
                    className="group-hover:text-white px-3 h-full"
                    onClick={() => {
                      sendMessage();
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
