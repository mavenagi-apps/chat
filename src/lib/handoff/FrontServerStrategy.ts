import { createCoreClient, isAnyoneAvailable } from "@/src/app/api/front/utils";
import type { ServerHandoffStrategy } from "./HandoffStrategy";

export class FrontServerStrategy implements ServerHandoffStrategy {
  constructor(private configuration: FrontHandoffConfiguration) {}
  isLiveHandoffAvailable? = async () => {
    const shifts: string[] = this.configuration.shiftNames ?? [];
    const client = createCoreClient(this.configuration);
    const isHandoffAvailable = await isAnyoneAvailable(client, shifts);
    return isHandoffAvailable;
  };
}
