import { useEffect, useState } from "react";
import "./App.css";
import { Button, Select } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";

function App() {
  console.log(window.Main);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [ports, setPorts] = useState([] as any[]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  console.log("ports", ports);

  const activatePort = (port: string) => {
    setSelectedPort(port);
    setData(null);
    if (window.Main) {
      window.Main.sendMessage("activatePort", port);
    }
    setError(null);
    closeAllModals();
  };

  const openModalPort = () => {
    openModal({
      title: "Select a port",
      children: (
        <Select
          placeholder="Select a port"
          onChange={(e: string) => activatePort(e)}
          data={
            ports
              ? ports.map((port: any) => {
                  return { label: port.friendlyName, value: port.path };
                })
              : []
          }
        />
      ),
    });
  };

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

  useEffect(() => {
    window.Main.on("ports", (data: any) => {
      console.log("ports found in select", data);
      setPorts(data);
      openModal({
        closeOnClickOutside: true,
        title: "Select a port",
        children: (
          <>
            {data.length === 0 ? (
              <p>
                No ports found - try connecting your usb and click reconnect
              </p>
            ) : (
              <Select
                placeholder="Select a port"
                onChange={(e: string) => activatePort(e)}
                data={
                  data
                    ? data.map((port: any) => {
                        return { label: port.friendlyName, value: port.path };
                      })
                    : []
                }
              />
            )}
          </>
        ),
      });
    });
  }, []);

  const reconnectPort = () => {
    setData(null);
    setError(null);
    if (window.Main) {
      window.Main.sendMessage("reconnect", "reconnect");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-appBg relative">
      {/* <div className="absolute top-5 right-10">
        <div className="text-xl text-zinc-50">
          {error === `   . ` ? (
            <p>{"---.-"}</p>
          ) : error ? (
            <p> {`${error}`}</p>
          ) : (
            <p> {"working?"}</p>
          )}
        </div>
      </div> */}
      <div className="flex flex-col top-5 right-10 absolute">
        {selectedPort ? (
          <div className="flex justify-start ">
            <p>{`Active port: ${selectedPort}`}</p>
          </div>
        ) : (
          <div className="flex justify-start">
            <p>No Port Selected</p>
          </div>
        )}
        <div className="flex flex-row">
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
            onClick={openModalPort}
          >
            Change Port
          </Button>
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

      <div className="absolute bottom-5 right-10"></div>
    </div>
  );
}

export default App;
