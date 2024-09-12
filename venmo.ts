import { marbleText } from "./plural";

const myVenmo = "main17893";

function generateVenmoLink(
  amount: number,
  note: string,
  person: string,
  type: "pay" | "charge",
) {
  return `https://venmo.com/?txn=${type}&recipients=${encodeURIComponent(person)}&amount=${encodeURIComponent(
    amount.toString(),
  )}&note=${encodeURIComponent(note)}`;
}

export function venmoBuyInLink(amount: number) {
  return generateVenmoLink(
    amount,
    `Buying ${marbleText(amount)}`,
    myVenmo,
    "pay",
  );
}

export function venmoCashoutLink(amount: number) {
  return generateVenmoLink(
    amount,
    `Buying ${marbleText(amount)}`,
    myVenmo,
    "charge",
  );
}
