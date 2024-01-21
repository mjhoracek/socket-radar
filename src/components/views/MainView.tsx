import { useEffect, useState } from "react";
import { Group, Select } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import { Button } from "../shared/Button";
import { SVG } from "../shared/SVG";
import { UpdateButton } from "../update";

type Props = {};

const MainView = (props: Props) => {
  console.log(import.meta.env);
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
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
        setError(null);
        setData(data);
      });

      window.Main.on("error", (data: any) => {
        if (data === "Data Flow Interrupted") {
          setData(null);
        }
        setError(data);
      });

      window.Main.on("status", (data: any) => {
        if (data === "Port Closed") {
          setData(null);
        }
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
                No ports found - try connecting your usb and click SELECT PORT
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
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                    </span>
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
      <div className="flex flex-row top-5 right-10 absolute ">
        <UpdateButton />
      </div>
      {selectedPort && (
        <>
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
            <div>
              <p
                className="text-white"
                style={{
                  fontFamily: "segment, sans serif",
                  fontWeight: "bold",
                  lineHeight: "80%",
                  fontSize: "10vw",
                }}
              >
                {"No Data Flow"}
              </p>
              <p className="text-2xl text-white">
                Make sure your gun is in Transmit Mode (XMIT){" "}
              </p>
            </div>
          )}
        </>
      )}
      {!data && !selectedPort && (
        <div>
          <p
            className="text-white"
            style={{
              fontFamily: "segment, sans serif",
              fontWeight: "bold",
              lineHeight: "80%",
              fontSize: "10vw",
            }}
          >
            {"Not Connected"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MainView;
