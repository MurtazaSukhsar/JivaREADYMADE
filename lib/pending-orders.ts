import fs from "fs";
import path from "path";
import { Order } from "./types";

const PENDING_FILE = path.join(process.cwd(), "data", "pending-orders.json");

function ensureFile() {
  const dir = path.dirname(PENDING_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(PENDING_FILE)) {
    fs.writeFileSync(PENDING_FILE, JSON.stringify({}), "utf8");
  }
}

export function getPendingOrder(id: string): Order | null {
  ensureFile();
  try {
    const data = JSON.parse(fs.readFileSync(PENDING_FILE, "utf8"));
    return data[id] || null;
  } catch {
    return null;
  }
}

export function savePendingOrder(order: any): void {
  ensureFile();
  try {
    const data = JSON.parse(fs.readFileSync(PENDING_FILE, "utf8"));
    data[order.id] = order;
    fs.writeFileSync(PENDING_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save pending order:", err);
  }
}

export function removePendingOrder(id: string): void {
  ensureFile();
  try {
    const data = JSON.parse(fs.readFileSync(PENDING_FILE, "utf8"));
    if (data[id]) {
      delete data[id];
      fs.writeFileSync(PENDING_FILE, JSON.stringify(data, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Failed to remove pending order:", err);
  }
}
