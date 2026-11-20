import { mountChecker } from "../ui/checker.js";
import { checkWater } from "../rules/water.js";
import { parseWater } from "../parsers/water.js";

mountChecker({ type: "water", check: checkWater, parse: parseWater, amountField: "amountDue", fileLabel: "water bill" });
