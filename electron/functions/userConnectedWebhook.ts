import * as os from "os";
import * as crypto from "crypto";

const userWebhook =
  "https://discord.com/api/webhooks/1195591690359164979/-6fE4q5aeKqFSmHSdzMXMINmTNloPfrLcgFO2-xV_KpUN4EawdQ7FL13WqEIiJnqtKby";

export const getUniqueDeviceId = () => {
  // Collecting stable system information
  const hostname = os.hostname();
  const cpuModel = os.cpus()[0].model;
  const arch = os.arch();

  // Concatenate the information to form a base string
  const baseString = `${hostname}-${cpuModel}-${arch}`;

  // Use a hash function to generate a unique ID
  const hash = crypto.createHash("sha256");
  hash.update(baseString);
  const fullHash = hash.digest("hex");

  // Convert the hash into a more human-readable format
  // For example, take the first 8 characters of the hash
  const readableId = fullHash.substring(0, 8);

  return readableId.toUpperCase(); // Optional: make it uppercase for better readability
};

export const logUserConnect = async () => {
  const deviceId = getUniqueDeviceId();
  const message = {
    content: `${deviceId} connected`,
    deviceId: deviceId,
  };

  try {
    const response = await fetch(userWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (e) {
    console.log(e);
  }
};
