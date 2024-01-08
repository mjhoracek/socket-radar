import { useEffect, useState } from "react";
import "./App.css";
import { Button } from "@mantine/core";

function App() {
  console.log(window.ipcRenderer);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.Main) {
      window.Main.on("ping", (data: any) => {
        setData(data);
      });
    }
  }, []);

  useEffect(() => {
    window.Main.on("error", (data: any) => {
      setError(data);
    });
  }, []);

  const reconnectPort = () => {
    if (window.Main) {
      window.Main.sendMessage("reconnect", "reconnect");
    }
  };
  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-appBg relative">
      <div className="absolute top-5 right-10">
        <div className="text-xl text-zinc-50">
          {error === `   . ` ? (
            <p>{"---.-"}</p>
          ) : error ? (
            <p> {`${error}`}</p>
          ) : (
            <p> {"working?"}</p>
          )}
        </div>
      </div>

      {data === `   . ` ? (
        <p
          className="text-veloColor"
          style={{
            fontFamily: "segment, sans serif",
            fontWeight: "bold",
            lineHeight: "80%",
            fontSize: "40vw",
          }}
        >
          {"---.-"}
        </p>
      ) : data ? (
        <p
          className="text-veloColor"
          style={{
            fontFamily: "segment, sans serif",
            fontWeight: "bold",
            lineHeight: "80%",
            fontSize: "40vw",
          }}
        >
          {`${data}`}
        </p>
      ) : (
        <p
          style={{
            fontFamily: "segment, sans serif",
            fontWeight: "bold",
            lineHeight: "80%",
            fontSize: "10vw",
          }}
        >
          {"Not Connected"}
        </p>
      )}

      <div className="absolute bottom-5 right-10">
        <Button
          styles={{
            root: {
              backgroundColor: "#1E1E1E",
              color: "#F5F5F5",

              border: "1px solid #F5F5F5",

              fontSize: "12px",
              fontWeight: "bold",
              lineHeight: "16px",
              letterSpacing: "0.1em",
              fontFamily: "segment, sans-serif",

              "&:hover": {
                backgroundColor: "#ffb03a38",
              },
            },
          }}
          onClick={reconnectPort}
        >
          Reconnect
        </Button>
      </div>
    </div>
  );
}

export default App;
