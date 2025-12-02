import { homedir } from "os";
import { join } from "path";

export const TRY_PATH = join(homedir(), "src", "tries");
export const TRY_CLI_PATH = join(homedir(), ".local", "try.rb");
