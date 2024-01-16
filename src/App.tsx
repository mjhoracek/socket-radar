import { useEffect, useState } from "react";
import "./App.css";
import { Group, Select } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import { Button } from "./components/shared/Button";
import { SVG } from "./components/shared/SVG";

function App() {
  console.log(window.Main);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [ports, setPorts] = useState([] as any[]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);

  const activatePort = (port: string) => {
    setSelectedPort(port);
    setData(null);
    if (window.Main) {
      window.Main.sendMessage("activatePort", port);
    }
    setError(null);
    closeAllModals();
  };

  const openPortModal = () => {
    window.Main.sendMessage("closePort", "closePort");
    setSelectedPort(null);
    setData(null);
    window.Main.sendMessage("getPorts", "getPorts");
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

      window.Main.on("error", (data: any) => {
        setError(data);
      });

      window.Main.on("status", (data: any) => {
        setStatus(data);
      });
    }
  }, []);

  useEffect(() => {
    window.Main.on("ports", (data: any) => {
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

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-appBg relative">
      <div className="flex flex-row top-5 left-10 absolute ">
        <div className="flex flex-row justify-center items-center">
          <Button
            label={
              selectedPort ? (
                <Group px={10}>
                  {data && status === "Port Open" ? (
                    <div className="h-[10px] w-[10px] bg-green-600 rounded-full animate-pulse flex justify-center items-center">
                      <div className="h-[5px] w-[5px] bg-green-600 rounded-full z-10"></div>
                    </div>
                  ) : (
                    <SVG.X size={20} color="red" />
                  )}
                  <p>{`${selectedPort}`}</p>
                </Group>
              ) : (
                <div className="flex justify-start">
                  <p>Select Port</p>
                </div>
              )
            }
            onClick={openPortModal}
          />
          <div className="flex justify-center items-center px-2  leading-[0px]">
            <p>{error}</p>
          </div>
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
