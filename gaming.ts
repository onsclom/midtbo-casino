export async function clearHandGame() {
  data.currentHandGame = null;
  await Bun.write(fileName, JSON.stringify(data));
}

export async function createHandGame(
  initiator: string,
  hand: "left" | "right",
) {
  data.currentHandGame = {
    initiator,
    hand,
  };
  await Bun.write(fileName, JSON.stringify(data));
}

let data: {
  users: Record<string, { marbles: number }>;
  currentHandGame: null | {
    hand: "left" | "right";
    initiator: string; // discord user id
  };
} = {
  users: {},
  currentHandGame: null,
};

// if data.json exists read and use that
const fileName = "data.json";

// init data
{
  let dataFile = Bun.file(fileName);
  const fileExists = await dataFile.exists();
  if (fileExists) {
    data = await dataFile.json();
  } else {
    await Bun.write(fileName, JSON.stringify(data));
  }
}

export function getMarbles(userId: string) {
  return data.users[userId]?.marbles ?? 0;
}

export function getCurrentHandGame() {
  return data.currentHandGame;
}

export async function setMarbles(userId: string, marbles: number) {
  if (!data.users[userId]) {
    data.users[userId] = { marbles };
  } else {
    data.users[userId].marbles = marbles;
  }
  await Bun.write(fileName, JSON.stringify(data));
}
