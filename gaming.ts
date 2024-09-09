let playerData: Record<
  string,
  {
    marbles: number;
  }
> = {};

// if data.json exists read and use that
const fileName = "data.json";

// init playerData
{
  let dataFile = Bun.file(fileName);
  const fileExists = await dataFile.exists();
  if (fileExists) {
    playerData = await dataFile.json();
  } else {
    await Bun.write(fileName, JSON.stringify(playerData));
  }
}

export function getMarbles(userId: string) {
  return playerData[userId]?.marbles ?? 0;
}

export async function setMarbles(userId: string, marbles: number) {
  if (!playerData[userId]) {
    playerData[userId] = { marbles };
  } else {
    playerData[userId].marbles = marbles;
  }
  await Bun.write(fileName, JSON.stringify(playerData));
}
