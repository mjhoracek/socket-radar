import { useState } from "react";
import { Button } from "../shared/Button";

export const DevMain = () => {
  console.log(import.meta.env);
  const [data, setData] = useState<number | null>(null);

  const spawnPitch = () => {
    const randomNumber = parseFloat(
      (Math.floor(Math.random() * 1001) / 10).toFixed(1)
    );
    setData(randomNumber);
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-appBg relative">
      <div className="flex flex-col top-5 right-10 absolute ">
        <Button label={"spawn pitch"} onClick={() => spawnPitch()} />
        <Button label={"reset"} onClick={() => setData(null)} />
      </div>
      <p
        className="text-veloColor"
        style={{
          fontFamily: "segment, sans serif",
          fontWeight: "bold",
          lineHeight: "80%",
          fontSize: "40vw",
        }}
      >
        {data ? data : "---.-"}
      </p>
    </div>
  );
};
