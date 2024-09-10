const fileName = "data.json";

export let data: {
  marbles: Record<string, number>;
  currentHandGame: null | {
    hand: "left" | "right";
    initiator: string;
  };
  multiFlips: Record<number, { initiator: string }>; // wager -> { initiator }
  dice: Record<string, { initiator: string }>; // dice size -> { initiator }
} = {
  marbles: {},
  currentHandGame: null,
  multiFlips: {},
};

export async function setupData() {
  let dataFile = Bun.file(fileName);
  const fileExists = await dataFile.exists();
  if (fileExists) {
    const saveData = (await dataFile.json()) as Partial<typeof data>;
    // merge data (allow adding new fields seamlessly)
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
        `data-${new Date().toISOString()}.json`,
        JSON.stringify(data),
      );
    },
    1000 * 60 * 60,
  );
}
