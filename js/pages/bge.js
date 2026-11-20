import { mountChecker } from "../ui/checker.js";
import { checkBge } from "../rules/bge.js";
import { parseBge } from "../parsers/bge.js";

mountChecker({ type: "bge", check: checkBge, parse: parseBge, amountField: "amountDue", fileLabel: "BGE bill" });
