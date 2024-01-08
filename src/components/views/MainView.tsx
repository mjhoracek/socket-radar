import React, { useEffect, useState } from "react";
import { Button } from "@mantine/core";

type Props = {};

const MainView = (props: Props) => {
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
    <div className="bg-red-800">
      <p>content</p>
    </div>
  );
};

export default MainView;
