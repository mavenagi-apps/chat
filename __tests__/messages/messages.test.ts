import { expect, describe, test } from "vitest";

import enJson from "@/src/messages/en.json";
import frJson from "@/src/messages/fr.json";
import itJson from "@/src/messages/it.json";
import esJson from "@/src/messages/es.json";

describe("messages", () => {
  test("should have the correct keys", () => {
    const checkKeys = (obj1: any, obj2: any) => {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      expect(keys1).toEqual(keys2);
      keys1.forEach((key) => {
        if (typeof obj1[key] === "object") {
          expect(typeof obj2[key]).toBe("object");
          checkKeys(obj1[key], obj2[key]);
        }
      });
    };

    [frJson, itJson, esJson].forEach((lang) => {
      checkKeys(enJson, lang);
    });
  });
});
