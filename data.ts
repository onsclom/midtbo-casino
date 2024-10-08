const fileName = "data.json";

export let data: {
  marbles: Record<string, number>;
  currentHandGame: null | {
    hand: "left" | "right";
    initiator: string;
  };
  multiFlips: Record<number, { initiator: string }>; // wager -> { initiator }
  dice: Record<string, { initiator: string }>; // dice size -> { initiator }
  jackpot: {
    initiator: string;
    size: number;
    attempts: number;
  } | null;
} = {
  marbles: {},
  currentHandGame: null,
  multiFlips: {},
  dice: {},
  jackpot: null,
};

export async function setupData() {
  let dataFile = Bun.file(fileName);
  const fileExists = await dataFile.exists();
  if (fileExists) {
    const saveData = (await dataFile.json()) as Partial<typeof data>;
    // merge data (makes adding new fields seamless)
    data = { ...data, ...saveData };
  }

  // every 10 seconds, persist the data
  setInterval(
    async () => await Bun.write(fileName, JSON.stringify(data)),
    1000 * 10,
  );

  // every hour, save a snapshot
  setInterval(
    async () => {
      await Bun.write(
        `data-${new Date().toISOString().replaceAll(":", "_")}.json`,
        JSON.stringify(data),
      );
    },
    1000 * 60 * 60,
  );
}

export function addMarbles(userId: string, amount: number) {
  data.marbles[userId] = (data.marbles[userId] ?? 0) + amount;
}

export function subtractMarbles(userId: string, amount: number) {
  data.marbles[userId] = (data.marbles[userId] ?? 0) - amount;
}
